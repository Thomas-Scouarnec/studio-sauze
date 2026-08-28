# Functional Specification — Flat Info & Capacity

**Status:** Draft — pending validation by Thomas
**Owner domain:** Apartment metadata (identity, capacity, location, amenities) surfaced across the site
**Created:** 2026-08-28 (backfilled from Session 2, see [prompts.md](../prompts.md))

---

## 1. Purpose

Defines the canonical facts about the flat (capacity, location, amenities, seasonal appeal) and the rules that keep them consistent everywhere they are displayed. This spec is the persistent source of truth for the domain — unlike story-artifacts, which capture a single session's request, this document is updated (not replaced) whenever a future session changes any of these facts.

## 2. Scope

Covers the studio flat's identity, sleeping capacity, location/proximity, and amenity information as shown on the public site. Excludes booking/reservation logic, pricing, and availability calendars (not implemented).

## 3. Consuming Components

| Component | Consumes |
|---|---|
| `about.html` (About section) | name, capacity, sleeping arrangement, location, amenities, seasonal appeal, proximity |
| `contact.html` (Contact form) | `maxGuests` (bounds the "Nombre de personnes" selector) |
| `hero.html` (Hero) | `fullLocation` (station + region) |
| `features.ts` (Features section) | amenities (storage, kitchen) — must stay consistent with About's wording |

## 4. Functional Requirements

| ID | Requirement | Rationale |
|---|---|---|
| FR-1 | The flat's maximum guest capacity is **5** | Bunk bed + drawer (coin montagne) sleeps 3; sofa bed (160cm, convertible) sleeps 2 |
| FR-2 | The sleeping arrangement is described as two distinct spaces: coin montagne (bunk bed + drawer, 3 people) and a convertible sofa bed (160cm, 2 people) | Accuracy — previously only the "grand coin montagne" was mentioned, implying a single space |
| FR-3 | The description does not claim the studio is "lumineux" (bright) | Not accurate to the actual flat |
| FR-4 | The flat is presented as suited to both winter (skiing, snowshoeing) and summer (hiking) stays | Previously winter/ski-only framing under-sold summer appeal |
| FR-5 | The kitchen is described as well-equipped | Currently under-emphasized |
| FR-6 | Storage is described in non-specific plural terms (e.g. "plusieurs espaces de rangement"), not a specific count | The specific count previously stated ("deux placards") is wrong; exact count isn't important to the visitor |
| FR-7 | Proximity to slopes/hiking trails/snowshoe trails is described as "a couple of meters," not "0" | "0 marche" was an exaggerated/inaccurate claim |
| FR-8 | Distance to Barcelonnette is stated as ~10 minutes by car | Previously unstated |
| FR-9 | The residence name ("Le Roi Soleil") and building name ("Crépuscule") are two distinct, separately displayed pieces of information | A residence can contain multiple buildings; conflating them would be inaccurate |
| FR-10 | A Google Maps link is provided, pointing at the residence/building level | Helps visitors situate the flat |

## 5. Business Rules / Constraints

- **BR-1 (Capacity consistency):** Any UI surface that reflects guest capacity (About stats, Contact form's people selector, and any future booking UI) MUST stay in sync with `FlatInfoService.info().maxGuests`. Do not hardcode a capacity number/bound in a template independently of the service.
- **BR-2 (No exact address):** The exact door/apartment number is never published on the public site. Only the residence name, building name, and a Google Maps link (building-level) are shown. Rationale: avoids exposing precisely which unit is vacant, for the owner's security.
- **BR-3 (Single source of truth):** Flat metadata (name, capacity, location, residence/building name, maps URL) lives only in `FlatInfoService`; components must read it via the service, not duplicate literal values in templates.
- **BR-4 (Wording consistency):** When the same amenity/fact is described in more than one section (e.g. storage in both About and Features), the wording must not contradict across sections.

## 6. Non-Functional Requirements

- Content is in French (no localization in scope yet)
- Any new interactive element (e.g. Maps link) must meet WCAG AA (focus-visible, contrast, descriptive accessible name)

## 7. Out of Scope

- Pricing, availability, and booking/reservation flow
- English (or other) localization of this content
- Photos/visual assets

## 8. Open Questions

- None currently.

## 9. Revision History

| Date | Change | Session |
|---|---|---|
| 2026-08-28 | Initial version — backfilled from apartment description accuracy work | Session 2 |
