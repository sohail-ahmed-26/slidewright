# shared/  (common rules jo frontend, backend aur agents teeno use karte hain)
- `src/schemas/`  zod schemas: Deck, Slide, DesignSystem, DiagramSpec, ImageSpec, CritiqueReport
- `src/layouts/`  layout catalog (har layout ke slots + limits, e.g. title max 8 words)
- `src/design/`   palette generator (hue -> colors), contrast checker, Office-safe font pairs, icon allow-list
- `src/fixtures/` sample decks (reference-clone + 3 hue variants) aur eval topics

Canvas: 1280x720 CSS px = 13.333x7.5 inch (96dpi). 1pt = 1.333px.
