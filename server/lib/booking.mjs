/* Booking orchestrator: builds contract-v1 events, freezes bodies, drives retries,
 * and interprets outcomes. One logical booking attempt per browser session;
 * request_id/event_id are generated here and never regenerated to cure errors. */
import crypto from "node:crypto";
import { sendEvent } from "./tabah-client.mjs";
import {
  checkConsent,
  checkEmail,
  checkName,
  checkPhone,
  buildPreferredAt,
  isoRiyadh,
} from "./validate.mjs";

const DEMO_BRANCH = "DEMO_BRANCH";
const CONSENT_VERSION = "demo-email-v1";
const CONSENT_SOURCE = "demo-form";

function newRequest() {
  return {
    requestId: "demo-" + crypto.randomUUID(),
    reference: null,
    status: "DRAFT",
    version: 0,
    contact: null,
    consent: null,
    locked: false, // true once any event was attempted: body + identifiers are frozen
    createEvent: null, // {eventId, bodyString, state:'pending'|'accepted'|'refused', code?}
    finalEvent: null, // {kind:'complete'|'create', eventId, bodyString, state, code?}
  };
}

function buildCreateBody(r, details, nowMs) {
  const data = {
    is_test: true,
    name: r.contact.name,
    email: r.contact.email,
    phase: details ? "SUBMITTED" : "INCOMPLETE",
    consent: {
      service: r.consent.service,
      followup: r.consent.followup,
      review: r.consent.review,
      at: isoRiyadh(nowMs), // stamped at send time; the decision was made in this session
      version: CONSENT_VERSION,
      source: CONSENT_SOURCE,
    },
  };
  if (r.contact.phone) data.phone = r.contact.phone;
  if (details) {
    data.branch_id = DEMO_BRANCH;
    data.preferred_at = details;
  }
  return { type: "request.create", request_id: r.requestId, data };
}

function buildCompleteBody(r, preferredAt) {
  return {
    type: "request.complete",
    request_id: r.requestId,
    data: { expected_version: r.version, branch_id: DEMO_BRANCH, preferred_at: preferredAt },
  };
}

function buildGetBody(r) {
  return { type: "request.get", request_id: r.requestId, data: {} };
}

function freshEvent(body) {
  return { eventId: "evt-" + crypto.randomUUID(), bodyString: JSON.stringify(body) };
}

/** Runs one event through the transport and records the outcome on its slot. */
async function attempt(ctx, r, slot) {
  const res = await sendEvent(
    {
      execUrl: ctx.cfg.execUrl,
      secret: ctx.cfg.ingestSecret,
      eventId: slot.eventId,
      bodyString: slot.bodyString,
      requestId: r.requestId,
    },
    { attempts: 3, delaysMs: ctx.delaysMs, timeoutMs: ctx.timeoutMs },
    ctx.deps,
  );
  if (res.outcome === "accepted") {
    slot.state = "accepted";
    slot.code = undefined;
    r.version = res.result.data.version;
    r.status = res.result.data.status;
    r.reference = res.result.data.reference || r.reference;
  } else if (res.outcome === "unconfirmed") {
    slot.state = "pending";
    slot.code = res.code;
  } else {
    slot.state = "refused";
    slot.code = res.code;
  }
  return res;
}

const refused = (code) => ({ http: 200, body: { sent: true, accepted: false, error: { code } } });

/** Authoritative read (request.get) — only ever for the session's own request. */
async function readState(ctx, r) {
  const slot = freshEvent(buildGetBody(r));
  const res = await attempt(ctx, r, slot);
  if (res.outcome === "accepted") return { ok: true, data: res.result.data };
  return { ok: false, outcome: res.outcome, code: res.code };
}

/** Contract: on REQUEST_EXISTS read the same request instead of creating another. */
async function adoptExisting(ctx, r, res, slot) {
  if (!(res.outcome === "refused" && res.code === "REQUEST_EXISTS")) return false;
  const st = await readState(ctx, r);
  if (!st.ok) return false;
  slot.state = "accepted";
  slot.code = undefined;
  return true;
}

