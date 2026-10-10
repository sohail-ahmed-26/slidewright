# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\button-audit.spec.ts >> Button Audit & Screenshots >> Audit and Screenshot: /dev/kit at 1366x768
- Location: tests\button-audit.spec.ts:24:11

# Error details

```
Error: Console errors found on /dev/kit: Failed to load resource: the server responded with a status of 500 (Internal Server Error)

expect(received).toBe(expected) // Object.is equality

Expected: 0
Received: 1
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]: "[plugin:vite:css] Failed to load PostCSS config (searchPath: C:/Users/BILAL.COM/Downloads/slidewright/frontend): [Error] Loading PostCSS Plugin failed: Cannot find module '@tailwindcss/postcss' Require stack: - C:\\Users\\BILAL.COM\\Downloads\\slidewright\\frontend\\postcss.config.js (@C:\\Users\\BILAL.COM\\Downloads\\slidewright\\frontend\\postcss.config.js) Error: Loading PostCSS Plugin failed: Cannot find module '@tailwindcss/postcss' Require stack: - C:\\Users\\BILAL.COM\\Downloads\\slidewright\\frontend\\postcss.config.js (@C:\\Users\\BILAL.COM\\Downloads\\slidewright\\frontend\\postcss.config.js) at load (file:///C:/Users/BILAL.COM/Downloads/slidewright/node_modules/vite/dist/node/chunks/node.js:6912:10) at async Promise.all (index 0) at async plugins (file:///C:/Users/BILAL.COM/Downloads/slidewright/node_modules/vite/dist/node/chunks/node.js:6934:11) at async processResult (file:///C:/Users/BILAL.COM/Downloads/slidewright/node_modules/vite/dist/node/chunks/node.js:6972:13)"
  - generic [ref=e5]: C:/Users/BILAL.COM/Downloads/slidewright/frontend/src/index.css
  - generic [ref=e6]:
    - text: Click outside, press Esc key, or fix the code to dismiss.You can also disable this overlay by setting
    - code [ref=e7]: server.hmr.overlay
    - text: to
    - code [ref=e8]: "false"
    - text: in
    - code [ref=e9]: vite.config.ts
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
     |                                                                                         ^ Error: Console errors found on /dev/kit: Failed to load resource: the server responded with a status of 500 (Internal Server Error)
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