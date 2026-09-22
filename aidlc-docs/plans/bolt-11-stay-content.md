# Bolt 11 Plan — Stay Content

**Intent:** Give `/stay` its nine sections, a section menu, the content already known, and visible placeholders for the rest.
**Date:** 2026-09-22
**Status:** Implemented on 2026-09-22
**Stories:** [stay-content.md](../story-artifacts/stay-content.md) · **Design:** [design-artifacts/stay-content.md](../design-artifacts/stay-content.md) · **Spec:** [stay.md](../functional-specs/stay.md)

---

## Known before the bolt

- **About half the facts are still missing.** Placeholders make the gaps visible; the link should not be sent to a guest until the essential ones are filled (parking, rubbish, bed, appliances)
- **Filling a placeholder later is data-only:** one line in `StayService`, no template change
- **Checked:** Enchastrayes is on the loi Montagne list for Alpes-de-Haute-Provence (1 November – 31 March)
- **No phone number on the page** (BR-4): the owners' phone and the key holder's contact go in the booking email

## Steps

- [x] **Step 1 — Update the specs**
  - `stay.md`: FR-13 to FR-20, BR-4, BR-5, scope, out-of-scope, open questions
  - `flat-info.md`: BR-2 exception for the flat number on `/stay`
  - Done at plan time, with this document

- [x] **Step 2 — Add `StayService`**
  - `src/app/services/stay.service.ts`: `StayLink`, `StayItem`, `StayGroup`, `StaySection`; `sections` as a `computed()` over `FlatInfoService` and `ContactService`, with the validated copy
  - `stay.service.spec.ts`

- [x] **Step 3 — Render the content**
  - `stay.html`: the section menu, then the sections, groups and items; the Bolt 10 placeholder sentence removed
  - `stay.ts`: inject `StayService`; import `RouterLink`
  - `stay.css`: menu grid, section spacing reusing `.section-title`, group titles, item layout, placeholder style, external link style and focus ring

- [x] **Step 4 — Component tests**
  - `stay.spec.ts`: menu, regions, headings, placeholders, external links

- [x] **Step 5 — Update the ideas file**
  - `ideas/stay-content.md`: mark what is now on the page, and keep the list of placeholders to fill

- [x] **Step 6 — Verify**
  - `npm test` and a production build pass
  - Desktop and 375px: the menu, each section, placeholders readable, no horizontal overflow
  - Each menu link scrolls to its section and moves focus to it
  - External links open in a new tab
  - AXE on `/stay`: nothing beyond the known `.footer-copy` contrast

---

## NFRs

- Standalone, `OnPush`, signals, `computed()`, `inject()`, native control flow
- Visible copy French; ids, class names and TypeScript symbols English
- WCAG AA: labelled regions, heading order (`h1` → `h2` → `h3`), 4.5:1 text including placeholders, visible focus, new-tab warning for screen readers
- No `innerHTML`; no fact restated from another service (BR-5); no phone number (BR-4)

---

## Out of scope (deliberate)

- The missing facts themselves
- The parked topics (road and weather, ski passes and hire, heating and hot water, baby equipment, emergency numbers, tourist tax, avalanche safety)
- Photos on the stay page
- Downloadable GPX files — the format question for hikes is still open

---

## Risks

| Risk | Handling |
|---|---|
| A guest receives the link while placeholders remain | Flagged to Thomas; the placeholders are honest rather than hidden |
| The Google Maps search link lands on the wrong shop | Not verified — left for Thomas to click; replaced with a place link if needed |
| A long page is heavy to scroll on a phone | Section menu at the top; sections kept to short items |

---

**Bolt 11 implemented on 2026-09-22**, after Thomas validated the copy and answered the last questions (pillows and blankets stay in the flat, coffee and filters provided, signature kept).

## Verification results

| Check | Result |
|---|---|
| `npm test` | 138 tests pass (17 files), up from 125. New: `stay.service.spec.ts` (8 tests); `stay.spec.ts` extended to the menu, regions, group headings, placeholders and external links |
| Production build | Succeeds. The `stay` lazy chunk grows 1.76 → 9.68 kB raw (3.50 kB transferred); the initial bundle is unchanged at 286.73 kB |
| Content | 9 sections, 5 activity groups, 16 placeholders, 4 external links |
| Phone 375px | Menu in one column; sections readable; no horizontal overflow |
| Desktop 1280px | Menu in three columns; text column capped at 70ch |
| Section menu | « Infos pratiques » scrolls to the section and focus lands on it, reusing Bolt 10's handling |
| Headings | `h1` → `h2` per section → `h3` per activity group, in order |
| AXE 4.10.2 | One violation, the known `.footer-copy` contrast. Nothing new |
| Console | No errors |

## Noted during verification

**The Google Maps link is a search URL** (`…/maps/search/?api=1&query=Intermarché+Barcelonnette`) rather than a place link, since no place id was to hand. It should land on the right shop, but Thomas should click it once and say if a proper place link is needed.

**16 placeholders remain.** They are listed in [ideas/stay-content.md](../ideas/stay-content.md). The most useful ones to fill before sending the link to a guest are the parking access, the rubbish, the sofa bed and the appliances.

**The hikes and trails section stays a placeholder on purpose:** Thomas wants to handle that part himself, and the form (links, GPX, a map) is still to be decided.
