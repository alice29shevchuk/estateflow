# Deploying EstateFlow (Vercel + Render)

This is a monorepo: the **backend** (`server/`) and the **web app** (`web/`) deploy
separately. Deploy the backend first so you have its URL for the web app.

> Prerequisite: push this repo to GitHub.
> ```bash
> git remote add origin https://github.com/YOUR_USER/estateflow.git
> git push -u origin main
> ```

---

## 1. Backend → Render (GraphQL API)

1. Go to [render.com](https://render.com) → **New +** → **Web Service**.
2. Connect your GitHub and pick the `estateflow` repo.
3. Configure:
   | Field | Value |
   |-------|-------|
   | **Name** | `estateflow-api` |
   | **Root Directory** | `server` |
   | **Runtime** | Node |
   | **Build Command** | `npm install` |
   | **Start Command** | `npm start` |
   | **Instance Type** | Free |
4. **Environment variables** (Advanced → Add Environment Variable):
   - `JWT_SECRET` = any long random string
   - *(optional)* `SENTRY_DSN` = your Sentry DSN
   - Do **not** set `PORT` — Render provides it, and the code already reads `process.env.PORT`.
5. Click **Create Web Service**. After the build, copy the URL, e.g.
   `https://estateflow-api.onrender.com`.
6. Verify it works: open `https://estateflow-api.onrender.com/health` → `{"ok":true}`.

> **Free tier notes:** the service sleeps after ~15 min of inactivity, so the first
> request after idle takes a few seconds to wake. Data is in-memory and resets on
> every restart/redeploy (fine for a demo — see "Optional: persistent data" below).

---

## 2. Web → Vercel (Next.js)

1. Go to [vercel.com](https://vercel.com) → **Add New** → **Project**.
2. Import the `estateflow` repo.
3. Configure:
   | Field | Value |
   |-------|-------|
   | **Root Directory** | `web` |
   | **Framework Preset** | Next.js (auto-detected) |
   | **Build Command** | *(default)* `next build` |
4. **Environment Variables**:
   - `NEXT_PUBLIC_API_URL` = `https://estateflow-api.onrender.com/graphql`
     *(use your real Render URL + `/graphql`)*
   - *(optional, for Sentry)* `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_DSN`,
     and for source-map upload `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN`.
5. Click **Deploy**. You'll get a URL like `https://estateflow.vercel.app`.

That URL is what you put in your resume / LinkedIn.

---

## 3. Connect them

The backend already enables open CORS, so the Vercel frontend can call the Render API
out of the box. If you change the API URL later, update `NEXT_PUBLIC_API_URL` in Vercel
(Project → Settings → Environment Variables) and **Redeploy**.

Quick end-to-end check on the live site:
1. Open your Vercel URL → properties load from the API.
2. Open a property → **Demo login** → **Invest now**.
3. Open **Dashboard** → your investment appears.

---

## Optional: persistent data (Postgres on Render)

The demo stores data in memory (`server/src/data.js`), so investments reset when the
service restarts. To persist them:

1. Render → **New +** → **PostgreSQL** (Free) → copy the Internal Database URL.
2. Add a `DATABASE_URL` env var to the API service.
3. Replace the in-memory arrays in `server/src/data.js` with a Postgres client
   (e.g. `pg`), keeping the same functions so resolvers don't change.

---

## Troubleshooting

- **Web builds but shows "Could not load properties":** `NEXT_PUBLIC_API_URL` is wrong
  or the API is asleep. Open the `/health` URL to wake it, then refresh.
- **CORS error in the browser console:** make sure the frontend calls the `/graphql`
  path on the Render URL (not the root).
- **Render build fails on Node version:** the service uses Node ≥ 20 (declared in
  `server/package.json` → `engines`). Set `NODE_VERSION=20` in Render env if needed.
- **Mobile app:** Expo apps aren't web-deployed. Share them via `npx expo start` +
  Expo Go, or build with EAS. Point `extra.apiUrl` in `app.json` to your Render URL.
