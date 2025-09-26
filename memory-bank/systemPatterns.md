# Dream Image Generator — System Architecture & Patterns

## High-level architecture
- Next.js 14 App Router
  - UI: `app/page.tsx` and reusable components (e.g., `components/ImageUploader.tsx`)
  - API: `app/api/generate/route.ts` (server-side integration with Google Gemini via `@google/genai`)
- Data flow:
  1) Client collects prompt and optional images (as base64 data URLs)
  2) Client POSTs to `/api/generate` with JSON `{ prompt: string, images?: Array<{ mimeType: string; data: base64string }> }`
  3) Server validates body, constructs Gemini `contents` parts:
     - Text part: `{ text: prompt }`
     - Image parts: `{ inlineData: { mimeType, data } }`
  4) Server calls `ai.models.generateContent({ model: 'gemini-2.5-flash-image-preview', contents })`
  5) Server normalizes Gemini response to `parts[]`:
     - `{ type: 'text', text }`
     - `{ type: 'image', mimeType, data }`
  6) Client renders parts (image previews and/or text) and offers download/share

## Request/Response contract
- Request (JSON):
  - `prompt: string` (required)
  - `images?: Array<{ mimeType: string; data: base64string }>`
- Server validation (in `route.ts`):
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

## Key patterns
- Separation of concerns:
  - Client handles capture, preview, rendering, and UX.
  - Server handles secret management and the Gemini API call.
- Defensive coding:
  - Explicit input validation and hard limits (count and size).
  - Structured error handling with informative payloads.
- Extensibility:
  - `parts[]` abstraction supports mixed multimodal outputs (future: additional content types).
- Observability:
  - Minimal logging (`model` name, parts count); can expand to structured logs and tracing.

## Security considerations
- Prefer server-side `GENAI_API_KEY` for production (avoid exposing public keys).
- Validate all inputs; enforce strict limits to prevent abuse and resource exhaustion.
- Consider platform request size limits; for large assets, move to signed uploads and pass URLs.

## Known constraints
- Next.js App Router route handlers do not support bodyParser-size overrides.
- Approximate base64 size check is used for server-side validation.

## Error handling strategy
- Return 400 for client mistakes with actionable messages.
- Wrap upstream calls in try/catch; return 500 with sanitized details.
- Keep logs server-side; avoid leaking sensitive info in responses.

## Performance considerations
- Limit number/size of images to control payload size and latency.
- Use lightweight UI states and avoid unnecessary re-renders.
- Consider streaming responses (when supported) to improve perceived latency.

## Future evolutions
- Storage-backed uploads with signed URLs to handle large images efficiently.
- Centralize model and generation config; make env-driven.
- Add rate limiting/backoff to handle spikes and upstream throttling.
- Introduce telemetry (structured logs/metrics) and request IDs for traceability.
