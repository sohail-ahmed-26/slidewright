import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({
    channel: 'chrome', // Use the installed Chrome
    headless: true
  });
  const page = await browser.newPage();
  
  // Wait for the app to be available
  let retries = 5;
  while (retries > 0) {
    try {
      await page.goto('http://localhost:5173');
      break;
    } catch (e) {
      retries--;
      console.log('Waiting for frontend...');
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  // Wait for health check to load
  await page.waitForTimeout(2000); 

  await page.screenshot({ path: 'outputs/screenshot.png' });
  await browser.close();
  console.log('Screenshot saved to outputs/screenshot.png');
})();
