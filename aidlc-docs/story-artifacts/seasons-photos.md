# User Stories — Seasons Photos

**Intent:** Replace the two photo placeholders in the "Toute l'année" section with real photos: Le Sauze in winter and Barcelonnette during the Fêtes Latino-Mexicaines.

---

## US-1 — See the place, not a placeholder

**As a** visitor deciding whether the valley suits my holiday,
**I want** a real photo on each season card,
**So that** I can picture the snow front and the August festival instead of reading a label.

**Acceptance criteria:**
- The winter card shows the Sauze snow front; the summer card shows the Fêtes Latino-Mexicaines in Barcelonnette
- Each photo sits in the existing slot, between the title and the scene-setting sentence
- The slot keeps its 16:9 frame; photos fill it without distortion
- The summer photo (3:2) is trimmed from the top, so the dancers are not cut off at the bottom

---

## US-2 — Fast on a phone

**As a** visitor on a mobile connection,
**I want** the page to download only the photo size my screen needs,
**So that** the page stays quick and light on my data plan.

**Acceptance criteria:**
- Each photo is offered in two widths; the browser picks the smaller one on phones
- Photos are lazy-loaded, since both are well below the fold
- The frame's space is reserved before the photo arrives, so nothing jumps while loading
- Images use `NgOptimizedImage`, per the project convention

---

## US-3 — Described for screen reader users

**As a** visitor using a screen reader,
**I want** each photo described in French,
**So that** I get the same information as a sighted visitor.

**Acceptance criteria:**
- Winter alt text: « Le front de neige du Sauze, au pied des chalets, face aux sommets enneigés »
- Summer alt text: « Danseuses en robes colorées dans une rue de Barcelonnette pendant les Fêtes Latino-Mexicaines »
- The photo is no longer hidden from assistive technology (the placeholder's `aria-hidden` goes away with it)
- The placeholder label text is removed

---

## US-4 — Photos the owner can swap

**As the** owner,
**I want** to replace a photo by dropping new files and editing one data entry,
**So that** I can refresh the site's photos without touching the template or styles.

**Acceptance criteria:**
- Photo files follow one naming convention: `<name>-<width>w.webp` under `public/images/`
- Photo data (file name, available widths, alt text) lives in `SeasonsService`, not in the template (BR-3)
- A test fails if a declared photo width has no matching file on disk

---

## Out of scope (deliberate, this bolt)

- Équipements photos — no photos exist yet; the loader built here is reusable when they arrive
- Carousel, lightbox or click-to-enlarge
- Photo credits and licensing — set aside by Thomas
- AVIF or blurred placeholders
