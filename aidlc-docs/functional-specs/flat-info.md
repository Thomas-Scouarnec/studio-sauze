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
| Contact section (via `ContactService`) | `maxGuests` (the maximum stated in the request checklist) |
| `hero.html` (Hero) | `fullLocation` (station + region) |
| Équipements section | the flat's equipment and amenities (see FR-11 to FR-18) — must stay consistent with About's wording |

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
| FR-11 | The Équipements section presents the flat's equipment in two tiers: three persuasive blocks (arrival/access, sleeping, kitchen) followed by a compact list of the remaining amenities | ~20 items in prose is unreadable; a flat list of 20 buries the real differentiators |
| FR-12 | Appliance brand names are never published | Brands don't differentiate a holiday rental; quality is conveyed by capability instead |
| FR-13 | Kitchen equipment is stated as: 140 cm fridge, oven, dishwasher, hotplates, microwave, kettle, filter coffee machine, raclette set; plus a wooden table seating 5 (three chairs and a bench) | Self-catering capacity for a group of 5 is a genuine differentiator |
| FR-14 | Arrival is described as: free parking at the foot of the building, secured ski locker on the ground floor, lift to the 1st floor — gear is dropped downstairs, never carried up | The chain is more persuasive than its three parts listed separately |
| FR-15 | The ski locker is described without stating a capacity | Capacity is not yet verified — see Open Questions |
| FR-16 | The boot/glove drying area is described as a dedicated drying spot, never as a "sèche-chaussures" | It is a spot next to a heater, not a drying appliance — same accuracy principle as FR-3 and FR-7 |
| FR-17 | Connectivity is stated positive-first: very good 4G/5G coverage, no Wi-Fi. The TV is stated as TNT (broadcast) | Absence of Wi-Fi is a primary filter criterion; stating it prevents disappointment, and TNT-only follows from having no internet |
| FR-18 | The Équipements section contains no location facts, distances, or travel times | Location is owned by the About section; duplicating it invites drift (BR-3, BR-4) |

## 5. Business Rules / Constraints

- **BR-1 (Capacity consistency):** Any UI surface that reflects guest capacity (About stats, the Contact section's request checklist, and any future booking UI) MUST stay in sync with `FlatInfoService.info().maxGuests`. Do not hardcode a capacity number/bound in a template independently of the service.
- **BR-2 (No exact address):** The exact door/apartment number is never published on the public site. Only the residence name, building name, and a Google Maps link (building-level) are shown. Rationale: avoids exposing precisely which unit is vacant, for the owner's security.
- **BR-3 (Single source of truth):** Flat metadata (name, capacity, location, residence/building name, maps URL) lives only in `FlatInfoService`; components must read it via the service, not duplicate literal values in templates.
- **BR-4 (Wording consistency):** When the same amenity/fact is described in more than one section (e.g. storage in both About and Équipements), the wording must not contradict across sections.
- **BR-5 (Verifiable claims only):** No claim is published unless it is verified. Where a fact is not yet confirmed (e.g. ski locker capacity), it is stated without the unverified detail rather than estimated. Amenities are described by what they actually are, not by the appliance they resemble.
- **BR-6 (Honest omissions):** Absences that a renter would reasonably filter on (no Wi-Fi, no balcony) are stated explicitly rather than left unsaid, phrased positive-first where a genuine upside exists.

## 6. Non-Functional Requirements

- Content is in French (no localization in scope yet)
- Any new interactive element (e.g. Maps link) must meet WCAG AA (focus-visible, contrast, descriptive accessible name)

## 7. Out of Scope

- Pricing, availability, and booking/reservation flow
- English (or other) localization of this content
- Photos/visual assets — the Équipements layout reserves photo slots, but images and any carousel interaction are a separate bolt
- Linen, towels and end-of-stay cleaning — destined for a future restricted, guest-only section
- A dedicated location section (would take ownership of distances and travel times from About)

## 8. Open Questions

- **Ski locker capacity** — assumed to fit around 5 pairs of skis, not verified. No number is published until confirmed (FR-15, BR-5).
- **Where location facts belong long-term** — currently owned by About; a dedicated section was discussed but deferred (FR-18).

## 9. Revision History

| Date | Change | Session |
|---|---|---|
| 2026-08-28 | Initial version — backfilled from apartment description accuracy work | Session 2 |
| 2026-09-16 | Added FR-11 to FR-18 (equipment presentation, honest claims, no location facts) and BR-5/BR-6; updated consuming components for the reworked Équipements section | Session 3 |
| 2026-09-18 | Contact form removed: `maxGuests` now reaches the Contact section through `ContactService`'s request checklist; `guestCountOptions` deleted. Contact facts moved to their own spec, [contact.md](contact.md) | Session 5 |
