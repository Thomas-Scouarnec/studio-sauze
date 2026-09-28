# Functional Specification — Navigation

**Status:** Active
**Owner domain:** How visitors move around the home page, and the rules shared by every in-page menu of the site
**Created:** 2026-09-28 (Session 15)

---

## 1. Purpose

Defines the home page's navigation on phones and the rules every in-page menu follows. The site navbar's links between pages (FR-5 to FR-9 of [stay.md](stay.md)) and the `/stay` section bar (FR-14, FR-22 to FR-28 of [stay.md](stay.md)) stay specified there. Sibling to [localization.md](localization.md), whose flags this menu reuses.

## 2. Scope

Covers the home page's sticky bar on phones and small tablets (up to 768px wide). Desktop navigation on the home page is unchanged and out of scope.

## 3. Consuming Components

| Component | Consumes |
|---|---|
| `HomeNavComponent` | `HOME_SECTIONS`; `GuestAccessService.isGuest`; `LanguageSwitcherComponent`; `DisclosureDirective` |
| `NavbarComponent` | `HOME_SECTIONS` for its four section links |
| `StayNavComponent` | `DisclosureDirective` |
| Home page, stay page | `spyOnSections()` |

## 4. Functional Requirements

| ID | Requirement | Rationale |
|---|---|---|
| FR-1 | Up to 768px wide — where the navbar hides its section links (`max-width: 768px`) — the home page shows a bar right under the hero, which stays at the top of the screen once it gets there, down to the end of the page. From 768px up, there is no bar | Past the hero, a visitor on a phone had no navigation at all (Session 15). Thomas chose « always visible » over « shown on scrolling up » |
| FR-2 | The bar's button names the section being read (« Équipements »), or « Menu » above the first section; screen readers hear « Menu, section actuelle : Équipements » | Where am I, at a glance |
| FR-3 | The button opens a list of the four sections — L'appartement, Équipements, Activités, Contact — with the current one marked `aria-current="location"` | Every section two taps away |
| FR-4 | Below a separator, the list also holds « Mon séjour » (guests only, as in the navbar) and the language flags | Nothing in the hero's navbar is out of reach once it has scrolled away |
| FR-5 | A « Contact » link is always visible in the bar, outside the list | Getting in touch is what a renter comes to do (Thomas's decision, Session 15) |
| FR-6 | Following a section link or « Contact » closes the list, leaves the section heading visible below the bar, and moves focus to the section | A sticky bar must not cover what it points to |
| FR-7 | No element receiving keyboard focus is hidden under the bar, and focusing the bar never scrolls the page | WCAG 2.4.11; the Bolt 14 lesson |
| FR-8 | On a desktop, the navbar's links land exactly where they did before this bar existed | No change where no bar shows |
| FR-9 | The site navbar is never sticky on `/stay` | The section bar already holds the top of the screen there; two bars would stack |

## 5. Business Rules / Constraints

- **BR-1 (One way to close):** Every in-page menu of the site opens and closes the same way: its button toggles it; choosing an entry, tapping outside, Escape (focus back on the button) and tabbing out close it. Implemented once, in `DisclosureDirective`.
- **BR-2 (Distinct landmarks):** Each `nav` on a page has its own name: « Navigation principale » (navbar), « Sommaire » (`/stay`), « Navigation de la page » (home bar).
- **BR-3 (Single list of home sections):** The home sections' ids and titles are defined once, in `HOME_SECTIONS`, for the navbar and the bar.

## 6. Non-Functional Requirements

- Visible copy French, English through XLIFF; ids, classes and TypeScript symbols in English
- WCAG AA: disclosure with `aria-expanded` and `aria-controls`, no keyboard trap, targets of 44px, contrast, visible focus
- Motion only under `prefers-reduced-motion: no-preference`

## 7. Out of Scope

- A sticky navbar on the home page on desktop
- Hiding the bar while scrolling down
- Numbers and a progress line on the home bar (the home sections are not steps)

## 8. Open Questions

- None

## 9. Revision History

| Date | Change | Session |
|---|---|---|
| 2026-09-28 | Initial version | Session 15 |
