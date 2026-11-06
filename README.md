# EstateFlow

A fintech demo for **fractional real-estate investment** — browse properties, invest in fractions, and track a portfolio. Built as a portfolio project to showcase full-stack work across web and a shared GraphQL API.

> Original project. Not affiliated with, and not derived from, any proprietary or NDA-covered product. All code, data, and designs here are my own and generic to the real-estate / fintech domain.

## Stack
- **Web:** Next.js (App Router) · TypeScript · Tailwind CSS · TanStack Query
- **Mobile:** React Native (Expo) · expo-router · TypeScript — shares the same GraphQL API
- **Backend:** Node.js · Apollo Server (GraphQL) · JWT auth
- **Monitoring:** Sentry (backend, web, and mobile — all opt-in via DSN)
- **Tests:** backend test suite via Node's built-in test runner
- **Money handling:** all amounts are **integer minor units (cents)**, serialized as strings to avoid float precision loss
- **Planned:** i18n (en/ar), live deployment

## Features
- Property listings + detail pages (web and mobile)
- JWT authentication (register / login / demo login)
- Fractional "invest" flow with amount validation against a minimum
- Portfolio dashboard with totals and a simple allocation chart
- Clean, modular, scalable architecture — API, resolvers, and data layer separated

## Project structure
```
estateflow/
├── server/        # Node.js + Apollo GraphQL API
│   └── src/
│       ├── index.js           # Apollo + Express bootstrap
│       ├── schema.js          # GraphQL type definitions
│       ├── resolvers.js       # Query/Mutation resolvers
│       ├── resolvers.test.js  # Backend tests (node --test)
│       ├── auth.js            # JWT helpers + context
│       ├── sentry.js          # Opt-in Sentry init
│       └── data.js            # Seed data (in-memory store)
├── web/           # Next.js + TypeScript client
│   └── src/
│       ├── app/               # App Router pages
│       └── lib/               # GraphQL client + helpers
└── mobile/        # React Native (Expo) client
    ├── app/                   # expo-router screens
    └── lib/                   # GraphQL client + Sentry init
```

## Running locally

### 1. Backend
```bash
cd server
cp .env.example .env
npm install
npm run dev          # GraphQL at http://localhost:4000/graphql
```

### 2. Web
```bash
cd web
npm install
npm run dev          # App at http://localhost:3000
```

The web app expects the API at `http://localhost:4000/graphql` (configurable via `NEXT_PUBLIC_API_URL`).

### 3. Mobile (Expo)
```bash
cd mobile
npm install
npm start           # open in Expo Go / simulator
```
On a physical device, set `extra.apiUrl` in `app.json` to your machine's LAN IP
(e.g. `http://192.168.1.5:4000/graphql`) — `localhost` points at the phone itself.

### Tests
```bash
cd server
npm test            # Node's built-in test runner
```

### Sentry (optional)
Set a DSN to enable error monitoring — it stays a no-op without one:
- Backend: `SENTRY_DSN` in `server/.env`
- Web: `NEXT_PUBLIC_SENTRY_DSN` (browser) / `SENTRY_DSN` (server)
- Mobile: `extra.sentryDsn` in `mobile/app.json`

### Demo login
Use the **Demo login** button in the UI, or:
- email: `investor@estateflow.dev`
- password: `demo1234`

## Internationalization (English / العربية)

The web app ships with full **i18n and RTL** support:
- Language switcher in the header (English ↔ العربية)
- All screens translated; locale persisted in `localStorage`
- Document `dir` flips to `rtl` for Arabic — the whole layout mirrors
- Currency formatted per locale via `Intl.NumberFormat`

The mobile app carries the same dictionary (`mobile/lib/i18n.tsx`) and switches
RTL via React Native's `I18nManager` (takes effect after an app reload).

## Roadmap
- [x] React Native (Expo) client on the same API
- [x] Sentry error monitoring (backend, web, mobile)
- [x] Backend tests on key flows
- [x] i18n + RTL (English / Arabic) — web and mobile
- [ ] Persist to Postgres / SQLite (swap the in-memory store)
- [ ] Live deployment (Vercel + Render)

## License
MIT
