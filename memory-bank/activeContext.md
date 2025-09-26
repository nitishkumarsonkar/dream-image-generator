# Dream Image Generator — Active Context

Updated: 2025-09-26

## Current focus
Enhance the UI/UX and add a dark mode toggle, while keeping client/server responsibilities clean and aligned with limits and security guidance.

## Recent changes
- UI (components/ImageUploader.tsx)
  - Replaced external buttons with in-textarea controls:
    - Left: circular “+” button opens hidden file picker
    - Right: circular horizontal arrow submits the prompt
  - Thumbnails: show inside the prompt container at the top, with per-thumb remove (×)
  - Keyboard: Enter submits prompt; Shift+Enter inserts newline
  - Client-side limits: maxImages (5) enforced across selections; per-file size (≤5MB)
  - Disabled states: image add and submit buttons disable while submitting/invalid
  - Accessibility: aria-labels, tooltips, and focus-friendly controls
  - Dark mode styles: textarea, buttons, borders, hints, and thumbnails themed via Tailwind dark variants

- Page (app/page.tsx)
  - Integrated ThemeToggle in header
  - Removed unused client @google/generative-ai init path; rely only on server /api/generate
  - Added Copy Prompt and Clear Results utilities
  - Loading, error, response, and gallery sections themed with dark variants and aria-live

- Theming
  - tailwind.config.js: darkMode: 'class'
  - components/ThemeToggle.tsx: toggles documentElement 'dark' class, persists to localStorage, falls back to system preference
  - app/layout.tsx: body classes support both themes (bg/text pairs)
  - app/globals.css: added a dedicated dark-mode global background (dark gradients) and color-scheme: dark override

## Decisions and conventions
- Dark mode strategy: Tailwind class strategy ('dark' on <html>), persisted in localStorage with system preference fallback
- Default model integration: client uses only server API (/api/generate); no direct client SDK calls
- UI pattern: in-field actions within the textarea (add-image and submit) for compact UX; thumbnails within the same container for context
- Validation: maintain server-side hard limits (MAX_IMAGES=5, ~5MB each); mirror via client checks
- Error semantics: 400 for input errors; 500 for server/upstream with sanitized details
- Security posture: keep keys server-side; avoid exposing public key in production

## Patterns and preferences
- Separation of concerns: client handles capture/render and UX; server handles secrets and Gemini call
- Defensive coding: explicit validations and limits, structured errors, and robust disabled states
- Accessibility: clear labels, aria-live for status messages, keyboard-friendly submit behavior
- Theming: pair light/dark classes for backgrounds, borders, and text; keep primary CTA legible in both modes

## Risks and constraints
- Large base64 payloads may exceed hosting request size limits in App Router
- Potential initial flash of incorrect theme (FOUC) before ThemeToggle applies class on mount
- Upstream rate limits/transient errors from Gemini API

## Next steps
- Consider inline “no-flash” theme snippet in <html> to set 'dark' class before React hydration
- Align README/.env to document GENAI_API_KEY as canonical and UI limits
- Add tests:
  - API input validation and response normalization
  - UI tests for prompt submit behaviors and in-textarea buttons
- Explore storage-backed uploads (GCS/S3 signed URLs) for large images
- Add structured logging and minimal rate limiting/backoff on the server
- Introduce ESLint/Prettier and CI checks for code consistency
