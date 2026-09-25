# Bolt 12 Plan — Localization

**Intent:** Offer the whole site in French (default) and English with Angular's built-in i18n, switched by small flags in the navbar, with the visitor's choice remembered in their browser.
**Date:** 2026-09-25
**Status:** Implemented on 2026-09-25
**Stories:** [localization.md](../story-artifacts/localization.md) · **Design:** [design-artifacts/localization.md](../design-artifacts/localization.md) · **Spec:** [localization.md](../functional-specs/localization.md)

---

## Known before the bolt

- **Built-in i18n puts the language in the URL.** Thomas chose to keep it, with French at `/` (unchanged) and English at `/en/`
- **Checked in a throwaway build:** an empty `subPath` works for French, and the build sets `<html lang>` and `<base href>` for each language. `@angular/localize` must match the installed Angular (21.2.13): `^21.2.0` would pull 21.2.24 and fail peer resolution with `npm ci`
- **Switching language is a page load** to the other app, not an instant swap
- **About 160 texts** to mark: templates in 10 components, and the text held by 4 services and the routes
- **GitHub Pages serves one `404.html`** (the French app), so `/en/stay` needs its own file
- **`ng serve` runs one language at a time.** In development, a flag click to `/en/…` shows the French app (the redirect is guarded against looping)

## Decisions for Thomas to confirm in review

| # | Decision | Recommended |
|---|---|---|
| D1 | The brand **Notre Refuge au Sauze** stays French in English: logo, hero title, footer, tab titles | Keep: it is the name of the place and of the domain |
| D2 | **British flag and British English** (flat, lift, car park, tyres) | British: closest English-speaking market, and it matches the flag |
| D3 | **Saved choice vs URL:** a saved « English » redirects French URLs; an `/en/` URL always shows English and never changes the saved choice | As described. The alternative, where the saved choice always wins, would bounce a French-preferring visitor off an English link sent to them |
| D4 | External sites that are French-only are marked « (in French) » in English: the Ubaye tourist offices and Sécurité Routière | Mark them. sauze.com is checked in the browser during step 9 |
| D5 | **Translation file format:** ~~JSON~~ **XLIFF 1.2** | Changed by Thomas in review: XLIFF is what he uses at work |
| D6 | **Image URLs become absolute** (`/images/…`) so both languages share the browser cache | Yes. The build still writes a second copy of the photos under `en/` on `gh-pages` (+1.2 MB, not downloaded twice) |
| D7 | **Deploying becomes `npm run deploy`** instead of `ng deploy`, which adds the `/en/stay` file | Required by FR-11; documented in the README |

## Steps

- [x] **Step 1 — Specs**
  - New `functional-specs/localization.md`: FR-1 to FR-14, BR-1 to BR-7
  - Done at plan time, with this document

- [x] **Step 2 — Install and configure i18n**
  - `npm i -D @angular/localize@21.2.13` (matching the installed core); `/// <reference types="@angular/localize" />` via `tsconfig.app.json` / `tsconfig.spec.json` types
  - `angular.json`: `i18n` block (`fr` with `subPath: ""`, `en` with `subPath: "en"`), `localize: true`, `i18nMissingTranslation: "error"`, `@angular/localize/init` polyfill, `development` serves `fr`, new `en` build configuration and `development-en` serve configuration, `extract-i18n` with `outputPath: src/locale` (default XLIFF 1.2)
  - `package.json`: `start:en`, `extract-i18n`
  - `src/test-setup.ts`: `import '@angular/localize/init'`
  - Check: `npm test` still passes, `ng build` produces `browser/` and `browser/en/`

- [x] **Step 3 — Mark the templates**
  - `i18n="@@…"`, `i18n-alt`, `i18n-aria-label` in: `app.ts` (skip link), `navbar.ts`, `hero.html`, `about.html`, `equipment.html`, `seasons.html` (tag list label, new-tab hint), `contact.html`, `footer.ts`, `photo-gallery.html`, `stay.html`
  - Mixed content (`<strong>`, `<br>`, `{{ }}`) stays in one unit, so word order can change in English

- [x] **Step 4 — Mark the service content and the routes**
  - `$localize` with `@@` ids in `FlatInfoService` (station, equipment blocks and items, photo alts), `SeasonsService`, `ContactService.requestChecklist`, `StayService` (all sections), `app.routes.ts` titles
  - Values inside sentences become named placeholders (`${email}:email:`, `${residenceName}:residence:`)
  - Brand, residence and place names stay out of translation (BR-1)

