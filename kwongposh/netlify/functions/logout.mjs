// POST /api/logout
// Signs the visitor out by clearing the cookie.
import { clearCookie, json } from '../lib/session.mjs';

export default async () => json({ ok: true }, 200, { 'Set-Cookie': clearCookie() });

export const config = { path: '/api/logout' };
