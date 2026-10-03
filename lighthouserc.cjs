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
    upload: {
      // Kept as files (a CI artifact), never on a public server: the reports
      // show the guest page.
      target: 'filesystem',
      outputDir: 'lighthouse-report',
    },
  },
};
