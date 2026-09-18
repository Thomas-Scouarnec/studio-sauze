# Bolt 7 Plan — About Photos

**Intent:** Replace the About section's decorative collage with real photos of the flat.
**Date:** 2026-09-18
**Stories:** [about-photos.md](../story-artifacts/about-photos.md) · **Design:** [design-artifacts/about-photos.md](../design-artifacts/about-photos.md) · **Spec:** [flat-info.md](../functional-specs/flat-info.md)

---

## Steps

- [x] **Step 1 — Prepare the files**
  - Rename to `living-room-800w.webp`, `living-room-1200w.webp` and `forest-view-800w.webp`
  - Remove `residence-800.webp` from `public/images/about/` (Thomas keeps his original)

- [x] **Step 2 — Share the photo type**
  - Move `SeasonPhoto` to `responsive-image-loader.ts` as `ResponsivePhoto`; `SeasonsService` uses it

- [x] **Step 3 — Add the photo data to `FlatInfoService`**
  - `AboutPhotos` interface and a readonly `aboutPhotos` signal, with the data from the design
  - `flat-info.service.spec.ts`: both photos have French alt text

- [x] **Step 4 — One file check for the whole site**
  - New `src/app/loaders/photo-files.spec.ts`: every photo in `SeasonsService` and `FlatInfoService` includes the 800w fallback and has a file on disk for each declared width
  - Remove the now-duplicated checks from `seasons.service.spec.ts`

- [x] **Step 5 — Render the photos in `AboutComponent`**
  - `about.ts`: import `NgOptimizedImage`; provide `IMAGE_LOADER`
  - `about.html`: two photo frames in fill mode with `ngSrc`, `ngSrcset`, `sizes` and `alt`; emoji, amber block and the container's `aria-hidden` removed

- [x] **Step 6 — Rework `about.css`**
  - Collage at `aspect-ratio: 5 / 4`, `max-width: 600px`; séjour 4:3 top left; forest 3:4 bottom right, overlapping
  - `object-fit: cover` on both photos; remove `.about-box*` and `.box-icon`
  - Below 768px: collage shown under the text with the séjour only, full width

- [x] **Step 7 — Component tests**
  - New `about.spec.ts`: host ARIA; two described, lazy-loaded images with the expected `srcset`; nothing `aria-hidden` in the collage; only two photo frames; no emoji; Maps link unchanged

- [x] **Step 8 — Verify**
  - `npm test` and production build pass
  - Browser at 1280px and 1920px: collage proportions identical at both widths, photos undistorted, overlap readable
  - Browser at 375px: séjour photo full width under the text; forest photo not downloaded; no horizontal overflow
  - Network: no 404s, and `residence-800.webp` absent from the build output; console: no `NgOptimizedImage` warnings

---

## NFRs

- Standalone, `OnPush`, signals, `inject()`, native control flow
- `NgOptimizedImage` for all photos (project rule)
- Alt text in French; identifiers in English
- WCAG AA: informative images have alt text; no new contrast pairs

---

## Out of scope (deliberate)

- The residence photo and Équipements photos
- Carousel, lightbox
- `--stone` contrast on the About stat labels (accessibility bolt)

---

**Bolt 7 implemented on 2026-09-18.**

## Verification results

| Check | Result |
|---|---|
| `npm test` | 70 tests pass (10 files) |
| Production build | Succeeds; `images/about/` ships the four photo files and no `residence` file |
| Desktop 1280px (1.25× density) | Collage 536×429 (5:4); séjour 386×290 (4:3); mountain 284×160 (16:9); forest 182×243 (3:4); all 800w files |
| Desktop 1920px | Collage capped at 600×480; séjour 432×324, forest 204×272 — same proportions as at 1280px |
| Mobile 375px (2× density) | Séjour 338×253, full width under the text and the Maps link; forest and mountain hidden; no horizontal overflow |
| Accessibility | All three images carry their French alt text; nothing in the collage is `aria-hidden` |
| Console | No `NgOptimizedImage` warning, no error |

## Noted during verification

**The amber block was removed after review.** Thomas read it as an unfilled photo slot. It was deleted from the template and styles, the séjour moved back to the left edge, and a test now asserts the collage holds exactly the two photo frames. Re-verified at 1280px and 375px.

**A third photo was added after review.** With the amber block gone, Thomas supplied `mountain-800.webp` (the Chapeau du Gendarme), renamed `mountain-800w.webp`. It fills the lower-left of the collage in a 16:9 frame; hidden on phones. Re-verified at 1280px and 375px.

**The phone layout rule did not apply at first.** `about.css` mixes CRLF and LF line endings, and the scripted edit for the mobile block silently matched nothing, so the collage stayed `display: none` on phones. Caught in the browser (the séjour frame measured 0×0), fixed with an exact edit, and re-verified.

**The forest photo is not downloaded on real phones.** On a fresh page load under 375px emulation, both About photos were requested at 79ms. The cause is the emulator: it applies the phone width a moment after navigation starts, so the page first lays out at desktop width. Confirmed by cloning the forest frame (same classes and Angular style scoping) into the settled phone layout with a fresh URL: it computes to `display: none` and is never fetched, even scrolled into view. A real phone has its width from the first instant.

**Browser pane screenshots crop at about 640 CSS pixels** (800 device pixels at 1.25× density). Desktop proof screenshots were taken with the page rendering scaled by 0.5 via a CSS transform, which leaves the layout untouched.
