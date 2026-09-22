# Functional Specification — Stay

**Status:** Active
**Owner domain:** The guest-only page: information for people who have a confirmed booking, and how they reach it
**Created:** 2026-09-21 (Session 10)

---

## 1. Purpose

Defines the `/stay` page: a separate page of the site for guests with a confirmed booking, shared with them by link and not advertised anywhere on the public site. Sibling to [flat-info.md](flat-info.md) (the property), [seasons.md](seasons.md) (the valley) and [contact.md](contact.md) (getting in touch).

## 2. Scope

Covers the page itself, how a guest reaches it and comes back to it, the site-wide routing it requires (Bolt 10), and the page's content structure (Bolt 11). The facts still missing are tracked in [ideas/stay-content.md](../ideas/stay-content.md).

## 3. Consuming Components

| Component | Consumes |
|---|---|
| Stay page | `GuestAccessService.markAsGuest()` on arrival; `StayService.sections` for the content |
| `StayService` | residence, building and Maps link from `FlatInfoService`; email from `ContactService` |
| Navbar | `GuestAccessService.isGuest` to show « Mon séjour » |

## 4. Functional Requirements

| ID | Requirement | Rationale |
|---|---|---|
| FR-1 | The stay page is served at `/stay`, as a page of its own; no home page section is shown on it | Thomas wants it separate from the public content |
| FR-2 | No link to `/stay` exists in the public site's markup, and it is listed in no `robots.txt` or sitemap | Unlisted: guests receive the link by email. A listing would advertise it |
| FR-3 | The stay page carries `<meta name="robots" content="noindex">`; the home page does not | Keeps it out of search results if the link is ever shared publicly |
| FR-4 | Opening `/stay` records, in that browser, that the visitor is a guest | Lets the guest come back without the email link |
| FR-5 | Once recorded, the navbar shows « Mon séjour », linking to `/stay`, on every page and at every screen width | A guest mostly uses a phone during the trip, where the section links are hidden |
| FR-6 | A visitor who has never opened `/stay` sees the site exactly as before | The page stays unlisted |
| FR-7 | The stay page shows the same navbar and footer as the home page | Thomas's decision: it is part of the same site |
| FR-8 | The navbar's four section links reach their section from either page | On `/stay` they return to the home page, then scroll |
| FR-9 | The logo links to the home page | The expected way home |
| FR-10 | Each page has its own title: « Notre Refuge au Sauze » and « Votre séjour — Notre Refuge au Sauze » | WCAG 2.4.2; the tab tells the guest where they are |
| FR-11 | A direct visit to `/stay`, or a reload on it, shows the stay page | The email link must work first time |
| FR-12 | An unknown path redirects to the home page | No dead end |
| FR-13 | The page presents nine sections, in trip order: Bienvenue, Avant d'arriver, À l'arrivée, L'appartement, Activités, Commerces et services, Infos pratiques, Avant de partir, Après votre séjour | A guest reads it in the order they live it |
| FR-14 | A section menu at the top links to each section | The page is long, and read on a phone |
| FR-15 | Activities are grouped by season (Hiver, Été), then En famille and Par temps de pluie. Restaurants sit in Commerces et services | The page is read in both seasons; a restaurant is an address, like a shop (moved at Thomas's request) |
| FR-16 | A fact not yet supplied shows its title with « Information à venir » | The structure is complete, and every gap is visible and easy to find |
| FR-17 | The page gives arrival from 16 h, departure before 11 h, the key handover by a local person at the residence, and key return to the same person | Session 11 answers |
| FR-18 | The page states that bed linen and towels are not provided | Guests must know before packing |
| FR-19 | The page reminds guests of the loi Montagne winter equipment rule, with a link to the official page | Compulsory in Enchastrayes from 1 November to 31 March |
| FR-20 | The page shows the flat number (n° 10), floor and way from the lift | Thomas's decision; exception to BR-2 of `flat-info.md`, scoped to `/stay` |

## 5. Business Rules / Constraints

- **BR-1 (Unlisted, not private):** `/stay` is hidden only by not being linked. The path is in the public repo and the JavaScript bundle. Nothing sensitive is ever placed on the page — no door code, key box code or Wi-Fi password. Content that needs protecting requires a different mechanism, not this page.
- **BR-2 (No expiry):** Access does not end after the stay. Thomas chose this over a code-and-dates guard, since the content is not sensitive.
- **BR-3 (Local memory only):** The guest flag lives in the visitor's own browser. If storage is unavailable (private browsing, blocked site data), the page still works and « Mon séjour » simply does not appear.
- **BR-4 (No phone numbers on the page):** The owners' phone and the local key holder's contact are given in the booking email, never on the page. The page says where to find them. Extends BR-1 and `contact.md` FR-1.
- **BR-5 (Single source):** A fact already held elsewhere — residence and building names, the Maps link, the contact email — is read from its service, not restated in the stay content.

## 6. Non-Functional Requirements

- Content is in French; route paths, ids and TypeScript symbols in English
- WCAG AA: contrast, visible focus, and focus moved to the page heading or target section after navigation
- `/stay` is lazy-loaded, so the public home page does not download it

## 7. Out of Scope

- The missing facts themselves — added as data when Thomas supplies them
- The parked topics: road and weather, ski passes and hire, heating and hot water, baby equipment, emergency numbers, tourist tax, avalanche safety
- Photos on the stay page
- Access codes, stay dates, expiry, encryption
- A mobile menu for the four section links

## 8. Open Questions

- ~~**Flat number on the page**~~ — resolved in Session 11: shown on `/stay` (FR-20), as an exception to BR-2 of `flat-info.md`.
- **Hike and trail tracks** — links to an existing site, or GPX files to download?

## 9. Revision History

| Date | Change | Session |
|---|---|---|
| 2026-09-21 | Initial version | Session 10 |
| 2026-09-22 | Content structure: FR-13 to FR-20, BR-4, BR-5; flat number question resolved | Session 11 |
