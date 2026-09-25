# User Stories — Localization

**Intent:** Offer the whole site in French and English, with French as the default, a small flag per language to switch, and the visitor's choice remembered by their browser.

**Decided with Thomas (Session 12):**
- **Angular built-in i18n** (`@angular/localize`), one compiled app per language
- **French at `/`** (unchanged URLs), **English at `/en/`**
- **Whole site**, the `/stay` page included
- **Claude drafts the English**, Thomas reviews it before implementation
- The choice is saved in **`localStorage`**

---

## US-1 — Read the site in English

**As a** foreign visitor looking for a holiday rental,
**I want** to switch the site to English with one click,
**So that** I understand the flat, the seasons and how to book.

**Acceptance criteria:**
- The British flag in the navbar opens the same page in English, at the same section
- Every text is in English: headings, paragraphs, lists, buttons, photo descriptions, the gallery, the footer, the tab title
- Proper names stay as they are (Notre Refuge au Sauze, Le Roi Soleil, Barcelonnette…)
- External sites available in French only are marked « (in French) »

---

## US-2 — My language is remembered

**As a** visitor who has chosen English,
**I want** the site to open in English next time,
**So that** I do not have to choose again.

**Acceptance criteria:**
- After clicking the British flag, opening `https://refugedusauze.com/` or `/stay` shows the English version, including after closing the browser
- The French page does not flash before the redirect
- After clicking the French flag, the site opens in French again
- If the browser blocks storage, nothing breaks: the site simply opens in French next time

---

## US-3 — French stays the default

**As** Thomas,
**I want** French to remain the default language and every existing link to keep working,
**So that** family, French renters and booking emails already sent are not affected.

**Acceptance criteria:**
- A first-time visitor sees French at `/` and `/stay`, as today
- The French URLs are unchanged
- The French pages look and behave exactly as before, apart from the flags

---

## US-4 — Send an English link

**As** Thomas,
**I want** to send an English-speaking guest a link that opens in English,
**So that** they read their stay page in their language from the first visit.

**Acceptance criteria:**
- `https://refugedusauze.com/en/stay` opens the English stay page directly, and on reload
- `https://refugedusauze.com/en/` opens the English home page
- An `/en/` link shows English even to a visitor who has saved French, and does not change their saved choice

---

## US-5 — An accessible language switcher

**As a** visitor using a keyboard or a screen reader,
**I want** the flags to tell me which language they are for,
**So that** I can switch without seeing them.

**Acceptance criteria:**
- Each flag is announced by its language name in that language (« Français », « English »), with the right pronunciation (`lang` attribute)
- The current language is announced as current
- The flags are reachable with the keyboard, have a visible focus ring, and a touch target of at least 44 × 44 px on phones
- The page's `<html lang>` matches its language

---

## US-6 — Translations are easy to maintain

**As** Thomas, learning Angular,
**I want** the translations to live in one file, with a check that none is missing,
**So that** I can change a text in French and know the English needs updating.

**Acceptance criteria:**
- The English text is in one file, `src/locale/messages.en.xlf` (XLIFF 1.2, the format Thomas uses at work)
- `npm run extract-i18n` lists every translatable text
- A French text without its English translation fails the production build with its id
- `npm start` runs the French site; `npm run start:en` runs the English one
