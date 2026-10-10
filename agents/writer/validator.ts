import { LAYOUT_CATALOG, WriterOutput } from '@slidewright/shared';

export interface ValidationViolation {
  index: number;
  message: string;
}

export function validateDeck(deck: WriterOutput): ValidationViolation[] {
  const violations: ValidationViolation[] = [];
  const slides = deck.slides;

  if (slides.length === 0) {
    return [{ index: -1, message: 'Deck is empty' }];
  }

  // 1. First slide must be cover
  if (slides[0].layout !== 'cover') {
    violations.push({ index: 0, message: 'First slide must be "cover" layout' });
  }

  // 2. Last slide must be closing
  if (slides[slides.length - 1].layout !== 'closing') {
    violations.push({ index: slides.length - 1, message: 'Last slide must be "closing" layout' });
  }

  const layoutCounts: Record<string, number> = {};
  const distinctLayouts = new Set<string>();
  let middleDarkCount = 0;

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    const layout = slide.layout as keyof typeof LAYOUT_CATALOG;
    
    // Check if layout exists
    if (!LAYOUT_CATALOG[layout]) {
      violations.push({ index: i, message: `Unknown layout: ${layout}` });
      continue;
    }

    distinctLayouts.add(layout);
    layoutCounts[layout] = (layoutCounts[layout] || 0) + 1;

    // Never the same layout twice in a row
    if (i > 0 && slides[i - 1].layout === layout) {
      violations.push({ index: i, message: `Layout "${layout}" used twice in a row` });
    }

    // Check slot limits
    const catalog = LAYOUT_CATALOG[layout];
    for (const [slot, maxItems] of Object.entries(catalog.maxSlots)) {
      if (slide.data && Array.isArray(slide.data[slot]) && slide.data[slot].length > maxItems) {
        violations.push({ index: i, message: `Slot "${slot}" exceeded max items ${maxItems} on layout "${layout}"` });
      }
    }

    // Rhythm check: count dark slides in the middle
    if (i > 0 && i < slides.length - 1) {
      if (catalog.theme === 'dark') {
        middleDarkCount++;
      }
    }
  }

  // Any layout max 2x (except cards/grid variants)
  const exceptions = ['two_cards', 'grid_2x2', 'cards_3_bar', 'chip_grid_callout'];
  for (const [layout, count] of Object.entries(layoutCounts)) {
    if (!exceptions.includes(layout) && count > 2 && layout !== 'cover' && layout !== 'closing') {
      // Find the offending indices
      slides.forEach((s, i) => {
        if (s.layout === layout) violations.push({ index: i, message: `Layout "${layout}" used more than twice` });
      });
    }
  }

  // >= 6 distinct layouts in a 10+ slide deck
  if (slides.length >= 10 && distinctLayouts.size < 6) {
    violations.push({ index: -1, message: `Deck needs more variety. Only ${distinctLayouts.size} distinct layouts used. Must be >= 6.` });
  }

  // Rhythm (cover, key_answer and closing dark; the rest light)
  if (middleDarkCount !== 1 && slides.length > 3) {
    violations.push({ index: -1, message: `Rhythm violation: There must be exactly ONE dark slide in the middle of the deck (for the key answer). Found ${middleDarkCount}.` });
  }

  // Deduplicate violations by index/message
  const uniqueViolations = Array.from(new Set(violations.map(v => JSON.stringify(v)))).map(s => JSON.parse(s));
  return uniqueViolations;
}
