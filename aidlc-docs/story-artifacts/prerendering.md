# User Stories — Prerendering

**Intent:** Serve every page as finished HTML, written at build time, instead of an empty page that JavaScript fills in. Search engines, link previews and slow phones get the content straight away; the site stays static on GitHub Pages.

---

## US-1 — The content is in the page itself

**As a** search engine, a messaging app building a link preview, or a visitor on a slow phone,
**I want** the HTML of each page to already contain its text, headings and title,
**So that** I can read, index or show it without running the site's JavaScript.

**Acceptance criteria:**
- `/`, `/stay`, `/en/` and `/en/stay` are each served as a complete HTML page: headings, text, photos' `alt`, the translated `<title>`, `lang="fr"` or `lang="en"`
- With JavaScript disabled, each page shows its content (links to other sections still work as plain anchors)
- `/stay` and `/en/stay` keep `<meta name="robots" content="noindex">`, now in the HTML itself

---

## US-2 — Nothing changes for visitors

**As a** visitor or guest,
**I want** the site to look and behave exactly as before,
**So that** the change is invisible except for speed.

**Acceptance criteria:**
- Same URLs, without a trailing slash and without an extra redirect: `/stay`, `/en/stay`
- Once the JavaScript has loaded, the page is the same live app: menus, gallery, section bars, flags, « Mon séjour » for a returning guest
- Angular takes over the existing HTML (hydration) instead of redrawing it: no flash, no jump, no hydration warning
- An unknown address still ends on the home page, as today
- All existing browser tests and AXE scans pass unchanged

---

## US-3 — An English visitor never sees French

**As a** visitor who chose English,
**I want** a French URL to send me to English before anything French appears,
**So that** my choice is respected (localization.md FR-9).

**Acceptance criteria:**
- With « English » saved, opening `/` or `/stay` goes to `/en/` or `/en/stay` (section kept) before the French page is painted
- The redirect does not wait for the app's JavaScript
- `/en/` URLs never redirect; storage unavailable → French, no error (BR-6)

---

## US-4 — The developer workflow stays the same

**As a** developer,
**I want** the same commands as before,
**So that** prerendering adds no new chore.

**Acceptance criteria:**
- `npm start`, `npm run start:all`, `npm test`, `npm run e2e`, `npm run deploy` work as before
- The browser tests run against the prerendered build, and check that the HTML has its content before JavaScript
- The README explains, briefly, what prerendering and hydration are and what code must not do (use `window`, `document` or `localStorage` outside the browser)
