# Bolt 23 Plan — Search and Sharing

**Intent:** Give every page a description, link-preview tags and a canonical URL, and add `robots.txt` and `sitemap.xml`, so the site reads well in search results and when its link is shared. Idea 2 of Session 18.
**Date:** 2026-10-01
**Status:** Implemented on 2026-10-03
**Stories:** [search-and-sharing.md](../story-artifacts/search-and-sharing.md) · **Design:** [design-artifacts/search-and-sharing.md](../design-artifacts/search-and-sharing.md) · **Spec:** [search-and-sharing.md](../functional-specs/search-and-sharing.md)

---

## Known before the bolt

- **Pages are prerendered** (Bolt 18), so tags set by Angular end up in the static HTML that crawlers and preview readers fetch
- **Today's `<head>`:** translated titles per route; `hreflang` static in `index.html`, so on every page; `noindex` set by `StayComponent`. No description, no Open Graph, no canonical, no `robots.txt` or `sitemap.xml`
- **No image tool installed** (no ImageMagick, Python or `sharp`): the preview image is made once through `npx` (D6)
- **Copy to validate:** two descriptions and one `alt` text, in the design artifact
- **Work on `main`,** as agreed in Session 15

## Steps

- [x] **Step 1 — `PageTagsStrategy`**
  - `src/app/page-tags.strategy.ts`: title (as before), description, Open Graph, `twitter:card`, `robots`, canonical and `hreflang` links, from `route.data.tags`
  - Provided in `app.config.ts`; `data.tags` on both routes; `noindex` code out of `StayComponent`; `hreflang` out of `index.html`
  - Unit tests: tags for an indexed and a non-indexed route, in both locales; moving from one to the other leaves no stale tag and no duplicate
  - Gate: `npm test` passes; the strategy's tests fail if the removal of stale tags is taken out

- [x] **Step 2 — Copy and translations**
  - The three `seo.*` units in French and English, as validated by Thomas
  - Gate: the English build succeeds (missing translations fail it, localization.md BR-4); descriptions ≤ 160 characters

- [x] **Step 3 — Preview image, `robots.txt`, `sitemap.xml`**
  - `preview-1200x630.jpg` from the winter photo, under 300 kB, checked by eye
  - `public/robots.txt`, `public/sitemap.xml`; `finish-static-build.mjs` removes their `en/` copies
  - Gate: `dist/` has `robots.txt`, `sitemap.xml` and the image at the root and nowhere under `en/`; `sitemap.xml` is valid XML and does not name `stay`

- [x] **Step 4 — Browser tests**
  - `e2e/search-and-sharing.spec.ts`: with JavaScript disabled, each of the 4 pages has the expected tags (and the stay pages `noindex`, no canonical, no alternates); after `/` → `/stay` → `/` in the app, exactly one of each tag and no `noindex`; the three files served with the right type
  - Gate: each new test fails when its behaviour is broken on purpose (strategy not provided, stale tags kept, `en/` copies kept)

- [x] **Step 5 — Verify and record**
  - `npm test`, `npm run lint`, `npm run e2e`, production build; AXE unchanged; no hydration warning
  - The prerendered `<head>` of each page read by eye; the preview checked with a local Open Graph reader on the built files
  - localization.md FR-13 updated; README note; results in this plan; Session 23 closed in `prompts.md`

---

## NFRs

- Static only; nothing runs at request time
- Standalone, signals where state is involved, `inject()`; no browser-only API in the strategy (it runs while prerendering)
- No new runtime dependency; the initial JavaScript grows by the strategy only (estimated well under 1 kB; measured 1.2 kB, see results)
- AXE: 0 violations, unchanged; no hydration mismatch

---

## Out of scope (deliberate)

- `schema.org` structured data (spec §5)
- A « page not found » page (idea 7): unknown URLs still end on the home page
- Lighthouse CI (idea 8)
- Submitting the sitemap to Google Search Console (Thomas's account)

---

## Risks

| Risk | Handling |
|---|---|
| WhatsApp and Facebook cache a preview for days or weeks | Checked on the built files before deploying; Facebook's Sharing Debugger can refresh it after (Thomas, optional); D10 |
| The strategy duplicates tags when hydration reuses the prerendered `<head>` | `Meta.updateTag` replaces by selector; links looked up before being added; tested after in-app navigation (Step 4) |
| A description drifts from flat-info.md when the flat's facts change | flat-info.md is the source; the description's French text sits next to the title in `app.routes.ts` |
| Removing `noindex` from `StayComponent` lets it slip | The existing prerendering e2e check on `/stay` stays, unchanged |
| The `en/` copies are needed by something | Nothing links to them; GitHub Pages and crawlers only read the root |

---

**Bolt 23 implemented on 2026-10-03**, after Thomas approved the plan, the copy and the photo.

## Verification results

| Check | Result |
|---|---|
| Production build | « Prerendered 4 static routes », both languages, no warning. `robots.txt`, `sitemap.xml` at the root only; the preview image at `images/share/` |
| Prerendered `<head>` (read on the built files) | `/` and `/en/`: description, 10 `og:` tags, `twitter:card`, canonical, 3 `hreflang` links, no `robots`. `/stay` and `/en/stay`: description and preview tags, `noindex`, no canonical, no `hreflang`. English pages in English, `en_GB`. `404.html`: the title only, as the empty shell |
| Preview image | 1200×630 JPEG, 156 kB, cropped from `sauze-winter-1600w.webp` 15 px from the top, so the « luges interdites » sign at the bottom is left out |
| Unit tests | 224 passing (214 before): 9 for the strategy, 1 for the routes' descriptions, 1 for `languageOf`; the `StayComponent` `noindex` test moved to the strategy (D2) |
| Browser tests | 88 passing, 10 skipped by design: the 62 existing unchanged, plus 26 new (`search-and-sharing.spec.ts`, 13 per width). Three full runs without retries: 264/264 |
| Mutation gate | Stale `robots` or links kept: caught by the unit test and the in-app navigation test. `en/` copies kept: caught. Strategy not provided: every JavaScript-off test fails |
| AXE | 0 violations, unchanged |
| Hydration | No console error on the 4 pages (`prerendering.spec.ts`) |
| Lint, format | Clean |
| Initial JavaScript | 104.5 kB transferred (was 103.3 kB): +1.2 kB, over the 1 kB estimate, because `Meta` moved from the lazy stay chunk into the main bundle, with the two translated descriptions |
| `npm audit` | 0 vulnerabilities |

## Found along the way

- **`LanguageService` cannot be injected into the strategy:** it needs the router, and the router creates the strategy (a circular dependency). The language now comes from `languageOf(LOCALE_ID)`, a small helper both use
- **`serve-dist.mjs` served `.xml` as `application/octet-stream`:** now `application/xml`, as GitHub Pages does
- **The first crop of the preview image cut a sign in half** at its bottom edge; recropped higher

## Noticed, not fixed here

- **`localization.spec.ts` « the flag switches to English and back » failed once** in the first full CI-mode run, then passed on its retry; 30/30 on its own and 6/6 in three full runs without retries afterwards. Most likely a click racing hydration in that existing test; not investigated
- **`localization.md` §4 still names `resolveLanguageRedirect()` in `main.ts`,** removed in Bolt 18

## Left to Thomas

- Push; CI deploys. Then share `https://refugedusauze.com/` in a WhatsApp chat to see the preview (and `/en/` for the English one)
- Optionally: submit `sitemap.xml` in Google Search Console
