# User Stories — Equipment Section

**Intent:** Rework the "Équipements" section to highlight what differentiates this flat from other rentals in Le Sauze.

---

## US-1 — Differentiators lead the section

**As a** potential renter comparing several flats in Le Sauze,
**I want** the few things that genuinely set this flat apart presented prominently,
**So that** I can tell it apart from the other listings without reading an inventory.

**Acceptance criteria:**
- The section opens with three large blocks, each carrying one persuasive idea: arrival/access, sleeping, kitchen
- Each block has a headline and at most two sentences of prose
- Each block reserves a photo slot, so images can be added later without restructuring the layout
- The previous six-card content is fully replaced

---

## US-2 — Effortless arrival with equipment

**As a** guest arriving with skis, luggage and children,
**I want** to know how I get myself and my gear into the flat,
**So that** I can judge how practical the arrival will be.

**Acceptance criteria:**
- Headline is "Vos skis restent en bas"
- Mentions free parking at the foot of the building, the secured ski locker on the ground floor, and the lift to the 1st floor
- Makes clear the gear is dropped downstairs, then you take the lift up
- Does NOT claim the stairs are never used — guests can take them if they prefer
- Does NOT claim the skis take the lift
- Does NOT state a ski locker capacity (not yet verified)
- Parking wording is "parking gratuit au pied du bâtiment"

---

## US-3 — Five real sleeping places with privacy

**As a** group of up to five people considering a 32 m² studio,
**I want** to understand how five people actually sleep there,
**So that** I can be confident it is not an overstated capacity.

**Acceptance criteria:**
- The coin montagne is described as 3 sleeping places of 80 cm, suitable for adults, separable by a curtain
- The sofa bed is described as 160 cm and of very good quality, sleeping 2 more
- Wording stays consistent with the About section and with `maxGuests` (BR-1, BR-4)

---

## US-4 — A kitchen you can genuinely cook in

**As a** guest planning to self-cater for a week,
**I want** to know what the kitchen actually offers,
**So that** I know whether I can cook real meals for the group.

**Acceptance criteria:**
- Lists capability, not brands: 140 cm fridge, oven, dishwasher, hotplates, microwave, kettle, filter coffee machine, raclette set
- Mentions the wooden table seating five (three chairs and a bench)
- No appliance brand names appear anywhere in the section

---

## US-5 — Quick verification of the remaining amenities

**As a** visitor checking whether the flat meets my requirements,
**I want** a compact, scannable list of everything else,
**So that** I can confirm specific amenities in seconds without reading prose.

**Acceptance criteria:**
- A second tier, under an "Et aussi" label, lists the remaining flat amenities as short labelled items
- Contains exactly: baignoire et douche, WC séparés, lave-linge, TV (TNT), plusieurs espaces de rangement, emplacement pour sécher chaussures et gants, très bon réseau 4G/5G — pas de Wi-Fi, vue sur la forêt
- Connectivity is phrased positive-first, with the absence of Wi-Fi stated honestly rather than omitted
- The list collapses to a single column on narrow viewports

---

## US-6 — Honest claims only

**As the** owner,
**I want** every claim in the section to be verifiable,
**So that** guests are never disappointed on arrival and the site keeps its credibility.

**Acceptance criteria:**
- The drying area is described as a dedicated spot for drying boots and gloves — never as a "sèche-chaussures"
- No reference to the heating system or heating costs appears in the section
- No balcony or terrace is implied
- The view is described as "vue sur la forêt"
- Appliance quality is conveyed by capability plus at most one honest quality statement, not by brand names

---

## US-7 — Section scope is the flat only

**As a** developer maintaining the site,
**I want** location facts kept out of this section,
**So that** the same fact is not duplicated across sections and cannot drift (BR-3, BR-4).

**Acceptance criteria:**
- No distances, travel times, or proximity claims appear in the Équipements section
- Location content remains owned by the About section until a dedicated location section is created
- Section title remains "Ce qui vous attend"

---

## Out of scope (deliberate, this bolt)

- Photos and any carousel or click-to-open-photos interaction — placeholders only
- Summer-specific content (the About section continues to carry the all-season message)
- Linen, towels, end-of-stay cleaning — destined for a future restricted, guest-only section
- Segment-openers: baby equipment, pets
- A dedicated location section
