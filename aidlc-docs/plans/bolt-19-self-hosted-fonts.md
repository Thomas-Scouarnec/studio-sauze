# Bolt 19 Plan — Self-Hosted Fonts

**Intent:** Serve the two fonts from the site itself instead of Google Fonts: one less chain of requests before the text shows, and no visitor IP address sent to Google.
**Date:** 2026-09-30
**Status:** Implemented on 2026-09-30
**Builds on:** [bolt-18-prerendering.md](bolt-18-prerendering.md)

---

## Known before the bolt

- **Today:** `src/styles.css` starts with `@import url('https://fonts.googleapis.com/css2?…')`. The browser loads the page, then `styles.css`, then Google's CSS, then the font files from `fonts.gstatic.com`: four steps in a row, two of them on Google's servers
- **Faces used:** Playfair Display 400, 600 and 400 italic; Jost 300, 400 and 500 (the ones requested from Google)
- **Headings use the browser's default bold (700).** With 600 as the heaviest Playfair loaded, they render at 600. A variable font would draw a true 700, visibly heavier: the static faces keep the look identical
- **Characters:** French and English need the latin subset only (it includes « », ’, œ, ², €, ↑)

## Decisions

| # | Decision | Why | Alternative |
|---|---|---|---|
| D1 | **`@fontsource/jost` and `@fontsource/playfair-display` (5.3), static faces** | Versioned npm packages (updated like any dependency), same family names, so no CSS changes; static faces keep today's rendering (above) | Variable fonts (fewer files, but heavier headings); `.woff2` files copied by hand into `public/` |
| D2 | **The six faces used, latin subset only** (`latin-400.css`, …) | Nothing else is ever downloaded; the build copies only those files | The packages' full CSS (every subset and weight) |
| D3 | **Listed in `angular.json` `styles`, before `src/styles.css`** | The build copies the font files next to the bundles with hashed names, cached for good | `@import` in `styles.css` |
| D4 | **No `<link rel="preload">`** | The file names are hashed at build time; the prerendered HTML with inlined critical CSS already lets the browser find the fonts early | Unhashed font names to preload them |
| D5 | **A browser test** that no page requests Google, and that the six faces load | Keeps it that way | — |

## Steps

- [x] **Step 1 — Fonts from the packages;** Google `@import` removed
- [x] **Step 2 — Browser test** (`e2e/fonts.spec.ts`)
- [x] **Step 3 — Verify:** build, `npm test`, `npm run e2e` (AXE included), screenshots before and after at 1280px and 375px; README

---

## Out of scope

- Fallback font metrics (`size-adjust`) to reduce the text shift when the fonts arrive
- Any change of font, weight or style

---

## Verification results

| Check | Result |
|---|---|
| Build | Both languages, no warning; 6 `.woff2` files (plus `.woff` fallbacks, never used by current browsers) in `media/` and `en/media/`; no reference to Google left |
| Browser tests | 62 passing, 10 skipped by design (first recorded as 64, which counted two temporary screenshot tests): 8 new (`fonts.spec.ts`, 4 pages × 2 widths): font requests only to the site, `.woff2` only, only the six faces, all six on the home page. AXE: 0 violations |
| Mutation gate | The Google `@import` put back: the new tests fail (« a font from somewhere else ») |
| Unit tests | 214 passing |
| Before / after screenshots (8: home and `/stay`, two scroll positions, 1280px and 375px) | Same size, no layout change; 9 to 2,231 pixels differ out of about a million: single glyphs (an « i » dot, an accent) drawn from a slightly different build of the same fonts. Enlarged side by side, the headings and subheadings look identical |
| Styles bundle | 2.6 kB instead of 8.3 kB: the build no longer inlines Google's CSS for every subset |

## Noticed, not fixed here

- **The English build has its own copy of the fonts** (`en/media/`), so a visitor who switches language downloads them again, about 20 kB each: the same trade-off the photos had before Bolt 12 gave them absolute URLs
