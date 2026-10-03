# Functional Specification — Page Not Found

**Status:** Active (Bolt 24)
**Owner domain:** What a visitor sees at an address the site does not have
**Created:** 2026-10-03 (Session 24)

---

## 1. Purpose

Turns a broken link into a clear, short page that explains and leads back, in the visitor's language. Replaces [stay.md](stay.md) FR-12 (« An unknown path redirects to the home page »).

## 2. Scope

Covers unknown addresses under both languages, the page shown for them, its language, and what search engines are told. It does not cover redirects from old addresses (the site has never moved a page).

## 3. Functional Requirements

| ID | Requirement | Rationale |
|---|---|---|
| FR-1 | Any address that is not a page of the site shows the « page not found » page; the address bar keeps the address asked for | The visitor sees what went wrong, and can correct a typo |
| FR-2 | The server answers such an address with status 404 | Search engines drop broken addresses instead of indexing them |
| FR-3 | The page shows the navbar and footer, a heading, one sentence of explanation and a link to the home page | The navbar keeps the site's usual ways out, including « Mon séjour » for a guest (stay.md FR-5) |
| FR-4 | Its title is « Page introuvable — Notre Refuge au Sauze » / « Page not found — Notre Refuge au Sauze » | WCAG 2.4.2 |
| FR-5 | An unknown address under `/en/` shows the English page | GitHub Pages serves one `404.html`, the French one; the English page is reached from it |
| FR-6 | A visitor whose saved language is English gets the English page at an unknown French address too | localization.md FR-9 applies to this page as to the others |
| FR-7 | The page is `noindex`, without canonical link or `hreflang` alternates | search-and-sharing.md FR-9 |
| FR-8 | The page is prerendered: it reads without JavaScript | Like every page since Bolt 18 |

## 4. Business Rules / Constraints

| ID | Rule |
|---|---|
| BR-1 | **Copy is French first,** with stable `@@notFound.…` ids (localization.md BR-3, BR-5) |
| BR-2 | **No blame:** the text does not say the visitor made a mistake; a link can be old as well as mistyped |

## 5. Out of scope

- Showing the address asked for on the English page (it changes to `/en/404`, see the design's D3)
- Suggesting the nearest existing page
- Redirects from old addresses
