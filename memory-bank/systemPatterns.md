# Dream Image Generator — System Architecture & Patterns

## High-level architecture
- Next.js 14 App Router
  - UI: `app/page.tsx` and reusable components (e.g., `components/ImageUploader.tsx`)
  - API: `app/api/generate/route.ts` (server-side integration with Google Gemini via `@google/genai`)
  - Middleware: `middleware.ts` using `utils/supabase/middleware.ts` for session refresh and route protection
- Supabase integration
  - Server client: `utils/supabase/server.ts` (cookie-aware `createServerClient` from `@supabase/ssr`)
  - Browser client: `utils/supabase/client.ts` (`createBrowserClient` from `@supabase/ssr`)
  - Session refresh: `utils/supabase/middleware.ts` wires Next cookies for SSR, protects selected routes
  - Storage: Outputs and (optionally) input images uploaded to Supabase Storage bucket `generation_images`
  - Database: Prompt metadata (`prompt`) and images mapping (`prompt_images`)
- Path aliases
  - `@/*` resolves from project root (see `tsconfig.json`)
  - Canonical import for server client: `import { createClient } from '@/utils/supabase/server'`

## Data flow
1) Client collects prompt and optional images (as base64 data URLs)
2) Client POSTs to `/api/generate` with JSON:
   - `{ prompt: string, images?: Array<{ mimeType: string; data: base64string }> }`
3) Server validates body, constructs Gemini `contents` parts:
   - Text part: `{ text: prompt }`
   - Image parts: `{ inlineData: { mimeType, data } }`
4) Server calls `ai.models.generateContent({ model: 'gemini-2.5-flash-image-preview', contents })`
5) Server normalizes Gemini response to `parts[]`:
   - `{ type: 'text', text }`
   - `{ type: 'image', mimeType, data }`
6) Post-generation persistence (best effort, when `user` is present):
   - Insert a new row into `prompt` with `user_id` and `prompt_text`
   - Upload input images (if any) to storage at `generation_images/{userId}/{promptId}/input_*`
   - Upload output images to storage at `generation_images/{userId}/{promptId}/output_*`
   - Insert rows in `prompt_images` for uploaded images (type `'input' | 'output'`) with public URLs

## Request/Response contract
- Request (JSON):
  - `prompt: string` (required)
  - `images?: Array<{ mimeType: string; data: base64string }>`
- Server validation (in `app/api/generate/route.ts`):
  - `MAX_IMAGES = 5`
  - `MAX_IMAGE_BYTES ≈ 5MB` per image (approx via base64 length calculation)
- Response (JSON):
  - `parts: Array<
      { type: 'text'; text: string } |
      { type: 'image'; mimeType: string; data: base64string }
    >`
  - `debug?: { candidates: boolean }`
- Error responses:
  - `400` for invalid input (missing/invalid prompt, too many/large images)
  - `500` for server-side failures (missing API key, upstream errors)
  - Body: `{ error: string, detail?: { message, status, details } }`

## Supabase SSR integration patterns
- Server Components / API routes
  - `utils/supabase/server.ts`:
    - Uses `createServerClient(url, key, { cookies: { getAll, setAll } })`
    - Bridges Next cookies via `next/headers` cookies store
    - Export: `export async function createClient()`
- Browser
  - `utils/supabase/client.ts`:
    - Uses `createBrowserClient(url, key)` from `@supabase/ssr`
    - Relies on `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- Middleware
  - `utils/supabase/middleware.ts`:
    - `updateSession(request: NextRequest)` creates server client with cookie bridge
    - Refreshes session cookies by calling `supabase.auth.getUser()`
    - Protects specific routes via `protectedRoutes` (e.g., `/api/generate`)
  - `middleware.ts`:
    - Calls `updateSession(request)`
    - Uses `matcher` to exclude Next internals and static assets

## Environment configuration
- Supabase (required for auth/storage/db):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (anon key)
- Gemini:
  - Preferred server-side: `GENAI_API_KEY`
  - Dev fallback: `NEXT_PUBLIC_GEMINI_API_KEY` (avoid in prod)
- Notes:
  - Ensure storage bucket `generation_images` exists and has appropriate RLS/policies for expected access patterns

## Key patterns
- Separation of concerns:
  - Client handles capture, preview, rendering, and UX.
  - Server handles secret management, Gemini API calls, and best-effort persistence to Supabase.
- Defensive coding:
  - Explicit input validation and hard limits (count and size).
  - Structured error handling with informative payloads.
- Extensibility:
  - `parts[]` abstraction supports mixed multimodal outputs (future: additional content types).
- Observability:
  - Minimal logging (`model` name, parts count, and key events); can expand to structured logs and tracing.

## Security considerations
- Prefer server-side `GENAI_API_KEY` for production (avoid exposing public keys).
- Validate all inputs; enforce strict limits to prevent abuse and resource exhaustion.
- Consider platform request size limits; for large assets, move to signed uploads and pass URLs.

## Known constraints
- Next.js App Router route handlers do not support bodyParser-size overrides.
- Approximate base64 size check is used for server-side validation.
- Next.js SWC binaries may require a lockfile patch; follow Next’s guidance to run `npm install` when prompted.

## Error handling strategy
- Return 400 for client mistakes with actionable messages.
- Wrap upstream calls in try/catch; return 500 with sanitized details.
- Keep logs server-side; avoid leaking sensitive info in responses.

## Performance considerations
- Limit number/size of images to control payload size and latency.
- Use lightweight UI states and avoid unnecessary re-renders.
- Consider streaming responses (when supported) to improve perceived latency.

## Future evolutions
- Storage-backed uploads with signed URLs to handle large images efficiently end-to-end.
- Centralize model and generation config; make env-driven.
- Add rate limiting/backoff to handle spikes and upstream throttling.
- Introduce telemetry (structured logs/metrics) and request IDs for traceability.