- [x] **Step 5 — Write the English**
  - `npm run extract-i18n` → `src/locale/messages.xlf` (committed: the list of every text)
  - `src/locale/messages.en.xlf` from the reviewed copy in the design artifact
  - Check: `ng build` passes with `i18nMissingTranslation: "error"`; a deliberately removed key fails it (then restored)

- [x] **Step 6 — Remember the choice**
  - `src/app/language-redirect.ts` (`resolveLanguageRedirect`, `LANGUAGE_STORAGE_KEY = 'refuge.lang'`) + spec covering the rule table
  - `main.ts`: read the saved language (in `try/catch`), `location.replace()` and skip bootstrap on a redirect
  - `src/app/services/language.service.ts` (`current`, `links`, `choose`) + spec

- [x] **Step 7 — The flag switcher**
  - New `src/app/components/language-switcher/` (inline template, inline SVG flags, `OnPush`) + spec
  - `navbar.ts`: renders it after the link list; `navbar.css`: aligned with the links, visible at every width, 44 × 44 targets on phones, keeps the guest link fitting at 320 px
  - `navbar.spec.ts` extended

- [x] **Step 8 — GitHub Pages and docs**
  - `responsive-image-loader.ts`: `/images/…` (its spec updated)
  - `scripts/i18n-deep-links.mjs`: `en/index.html` → `en/stay.html`
  - `package.json`: `deploy` = `ng build && node scripts/i18n-deep-links.mjs && ng deploy --no-build`
  - `src/index.html`: `hreflang` alternates (FR-13)
  - `README.md`: development in both languages, adding a text, `npm run deploy`; remove « Localization » from the TO DO

- [x] **Step 9 — Verify**
  - `npm test` and the production build pass; the build lists `browser/` and `browser/en/`; each main bundle holds only its own language
  - French at 1280px and 375px: identical to today apart from the flags; `<html lang="fr">`
  - Every section in English, home and `/stay`, including the gallery, alt texts (checked in the accessibility tree), tab titles and `<html lang="en">`; no French left except proper names
  - Flag from `/stay#arrival` → `/en/stay#arrival`, and back; from the home page at Contact → English at Contact
  - Saved choice: British flag → reopen `/` and `/stay` → English, with no French flash; French flag → French again; after a browser restart; with storage blocked → French, no error
  - `/en/stay` opened with « French » saved → English, choice unchanged (D3)
  - « My stay » in English after visiting the French `/stay`, and the other way round
  - Keyboard: both flags reachable, focus ring visible, the current one announced as current; names read in their own language
  - 320px and 375px: flags and « Mon séjour » fit on one line, 44px targets, no horizontal overflow
  - AXE on both pages in both languages: nothing beyond the known `color-contrast` backlog
  - Served locally from `dist/` with a static server that mimics GitHub Pages (`404.html`, `.html` resolution): `/en/stay` direct and reloaded
  - After `npm run deploy`: `https://refugedusauze.com/en/stay` and `/en/` (done by Thomas, since deploying is his manual step)

---

## NFRs

- Standalone, `OnPush`, signals, `inject()`, native control flow; no new runtime dependency (`@angular/localize` is build-time, plus a small `init` polyfill)
- Initial bundle per language: no bigger than today by more than the switcher and the polyfill (a few kB); no translation table shipped at runtime
- WCAG AA: `<html lang>`, `lang` on the language names, `aria-current`, visible focus, 44px targets
- Route paths, ids, class names and TypeScript symbols English; visible copy French in the source

---

## Out of scope (deliberate)

- A third language
- Detecting the browser's language on first visit
- Translating proper names or the brand (D1)
- A mobile menu for the four section links (still hidden on phones)
- `--stone` / `.section-label` contrast (still owed to the accessibility bolt)

---

## Risks

| Risk | Handling |
|---|---|
| A text left unmarked stays French in the English site | Step 9 reads every section in English; the extracted `messages.xlf` is reviewed for gaps |
| Rewording French later leaves the English stale without warning | Custom ids keep the link; the README tells Thomas to update `messages.en.xlf` for any id whose French changed (`git diff src/locale/messages.xlf` shows it) |
| Redirect loop between languages | The redirect only runs from the French app, never towards a path already under `/en/`; unit-tested |
| `ng deploy` used out of habit, so `/en/stay` falls back to French | README and D7; the only impact is that deep link, and the next `npm run deploy` restores it |
| GitHub Pages serves `/en/stay` differently from the local static server | Checked on the live site after deploy; fallback is `en/stay/index.html` |
| Vitest and `$localize` | `@angular/localize/init` in the test setup; specs keep asserting French |
| The navbar gets crowded on small phones with « Mon séjour » and two flags | Checked at 320px in step 9 |

