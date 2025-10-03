# Dream Image Generator — Active Context

Updated: 2025-10-02

## Current focus
Stabilize Supabase SSR integration and path aliases, ensure env configuration, and keep dev server healthy.
- Canonicalize Supabase server client location and imports.
- Resolve missing module errors for @supabase/ssr and @supabase/supabase-js.
- Verify middleware session management and route protection.
- Document env variables and operational notes in the Memory Bank.

## Recent changes
- Dependencies
  - Installed @supabase/ssr and @supabase/supabase-js to satisfy SSR helpers and peer deps.
- Supabase utilities
  - Created canonical server client at: utils/supabase/server.ts (SSO cookie-aware createServerClient).
  - Existing file app/utils/supabase/server.ts still present (duplicate). Current imports use '@/utils/supabase/server'.
  - Client util exists at: utils/supabase/client.ts using createBrowserClient from @supabase/ssr.
  - Middleware util: utils/supabase/middleware.ts implements updateSession with NextResponse cookies.
- Path alias & imports
  - tsconfig.json: baseUrl '.' and paths { "@/*": ["./*"] }.
  - app/api/generate/route.ts now resolves import { createClient } from '@/utils/supabase/server' via the new utils/ path.
- Env configuration
  - .env.local contains:
    - NEXT_PUBLIC_SUPABASE_URL
    - NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    - NEXT_PUBLIC_GEMINI_API_KEY (fallback to GENAI_API_KEY preferred)
- Dev server
  - next dev runs; initial errors fixed (module not found). Middleware errors resolved after env was set.
  - Next lockfile reported SWC patch; Next.js patched at runtime and advised running npm install (already done during package installs).

## Decisions and conventions
- Canonical Supabase server client path: '@/utils/supabase/server'
  - Prefer this single source of truth; plan to remove/redirect the duplicate in app/utils/.
- Use @supabase/ssr helpers for both server (createServerClient) and browser (createBrowserClient) with proper cookie wiring.
- Environment variables
  - Supabase: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    - Note: Standard naming is often NEXT_PUBLIC_SUPABASE_ANON_KEY; this project uses PUBLISHABLE_KEY consistently.
  - Gemini: Prefer GENAI_API_KEY on server; allow NEXT_PUBLIC_GEMINI_API_KEY as dev fallback.
- Middleware route protection: use updateSession and protect only specific routes (e.g., '/api/generate') via protectedRoutes list.
- Imports: Always use '@/' alias from project root.

## Patterns and preferences
- Separation: Client for UX and rendering; Server for secrets and API calls (Gemini + Supabase).
- SSR auth/session: Cookies bridged via @supabase/ssr helpers in middleware and server components.
- Defensive coding: Input validation in API route; graceful storage upload failure handling without blocking response.
- Consistency: All Supabase helpers import from '@/utils/supabase/*'.

## Risks and constraints
- Duplicate server client files:
  - app/utils/supabase/server.ts (legacy) and utils/supabase/server.ts (canonical). Risk of divergent behavior.
- SWC lockfile patch warnings:
  - Next suggested running npm install to ensure swc binaries are available (performed during dependency installs).
- Security: Public keys in NEXT_PUBLIC_*; ensure production secrets use server-side only vars where applicable.
- Operational: Storage bucket 'generation_images' must exist with appropriate public access for getPublicUrl; migrations may be required.

## Next steps
- Deduplicate Supabase server client file:
  - Remove app/utils/supabase/server.ts or have it re-export from utils/supabase/server.ts to avoid drift.
- Documentation updates:
  - README/env docs: Clarify Supabase env names and preferred GENAI_API_KEY usage.
- Verify storage prerequisites:
  - Ensure 'generation_images' bucket exists; validate RLS policies and public URL access as required.
- Testing and reliability:
  - Add tests around API validation and middleware session refresh.
  - Consider rate limiting/backoff for Gemini calls and structured logging.
- Optional cleanup:
  - Address npm audit vulnerabilities as time permits.
