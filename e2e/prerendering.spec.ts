import { expect, test, type Page } from '@playwright/test';

// Prerendering and hydration (Bolt 18), and the language redirect that had to
// move into index.html for it (localization.md FR-9).

const pages = [
  { path: '/', lang: 'fr', title: 'Notre Refuge au Sauze', heading: '#about-heading' },
  {
    path: '/stay',
    lang: 'fr',
    title: 'Votre séjour — Notre Refuge au Sauze',
    heading: '#welcome-heading',
  },
  { path: '/en/', lang: 'en', title: 'Notre Refuge au Sauze', heading: '#about-heading' },
  {
    path: '/en/stay',
    lang: 'en',
    title: 'Your stay — Notre Refuge au Sauze',
    heading: '#welcome-heading',
  },
];

test.describe('with JavaScript disabled', () => {
  test.use({ javaScriptEnabled: false });

  for (const { path, lang, title, heading } of pages) {
    test(`${path} is served with its content`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      // stay.html, not stay/index.html, which GitHub Pages reaches through a redirect to /stay/.
      expect(response?.request().redirectedFrom(), 'served without a redirect').toBeNull();
      await expect(page.locator('html')).toHaveAttribute('lang', lang);
      await expect(page).toHaveTitle(title);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expect(page.locator(heading)).toBeVisible();
    });
  }

  test('the guest page tells search engines to skip it', async ({ page }) => {
    await page.goto('/stay');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  });
});

test.describe('hydration', () => {
  for (const { path } of pages) {
    test(`${path} adopts the prerendered page, without errors`, async ({ page }) => {
      const errors = collectErrors(page);
      // The heading as parsed from the HTML, before the app's scripts run
      // (module scripts wait for the end of parsing, « interactive »).
      await page.addInitScript(() => {
        document.addEventListener('readystatechange', () => {
          if (document.readyState === 'interactive') {
            (window as unknown as { prerenderedH1: Element | null }).prerenderedH1 =
              document.querySelector('h1');
          }
        });
      });

      await page.goto(path, { waitUntil: 'networkidle' });

      // Hydration keeps the same DOM nodes; rendering again would replace them.
      const sameNode = await page.evaluate(
        () =>
          (window as unknown as { prerenderedH1: Element | null }).prerenderedH1 ===
          document.querySelector('h1'),
      );
      expect(sameNode, 'the h1 parsed from the HTML is still the one on the page').toBe(true);
      expect(errors).toEqual([]);
    });
  }
});

test.describe('a saved « English » (FR-9)', () => {
  test.beforeEach(async ({ page }) => {
    // Without the app's JavaScript: the redirect must not wait for it.
    await page.route('**/*.js', (route) => route.abort());
  });

  test('sends a French URL to the same English page, section kept', async ({ page }) => {
    await saveLanguage(page, 'en');
    await page.goto('/stay#arrival');
    await expect(page).toHaveURL(/\/en\/stay#arrival$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');

    await page.goto('/');
    await expect(page).toHaveURL(/\/en\/$/);
  });

  test('never moves an English URL', async ({ page }) => {
    await saveLanguage(page, 'en');
    await page.goto('/en/stay');
    await expect(page).toHaveURL(/\/en\/stay$/);
  });

  test('a saved « Français », or nothing saved, stays in French', async ({ page }) => {
    await page.goto('/stay');
    await expect(page).toHaveURL(/:\d+\/stay$/);
    await saveLanguage(page, 'fr');
    await page.goto('/stay');
    await expect(page).toHaveURL(/:\d+\/stay$/);
  });

  test('storage that throws leaves the visitor in French, without error (BR-6)', async ({
    page,
  }) => {
    const errors = collectErrors(page);
    await page.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', {
        get() {
          throw new DOMException('Blocked', 'SecurityError');
        },
      });
    });
    await page.goto('/');
    await expect(page).toHaveURL(/:\d+\/$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
    expect(errors.filter((error) => !error.includes('net::ERR_FAILED'))).toEqual([]);
  });
});

test('an unknown address gets a 404, then the home page', async ({ page }) => {
  const response = await page.goto('/no-such-page');
  expect(response?.status()).toBe(404);
  await expect(page).toHaveURL(/:\d+\/$/);
  await expect(page.locator('#about-heading')).toBeVisible();
});

/** Uncaught errors and `console.error` calls on the page, as text. */
function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  return errors;
}

async function saveLanguage(page: Page, language: 'fr' | 'en'): Promise<void> {
  await page.addInitScript((value) => localStorage.setItem('refuge.lang', value), language);
}
