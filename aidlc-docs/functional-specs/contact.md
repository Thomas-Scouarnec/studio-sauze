# Functional Specification — Contact

**Status:** Active
**Owner domain:** How visitors reach the owner — the published contact channel and what a request should contain
**Created:** 2026-09-18 (Session 5)

---

## 1. Purpose

Defines what the site says about getting in touch: which channel is published, what a visitor is asked to include, and what the site promises (and does not promise) about replies and bookings. Sibling to [flat-info.md](flat-info.md) (the property) and [seasons.md](seasons.md) (the valley).

## 2. Scope

Covers the Contact section. Excludes booking, availability and pricing (none exist on the site), and access to the flat (travel, directions).

## 3. Consuming Components

| Component | Consumes |
|---|---|
| Contact section | the contact email and the request checklist, from `ContactService` |

`ContactService` itself reads `maxGuests` from `FlatInfoService`.

## 4. Functional Requirements

| ID | Requirement | Rationale |
|---|---|---|
| FR-1 | The only published contact channel is email | Owner decision; no phone number or third-party listing is exposed |
| FR-2 | The email is shown in full as visible text and is a plain `mailto:` link, with no pre-filled subject or body | The address stays usable when copied by hand; a pre-filled subject was proposed and declined |
| FR-3 | The published address is a dedicated rental inbox, never a personal one | Keeps spam and the owner's name off the personal mailbox |
| FR-4 | The site contains no form that pretends to send a message | The site is static; a form without a backend loses every request while thanking the visitor |
| FR-5 | A request checklist asks for: arrival and departure dates, number of people (with the maximum), any questions | The first email should carry what the owner needs to answer |
| FR-6 | The maximum number of people in the checklist is derived from `maxGuests` | Keeps BR-1 of `flat-info.md` enforced after the guest dropdown is removed |
| FR-7 | Replies are promised "rapidement", with no time figure | The owner does not commit to a reply delay |
| FR-8 | The section states that a stay is confirmed by the owner's reply and that no booking is recorded on the site | Prevents a visitor from assuming a reservation exists |
| FR-9 | The section contains no location facts (station, region, postcode, distances) | Location is owned by the hero and About (same principle as FR-18 in `flat-info.md`) |
| FR-10 | The section is labelled "Contact", matching the navbar, and anchored at `#contact` | One name per section |

## 5. Business Rules / Constraints

- **BR-1 (No silent failure):** The site never confirms an action that did not happen. Any future form must only show success after a real delivery succeeds.
- **BR-2 (Single source of truth):** The email address and checklist live in `ContactService`, not in the template.
- **BR-3 (No undecided policies):** The checklist never mentions a policy the owner has not decided (e.g. pets). Asking about it implies an answer.

## 6. Non-Functional Requirements

- Content is in French (no localization in scope yet)
- All text meets WCAG AA (≥4.5:1)
- Technical identifiers in English, per project convention

## 7. Out of Scope

- Contact forms, form services, serverless functions
- Booking, availability calendar, pricing
- Access and travel information

## 8. Open Questions

- ~~**Final email address**~~ — resolved: `refugedusauze@gmail.com` created and confirmed by Thomas on 2026-09-18.
- **Pets policy** — undecided; the checklist stays silent until it is (BR-3).

## 9. Revision History

| Date | Change | Session |
|---|---|---|
| 2026-09-18 | Initial version | Session 5 |
