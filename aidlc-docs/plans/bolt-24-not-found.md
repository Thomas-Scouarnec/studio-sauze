# Bolt 24 Plan — Page Not Found

**Intent:** Show a real « page not found » page, in the visitor's language, at any unknown address, instead of silently redirecting to the home page. Idea 7 of Session 18.
**Date:** 2026-10-03
**Status:** Implemented on 2026-10-03
**Stories:** [not-found.md](../story-artifacts/not-found.md) · **Design:** [design-artifacts/not-found.md](../design-artifacts/not-found.md) · **Spec:** [not-found.md](../functional-specs/not-found.md)

---

## Known before the bolt

- **Today:** `**` redirects to `/`; `404.html` is the empty client-side shell, so a broken link shows a blank page, then the home page
- **A spike confirmed the approach** (design artifact): the wildcard cannot be prerendered, but a `404` route rendering the same component can, and its HTML hydrates cleanly at any unknown address, with status 404 and the address kept
- **GitHub Pages serves only the root `404.html`,** the French one: English needs a choice (D3)
- **Copy to validate:** four lines, in the design artifact
- **Work on `main`,** as agreed in Session 15

## Steps

- [x] **Step 1 — Shared banner**
  - `.page-banner`, `.page-banner-bg`, `.page-title` move from `stay.css` to `styles.css`; the stay page uses them
  - Gate: the stay page at both widths pixel-identical before and after; `npm test` and `stay-nav.spec.ts` pass

- [x] **Step 2 — `NotFoundComponent` and routes**
  - The page (banner with navbar, heading, sentence, home link); `404` and `**` routes with the translated title; the redirect removed
  - Unit tests: the page's content; an unknown path keeps its address and shows the page; `noindex` with no description
  - Gate: `npm test` passes; the English build succeeds with the four new units

- [x] **Step 3 — The build**
  - `finish-static-build.mjs`: `404/index.html` → `404.html` (both languages), no more `index.csr.html` copy; the `/en/` → `/en/404` script first in the root `404.html` (D3)
  - Gate: `404.html` holds « Page introuvable » and the script, `en/404.html` holds « Page not found »; no `404/` folder

- [x] **Step 4 — Browser tests**
  - `e2e/not-found.spec.ts`: `/nowhere`, `/a/b/c`, `/stay/oops` → 404, address kept, French page, title; with JavaScript off too; `/en/nowhere` → English page; saved English at `/nowhere` → English page; the home link; hydration keeps the `<h1>` with no console error beyond the 404 itself
  - The old « then the home page » test removed; AXE on both languages
  - Gate: each new test fails when its behaviour is broken on purpose (redirect restored, English script not written, the shell as `404.html`)

- [x] **Step 5 — Verify and record**
  - `npm test`, `npm run lint`, `npm run format:check`, `npm run e2e`; a look at the page at both widths
  - stay.md FR-12 and the README updated; results in this plan; Session 24 closed in `prompts.md`

---

## NFRs

- Static only; GitHub Pages unchanged
- Standalone, `OnPush`, lazy-loaded; nothing browser-only while prerendering
- The initial JavaScript does not grow beyond the two route entries (the page is its own chunk)
- AXE: 0 violations, including the new page; no hydration warning
- WCAG: one `<h1>`, a `main` landmark the skip link reaches, focus on the heading after in-app navigation, `lang` right in both languages

---

## Out of scope (deliberate)

- Lighthouse CI (idea 8)
- Showing the address asked for on the English page
- Suggesting a nearby page

---

## Risks

| Risk | Handling |
|---|---|
| Hydrating the `404` route's HTML at another address mismatches later, if the page ever shows something address-dependent | The e2e hydration check fails on it; the page shows nothing that depends on the address |
| The `/en/` script loops | It only runs in the root `404.html`; `/en/404` is a real file, served without it; tested |
| GitHub Pages serves `/404` and `/en/404` with status 200 | They show the page and are `noindex`; nothing links to them |
| The banner move changes the stay page | Pixel comparison at both widths (Step 1) |

---

**Bolt 24 implemented on 2026-10-03**, after Thomas approved the plan, the copy and D3 (the redirect to `/en/404`).

## Verification results

| Check | Result |
|---|---|
| Production build | « Prerendered 6 static routes » (`404` added in both languages); after `finish-static-build.mjs`: `404.html` (French, the `/en/` script first in `<head>`) and `en/404.html` (English); no `404/` folder |
| Shared banner (Step 1) | `/stay` and `/en/stay`, full page at 1280 and 375 px: pixel-identical before and after |
| Unit tests | 232 passing (224 before): 4 for the page, 5 for the routes (three unknown addresses kept with the title, `/404`, `noindex` with no description); the old redirect test removed |
| Browser tests | 108 passing, 10 skipped by design: 18 new in `not-found.spec.ts` (9 per width), 4 new AXE scans; the old « then the home page » test removed (2) |
| New tests | 404 status, address kept, French page with JavaScript off at `/nowhere`, `/a/b/c`, `/stay/oops`; `/en/nowhere` → `/en/404` with the app's JavaScript blocked; saved « English » → `/en/404`; `/en/404` served directly, no loop; French stays French; hydration keeps the `<h1>` with no error; the home link, with focus on the home page's heading |
| Mutation gate | Redirect restored: 3 tests fail. English script not written: 2. Empty shell as `404.html`: 6 |
| AXE | 0 violations, the new page included, both languages, both widths |
| Lint, format | Clean |
| Initial JavaScript | 104.95 kB transferred (was 104.47 kB): +0.5 kB, the two route entries; the page is its own lazy chunk |
| `npm audit` | 0 vulnerabilities |
| By eye | Both languages at both widths: the stay page's banner and navbar, the sentence, the home link; footer at the bottom |

## Found along the way

- **The JavaScript-off tests cannot cover English:** the `/en/` redirect is itself a script. With JavaScript disabled, `/en/nowhere` shows the French page; the English tests block only the app's JavaScript instead, as the prerendering tests do
- **`TestBed.overrideProvider` takes no `useClass`:** the routes' `noindex` test provides the strategy through `useFactory`

## Left to Thomas

- Push; CI deploys. Then open `https://refugedusauze.com/nowhere` and `/en/nowhere`
