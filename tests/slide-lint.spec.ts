import { test, expect } from '@playwright/test';
import { FIXTURES } from '../shared/src/fixtures';

const VIEWPORTS = [
  { width: 1366, height: 768, name: '1366x768' },
  { width: 1920, height: 1080, name: '1920x1080' }
];

test.describe('Slide Lint', () => {
  for (const viewport of VIEWPORTS) {
    test.describe(`Viewport: ${viewport.name}`, () => {
      test.use({ viewport });

      for (const deck of FIXTURES.decks) {
        if (!deck.slides) continue;

        for (let i = 0; i < deck.slides.length; i++) {
          test(`Lint Deck: ${deck.id} Slide: ${i + 1}`, async ({ page }) => {
            await page.goto(`http://localhost:5173/render/${deck.id}?slide=${i}`);
            
            // Wait for fonts and network
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(500); // give animations a tiny bit to start if not disabled

            // Save screenshot
            await page.screenshot({ path: `outputs/screenshots/${deck.id}-slide-${i + 1}-${viewport.name}.png` });

            // 1. Flag text overflow
            const texts = await page.locator('[data-pptx="text"]').all();
            for (const t of texts) {
              const overflowData = await t.evaluate((el: HTMLElement) => {
                return {
                  isOverflowing: el.scrollHeight > el.clientHeight + 2 || el.scrollWidth > el.clientWidth + 2,
                  details: `${el.tagName} - scrollH: ${el.scrollHeight}, clientH: ${el.clientHeight}, scrollW: ${el.scrollWidth}, clientW: ${el.clientWidth}, text: ${el.innerText.substring(0, 20)}`
                };
              });
              expect(overflowData.isOverflowing, `Text is overflowing on ${deck.id} slide ${i + 1}: ${overflowData.details}`).toBe(false);
            }

            // 2. Elements outside the canvas
            const elements = await page.locator('[data-pptx="rect"], [data-pptx="text"], [data-pptx="icon"], [data-pptx="image"]').all();
            for (const el of elements) {
              const box = await el.boundingBox();
              if (box) {
                expect(box.x).toBeGreaterThanOrEqual(-5);
                expect(box.y).toBeGreaterThanOrEqual(-5);
                expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 5);
                expect(box.y + box.height).toBeLessThanOrEqual(viewport.height + 5);
              }
            }
          });
        }
      }
    });
  }
});
