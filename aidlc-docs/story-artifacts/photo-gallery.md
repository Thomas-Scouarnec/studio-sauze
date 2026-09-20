# User Stories — Photo Gallery

**Intent:** Let a visitor see every photo of the flat in one place. The three Équipements photos become the entry point: clicking one opens a full-screen gallery at that photo, from which the visitor browses all the flat's photos.

**Decided with Thomas (Session 9):**
- One **flat-wide** gallery, opening at the clicked photo — the Airbnb model — not three per-block carousels
- **Flat photos only.** The Seasons shots and `about/mountain` are landscapes and stay out
- **Entry point: the Équipements thumbnails only.** No separate « Voir toutes les photos » button in this bolt
- **No visible captions** in the gallery — a counter only

---

## US-1 — Open the gallery from a photo

**As a** potential renter,
**I want** clicking any Équipements photo to open a full-screen gallery at that photo,
**So that** I can see the whole flat without hunting around the page.

**Acceptance criteria:**
- Each of the three Équipements photos is a button; activating it opens the gallery showing that photo
- The gallery contains every flat photo, in walk-through order: `arrival`, `sleeping`, `kitchen`, `living-room`, `forest-view`
- `about/mountain` and the Seasons photos are not in the gallery
- The Équipements layout is unchanged — same frames, same crops, same alignment

---

## US-2 — See that the photos are clickable

**As a** visitor who does not habitually click photos,
**I want** a visible sign that the photos open something,
**So that** I discover the gallery instead of scrolling past it.

**Acceptance criteria:**
- Each thumbnail carries a permanently visible badge with an expand icon, legible on touch devices where there is no hover. It states that the photo opens, and nothing else — a count there would describe the gallery while sitting on one block's photo, reading as « this block has N photos »
- Hover and keyboard focus both darken the photo and show the same affordance; focus has a visible ring meeting WCAG AA
- The badge is not the only signal — the element is a real `<button>`, so it is reachable by Tab and announced as a button

---

## US-3 — Browse the photos

**As a** visitor with the gallery open,
**I want** to move between photos and close the gallery easily,
**So that** looking through five photos never feels like work.

**Acceptance criteria:**
- Previous / next buttons, wrapping around at both ends
- Left and right arrow keys do the same
- Horizontal swipe moves between photos on touch devices
- Esc closes the gallery; so does a close button and a click on the backdrop
- A counter reads « Photo 3 sur 5 »

---

## US-4 — Usable without a mouse or without sight

**As a** visitor using a keyboard or a screen reader,
**I want** the gallery to behave like a proper dialog,
**So that** I am not trapped, lost, or left guessing which photo is shown.

**Acceptance criteria:**
- Built on the native `<dialog>` element opened with `showModal()`: focus is trapped inside, the page behind is inert, Esc closes
- Closing returns focus to the thumbnail that opened the gallery
- The dialog has a French accessible name; every control has a French label (« Photo précédente », « Photo suivante », « Fermer la galerie »)
- The counter is an `aria-live="polite"` region, so changing photo is announced
- Each photo keeps its existing French alt text
- Controls sit on their own opaque background, never on the photo, so contrast holds on any image
- No autoplay or auto-rotation (WCAG 2.2.2); transitions are suppressed under `prefers-reduced-motion`
- The page behind does not scroll while the gallery is open
- Passes AXE with no violation

---

## US-5 — Loads no more than it shows

**As a** visitor on mobile data,
**I want** the gallery to cost nothing until I open it,
**So that** the page stays fast.

**Acceptance criteria:**
- No gallery photo is requested on page load; a closed `<dialog>` is `display: none`, so its lazy images stay unloaded
- Only the current photo and its two neighbours are fetched
- Photos are capped at their real pixel width (800px) rather than stretched to the viewport — see the constraint below
- The three Équipements photos are already in cache from the thumbnails, so opening from them is instant

---

## Known constraint — photo resolution

The flat photos exist **only at 800w**, and the JPEG originals were sent to the Recycle Bin during Bolt 8 (EXIF GPS, BR-7). There is nothing to re-encode a wider version from.

The gallery therefore caps the displayed photo at 800px CSS width and letterboxes it against the backdrop, instead of filling the viewport. On a phone this is pixel-accurate; on a desktop the photo occupies a centred panel rather than the full screen. When better photos are shot, adding the wider files and lifting the cap is a one-line change.

---

## Out of scope (deliberate, this bolt)

- A « Voir toutes les photos » button — offered and declined for now; it can be added later without touching the gallery
- Making the About photos clickable entry points — they are *in* the gallery, but only the Équipements thumbnails open it. Adding them later is a template change of a few lines
- Visible captions under the photos — offered and declined; the counter carries the position
- Deep-linking the open photo into the URL
- Thumbnail strip / filmstrip navigation inside the gallery — worth revisiting past ~10 photos
- Zoom / pan on a photo
- Sourcing new photos, and any width above 800w
