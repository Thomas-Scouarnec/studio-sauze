import { expect, test, type Page } from '@playwright/test';

// What search engines and link previews read (Bolt 23, search-and-sharing.md).
// Messaging apps do not run JavaScript, so the tags are checked in the
// prerendered HTML first, then after moving between pages in the app.

const origin = 'https://refugedusauze.com';

const pages = [
  {
    path: '/',
    url: `${origin}/`,
    locale: 'fr_FR',
    description: /^Studio de montagne pour 5 personnes au Sauze/,
    indexed: true,
  },
  {
    path: '/stay',
    url: `${origin}/stay`,
    locale: 'fr_FR',
    description: /^Le guide de votre séjour/,
    indexed: false,
  },
  {
    path: '/en/',
    url: `${origin}/en/`,
    locale: 'en_GB',
    description: /^Mountain studio flat for 5 at Le Sauze/,
    indexed: true,
  },
  {
    path: '/en/stay',
    url: `${origin}/en/stay`,
    locale: 'en_GB',
    description: /^Your guide to staying/,
    indexed: false,
  },
];

const meta = (page: Page, attribute: string) => page.locator(`head meta[${attribute}]`);

test.describe('with JavaScript disabled', () => {
  test.use({ javaScriptEnabled: false });

  for (const { path, url, locale, description, indexed } of pages) {
    test(`${path} carries its description and preview tags`, async ({ page }) => {
      await page.goto(path);
      const title = await page.title();

      await expect(meta(page, 'name="description"')).toHaveAttribute('content', description);
      await expect(meta(page, 'property="og:description"')).toHaveAttribute('content', description);
      await expect(meta(page, 'property="og:title"')).toHaveAttribute('content', title);
      await expect(meta(page, 'property="og:url"')).toHaveAttribute('content', url);
      await expect(meta(page, 'property="og:image"')).toHaveAttribute(
        'content',
        `${origin}/images/share/preview-1200x630.jpg`,
      );
      await expect(meta(page, 'property="og:locale"')).toHaveAttribute('content', locale);
      await expect(meta(page, 'name="twitter:card"')).toHaveAttribute(
        'content',
        'summary_large_image',
      );
    });

    test(`${path} is ${indexed ? 'indexed, with its language links' : 'unlisted'}`, async ({
      page,
    }) => {
      await page.goto(path);
      const canonical = page.locator('head link[rel="canonical"]');
      const alternates = page.locator('head link[rel="alternate"][hreflang]');

      if (indexed) {
        await expect(canonical).toHaveAttribute('href', url);
        await expect(alternates).toHaveCount(3);
        await expect(page.locator('head link[hreflang="en"]')).toHaveAttribute(
          'href',
          `${origin}/en/`,
        );
        await expect(meta(page, 'name="robots"')).toHaveCount(0);
      } else {
        await expect(canonical).toHaveCount(0);
        await expect(alternates).toHaveCount(0);
        await expect(meta(page, 'name="robots"')).toHaveAttribute('content', 'noindex');
      }
    });
  }
});

test('moving between pages in the app leaves only the current page’s tags (FR-13)', async ({
  page,
}) => {
  // Opening /stay records the guest, so « Mon séjour » shows on the home page.
  await page.goto('/stay', { waitUntil: 'networkidle' });
  const navigation = page.getByRole('navigation', { name: 'Navigation principale' });

  await navigation.locator('a.nav-logo').click();
  await expect(page).toHaveURL(/:\d+\/$/);
  await expect(meta(page, 'name="robots"')).toHaveCount(0);
  await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute('href', `${origin}/`);
  await expect(meta(page, 'name="description"')).toHaveAttribute('content', /^Studio de montagne/);

  await navigation.getByRole('link', { name: 'Mon séjour' }).click();
  await expect(page).toHaveURL(/\/stay$/);
  await expect(meta(page, 'name="robots"')).toHaveAttribute('content', 'noindex');
  await expect(page.locator('head link[rel="canonical"], head link[hreflang]')).toHaveCount(0);
  await expect(meta(page, 'name="description"')).toHaveCount(1);
  await expect(meta(page, 'property="og:url"')).toHaveAttribute('content', `${origin}/stay`);
});

test.describe('files for crawlers', () => {
  test('robots.txt allows everything, points to the sitemap and does not name /stay', async ({
    request,
  }) => {
    const response = await request.get('/robots.txt');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('text/plain');
    const body = await response.text();
    expect(body).toContain('Allow: /');
    expect(body).toContain(`Sitemap: ${origin}/sitemap.xml`);
    expect(body).not.toContain('/stay');
  });

  test('sitemap.xml lists the two home pages only (FR-12)', async ({ request }) => {
    const response = await request.get('/sitemap.xml');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('xml');
    const body = await response.text();
    expect([...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1])).toEqual([
      `${origin}/`,
      `${origin}/en/`,
    ]);
    expect(body).not.toContain('stay');
  });

  test('the preview image is a JPEG (FR-6)', async ({ request }) => {
    const response = await request.get('/images/share/preview-1200x630.jpg');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toBe('image/jpeg');
    expect((await response.body()).length).toBeLessThan(300 * 1024);
  });

  test('they are not copied under /en/', async ({ request }) => {
    for (const file of ['robots.txt', 'sitemap.xml']) {
      const response = await request.get(`/en/${file}`);
      expect(response.status(), `/en/${file}`).toBe(404);
    }
  });
});
