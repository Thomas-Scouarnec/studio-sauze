# User Stories — About Photos

**Intent:** Replace the decorative collage in the "L'appartement" section (three coloured blocks with emoji) with real photos of the flat.

---

## US-1 — See the flat itself

**As a** potential renter reading the description,
**I want** to see the flat next to the text that describes it,
**So that** I can judge the space for myself before writing to the owner.

**Acceptance criteria:**
- The collage shows three photos: the séjour (large, 4:3), the window view onto the forest (tall, 3:4), and the Chapeau du Gendarme (wide, 16:9), overlapping
- The collage contains only photos: the amber block and the ⛷️ and 🏔️ emoji are removed, so nothing can be mistaken for an empty photo slot
- The collage keeps the same shape at every desktop width, so the photos are never cropped differently from one screen to the next
- Photos fill their frames without distortion

---

## US-2 — Phones see the flat too

**As a** visitor on a phone,
**I want** at least the main photo of the flat,
**So that** I am not left with text only because my screen is small.

**Acceptance criteria:**
- Below 768px, only the séjour photo is shown, full width, under the text
- The forest and mountain photos are not downloaded on phones
- No horizontal overflow at 375px

---

## US-3 — Described for screen reader users

**As a** visitor using a screen reader,
**I want** each photo described in French,
**So that** I get the same information as a sighted visitor.

**Acceptance criteria:**
- Séjour: « Le séjour, avec son canapé-lit et sa commode en pin »
- Forest view: « La fenêtre du séjour, ouverte sur la forêt »
- Mountain: « Le Chapeau du Gendarme, sommet calcaire sous un ciel bleu »
- The collage is no longer hidden from assistive technology

---

## US-4 — Nothing identifying in the photos

**As the** owner,
**I want** no published photo to show licence plates, door numbers or other residents' details,
**So that** the site respects neighbours' privacy and does not reveal which unit is mine.

**Acceptance criteria:**
- The residence photo is not published: it shows other residents' cars with readable licence plates
- The residence file is removed from `public/`, since everything in that folder is deployed even when no page uses it
- The rule is added to `flat-info.md`, extending BR-2 (no exact address)

---

## US-5 — One convention for every photo

**As a** developer,
**I want** the About photos to follow the same file convention and checks as the Seasons photos,
**So that** adding a photo anywhere on the site works the same way.

**Acceptance criteria:**
- Files are named `<name>-<width>w.webp`
- Photo data (file name, widths, alt text) lives in `FlatInfoService`, not in the template (BR-3)
- One test checks that every photo declared anywhere on the site has its files on disk

---

## Out of scope (deliberate, this bolt)

- The residence photo — possibly reused later for the Équipements "arrival" block (parking at the foot of the building), once plates are blurred
- Équipements photos
- Carousel, lightbox or click-to-enlarge
- The `--stone` contrast defect on the About stat labels (accessibility bolt)
