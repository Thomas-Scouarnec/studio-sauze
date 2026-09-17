# Design — Equipment Section

**Unit:** Equipment Section
**Date:** 2026-09-17
**Stories:** [equipment-section.md](../story-artifacts/equipment-section.md) · **Spec:** [flat-info.md](../functional-specs/flat-info.md) (FR-11 to FR-18, BR-3, BR-5, BR-6)

## Responsibility

Renders the flat's equipment in two tiers: three persuasive blocks, then a compact list of remaining amenities. The component is purely presentational — all copy comes from `FlatInfoService`, so the published wording has a single source of truth and cannot drift from the spec (BR-3).

## Data model

Two new interfaces, declared alongside `FlatInfo` in `flat-info.service.ts`:

```ts
export interface EquipmentBlock {
  id: string;
  title: string;
  body: string;
}

export interface EquipmentItem {
  icon: string;
  label: string;
}
```

All copy is **plain text**, interpolated with `{{ }}`. No HTML lives in the data, so there is no `innerHTML` and no sanitisation concern. (Consequence: "1er étage" is written plainly, without a `<sup>`.)

## Service additions — `FlatInfoService`

| Signal | Type | Description |
|---|---|---|
| `equipmentBlocks` (readonly) | `Signal<EquipmentBlock[]>` | The three tier-1 blocks, in display order |
| `equipmentItems` (readonly) | `Signal<EquipmentItem[]>` | The eight tier-2 amenities, in display order |

Both follow the existing `_private signal` + `asReadonly()` pattern already used for `_info`.

**Content (final, validated in Session 3):**

Blocks, in order:

| id | title | body |
|---|---|---|
| `arrival` | Vos skis restent en bas | Parking gratuit au pied du bâtiment et casier à skis sécurisé au rez-de-chaussée : vous y déposez le matériel en arrivant, puis vous montez au 1er étage en ascenseur. |
| `sleeping` | Cinq vrais couchages, et de l'intimité | Le coin montagne accueille 3 personnes sur de véritables couchages de 80 cm adaptés aux adultes, isolables par un rideau. Dans le séjour, un canapé-lit 160 cm de très bonne qualité pour deux personnes de plus. |
| `kitchen` | Une cuisine où l'on cuisine vraiment | Grand réfrigérateur de 140 cm, four, lave-vaisselle, plaques, micro-ondes, bouilloire et cafetière filtre — sans oublier l'appareil à raclette. Autour de la grande table en bois, vous tenez à cinq : trois chaises et un banc. |

Items, in order: 🛁 Baignoire et douche · 🚽 WC séparés · 🧺 Lave-linge · 📺 TV (TNT) · 🧳 Plusieurs espaces de rangement · 🥾 Emplacement pour sécher chaussures et gants · 📶 Très bon réseau 4G/5G — pas de Wi-Fi · 🌲 Vue sur la forêt

The single quality claim permitted by FR-12 is carried by *"de très bonne qualité"* in the `sleeping` block. No brand name appears anywhere.

**Identifier language:** all technical identifiers — HTML ids, block ids, CSS class names, TypeScript symbols — are written in English, even while the published copy is French. Only user-visible strings are localized.

## Component model — `EquipmentComponent`

New component at `src/app/components/equipment/`, replacing `components/features/` entirely.

| Aspect | Value |
|---|---|
| Selector | `app-equipment` |
| Host | `id: 'equipment'`, `role: 'region'`, `aria-labelledby: 'equipment-heading'` |
| Change detection | `OnPush` |
| State | None — injects `FlatInfoService` via `inject()` and reads the two signals |
| Templates | External `equipment.html` / `equipment.css` (the template is too large to inline) |

Template shape:

```
header        → .section-label "Équipements" + h2#equipment-heading "Ce qui vous attend"
blocks        → @for over equipmentBlocks(), track block.id
                  article > [photo placeholder] + [h3 title + p body]
extras        → h3 "Et aussi" + ul > @for over equipmentItems(), track item.label
```

The photo placeholder is an **empty decorative box this bolt** — a layout slot only. No `photo` field is added to `EquipmentBlock` until the photos bolt actually needs one, per the project's rule against designing for hypothetical requirements.

## Accessibility

- Heading order is preserved: `h2` (section) → `h3` (block titles, and "Et aussi"). No levels skipped.
- Emoji icons are decorative: `aria-hidden="true"`, with the meaning carried by the adjacent text label.
- The photo placeholder conveys nothing and is `aria-hidden="true"`.
- The tier-2 list is a real `<ul>`/`<li>`, labelled by the "Et aussi" heading via `aria-labelledby`.
- **Contrast — existing defect to fix.** The current `.feature-desc` uses `var(--stone)` (`#8C8074`) on `var(--snow)` (`#FAF8F4`), which measures ≈3.6:1 — below the 4.5:1 AA minimum for body text. The new block/item copy must use a darker token (`var(--text)` ≈15:1, or `var(--bark)` ≈12.7:1). To be confirmed with an actual contrast check during verification.

## Decisions and alternatives considered

**Equipment data lives in `FlatInfoService`, not in the component.** The previous section hardcoded its array inside `features.ts`, which is what let the "lit double" and "pas de marche" wording drift out of sync with the corrected About copy. BR-3 exists to prevent exactly that.

**Two separate signals rather than fields inside `FlatInfo`.** `info` holds scalar facts consumed by Hero, About and Contact; folding two arrays into it would bloat an interface that four components depend on. Separate signals keep each consumer reading only what it needs.

**A dedicated `EquipmentService` was rejected.** Cleaner on paper for single-responsibility, but for a static list on a personal site it is an abstraction without a caller — and it would split "facts about the flat" across two services, weakening BR-3.

**Signals rather than plain readonly arrays.** The data is static and never mutates, so plain arrays would work. Signals are used for consistency with the existing `_info` pattern, so the service has one idiom rather than two.

**The component is renamed, not edited in place.** "Features" no longer describes the section, and the navbar already labels it "Équipements". Renaming makes the anchor match the section.
**Consequence needing Thomas's OK:** the URL fragment changes from `#features` to `#equipment`, so `navbar.ts` must be updated and any existing link to `#features` stops working.

## Notes

- `FeaturesComponent`, its template, styles and spec are deleted — not left as dead code.
- Existing global classes `.section-label` and `.section-title` are reused, so the section keeps the site's typographic rhythm.
- Layout: blocks are a horizontal row (photo left, text right) collapsing to stacked on narrow viewports; the item list is an auto-fit grid collapsing to one column. Same 768px breakpoint already used by `features.css`.
- Copy stays French — no localization in this bolt.
