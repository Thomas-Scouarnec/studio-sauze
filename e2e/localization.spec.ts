import { expect, test } from '@playwright/test';

// The two language builds (Bolt 12, localization.md).

test('the flag switches to English and back', async ({ page }) => {
  await page.goto('/');
  // The link itself, not only where the saved choice redirects to (FR-7).
  const english = page.locator('a[hreflang="en"]:visible').first();
  await expect(english).toHaveAttribute('href', '/en/');
  await english.click();
  await expect(page).toHaveURL(/\/en\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');

  const french = page.locator('a[hreflang="fr"]:visible').first();
  await expect(french).toHaveAttribute('href', '/');
  await french.click();
  await expect(page).toHaveURL(/:\d+\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
});

test('a direct link to /en/stay opens in English', async ({ page }) => {
  const response = await page.goto('/en/stay');
  expect(response?.status()).toBe(200);
  await expect(page).toHaveURL(/\/en\/stay$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('navigation', { name: 'Contents' })).toBeAttached();
});
