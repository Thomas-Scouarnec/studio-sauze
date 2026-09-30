# Bolt 18 Plan — Prerendering

**Intent:** Prerender every page to HTML at build time and hydrate it in the browser, keeping the site static on GitHub Pages.
**Date:** 2026-09-30
**Status:** Implemented on 2026-09-30
**Stories:** [prerendering.md](../story-artifacts/prerendering.md) · **Design:** [design-artifacts/prerendering.md](../design-artifacts/prerendering.md) · **Spec:** [localization.md](../functional-specs/localization.md)

---

## Known before the bolt

- **A spike confirmed the approach** (design artifact): 4 routes prerendered in both languages, full hydration with no mismatch, 26/26 browser tests and 222/222 unit tests passing, no application code change needed for the server
- **Three things the spike showed must change:** the language redirect (French would paint first), the `stay/` folders (GitHub Pages would redirect `/stay` → `/stay/`), and the `404.html` (would be the prerendered home page)
- **`ng add @angular/ssr` side effects to undo:** a Node server file and `outputMode: "server"`; `@types/node` downgraded to `^20`
- **Work on `main`,** as agreed in Session 15

## Steps

- [x] **Step 1 — Add prerendering**
  - `ng add @angular/ssr@21.2.24`; then `outputMode: "static"`, `src/server.ts` removed, `@types/node` back to `^24`
  - `app.routes.server.ts`: every route `RenderMode.Prerender`; hydration with event replay and i18n support
  - Gate: build lists 4 prerendered routes; each HTML file has its content, `lang`, title; `npm test` passes

- [x] **Step 2 — Same URLs and fallback**
  - `scripts/finish-static-build.mjs` replaces `i18n-deep-links.mjs`: `stay/index.html` → `stay.html` in both languages, `404.html` from `index.csr.html`
  - `npm run deploy` uses it, with `--no-notfound`; `serve-dist.mjs` answers unknown paths with `404.html`
  - Gate: `dist/` has `stay.html` and `en/stay.html`, no `stay/` folder; `/stay` and `/en/stay` served without redirect; an unknown path gets status 404 and ends on the home page

- [x] **Step 3 — Redirect before paint**
  - Inline script in `index.html`'s `<head>`; `main.ts` only bootstraps; `resolveLanguageRedirect` and its tests removed
  - `localization.md` FR-9: « before the page is shown » instead of « before the app renders »
  - Gate: with « English » saved and the app's JavaScript blocked, `/` and `/stay#arrival` still land on `/en/` and `/en/stay#arrival`

- [x] **Step 4 — Browser tests**
  - `e2e/prerendering.spec.ts`: content and title with JavaScript disabled (4 pages); no console error while hydrating; the redirect with JavaScript blocked; unknown URL
  - Gate: each new test fails when its behaviour is broken on purpose (hydration off, redirect removed, script not run)

- [x] **Step 5 — Dev servers**
  - `npm start`, `start:en`, `start:all`: check the flags, `/stay`, reload on `/en/stay`
  - Gate: as before; if `ng serve` renders on the server and breaks the proxy, client-only rendering in the development configurations (D7)

- [x] **Step 6 — Verify and record**
  - `npm test`, `npm run e2e`, production build; hydration checked in a development build (the « hydrated N components » message, no warning); a look at the page with JavaScript off
  - README « Prerendering » section; results in this plan; Session 18 closed in `prompts.md`

---

## NFRs

- No Node server at runtime; GitHub Pages only
- Standalone, signals, `inject()`; browser-only code in `afterNextRender` / `afterRenderEffect` or behind `isPlatformBrowser`
- No hydration warning, no layout shift when the app takes over
- AXE: 0 violations, unchanged
- Initial JavaScript grows by the hydration runtime only (about 11 kB transferred in the spike)

---

## Out of scope (deliberate)

- Meta description, Open Graph, `schema.org`, `sitemap.xml`, `robots.txt` (next Bolt, idea 2)
- A « page not found » page (idea 7)
- Deploying from CI (idea 5)

