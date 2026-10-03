import { expect, test, type Page } from '@playwright/test';

// The « page not found » page (Bolt 24, not-found.md). GitHub Pages answers
// every unknown URL with the root 404.html, prerendered from the `404` route;
// scripts/serve-dist.mjs does the same.

const french = {
  lang: 'fr',
  title: 'Page introuvable — Notre Refuge au Sauze',
  h1: 'Page introuvable',
};
const english = {
  lang: 'en',
  title: 'Page not found — Notre Refuge au Sauze',
  h1: 'Page not found',
};

async function expectNotFoundPage(page: Page, { lang, title, h1 }: typeof french): Promise<void> {
  await expect(page.locator('html')).toHaveAttribute('lang', lang);
  await expect(page).toHaveTitle(title);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(h1);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  await expect(page.locator('link[rel="canonical"], link[hreflang]')).toHaveCount(0);
}

test.describe('with JavaScript disabled', () => {
  test.use({ javaScriptEnabled: false });

  for (const path of ['/nowhere', '/a/b/c', '/stay/oops']) {
    test(`${path} answers 404 with the page, keeping the address (FR-1, FR-2, FR-8)`, async ({
      page,
    }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(404);
      expect(new URL(page.url()).pathname).toBe(path);
      await expectNotFoundPage(page, french);
      await expect(page.getByRole('link', { name: "Retour à l'accueil" })).toHaveAttribute(
        'href',
        '/',
      );
    });
  }
});

test.describe('in English (FR-5, FR-6)', () => {
  test('an unknown /en/ address shows the English page, before the app loads', async ({ page }) => {
    // Without the app's JavaScript: the inline script must not wait for it.
    await page.route('**/*.js', (route) => route.abort());
    await page.goto('/en/nowhere');
    await expect(page).toHaveURL(/:\d+\/en\/404$/);
    await expectNotFoundPage(page, english);
  });

  test('a saved « English » sends an unknown French address to the English page', async ({
    page,
  }) => {
    await page.addInitScript(() => localStorage.setItem('refuge.lang', 'en'));
    await page.goto('/nowhere');
    await expect(page).toHaveURL(/:\d+\/en\/404$/);
    await expectNotFoundPage(page, english);
  });

  test('/en/404 is served as it is, without a loop', async ({ page }) => {
    const response = await page.goto('/en/404');
    expect(response?.status()).toBe(200);
    expect(response?.request().redirectedFrom()).toBeNull();
    await expect(page).toHaveURL(/:\d+\/en\/404$/);
    await expectNotFoundPage(page, english);
  });

  test('with nothing saved, an unknown French address stays French', async ({ page }) => {
    await page.goto('/nowhere');
    await expect(page).toHaveURL(/:\d+\/nowhere$/);
    await expectNotFoundPage(page, french);
  });
});

test('the page hydrates at any address, without errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.addInitScript(() => {
    document.addEventListener('readystatechange', () => {
      if (document.readyState === 'interactive') {
        (window as unknown as { prerenderedH1: Element | null }).prerenderedH1 =
          document.querySelector('h1');
      }
    });
  });

  await page.goto('/a/b/c', { waitUntil: 'networkidle' });

  const sameNode = await page.evaluate(
    () =>
      (window as unknown as { prerenderedH1: Element | null }).prerenderedH1 ===
      document.querySelector('h1'),
  );
  expect(sameNode, 'the h1 parsed from the HTML is still the one on the page').toBe(true);
  // The browser reports the 404 status of the page itself as an error.
  expect(errors.filter((error) => !error.includes('status of 404'))).toEqual([]);
});

test('the home link leads to the home page, inside the app (FR-3)', async ({ page }) => {
  await page.goto('/nowhere', { waitUntil: 'networkidle' });
  await page.getByRole('link', { name: "Retour à l'accueil" }).click();
  await expect(page).toHaveURL(/:\d+\/$/);
  await expect(page.locator('#about-heading')).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
  // Focus moves to the new page's heading, as after every in-app navigation.
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
});
