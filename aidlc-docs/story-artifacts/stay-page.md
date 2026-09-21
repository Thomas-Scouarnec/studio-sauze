# User Stories — Stay Page

**Intent:** Give guests with a confirmed booking a page of their own, reached by a link sent by email, and let them move freely between it and the public site. The page's content comes in a later bolt.

**Decided with Thomas (Session 10):**
- **Unlisted page, no code, no expiry** — the content is not sensitive
- Path **`/stay`** (English); visible copy French
- A **separate page**, with the site's navbar and footer
- The guest's browser remembers them; « Mon séjour » then appears in the navbar

---

## US-1 — Open the page from the booking email

**As a** guest with a confirmed booking,
**I want** the link in my confirmation email to open my stay page directly,
**So that** I find my trip information without searching.

**Acceptance criteria:**
- `https://refugedusauze.com/stay` opens the stay page, on first visit and on reload
- The page shows a dark banner with the navbar and the heading « Votre séjour », a short placeholder text, and the footer
- The tab reads « Votre séjour — Notre Refuge au Sauze »
- No home page section appears on it

---

## US-2 — Come back to the page later

**As a** guest who has already opened the link,
**I want** a « Mon séjour » link in the menu,
**So that** I can get back to my page from the home page without finding the email again.

**Acceptance criteria:**
- After visiting `/stay`, « Mon séjour » shows in the navbar on both pages, after Contact, in amber
- It is visible on phones too, where the four section links are hidden
- On `/stay` it is marked as the current page (`aria-current="page"`)
- It survives closing and reopening the browser
- If the browser blocks storage, no error occurs; the link is just absent

---

## US-3 — Go back to the public site

**As a** guest on my stay page,
**I want** the logo and the section links to take me back to the site,
**So that** I can check the flat's description or contact details.

**Acceptance criteria:**
- The logo links to the home page
- L'appartement, Équipements, Activités and Contact open the home page scrolled to their section
- On the home page, the same links still scroll as before, including a second click on the same link
- The browser's back and forward buttons move between the pages and restore the scroll position

---

## US-4 — Nothing changes for the public

**As the** owner,
**I want** visitors who never received the link to see no trace of the stay page,
**So that** it stays a space for guests.

**Acceptance criteria:**
- Without the guest flag, the navbar shows only the four section links, as today
- No `robots.txt` or sitemap mentions `/stay`
- `/stay` carries `noindex`; the home page does not
- The stay page's code is a separate lazy chunk, not in the home page bundle
- An unknown path redirects to the home page

---

## US-5 — Usable with a keyboard or a screen reader

**As a** visitor using a keyboard or a screen reader,
**I want** navigation between the pages to tell me where I am,
**So that** I am not left at the top of an unchanged-looking page.

**Acceptance criteria:**
- The skip link « Aller au contenu principal » works on both pages and keeps the visitor on the current page
- Arriving on `/stay` moves focus to the « Votre séjour » heading
- Following a section link moves focus to that section
- Each page has one `main` landmark and one `h1`
- AXE reports no new violation on either page