export function createBookingApi(ctx) {
  async function start(input, session) {
    if (!ctx.cfg.configured)
      return { http: 503, body: { error: { code: "SENDER_NOT_CONFIGURED" } } };
    const name = checkName(input && input.name);
    const email = checkEmail(input && input.email);
    const phone = checkPhone(input && input.phone);
    const consent = checkConsent(input && input.consent);
    const fields = {};
    if (name.error) fields.name = name.error;
    if (email.error) fields.email = email.error;
    if (phone.error) fields.phone = phone.error;
    if (consent.error) fields.consent = consent.error;
    else if (consent.value.service !== true) fields.consent = "SERVICE_CONSENT_REQUIRED";
    if (Object.keys(fields).length)
      return { http: 400, body: { error: { code: "VALIDATION", fields } } };

    let r = session.booking;
    if (r && r.locked) {
      // Contract: never rebuild identifiers or bodies to cure an earlier attempt.
      const ev = r.createEvent || r.finalEvent;
      const out = {
        locked: true,
        sent: !!ev,
        accepted: ev ? ev.state === "accepted" : false,
        reference: r.reference,
        status: r.status,
      };
      if (ev && ev.state === "refused") out.error = { code: ev.code };
      if (ev && ev.state === "pending") out.unconfirmed = true;
      return { http: 200, body: out };
    }
    if (!r) r = session.booking = newRequest();
    r.contact = { name: name.value, email: email.value, phone: phone.value };
    r.consent = consent.value;

    if (r.consent.followup !== true)
      return { http: 200, body: { sent: false, reason: "NO_FOLLOWUP_CONSENT" } };

    // Step-1 capture: name + email + phone leave now as an INCOMPLETE request.
    const ev = r.createEvent = {
      ...freshEvent(buildCreateBody(r, null, ctx.now())),
      state: "pending",
    };
    r.locked = true;
    const res = await attempt(ctx, r, ev);
    if (await adoptExisting(ctx, r, res, ev)) res.outcome = "accepted";
    if (res.outcome === "accepted")
      return {
        http: 200,
        body: {
          sent: true,
          accepted: true,
          duplicate: !!res.duplicate,
          reference: r.reference,
          status: r.status,
        },
      };
    if (res.outcome === "unconfirmed")
      return { http: 200, body: { sent: true, accepted: false, unconfirmed: true, stage: "create" } };
    return refused(res.code);
  }

  async function complete(input, session) {
    if (!ctx.cfg.configured)
      return { http: 503, body: { error: { code: "SENDER_NOT_CONFIGURED" } } };
    const r = session.booking;
    if (!r || !r.contact)
      return { http: 409, body: { error: { code: "NO_CONTACT_DATA" } } };
    const at = buildPreferredAt(input && input.date, input && input.time, ctx.now());
    if (at.error)
      return { http: 400, body: { error: { code: "VALIDATION", fields: { date: at.error } } } };

    // Already-finalised attempt: idempotent replay of the stored result.
    if (r.finalEvent && r.finalEvent.state === "accepted")
      return {
        http: 200,
        body: {
          sent: true,
          accepted: true,
          duplicate: true,
          event: r.finalEvent.kind,
          reference: r.reference,
          status: r.status,
        },
      };
    if (r.finalEvent && r.finalEvent.state === "refused") {
      // After VERSION_CONFLICT the user may make a fresh decision (new event, current version);
      // every other refusal keeps the attempt parked — reset is the way out.
      if (r.finalEvent.code !== "VERSION_CONFLICT") return refused(r.finalEvent.code);
    }

    // An unresolved INCOMPLETE create must be settled first (same event, never rebuilt).
    if (r.createEvent && r.createEvent.state === "pending") {
      const res = await attempt(ctx, r, r.createEvent);
      if (await adoptExisting(ctx, r, res, r.createEvent)) res.outcome = "accepted";
      if (res.outcome === "unconfirmed")
        return { http: 200, body: { sent: true, accepted: false, unconfirmed: true, stage: "create" } };
      if (res.outcome === "refused") return refused(res.code);
    }
    if (r.createEvent && r.createEvent.state === "refused")
      return refused(r.createEvent.code);

    let kind;
    let slot;
    if (r.createEvent && r.createEvent.state === "accepted") {
      kind = "complete";
      slot = r.finalEvent = {
        ...freshEvent(buildCompleteBody(r, at.value)),
        state: "pending",
        kind,
      };
    } else {
      // No follow-up consent was given earlier: single signed SUBMITTED create now.
      kind = "create";
      slot = r.finalEvent = {
        ...freshEvent(buildCreateBody(r, at.value, ctx.now())),
        state: "pending",
        kind,
      };
    }
    r.locked = true;
    const res = await attempt(ctx, r, slot);
    if (await adoptExisting(ctx, r, res, slot)) res.outcome = "accepted";

    if (res.outcome === "accepted")
      return {
        http: 200,
        body: {
          sent: true,
          accepted: true,
          duplicate: !!res.duplicate,
          event: kind,
          reference: r.reference,
          status: r.status,
        },
      };
    if (res.outcome === "unconfirmed")
      return { http: 200, body: { sent: true, accepted: false, unconfirmed: true, stage: kind } };
    if (res.code === "VERSION_CONFLICT") {
      // Read the authoritative state and hand the decision back; never bypass silently.
      const st = await readState(ctx, r);
      if (st.ok)
        return {
          http: 200,
          body: { conflict: true, reference: r.reference, status: r.status, version: r.version },
        };
      return refused(st.code || "INTERNAL_RETRY_SAME_EVENT");
    }
    return refused(res.code);
  }

  async function retry(_input, session) {
    if (!ctx.cfg.configured)
      return { http: 503, body: { error: { code: "SENDER_NOT_CONFIGURED" } } };
    const r = session.booking;
    if (!r) return { http: 409, body: { error: { code: "NOTHING_PENDING" } } };
    let slot;
    let kind;
    if (r.finalEvent && r.finalEvent.state === "pending") {
      slot = r.finalEvent;
      kind = slot.kind;
    } else if (r.createEvent && r.createEvent.state === "pending") {
      slot = r.createEvent;
      kind = "create";
    } else {
      return { http: 409, body: { error: { code: "NOTHING_PENDING" } } };
    }
    const res = await attempt(ctx, r, slot);
    if (await adoptExisting(ctx, r, res, slot)) res.outcome = "accepted";
    if (res.outcome === "accepted")
      return {
        http: 200,
        body: {
          sent: true,
          accepted: true,
          duplicate: !!res.duplicate,
          event: kind,
          reference: r.reference,
          status: r.status,
        },
      };
    if (res.outcome === "unconfirmed")
      return { http: 200, body: { sent: true, accepted: false, unconfirmed: true, stage: kind } };
    return refused(res.code);
  }

  async function status(_input, session) {
    const r = session.booking;
    const attempted = !!(r && (r.createEvent || r.finalEvent));
    if (!attempted) return { http: 200, body: { bound: false } };
    if (!ctx.cfg.configured)
      return { http: 503, body: { error: { code: "SENDER_NOT_CONFIGURED" } } };
    const st = await readState(ctx, r);
    if (st.ok)
      return {
        http: 200,
        body: {
          bound: true,
          reference: r.reference,
          status: r.status,
          version: r.version,
          appointment_at: (st.data && st.data.appointment_at) || null,
        },
      };
    if (st.code === "NOT_FOUND")
      return { http: 200, body: { bound: true, status: "NOT_FOUND", reference: r.reference } };
    return {
      http: 200,
      body: {
        bound: true,
        status: "UNKNOWN",
        error: { code: st.code || "INTERNAL_RETRY_SAME_EVENT" },
      },
    };
  }

  async function reset(_input, session) {
    const r = session.booking;
    const pending =
      r &&
      ((r.createEvent && r.createEvent.state === "pending") ||
        (r.finalEvent && r.finalEvent.state === "pending"));
    if (pending) return { http: 409, body: { error: { code: "PENDING_UNCONFIRMED" } } };
    session.booking = null;
    return { http: 200, body: { ok: true } };
  }

  return { start, complete, retry, status, reset };
}
