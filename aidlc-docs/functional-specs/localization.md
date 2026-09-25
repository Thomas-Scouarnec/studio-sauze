# Functional Specification — Localization

**Status:** Draft — pending Thomas's approval (Session 12)
**Owner domain:** The languages the site is offered in, how a visitor picks one, and how the choice is remembered
**Created:** 2026-09-25 (Session 12)

---

## 1. Purpose

Offers the whole site in French and English, so that foreign renters can read it, while French stays the default language for family and French-speaking visitors. Cross-cutting: it touches every section described in [flat-info.md](flat-info.md), [seasons.md](seasons.md), [contact.md](contact.md) and [stay.md](stay.md), without changing what they say.

## 2. Scope

Covers the supported languages, the URLs of each language, the language switcher, how the choice is remembered, and the rules for writing and maintaining translations. It does not change any content: the English text is a translation of the French, reviewed by Thomas.

## 3. Mechanism (decided with Thomas)

Angular's **built-in i18n** (`@angular/localize`). The site is compiled once per language, into two static apps:

| Language | URL of the home page | URL of the stay page | Build folder |
|---|---|---|---|
| French (source, default) | `/` | `/stay` | `dist/…/browser/` |
| English | `/en/` | `/en/stay` | `dist/…/browser/en/` |

Changing the language loads the other app: it is a page load, not an in-page swap.

## 4. Consuming Components

| Component | Consumes |
|---|---|
| Every component with visible copy | `i18n` attributes in its template |
| `FlatInfoService`, `SeasonsService`, `ContactService`, `StayService`, `app.routes.ts` | `$localize` for the text they hold |
| `LanguageSwitcherComponent` (in the navbar) | `LanguageService` for the current language, the other language's URL and saving the choice |
| `main.ts` | `resolveLanguageRedirect()` before the app starts |

## 5. Functional Requirements

| ID | Requirement | Rationale |
|---|---|---|
| FR-1 | The site is available in French and in English | Thomas's request: foreign renters |
| FR-2 | French is the default: a visitor who has never chosen a language sees French at `/` and `/stay` | Thomas's request; existing links (booking emails, bookmarks) keep working unchanged |
| FR-3 | English is served under `/en/`: `/en/` and `/en/stay` | Consequence of built-in i18n (one app per language) |
| FR-4 | Every visible text, alternative text, `aria-label`, visually hidden text and page title is translated | A half-translated page is worse than none; alt texts and labels are content too |
| FR-5 | `<html lang>` is `fr` on French pages and `en` on English pages | WCAG 3.1.1; screen readers pick the right voice |
| FR-6 | The navbar shows a small flag for each language — French flag and British flag — on every page and at every screen width | Thomas's request; visitors on a phone must find it too |
| FR-7 | The current language's flag is marked as current and is not a link; the other flag links to the same page in the other language, keeping the section (`#fragment`) | The visitor stays where they were |
| FR-8 | Choosing a language by its flag saves it in the browser (`localStorage`) | Thomas's request: no need to choose again |
| FR-9 | A visitor whose saved language is English and who opens a French URL is sent to the same page under `/en/`, before the app renders | The saved choice replaces the default |
| FR-10 | An `/en/` URL always shows English, whatever the saved choice; it does not change the saved choice | A shared English link shows what the sender meant; only a flag click saves a choice |
| FR-11 | A direct visit to `/en/` or `/en/stay`, and a reload on them, show the English page | An English link sent to a guest must work first time |
| FR-12 | The guest flag (« Mon séjour » / « My stay ») is shared by both languages | Same browser, same guest |
| FR-13 | The home page declares its two language versions to search engines (`hreflang` alternates, French as `x-default`) | Lets Google show the English home page to English speakers |
| FR-14 | A link to an external site available in French only says so in English (« (in French) ») | English readers are not surprised by a French page |

## 6. Business Rules / Constraints

| ID | Rule |
|---|---|
| BR-1 | **Proper names are not translated:** Notre Refuge au Sauze (the site's brand, also in the English tab titles and hero), Le Roi Soleil, Crépuscule, Barcelonnette, Alpes de Haute-Provence, Chapeau du Gendarme, Intermarché, Mercantour, Serre-Ponçon, Pra-Loup. « loi Montagne » is kept and glossed once |
| BR-2 | **English is British English**, to match the British flag (colour, tyre, flat, car park, lift) |
| BR-3 | **Every translation unit has a stable custom id** (`@@area.key`), so rewording the French never silently drops the English |
| BR-4 | **A missing English translation fails the build** (`i18nMissingTranslation: "error"`) |
| BR-5 | **French is the source.** Content is written in French first, then translated; the English file never holds text the French does not have |
| BR-6 | **Storage may be unavailable** (private browsing, blocked storage): no error; the choice lasts for the page only, and French stays the default |
| BR-7 | **Route paths, ids, class names and TypeScript symbols stay English** in both languages — `/stay`, not `/séjour` |

## 7. Out of scope

- Other languages (Spanish, Italian…) — the setup supports them, adding one is a new translation file and a flag
- Detecting the browser's language on first visit — French is the default by Thomas's decision
- Translating the booking email and anything outside the site
