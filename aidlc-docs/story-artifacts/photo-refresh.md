# User Stories — Photo Refresh

**Intent:** Replace every photo of the flat with the ones taken in autumn 2026, and illustrate the guest guide.

---

## US-1 — See the flat as it is today

**As a** potential renter,
**I want** the photos to show the flat as I will find it,
**So that** nothing surprises me on arrival.

**Acceptance criteria:**
- No photo of the flat predates autumn 2026: the living room, window, mountain, entrance, mountain corner and kitchen photos are all new
- Each photo's alt text describes what the new photo shows
- The gallery shows eight photos of the flat, in walk-through order, including the mountain corner with its curtain drawn and the table set for a raclette

---

## US-2 — Find my way with pictures

**As a** guest arriving for the first time,
**I want** to see the road, the car parks and the entrance before I get there,
**So that** I recognise them on the spot.

**Acceptance criteria:**
- « Accéder au parking » shows the road to take and the car park
- « Si le parking est complet » shows one of the other car parks
- « Jusqu'à l'appartement » shows the residence entrance
- No « Photo à venir » remains for these items

---

## US-3 — Know what is around

**As a** guest on site,
**I want** to see the tennis courts, the pétanque ground, the play area and the rubbish containers,
**So that** I know what I am looking for.

**Acceptance criteria:**
- Tennis, Pétanque, Jeux en bois and Les poubelles each show their photo
- The « Jeux en bois » text mentions the table-tennis table the photo shows

---

## US-4 — Nothing private is published

**As the** owner,
**I want** the private parking photos and the treasure-hunt screenshots kept off the website and off GitHub,
**So that** they stay private until I decide to use them.

**Acceptance criteria:**
- None of them is in `public/` or in a commit; they are in a git-ignored folder
- No published file carries location metadata; no readable licence plate
