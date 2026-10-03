// Lighthouse CI (Bolt 25): `npm run lighthouse` builds the site, then audits
// each page 3 times and keeps the median. CI runs it in the `lighthouse` job.
const port = 4301; // Not 4300, so a running browser-test server does not clash.
const origin = `http://localhost:${port}`;

module.exports = {
  ci: {
    collect: {
      startServerCommand: `node scripts/serve-dist.mjs ${port}`,
      startServerReadyPattern: 'Serving',
      // Every page in both languages. The not-found page at /404, where it
      // answers 200: Lighthouse refuses to audit a page served as a 404.
      url: ['/', '/stay', '/en/', '/en/stay', '/404'].map((path) => origin + path),
      numberOfRuns: 3,
      settings: {
        // GitHub's runners have Chrome preinstalled; locally, the installed
        // Chrome is found, or set CHROME_PATH.
        chromeFlags: process.env['CI'] ? '--headless=new --no-sandbox' : '--headless=new',
      },
    },
    // The floors (Bolt 25, D6). Below one, CI fails and the site is not deployed.
    assert: {
      assertMatrix: [
        {
          matchingUrlPattern: '.*',
          assertions: {
            // Speed varies between machines: medians on GitHub's runners were
            // 86 to 97 (October 2026), so the floor keeps a margin under them.
            'categories:performance': ['error', { minScore: 0.8, aggregationMethod: 'median-run' }],
            'categories:accessibility': ['error', { minScore: 1, aggregationMethod: 'median-run' }],
            // The performance score mostly measures the first screen: a heavy
            // photo further down barely moves it. Pages weighed 222 to 590 KiB
            // (October 2026); one unresized phone photo is 2 to 5 MB.
            'total-byte-weight': [
              'error',
              { maxNumericValue: 1024 * 1024, aggregationMethod: 'median-run' },
            ],
            'categories:best-practices': [
              'error',
              { minScore: 1, aggregationMethod: 'median-run' },
            ],
          },
        },
        {
          // The two indexed pages: the whole SEO category.
          matchingUrlPattern: `^${origin}/(en/)?$`,
          assertions: {
            'categories:seo': ['error', { minScore: 1, aggregationMethod: 'median-run' }],
          },
        },
        {
          // The unlisted pages fail « is-crawlable » on purpose (noindex:
          // stay.md FR-3, not-found.md FR-7), so every other SEO audit is
          // checked one by one instead of the category.
          matchingUrlPattern: `^${origin}/(en/)?(stay|404)$`,
          assertions: Object.fromEntries(
            [
              'document-title',
              'http-status-code',
              'link-text',
              'crawlable-anchors',
              'robots-txt',
              'hreflang',
              'image-alt',
              'canonical',
            ].map((audit) => [audit, ['error', { minScore: 1, aggregationMethod: 'median-run' }]]),
          ),
        },
        {
          // The stay pages have a description; the not-found page, on purpose, none.
          matchingUrlPattern: `^${origin}/(en/)?stay$`,
          assertions: {
            'meta-description': ['error', { minScore: 1, aggregationMethod: 'median-run' }],
          },
        },
      ],
    },
    upload: {
      // Kept as files (a CI artifact), never on a public server: the reports
      // show the guest page.
      target: 'filesystem',
      outputDir: 'lighthouse-report',
    },
  },
};
