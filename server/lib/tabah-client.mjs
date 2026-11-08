/* Sender transport: signed POST to Apps Script /exec with contract-v1 retry policy.
 * - Same event_id and byte-identical body on every retry; only ts+signature are refreshed.
 * - Max 3 attempts, delays 2s then 4s (injectable for tests).
 * - HTTP 200 alone is not success: needs JSON with ok:true and matching request_id.
 * - Non-JSON responses (e.g. Google login HTML) are never treated as success. */
import { buildEnvelope } from "./signer.mjs";

/** Backend marks BUSY/unknown-internal retryable; STALE_SIGNATURE is fixed by re-signing only. */
export const RETRYABLE_CODES = new Set([
  "BUSY",
  "INTERNAL_RETRY_SAME_EVENT",
  "STALE_SIGNATURE",
]);

function defaultDeps() {
  return {
    fetch: globalThis.fetch.bind(globalThis),
    AbortController: globalThis.AbortController,
    setTimeout: globalThis.setTimeout.bind(globalThis),
    clearTimeout: globalThis.clearTimeout.bind(globalThis),
    now: Date.now,
    sleep: (ms) => new Promise((r) => setTimeout(r, ms)),
  };
}

async function postOnce(deps, execUrl, envelope, timeoutMs) {
  const ctrl = new deps.AbortController();
  const timer = deps.setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await deps.fetch(execUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(envelope),
      redirect: "follow", // follow Google's 302 to script.googleusercontent.com; never force re-POST
      signal: ctrl.signal,
    });
    const text = await res.text();
    let parsed = null;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = null;
    }
    if (!parsed || typeof parsed !== "object" || typeof parsed.ok !== "boolean") {
      // A login page / proxy HTML is a deployment problem, not a network blip:
      // like the reference Python tool, do not retry it.
      return { kind: "bad_json", httpStatus: res.status };
    }
    return { kind: "result", result: parsed };
  } catch (err) {
    return {
      kind: "transport",
      reason: err && err.name === "AbortError" ? "TIMEOUT" : "NETWORK",
      detail: String((err && (err.code || err.name)) || err),
    };
  } finally {
    deps.clearTimeout(timer);
  }
}

/**
 * @param {{execUrl:string, secret:string, eventId:string, bodyString:string, requestId:string}} task
 * @param {{attempts?:number, delaysMs?:number[], timeoutMs?:number}} opts
 * @param {object} [injectedDeps]
 * @returns {Promise<{outcome:'accepted'|'unconfirmed'|'refused', duplicate?:boolean,
 *   result?:object, code?:string, attempts:number, transport?:string}>}
 */
export async function sendEvent(task, opts = {}, injectedDeps) {
  const deps = injectedDeps || defaultDeps();
  const attempts = opts.attempts || 3;
  const delaysMs = opts.delaysMs || [2000, 4000];
  const timeoutMs = opts.timeoutMs || 8000;
  let n = 0;
  let lastTransport;
  while (n < attempts) {
    n++;
    const envelope = buildEnvelope(
      task.bodyString,
      task.eventId,
      task.secret,
      Math.floor(deps.now() / 1000), // fresh ts+signature per attempt; body/event_id frozen
    );
    const r = await postOnce(deps, task.execUrl, envelope, timeoutMs);
    if (r.kind === "bad_json") {
      return { outcome: "refused", code: "NON_JSON_RESPONSE", attempts: n };
    }
    if (r.kind === "transport") {
      lastTransport = r.reason;
      if (n < attempts) {
        await deps.sleep(delaysMs[Math.min(n, delaysMs.length) - 1]);
        continue;
      }
      return { outcome: "unconfirmed", attempts: n, transport: r.reason };
    }
    const result = r.result;
    if (result.ok === true) {
      const data = result.data || {};
      if (data.request_id !== task.requestId) {
        return { outcome: "refused", code: "RESPONSE_MISMATCH", result, attempts: n };
      }
      return {
        outcome: "accepted",
        duplicate: result.duplicate === true,
        result,
        attempts: n,
      };
    }
    const code = (result.error && result.error.code) || "UNKNOWN";
    const retryable =
      (result.error && result.error.retryable === true) || RETRYABLE_CODES.has(code);
    if (retryable && n < attempts) {
      await deps.sleep(delaysMs[Math.min(n, delaysMs.length) - 1]);
      continue;
    }
    if (retryable) return { outcome: "unconfirmed", code, attempts: n };
    return { outcome: "refused", code, result, attempts: n };
  }
  return { outcome: "unconfirmed", attempts: n, transport: lastTransport };
}
