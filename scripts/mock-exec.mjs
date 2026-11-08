/* Local mock of the Tabah Apps Script /exec endpoint (DEMO rehearsal only).
 * Verifies the same HMAC envelope the real backend verifies and mimics the
 * minimal create/complete/get semantics. NOT the real backend: live acceptance
 * against Google is still required and must be recorded in LIVE_ACCEPTANCE_AR.md.
 *
 * Usage:
 *   MOCK_PORT=8088 MOCK_INGEST_SECRET=<43-128 urlsafe chars> node scripts/mock-exec.mjs
 *   Optional MOCK_BEHAVIOR=normal|html|busy_once|stale_once|version_conflict_once|timeout
 */
import http from "node:http";
import crypto from "node:crypto";
import { loadEnvFile } from "../server/lib/config.mjs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// Falls back to TABAH_INGEST_SECRET from .env so local rehearsal needs zero extra setup.
const secret =
  process.env.MOCK_INGEST_SECRET || loadEnvFile(path.join(root, ".env")).TABAH_INGEST_SECRET || "";
if (!/^[A-Za-z0-9_-]{43,128}$/.test(secret)) {
  console.error("Set MOCK_INGEST_SECRET (or TABAH_INGEST_SECRET in .env) to a random URL-safe string (43-128 chars).");
  console.error("Generate one:  python -c \"import secrets; print(secrets.token_urlsafe(48))\"");
  process.exit(1);
}
const port = Number(process.env.MOCK_PORT) || 8088;
const behavior = process.env.MOCK_BEHAVIOR || "normal";

const requests = new Map(); // request_id -> {version, status, events: Map eventId -> hash}
let busyOnce = behavior === "busy_once";
let staleOnce = behavior === "stale_once";
let conflictOnce = behavior === "version_conflict_once";

const mac = (msg) =>
  crypto.createHmac("sha256", secret).update(msg, "utf8").digest("hex");
const pub = (r) => ({
  request_id: r.id,
  reference: "TD-" + r.id,
  status: r.status,
  version: r.version,
  is_test: true,
  appointment_at: r.appointment_at || null,
  contact_stopped: false,
});
const json = (res, status, body) => {
  const payload = JSON.stringify(body);
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(payload);
};

const server = http.createServer(async (req, res) => {
  let raw = "";
  for await (const c of req) raw += c;
  const finish = (body) => {
    if (behavior === "html") {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      return res.end("<html><body>Google Login</body></html>");
    }
    return json(res, 200, body);
  };
  if (behavior === "timeout") await new Promise((r) => setTimeout(r, 15000));

  let env;
  try {
    env = JSON.parse(raw);
  } catch {
    return finish({ ok: false, error: { code: "INVALID_JSON", retryable: false } });
  }
  const msg = [env.v, env.key_id, env.ts, env.event_id, env.body].join("\n");
  if (staleOnce) {
    staleOnce = false;
    return finish({ ok: false, error: { code: "STALE_SIGNATURE", retryable: false } });
  }
  if (busyOnce) {
    busyOnce = false;
    return finish({ ok: false, error: { code: "BUSY", retryable: true } });
  }
  if (mac(msg) !== env.signature)
    return finish({ ok: false, error: { code: "BAD_SIGNATURE", retryable: false } });
  if (Math.abs(Date.now() / 1000 - env.ts) > 300)
    return finish({ ok: false, error: { code: "STALE_SIGNATURE", retryable: false } });

  let body;
  try {
    body = JSON.parse(env.body);
  } catch {
    return finish({ ok: false, error: { code: "INVALID_BODY_JSON", retryable: false } });
  }
  console.log(`[mock-exec] ${body.type} request_id=${body.request_id} event_id=${env.event_id}`);

  let r = requests.get(body.request_id);
  const digest = crypto.createHash("sha256").update(env.body, "utf8").digest("hex");

  if (body.type === "request.create") {
    if (r && r.events.has(env.event_id))
      return finish({ ok: true, duplicate: true, event_version: 1, data: pub(r) });
    if (r) return finish({ ok: false, error: { code: "REQUEST_EXISTS", retryable: false } });
    if (body.data.phase !== "SUBMITTED" && body.data.phase !== "INCOMPLETE")
      return finish({ ok: false, error: { code: "INVALID_PHASE", retryable: false } });
    r = { id: body.request_id, version: 1, status: body.data.phase, events: new Map([[env.event_id, digest]]), appointment_at: null };
    requests.set(body.request_id, r);
    return finish({ ok: true, duplicate: false, event_version: 1, data: pub(r) });
  }
  if (body.type === "request.complete") {
    if (!r) return finish({ ok: false, error: { code: "NOT_FOUND", retryable: false } });
    if (r.events.has(env.event_id))
      return finish({ ok: true, duplicate: true, event_version: r.version, data: pub(r) });
    if (conflictOnce) {
      conflictOnce = false;
      return finish({ ok: false, error: { code: "VERSION_CONFLICT", retryable: false } });
    }
    if (body.data.expected_version !== r.version)
      return finish({ ok: false, error: { code: "VERSION_CONFLICT", retryable: false } });
    r.version += 1;
    r.status = "SUBMITTED";
    r.appointment_at = body.data.preferred_at;
    r.events.set(env.event_id, digest);
    return finish({ ok: true, duplicate: false, event_version: r.version, data: pub(r) });
  }
  if (body.type === "request.get") {
    if (!r) return finish({ ok: false, error: { code: "NOT_FOUND", retryable: false } });
    return finish({ ok: true, data: pub(r) });
  }
  return finish({ ok: false, error: { code: "FORBIDDEN_EVENT", retryable: false } });
});

server.listen(port, () => {
  console.log(`[mock-exec] listening on http://127.0.0.1:${port}/exec (behavior=${behavior})`);
});
