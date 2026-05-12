# FILM ILEB LUO

A premium video streaming platform for movies, TV dramas, anime, and variety shows, with a full admin dashboard for content and user management.

## Run & Operate

- `PORT=26109 BASE_PATH=/ pnpm --filter @workspace/film-ileb-luo run dev` — run the frontend dev server (port 26109)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19, Vite, Tailwind CSS v4, Wouter (routing), TanStack Query v5
- UI: Shadcn/UI (Radix), Framer Motion, Lucide React, Embla Carousel
- Backend/DB: Firebase (Firestore, Auth, Storage)
- Video: @mux/mux-player-react

## Where things live

- `artifacts/film-ileb-luo/src/` — all frontend source code
- `artifacts/film-ileb-luo/src/lib/firebase.ts` — Firebase initialization
- `artifacts/film-ileb-luo/src/lib/db.ts` — all Firestore data operations
- `artifacts/film-ileb-luo/src/context/AppContext.tsx` — global app state & auth
- `artifacts/film-ileb-luo/src/pages/` — page components (user-facing + admin)
- `artifacts/film-ileb-luo/src/components/` — shared UI components

## Architecture decisions

- Firebase is used as the full backend (Firestore for data, Firebase Auth for login, Storage for uploads)
- Admin access is controlled via `isAdmin` flag on the user document in Firestore
- Watch history is stored in localStorage (not Firestore) for performance
- The app is purely client-side (no Express server needed for the frontend)

## Product

- Users can browse and watch movies, TV dramas, anime, variety shows, and live content
- VIP subscription system with weekly/monthly/quarterly/yearly plans
- Login via email/phone or Google account
- Admin panel at `/admin` for managing content, users, subscriptions, and site settings

## User preferences

- App is deployed on port 26109 with BASE_PATH=/

## Gotchas

- Vite config requires PORT and BASE_PATH env vars to be set before starting
- Firebase client config (API key, project ID, etc.) is intentionally public — security is enforced via Firebase Security Rules
- post-merge.sh runs `pnpm --filter db push` which requires DATABASE_URL — this can be skipped if not using the Drizzle/Postgres layer
