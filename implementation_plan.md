# Optimization Plan: UI/UX Enhancements for Dream Generator

This plan outlines the steps to elevate the user interface of the "Dream Generator" application, focusing on visual consistency, layout optimization, and a more "premium" feel.

## 1. Unify Navigation & Header
**Goal:** Create a consistent, coherent navigation experience.
- **Action:** Refine `Header.tsx`.
- **Details:** 
    - Change active nav link style from a heavy gradient to a subtle "pill" background (`bg-primary-50` text-primary-700).
    - Reserve the strong gradient only for the primary "Sign In" / CTA button to establish clear hierarchy.
    - Adjust spacing and alignment for a cleaner look.

## 2. Consolidate Controls (Fix "Floating" Elements)
**Goal:** Group all generation-related controls (Prompt, Presets, Aspect Ratio) in one logical place.
- **Action:** Move the "My Presets" toggle from the top of the page to the bottom input area.
- **Details:**
    - **`ImageUploader.tsx`**: Add a "Presets" button to the control bar alongside "Add Images" and "Aspect Ratio".
    - **`page.tsx`**: Remove the disconnected top toolbar. Pass the preset toggle handler down to the input component.
    - **Result:** A single, powerful "Command Center" at the bottom of the screen.

## 3. Enhance Sidebar & History
**Goal:** Make the sidebar feel like an integrated workspace tool rather than a list.
- **Action:** Polish `ImageGenerationHistory.tsx`.
- **Details:**
    - Improve the "Empty State" with a centered, styled illustration/icon to remove the "dead zone".
    - Restyle the bottom "Refresh" and "View All" buttons to be less heavy (e.g., icons with text or ghost buttons) to reduce visual clutter.

## 4. Upgrade "Empty State" / Onboarding
**Goal:** Wow new users immediately.
- **Action:** Upgrade `Scrollable.tsx`.
- **Details:**
    - Replace the simple "Example Prompts" text buttons with **"Inspiration Cards"**.
    - These cards will feature a subtle gradient, an icon, and the prompt text, looking like premium curated content.

## 5. Global Polish
**Goal:** General visual refinement.
- **Action:** Tweaks in `globals.css` if necessary for specific glassmorphism or shadow consistency.
