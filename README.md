# NUBCC Portal Clone — Demo

A **demo-only** recreation of the public NUB CSE Computer Club login pages and three role-based portals:

- **Member portal** — membership card, event registration, courses, certificates, announcements, profile.
- **CR portal** — class representative profile, classmate roster/attendance, events, announcements.
- **Executive portal** — application review, member/CR directories, event management, announcements, demo data reset.

> ⚠️ **This is not the live NUBCC website.** It is an unofficial development clone. It does **not** connect to nubcc.club, does **not** send email, does **not** process payments, and must **never** receive real credentials or personal data. Only the advertised sample accounts can sign in.

## Demo accounts

| Portal | Login | Password |
| --- | --- | --- |
| Member | `NUB-2026-001` | `Member@123` |
| Class Representative | `cr@demo.nubcc.test` | `Cr@12345` |
| Executive | `executive@demo.nubcc.test` | `Exec@12345` |

## Routes

### Public
- `/` — home
- `/events`, `/events/:id`
- `/executives`, `/class-representatives`
- `/contact`
- `/member/login`, `/cr/login`, `/executive/login`
- `/member/register`, `/cr/register`, `/executive/register`
- `/member/forgot-password`, `/cr/forgot-password`, `/executive/forgot-password`

### Protected portals
- `/member` — overview, events, registrations, courses, certificates, announcements, profile, settings
- `/cr` — overview, classmates, events, announcements, profile, settings
- `/executive` — overview, applications, members, CR directory, manage events, announcements, profile, settings

## Tech stack

- React 19 + TypeScript + Vite
- Express 5 API with session-cookie auth
- SQLite via Node's built-in `node:sqlite` (Node ≥ 22.13)
- Zod validation, bcryptjs demo password hashes, lucide-react icons

## Run locally

```bash
npm install
npm run dev
# open http://localhost:3000
```

Production build:

```bash
npm run build
npm start
```

Reseed the demo database:

```bash
npm run seed
```

Run the API smoke test against a running dev server:

```bash
npm run smoke
```

The SQLite database is created at `data/nubcc-demo.sqlite` (ignored by git). Set `PORT`, `SESSION_SECRET`, `DATA_DIR`, or `DB_PATH` via environment variables if needed.

## Safety notes

- Login accepts **only** the three sample accounts above. Any other identifier is rejected before password comparison.
- Registration/application forms do **not** accept passwords, payment details, or photo uploads. They create fictional pending applications for the executive review demo.
- All personal data in the seed is fictional. The public directory uses demo records, not scraped live member data.
- Mutating API requests are same-origin guarded and rate-limited. Sessions use `HttpOnly` / `SameSite=Lax` cookies.
- The app sets `noindex` and displays persistent demo warnings.

## GitHub

This project lives on branch `arena/65d16222-server-login-page` in `Sharif1156/Server_login-page`.
