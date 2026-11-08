/* Event envelope per contract v1:
 * message = String(v) + "\n" + key_id + "\n" + String(ts) + "\n" + event_id + "\n" + body
 * signature = HMAC-SHA256(message UTF-8, INGEST_SECRET UTF-8), lowercase hex, 64 chars.
 * The exact body string is signed; never re-serialise it after signing. */
import crypto from "node:crypto";

const EVENT_ID_RE = /^[A-Za-z0-9][A-Za-z0-9_-]{7,79}$/;
const SECRET_RE = /^[A-Za-z0-9_-]{43,128}$/;

/**
 * @param {string} bodyString exact JSON text of the event body
 * @param {string} eventId    stable id for this event (same on retries)
 * @param {string} secret     INGEST_SECRET (plain URL-safe text, not base64-decoded)
 * @param {number} tsSeconds  unix seconds
 */
export function buildEnvelope(bodyString, eventId, secret, tsSeconds) {
  if (typeof bodyString !== "string" || bodyString.length === 0 || bodyString.length > 12000)
    throw new Error("INVALID_BODY");
  if (!EVENT_ID_RE.test(eventId)) throw new Error("INVALID_EVENT_ID");
  if (!SECRET_RE.test(secret)) throw new Error("INVALID_SECRET_FORMAT");
  const message = ["1", "ingest", String(tsSeconds), eventId, bodyString].join("\n");
  const signature = crypto
    .createHmac("sha256", secret)
    .update(message, "utf8")
    .digest("hex"); // digest('hex') is already lowercase
  return {
    v: 1,
    key_id: "ingest",
    ts: tsSeconds,
    event_id: eventId,
    body: bodyString,
    signature,
  };
}
