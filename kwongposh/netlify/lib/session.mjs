// ---------------------------------------------------------------------------
// Shared helpers for the private collection: password checks and the
// signed "you are signed in" cookie.
//
// Settings come from environment variables (set them in Netlify, or in a
// local .env file when running `npm run dev`):
//
//   ACCESS_PASSWORDS  one or more passwords, separated by commas.
//                     e.g.  chinar,saffron-2026,guest-london
//                     Give different people different passwords, and remove
//                     one any time to switch it off.
//   SESSION_SECRET    a long random string used to sign the cookie.
//                     Changing it signs everyone out.
//   SESSION_DAYS      optional. How long someone stays signed in (default 30).
// ---------------------------------------------------------------------------
import crypto from 'node:crypto';

const COOKIE = 'kp_session';

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 16) throw new Error('SESSION_SECRET is missing or too short (use 32+ random characters).');
  return s;
}

const b64 = (buf) => Buffer.from(buf).toString('base64url');
const sign = (data) => b64(crypto.createHmac('sha256', secret()).update(data).digest());

// Compare two strings without leaking how many characters matched.
function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

// True if the password matches one of ACCESS_PASSWORDS.
// Passwords are compared ignoring capital letters and surrounding spaces,
// so "Chinar " and "chinar" both work.
export function passwordIsValid(input) {
  const list = (process.env.ACCESS_PASSWORDS || '').split(',').map((p) => p.trim().toLowerCase()).filter(Boolean);
  const given = String(input || '').trim().toLowerCase();
  if (!given || list.length === 0) return false;
  let ok = false;
  for (const p of list) ok = safeEqual(given, p) || ok; // check every one so timing stays the same
  return ok;
}

// The Set-Cookie header value that signs someone in.
export function sessionCookie(req) {
  const days = Number(process.env.SESSION_DAYS) || 30;
  const payload = b64(JSON.stringify({ exp: Date.now() + days * 864e5 }));
  const value = `${payload}.${sign(payload)}`;
  const secure = new URL(req.url).protocol === 'https:' ? '; Secure' : '';
  return `${COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${days * 86400}${secure}`;
}

export function clearCookie() {
  return `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

// True if the request carries a valid, unexpired session cookie.
export function isSignedIn(req) {
  const raw = (req.headers.get('cookie') || '').split(/;\s*/).find((c) => c.startsWith(COOKIE + '='));
  if (!raw) return false;
  const [payload, sig] = raw.slice(COOKIE.length + 1).split('.');
  if (!payload || !sig || !safeEqual(sig, sign(payload))) return false;
  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString()).exp > Date.now();
  } catch {
    return false;
  }
}

// A light brake on password guessing: at most 8 wrong tries per visitor per
// 10 minutes. It lives in memory, so it is per server instance and resets on
// redeploys. Good enough to stop casual guessing; not a full firewall.
const tries = new Map();
export function tooManyTries(req, context) {
  const ip = context?.ip || req.headers.get('x-nf-client-connection-ip') || req.headers.get('x-forwarded-for') || 'local';
  const now = Date.now();
  const t = (tries.get(ip) || []).filter((x) => now - x < 10 * 60e3);
  tries.set(ip, t);
  return { blocked: t.length >= 8, record: () => t.push(now) };
}

export const json = (body, status = 200, headers = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers } });
