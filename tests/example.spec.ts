import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('playwright is configured correctly', async ({ page }) => {
    // Basic sanity check that Playwright runs
    expect(page).toBeTruthy();
  });

  test('can navigate to a public page', async ({ page }) => {
    await page.goto('https://example.com');
    await expect(page).toHaveTitle(/Example Domain/);
  });
});
