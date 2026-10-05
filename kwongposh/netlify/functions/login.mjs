// POST /api/login   body: { "password": "..." }
// Checks the password. If it is right, signs the visitor in with a cookie and
// sends back the private pieces.
import pieces from '../data/private-pieces.mjs';
import { passwordIsValid, sessionCookie, tooManyTries, json } from '../lib/session.mjs';

export default async (req, context) => {
  if (req.method !== 'POST') return json({ error: 'Use POST' }, 405);

  const limit = tooManyTries(req, context);
  if (limit.blocked) return json({ error: 'Too many tries' }, 429);

  let password = '';
  try { ({ password } = await req.json()); } catch { /* empty or bad body */ }

  if (!passwordIsValid(password)) {
    limit.record();
    await new Promise((r) => setTimeout(r, 400)); // slow down guessing a little
    return json({ error: 'Wrong password' }, 401);
  }
  return json({ pieces }, 200, { 'Set-Cookie': sessionCookie(req) });
};

export const config = { path: '/api/login' };
