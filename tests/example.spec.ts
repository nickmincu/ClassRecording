import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('playwright is configured correctly', async ({ page }) => {
    // Basic sanity check that Playwright runs
    expect(page).toBeTruthy();
  });
});
