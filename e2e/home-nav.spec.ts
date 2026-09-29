import { expect, test } from '@playwright/test';

// The home page's sticky bar on phones (Bolt 15, navigation.md). French site.

test.describe('home sticky bar', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'phone', 'The bar exists on phones only');
    await page.goto('/');
  });

  test('a section from the menu lands below the bar, focused and named', async ({ page }) => {
    const bar = page.getByRole('navigation', { name: 'Navigation de la page' });
    const toggle = bar.locator('[aria-controls="home-nav-panel"]');

    await toggle.click();
    await bar.getByRole('link', { name: 'Activités' }).click();

    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#activities')).toBeFocused();
    await expect(toggle).toContainText('Activités');
    // The closed panel is out of the accessibility tree: found by its fragment instead.
    await expect(bar.locator('.home-nav-sections a[href$="#activities"]')).toHaveAttribute('aria-current', 'location');

    // Stuck to the top, and the section's top edge flush with the bar's bottom (FR-6).
    // The sticky element is the host: 1px taller than the nav, for its bottom border.
    const barBox = (await page.locator('app-home-nav').boundingBox())!;
    const sectionBox = (await page.locator('#activities').boundingBox())!;
    expect(Math.abs(barBox.y)).toBeLessThanOrEqual(1);
    expect(Math.abs(sectionBox.y - (barBox.y + barBox.height))).toBeLessThanOrEqual(1);
  });

  test('« Contact » is always in the bar and jumps to the form', async ({ page }) => {
    const bar = page.getByRole('navigation', { name: 'Navigation de la page' });
    const contact = bar.locator('.home-nav-contact');

    await expect(contact).toBeVisible();
    await page.locator('#equipment').scrollIntoViewIfNeeded();
    await expect(contact).toBeInViewport();

    await contact.click();
    await expect(page.locator('#contact')).toBeFocused();
    await expect(page.locator('#contact-heading')).toBeInViewport();
  });

  test('Escape closes the menu and gives focus back to its button', async ({ page }) => {
    const toggle = page.locator('[aria-controls="home-nav-panel"]');
    await toggle.click();
    await expect(page.locator('#home-nav-panel')).toBeVisible();
    // Into the list, as a keyboard user would: Escape must bring focus back out.
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await expect(page.locator('#home-nav-panel a').first()).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#home-nav-panel')).toBeHidden();
    await expect(toggle).toBeFocused();
  });
});

test('no sticky bar on a desktop', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Desktop only');
  await page.goto('/');
  await expect(page.getByRole('navigation', { name: 'Navigation de la page' })).toBeHidden();
});
