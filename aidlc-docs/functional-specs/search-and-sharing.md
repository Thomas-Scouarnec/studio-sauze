# Functional Specification — Search and Sharing

**Status:** Active (Bolt 23)
**Owner domain:** What search engines and link previews read about each page: descriptions, preview tags, canonical URLs, `robots.txt`, `sitemap.xml`
**Created:** 2026-10-01 (Session 23)

---

## 1. Purpose

Makes the site show well where people first meet it: in a search result, and in a link shared on a messaging app. Cross-cutting: it describes pages defined in [flat-info.md](flat-info.md) and [stay.md](stay.md), in both languages of [localization.md](localization.md), without changing what they say.

## 2. Scope

Covers the `<head>` tags of each page, the preview image, `robots.txt` and `sitemap.xml`. It does not cover structured data (`schema.org`), analytics, or registering the site with Google Search Console (Thomas's account, outside the repo).

## 3. Functional Requirements

| ID | Requirement | Rationale |
|---|---|---|
| FR-1 | Every page has a `<meta name="description">` in its own language, of at most 160 characters | Google shows about that much; beyond it, the text is cut |
| FR-2 | Descriptions state only facts already published on the page and in [flat-info.md](flat-info.md) | One source of truth; a snippet must never promise more than the page |
| FR-3 | Every page has Open Graph tags (`og:type`, `og:site_name`, `og:title`, `og:description`, `og:url`, `og:image`, `og:image:width`, `og:image:height`, `og:image:alt`, `og:locale`) and `twitter:card` = `summary_large_image` | What WhatsApp, Messenger, iMessage, Slack, LinkedIn and X read to build a preview |
| FR-4 | `og:locale` is `fr_FR` on French pages and `en_GB` on English pages (localization.md BR-2), with the other as `og:locale:alternate` | The preview's language matches the page's |
| FR-5 | All URLs in these tags are absolute, on `https://refugedusauze.com` | Crawlers do not resolve relative URLs in `og:` tags |
| FR-6 | One preview image for the whole site: 1200×630 JPEG, under 300 kB, with a translated `og:image:alt` | The size every platform crops well; JPEG is the format every preview reader accepts |
| FR-7 | Each indexed page has a `<link rel="canonical">` to itself | One address per page in search results |
| FR-8 | The `hreflang` alternates (localization.md FR-13) are set on the home pages only | The stay page is not indexed, so it has no alternates; today it wrongly inherits the home page's |
| FR-9 | The stay pages keep `noindex` (stay.md FR-3), and have neither a canonical link nor alternates | Unlisted |
| FR-10 | Their description and preview reveal no practical detail of the stay | A forwarded link must not publish the address, the parking or the key handover |
| FR-11 | `robots.txt` allows everything and points to `sitemap.xml`; it does not name `/stay` | Naming it would advertise it (stay.md FR-2); `noindex` already keeps it out of results |
| FR-12 | `sitemap.xml` lists `/` and `/en/`, each with its language alternates, and nothing else | stay.md FR-2 |
| FR-13 | The tags are in the prerendered HTML, and are updated when the app moves between pages | Preview readers do not run JavaScript; a visitor who navigates in the app shares the page they see |

## 4. Business Rules / Constraints

| ID | Rule |
|---|---|
| BR-1 | **Copy is French first,** then translated, with stable `@@seo.…` ids (localization.md BR-3, BR-5) |
| BR-2 | **The site's name is not translated:** « Notre Refuge au Sauze » in both languages (localization.md BR-1) |
| BR-3 | **No brand or price in descriptions** (flat-info.md FR-12; pricing is not published) |

## 5. Out of scope

- Structured data (`schema.org` `LodgingBusiness` / `VacationRental`): Google shows vacation-rental results only for listings from its partner programme, so the gain for a single flat is small
- One preview image per page
- Google Search Console setup and sitemap submission (Thomas, if he wishes)
