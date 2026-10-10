# UI Audit & Diagnosis

## 1. Color Palette & Theming
- **Issue**: The application lacks a defined brand color palette; the UI relies exclusively on generic black, white, and grey defaults.
- **Root Cause**: Missing custom design tokens in `index.css` and `tailwind.config.js`. Shadcn/ui CSS variables are either incomplete or mapped to generic monochrome scales.

## 2. Home Page Thumbnails
- **Issue**: 3 out of 4 recent presentation cards display blank white thumbnails.
- **Root Cause**: The mock decks lack proper `design` (DesignSystem) tokens. Also, the slides are likely rendering at full scale inside a small container, causing only the white background of the top-left corner to be visible.

## 3. Deck Viewer Layout & Thumbnails
- **Issue**: The left rail renders the active slide at full size, overflowing and overlapping the center canvas. Thumbnails aren't scaled. The cover slide is plain white. Breadcrumb shows ID ("Deck-1") instead of the title.
- **Root Cause**: 
  - `SlideRenderer` is used directly in the rail without a CSS transform wrapper to scale it down.
  - The CSS grid layout lacks proper bounds (`overflow: hidden` or independent scrolling) causing the rail to break out of its column.
  - The breadcrumb binds to `deck.id` rather than `deck.title`.
  - The mock deck fixture `deck-1` is missing a valid `design` object to apply the dark theme and brand colors to the cover.

## 4. Create Presentation (/new) Form
- **Issue**: `Switch` toggles and `Slider` are practically invisible (no track color, no fill). "Visuals & Designer" are merged into one option. "Simulate pipeline failure" is exposed directly on the user form. Submit button is pushed below the fold.
- **Root Cause**: 
  - Shadcn UI CSS variables for `primary`, `secondary`, and `muted` are not properly defined or lack contrast, causing form controls to blend into the background.
  - The form schema groups multiple agents into one toggle.
  - Test controls (simulate failure) are not visually separated from production form elements.
  - Vertical spacing (`gap`) is excessively large, pushing the submit button down.

## 5. Typography & Badges
- **Issue**: Labels and chips use a monospace font. The "ready" badge has weak contrast.
- **Root Cause**: A blanket `.font-mono` class or Tailwind configuration maps small text to monospace. The badge background uses a light green that fails WCAG 4.5:1 contrast ratio against white text.

## 6. Testing Gaps
- **Issue**: Existing tests pass despite these glaring visual defects.
- **Root Cause**: The Playwright tests are too shallow—they only check for the existence of elements or bounds of elements *within* the canvas, but do not assert CSS computed styles, a11y contrast ratios, horizontal scrolling, or the actual pixel content of thumbnails.
