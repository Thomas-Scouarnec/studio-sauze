// Makes direct links to English pages work on GitHub Pages.
//
// GitHub Pages answers an unknown path with the root 404.html, which is the
// French app: a shared /en/stay link would open in French. Writing a copy of
// the English index.html as en/<route>.html lets GitHub Pages serve /en/<route>
// from it directly (it resolves extensionless paths to .html files).
//
// Run after `ng build`; `npm run deploy` does it for you.
import { copyFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

// Every route of src/app/app.routes.ts except the home page ('') and '**'.
const ROUTES = ['stay'];

const englishDir = join('dist', 'studio-sauze', 'browser', 'en');
const index = join(englishDir, 'index.html');

if (!existsSync(index)) {
  console.error(`${index} not found: run a production build (ng build) first.`);
  process.exit(1);
}

for (const route of ROUTES) {
  const target = join(englishDir, `${route}.html`);
  copyFileSync(index, target);
  console.log(`Wrote ${target}`);
}
