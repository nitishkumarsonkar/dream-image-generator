# Dream Image Generator — Product Context

## Why this exists
Enable users to turn prompts and/or reference images into AI-generated visuals using Google’s Gemini API, directly from a simple web UI without managing ML infrastructure.

## Target users
- Creators, designers, marketers, and hobbyists who need quick visual ideation.
- Developers evaluating Gemini image capabilities with a minimal, clear reference app.

## Problems it solves
- Rapid concept visualization from text prompts.
- Lightweight image-to-image transformation for style/variation exploration.
- Frictionless generation workflow in the browser.

## How it should work (user experience)
- Users can:
  - Enter a text description (prompt).
  - Optionally upload up to 5 reference images (reasonable size).
  - Submit and receive AI-generated output (image and/or text).
  - Preview results in real time and download/share them.
- The UI communicates limits and validation clearly (file size/type, count).
- Errors and loading states are explicit and unobtrusive.

## UX goals
- Speed: minimal steps to first result; responsive UI.
- Clarity: strong upfront validation and explicit error messages.
- Accessibility: keyboard navigation, proper labels, alt text for non-text content.
- Reliability: graceful handling of network/API failures and timeouts.

## Non-goals (initial)
- Complex editing/compositing pipelines.
- User accounts/authentication and long-term galleries.
- Model fine-tuning or custom training flows.

## Success metrics
- Time-to-first-image (TTFI) under typical conditions.
- Prompt-to-result success rate.
- Low error rate (< 2% non-user errors).
- Completion rate (previewed → downloaded/shared).

## Key edge cases
- Oversized images, unsupported types, too many images in one request.
- Missing or misconfigured API key.
- API rate limiting and transient upstream failures.
- Hosting platform request body size limits (especially for base64 images).

## Product scope (initial)
- Text-to-image and image-to-image with Gemini.
- Single-screen generation flow with preview and download.
- Server-backed API integration via Next.js App Router route.
