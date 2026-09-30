import { expect, test } from '@playwright/test';

// The fonts come from the site itself, not from Google (Bolt 19).

/** The faces the site uses, as `family weight style`. */
const FACES = [
  'Jost 300 normal',
  'Jost 400 normal',
  'Jost 500 normal',
  'Playfair Display 400 italic',
  'Playfair Display 400 normal',
  'Playfair Display 600 normal',
];

for (const path of ['/', '/stay', '/en/', '/en/stay']) {
  test(`${path} loads its fonts from the site only`, async ({ page, baseURL }) => {
    const fontRequests: string[] = [];
    page.on('request', (request) => {
      if (
        request.resourceType() === 'font' ||
        /fonts\.(googleapis|gstatic)\.com/.test(request.url())
      ) {
        fontRequests.push(request.url());
      }
    });

    await page.goto(path, { waitUntil: 'networkidle' });
    const loaded = await page.evaluate(async () => {
      await document.fonts.ready;
      return [...document.fonts]
        .filter((face) => face.status === 'loaded')
        .map((face) => `${face.family.replace(/"/g, '')} ${face.weight} ${face.style}`);
    });

    expect(fontRequests.length).toBeGreaterThan(0);
    for (const url of fontRequests) {
      expect(url, 'a font from somewhere else').toMatch(new RegExp(`^${baseURL}/`));
      expect(url).toMatch(/\.woff2$/);
    }
    // Every face loaded is one of the six; the home page uses all of them.
    expect(FACES).toEqual(expect.arrayContaining(loaded));
    if (path === '/' || path === '/en/') {
      expect([...new Set(loaded)].sort()).toEqual(FACES);
    }
  });
}
