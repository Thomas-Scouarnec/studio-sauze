# Bolt 14 Plan — Stay Compact Navigation

**Intent:** On phones and tablets, a compact bar « 5/9 · Activités » with a progress line, opening the full list of sections, instead of the sideways row of chips.
**Date:** 2026-09-28
**Status:** Implemented on 2026-09-28
**Stories:** [stay-compact-nav.md](../story-artifacts/stay-compact-nav.md) · **Design:** [design-artifacts/stay-compact-nav.md](../design-artifacts/stay-compact-nav.md) · **Spec:** [stay.md](../functional-specs/stay.md)

---

## Known before the bolt

- **Only `StayNavComponent` changes.** The page, `spyOnSections()`, the heading numbers, the router offset and « Haut de page » stay as Bolt 13 left them
- **The chips fit from 1280px** in both languages (measured in Bolt 13), hence the switch at 80em
- **Two new texts:** « Section 5 sur 9 : » / « Section 5 of 9: », and « Sommaire » as a visible label

## Steps

- [x] **Step 1 — Update the specs**
  - `stay.md`: FR-14 and FR-22 reworded, FR-27 and FR-28 added, revision history
  - Done at plan time, with this document

- [x] **Step 2 — Compact bar and list**
  - `stay-nav.ts`: toggle button, `open`, `position`, `progress`, `toggle()`, `close()`; Escape, focus-out and outside-click closing; links close the list
  - `stay-nav.css`: under `max-width: 79.99em`, the button and the progress line shown, the chips hidden, the open list below the bar

- [x] **Step 3 — Tests**
  - `stay-nav.spec.ts`: « Sommaire » above the first section; « 5/9 · Activités » and « Section 5 sur 9 : »; `aria-expanded`; each closing trigger; focus back on Escape; progress 0, 5/9, 1
  - The Bolt 13 tests unchanged and passing

- [x] **Step 4 — Translations**
  - `ng extract-i18n`; English targets for the two new keys

- [x] **Step 5 — Verify**
  - `npm test` and a production build, both languages
  - At 375px and 320px (and 1024px, a tablet): the bar follows the sections, the line fills to the end, the list opens, scrolls on its own if needed, and closes with each trigger; a chosen section lands below the bar with focus on it
  - At 1280px: the chips exactly as before, no toggle button in the tab order
  - Keyboard at 375px: Tab to the bar, Enter opens, Tab through the list, Escape returns to the bar
  - With reduced motion emulated: the line jumps instead of sliding
  - AXE on `/stay` and `/en/stay`, list closed and open: nothing beyond the known `.footer-copy` contrast

- [x] **Step 6 — Record the bolt**
  - Results in this plan; Session 14 closed in `prompts.md`

---

## NFRs

- Standalone, `OnPush`, `signal()` / `computed()`, `host` object instead of `@HostListener`, native control flow
- WCAG AA: 1.3.1 (disclosure with `aria-expanded` and `aria-controls`), 2.1.2 (no keyboard trap), 2.4.3 (focus order), 2.4.11 (focus not hidden by the bar), 2.5.8 (targets of 44px), 4.1.2 (name and state), 1.4.3 (contrast of the list and the line)
- One `nav` landmark, one list of links, whatever the width

---

## Out of scope (deliberate)

- The home page navigation (a separate Bolt, discussed in Session 13)
- Previous and next arrows (option 3 of Session 14)
- Any change to the chips on wide screens

---

## Risks

| Risk | Handling |
|---|---|
| The open list covers the text the guest wanted to read | It closes on any outside tap, on Escape and on choosing |
| A long list on a short phone (320 × 568) | Capped at the screen height under the bar, scrolling on its own |
| The outside-click listener runs on every click of the page | One cheap `contains()` check; it returns at once when the list is closed |
| 80em doesn't match where the chips stop fitting after a text change | The breakpoint is one line of CSS; checked in both languages at 1280px |

---

**Bolt 14 implemented on 2026-09-28**, after Thomas approved the plan.

## Verification results

| Check | Result |
|---|---|
| Unit tests | 204 passing: 10 new for the compact bar; 3 runs in a row |
| Production build | Both languages, no warning |
| Compact bar (headless Chromium, 375 / 320 / 1024px FR, 375px EN) | « Sommaire » above the first section; « 1/9 · Bienvenue » to « 9/9 · Après votre séjour » while scrolling; progress 0.11 → 1; screen readers hear « Section 9 sur 9 : Après votre séjour » / « Section 9 of 9: After your stay » |
| Open list | Below the bar, fits a 568px-tall screen, entries 44px, current section marked |
| Choosing a section | List closed; heading 16px below the bar; focus on the section |
| Closing | Tap on the bar, tap outside, Escape (focus back on the bar), Tab out of the list: all close it |
| 1280px | Chips as in Bolt 13; the hidden button is not in the tab order |
| Keyboard, whole page (1280 / 375 / 320px) | 136 to 141 focus stops, Tab and Shift+Tab: none under the bar, no page jump when focus reaches the bar |
| Motion | Progress line: 0.3s slide by default, instant with reduced motion |
| AXE 4.10 (WCAG 2.2 AA + best practice) | List closed and open, FR and EN: only the known `.footer-copy` contrast node |
| Console | No error; no horizontal page scroll |

## Found and fixed during the build

- **Focusing the sticky bar made the page jump about 410px up** — a Bolt 13 defect, on desktop (a chip) as well as on phones (the bar). `scroll-padding-top` on the page counted the bar's own area as hidden, so the browser « revealed » the bar by scrolling. Replaced by `scroll-margin-top` on the links and buttons inside the sections: they still stay clear of the bar (FR-25), and the bar itself no longer moves the page. Bolt 13's keyboard check skipped elements inside the bar, which is how it slipped through; the new check covers them
- **A template reference named `#toggle` hid the `toggle()` method** inside the template (compile error). Renamed `#bar`

## Noticed, not fixed here

- **`npm run start:all` crashes when the English build fails**: the French server's proxy to port 4201 has no error handler, so a connection reset kills it. Happened once while the English translations were still missing. A small fix in `scripts/start-all.mjs`, outside this Bolt's scope

## Left to Thomas

- A try on a real phone: tapping the bar, the list, the progress line
