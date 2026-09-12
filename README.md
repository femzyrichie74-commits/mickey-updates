# Mickey Updates — Deploy to Vercel

This site uses **Upstash Redis** (via the Vercel Marketplace storage integration)
so everyone who visits sees the same articles, and posting requires a passcode
checked on the server (not hidden in the page's source code anymore).

Note: Vercel's old first-party "KV" product was discontinued and folded into
this same Upstash integration — so on your Storage tab you'll pick **Upstash**,
not a separate "KV" option.

## Files
- `index.html` — the site (unchanged visually, just talks to `/api/articles` now)
- `api/articles.js` — GET returns all articles, POST saves them (passcode-protected)
- `api/verify-passcode.js` — checks the passcode before unlocking the composer
- `package.json` — needs the `@upstash/redis` package

## Setup steps

1. **Push this folder to a GitHub repo** (or drag-and-drop deploy via the Vercel dashboard).

2. **Import the project into Vercel** (vercel.com → Add New → Project → pick the repo).

3. **Add storage:**
   - In your Vercel project → **Storage** tab → **Create Database**.
   - Under Marketplace Database Providers, choose **Upstash** → pick the Redis option → Create.
   - Connect it to this project. Vercel will automatically add the
     `KV_REST_API_URL` and `KV_REST_API_TOKEN` env vars for you — no manual copying needed
     (the code reads these via `Redis.fromEnv()`).

4. **Set your admin passcode:**
   - Project → Settings → Environment Variables.
   - Add `ADMIN_PASSCODE` = whatever passcode you want to use to publish stories
     (pick something new — don't reuse `MickeyUpdates24@`, since that one was
     visible in the old file's source code).

5. **Redeploy** (Vercel → Deployments → Redeploy), so the new env vars take effect.

6. Visit your live URL. Readers can browse normally; click the small admin
   link at the bottom, enter your passcode, and you can publish/edit/delete stories.

## Notes
- Old articles saved via the previous `window.storage` (Claude-artifact only) version
  will NOT carry over — that storage doesn't exist outside Claude's chat interface.
  You're starting with an empty article list on Vercel.
- If you ever want to change the passcode, just update the `ADMIN_PASSCODE`
  env var in Vercel and redeploy — no code changes needed.
