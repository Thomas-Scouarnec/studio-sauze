# User Stories — Stay Content

**Intent:** Give the `/stay` page its full structure and the content already known, with visible placeholders for the facts Thomas will supply later.

**Decided with Thomas (Session 11):**
- Nine sections in trip order, activities split winter / summer
- Keys handed over by a local person at the residence, returned to them; late arrival → warn us
- Linen and towels not provided; flat n° 10 shown on the page
- Phone numbers in the booking email, not on the page
- Missing facts shown as « Information à venir »

---

## US-1 — Know what to prepare before leaving home

**As a** guest preparing my trip,
**I want** to know what to bring, when I can arrive and how I get the keys,
**So that** nothing surprises me on arrival day.

**Acceptance criteria:**
- « Avant d'arriver » says bed linen and towels are not provided
- It gives arrival from 16 h and departure before 11 h
- It explains the key handover by a local person at the residence, that their contact is in the confirmation email, and what to do if arriving late
- It reminds guests of the loi Montagne rule, with a link to the Sécurité Routière page
- It recommends the Intermarché of Barcelonnette, with a Google Maps link

---

## US-2 — Find the flat on arrival

**As a** guest arriving at the resort,
**I want** precise directions to the flat,
**So that** I don't end up at the neighbouring residence.

**Acceptance criteria:**
- « À l'arrivée » names the residence and building (from `FlatInfoService`) and links to the Maps location
- It gives the way up: lift to the 1st floor, flat n° 10 on the left
- It explains the ski locker, opened with the front door key
- It says there is no Wi-Fi but good 4G/5G
- Parking access and fallback parking show « Information à venir » until supplied

---

## US-3 — Use the flat and the valley

**As a** guest during my stay,
**I want** the flat's practical information and ideas for each season,
**So that** I make the most of the stay without calling the owners.

**Acceptance criteria:**
- « L'appartement » lists the kitchen basics provided, and how to report a problem (phone number in the email, or the contact email)
- « Activités » has Hiver, Été, En famille and Par temps de pluie (board games)
- « Commerces et services » has supermarket, boulangerie, restaurants, pharmacy, doctor and hospital
- « Infos pratiques » gives the residence rules on skis and ski boots
- Every fact not supplied yet shows « Information à venir »

---

## US-4 — Leave the flat as expected

**As a** guest on my last morning,
**I want** a short checklist and a clear key return,
**So that** I leave with nothing forgotten.

**Acceptance criteria:**
- « Avant de partir » is a checklist, starting with the 11 h departure
- It says the keys go back to the local person
- « Après votre séjour » thanks the guest, invites feedback at the contact email and welcomes word of mouth

---

## US-5 — Move around a long page

**As a** guest on a phone,
**I want** a menu of the sections,
**So that** I jump to what I need instead of scrolling.

**Acceptance criteria:**
- A « Sommaire » navigation lists the nine sections and links to each
- Following a link scrolls to the section and moves focus to it (reusing Bolt 10's handling)
- Each section is a labelled region with an `h2`; groups use `h3`
- Placeholders meet 4.5:1 contrast; AXE reports nothing new
