# Dream Image Generator — Active Context

Updated: 2025-10-06

## Current focus
Unify and refine navigation UX and input UI:
- Centralize sidebar state and controls; keep the collapse/expand toggle always visible at top-left (fixed).
- Ensure sidebar works consistently on desktop (collapsible fixed panel) and mobile (drawer with overlay).
- Improve ImageUploader button-group layout with inline CSS; prevent overlap and keep horizontal alignment.
- Maintain previously established Supabase SSR patterns and path aliases; track remaining cleanup.

## Recent changes
- Sidebar architecture and UX
  - Introduced global SidebarProvider context in components/SidebarPresets.tsx managing open/close/toggle.
  - Added components:
    - SidebarToggleButton (uses provided SVG pair), now with visible border and fixed at top-left (z-[60]).
    - SidebarDesktop (fixed left on md+, slides in/out).
    - SidebarDrawer (mobile overlay/drawer; overlay z-40).
  - Moved SidebarProvider wrapping to app/layout.tsx so Header can access context across pages.
  - Moved the toggle from app/page.tsx to components/Header.tsx; removed old burger and page-local drawer state.
  - Ensured toggle is clickable over mobile overlay by z-index ordering (button z-60, overlay z-40).
- ImageUploader improvements
  - Reworked button group with inline CSS:
    - Left: “Add Images”; Right: Aspect Ratio + Submit (horizontal, no overlap).
    - Used flex with nowrap, flexShrink: 0; removed fixed width percentages.
  - Aspect ratio popup:
    - Wrapped text (whiteSpace: normal; wordBreak: break-word; lineHeight tuning).
    - Responsive button grid (repeat(auto-fit, minmax(160px, 1fr))); bounded popup min/max width.
  - Submit button updated to “arrow in a circle” SVG; increased size (+50%) for submit and aspect controls.
- TypeScript / Next.js setup
  - Added next-env.d.ts to satisfy Next.js TypeScript project requirements and fix CSS side-effect import warnings.
  - Cleaned app/page.tsx to consume new sidebar components; removed in-page toggle.
- Styling conventions
  - Toggle button visible border: border-neutral-300 (dark: -700), bg white/90 (dark: neutral-900/90), shadow-sm, hover states.
  - Toggle fixed: top-4 left-4; always visible across viewport.

## Decisions and conventions
- Sidebar state
  - Single source of truth via SidebarProvider (in layout). Header uses SidebarToggleButton to control both desktop and mobile sidebars.
  - Keep toggle permanently fixed at top-left of viewport with visible border for accessibility and visibility.
- Z-index contract
  - Mobile drawer overlay: z-40; toggle: z-[60] to guarantee click-through for closing.
- Layout behavior
  - Desktop main content retains md:ml-64; collapsing sidebar currently doesn’t reflow main content (can be changed later).
- ImageUploader
  - Prefer inline CSS for precise control where Tailwind utilities become cumbersome (nowrap, flexShrink, sizing).
  - Popup content responsive and readable; prevent text clipping.
- Imports and aliases
  - Continue using "@/..." path alias across the project.
  - Supabase canonical import: "@/utils/supabase/server".

## Risks and constraints
- Content spacing on collapse
  - With md:ml-64 static margin, main content does not expand when the desktop sidebar is collapsed; consider conditional layout if desired.
- Overlay layering
  - z-index layering must remain consistent if additional fixed elements are introduced.
- Legacy duplication
  - Duplicate server client file remains (app/utils/supabase/server.ts vs utils/supabase/server.ts). Risk of drift until deduplicated.
- Inline CSS trade-offs
  - Inline styles increase specificity and may bypass Tailwind theming in some cases; document where used and why.

## Next steps
- Optional: Dynamic content shift
  - Remove or conditionally apply md:ml-64 when sidebar is collapsed to reclaim screen space on desktop.
- Deduplicate Supabase server client
  - Remove or re-export app/utils/supabase/server.ts to point to utils/supabase/server.ts.
- UI polish
  - Validate toggle placement across all pages and screen sizes; adjust top/left offsets if header height changes.
  - Add focus styles and aria attributes already present; consider tooltip for collapsed/expanded state if needed.
- Documentation
  - Update README to reflect new sidebar architecture and the fixed toggle behavior.
  - Note inline CSS rationale in ImageUploader and how to maintain it.
- Testing
  - Smoke test mobile drawer interactions (overlay click to close), escape key to close (optional), and desktop collapse transitions.
  - Verify accessibility: tab order to the fixed toggle, role attributes in drawer, and popup behavior for aspect ratio.

## Reference
- Provider location: app/layout.tsx wraps the app with SidebarProvider.
- Toggle location: components/Header.tsx renders SidebarToggleButton (fixed at top-left).
- Sidebar system: components/SidebarPresets.tsx (SidebarProvider, SidebarToggleButton, SidebarDesktop, SidebarDrawer).
- Image uploader: components/ImageUploader.tsx (inline CSS layout, popup sizing, submit icon).
