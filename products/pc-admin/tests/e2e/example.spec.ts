import { test, expect } from '@playwright/test';

test('主应用可以成功加载', async ({ page }) => {
  const response = await page.goto('/');
  expect(response?.ok()).toBeTruthy();
  await expect(page.locator('#app')).toBeVisible();
});

