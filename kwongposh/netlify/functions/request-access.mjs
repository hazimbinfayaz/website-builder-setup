// POST /api/request-access   body: { "email": "...", "name": "..." }
// Someone asked for a password. This emails you their details so you can
// decide whether to send them one.
//
// Email is sent through Resend (https://resend.com, free tier is plenty).
// Set these environment variables in Netlify:
//   RESEND_API_KEY   your Resend API key
//   NOTIFY_EMAIL     where requests should go, e.g. contact@kwongposh.in
//   FROM_EMAIL       optional sender, e.g. "KwongPosh <access@kwongposh.in>"
//                    (needs your domain verified in Resend; until then the
//                    default onboarding@resend.dev works for testing)
// If RESEND_API_KEY is not set, requests are written to the Netlify function
// log instead (Netlify > your site > Logs > Functions), so nothing is lost.
import { json } from '../lib/session.mjs';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clean = (s, n) => String(s || '').replace(/[\r\n<>]/g, ' ').trim().slice(0, n);

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'Use POST' }, 405);

  let body = {};
  try { body = await req.json(); } catch { /* ignore */ }

  // "website" is a hidden field people never see. Bots fill it in; we quietly ignore them.
  if (body.website) return json({ ok: true });

  const email = clean(body.email, 200);
  const name = clean(body.name, 120);
  if (!EMAIL.test(email)) return json({ error: 'Please enter a valid email address.' }, 400);

  const line = `Private collection request: ${name || '(no name)'} <${email}> at ${new Date().toISOString()}`;
  const key = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL;

  if (!key || !to) {
    console.log(line);
    return json({ ok: true });
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.FROM_EMAIL || 'KwongPosh <onboarding@resend.dev>',
      to: [to],
      reply_to: email,
      subject: `Private collection request from ${name || email}`,
      text: `${line}\n\nReply to this email to send them a password.`,
    }),
  });
  if (!res.ok) {
    console.error('Resend error', res.status, await res.text());
    console.log(line);
    return json({ error: 'Could not send right now' }, 502);
  }
  return json({ ok: true });
};

export const config = { path: '/api/request-access' };
