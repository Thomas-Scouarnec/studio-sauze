import { expect, test } from '@playwright/test';

// The /stay section menu (Bolts 13 and 14, stay.md FR-22 to FR-28). French site.

test.beforeEach(async ({ page }) => {
  await page.goto('/stay');
});

test('desktop: a chip jumps to its section and is marked current', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'The chips show from 1025px');
  const menu = page.getByRole('navigation', { name: 'Sommaire' });
  await expect(menu.locator('[aria-controls="stay-nav-list"]')).toBeHidden();

  const chip = menu.getByRole('link').nth(4);
  const sectionId = (await chip.getAttribute('href'))!.split('#')[1];
  await chip.click();

  await expect(page.locator(`#${sectionId}`)).toBeFocused();
  await expect(chip).toHaveAttribute('aria-current', 'location');
  await expect(menu.locator('[aria-current]')).toHaveCount(1);
});

test('phone: the compact bar opens the list and names the section reached', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'phone', 'The compact bar shows on narrow screens');
  const menu = page.getByRole('navigation', { name: 'Sommaire' });
  const toggle = menu.locator('[aria-controls="stay-nav-list"]');

  await toggle.click();
  const link = menu.getByRole('link').nth(4);
  const title = (await link.innerText()).replace(/^\d+\s*/, '').trim();
  const sectionId = (await link.getAttribute('href'))!.split('#')[1];
  await link.click();

  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator(`#${sectionId}`)).toBeFocused();
  await expect(toggle).toContainText(`5/9 · ${title}`);

  // The heading lands below the stuck bar, not under it.
  const menuBox = (await menu.boundingBox())!;
  const headingBox = (await page.locator(`#${sectionId}-heading`).boundingBox())!;
  expect(headingBox.y).toBeGreaterThanOrEqual(menuBox.y + menuBox.height - 1);
});
