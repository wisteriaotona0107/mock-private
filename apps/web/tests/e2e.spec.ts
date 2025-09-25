import { test, expect } from '@playwright/test';

test('placeholder user flow (mocked)', async ({ page }) => {
  test.skip(true, 'E2E flow requires running backend; placeholder for CI.');
  await page.goto('/');
  await expect(page).toHaveTitle(/頭皮ケア/);
});
