# SimpleHermes

Subscription SaaS that lets users deploy a personal AI agent on Telegram in ~5 minutes. Provisions containerized Hermes agents on Blaxel sandboxes. Users subscribe, complete a setup wizard, and get a live Telegram bot powered by Claude 3.5 Sonnet.

## Development Commands

- `npm run dev` — Start dev server (Next.js with Turbopack)
- `npm run build` — Production build
- `npm run start` — Start production server
- `npm run lint` — Run ESLint

## Project Structure

```
src/app/              → App Router pages and API routes
src/app/api/          → REST endpoints (checkout, sandbox/*, telegram/*, webhooks/*)
src/features/         → Feature modules (landing, dashboard, telegram-setup)
src/components/       → Shared UI components (auth, dashboard)
src/lib/              → Utilities (blaxel, dodo, encryption, supabase/)
src/stores/           → Zustand stores (auth, sandbox, wizard)
src/types/            → TypeScript type definitions
supabase/migrations/  → SQL schema with RLS policies
hermes-sandbox/       → Docker image for the Hermes agent (Dockerfile + blaxel.toml)
```

## Tech Stack

- Next.js 16 (App Router), React 19, TypeScript (strict mode)
- Tailwind CSS 4 (PostCSS plugin), Zustand 5, Hugeicons
- Supabase (auth + PostgreSQL + Row-Level Security)
- Blaxel Core (sandbox infrastructure)
- DodoPayments (subscription billing)
- AES-256-GCM encryption, standardwebhooks (signature verification)

## Code Style and Patterns

- **Path alias**: `@/*` maps to `./src/*`
- **Feature-based organization**: domain logic in `src/features/<domain>/components/`, shared UI in `src/components/`
- **API routes**: export named HTTP method handlers (GET, POST). Auth via `createClient()` then `supabase.auth.getUser()`. Use `createAdminClient()` to bypass RLS for system operations.
- **Supabase clients**:
  - `lib/supabase/server.ts` — Server Components and API routes (respects RLS)
  - `lib/supabase/client.ts` — Client Components (browser)
  - `lib/supabase/admin.ts` — Service-role client (bypasses RLS, server-only)
  - `lib/supabase/middleware.ts` — Session refresh in Next.js middleware
- **Zustand stores**: `"use client"` directive. Persistent stores use `persist` middleware with `partialize`.
- **Icons**: Hugeicons (`@hugeicons/core-free-icons`) only. Do not use lucide-react.
- **Styling**: Tailwind utility classes. Use `cn()` from tailwind-merge + clsx for conditional classes.
- **No Server Actions**: all mutations go through API routes.

## Architecture and Security Constraints

- **Encrypted secrets**: Bot tokens encrypted with AES-256-GCM before DB storage. Format: `iv:ciphertext:authTag` (base64). Use `encrypt()`/`decrypt()` from `lib/encryption.ts`.
- **RLS on all tables**: profiles, subscriptions, sandboxes, telegram_configs. Users can only read/write their own data.
- **Admin client for system writes**: subscription and sandbox creation in API routes use the service-role client.
- **Webhook routes skip auth middleware**: `/api/webhooks/*` paths are excluded from the middleware matcher. They verify signatures independently via standardwebhooks.
- **Sandbox lifecycle**: provision → configure (inject env vars + start Hermes) → running. Client polls `/api/sandbox/status` every 30 seconds.
- **One sandbox per user**: provisioning checks for existing non-deleted sandbox before creating.
- **Environment variables**: only `NEXT_PUBLIC_*` vars are client-accessible. Never expose server-only keys.

## Important Rules

- Do what is asked; nothing more, nothing less.
- Prefer editing existing files over creating new ones.
- Never store sensitive values (API keys, tokens, secrets) in source code.
- Always use the appropriate Supabase client — server for user-scoped queries, admin for system operations.
- Never disable or weaken RLS policies.
