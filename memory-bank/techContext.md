# Dream Image Generator — Tech Context

## Stack
- Framework: Next.js 14.2.8 (App Router)
- Language & Runtime: TypeScript on Node.js 18+
- UI: React 18.3.1, Tailwind CSS, PostCSS
- AI SDKs:
  - @google/genai ^1.20.0 (used server-side in API route)
  - @google/generative-ai ^0.24.1 (present; not used in server route)
- Tooling & Config:
  - tailwind.config.js
  - postcss.config.js
  - tsconfig.json

## Key modules and files
- UI
  - app/page.tsx — main page
  - components/ImageUploader.tsx — prompt and image input UI
- API
  - app/api/generate/route.ts — server integration with Google Gemini via @google/genai

## Environment configuration
- Required
  - GENAI_API_KEY — preferred server-side API key for Gemini (recommended for production)
- Optional (legacy/fallback for local/dev)
  - NEXT_PUBLIC_GEMINI_API_KEY — public fallback; avoid exposing in production
- Local development
  - Place variables in .env.local (not committed)

## Model selection and invocation
- Current model: gemini-2.5-flash-image-preview
- Invocation pattern (server):
  - Construct contents: text part for prompt, image parts as inlineData (mimeType, base64 data)
  - Call ai.models.generateContent({ model, contents })
  - Normalize output to parts[]: images and/or text

## Contracts and limits
- Request body JSON:
  - prompt: string (required)
  - images?: Array<{ mimeType: string; data: base64string }>
- Server-side validation (app/api/generate/route.ts):
  - MAX_IMAGES = 5
  - MAX_IMAGE_BYTES ≈ 5MB per image (approx from base64 length)
- Error semantics:
  - 400 — client input errors (missing/invalid prompt, too many/large images)
  - 500 — server/upstream errors (missing key, Gemini call failure)
  - Body includes error and optional detail for diagnostics

## Development workflow
- Install: npm install (or npm ci)
- Run dev: npm run dev
- Build: npm run build
- Start (prod): npm start
- Lint/format: Consider adding ESLint/Prettier (not observed in repo yet)

## Security posture
- Keep API keys server-side; prefer GENAI_API_KEY
- Validate and bound payload sizes; never trust client input
- Avoid logging secrets; sanitize error details in responses

## Deployment considerations
- Next.js App Router route handlers do not support bodyParser size overrides
  - For large images: prefer signed uploads to storage (e.g., GCS/S3) and pass URLs
  - Ensure hosting platform allows sufficient request size if using base64 payloads
- Node 18+ required for runtime compatibility

## Observability and reliability
- Minimal console logging in place (model name, parts count, error contexts)
- Future:
  - Structured logs and request IDs
  - Basic rate limiting/backoff for Gemini errors (429/5xx)
  - Metrics (latency, error rates, payload sizes)

## Testing strategy (proposed)
- Unit tests for request validation logic (prompt, count, size)
- Integration tests for API happy-path (mock SDK) and error-paths
- UI tests for upload/preview flows and error states

## Future technical directions
- Streaming responses (if supported) to improve perceived latency
- Centralize model/config via env and typed config module
- Storage-backed uploads for large assets
- Client-side validations aligned to server limits (file type/size/count)
- Add ESLint/Prettier and CI checks for consistency
