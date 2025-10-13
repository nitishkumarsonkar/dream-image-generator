# Design System Documentation

## Overview
This document outlines the unified design system implemented across the Dream Image Generator application. The design system ensures consistency in colors, typography, spacing, and interactive elements.

## Color Palette

### Primary Colors (Purple/Indigo Theme)
Used for primary actions, active states, and brand elements.

```css
primary-50:  #f5f3ff
primary-100: #ede9fe
primary-200: #ddd6fe
primary-300: #c4b5fd
primary-400: #a78bfa
primary-500: #8b5cf6  /* Main brand color */
primary-600: #7c3aed
primary-700: #6d28d9
primary-800: #5b21b6
primary-900: #4c1d95
primary-950: #2e1065
```

### Accent Colors (Cyan/Blue)
Used for highlights, secondary actions, and complementary elements.

```css
accent-50:  #ecfeff
accent-100: #cffafe
accent-200: #a5f3fc
accent-300: #67e8f9
accent-400: #22d3ee
accent-500: #06b6d4  /* Main accent color */
accent-600: #0891b2
accent-700: #0e7490
accent-800: #155e75
accent-900: #164e63
```

### Neutral Colors
Enhanced contrast for better readability and modern appearance.

```css
neutral-50:  #fafafa
neutral-100: #f5f5f5
neutral-200: #e5e5e5
neutral-300: #d4d4d4
neutral-400: #a3a3a3
neutral-500: #737373
neutral-600: #525252
neutral-700: #404040
neutral-800: #262626
neutral-900: #171717
neutral-950: #0a0a0a
```

## Typography

### Font Family
System font stack for optimal performance and native feel:
```css
font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial
```

### Headings
- **H1**: `text-4xl` to `text-5xl`, `font-bold`, gradient text for hero sections
- **H2**: `text-2xl` to `text-3xl`, `font-bold` or `font-semibold`
- **H3**: `text-xl`, `font-semibold`

### Body Text
- Regular: `text-base`, `text-neutral-700 dark:text-neutral-300`
- Small: `text-sm`
- Extra Small: `text-xs`

## Component Styles

### Buttons

#### Primary Button (`.btn-primary`)
```css
- Background: Gradient from primary-600 to primary-700
- Text: White
- Shadow: shadow-lg with primary-500/30
- Hover: Transform translateY(-2px), enhanced shadow
- Padding: px-4 py-2.5
- Border Radius: rounded-lg
```

#### Accent Button (`.btn-accent`)
```css
- Background: Gradient from accent-600 to accent-700
- Similar styling to primary but with accent colors
```

#### Secondary Button (`.btn-secondary`)
```css
- Background: neutral-100 dark:neutral-800
- Border: border-neutral-200 dark:border-neutral-700
- Text: neutral-700 dark:neutral-300
```

#### Ghost Button (`.btn-ghost`)
```css
- Background: Semi-transparent white/dark
- Border: Subtle neutral border
- Hover: Solid background with primary border hint
```

### Cards

#### Glass Card (`.glass-card`)
```css
- Background: Semi-transparent white/dark with blur
- Border: 1px primary-tinted border
- Border Radius: rounded-xl
- Shadow: Soft shadow with hover enhancement
- Hover: Enhanced shadow with primary glow
```

#### Standard Card (`.card`)
```css
- Background: Solid white/neutral-900
- Border: neutral-200 dark:neutral-800
- Border Radius: rounded-xl
- Shadow: soft shadow
```

### Form Elements

#### Input Field (`.input-field`)
```css
- Padding: px-4 py-2.5
- Border: neutral-300 dark:neutral-700
- Border Radius: rounded-lg
- Focus: Ring with primary-500/50, primary-500 border
- Placeholder: neutral-400 dark:neutral-500
```

#### Textarea (`.textarea-field`)
```css
- Extends .input-field
- Min Height: 100px
- Resize: none (for controlled textareas)
```

## Interactive States

### Hover Effects
- **Buttons**: `translateY(-2px)`, enhanced shadows
- **Cards**: Border color shifts to primary tint, shadow enhancement
- **Links**: Color shift to primary-600/primary-400

### Active States
- Primary gradient background
- White text with shadow
- Enhanced visual prominence

