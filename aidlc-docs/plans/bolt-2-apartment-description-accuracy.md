# Bolt 2 Plan — Apartment Description Accuracy

**Intent:** Update the apartment description section to be as accurate and precise as possible.
**Date:** 2026-08-27

---

## Steps

- [ ] **Step 1 — Update FlatInfoService**
  - `maxGuests`: 4 → 5
  - Remove the unused `description` field from the `FlatInfo` interface and the signal
  - Add `residenceName: 'Le Roi Soleil'`, `buildingName: 'Crépuscule'` (two distinct fields — a residence can have several buildings), and `mapsUrl: 'https://maps.app.goo.gl/AYnuYPqsfuqbwnkR6'`
  - Add a `guestCountOptions` computed signal: `[1..maxGuests]`, so consumers derive the upper bound instead of hardcoding it (enforces BR-1)
  - Update `flat-info.service.spec.ts`: `guestRange()` expectation `2–4` → `2–5`, add coverage for `residenceName`/`buildingName`/`mapsUrl`/`guestCountOptions`, drop any reference to `description`

- [ ] **Step 2 — Rewrite About section copy (`about.html`)**
  - Sleeping arrangement: mention lit superposé + tiroir-lit (coin montagne, 3 people) and the 160cm sofa bed (2 people)
  - Remove "studio lumineux" claim
  - Add summer/hiking appeal alongside the existing winter/ski framing
  - Highlight the kitchen as well-equipped
  - Storage: replace "deux placards" with non-specific plural wording (e.g. "plusieurs espaces de rangement")
  - Replace the "0 marche jusqu'aux pistes" stat with wording reflecting a couple of meters to slopes/hiking/snowshoe trails
  - Add "~10 min en voiture de Barcelonnette"
  - Add residence name **and** building name (distinct fields — "Le Roi Soleil" / "Crépuscule") + Google Maps link (building-level only, no door/apartment number)
  - Update `about.css` as needed: style the new Maps link (incl. `:focus-visible`), and check the proximity stat tile still fits/wraps cleanly now that its content is no longer a single digit

- [ ] **Step 3 — Fix duplicated storage wording in Features section (`features.ts`)**
  - Update the "Rangements" card description to match the non-specific plural wording from Step 2

- [ ] **Step 4 — Derive guest count options in Contact form (`contact.html` / `contact.ts`)**
  - Newly noticed while designing this bolt: the "Nombre de personnes" `<select>` hardcodes options 1–4, inconsistent with the corrected `maxGuests` of 5
  - Inject `FlatInfoService` into `ContactComponent`; replace the hardcoded `<option>` list with an `@for` over `flatInfo.guestCountOptions()`, so the bound can never drift from the service again (enforces BR-1)

- [ ] **Step 5 — Verify**
  - `npm test` passes
  - Manually review the rendered About section and Contact form in the browser
  - Confirm the Maps link has an accessible name and doesn't break AXE/WCAG AA checks (focus visible, sufficient contrast, descriptive link text — not "click here")

---

## NFRs
- Copy stays in French (no localization work in this bolt)
- No exact door/apartment number published — residence name + Maps link only
- Preserve OnPush change detection, standalone components, signal-based state (per project conventions)
- New link element must meet WCAG AA (focus state, contrast, meaningful accessible name)
