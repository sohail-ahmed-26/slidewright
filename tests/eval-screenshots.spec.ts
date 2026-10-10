import { test } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const ARTIFACTS_DIR = 'C:/Users/BILAL.COM/.gemini/antigravity-ide/brain/9405d0e8-f91a-4287-8c09-668f4edb840c/';

test('Screenshot Eval Decks', async ({ page }) => {
  for (let i = 1; i <= 8; i++) {
    const url = `http://localhost:5173/dev/slides?deck=eval-deck-${i}`;
    await page.goto(url);
    await page.waitForTimeout(1000); // Wait for render and animations
    
    // Take screenshot
    const name = `eval-deck-${i}-1366x768.png`;
    const filepath = path.join(ARTIFACTS_DIR, name);
    await page.screenshot({ path: filepath });
    console.log(`Saved screenshot to ${filepath}`);
  }
});
