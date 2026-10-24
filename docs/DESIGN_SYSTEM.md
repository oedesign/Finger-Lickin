# Design system and shared UI

## Scope

The current home route is a visual foundation preview. It does not browse a
live restaurant catalog, accept account details or orders, or provide
authentication or authorization. Partner and administrator shells are layout
patterns only; they do not protect routes. Server authorization must be added
before either area handles real data.

## Visual foundations

Global design tokens live in `src/app/globals.css` and are exposed to Tailwind
4 through `@theme inline`:

- Warm canvas and surface colors; tomato/terracotta brand, leafy green, and
  spice accents.
- Semantic success, warning, danger, information, and visible focus colors.
- A system sans-serif body stack and a local Georgia display stack. No
  third-party font or image request is required.
- Responsive display and section type sizes, page/reading container widths,
  section spacing, card/panel radii, and subtle shadows.
- Global focus-visible outlines, selection styling, and reduced-motion
  handling.

Use text and explicit labels as well as color for status. Keep interactive
targets comfortably sized for touch and retain native browser semantics for
form controls.

## Shared UI primitives

`src/components/ui/` exports:

- `Button` and `ButtonLink`: primary, secondary, outline, inverse, ghost, and
  danger variants; small, medium, large, and icon sizes. `Button` supports a
  disabled loading state and accessible loading label.
- `FormField`: consistent visible label, required indication, hint, and
  validation message. Its render-prop control attributes connect an input,
  textarea, or select with its accessible name and description.
- `Input`, `Textarea`, and `Select`: native controls with consistent spacing,
  focus, disabled, and placeholder styling.
- `Checkbox` and `Radio`: native keyboard-operable inputs.
- `Badge`, `Card` and card subcomponents, `Feedback`, `EmptyState`, `Spinner`,
  and `Skeleton` for common status, surface, loading, and empty patterns.
- `Dialog`: native modal dialog with an accessible title/description, Escape
  handling, focus containment, and controlled open state.

## Shared layout patterns

`src/components/shared/` contains:

- `Brand` and a small local food illustration used by the design preview.
- `StorefrontHeader`, with a skip link, desktop navigation, and a native
  disclosure menu on narrow screens.
- `PageContainer` and `SectionHeading` for consistent content width and
  hierarchy.
- `PartnerPortalLayout` and `AdminDashboardLayout`, separately labelled
  responsive navigation shells. Callers supply navigation items and the
  active location; the shells do not imply authentication or permission checks.

The page uses only in-page links to sections that exist in this preview.
Workspace shell navigation should be supplied by future routes when those
routes are implemented.

## Verification

Vitest checks primitive APIs, form labels and error descriptions, native
checkbox/radio selection, status roles, and both portal shell structures.
Playwright checks mobile menu keyboard operation, skip navigation, modal
keyboard dismissal and focus restoration, 360–1440px horizontal overflow,
and axe-core WCAG 2.1 A/AA checks at mobile/desktop widths and with the dialog
open.

Manual review should additionally confirm the visual hierarchy and spacing at
mobile, tablet, and desktop sizes; test keyboard focus against the warm and
dark surfaces; and verify the site with a screen reader and reduced-motion
preference. Automated axe results do not replace assistive-technology testing.
