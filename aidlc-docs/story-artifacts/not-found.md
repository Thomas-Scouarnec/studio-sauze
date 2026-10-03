# User Stories — Page Not Found

**Intent:** Replace today's silent jump to the home page with a real « page not found » page, so a visitor who follows a broken link understands what happened and finds their way. Idea 7 of Session 18.

---

## US-1 — I understand the link is broken

**As a** visitor who followed an old or mistyped link,
**I want** a page that says the address does not exist,
**So that** I don't wonder why I landed on the home page instead of what I asked for.

**Acceptance criteria:**
- Any unknown address (`/nowhere`, `/a/b/c`, `/stay/oops`) shows a « Page introuvable » page, with the site's navbar and footer
- The address bar keeps the address the visitor asked for: no redirect to `/`
- The page has its own title: « Page introuvable — Notre Refuge au Sauze »
- The server answers with status 404, as today

---

## US-2 — I can get back on track

**As a** visitor on the « page not found » page,
**I want** an obvious way to the home page, and to the guest page if I am a guest,
**So that** a broken link is not a dead end.

**Acceptance criteria:**
- A « Retour à l'accueil » link to the home page, in the page itself
- The navbar works as everywhere: its section links, the language flags and, for a returning guest, « Mon séjour »
- After moving to the page inside the app, focus is on its heading (as on every page)

---

## US-3 — In my language

**As an** English-speaking visitor following a broken `/en/…` link, or who chose English before,
**I want** the « page not found » page in English,
**So that** I can read it.

**Acceptance criteria:**
- An unknown address under `/en/` shows the English page (« Page not found »), with `lang="en"`
- A visitor who chose English and opens an unknown French address also gets the English page (localization.md FR-9)
- Everyone else gets the French page

---

## US-4 — Search engines are not misled

**As a** search engine,
**I want** unknown addresses to answer 404 with a page marked `noindex`,
**So that** I don't index broken addresses as copies of the home page.

**Acceptance criteria:**
- Status 404 and `<meta name="robots" content="noindex">`, no canonical link, no `hreflang` alternates (search-and-sharing.md FR-9)
- The page is in the HTML itself (prerendered), readable without JavaScript
- AXE: 0 violations on the page, in both languages, at both widths
