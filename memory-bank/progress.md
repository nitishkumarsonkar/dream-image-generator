# Dream Image Generator — Progress

Updated: 2025-10-02

## What works (verified in code)
- Server API: `app/api/generate/route.ts`
  - Validates inputs: required `prompt`, optional `images[]` with limits.
  - Constructs Gemini `contents` (text + inlineData for images).
  - Calls `@google/genai` with model `gemini-2.5-flash-image-preview`.
  - Normalizes response into `parts[]` (text and/or image).
  - Structured error handling with diagnostic details on 500.

- Client UI: `components/ImageUploader.tsx`
  - In-textarea controls:
    - “+” circular button (bottom-left) opens hidden file picker.
    - Right-pointing arrow button (bottom-right) submits prompt.
  - Thumbnails inside the prompt box (top strip), with per-thumb remove (×).
  - Keyboard: Enter submits; Shift+Enter inserts a newline.
  - Client-side limits: enforces `maxImages` (default 5) across selections; per-file size ≤ `maxSizeMB` (default 5MB).
  - Disabled states: add images and submit buttons disable when submitting/invalid.
  - Accessibility: aria-labels for controls; role attributes for status/error where applicable.

- Dark Mode with Toggle
  - Tailwind configured with class strategy: `darkMode: 'class'` (tailwind.config.js).
  - ThemeToggle component (localStorage persisted; system preference fallback) toggles `document.documentElement.classList('dark')`.
  - Global background:
    - Light: subtle light gradient (globals.css).
    - Dark: dedicated dark gradient and color-scheme override (globals.css).
  - Themed UI:
    - `app/layout.tsx`: body pairs (bg/text) for both themes.
    - `app/page.tsx`: header subtitle, loading/error/response boxes, gallery and thumbnails updated with dark variants.
    - `components/ImageUploader.tsx`: container card, textarea, thumbnails/borders, buttons, hint/error text themed via `dark:` classes.

- Page utilities: `app/page.tsx`
  - Copy Prompt button.
  - Clear Results button.
  - Robust loading/error handling with `aria-live`.

- Supabase SSR integration
  - Installed deps: `@supabase/ssr`, `@supabase/supabase-js` (peer dep satisfied).
  - Server client: `utils/supabase/server.ts` (cookie-aware `createServerClient` via `next/headers`).
  - Re-export shim: `app/utils/supabase/server.ts` re-exports from the canonical `utils` path to avoid duplication/drift.
  - Browser client: `utils/supabase/client.ts` uses `createBrowserClient` from `@supabase/ssr`.
  - Middleware: `utils/supabase/middleware.ts` refreshes session and protects `/api/generate`; root `middleware.ts` imports `NextRequest` type and calls `updateSession`.
  - Path aliases: `tsconfig.json` with `@/*` from project root; imports now resolve correctly.

- Build/runtime fixes
  - Resolved module-not-found for `@supabase/ssr` and `@supabase/supabase-js` by installing deps.
  - Added `base64-arraybuffer` for server-side `decode` usage in storage uploads.
  - Addressed alias resolution by adding canonical server client in `utils/` and re-export file in `app/`.

## What remains
- Theming polish:
  - Consider a no-flash theme snippet to avoid FOUC before React hydration.
- Documentation:
  - Align README and .env guidance to emphasize `GENAI_API_KEY` (server-side) as canonical and `NEXT_PUBLIC_GEMINI_API_KEY` as dev fallback.
  - Document client UI limits (max images, max size) and keyboard behavior.
- Reliability & ops:
  - Introduce basic rate limiting/backoff on 429/5xx.
  - Add structured logging and request IDs.
- Code quality:
  - Add ESLint/Prettier configuration and CI checks.
- Testing:
  - Unit tests for API validation.
  - Integration tests for server responses (mock SDK).
  - UI tests for prompt submission, thumbnail removal, and theme toggle.
- Large uploads:
  - Explore storage-backed uploads (GCS/S3 signed URLs) for large images to avoid route body size limits.
- Supabase storage:
  - Ensure bucket `generation_images` exists with correct policies and public URL access as expected by `getPublicUrl`.

## Status
- Core functionality implemented and compiling end-to-end.
- Supabase SSR wiring stabilized; canonical server client now at `utils/supabase/server.ts` with `app/` re-export to keep docs/examples compatible.
- Dev server runs; `/api/generate` executes and reaches Gemini.

## Known issues/risks
- Gemini API key invalid in local env:
  - Observed 400 INVALID_ARGUMENT from `@google/genai` indicating an invalid API key.
  - Action: add a valid `GENAI_API_KEY` to `.env.local` (preferred) or update `NEXT_PUBLIC_GEMINI_API_KEY` for dev, then restart `npm run dev`.
- Next.js SWC warnings:
  - Lockfile patch messages observed; `npm install` performed during dependency installs.
- Next.js App Router request size limits may reject large base64 images on certain hosts.
- Initial theme FOUC possible before ThemeToggle applies persisted preference.
- Upstream rate limits and transient failures from Gemini API.

## Next steps (near-term)
1. Add no-flash theme initialization snippet to apply `dark` class pre-hydration.
2. Update README/.env docs to reflect canonical env var usage (`GENAI_API_KEY`) and client-side limits.
3. Add ESLint/Prettier and CI.
4. Implement basic rate limiting/backoff and structured logs.
5. Add tests for API and UI flows.
6. Verify Supabase Storage bucket `generation_images` and RLS/policies; create if missing.
