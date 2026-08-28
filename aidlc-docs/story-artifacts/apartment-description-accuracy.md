# User Stories — Apartment Description Accuracy

**Intent:** Update the apartment description section to be as accurate and precise as possible.

---

## US-1 — Accurate capacity & sleeping arrangement

**As a** visitor reading the apartment description,
**I want** the guest capacity and sleeping setup described accurately,
**So that** I know exactly how many people can stay and how.

**Acceptance criteria:**
- Max guest count displayed is 5 (not 4)
- The description mentions both sleeping spaces: the "coin montagne" (bunk bed + drawer, 3 people) and the sofa bed (160cm, converts to a bed, 2 people)
- The "studio lumineux" (bright studio) claim is removed

---

## US-2 — All-season appeal

**As a** potential renter comparing summer vs. winter stays,
**I want** the description to mention hiking/snowshoeing in addition to skiing,
**So that** I consider the flat for a summer stay too, not just winter.

**Acceptance criteria:**
- The section mentions direct access to hiking trails in summer, not only ski slopes in winter
- Wording no longer frames the flat as winter/ski-only

---

## US-3 — Accurate proximity wording

**As a** visitor,
**I want** realistic distance information,
**So that** I'm not misled by exaggerated claims.

**Acceptance criteria:**
- The "0 marche jusqu'aux pistes" stat is replaced with wording reflecting "a couple of meters" to slopes/hiking trails/snowshoe trails
- A mention of ~10 minutes by car from Barcelonnette is added

---

## US-4 — Precise residence location

**As a** potential renter,
**I want** to know the residence name and see it on a map,
**So that** I can situate the flat before booking, without the exact door/apartment number being public.

**Acceptance criteria:**
- The residence name is displayed
- A Google Maps link is provided, pointing to the residence (not to the specific apartment/door)

---

## US-5 — Content cleanup

**As a** developer maintaining the site,
**I want** outdated or unused content removed,
**So that** the codebase and copy stay accurate and lean.

**Acceptance criteria:**
- Storage is described without a specific (currently incorrect) count, e.g. "plusieurs espaces de rangement" — updated consistently in both the About and Features sections
- The kitchen is highlighted as well-equipped
- The unused `description` field is removed from `FlatInfoService`, its interface, and any references
