// Serves the production build the way GitHub Pages does, for the Playwright tests.
//
//   An existing file                        -> the file
//   A folder (/, /en/)                      -> its index.html
//   An extensionless path with a .html file -> that file (/en/stay, from i18n-deep-links.mjs)
//   Anything else (/stay)                   -> the root index.html, status 404, like the
//                                              404.html copy angular-cli-ghpages publishes
//
// Run after `ng build` and `node scripts/i18n-deep-links.mjs`; `npm run e2e` does it for you.
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, sep } from 'node:path';

const root = join('dist', 'studio-sauze', 'browser');
const port = Number(process.env['PORT'] ?? 4300);

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

if (!existsSync(join(root, 'index.html'))) {
  console.error(`${root}/index.html not found: run a production build (ng build) first.`);
  process.exit(1);
}

const isFile = (path) => existsSync(path) && statSync(path).isFile();

/** The file GitHub Pages would answer with, and its status. */
function resolve(urlPath) {
  // normalize() folds any `..`; a path that still escapes the root is not served.
  const local = normalize(join(root, decodeURIComponent(urlPath)));
  if (local === root || local.startsWith(root + sep)) {
    if (isFile(local)) return [local, 200];
    if (isFile(join(local, 'index.html'))) return [join(local, 'index.html'), 200];
    if (isFile(`${local}.html`)) return [`${local}.html`, 200];
  }
  return [join(root, 'index.html'), 404];
}

createServer((request, response) => {
  const [file, status] = resolve(new URL(request.url ?? '/', 'http://localhost').pathname);
  response.writeHead(status, {
    'Content-Type': contentTypes[extname(file)] ?? 'application/octet-stream',
  });
  createReadStream(file).pipe(response);
}).listen(port, () => console.log(`Serving ${root} on http://localhost:${port}/`));