### Focus States
- Ring with `ring-2 ring-primary-500/50`
- Border color: `border-primary-500`
- No outline (using Tailwind's focus-visible)

## Animations

### Available Animations
```css
fade-in: 320ms ease-in-out
slide-up: 300ms ease-in-out  
slide-down: 300ms ease-in-out
scale-in: 200ms ease-in-out
```

### Usage
- Page loads: `animate-fade-in`
- Conditional renders: `animate-slide-down`
- Staggered animations: Use `style={{ animationDelay: '0.1s' }}`

## Shadows

### Soft Shadows
```css
shadow-soft: 0 2px 15px rgba(0, 0, 0, 0.08)
shadow-soft-lg: 0 8px 30px rgba(0, 0, 0, 0.12)
shadow-inner-soft: inset 0 2px 4px rgba(0, 0, 0, 0.06)
```

### Component-Specific Shadows
- **Primary Buttons**: `shadow-lg shadow-primary-500/30`
- **Cards on Hover**: `shadow-primary-500/15` (light) or `shadow-primary-500/30` (dark)

## Background Patterns

### Light Mode
```css
- Radial gradients with primary and accent colors at low opacity
- Linear gradient from light purple to lighter purple
- Fixed attachment for parallax effect
```

### Dark Mode
```css
- Radial gradients with higher opacity for depth
- Linear gradient from dark purple-tinted to black
- Enhanced contrast while maintaining theme
```

## Spacing System

Follow Tailwind's default spacing scale:
- **Micro**: `gap-1`, `gap-2` (4px, 8px)
- **Small**: `gap-3`, `gap-4` (12px, 16px)
- **Medium**: `gap-6`, `gap-8` (24px, 32px)
- **Large**: `gap-12`, `gap-16` (48px, 64px)

## Responsive Breakpoints

```css
sm: 640px   (mobile landscape)
md: 768px   (tablet)
lg: 1024px  (desktop)
xl: 1280px  (large desktop)
2xl: 1536px (extra large)
```

## Dark Mode

### Implementation
- Uses `class` strategy in Tailwind config
- Toggle via `<html class="dark">` attribute
- CSS variables adapt automatically

### Guidelines
- Always provide both light and dark variants
- Maintain sufficient contrast (WCAG AA minimum)
- Test interactive states in both modes

## Accessibility

### Color Contrast
- Text on backgrounds: Minimum 4.5:1 ratio
- Large text: Minimum 3:1 ratio
- Interactive elements: Clear visual feedback

### Focus Indicators
- Visible focus rings on all interactive elements
- Primary color tint for brand consistency
- Keyboard navigation fully supported

### Semantic HTML
- Proper heading hierarchy
- ARIA labels where appropriate
- Alt text for images

## Usage Examples

### Creating a Primary CTA
```tsx
<button className="px-6 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 shadow-lg shadow-primary-500/30 transition-all duration-300 transform hover:scale-105">
  Get Started
</button>
```

### Creating a Card Component
```tsx
<div className="glass-card p-8 animate-fade-in">
  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
    Card Title
  </h2>
  <p className="text-neutral-700 dark:text-neutral-300">
    Card content goes here
  </p>
</div>
```

### Form Input
```tsx
<input
  type="text"
  className="input-field"
  placeholder="Enter text..."
/>
```

## Best Practices

1. **Consistency**: Use design tokens instead of arbitrary values
2. **Accessibility**: Always test with keyboard navigation
3. **Performance**: Leverage Tailwind's JIT compiler for optimal bundle size
4. **Maintainability**: Keep custom CSS minimal, prefer utility classes
5. **Responsiveness**: Mobile-first approach, progressive enhancement

## Component-Specific Patterns

### Header
- Fixed position with backdrop blur
- Primary gradient for brand text
- Active nav items with gradient background
- Smooth transitions (300ms)

### Sidebar Presets
- Glass card styling
- Active state with primary gradient
- Badge components for metadata
- Animated custom input section

### Forms (Sign-in/Sign-up)
- Glass card container
- Gradient heading text
- Clear visual hierarchy
- OAuth buttons with hover states

### About Page
- Hero section with gradient heading
- Icon-accented sections
- Feature grid with colored backgrounds
- CTA with arrow icon

---

**Last Updated**: October 2025
**Version**: 1.0.0