---

**Bolt 12 implemented on 2026-09-25.** Thomas approved the plan and the English copy as written, except D5 (XLIFF instead of JSON). The last check of step 9, `/en/stay` and `/en/` on the live site, is left for Thomas after `npm run deploy`.

## Verification results

| Check | Result |
|---|---|
| `npm test` | 161 tests pass (20 files), up from 139. New: `language-redirect`, `language.service`, `language-switcher`; `navbar` extended; image specs follow the absolute URLs |
| Production build | Succeeds with `i18nMissingTranslation: "error"`: `browser/` (`lang="fr"`, `<base href="/">`) and `browser/en/` (`lang="en"`, `<base href="/en/">`). Each main bundle holds only its own language. Removing `hero.cta` from the English file fails the build with « No translation found for "hero.cta" » |
| Texts | 165 translation units, every one with a custom id |
| Bundle | Initial 286.73 → 318.57 kB raw (77.2 → 87.6 kB transferred). The shared vendor chunk grows 26 kB, most likely Angular's i18n template runtime (its ICU error strings now appear there), which built-in i18n pulls in once templates carry `i18n` attributes. `main` grows 3 kB; `@angular/localize/init` adds 2.4 kB. Far below the 500 kB budget |
| First visit | `/` in French, « Français (langue actuelle) », title « Notre Refuge au Sauze » |
| British flag from `/#contact` | → `/en/#contact`, `lang="en"`, `refuge.lang = en` |
| Saved English | `/` → `/en/`; `/stay#arrival` → `/en/stay#arrival`, « Your stay », tab « Your stay — Notre Refuge au Sauze »; the app does not bootstrap before redirecting |
| French flag from `/en/stay#arrival` | → `/stay#arrival`, « Votre séjour », `refuge.lang = fr` |
| `/en/stay` with French saved (D3) | 200, English, saved choice still `fr` |
| Fresh visitor on `/en/stay` | 200 from `en/stay.html` (static server mimicking GitHub Pages), English, and on reload |
| « My stay » | After visiting the French `/stay`, shown on `/en/` and linking to `/en/stay` |
| French left on English pages | None: every accented or French-looking string on `/en/` and `/en/stay` is a proper name (Le Roi Soleil, Crépuscule, Intermarché, Serre-Ponçon…) or « Français ». Gallery: « Photo 1 of 5 », « Photo gallery of the studio » |
| Storage blocked | French, both flags work, no error |
| 320px and 375px | Logo, « Mon séjour » and both flags on one line, no horizontal overflow, flag targets 32 × 44 |
| Keyboard | Both flags reachable; amber focus ring; list named « Language » / « Langue »; current flag read « English (current language) » |
| AXE 4.10.2 | `/` and `/en/`: the 9 known `color-contrast` nodes; `/stay` and `/en/stay`: the known `.footer-copy` node. Nothing new, identical in both languages |
| Console | No errors from the site (Google Fonts are blocked by the sandbox proxy) |

## Found and fixed during verification

**The current flag was not announced as current.** `aria-current` sat on a `<span>`, which Chrome treats as a generic element and leaves out of the accessibility tree with its attributes. The state is now visually hidden text, « (langue actuelle) » / « (current language) », with `lang` only on the language name. Found by reading Chrome's accessibility tree, not by AXE, which does not flag it.

**The navbar wrapped at 320px.** With two 44px flag targets, the logo and « Mon séjour » broke onto two lines. Below 400px the targets narrow to 32 × 44 (WCAG AA asks for 24px); the logo and « Mon séjour » no longer wrap; the navbar keeps a 0.75rem minimum gap.

**The current-language underline was barely visible** as a box-shadow on the flag. It is now a 2px `--cream` bar under the flag.

**A space was lost in « Français (langue actuelle) ».** Angular drops whitespace-only text nodes between elements, so the space now sits inside the translated text.

## Noted during verification

- `/stay` and unknown `/en/…` paths are still served by the French `404.html` with status 404, as before this bolt. Only `/en/stay` has its own file
- Links to sauze.com are not marked « (in French) »: the check against the live site could not be made from the sandbox, so D4 is applied only to the two sites known to be French-only
