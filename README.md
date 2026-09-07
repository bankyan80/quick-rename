# Quick Rename

Bulk file renaming directly in the browser. Files are processed locally on your device via the File System Access API; no file contents are uploaded to the server.

## Features

- Rename a folder's files with rule templates (pattern + numbering, find & replace, append/remove, case conversion, remove digits)
- Live preview before applying, with automatic conflict resolution (`name (1).ext`)
- ZIP fallback mode when the File System Access API is unavailable (e.g. Safari/Firefox)
- Anonymous, authenticated, and token-based quotas enforced server-side
- Google sign-in, DANA/QRIS token purchases, admin panel
- Indonesian UI
- Dark / light themes, compact / comfortable list density

## Tech Stack

- Next.js 16 (App Router, Turbopack) + React 19 + TypeScript
- Tailwind CSS 4
- Prisma + SQLite
- NextAuth v5 (Google OAuth, JWT session)
- zustand, @tanstack/react-virtual, jszip, lucide-react, vitest

## Getting Started

```bash
npm install
cp .env.example .env   # fill in your values
npx prisma generate
npx prisma db push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev          # development server
npm run build        # production build
npm run start        # start production build
npm run lint         # ESLint
npx tsc --noEmit     # typecheck
npx vitest run       # unit tests (rename engine)
npx prisma db push   # sync SQLite schema
```

## Environment Variables

| Variable | Default | Description |
| --- | --- | --- |
| `DATABASE_URL` | `file:./dev.db` | SQLite database location |
| `NEXTAUTH_URL` | `http://localhost:3000` | App base URL |
| `NEXTAUTH_SECRET` | — | Secret for auth/session encryption |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | — | Google OAuth credentials |
| `FREE_QUOTA` | `5` | Server-side quota for anonymous / authenticated free users (files per operation) |
| `DANA_PAYMENT_NAME` | — | Display name for DANA payment |
| `DANA_PAYMENT_NUMBER` | — | DANA phone number |
| `QRIS_IMAGE_URL` | — | QRIS image path/URL |
| `TOKEN_PRICE` | `50000` | Token price in Rupiah |
| `FILES_PER_TOKEN` | `100` | Files granted per token |
| `NEXT_PUBLIC_TOKEN_PRICE` | `50000` | Token price shown on the client |
| `ADMIN_EMAIL` | — | Email granted admin access |

Environments/deployments that need persistent storage or a managed DB should point `DATABASE_URL` at a hosted SQLite/Postgres-compatible Prisma datasource.

## Deployment

### Production database

Vercel/edge hosting has read-only filesystems, so local SQLite (`file:./dev.db`) only works for local development. For production:

1. Provision a hosted database (e.g. Neon, Vercel Postgres, or PlanetScale).
2. Use the production schema variant `prisma/schema.prod.prisma` (same models, `provider = "postgresql"`). Keep it in sync with `prisma/schema.prisma` when models change.
3. Set `DATABASE_URL` in the host (Vercel env vars + GitHub Actions secret).
4. Create the first migration once the production DB is reachable:

```bash
npx prisma migrate dev --schema prisma/schema.prod.prisma --name init
git add prisma/migrations
```

Migrations are deployed automatically on push to `main` by `.github/workflows/db-migrate.yml` (uses the `DATABASE_URL` GitHub secret against `prisma/schema.prod.prisma`). You can also run them manually with `npm run db:migrate`.

### Vercel

1. Push this repo to GitHub and import it into Vercel (framework auto-detected).
2. Configure environment variables (see table above) — `NEXTAUTH_URL` must be the production domain.
3. Add the Google OAuth authorized redirect URI: `https://<your-domain>/api/auth/callback/google`.
4. `prisma generate` runs automatically on install (`postinstall`); migrations are applied by the GitHub Action (or run `npm run db:migrate` once after first deploy).
5. The File System Access API requires HTTPS (Vercel provides it) and Chrome/Edge; other browsers automatically use the ZIP fallback.

## API Routes

- `POST /api/rename/consume` — server-side quota enforcement (authenticated or anonymous)
- `GET /api/quota` — current quota for session or anonymous id
- `POST /api/payment/orders`, `GET /api/payment/orders/:id` — token purchases
- `GET/POST /api/admin/*` — orders, users, settings (admin only)
- `GET /api/settings`, `GET /api/history` — public settings and rename history

## Testing

The rename engine is covered by unit tests in `tests/rename-engine.test.ts`. Run with `npx vitest run`.

## Legal

See `src/app/terms` and `src/app/privacy` for the Indonesian terms of service and privacy policy.