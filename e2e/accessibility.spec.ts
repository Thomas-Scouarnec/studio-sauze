import { expect, test } from '@playwright/test';
import { scan } from './axe';

// Controls are found by `aria-controls` and landmarks by `id`: the same in both languages.

for (const path of ['/', '/en/']) {
  test.describe(`home ${path}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(path);
    });

    test('passes AXE', async ({ page }, testInfo) => {
      await scan(page, testInfo, 'home');
    });

    test('passes AXE with the menu open', async ({ page }, testInfo) => {
      test.skip(testInfo.project.name !== 'phone', 'The menu bar exists on phones only');
      const toggle = page.locator('[aria-controls="home-nav-panel"]');
      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');
      await scan(page, testInfo, 'home, menu open');
    });

    test('passes AXE with the gallery open', async ({ page }, testInfo) => {
      await page.locator('#equipment').getByRole('button').first().click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await scan(page, testInfo, 'home, gallery open');
    });
  });
}

for (const path of ['/stay', '/en/stay']) {
  test.describe(`stay ${path}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(path);
    });

    test('passes AXE', async ({ page }, testInfo) => {
      await scan(page, testInfo, 'stay');
    });

    test('passes AXE with the section list open', async ({ page }, testInfo) => {
      test.skip(testInfo.project.name !== 'phone', 'The compact bar exists on narrow screens only');
      const toggle = page.locator('[aria-controls="stay-nav-list"]');
      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');
      await scan(page, testInfo, 'stay, list open');
    });
  });
}
