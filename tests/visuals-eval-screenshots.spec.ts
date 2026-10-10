import { test } from '@playwright/test';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/BILAL.COM/.gemini/antigravity-ide/brain/9405d0e8-f91a-4287-8c09-668f4edb840c/';

test('Screenshot Visuals Diagrams Eval', async ({ page }) => {
  const url = `http://localhost:5173/dev/diagrams`;
  await page.goto(url);
  await page.waitForTimeout(2000); // Wait for load and fonts
  
  const name = `dev-diagrams-full-page.png`;
  const filepath = path.join(ARTIFACTS_DIR, name);
  
  // Full page screenshot since it's a contact sheet
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`Saved screenshot to ${filepath}`);
});
