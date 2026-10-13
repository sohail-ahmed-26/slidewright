# Architecture Decisions

## PPTX Export Strategy (Task B2)

### Context & Problem
We need to export generated presentations to native PowerPoint (.pptx) format. The design system leverages modern CSS (flexbox, grid, gradients, rounded corners, drop shadows, absolute positioning) to render slides beautifully in the browser. 

We spiked two DOM-based approaches:
1. **html2pptx (npm package)**: Parses HTML and translates it to PPTX objects.
2. **Custom DOM Extractor (Playwright)**: Renders the deck in headless Chromium, extracts exact bounding boxes (`getBoundingClientRect`) and computed styles of elements marked with `[data-pptx]`, and maps them to `pptxgenjs` objects.

### Evaluation of DOM Approaches
- `html2pptx` fails significantly on modern CSS layouts like grids and flexbox, resulting in low fidelity (<4/10).
- The **Playwright DOM Extractor** achieves better positioning but falls short on:
  - SVG icons (lucide-react).
  - Background gradients and image object-fit (cover).
  - Text wrapping and precise font metrics (browser vs. PowerPoint rendering differences).
  - High operational overhead (requires running a headless browser in the backend container, which is heavy and error-prone in serverless/Docker environments).

### Decision
Neither DOM approach reaches a consistent fidelity of >= 8/10 for highly designed, token-based layouts.

Therefore, we have decided to **fall back to layout-specific `pptxgenjs` mapping fed by the same tokens**.

### Implementation (Layout-Specific Mapping)
Instead of scraping the DOM, the backend export module (`backend/src/export/`) will read the parsed JSON `Deck` object (the exact same data that feeds the React components) and use `pptxgenjs` to manually draw the shapes, text, and images for each specific layout (e.g., `cover`, `grid_2x2`, `timeline`).

**Advantages:**
1. **100% Reliability**: No headless browser dependency. Extremely fast and lightweight.
2. **High Fidelity**: By explicitly hardcoding the grid coordinates (e.g., `x, y, w, h`) and mapping our design tokens (colors, fonts) into `pptxgenjs` directly, we ensure pixel-perfect alignment.
3. **Native PPTX Features**: We can map background colors, shape shadows (`offset >= 0`), transparency, and proper `charSpacing`.

### Constraints for `pptxgenjs` Builder
- `pres.layout = 'LAYOUT_16x9'` (13.333x7.5 inches) before adding slides.
- Colors must be hex without the `#` symbol.
- Transparency must use the `transparency` option rather than rgba hex codes.
- Shadows must be defined per shape (cannot use CSS drop-shadow).
- Character spacing uses `charSpacing`, not `letterSpacing`.
