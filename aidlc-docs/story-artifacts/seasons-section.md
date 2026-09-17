# User Stories — Seasons Section

**Intent:** Rework the "Toute l'année" section to highlight what there is to do in the valley, winter and summer.

---

## US-1 — Named highlights instead of anonymous tags

**As a** visitor deciding whether the valley suits the holiday I want,
**I want** the two or three standout things per season named and explained,
**So that** I understand what makes them worth coming for, not just that they exist.

**Acceptance criteria:**
- Each season card carries exactly three named highlights, each with a title and one line of text
- Remaining activities stay as tags, which are single words or short phrases
- The existing two-card structure (winter / summer) is preserved

---

## US-2 — The Mexican festival is presented as a reason to come

**As a** potential renter looking at August,
**I want** to know about the Fêtes Latino-Mexicaines and why they exist,
**So that** I can plan a stay around something I would not find in another ski valley.

**Acceptance criteria:**
- The official name "Fêtes Latino-Mexicaines de Barcelonnette" is used
- The duration is stated as ten days mid-August
- The link to the valley's emigration to Mexico is mentioned
- **No specific dates are published** — they change every year; visitors are pointed to the tourist office instead

---

## US-3 — Accurate activity list

**As the** owner,
**I want** only activities I can vouch for listed,
**So that** the section keeps the same credibility as the rest of the site.

**Acceptance criteria:**
- "Ski de fond" is removed (accuracy not confirmed)
- "Ski de randonnée" is not added (explicitly rejected)
- Chiens de traîneau, patinoire and Espace Lumière are not added (proposed but never confirmed)
- Winter gains Luge; summer gains Trail, Parapente, the festival and the Lac de Serre-Ponçon
- The Lac de Serre-Ponçon is stated as 45 minutes by car

---

## US-4 — Useful onward links

**As a** visitor planning the practical side of a stay,
**I want** a link to the resort and to the tourist office,
**So that** I can find lift passes, opening dates and current event dates myself.

**Acceptance criteria:**
- Exactly two external links: the Sauze resort on the winter card, the Ubaye tourist offices on the summer card
- Links open in a new tab and warn screen reader users, matching the existing Maps link pattern in About
- No other outbound links are added

---

## US-5 — Photo-ready cards

**As a** developer,
**I want** each card to reserve a photo slot with a label describing the intended subject,
**So that** images can be added later without restructuring, and so the owner knows which photos to source.

**Acceptance criteria:**
- One photo slot per card, not one per highlight
- Each slot displays a label naming the intended subject
- The decorative background symbol (❄ / ☀) is removed, since it would compete with a photo

---

## US-6 — Readable on a dark background

**As a** visitor,
**I want** the card text to be comfortably legible,
**So that** the denser content does not become hard to read on the dark panels.

**Acceptance criteria:**
- Body, highlight and tag text meet WCAG AA (≥4.5:1) against their card background
- Heading order is preserved, with no skipped levels
- The photo placeholder is hidden from assistive technology
- Cards stack to one column on narrow viewports

---

## Out of scope (deliberate, this bolt)

- Actual photography — placeholders only
- Any third external link
- Publishing year-specific event dates
- A dedicated location section (still pending from Session 3)
