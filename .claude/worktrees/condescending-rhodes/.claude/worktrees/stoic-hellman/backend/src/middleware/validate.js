/**
 * Input validation helpers for admin routes.
 * Used to trim strings, validate phone numbers, emails, and time ordering.
 */

/** Trim a string value safely; returns null if blank/missing */
const trimStr = (val) => {
  if (val === undefined || val === null) return null;
  const t = String(val).trim();
  return t.length > 0 ? t : null;
};

/** Indian mobile number: 10 digits starting with 6-9 */
const PHONE_RE = /^[6-9]\d{9}$/;
const isValidPhone = (phone) => PHONE_RE.test(String(phone || '').trim());

/** Basic email format + must have domain */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isValidEmail = (email) => EMAIL_RE.test(String(email || '').trim());

/** HH:MM or HH:MM:SS time string */
const TIME_RE = /^\d{2}:\d{2}(:\d{2})?$/;
const isValidTime = (t) => TIME_RE.test(String(t || '').trim());

/**
 * Returns true if start < end (both HH:MM or HH:MM:SS strings).
 * Returns true if either is missing (let DB handle nulls).
 */
const isStartBeforeEnd = (start, end) => {
  if (!start || !end) return true;
  return String(start).trim() < String(end).trim();
};

module.exports = { trimStr, isValidPhone, isValidEmail, isValidTime, isStartBeforeEnd };
