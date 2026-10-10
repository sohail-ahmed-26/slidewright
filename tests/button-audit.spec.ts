import { test, expect } from '@playwright/test';

const ROUTES = [
  '/',
  '/new',
  '/runs/run-1',
  '/library',
  '/decks/deck-1',
  '/decks/deck-1/present',
  '/agents',
  '/agents/writer',
  '/settings',
  '/dev/kit'
];

const VIEWPORTS = [
  { width: 1366, height: 768 },
  { width: 1920, height: 1080 }
];

test.describe('Button Audit & Screenshots', () => {
  for (const route of ROUTES) {
    for (const viewport of VIEWPORTS) {
      test(`Audit and Screenshot: ${route} at ${viewport.width}x${viewport.height}`, async ({ page }) => {
        await page.setViewportSize(viewport);
        const errors: string[] = [];
        page.on('pageerror', err => errors.push(err.message));
        page.on('console', msg => {
          if (msg.type() === 'error') {
            errors.push(msg.text());
          }
        });

        await page.goto(`http://localhost:5173${route}`);
        await expect(page.locator('text=Not Found')).toHaveCount(0);
        expect(errors.length, `Console errors found on ${route}: ${errors.join(', ')}`).toBe(0);

        // Light mode screenshot
        const routeName = route === '/' ? 'home' : route.replace(/\//g, '-').replace(/^-/, '');
        await page.screenshot({ path: `outputs/screenshots/${routeName}-${viewport.width}-light.png` });

        // Dark mode screenshot
        await page.locator('button[aria-label="Toggle Theme"]').click();
        await page.waitForTimeout(500); // wait for transition
        await page.screenshot({ path: `outputs/screenshots/${routeName}-${viewport.width}-dark.png` });
        
        // Find all buttons and links
        const interactables = await page.locator('button:not([disabled]), a[href]').all();
        for (const el of interactables) {
          await expect(el).toBeEnabled();
          await expect(el).toBeVisible();
        }
      });
    }
  }
});
