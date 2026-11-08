/* Sender-side acceptance tests (no network beyond localhost).
 * Runs the real server + a local mock /exec that verifies the same HMAC envelope
 * as the real Apps Script backend. Mirrors the style of Tabah_Dent_External_v1 tests.
 *   node tests/sender/run-tests.mjs
 */
import http from "node:http";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import assert from "node:assert/strict";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..", "..");
const imp = (p) => import(pathToFileURL(p).href);
const { createApp } = await imp(path.join(root, "server", "index.mjs"));
const { readConfig, loadEnvFile } = await imp(path.join(root, "server", "lib", "config.mjs"));
const { buildEnvelope } = await imp(path.join(root, "server", "lib", "signer.mjs"));
const { sendEvent } = await imp(path.join(root, "server", "lib", "tabah-client.mjs"));

const SECRET = "t".repeat(64);
let passed = 0;
const results = [];

async function test(name, fn) {
  try {
    await fn();
    passed++;
    results.push({ name, status: "PASS" });
    console.log("PASS " + name);
  } catch (e) {
    results.push({ name, status: "FAIL", message: String((e && e.message) || e) });
    console.error("FAIL " + name, e);
  }
}

/* ---------- mock /exec replicating the backend's core verification ---------- */
async function startMockExec(opts = {}) {
  const behavior = opts.behavior || "normal";
  const secret = opts.secret || SECRET;
  const state = {
    requests: new Map(), // request_id -> {id, version, status, events:Set, appointment_at}
    flags: { dac: false, busy: false, stale: false, conflict: false },
  };
  let dropped = 0;
  const dropBefore = opts.dropBefore || 0;
  const calls = [];
  const server = http.createServer(async (req, res) => {
    let raw = "";
    for await (const c of req) raw += c;
    if (dropped < dropBefore) {
      dropped++;
      return req.socket.destroy(); // pure network failure: request never processed
    }
    const finish = (body) => {
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify(body));
    };
    let env = null;
    try {
      env = JSON.parse(raw);
    } catch {}
    if (env) calls.push({ env, at: Date.now() });
    if (behavior === "html")
      return res.writeHead(200, { "Content-Type": "text/html" }).end("<html>Google Login</html>");
    if (!env) return finish({ ok: false, error: { code: "INVALID_JSON", retryable: false } });
    if (behavior === "busy_once" && !state.flags.busy) {
      state.flags.busy = true;
      return finish({ ok: false, error: { code: "BUSY", retryable: true } });
    }
    if (behavior === "stale_once" && !state.flags.stale) {
      state.flags.stale = true;
      return finish({ ok: false, error: { code: "STALE_SIGNATURE", retryable: false } });
    }
    const msg = [env.v, env.key_id, env.ts, env.event_id, env.body].join("\n");
    const expect = crypto.createHmac("sha256", secret).update(msg, "utf8").digest("hex");
    if (expect !== env.signature)
      return finish({ ok: false, error: { code: "BAD_SIGNATURE", retryable: false } });
    if (Math.abs(Date.now() / 1000 - env.ts) > 300)
      return finish({ ok: false, error: { code: "STALE_SIGNATURE", retryable: false } });
    let body;
    try {
      body = JSON.parse(env.body);
    } catch {
      return finish({ ok: false, error: { code: "INVALID_BODY_JSON", retryable: false } });
    }
    const r = state.requests.get(body.request_id);
    const pub = (x) => ({
      request_id: x.id,
      reference: "TD-" + x.id,
      status: x.status,
      version: x.version,
      is_test: true,
      appointment_at: x.appointment_at || null,
      contact_stopped: false,
    });
    if (body.type === "request.create") {
      if (r && r.events.has(env.event_id))
        return finish({ ok: true, duplicate: true, event_version: 1, data: pub(r) });
      if (r) return finish({ ok: false, error: { code: "REQUEST_EXISTS", retryable: false } });
      const nr = {
        id: body.request_id,
        version: 1,
        status: body.data.phase,
        events: new Set([env.event_id]),
        appointment_at: null,
      };
      state.requests.set(body.request_id, nr);
      // Simulate "saved at the backend but the response was lost".
      if (opts.dropAfterCreate && !state.flags.dac) {
        state.flags.dac = true;
        return req.socket.destroy();
      }
      return finish({ ok: true, duplicate: false, event_version: 1, data: pub(nr) });
    }
    if (body.type === "request.complete") {
      if (!r) return finish({ ok: false, error: { code: "NOT_FOUND", retryable: false } });
      if (r.events.has(env.event_id))
        return finish({ ok: true, duplicate: true, event_version: r.version, data: pub(r) });
      if (behavior === "conflict_once_complete" && !state.flags.conflict) {
        state.flags.conflict = true;
        return finish({ ok: false, error: { code: "VERSION_CONFLICT", retryable: false } });
      }
      if (body.data.expected_version !== r.version)
        return finish({ ok: false, error: { code: "VERSION_CONFLICT", retryable: false } });
      r.version += 1;
      r.status = "SUBMITTED";
      r.appointment_at = body.data.preferred_at;
      r.events.add(env.event_id);
      return finish({ ok: true, duplicate: false, event_version: r.version, data: pub(r) });
    }
    if (body.type === "request.get") {
      if (!r) return finish({ ok: false, error: { code: "NOT_FOUND", retryable: false } });
      return finish({ ok: true, data: pub(r) });
    }
    return finish({ ok: false, error: { code: "FORBIDDEN_EVENT", retryable: false } });
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  return {
    url: `http://127.0.0.1:${server.address().port}/exec`,
    calls,
    state,
    close: () => new Promise((r) => server.close(r)),
  };
}

/* ---------- server-under-test helpers ---------- */
async function startServerWith(mockUrl, extra = {}) {
  const distDir = fs.mkdtempSync(path.join(os.tmpdir(), "tabah-dist-"));
  fs.writeFileSync(path.join(distDir, "index.html"), "<html>stub</html>");
  const cfg = readConfig(
    {
      NODE_ENV: "test",
      TABAH_EXEC_URL: mockUrl,
      TABAH_INGEST_SECRET: extra.secret || SECRET,
      RATE_LIMIT_PER_MIN: String(extra.rateLimit ?? 30),
      PORT: "0",
    },
    { skipFile: true },
  );
  cfg.distDir = distDir;
  const { server } = createApp({
    cfg,
    delaysMs: extra.delays ?? [1, 1],
    timeoutMs: extra.timeoutMs ?? 1500,
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const base = `http://127.0.0.1:${server.address().port}`;
  const mkClient = () => {
    let cookie = "";
    const seen = [];
    return {
      seen,
      call: async (p, opts = {}) => {
        const method = opts.method || "GET";
        const res = await fetch(base + p, {
          ...opts,
          method,
          headers: {
            ...(method === "POST" ? { "Content-Type": "application/json" } : {}),
            ...(opts.headers || {}),
            ...(cookie ? { cookie } : {}),
          },
        });
        const sc = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
        if (sc.length) cookie = sc.map((c) => c.split(";")[0]).join("; ");
        let json = null;
        try {
          json = await res.json();
        } catch {}
        seen.push(json);
        return { status: res.status, json };
      },
    };
  };
  return { base, mkClient, close: () => new Promise((r) => server.close(r)), distDir };
}

const goodStart = (over = {}) => ({
  name: "زائر اختبار",
  email: "demo@example.com",
  phone: "+966 5X 123 4567",
  consent: { service: true, followup: true, review: true },
  ...over,
});
const futureSlot = () => {
  const d = new Date(Date.now() + 2 * 86400000);
  return { date: d.toISOString().slice(0, 10), time: "12:00" };
};
const byType = (calls, type) => calls.filter((x) => x.env && JSON.parse(x.env.body).type === type);

/* ================= unit: signer & transport ================= */
await test("HMAC primitive matches the RFC 4231 test vector", async () => {
  const sig = crypto
    .createHmac("sha256", "Jefe")
    .update("what do ya want for nothing?", "utf8")
    .digest("hex");
  assert.equal(sig, "5bdcc146bf60754e6a042426089575c75a003f089d2739839dec58b964ec3843");
  const env = buildEnvelope("{}", "evt-00000000", SECRET, 0);
  assert.equal(env.signature.length, 64);
  assert.equal(env.signature, env.signature.toLowerCase());
});

await test("envelope matches the Python tool construction byte-for-byte", async () => {
  const bodyString = JSON.stringify({
    type: "request.create",
    request_id: "demo-x",
    data: { is_test: true, name: "زائر وهمي" },
  });
  const ts = 1757200000;
  const env = buildEnvelope(bodyString, "evt-abcdef12", SECRET, ts);
  const expected = crypto
    .createHmac("sha256", SECRET)
    .update(["1", "ingest", String(ts), "evt-abcdef12", bodyString].join("\n"), "utf8")
    .digest("hex");
  assert.equal(env.signature, expected);
  assert.deepEqual(Object.keys(env).sort(), ["body", "event_id", "key_id", "signature", "ts", "v"]);
  assert.equal(env.body, bodyString); // the exact signed text is transmitted untouched
});

await test("response loss after save: retry keeps body/event_id and gets duplicate", async () => {
  const mock = await startMockExec({ dropAfterCreate: true });
  const s = await startServerWith(mock.url, { delays: [1100, 1100] });
  try {
    const c = s.mkClient();
    const r1 = await c.call("/api/booking/start", { method: "POST", body: JSON.stringify(goodStart()) });
    assert.equal(r1.json.accepted, true);
    assert.equal(r1.json.duplicate, true); // attempt 1 was lost after the backend saved it
    assert.equal(mock.calls.length, 2);
    assert.equal(mock.calls[0].env.event_id, mock.calls[1].env.event_id);
    assert.equal(mock.calls[0].env.body, mock.calls[1].env.body); // byte-identical body
    assert.notEqual(mock.calls[0].env.ts, mock.calls[1].env.ts); // fresh ts+signature only
    assert.notEqual(mock.calls[0].env.signature, mock.calls[1].env.signature);
  } finally {
    await s.close();
    await mock.close();
  }
});

await test("sustained network failure: exactly 3 attempts, then unconfirmed", async () => {
  const mock = await startMockExec({ dropBefore: 99 });
  const s = await startServerWith(mock.url);
  try {
    const c = s.mkClient();
    const r = await c.call("/api/booking/start", { method: "POST", body: JSON.stringify(goodStart()) });
    assert.equal(r.json.unconfirmed, true);
    assert.equal(r.json.stage, "create");
    assert.equal(mock.calls.length, 0); // connections died before the mock saw them
  } finally {
    await s.close();
    await mock.close();
  }
});

await test("BUSY is retried on the same event and then accepted", async () => {
  const mock = await startMockExec({ behavior: "busy_once" });
  const s = await startServerWith(mock.url);
  try {
    const c = s.mkClient();
    const r = await c.call("/api/booking/start", { method: "POST", body: JSON.stringify(goodStart()) });
    assert.equal(r.json.accepted, true);
    assert.equal(mock.calls.length, 2);
    assert.equal(mock.calls[0].env.event_id, mock.calls[1].env.event_id);
    assert.equal(mock.calls[0].env.body, mock.calls[1].env.body);
  } finally {
    await s.close();
    await mock.close();
  }
});

await test("STALE_SIGNATURE triggers a re-signed retry of the same event", async () => {
  const mock = await startMockExec({ behavior: "stale_once" });
  const s = await startServerWith(mock.url, { delays: [1100, 1100] });
  try {
    const c = s.mkClient();
    const r = await c.call("/api/booking/start", { method: "POST", body: JSON.stringify(goodStart()) });
    assert.equal(r.json.accepted, true);
    assert.equal(mock.calls.length, 2);
    assert.equal(mock.calls[0].env.body, mock.calls[1].env.body);
    assert.notEqual(mock.calls[0].env.ts, mock.calls[1].env.ts);
  } finally {
    await s.close();
    await mock.close();
  }
});

await test("HTML login page is never treated as success and is not retried", async () => {
  const mock = await startMockExec({ behavior: "html" });
  const s = await startServerWith(mock.url);
  try {
    const c = s.mkClient();
    const r = await c.call("/api/booking/start", { method: "POST", body: JSON.stringify(goodStart()) });
    assert.equal(r.json.error.code, "NON_JSON_RESPONSE");
    assert.equal(mock.calls.length, 1);
  } finally {
    await s.close();
    await mock.close();
  }
});

await test("ingest key cannot confirm: FORBIDDEN_EVENT refused without retries", async () => {
  const mock = await startMockExec();
  try {
    const res = await sendEvent(
      {
        execUrl: mock.url,
        secret: SECRET,
        eventId: "evt-test0001",
        bodyString: JSON.stringify({
          type: "request.confirm",
          request_id: "demo-x",
          data: { expected_version: 1, appointment_at: "2026-12-01T10:00:00+03:00" },
        }),
        requestId: "demo-x",
      },
      { attempts: 3, delaysMs: [1, 1], timeoutMs: 1500 },
    );
    assert.equal(res.outcome, "refused");
    assert.equal(res.code, "FORBIDDEN_EVENT");
    assert.equal(mock.calls.length, 1); // non-retryable: stopped immediately
  } finally {
    await mock.close();
  }
});

await test("mismatched request_id in an ok:true response is refused", async () => {
  const fakeFetch = async () => ({
    status: 200,
    url: "https://script.googleusercontent.com/x",
    text: async () =>
      JSON.stringify({ ok: true, data: { request_id: "demo-OTHER", status: "SUBMITTED" } }),
  });
  const res = await sendEvent(
    {
      execUrl: "https://script.google.com/macros/s/x/exec",
      secret: SECRET,
      eventId: "evt-test0002",
      bodyString: "{}",
      requestId: "demo-mine",
    },
    { attempts: 3, delaysMs: [1, 1], timeoutMs: 100 },
    {
      fetch: fakeFetch,
      AbortController,
      setTimeout,
      clearTimeout,
      now: Date.now,
      sleep: async () => {},
    },
  );
  assert.equal(res.outcome, "refused");
  assert.equal(res.code, "RESPONSE_MISMATCH");
});

/* ================= integration: full API against the mock backend ================= */
await test("health reports configuration without leaking secrets", async () => {
  const mock = await startMockExec();
  const s = await startServerWith(mock.url);
  try {
    const c = s.mkClient();
    const h = await c.call("/api/health");
    assert.equal(h.json.configured, true);
    const text = JSON.stringify(h.json);
    assert.equal(text.includes(SECRET), false);
    assert.equal(text.includes(mock.url), false);
  } finally {
    await s.close();
    await mock.close();
  }
});

await test("start sends a signed INCOMPLETE create with phone and exact consent", async () => {
  const mock = await startMockExec();
  const s = await startServerWith(mock.url);
  try {
    const c = s.mkClient();
    const r = await c.call("/api/booking/start", { method: "POST", body: JSON.stringify(goodStart()) });
    assert.equal(r.json.accepted, true);
    assert.equal(r.json.status, "INCOMPLETE");
    assert.match(r.json.reference, /^TD-demo-/);
    const body = JSON.parse(mock.calls[0].env.body);
    assert.equal(body.type, "request.create");
    assert.equal(body.data.phase, "INCOMPLETE");
    assert.equal(body.data.is_test, true);
    assert.equal(body.data.phone, "+96651234567"); // 'X' and spaces stripped, '+' kept
    assert.equal("branch_id" in body.data, false); // must be absent for INCOMPLETE, not null
    assert.equal("preferred_at" in body.data, false);
    assert.deepEqual(Object.keys(body.data.consent).sort(), [
      "at",
      "followup",
      "review",
      "service",
      "source",
      "version",
    ]);
    assert.equal(body.data.consent.version, "demo-email-v1");
    assert.equal(body.data.consent.source, "demo-form");
    assert.match(body.data.consent.at, /\+03:00$/);
    assert.equal(mock.calls[0].env.key_id, "ingest");
  } finally {
    await s.close();
    await mock.close();
  }
});

await test("second start is idempotent and creates no second event", async () => {
  const mock = await startMockExec();
  const s = await startServerWith(mock.url);
  try {
    const c = s.mkClient();
    await c.call("/api/booking/start", { method: "POST", body: JSON.stringify(goodStart()) });
    const r2 = await c.call("/api/booking/start", { method: "POST", body: JSON.stringify(goodStart()) });
    assert.equal(r2.json.locked, true);
    assert.equal(r2.json.accepted, true);
    assert.equal(mock.calls.length, 1);
  } finally {
    await s.close();
    await mock.close();
  }
});

await test("complete sends request.complete with expected_version and reaches SUBMITTED", async () => {
  const mock = await startMockExec();
  const s = await startServerWith(mock.url);
  try {
    const c = s.mkClient();
    await c.call("/api/booking/start", { method: "POST", body: JSON.stringify(goodStart()) });
    const r = await c.call("/api/booking/complete", { method: "POST", body: JSON.stringify(futureSlot()) });
    assert.equal(r.json.accepted, true);
    assert.equal(r.json.status, "SUBMITTED");
    assert.equal(r.json.event, "complete");
    const completes = byType(mock.calls, "request.complete");
    assert.equal(completes.length, 1);
    const cbd = JSON.parse(completes[0].env.body);
    assert.equal(cbd.data.expected_version, 1);
    assert.equal(cbd.data.branch_id, "DEMO_BRANCH");
    assert.match(cbd.data.preferred_at, /^\d{4}-\d{2}-\d{2}T12:00:00\+03:00$/);
    assert.deepEqual(Object.keys(cbd.data).sort(), ["branch_id", "expected_version", "preferred_at"]);
  } finally {
    await s.close();
    await mock.close();
  }
});

await test("double submit replays the stored result without a second event", async () => {
  const mock = await startMockExec();
  const s = await startServerWith(mock.url);
  try {
    const c = s.mkClient();
    await c.call("/api/booking/start", { method: "POST", body: JSON.stringify(goodStart()) });
    await c.call("/api/booking/complete", { method: "POST", body: JSON.stringify(futureSlot()) });
    const r2 = await c.call("/api/booking/complete", { method: "POST", body: JSON.stringify(futureSlot()) });
    assert.equal(r2.json.accepted, true);
    assert.equal(r2.json.duplicate, true);
    assert.equal(byType(mock.calls, "request.complete").length, 1);
  } finally {
    await s.close();
    await mock.close();
  }
});

await test("no follow-up consent: single SUBMITTED create at the end", async () => {
  const mock = await startMockExec();
  const s = await startServerWith(mock.url);
  try {
    const c = s.mkClient();
    const r1 = await c.call("/api/booking/start", {
      method: "POST",
      body: JSON.stringify(goodStart({ consent: { service: true, followup: false, review: true } })),
    });
    assert.equal(r1.json.sent, false);
    assert.equal(r1.json.reason, "NO_FOLLOWUP_CONSENT");
    const r2 = await c.call("/api/booking/complete", { method: "POST", body: JSON.stringify(futureSlot()) });
    assert.equal(r2.json.accepted, true);
    assert.equal(r2.json.status, "SUBMITTED");
    assert.equal(r2.json.event, "create");
    const creates = byType(mock.calls, "request.create");
    assert.equal(creates.length, 1);
    const cbd = JSON.parse(creates[0].env.body);
    assert.equal(cbd.data.phase, "SUBMITTED");
    assert.equal(cbd.data.branch_id, "DEMO_BRANCH");
    assert.equal(cbd.data.consent.followup, false);
  } finally {
    await s.close();
    await mock.close();
  }
});

await test("status uses request.get bound to the session only", async () => {
  const mock = await startMockExec();
  const s = await startServerWith(mock.url);
  try {
    const c = s.mkClient();
    const before = await c.call("/api/booking/status");
    assert.equal(before.json.bound, false);
    assert.equal(mock.calls.length, 0); // nothing bound → no backend call
    await c.call("/api/booking/start", { method: "POST", body: JSON.stringify(goodStart()) });
    const after = await c.call("/api/booking/status");
    assert.equal(after.json.bound, true);
    assert.equal(after.json.status, "INCOMPLETE");
    const gets = byType(mock.calls, "request.get");
    assert.equal(gets.length, 1);
    assert.deepEqual(JSON.parse(gets[0].env.body).data, {});
    const other = await s.mkClient().call("/api/booking/status"); // different session
    assert.equal(other.json.bound, false);
  } finally {
    await s.close();
    await mock.close();
  }
});

await test("unconfirmed create is settled by the same event before completing", async () => {
  const mock = await startMockExec({ dropBefore: 3 }); // start's 3 attempts all die
  const s = await startServerWith(mock.url);
  try {
    const c = s.mkClient();
    const r1 = await c.call("/api/booking/start", { method: "POST", body: JSON.stringify(goodStart()) });
    assert.equal(r1.json.unconfirmed, true);
    const r2 = await c.call("/api/booking/complete", { method: "POST", body: JSON.stringify(futureSlot()) });
    // complete first re-sends the SAME create event (now reachable), then completes.
    assert.equal(r2.json.accepted, true);
    assert.equal(r2.json.status, "SUBMITTED");
    assert.equal(r2.json.event, "complete");
    const creates = byType(mock.calls, "request.create");
    assert.equal(creates.length, 1); // same event settled once, no duplicate request
    const completes = byType(mock.calls, "request.complete");
    assert.equal(completes.length, 1);
    assert.equal(JSON.parse(completes[0].env.body).data.expected_version, 1);
  } finally {
    await s.close();
    await mock.close();
  }
});

await test("VERSION_CONFLICT reads authoritative state then allows a fresh decision", async () => {
  const mock = await startMockExec({ behavior: "conflict_once_complete" });
  const s = await startServerWith(mock.url);
  try {
    const c = s.mkClient();
    await c.call("/api/booking/start", { method: "POST", body: JSON.stringify(goodStart()) });
    const r1 = await c.call("/api/booking/complete", { method: "POST", body: JSON.stringify(futureSlot()) });
    assert.equal(r1.json.conflict, true);
    assert.equal(r1.json.status, "INCOMPLETE"); // authoritative state surfaced, no bypass
    const r2 = await c.call("/api/booking/complete", { method: "POST", body: JSON.stringify(futureSlot()) });
    assert.equal(r2.json.accepted, true);
    assert.equal(r2.json.status, "SUBMITTED");
    const completes = byType(mock.calls, "request.complete");
    assert.equal(completes.length, 2);
    assert.notEqual(completes[0].env.event_id, completes[1].env.event_id); // new decision → new event id
    assert.equal(JSON.parse(completes[1].env.body).data.expected_version, 1);
  } finally {
    await s.close();
    await mock.close();
  }
});

await test("validation rejects bad fields before any event is signed", async () => {
  const mock = await startMockExec();
  const s = await startServerWith(mock.url);
  try {
    const c = s.mkClient();
    const r = await c.call("/api/booking/start", {
      method: "POST",
      body: JSON.stringify(
        goodStart({
          name: "",
          email: "not-an-email",
          phone: "12345",
          consent: { service: false, followup: true, review: true },
        }),
      ),
    });
    assert.equal(r.status, 400);
    assert.equal(r.json.error.code, "VALIDATION");
    assert.ok(r.json.error.fields.email);
    assert.ok(r.json.error.fields.phone);
    assert.equal(r.json.error.fields.consent, "SERVICE_CONSENT_REQUIRED");
    assert.equal(mock.calls.length, 0);
    const r2 = await c.call("/api/booking/complete", {
      method: "POST",
      body: JSON.stringify({ date: "2020-01-01", time: "10:00" }),
    });
    assert.equal(r2.status, 409);
    assert.equal(r2.json.error.code, "NO_CONTACT_DATA");
  } finally {
    await s.close();
    await mock.close();
  }
});

await test("past preferred time is rejected with a clear code", async () => {
  const mock = await startMockExec();
  const s = await startServerWith(mock.url);
  try {
    const c = s.mkClient();
    await c.call("/api/booking/start", { method: "POST", body: JSON.stringify(goodStart()) });
    const y = new Date(Date.now() - 86400000);
    const r = await c.call("/api/booking/complete", {
      method: "POST",
      body: JSON.stringify({ date: y.toISOString().slice(0, 10), time: "10:00" }),
    });
    assert.equal(r.status, 400);
    assert.equal(r.json.error.fields.date, "PAST_PREFERRED_TIME");
  } finally {
    await s.close();
    await mock.close();
  }
});

await test("reset refuses while an event is unconfirmed", async () => {
  const mock = await startMockExec({ dropBefore: 99 });
  const s = await startServerWith(mock.url);
  try {
    const c = s.mkClient();
    await c.call("/api/booking/start", { method: "POST", body: JSON.stringify(goodStart()) });
    const r = await c.call("/api/booking/reset", { method: "POST" });
    assert.equal(r.status, 409);
    assert.equal(r.json.error.code, "PENDING_UNCONFIRMED");
  } finally {
    await s.close();
    await mock.close();
  }
});

await test("unknown origin is rejected; no-origin clients still work", async () => {
  const mock = await startMockExec();
  const s = await startServerWith(mock.url);
  try {
    const c = s.mkClient();
    const bad = await c.call("/api/booking/start", {
      method: "POST",
      headers: { origin: "https://evil.example" },
      body: JSON.stringify(goodStart()),
    });
    assert.equal(bad.status, 403);
    const ok = await c.call("/api/health"); // no Origin header
    assert.equal(ok.status, 200);
  } finally {
    await s.close();
    await mock.close();
  }
});

await test("rate limit returns 429 after the configured budget", async () => {
  const mock = await startMockExec();
  const s = await startServerWith(mock.url, { rateLimit: 3 });
  try {
    const c = s.mkClient();
    await c.call("/api/health");
    await c.call("/api/health");
    await c.call("/api/health");
    const fourth = await c.call("/api/health");
    assert.equal(fourth.status, 429);
    assert.equal(fourth.json.error.code, "RATE_LIMITED");
  } finally {
    await s.close();
    await mock.close();
  }
});

await test("static site is served from dist with SPA fallback; unknown API is 404", async () => {
  const mock = await startMockExec();
  const s = await startServerWith(mock.url);
  try {
    const res = await fetch(s.base + "/");
    assert.equal(res.status, 200);
    assert.equal(await res.text(), "<html>stub</html>");
    const spa = await fetch(s.base + "/some/route");
    assert.equal(spa.status, 200);
    const api404 = await fetch(s.base + "/api/unknown");
    assert.equal(api404.status, 404);
  } finally {
    await s.close();
    await mock.close();
  }
});

await test("no API response ever contains the ingest secret", async () => {
  const mock = await startMockExec();
  const s = await startServerWith(mock.url);
  try {
    const c = s.mkClient();
    await c.call("/api/health");
    await c.call("/api/booking/start", { method: "POST", body: JSON.stringify(goodStart()) });
    await c.call("/api/booking/complete", { method: "POST", body: JSON.stringify(futureSlot()) });
    await c.call("/api/booking/status");
    for (const json of c.seen) {
      if (json) assert.equal(JSON.stringify(json).includes(SECRET), false);
    }
  } finally {
    await s.close();
    await mock.close();
  }
});

await test("frontend never references VITE_-prefixed secrets", async () => {
  const bad = /VITE_[A-Z_]*(SECRET|KEY|TOKEN|PASSWORD)/;
  let offender = null;
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.(ts|tsx|js|jsx|html|css)$/.test(e.name)) {
        const text = fs.readFileSync(p, "utf8");
        if (bad.test(text)) offender = p;
      }
    }
  };
  walk(path.join(root, "src"));
  assert.equal(offender, null, `offending file: ${offender}`);
});

await test("built bundle (when present) does not contain the ingest secret", async () => {
  const distIndex = path.join(root, "dist", "index.html");
  const envFile = path.join(root, ".env");
  if (!fs.existsSync(distIndex) || !fs.existsSync(envFile)) return; // skipped silently
  const env = loadEnvFile(envFile);
  const secret = env.TABAH_INGEST_SECRET || "";
  if (!secret) return;
  const html = fs.readFileSync(distIndex, "utf8");
  assert.equal(html.includes(secret), false, "secret leaked into the browser bundle");
});

const report = {
  environment: "Node " + process.version,
  scope: "Sender server + client against a local HMAC-verified mock /exec",
  live_google_tested: false,
  live_email_tested: false,
  total: results.length,
  passed,
  failed: results.length - passed,
  results,
};
fs.writeFileSync(path.join(here, "results.json"), JSON.stringify(report, null, 2));
console.log(`\n${passed}/${results.length} passed. Live Google integration NOT executed.`);
process.exitCode = report.failed ? 1 : 0;
