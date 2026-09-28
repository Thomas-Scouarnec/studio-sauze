# Bolt 13 Plan — Stay Navigation

**Intent:** Keep the guest oriented on `/stay`: a sticky, numbered section bar that highlights where they are, and a back-to-top button.
**Date:** 2026-09-28
**Status:** Implemented on 2026-09-28
**Stories:** [stay-navigation.md](../story-artifacts/stay-navigation.md) · **Design:** [design-artifacts/stay-navigation.md](../design-artifacts/stay-navigation.md) · **Spec:** [stay.md](../functional-specs/stay.md)

---

## Known before the bolt

- **Content unchanged:** `StayService` is not touched; the nine sections stay as they are, « Avant de partir » included
- **The router ignores `scroll-margin-top`:** `ViewportScroller` computes its own position, so the bar height goes through `setOffset()` (see the design)
- **One new text:** « Haut de page » / « Back to top »

## Steps

- [x] **Step 1 — Update the specs**
  - `stay.md`: FR-14 reworded, FR-22 to FR-26, revision history
  - Done at plan time, with this document

- [x] **Step 2 — `spyOnSections()`**
  - `section-spy.ts`: `IntersectionObserver` with a reading band below the bar, the last section at the page bottom, clean-up through `DestroyRef`, `null` without `IntersectionObserver`
  - `section-spy.spec.ts`: with a fake `IntersectionObserver` — the band's section wins, the value is kept between sections, the page bottom picks the last section, disconnect on destroy

- [x] **Step 3 — `StayNavComponent`**
  - `stay-nav.ts` / `.css`: numbered `<ol>` of chips, `aria-current="location"`, sideways scrolling row, active chip kept in view
  - `stay-nav.spec.ts`: links and fragments, numbers hidden from screen readers, `aria-current` follows `activeId`

- [x] **Step 4 — Wire it into the page**
  - `stay.html` / `stay.ts`: the bar replaces the grid; numbers in the headings; `ViewportScroller.setOffset()` set and reset; the « Haut de page » button, shown by a banner observer
  - `stay.css`: sticky bar, heading numbers, the button (44 × 44 px, focus ring); the old grid styles removed
  - `styles.css`: `html:has(.stay-nav) { scroll-padding-top }`
  - `stay.spec.ts`: existing « Sommaire » test adapted; heading names without the number; the button focuses the `h1`; the offset is reset on destroy
  - XLIFF: `stay.backToTop` in both files

- [x] **Step 5 — Verify**
  - `npm test` and a production build pass, both languages
  - At 1280px, 375px and 320px: the bar sticks, the right chip lights up while scrolling, down to « Après votre séjour »; no horizontal page scroll
  - A chip click lands with the heading fully visible below the bar, and focus on the section
  - Tabbing through the page: no focused element hidden under the bar
  - « Haut de page » appears and disappears with the banner, and focuses « Votre séjour »
  - With reduced motion emulated: no smooth scrolling
  - The home page's navbar links still land where they did (offset reset)
  - AXE on `/stay` and `/en/stay`: nothing beyond the known `.footer-copy` contrast

- [x] **Step 6 — Record the bolt**
  - Results in this plan; Session 13 closed in `prompts.md`

---

## NFRs

- Standalone, `OnPush`, `input()`, signals, `computed()` / `effect()`, `inject()`, native control flow, no `@HostListener`
- Visible copy French (English through XLIFF); ids, classes and TypeScript symbols English
- WCAG AA: 1.4.1 (active chip not by colour alone), 1.4.3 (contrast of the active and inactive chips), 1.4.10 (reflow at 320px), 2.4.11 (focus not hidden by the bar), 2.5.8 (target size), visible focus

---

## Out of scope (deliberate)

- A desktop sidebar showing the sub-groups (Hiver / Été / Toute l'année) — possible later on the same signal
- Collapsible sections
- Any change to the home page's navigation
- The content itself

---

## Risks

| Risk | Handling |
|---|---|
| The highlight jumps or lags on short sections | Reading band plus the page-bottom rule; checked by scrolling through the nine sections at three widths |
| The offset leaks to the home page | Reset on destroy, covered by a test and checked in the browser |
| `:has()` not supported by an old browser | Only loses the focus padding; the bar and the router offset still work |
| The bar eats vertical space on a small phone | One row, about 3 rem; checked at 320 × 568 |

---

**Bolt 13 implemented on 2026-09-28**, after Thomas approved the plan.

## Verification results

| Check | Result |
|---|---|
| Unit tests | 194 passing: 19 new (10 `section-spy`, 5 `stay-nav`, 4 `stay`) and 2 adapted; 5 runs in a row |
| Production build | Both languages, no warning |
| Highlight while scrolling | Headless Chromium at 1280, 375 and 320px: each of the nine sections lights its chip; the page bottom lights « 9 Après votre séjour »; nothing is lit above the first section on a tall screen |
| Chip click | Heading 16px below the bar at all three widths; focus on the section |
| Keyboard | Tab and Shift+Tab through the whole page at all three widths: no focused element under the bar |
| Row | All nine chips fit at 1280px and wider, in both languages; below that the row scrolls and the active chip stays in view; no horizontal page scroll down to 320px |
| « Haut de page » | Hidden while the banner shows; 127 × 44px; scrolls to 0 and focuses the `h1`, then disappears |
| Home page after `/stay` | « À propos » lands at 0px: the router offset is reset |
| AXE 4.10 (WCAG 2.2 AA + best practice) | `/stay` and `/en/stay`: only the known `.footer-copy` contrast node |
| Console | No error |

## Found and fixed during the build

- **`linkedSignal` dropped « keep the previous section ».** It remembers the last value *read*, so two observer reports between two renders lost the section. Replaced by a plain signal set directly by the observer. Found by a unit test
- **The site's smooth scrolling ignored reduced motion** (`html { scroll-behavior: smooth }`, unguarded, since before this bolt). Now under `prefers-reduced-motion: no-preference`
- **The heading number sat far from the title**, and Playfair's old-style « 5 » dropped below the line: `min-width` removed, `lining-nums` added. Seen on the screenshots
- **« ↑Haut de page » lost its space**: Angular drops whitespace-only text between two elements; a margin now separates them
- **The ninth chip was cut at 1280px**: chips slightly tighter; all nine now fit from 1280px
- **A flaky unit test**: jsdom resolves a scoped `#id` query through the whole document, so an id shared with another spec's fixture returned `null`. The test host now uses ids of its own

## Left to Thomas

- A look on a real phone (scrolling feel, chip row swipe)
- The browser pane was hidden during the session, so the checks ran in a headless Chromium driven by a script, not in the pane
