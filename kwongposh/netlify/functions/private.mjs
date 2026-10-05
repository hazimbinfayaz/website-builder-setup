// GET /api/private
// Sends the private pieces, but only to a visitor who is signed in.
// The page calls this on load so returning visitors stay unlocked.
import pieces from '../data/private-pieces.mjs';
import { isSignedIn, json } from '../lib/session.mjs';

export default async (req) => {
  if (!isSignedIn(req)) return json({ error: 'Not signed in' }, 401);
  return json({ pieces });
};

export const config = { path: '/api/private' };
