# Bolt 3 Plan — Equipment Section

**Intent:** Rework the "Équipements" section to highlight what differentiates this flat from other rentals in Le Sauze.
**Date:** 2026-09-17
**Stories:** [equipment-section.md](../story-artifacts/equipment-section.md) · **Design:** [design-artifacts/equipment-section.md](../design-artifacts/equipment-section.md) · **Spec:** [flat-info.md](../functional-specs/flat-info.md)

---

## Steps

- [x] **Step 1 — Extend `FlatInfoService` with equipment data**
  - Add `EquipmentBlock` (`id`, `title`, `body`) and `EquipmentItem` (`icon`, `label`) interfaces
  - Add private `_equipmentBlocks` / `_equipmentItems` signals exposed as readonly, following the existing `_info` pattern
  - Populate with the validated copy from the design artifact: 3 blocks (`arrival`, `sleeping`, `kitchen`) and 8 items, in display order
  - Copy is plain text only — no HTML in the data (enforces the no-`innerHTML` decision)

- [x] **Step 2 — Create `EquipmentComponent` (`src/app/components/equipment/`)**
  - `equipment.ts`: selector `app-equipment`, `OnPush`, host `id: 'equipment'` / `role: 'region'` / `aria-labelledby: 'equipment-heading'`, injects `FlatInfoService` via `inject()`
  - `equipment.html`: section header (`.section-label` + `h2#equipment-heading` "Ce qui vous attend"), `@for` over `equipmentBlocks()` tracked by `id`, then the "Et aussi" `h3` + `ul` with `@for` over `equipmentItems()`
  - Each block renders a decorative photo placeholder (`aria-hidden="true"`, no data field) plus `h3` title and `p` body
  - Emoji icons wrapped in an `aria-hidden="true"` span
  - `equipment.css`: blocks as a horizontal row (photo left, text right) stacking below 768px; item list as an auto-fit grid collapsing to one column
  - **Body copy must NOT use `var(--stone)`** — it measures ≈3.6:1 on `var(--snow)`, below AA. Use `var(--text)` or `var(--bark)`

- [x] **Step 3 — Wire the new section in**
  - `app.ts`: replace the `FeaturesComponent` import and `<app-features />` with `EquipmentComponent` / `<app-equipment />`, keeping the same position between About and Seasons
  - `navbar.ts`: update the "Équipements" link from `#features` to `#equipment` so the anchor matches the new host id

- [x] **Step 4 — Delete the old Features component**
  - Remove `src/app/components/features/` entirely (`features.ts`, `.html`, `.css`, `.spec.ts`)
  - This also removes the two claims that contradicted the corrected About copy: "pouvant accueillir un lit double" (vs FR-2) and "Pas de navette, pas de marche" (vs FR-7)
  - Confirm no remaining reference to `FeaturesComponent` or `#features` anywhere in `src/`

- [x] **Step 5 — Tests**
  - `flat-info.service.spec.ts`: assert 3 blocks and 8 items, and that block ids/order match the design
  - Add spec-guard assertions that encode the rules most likely to be broken by a future copy edit:
    - no appliance brand name appears in any block or item (FR-12)
    - the string "sèche-chaussures" appears nowhere (FR-16)
  - New `equipment.spec.ts`: component creates, renders 3 blocks and 8 items, host has `role="region"` and the right `aria-labelledby`, icons and the photo placeholder are `aria-hidden`

- [x] **Step 6 — Verify**
  - `npm test` passes
  - Review the rendered section in the browser at desktop and mobile widths — blocks stack, list collapses to one column, no horizontal scroll
  - Run a contrast check on the new body copy and confirm ≥4.5:1, closing the `--stone` defect
  - Confirm heading order is h2 → h3 with no skipped levels, and that the navbar anchor scrolls to the section

---

## NFRs

- Copy stays in French (no localization in this bolt)
- Every published claim must be verifiable (BR-5): no ski locker capacity, no "sèche-chaussures", no heating reference, no balcony implied
- No location facts, distances or travel times in this section (FR-18) — they remain owned by About
- No appliance brand names (FR-12)
- Preserve project conventions: standalone components, `OnPush`, signal-based state, `inject()`, native control flow, no `ngClass`/`ngStyle`
- All technical identifiers (HTML ids, block ids, CSS classes, TS symbols) in English; only user-visible copy is French
- WCAG AA: correct heading order, decorative elements hidden from assistive tech, body text contrast ≥4.5:1, and the section must pass AXE

---

## Out of scope (deliberate)

- Photos and any carousel or click-to-open interaction — placeholders only, no `photo` data field yet
- Summer-specific content (About continues to carry the all-season message)
- Linen, towels, end-of-stay cleaning — future restricted guest-only section
- A dedicated location section

---

## Resolved points

- **URL fragment** — Thomas approved the change from `#features` to `#equipment`; the navbar is updated in Step 3.
- **Identifier language** — technical identifiers stay English even while copy is French; block ids are `arrival`, `sleeping`, `kitchen`.

**Plan approved by Thomas — Bolt 3 implemented on 2026-09-17.**

## Verification results

| Check | Result |
|---|---|
| `npm test` | 22 tests pass (3 files) |
| Production build | Succeeds, within budgets |
| Body copy contrast | 15.14:1 on `--snow` — well above the 4.5:1 AA minimum |
| Heading order | h1 → h2 → h3, no skipped levels across the whole page |
| Desktop (1280px) | 3 blocks side by side, 280px photo slots, list in 3 columns |
| Mobile (375px) | Blocks stacked with full-width photo, list in 1 column, no horizontal overflow |
| Navigation | All four nav anchors resolve; no `#features` reference remains |

## Noticed during verification — out of scope, needs its own bolt

`var(--stone)` on `var(--snow)` measures **3.63:1**, confirmed in the browser. This bolt removed the last such usage from this section, but **10 elements elsewhere still use it**: the three About stat labels and all seven Contact form labels. Failing contrast on form labels is the more serious of the two. Recommend a dedicated accessibility bolt rather than widening this one.
