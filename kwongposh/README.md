# KwongPosh website

The public website plus a small backend that protects the private collection.

```
public/index.html                  the whole website (look for "EDIT:" comments)
netlify/data/private-pieces.mjs    the private one-of-one pieces (server only)
netlify/functions/                 the backend: /api/login, /api/private,
                                   /api/logout, /api/request-access
netlify/lib/session.mjs            password check and sign-in cookie
dev-server.mjs                     run everything on your own computer
tools/ornaments.mjs                redraws the paisley / chinar / frame ornaments
netlify.toml                       hosting settings (Netlify reads this)
.env.example                       the settings you need to provide
```

## Common edits

| To change | Edit |
|---|---|
| Text, headings, categories, contact details | `public/index.html`, search for `EDIT:` |
| Colours | `public/index.html`, the `:root` block at the top of `<style>` |
| Cities on the map | `public/index.html`, search for `EDIT: CITIES` |
| Private pieces | `netlify/data/private-pieces.mjs` |
| Passwords | the `ACCESS_PASSWORDS` setting in Netlify (not in any file) |

After a change, commit and push to GitHub. Netlify rebuilds the live site in
about a minute.

## How the private collection works

1. A visitor clicks **Request access** and enters a password.
2. The browser sends it to `/api/login`. The server compares it with
   `ACCESS_PASSWORDS`. The passwords are never in the page source.
3. If it matches, the server sets a signed, HttpOnly cookie and returns the
   private pieces. The visitor stays signed in for `SESSION_DAYS` (default 30).
4. **Request a password** sends the visitor's email to `/api/request-access`,
   which emails it to you (via Resend) so you can reply with a password.

Wrong guesses are slowed down and limited to 8 per visitor per 10 minutes.

When `public/index.html` is opened directly as a file (for example in a file
viewer), there is no server, so it runs in **preview mode**: the demo password
`chinar` works and the demo pieces from the top of the script are shown. This
never happens on the live site.

## Run it on your computer

Needs Node.js 18 or newer. No packages to install.

```
cp .env.example .env     # then open .env and fill it in
npm run dev              # open http://localhost:8888
```

## Put it online (private GitHub repo + Netlify, free)

1. **Create a private repository** on GitHub (e.g. `kwongposh-site`) and push
   the contents of this folder to it.
2. Go to [netlify.com](https://www.netlify.com), sign up with GitHub, then
   **Add new site > Import an existing project > GitHub** and pick the repo.
   Netlify is allowed to read private repos once you grant access.
   Leave the build settings empty; `netlify.toml` already sets them.
3. In **Site configuration > Environment variables**, add:
   - `ACCESS_PASSWORDS`  e.g. `chinar,guest-london` (comma separated)
   - `SESSION_SECRET`    a long random string. Make one with
     `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - optional: `RESEND_API_KEY`, `NOTIFY_EMAIL`, `FROM_EMAIL` to receive
     password requests by email (free account at [resend.com](https://resend.com))
4. **Deploys > Trigger deploy**. Your site is live on a `.netlify.app` address.
5. **Domain management > Add a domain** to use `kwongposh.in`. Netlify shows the
   DNS records to add at your domain registrar and sets up HTTPS for free.

Netlify's free plan allows commercial sites and includes the backend functions
used here.

## Limits worth knowing

- Anyone who has a password can share it. Use different passwords for different
  people and remove one from `ACCESS_PASSWORDS` to switch it off.
- Photo links you add to private pieces are visible to anyone who has the link.
- The enquiry links open the visitor's email app. They are not a form.
