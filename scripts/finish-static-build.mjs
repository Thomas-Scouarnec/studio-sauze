// Shapes the prerendered build for GitHub Pages. Run after `ng build`;
// `npm run e2e` does it for you, and CI deploys the result.
//
// 1. Same URLs as before prerendering. Angular writes /stay as stay/index.html.
//    GitHub Pages would then answer /stay with a redirect to /stay/, on every
//    direct visit. It serves stay.html at /stay directly, so each page is moved
//    there: stay/index.html -> stay.html, en/stay/index.html -> en/stay.html.
//    Each language's home page (/, /en/) stays an index.html.
//
// 2. The « page not found » page (not-found.md) as 404.html: step 1 makes it
//    from the prerendered `404` route, in both languages. GitHub Pages
//    answers every unknown URL with the root one, the French page, so a
//    script written first in its <head> sends /en/… to the English one at
//    /en/404 before anything paints (FR-5).
//
// 3. robots.txt and sitemap.xml at the root only. Angular copies public/ into
//    each language's folder, but crawlers only read them at the root.
import { existsSync, readFileSync, renameSync, rmSync, rmdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dist = join('dist', 'studio-sauze');
const browser = join(dist, 'browser');
const manifest = join(dist, 'prerendered-routes.json');

if (!existsSync(manifest)) {
  console.error(`${manifest} not found: run a production build (ng build) first.`);
  process.exit(1);
}

/** A language's home folder: where Angular also writes the client-only shell. */
const isLanguageRoot = (folder) => existsSync(join(folder, 'index.csr.html'));

const routes = Object.keys(JSON.parse(readFileSync(manifest, 'utf8')).routes);

// Never publish empty shells: every page must have been prerendered.
if (routes.length === 0 || !existsSync(join(browser, 'index.html'))) {
  console.error('No prerendered page: check src/app/app.routes.server.ts (RenderMode.Prerender).');
  process.exit(1);
}

for (const route of routes) {
  const folder = join(browser, route);
  const page = join(folder, 'index.html');
  if (isLanguageRoot(folder) || !existsSync(page)) {
    continue;
  }
  renameSync(page, `${folder}.html`);
  rmdirSync(folder); // Fails, on purpose, if anything else was written there.
  console.log(`${route}/index.html -> ${route}.html`);
}

const notFound = join(browser, '404.html');
if (!existsSync(notFound) || !existsSync(join(browser, 'en', '404.html'))) {
  console.error('404.html not prerendered: check the `404` route in src/app/app.routes.ts.');
  process.exit(1);
}
const toEnglish =
  "<script>if (location.pathname.indexOf('/en/') === 0) location.replace('/en/404');</script>";
writeFileSync(notFound, readFileSync(notFound, 'utf8').replace('<head>', `<head>${toEnglish}`));
console.log('404.html: /en/… -> /en/404');

for (const file of ['robots.txt', 'sitemap.xml']) {
  if (!existsSync(join(browser, file))) {
    console.error(`${file} missing from the build: it belongs in public/.`);
    process.exit(1);
  }
  rmSync(join(browser, 'en', file), { force: true });
}

// The shells are not pages of their own: nothing links to them.
for (const route of routes) {
  rmSync(join(browser, route, 'index.csr.html'), { force: true });
}
