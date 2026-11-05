# Nafi IT Login & Portals — Focused Demo

A focused, dark-themed demo inspired by the Nafi IT Computer Club sign-in experience.

**Scope:** homepage + login/registration/forgot-password pages + three protected portals. No extra public content pages.

> ⚠️ Nafi IT login and portal demo. No real emails, payments, uploads, or credentials. Only the sample accounts below can sign in.

## Demo accounts

| Portal | Login | Password |
| --- | --- | --- |
| Member | `NAFIIT-2026-001` | set via `NAFIIT_MEMBER_PASSWORD` |
| Class Representative | `cr@demo.nafiit.test` | set via `NAFIIT_CR_PASSWORD` |
| Executive | `executive@demo.nafiit.test` | set via `NAFIIT_EXECUTIVE_PASSWORD` |

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

## Account passwords

Passwords are not stored in this repository. Set these variables before running `npm run seed` or `npm start` for the first time:

- `NAFIIT_MEMBER_PASSWORD`
- `NAFIIT_CR_PASSWORD`
- `NAFIIT_EXECUTIVE_PASSWORD`

Each must be at least 8 characters. Keep them in a password manager. If you forget one, set a new value and run `npm run seed` to reset the database accounts.
