# Bolt 10 Plan — Stay Page

**Intent:** Add the router to the site and an unlisted `/stay` page for guests, reached from a link in the booking email and remembered by the guest's browser. The page ships empty of content.
**Date:** 2026-09-21
**Status:** Implemented on 2026-09-21
**Stories:** [stay-page.md](../story-artifacts/stay-page.md) · **Design:** [design-artifacts/stay-page.md](../design-artifacts/stay-page.md) · **Spec:** [stay.md](../functional-specs/stay.md)

---

## Known before the bolt

- **The site has no routing yet.** Most of the bolt is making the home page behave exactly as before behind a route
- **Deep links already work on GitHub Pages:** `404.html` is on the `gh-pages` branch, written by `angular-cli-ghpages`. No build change is needed
- **Unlisted, not private** (BR-1 of `stay.md`): the path is in the public repo and bundle. Acceptable because nothing sensitive will be on the page
- **No content** in this bolt: a heading and a placeholder sentence only

## Steps

- [x] **Step 1 — Update the functional spec**
  - New `functional-specs/stay.md`: FR-1 to FR-12, BR-1 to BR-3
  - Done at plan time, with this document

- [x] **Step 2 — Introduce routing without changing the home page**
  - New `src/app/pages/home/home.ts`: inline template with `<app-hero />` and `<main id="main-content" tabindex="-1">` holding the four sections, moved from `App`
  - `app.ts`: skip link, `<router-outlet />`, footer, photo gallery
  - `app.routes.ts`: `''` → `HomeComponent` with its title; `**` → `''`
  - `app.config.ts`: `withInMemoryScrolling` (anchor scrolling, scroll restoration) and `withRouterConfig({ onSameUrlNavigation: 'reload' })`
  - Check: `npm test` passes and the home page looks and behaves as before

- [x] **Step 3 — Add `GuestAccessService`**
  - `src/app/services/guest-access.service.ts`: `isGuest` read once from `localStorage` (`refuge.guest`), `markAsGuest()`, every storage access in `try/catch`
  - `guest-access.service.spec.ts`

- [x] **Step 4 — Add the lazy `/stay` page**
  - `src/app/pages/stay/stay.ts|html|css`: dark banner with `<app-navbar />` and `h1` « Votre séjour » (`tabindex="-1"`); `main#main-content` with the placeholder sentence
  - Calls `markAsGuest()`; adds `<meta name="robots" content="noindex">` and removes it on destroy
  - `app.routes.ts`: `stay` → `loadComponent`, title « Votre séjour — Notre Refuge au Sauze »
  - `stay.spec.ts`

- [x] **Step 5 — Update the navbar**
  - Imports `RouterLink`, `RouterLinkActive`; injects `GuestAccessService`
  - Logo becomes `<a routerLink="/">`; the four links become `routerLink="/"` + `fragment`
  - « Mon séjour » after Contact under `@if (guestAccess.isGuest())`, `routerLinkActive` with `ariaCurrentWhenActive="page"`, light amber `#d4a97a` (see verification)
  - `navbar.css`: logo link styles (no underline, same look, visible focus ring); `.nav-guest` colour; at ≤ 768px hide every item except `.nav-guest`
  - New `navbar.spec.ts`

- [x] **Step 6 — Focus and skip link**
  - `app.ts`: on `NavigationEnd` (not the first one), focus the fragment target (adding `tabindex="-1"` if needed, `preventScroll`), otherwise the page's `h1`
  - Skip link: `(click)` handler with `preventDefault()` that focuses `#main-content` on the current page
  - `app.spec.ts`: router outlet and footer render; skip link focuses `main`
  - New `app.routes.spec.ts` with `RouterTestingHarness`

- [x] **Step 7 — Verify**
  - `npm test` and a production build pass; the build lists a separate lazy chunk for the stay page
  - Home at 1280px, before visiting `/stay`: identical to today, no « Mon séjour »; each of the four links scrolls, including a second click on the same one; « Nous contacter » still scrolls
  - `/stay` opened directly and reloaded: banner, heading, placeholder, footer; tab title; `noindex` present (and absent after returning home)
  - From `/stay`: logo → home at the top; each section link → home scrolled to it; back/forward restore position
  - After visiting: « Mon séjour » on both pages, `aria-current="page"` on `/stay`; still there after a browser restart
  - 375px: only « Mon séjour » visible in the navbar, tappable at 44px or more; nothing visible without the flag
  - Keyboard: skip link on both pages stays on the page and lands in `main`; focus lands on the `h1` after arriving on `/stay` and on the section after a section link
  - Contrast of amber « Mon séjour » and of the logo link on the dark backgrounds, at 4.5:1 or more
  - AXE on both pages: no violation beyond the known `color-contrast` backlog
  - After `ng deploy`: `https://refugedusauze.com/stay` opens the page (done by Thomas, since deploying is his manual step)

