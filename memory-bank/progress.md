# Dream Image Generator — Progress

Updated: 2025-09-26

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

## What remains
- Theming polish:
  - Consider a no-flash theme snippet to avoid FOUC before React hydration.
- Documentation:
  - Align README and .env guidance to emphasize `GENAI_API_KEY` as canonical (server-side).
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

## Status
- Core functionality implemented and working end-to-end.
- Dark mode toggle integrated; UI themed for both light and dark modes.
- Memory Bank updated (activeContext, progress) to reflect latest architecture and UI decisions.

## Known issues/risks
- Next.js App Router request size limits may reject large base64 images on certain hosts.
- Initial theme FOUC possible before ThemeToggle applies persisted preference.
- Upstream rate limits and transient failures from Gemini API.

## Next steps (near-term)
1. Add no-flash theme initialization snippet to apply `dark` class pre-hydration.
2. Update README/.env docs to reflect canonical env var usage and client-side limits.
3. Add ESLint/Prettier and CI.
4. Implement basic rate limiting/backoff and structured logs.
5. Add tests for API and UI flows.
6. Evaluate signed uploads for large images.
