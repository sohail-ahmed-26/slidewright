# Reference Analysis

Based on the DevSil Reference Deck:

## Global Styles
- **Canvas Size**: 1280x720 pixels (16:9 ratio).
- **Margins**: 0.6 inches (~58px) on all sides.
- **Gaps**: 0.3 to 0.4 inches (approx 32px or `gap-8`).
- **Typography**:
  - Cover Title: 46pt (61px), bold.
  - Slide Title: 32pt (43px), semibold.
  - Body Text: Minimum 16pt (21px).
  - Card Text: Minimum 14pt (19px).
  - Caption/Footer: Minimum 12pt (16px).
- **Colors**:
  - Primary Accent: Teal (HSL 173 80% 40%).
  - Dark Panels: Very dark gray (`hsl(0, 0%, 9%)`).
  - Tinted Cards: Very light gray (`hsl(0, 0%, 96%)`).
- **Shapes**:
  - Border Radius: 12px.
  - Borders: Thin, 1px solid light gray (`hsl(0, 0%, 90%)`).
  - Shadows: One simple `box-shadow` for floating elements (`0 4px 12px rgba(0,0,0,0.05)`).
- **PPTX Constraints**:
  - No CSS gradients, blurs, clip-paths.
  - Use `data-pptx="rect|text|icon|image|line"` on elements.

## Layout Inventory
1. **cover**: Centered massive title, subtitle, subtle background element.
2. **two_cards**: Left title/desc, right area split into two vertical or horizontal cards.
3. **icon_rows**: List of rows, each with an icon on the left and text on the right.
4. **grid_2x2**: A 4-quadrant layout of cards.
5. **icon_list_dark_panel**: Split layout. Left is dark panel with huge number/icon, right is a list of points.
6. **big_number_dark**: Full dark background with a massive centered statistic.
7. **cards_3_bar**: Top title, horizontal row of 3 cards below it.
8. **closing**: Minimal centered text with contact info.
