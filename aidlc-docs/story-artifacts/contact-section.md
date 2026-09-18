# User Stories — Contact Section

**Intent:** Redesign the "Nous rejoindre" section into an honest, email-only way to ask a question or request a stay.

---

## US-1 — No false confirmation

**As a** potential renter,
**I want** the site to never tell me my request was sent when it was not,
**So that** I do not wait for a reply that will never come.

**Acceptance criteria:**
- The contact form is removed entirely, including its success message
- No element of the section claims a message has been sent or received
- `ReactiveFormsModule` is no longer imported by the section

---

## US-2 — A real, visible email address

**As a** visitor with a question,
**I want** one clearly visible email address I can click,
**So that** I can write from my own mailbox.

**Acceptance criteria:**
- The address is shown as text and is a `mailto:` link
- The link carries no pre-filled subject or body
- The address lives in a service, not in the template (BR-3)
- The address is the dedicated rental inbox, never a personal one

---

## US-3 — Know what to include

**As a** visitor requesting a stay,
**I want** to know what information to give in my first email,
**So that** the owner can answer without a round of follow-up questions.

**Acceptance criteria:**
- A checklist lists: arrival and departure dates, number of people, any questions
- The number of people states the maximum, derived from `maxGuests` (BR-1 in `flat-info.md`)
- Pets are not mentioned (policy undecided)

---

## US-4 — Honest expectations

**As a** visitor,
**I want** to understand how quickly I will hear back and when my stay is actually booked,
**So that** I do not assume a reservation exists.

**Acceptance criteria:**
- The reply promise is "rapidement", with no time figure
- A note states that a stay is confirmed by the owner's reply and that no booking is recorded on the site

---

## US-5 — One name, contact facts only

**As a** visitor navigating the page,
**I want** the section to be called what the navbar calls it and to contain only contact information,
**So that** I land where I expect and do not read the same location twice.

**Acceptance criteria:**
- The section label reads "Contact", matching the navbar; the heading reads "Écrivez-nous"
- The location block (station, region, postcode) is removed
- The anchor stays `#contact`
- All text meets WCAG AA (≥4.5:1); the checklist has a heading and the list is labelled by it

---

## Out of scope (deliberate, this bolt)

- Any form, form service or serverless function
- Phone, WhatsApp or rental-platform links
- Getting to Le Sauze (access, travel times)
- The pets policy
- The `--stone` contrast defect in other sections
