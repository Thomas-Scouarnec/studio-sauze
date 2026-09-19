# User Stories — Équipements Photos

**Intent:** Put photos in the Équipements blocks, whose photo slots have been empty placeholders since Bolt 3. The photos provided are temporary; Thomas will replace them with better shots.

---

## US-1 — See the sleeping space and the kitchen

**As a** potential renter checking whether the flat suits a group of five,
**I want** photos next to the sleeping and kitchen blocks,
**So that** I can see the beds and the cooking space the text describes.

**Acceptance criteria:**
- The `sleeping` block shows the coin montagne photo; the `kitchen` block shows the kitchen photo
- Both fill the existing 4:3 frame without distortion; the portrait kitchen photo is trimmed to keep the microwave and worktop
- Photos are shown on every screen size, as the frames are today

---

## US-2 — No empty frame

**As a** visitor,
**I want** a block without a photo to show no empty frame,
**So that** the page never looks like a photo failed to load or was forgotten.

**Acceptance criteria:**
- A block without a photo renders as text only (initially `arrival`; all three blocks have a photo after review)
- Its text stays aligned with the text of the other two blocks on desktop
- The block gains a photo later by adding one data entry, with no template change

---

## US-3 — Described for screen reader users

**As a** visitor using a screen reader,
**I want** each photo described in French,
**So that** I get the same information as a sighted visitor.

**Acceptance criteria:**
- Sleeping: « Deux enfants blottis dans les couchages du coin montagne »
- Kitchen: « Le coin cuisine : micro-ondes et meubles en pin, à côté de la télévision »
- The photo frames are no longer `aria-hidden`; the list icons stay decorative

---

## US-4 — Nothing private published

**As the** owner,
**I want** no photo file or metadata to reveal the flat's location or unit,
**So that** the site keeps BR-2 and BR-7 even with quick, temporary photos.

**Acceptance criteria:**
- No JPEG original with GPS data is in `public/` (moved to the Recycle Bin before the bolt, 2026-09-19)
- The ski locker photo shows the locker numbers « 04 » and « 10 ». Initially held back under BR-7, it is published at Thomas's explicit request, recorded as an exception to BR-7
- Published files are WebP with no embedded metadata

---

## US-5 — Files follow the convention

**As a** developer,
**I want** the Équipements photos named like every other photo on the site,
**So that** replacing a temporary photo is a matter of dropping in a file with the same name.

**Acceptance criteria:**
- Folder `equipement` renamed to `equipment` (English identifiers)
- Files named after their block: `arrival-800w.webp`, `sleeping-800w.webp`, `kitchen-800w.webp`
- The site-wide photo file check covers the Équipements photos

---

## Out of scope (deliberate, this bolt)

- 1200w versions — the temporary photos exist in 800w only; the final photos should add 1200w
- Carousel, lightbox