---

## Risks

| Risk | Handling |
|---|---|
| Future code touches `window` or `localStorage` outside the browser and breaks the build | The build fails loudly (prerendering runs the code); README rules; CI builds on every push |
| A hydration mismatch introduced later | The new e2e check fails on console errors; dev builds log the details |
| The inline redirect and the rest of the app disagree on paths | One rule (`/en` prefix); covered by e2e with JavaScript blocked |
| GitHub Pages treats `stay.html` differently when `stay/` never existed | Same situation as `/en/stay` in production since Bolt 12; checked live after deploying |
| `ng serve` behaves differently with a server entry | Step 5; D7 fallback |

---

**Bolt 18 implemented on 2026-09-30**, after Thomas approved the plan.

## Verification results

| Check | Result |
|---|---|
| Production build | « Prerendered 4 static routes », both languages, no warning; after `finish-static-build.mjs`: `index.html`, `stay.html`, `en/index.html`, `en/stay.html`, `404.html` |
| Initial JavaScript | 103.7 kB transferred (was 92.3 kB): the hydration runtime |
| Hydration (development-mode prerendered build) | « Angular hydrated 13 component(s) … 0 skipped » on `/` and `/en/`, 7 on `/stay` and `/en/stay`; the same for a returning guest; no warning |
| Browser tests | 54 passing, 10 skipped by design: the 26 existing tests unchanged, plus 28 new (`prerendering.spec.ts`, 14 per width). Twice in CI mode: 108/108, no retry |
| New tests | Content, title, `lang` with JavaScript disabled and no redirect (4 pages); `noindex`; hydration keeps the parsed `<h1>` node, no console error (4 pages); saved « English » redirect with the app's JavaScript blocked, section kept; no redirect from `/en/`; « Français » or nothing saved stays; storage that throws; unknown URL → 404 then the home page |
| Mutation gate | Hydration removed, inline redirect disabled, no flattening: each caught by its tests. Client rendering only: the build step now stops at once with « No prerendered page » |
| Unit tests | 214 passing: the 8 tests of the removed redirect helpers moved to the browser tests |
| AXE | 0 violations, unchanged |
| Dev servers (`start:all`) | French and English, flags, reload on `/en/stay`, saved « English » redirect through the inline script; no NG0505 |
| `npm audit` | 0 vulnerabilities |

## Found and fixed during the build

- **Angular 21.2.25 was published overnight,** and `ng add` tried to mix it with the installed 21.2.24 (an npm conflict). `@angular/ssr` and `@angular/platform-server` were installed at exactly 21.2.24, then the schematic run on its own
- **`ng add` side effects undone:** `src/server.ts`, the `serve:ssr` script, `express`, `@types/express`, Node types in `tsconfig.app.json`, and `@types/node` downgraded to `^20`
- **The dev servers rendered French pages with the English switcher** (server rendering in `ng serve` with the default `LOCALE_ID`): dev servers back to browser rendering (D7), with no NG0505 warning
- **A client-only build would have made the tests wait 5 minutes, and could have been deployed:** `finish-static-build.mjs` now stops on it
- **The tests' server served `stay/index.html` at `/stay` directly,** unlike GitHub Pages: it now answers with a 301, and the tests assert that the pages come without a redirect
- **A slip during the mutation gate:** undoing two mutations with `git checkout` restored `app.config.ts` and `index.html` to the last commit, dropping this Bolt's edits to them. Both were rewritten and re-verified before going on; later mutations were undone from copies

## Noticed, not fixed here

- **Hot reload of the English pages under `start:all`:** the Vite websocket to port 4201 fails through the proxy (the page itself works; a manual reload is needed). The English dev configuration is otherwise as before this Bolt, so it is most likely older; not investigated

## Left to Thomas

- `npm run deploy`, then on refugedusauze.com: `/stay` and `/en/stay` open without a redirect to `/stay/`; an unknown address ends on the home page; « View source » shows the text of the page
