import { test, expect } from '@playwright/test';

test.describe('E2E Flow', () => {
  test('creates a deck and views it', async ({ page }) => {
    // Navigate to new deck page
    await page.goto('http://localhost:5173/new');

    // Fill in the prompt
    await page.fill('textarea[placeholder="What is your presentation about?"]', 'A test presentation about playwright');
    
    // Click Generate
    await page.click('button:has-text("Generate presentation")');

    // Wait for the URL to change to /runs/
    await page.waitForURL(/\/runs\/.+/);

    // Wait for the job to complete
    await expect(page.locator('text=Ready')).toBeVisible({ timeout: 10000 });

    // Go to deck
    await page.click('button:has-text("View Deck")');

    // Wait for deck viewer to load
    await page.waitForURL(/\/decks\/.+/);
    await expect(page.locator('.slide-preview')).toBeVisible();
  });
});
