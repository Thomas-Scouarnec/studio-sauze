# Functional Specification — Seasons & Area Activities

**Status:** Active
**Owner domain:** What there is to do in the valley, by season — activities, events and nearby places
**Created:** 2026-09-17 (Session 4)

---

## 1. Purpose

Defines what the site claims about the surrounding valley: the activities available by season, the named highlights, and the external sources visitors are pointed to. This is a sibling to [flat-info.md](flat-info.md), which owns facts about the flat itself. Where that spec describes *the property*, this one describes *the place*.

## 2. Scope

Covers the Seasons ("Toute l'année") section: seasonal framing, activities, named highlights, and outbound links. Excludes facts about the flat (owned by `flat-info.md`), pricing, availability and booking.

## 3. Consuming Components

| Component | Consumes |
|---|---|
| Seasons section | the full seasonal content: markers, titles, descriptions, highlights, tags, photo labels and links |

## 4. Functional Requirements

| ID | Requirement | Rationale |
|---|---|---|
| FR-1 | The section presents exactly two seasons: winter (Décembre – Avril) and summer (Juin – Septembre) | The existing framing works and is deliberately kept |
| FR-2 | Each season card carries, in order: a period marker, a title, a photo slot, one scene-setting sentence, three named highlights, activity tags, and one external link | Named highlights carry what tags cannot; the sentence keeps the section's voice |
| FR-3 | Each highlight has a title and exactly one line of explanatory text | Three short highlights is the ceiling before the card stops being scannable |
| FR-4 | Tags contain only single words or short phrases, for activities that need no explanation | Anything needing a sentence is a highlight, not a tag |
| FR-5 | "Ski de fond" is not listed, and neither are ski de randonnée, chiens de traîneau, patinoire or Espace Lumière | Either rejected by the owner or never confirmed — see BR-1 |
| FR-6 | The August event is named "Fêtes Latino-Mexicaines de Barcelonnette", described as ten days mid-August, and linked to the valley's emigration to Mexico | The valley's most distinctive summer draw, and unique among French ski resorts |
| FR-7 | No year-specific event dates are published | The festival's dates move every year; a published date would be wrong most of the time (BR-2) |
| FR-8 | The Lac de Serre-Ponçon is stated as 45 minutes by car | Owner-confirmed distance |
| FR-9 | Exactly two external links are published: the Sauze resort (winter card) and the Ubaye tourist offices (summer card) | The tourist office is the authority for shifting event dates; more links means more future dead links |
| FR-10 | External links open in a new tab and carry a visually hidden new-tab warning | Matches the existing Maps link pattern in About |
| FR-11 | Each card reserves one photo slot carrying a label that names the intended subject | One image per card limits sourcing to two licensed photos; the label tells the owner what to source |
| FR-12 | The decorative background symbol (❄ / ☀) is not displayed | It would compete with the photo once images land |
| FR-13 | The section's anchor is `#activities` | Matches the navbar's "Activités" label, as `#equipment` matches "Équipements" |

## 5. Business Rules / Constraints

- **BR-1 (Verified activities only):** An activity is published only if the owner has confirmed it. Silence is not confirmation. This mirrors BR-5 in `flat-info.md`.
- **BR-2 (No perishable facts):** Information that changes yearly — event dates above all — is never published as a literal value. Link to the authoritative source instead.
- **BR-3 (Single source of truth):** All published seasonal copy lives in `SeasonsService`, not in the template, so content is separated from presentation and can be asserted against in tests.
- **BR-4 (Link discipline):** Outbound links are limited to official sources (resort, tourist office). Every link added is a link someone must check again later.

## 6. Non-Functional Requirements

- Content is in French (no localization in scope yet)
- All card text meets WCAG AA (≥4.5:1) against the dark card backgrounds
- Technical identifiers in English, per project convention

## 7. Out of Scope

- Actual photography — the layout reserves slots, images are a separate bolt
- Pricing, availability and booking
- A dedicated location section for the flat's own distances (still pending from Session 3)

## 8. Open Questions

- None currently.

## 9. Revision History

| Date | Change | Session |
|---|---|---|
| 2026-09-17 | Initial version — created with the Seasons section rework | Session 4 |
