# Bolt 4 Plan — Seasons Section

**Intent:** Rework the "Toute l'année" section to highlight what there is to do in the valley, winter and summer.
**Date:** 2026-09-17
**Stories:** [seasons-section.md](../story-artifacts/seasons-section.md) · **Design:** [design-artifacts/seasons-section.md](../design-artifacts/seasons-section.md) · **Spec:** [seasons.md](../functional-specs/seasons.md)

---

## Steps

- [x] **Step 1 — Create `SeasonsService`**
  - New `src/app/services/seasons.service.ts`, `providedIn: 'root'`
  - `Season`, `SeasonHighlight` and `SeasonLink` interfaces; private `_seasons` signal exposed as readonly, following the `FlatInfoService` idiom
  - Populate with the validated content from the design artifact: two seasons, three highlights each, tags and one link per card
  - `bgSymbol` and `modifier` are not carried over

- [x] **Step 2 — Rework `SeasonsComponent`**
  - `seasons.ts`: drop the inline `Season` array and the local interface; inject `SeasonsService` with `inject()`
  - `seasons.html`: per card, render marker → `h3` title → photo slot → description → `h4` highlights → tags → link
  - Photo slot is `aria-hidden="true"` and displays its `photoLabel`
  - Links get `target="_blank"`, `rel="noopener noreferrer"` and a visually hidden "(nouvel onglet)", matching `about.html`
  - Card variant class derived from `season.id`, via a `class` binding (no `ngClass`)

- [x] **Step 3 — Update `seasons.css`**
  - Style the photo slot, highlight list and link; remove the `.season-bg-symbol` rule
  - Raise card text from 68% to 85% opacity on the cream tone so the denser content stays ≥4.5:1
  - Keep the two-column grid collapsing to one column at 768px

- [x] **Step 4 — Tests for the service**
  - New `seasons.service.spec.ts`: two seasons in order `winter`, `summer`; exactly three highlights each, all with a title and text; every season has a photo label and a link
  - Spec-guard assertions for the rules a future copy edit could silently break:
    - no removed or unconfirmed activity appears (ski de fond, ski de randonnée, chiens de traîneau, patinoire, Espace Lumière) — FR-5
    - no four-digit year appears anywhere in the copy — FR-7 / BR-2
    - exactly two links, both pointing at the agreed official domains — FR-9

- [x] **Step 5 — Tests for the component**
  - Update `seasons.spec.ts`: renders two cards, six highlight titles, the photo labels, the tag lists and both links
  - Host keeps `role="region"`, with `id="activities"` and `aria-labelledby="activities-heading"`
  - Photo slots are `aria-hidden`; links carry a new-tab warning and `rel="noopener noreferrer"`

- [x] **Step 6 — Verify**
  - `npm test` passes and the production build succeeds
  - Review the section in the browser at desktop and mobile widths — two columns collapsing to one, no horizontal overflow
  - Measure contrast of description, highlight and tag text on both card backgrounds; confirm ≥4.5:1
  - Confirm heading order is h2 → h3 → h4 with no skipped levels

---

## NFRs

- Copy stays in French (no localization in this bolt)
- Only owner-confirmed activities are published (BR-1); silence is not confirmation
- No year-specific event dates (BR-2) — the tourist office link carries them instead
- Exactly two outbound links (BR-4)
- Preserve project conventions: standalone components, `OnPush`, signal-based state, `inject()`, native control flow, no `ngClass`/`ngStyle`
- All technical identifiers in English; only user-visible copy is French
- WCAG AA: contrast ≥4.5:1 on the dark cards, correct heading order, decorative elements hidden from assistive tech, and the section must pass AXE

---

## Out of scope (deliberate)

- Actual photography — placeholder labels only
- Any third external link
- A dedicated location section (still pending from Session 3)
- The `--stone` contrast defect elsewhere on the site (logged in Bolt 3)

---

**Bolt 4 implemented on 2026-09-17.**

## Verification results

| Check | Result |
|---|---|
| `npm test` | 37 tests pass (5 files) |
| Production build | Succeeds, within budgets |
| Contrast, winter card (`#1a2e22`) | Highlight titles 12.70:1 · body, highlights, tags, photo label 6.77:1 · link and marker 4.74:1 |
| Contrast, summer card (`#2d1e14`) | Highlight titles 14.16:1 · body, highlights, tags, photo label 7.45:1 · link and marker 5.29:1 |
| Heading order | h2 → h3 → h4, no skipped levels |
| Desktop (1280px) | Two columns of 567px, side by side |
| Mobile (375px) | One column, no horizontal overflow |
| Content | 3 highlights per card, both links correct, no `.season-bg-symbol` remaining |

Lowest measured contrast is **4.74:1** (the winter link and marker, both in `--amber`), above the 4.5:1 AA minimum but the tightest value on the page — worth re-checking if that amber tone is ever darkened.

## Corrections to the design artifact

- **Card heights are equal, not uneven.** The design artifact predicted the summer card would be taller. CSS grid stretches items to the row height by default, so both render at 868px. No action needed; the note was wrong.
- **`.visually-hidden` moved to global styles.** It lived in `about.css`, which is component-scoped, so the new links could not have used it. With two consumers it now sits in `src/styles.css` and was removed from `about.css`.

## Noticed during verification — not in scope

The hero tagline reads *"skis aux pieds"*. Bolt 2 removed "0 marche jusqu'aux pistes" as an overclaim (FR-7) and Session 3 settled on gear being dropped at a ground-floor locker — "skis aux pieds" may be the same overclaim surviving in the hero. Worth a decision in a future bolt.
