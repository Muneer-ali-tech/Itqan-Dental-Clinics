/* Field validation mirroring the backend rules (Tabah_Dent_External_v1 contract v1). */

export const EMAIL_RE =
  /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
export const PHONE_RE = /^\+?[0-9]{9,15}$/;
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/;

export function checkName(v) {
  if (typeof v !== "string") return { error: "INVALID_NAME" };
  const name = v.trim();
  if (name.length < 1 || name.length > 60 || CONTROL_CHARS.test(name))
    return { error: "INVALID_NAME" };
  return { value: name };
}

export function checkEmail(v) {
  if (typeof v !== "string") return { error: "INVALID_EMAIL" };
  const email = v.trim().toLowerCase();
  if (email.length < 3 || email.length > 120 || !EMAIL_RE.test(email))
    return { error: "INVALID_EMAIL" };
  return { value: email };
}

/** Accepts "+966 5X XXX XXXX" style input; stores +<digits> only. Optional field. */
export function checkPhone(v) {
  if (v === undefined || v === null || v === "") return { value: "" };
  if (typeof v !== "string") return { error: "INVALID_PHONE" };
  const phone = "+" + v.replace(/[^0-9]/g, "");
  if (!PHONE_RE.test(phone)) return { error: "INVALID_PHONE" };
  return { value: phone };
}

/** Strict booleans only — "true" as a string is rejected, no hidden defaults. */
export function checkConsent(v) {
  if (!v || typeof v !== "object" || Array.isArray(v)) return { error: "INVALID_CONSENT" };
  const { service, followup, review } = v;
  if (typeof service !== "boolean" || typeof followup !== "boolean" || typeof review !== "boolean")
    return { error: "INVALID_CONSENT" };
  return { value: { service, followup, review } };
}

/** Riyadh is UTC+3 year-round. Renders unix-ms as ISO with an explicit +03:00 offset. */
export function isoRiyadh(ms) {
  return new Date(ms + 3 * 3600000).toISOString().replace("Z", "+03:00");
}

/**
 * @param {string} date "YYYY-MM-DD" (user wall-clock in Riyadh)
 * @param {string} time "HH:MM"
 * @param {number} nowMs
 * @returns {{value:string}|{error:string}} ISO instant like 2026-11-09T12:00:00+03:00
 */
export function buildPreferredAt(date, time, nowMs) {
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date))
    return { error: "INVALID_DATE" };
  if (typeof time !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time))
    return { error: "INVALID_TIME" };
  const [y, m, d] = date.split("-").map(Number);
  const cal = new Date(Date.UTC(y, m - 1, d));
  if (cal.getUTCFullYear() !== y || cal.getUTCMonth() !== m - 1 || cal.getUTCDate() !== d)
    return { error: "INVALID_DATE" };
  const n = Date.parse(`${date}T${time}:00+03:00`);
  if (!Number.isFinite(n)) return { error: "INVALID_DATE" };
  if (n <= nowMs) return { error: "PAST_PREFERRED_TIME" };
  if (n >= nowMs + 90 * 86400000) return { error: "PREFERRED_TIME_TOO_FAR" };
  return { value: `${date}T${time}:00+03:00` };
}
