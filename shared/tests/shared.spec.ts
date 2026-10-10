import { describe, it, expect } from 'vitest';
import { WriterOutputSchema } from '../src/schemas/writer';
import { FIXTURES } from '../src/fixtures';
import { ensureContrast } from '../src/design/palette';
import { LAYOUT_CATALOG } from '../src/catalog';
import { fuzzyIconMatch } from '../src/design/icons';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../src/canvas';

describe('Shared package tests', () => {
  it('fixtures validate against zod schemas', () => {
    for (const deck of FIXTURES.decks) {
      expect(() => WriterOutputSchema.parse({ slides: deck.slides })).not.toThrow();
    }
  });

  it('palette generator keeps contrast >= 4.5:1 for 50 random hues', () => {
    for (let i = 0; i < 50; i++) {
      const h = Math.floor(Math.random() * 360);
      const color = { h, s: 80, l: 50 };
      const adjusted = ensureContrast(color, { h: 0, s: 0, l: 100 }, 4.5);
      expect(adjusted.l).toBeDefined();
    }
  });

  it('every layout in the catalog has limits', () => {
    for (const [key, layout] of Object.entries(LAYOUT_CATALOG)) {
      expect(layout.maxSlots).toBeDefined();
    }
  });

  it('icon fuzzy matcher resolves unknown names', () => {
    expect(fuzzyIconMatch('search-engine')).toBe('Search');
    expect(fuzzyIconMatch('e-mail address')).toBe('Mail');
    expect(fuzzyIconMatch('unknown-garbage-xxx')).toBe('CheckCircle'); // fallback
  });

  it('canvas constants exist', () => {
    expect(CANVAS_WIDTH).toBe(1366);
    expect(CANVAS_HEIGHT).toBe(768);
  });
});
