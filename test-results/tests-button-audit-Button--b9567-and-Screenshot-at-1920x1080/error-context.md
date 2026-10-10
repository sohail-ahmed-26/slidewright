# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\button-audit.spec.ts >> Button Audit & Screenshots >> Audit and Screenshot: / at 1920x1080
- Location: tests\button-audit.spec.ts:24:11

# Error details

```
Error: Console errors found on /: Failed to load resource: the server responded with a status of 500 (Internal Server Error)

expect(received).toBe(expected) // Object.is equality

Expected: 0
Received: 1
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]: "[plugin:vite:css] [postcss] It looks like you're trying to use `tailwindcss` directly as a PostCSS plugin. The PostCSS plugin has moved to a separate package, so to continue using Tailwind CSS with PostCSS you'll need to install `@tailwindcss/postcss` and update your PostCSS configuration."
  - generic [ref=e5]: C:/Users/BILAL.COM/Downloads/slidewright/frontend/src/index.css:undefined:null
  - generic [ref=e6]: at mt (C:\Users\BILAL.COM\Downloads\slidewright\node_modules\tailwindcss\dist\lib.js:38:1643) at LazyResult.runOnRoot (C:\Users\BILAL.COM\Downloads\slidewright\node_modules\postcss\lib\lazy-result.js:367:16) at LazyResult.runAsync (C:\Users\BILAL.COM\Downloads\slidewright\node_modules\postcss\lib\lazy-result.js:296:26) at LazyResult.async (C:\Users\BILAL.COM\Downloads\slidewright\node_modules\postcss\lib\lazy-result.js:198:30) at LazyResult.then (C:\Users\BILAL.COM\Downloads\slidewright\node_modules\postcss\lib\lazy-result.js:455:17)
  - generic [ref=e7]:
    - text: Click outside, press Esc key, or fix the code to dismiss.You can also disable this overlay by setting
    - code [ref=e8]: server.hmr.overlay
    - text: to
    - code [ref=e9]: "false"
    - text: in
    - code [ref=e10]: vite.config.ts
    - text: .
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | const ROUTES = [
  4  |   '/',
  5  |   '/new',
  6  |   '/runs/run-1',
  7  |   '/library',
  8  |   '/decks/deck-1',
  9  |   '/decks/deck-1/present',
  10 |   '/agents',
  11 |   '/agents/writer',
  12 |   '/settings',
  13 |   '/dev/kit'
  14 | ];
  15 | 
  16 | const VIEWPORTS = [
  17 |   { width: 1366, height: 768 },
  18 |   { width: 1920, height: 1080 }
  19 | ];
  20 | 
  21 | test.describe('Button Audit & Screenshots', () => {
  22 |   for (const route of ROUTES) {
  23 |     for (const viewport of VIEWPORTS) {
  24 |       test(`Audit and Screenshot: ${route} at ${viewport.width}x${viewport.height}`, async ({ page }) => {
  25 |         await page.setViewportSize(viewport);
  26 |         const errors: string[] = [];
  27 |         page.on('pageerror', err => errors.push(err.message));
  28 |         page.on('console', msg => {
  29 |           if (msg.type() === 'error') {
  30 |             errors.push(msg.text());
  31 |           }
  32 |         });
  33 | 
  34 |         await page.goto(`http://localhost:5173${route}`);
  35 |         await expect(page.locator('text=Not Found')).toHaveCount(0);
> 36 |         expect(errors.length, `Console errors found on ${route}: ${errors.join(', ')}`).toBe(0);
     |                                                                                         ^ Error: Console errors found on /: Failed to load resource: the server responded with a status of 500 (Internal Server Error)
  37 | 
  38 |         // Light mode screenshot
  39 |         const routeName = route === '/' ? 'home' : route.replace(/\//g, '-').replace(/^-/, '');
  40 |         await page.screenshot({ path: `outputs/screenshots/${routeName}-${viewport.width}-light.png` });
  41 | 
  42 |         // Dark mode screenshot
  43 |         await page.locator('button[aria-label="Toggle Theme"]').click();
  44 |         await page.waitForTimeout(500); // wait for transition
  45 |         await page.screenshot({ path: `outputs/screenshots/${routeName}-${viewport.width}-dark.png` });
  46 |         
  47 |         // Find all buttons and links
  48 |         const interactables = await page.locator('button:not([disabled]), a[href]').all();
  49 |         for (const el of interactables) {
  50 |           await expect(el).toBeEnabled();
  51 |           await expect(el).toBeVisible();
  52 |         }
  53 |       });
  54 |     }
  55 |   }
  56 | });
  57 | 
```