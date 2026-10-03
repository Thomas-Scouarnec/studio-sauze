# User Stories — Search and Sharing

**Intent:** Give every page the tags search engines and messaging apps read, so the site has a proper snippet in Google and a photo, title and summary when its link is shared (WhatsApp, Messenger, SMS, email). Idea 2 of Session 18.

---

## US-1 — A shared link shows a preview

**As a** family member sending the site's link on WhatsApp or by text message,
**I want** the link to show a photo, the site's name and one sentence about the flat,
**So that** the person receiving it sees at once what it is, instead of a bare address.

**Acceptance criteria:**
- `/` and `/en/` each carry Open Graph tags: `og:title`, `og:description`, `og:url`, `og:image` (with its width, height and `alt`), `og:type`, `og:site_name`, `og:locale`
- `twitter:card` is `summary_large_image`, so apps that read Twitter tags show the large photo too
- The preview image is a 1200×630 JPEG at an absolute `https://refugedusauze.com/…` URL
- The tags are in the prerendered HTML: a messaging app that does not run JavaScript still finds them
- The English page's preview is in English (`og:locale` `en_GB`)

---

## US-2 — A good snippet in search results

**As a** potential renter searching for a flat near Barcelonnette,
**I want** the result to show an accurate, readable summary of the flat,
**So that** I can tell it matches what I am looking for before I click.

**Acceptance criteria:**
- `/` and `/en/` each have a `<meta name="description">` of at most 160 characters, in their own language, stating facts from [flat-info.md](../functional-specs/flat-info.md) only
- Each indexed page has a `<link rel="canonical">` to its own absolute URL
- `robots.txt` and `sitemap.xml` exist at the site root; the sitemap lists `/` and `/en/`, each with its language alternates

---

## US-3 — The guest page stays unlisted, but previews well

**As a** guest receiving the `/stay` link by email, then forwarding it to my group on WhatsApp,
**I want** the link to show a preview too,
**So that** everyone in the group knows it is the guide to our stay.

**Acceptance criteria:**
- `/stay` and `/en/stay` have a description and Open Graph tags of their own, revealing no practical detail (no address, code or time)
- They keep `<meta name="robots" content="noindex">` ([stay.md](../functional-specs/stay.md) FR-3) and have no canonical link and no `hreflang` alternates
- `/stay` appears neither in `sitemap.xml` nor in `robots.txt` (stay.md FR-2)

---

## US-4 — Tags follow the page

**As a** visitor moving between the home page and the stay page without reloading,
**I want** the page's tags to always describe the page I am on,
**So that** a link I share or bookmark from the browser shows the right preview.

**Acceptance criteria:**
- Going from `/` to `/stay` in the app, then back, leaves exactly the tags of the page shown: no duplicate tag, no leftover `noindex` on the home page
- Hydration still reports no mismatch and no console error
- AXE: 0 violations, unchanged
