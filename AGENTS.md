# Repository Guidelines

PropAI Connect combines a Vite React client with an Express/Supabase bridge. Refer to this guide before contributing changes or opening pull requests.

## Project Structure & Module Organization
- `src/` hosts TypeScript code: UI in `components/`, routed views in `pages/`, dashboard flows in `app/`, and shared logic in `contexts/`, `hooks/`, `lib/`, `services/`.
- Static assets live in `public/`; build output lands in `dist/` and should stay untracked.
- `server.cjs` plus `crypto-utils.cjs` implement mail delivery and secure Supabase access through environment variables.
- Migrations and edge functions reside in `supabase/`; run CLI tasks from the repo root so environments stay aligned.

## Build, Test, and Development Commands
- Install dependencies with `npm install`; the npm lockfile is authoritative.
- `npm run dev` serves Vite on port 8080 with the `@/*` import alias.
- `npm run build`, `npm run preview`, and `npm run lint` must pass before requesting review.
- Start the service bridge with `node server.cjs` after exporting the required env vars.
- Apply Supabase changes with `npx supabase login`, `npx supabase link`, and `npx supabase db push` (see `commands.md`).

## Coding Style & Naming Conventions
- Use TypeScript and functional React components with 2-space indentation.
- Components use `PascalCase`, hooks/utilities `camelCase`, and route files mirror URL slugs.
- Prefer the `@/...` alias over deep relatives and extract reusable code into `lib/` or `services/`.
- Tailwind tokens defined in `tailwind.config.ts` are the preferred styling surface; avoid ad-hoc CSS.

## Testing Guidelines
- Run `npm run lint`, `npm run build`, and manual smoke tests before pushing.
- Add automated coverage for risky logic: colocate `*.test.tsx` beside components or under `src/__tests__/` and document any new npm script.
- For schema changes, dry-run migrations locally and record rollback steps in the PR description.

## Commit & Pull Request Guidelines
- Write imperative, concise subjects (`fix: harden auth guard`) capped at 72 characters; expand context in the body when needed.
- Keep commits focused; separate schema updates from UI work where practical.
- PRs should explain the change, list env vars or migrations touched, and attach screenshots/GIFs for UI updates.
- Link issues or tasks and flag follow-up work so the release log stays accurate.

## Supabase & Server Configuration
- Required env vars include `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and mail credentials; store them in local `.env` files, never in Git.
- Restrict access with `CLIENT_ORIGINS` before deploying and keep staging/production lists in sync.