---

## NFRs

- Standalone, `OnPush`, signals, `inject()`, native control flow, lazy-loaded feature route
- Visible copy French; route paths, ids, class names and TypeScript symbols English
- WCAG AA: page titles, focus managed across navigation, visible focus, contrast, `aria-current`
- No public trace of `/stay`: no link without the flag, `noindex`, no `robots.txt` or sitemap entry

---

## Out of scope (deliberate)

- The stay page's content (arrival, inventory, hikes, shops, rubbish) — next bolt, once Thomas has listed it
- Access codes, stay dates, expiry, encryption — declined for non-sensitive content
- A mobile menu for the four section links
- Moving the photo gallery out of `App`
- `--stone` / `.section-label` contrast (still owed to the accessibility bolt)

---

## Risks

| Risk | Handling |
|---|---|
| Anchor scrolling lands under the absolutely positioned navbar, or misses sections rendered after a lazy load | The navbar is not sticky, so no offset is expected; checked for each section in step 7 |
| `onSameUrlNavigation: 'reload'` re-runs route logic on every repeat click | Both pages are static; the only effect is the scroll, which is the goal |
| `localStorage` blocked (private browsing, Safari limits) | `try/catch`; the flag lasts for the visit only (BR-3) |
| The stay page's `noindex` leaking onto the home page after navigation | Removed on destroy through `DestroyRef`; asserted in `stay.spec.ts` and in the browser |
| Focus handling fighting the browser's own behaviour on first load | Skipped for the first `NavigationEnd` |

---

**Bolt 10 implemented on 2026-09-21.** The last check of step 7, `/stay` on the live site, is left for Thomas after `ng deploy`.

## Verification results

| Check | Result |
|---|---|
| `npm test` | 125 tests pass (16 files), up from 106. New: `guest-access.service`, `navbar`, `stay`, `app.routes`; `app.spec` extended |
| Production build | Succeeds. `stay` is a separate lazy chunk of 1.76 kB. The initial bundle grows 256.55 → 286.65 kB raw (76.8 kB transferred): the Angular router, loaded by the site for the first time |
| Home, no guest flag | Four section links, no « Mon séjour », no `noindex`, title « Notre Refuge au Sauze » |
| Section links on home | Each scrolls to its section and focuses it; a second click on the same link, after scrolling away, scrolls again. « Nous contacter » still scrolls |
| `/stay` opened directly | Banner, « Votre séjour », placeholder, footer; no home section; tab title correct; `noindex` present; guest flag written; « Mon séjour » carries `aria-current="page"` |
| From `/stay` | Contact → home, scrolled to Contact, `noindex` gone; logo → home at the top, focus on the hero `h1` |
| Back / forward | Back from home to `/stay` and forward again; returning to home restores the scroll position (2000 px → 2000 px) |
| Skip link on `/stay` | Stays on `/stay`, focus on its `main` |
| Mobile 375px | Guest: only « Mon séjour » visible, 92×44; no horizontal overflow. Non-guest: the list renders nothing |
| AXE 4.10.2 | Home: the 9 known `color-contrast` nodes (`.section-label`, `.stat-label`, `.footer-copy`), nothing new. `/stay`: only `.footer-copy`, the same known node |
| Console | No errors |

## Found and fixed during verification

**A white strip below the footer on `/stay`.** The page is shorter than the window, so the body background showed under the footer. `App` is now a full-height flex column, and the stay page takes the remaining height, with its content area stretching. The home page is unaffected, since the hero alone fills the window.

**« Mon séjour » in `--amber` failed contrast.** `--amber` reaches 4.42:1 on `--bark` but only 3.22:1 on the pine part of the banner gradient, under the 4.5:1 small text needs. The link uses `#d4a97a` instead, the light amber of « Refuge » in the hero title, at 4.54:1 at worst (pine) and 6.24:1 on bark. It is still read as the guest's accent, and the active page shows it in `--cream`.

## Noted during verification

**Smooth scrolling does not run in a hidden Browser pane.** A first test from `/stay` to Contact left the page at the top. The router had called `scrollTo` correctly; the hidden pane simply never animated it. With smooth scrolling switched off for the test, the same click lands on Contact. Anyone re-testing scroll behaviour should keep the pane visible or do the same.

**A section link or the logo replaces the history entry rather than adding one** when only the `#fragment` differs (`/#contact` → `/`). This is Angular's standard behaviour: it compares paths without the fragment. The effect is desirable: clicking through the four sections does not fill the Back history, and Back from the home page returns to `/stay`.

**On back/forward, focus moves to the page's `h1` with `preventScroll`,** so scroll restoration is not disturbed. Checked on the home page after Back.

**Pre-existing, not touched:** the logo's « Refuge » in `--amber` has the same 3.2:1 shortfall on the pine gradient now that it is a link; it belongs to the accessibility bolt with the other `--amber` text.
