# Bolt 15 Plan — Home Mobile Navigation

**Intent:** On phones, a sticky bar on the home page: the current section, a menu of the sections plus « Mon séjour » and the language, and a permanent « Contact » shortcut.
**Date:** 2026-09-28
**Status:** Implemented on 2026-09-28
**Stories:** [home-mobile-nav.md](../story-artifacts/home-mobile-nav.md) · **Design:** [design-artifacts/home-mobile-nav.md](../design-artifacts/home-mobile-nav.md) · **Spec:** [navigation.md](../functional-specs/navigation.md)

---

## Known before the bolt

- **The pattern exists:** Bolt 14's compact bar. Its open/close behaviour and `spyOnSections()` move to `src/app/shared/` first, so both pages share them
- **The navbar's breakpoint is 768px (in px);** the bar uses the same value, so the two always switch together
- **Three new texts;** the section titles, « Contact » and « Mon séjour » reuse the navbar's translations
- **Work on `main`,** as agreed in Session 15

## Steps

- [x] **Step 1 — Specs**
  - New `navigation.md` (FR-1 to FR-9, BR-1 to BR-3)
  - Done at plan time, with this document

- [x] **Step 2 — Extract the shared code (no behaviour change)**
  - `spyOnSections()` and its tests moved to `src/app/shared/`
  - `DisclosureDirective` (+ spec) from Bolt 14's code; `StayNavComponent` refactored onto it
  - Gate: all existing tests pass unchanged, including the ten Bolt 14 compact-bar tests

- [x] **Step 3 — One list of home sections**
  - `HOME_SECTIONS`; the navbar's four links become an `@for` over it, same translation ids
  - Gate: navbar tests unchanged and passing; `extract-i18n` shows no lost or new `nav.*` key

- [x] **Step 4 — `HomeNavComponent`**
  - Button with the current section, « Contact » pill, panel with the sections, « Mon séjour », the flags
  - `home-nav.css`: shown below 769px only
  - `home-nav.spec.ts`: label and spoken label, `aria-current`, guest-only « Mon séjour », Contact always present, closing through the directive

- [x] **Step 5 — Wire it into the home page**
  - `home.ts`: the bar in `main`, `spyOnSections()` over the four sections, the router offset (0 when the bar is hidden) reset on destroy, focus clearance under 768px
  - `home.spec.ts`: bar present, offset set and reset

- [x] **Step 6 — Translations**
  - `extract-i18n`; English targets for the three keys

- [x] **Step 7 — Verify**
  - `npm test` and a production build, both languages
  - At 375px and 320px, FR and EN: the bar under the hero, then stuck to the end; the label follows the four sections; the list opens and closes with each trigger; each section and « Contact » land with the heading below the bar and focus on it; « Mon séjour » for a guest only; a flag keeps working from the menu
  - Tab and Shift+Tab through the whole home page: nothing under the bar, no jump when focus reaches it
  - At 769px and 1280px: no bar; the navbar's links land exactly as before (offset 0). (768px itself is a phone width: the navbar rule is `max-width: 768px`)
  - `/stay` at 375px and 1280px: Bolt 13 and 14 behaviour unchanged (the refactor)
  - AXE on `/` and `/en/`, list closed and open: nothing beyond the known `color-contrast` nodes

- [x] **Step 8 — Record the bolt**
  - Results in this plan; Session 15 closed in `prompts.md`

---

## NFRs

- Standalone, `OnPush`, signals, `computed()`, `input()`, `contentChild()`, a directive with `host` and `exportAs`, `inject()`, native control flow; no `@HostListener`
- WCAG AA: 1.3.1, 2.1.2, 2.4.3, 2.4.11, 2.5.8, 4.1.2, 1.4.3; distinct landmark names (BR-2)
- No change on desktop

---

## Out of scope (deliberate)

- A sticky navbar on desktop
- Hiding the bar while scrolling down
- Any change to the `/stay` bar's behaviour (only its code moves)

---

## Risks

| Risk | Handling |
|---|---|
| The refactor changes the `/stay` bar | Step 2 is gated by its existing tests, and `/stay` is checked again in the browser |
| The bar and the Contact form's fields: focus under the bar | Focus clearance on form fields too; the Tab/Shift+Tab check covers the form |
| Two `nav` landmarks with one name | Distinct names (BR-2); AXE `landmark-unique` in the check |
| The bar hides part of the hero on a short phone | It sits below the hero, not over it; it only sticks once the hero is gone |

---

**Bolt 15 implemented on 2026-09-28**, after Thomas approved the plan.

## Verification results

| Check | Result |
|---|---|
| Unit tests | 222 passing: 18 new (6 `DisclosureDirective`, 10 `HomeNavComponent`, 2 `HomeComponent`); the Bolt 13 and 14 tests unchanged |
| Production build | Both languages, no warning; 204 translation units (3 new, the `nav.*` ones reused) |
| Home bar (headless Chromium, 375 / 320 / 768px FR, 375px EN) | Right under the hero, then stuck at 0 to the end; « Menu », then each of the four sections while scrolling; « Contact » 44px tall; no horizontal page scroll |
| Jumps | A section from the menu and the « Contact » shortcut: the section's top edge flush with the bar, focus on the section, the label naming it; also after coming from `/stay` |
| Closing | Choosing, tap outside, Escape (focus back on the button) |
| Guest and language | « Mon séjour » in the menu for a guest only; the flag in the menu opens `/en/` (and `/` from English) |
| Keyboard, whole home page | Tab and Shift+Tab: no focused element under the bar; no page jump when focus reaches the stuck bar |
| Desktop (769 and 1280px) | No bar; the navbar's « Équipements » lands at 0, as before |
| `/stay` after the refactor | Bolt 13 and 14 checks all pass again: chips at 1280px, compact bar below, every closing trigger, keyboard |
| AXE 4.10 (WCAG 2.2 AA + best practice) | Home, list closed and open, FR and EN: the 9 known `color-contrast` nodes only; `/stay`: the known `.footer-copy` node |

## Found and fixed during the build

- **The label named the previous section after a jump.** Sections land flush with the bar, so the one just scrolled past touched the reading band's edge, and an observer counts touching as intersecting. The band now starts 1px below the bar. Found on a screenshot (« Activités » over « Écrivez-nous »); a check for the label after each jump was added
- **No gap under the bar on the home page.** The 16px gap of `/stay` would show a strip of the previous section's background above the chosen one: the offset is the bar's height exactly
- **The focus-clearance rule could not live in `HomeComponent`'s styles.** Emulated encapsulation scopes every part of a selector to the component, so it never matched the links inside the section components. It is in `styles.css`, scoped with `app-home`
- **The language switcher on a light background:** its cream underline and amber focus ring were drawn for the dark hero. It now exposes three CSS custom properties (defaults unchanged); the menu sets rust
- **768px is a phone width:** the navbar's rule is `max-width: 768px`. Spec, stories and checks now say « up to 768px », with desktop checks at 769px

## Noticed, not fixed here

- **`npm run start:all` crashed twice more** while new translations were missing (the known issue, already offered as a separate task)
- **An `NG02955` warning** (a photo detected as LCP without `priority`) appears in dev when a script scrolls a phone-sized page without user input. It appears with the bar hidden too: not from this Bolt. A real tap or scroll ends the measurement

## Left to Thomas

- A try on a real phone
