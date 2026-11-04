# NUBCC Login & Portals — Focused Demo

A focused, dark-themed demo inspired by the NUB CSE Computer Club sign-in experience.

**Scope:** homepage + login/registration/forgot-password pages + three protected portals. No extra public content pages.

> ⚠️ Unofficial demo clone. Not connected to nubcc.club. No real emails, payments, uploads, or credentials. Only the sample accounts below can sign in.

## Demo accounts

| Portal | Login | Password |
| --- | --- | --- |
| Member | `NUB-2026-001` | `Member@123` |
| Class Representative | `cr@demo.nubcc.test` | `Cr@12345` |
| Executive | `executive@demo.nubcc.test` | `Exec@12345` |

On each login page, expand **Demo access** and click **Use demo account**.

## Included routes

### Public
- `/` — homepage / portal chooser
- `/member/login`, `/cr/login`, `/executive/login`
- `/member/register`, `/cr/register`, `/executive/register`
- `/member/forgot-password`, `/cr/forgot-password`, `/executive/forgot-password`

### Protected portals
- `/member` — overview, events, registrations, courses, certificates, announcements, profile, settings
- `/cr` — overview, classmates/attendance, events, announcements, profile, settings
- `/executive` — overview, applications, members, CR directory, manage events, announcements, profile, settings

Old public content routes (`/events`, `/executives`, `/class-representatives`, `/contact`) redirect back to the homepage.

## Run locally

```bash
npm install
npm run dev
# open http://localhost:3000
```

Production:

```bash
npm run build
npm start
```

Utilities:

```bash
npm run typecheck
npm run smoke   # API smoke test against a running dev server
npm run seed    # reset demo database
```

## Stack

React 19 + TypeScript + Vite, Express 5, SQLite via `node:sqlite`, Zod, session-cookie auth.

## Safety

- Login accepts only the three advertised sample accounts.
- Registration forms do not accept passwords or payment details.
- All seed data is fictional.
- Persistent demo notices and `noindex`.

## GitHub

Active branch: `arena/b3dc877a-server-login-page` in `Sharif1156/Server_login-page`.
