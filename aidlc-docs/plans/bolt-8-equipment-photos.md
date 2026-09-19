# Bolt 8 Plan — Équipements Photos

**Intent:** Fill the Équipements photo frames with the temporary photos, and remove the frame where no photo exists.
**Date:** 2026-09-19
**Stories:** [equipment-photos.md](../story-artifacts/equipment-photos.md) · **Design:** [design-artifacts/equipment-photos.md](../design-artifacts/equipment-photos.md) · **Spec:** [flat-info.md](../functional-specs/flat-info.md)

---

## Done before the bolt (privacy, 2026-09-19)

- The three JPEG originals (iPhone EXIF with GPS) and the ski locker WebP (locker numbers) sent from `public/images/equipement/` to the Recycle Bin, so no deploy can publish them

## Steps

- [x] **Step 1 — Fix the folder and file names**
  - `public/images/equipement/` → `public/images/equipment/`
  - `coin-montagne-800w.webp` → `sleeping-800w.webp`; `kitchen-800w.webp` keeps its name

- [x] **Step 2 — Add the photo data**
  - `EquipmentBlock` gains `photo?: ResponsivePhoto`; `sleeping` and `kitchen` get their photo, `arrival` none
  - `flat-info.service.spec.ts`: `arrival` has no photo; the two alt texts are as validated

- [x] **Step 3 — Extend the site-wide file check**
  - `photo-files.spec.ts`: `allPhotos()` includes the Équipements block photos

- [x] **Step 4 — Render the photos in `EquipmentComponent`**
  - `equipment.ts`: import `NgOptimizedImage`; provide `IMAGE_LOADER`
  - `equipment.html`: frame and `<img>` in fill mode inside `@if (block.photo; as photo)`; `aria-hidden` removed from the frame; `text-only` class on blocks without a photo

- [x] **Step 5 — Update `equipment.css`**
  - Frame: `position: relative`, `overflow: hidden`; `object-fit: cover`; kitchen `object-position` tuned to keep the microwave and worktop
  - Text-only block: text indented by `280px + 2.5rem` on desktop, no indent on phones

- [x] **Step 6 — Component tests**
  - `equipment.spec.ts`: icons `aria-hidden`; two described, lazy-loaded photos with the expected `srcset`; no frame in the `arrival` block

- [x] **Step 7 — Verify**
  - `npm test` and production build pass; `images/equipment/` ships exactly two files, no JPEG
  - Browser at 1280px: two photos in 280px 4:3 frames, arrival text aligned with the others, no empty frame
  - Browser at 375px: photos full width above their text, arrival text-only, no horizontal overflow
  - Console: no `NgOptimizedImage` warning

---

## NFRs

- Standalone, `OnPush`, signals, `inject()`, native control flow
- `NgOptimizedImage` for all photos (project rule)
- Alt text in French; identifiers in English
- WCAG AA: informative images have alt text; no new contrast pairs

---

## Out of scope (deliberate)

- The arrival photo, 1200w versions, carousel/lightbox
- `--stone` / `.section-label` contrast (accessibility bolt)

---

**Bolt 8 implemented on 2026-09-19.**

## Verification results

| Check | Result |
|---|---|
| `npm test` | 74 tests pass (10 files) |
| Production build | Succeeds; `images/equipment/` ships exactly `arrival-800w.webp`, `sleeping-800w.webp` and `kitchen-800w.webp`, no JPEG |
| Desktop 1280px | `sleeping` and `kitchen` in 280×210 frames (4:3); `arrival` has no frame; all three block texts start at the same left edge (384px) |
| Mobile 375px | Photos 338×253, full width above their text; `arrival` text-only with no indent; no horizontal overflow |
| Images | Both served 200 as WebP (90 KB, 110 KB) from the URLs the page requests; French alt text; `loading="lazy"` |
| Accessibility | Nothing in the blocks is `aria-hidden`; the eight list icons still are |
| Console | No `NgOptimizedImage` warning, no error |

## Noted during verification

**Ski locker photo added after review.** Thomas re-added the ski locker photo and asked for it to be published despite the locker numbers. Renamed `arrival-800w.webp`, alt text « Les casiers à skis sécurisés du rez-de-chaussée », recorded as a BR-7 exception. All three blocks now have 280×210 frames with text aligned at 384px. The text-only test now uses a stub `FlatInfoService` with a photo-less block, so FR-22 stays covered.

**Block id as a class.** The kitchen crop was first targeted with `:nth-child(3)`, which would silently hit the wrong block if the order changed. The article now carries its block id as a class (`[class]="block.id"`, merged with the static `equipment-block` class), the same pattern as the Seasons cards.

**Lazy images never load in a hidden Browser pane.** With the pane hidden, the browser does not run the visibility check that triggers lazy loading, so the photos stayed pending. Verified instead by fetching the exact `src` URLs the page requests (both 200, WebP). The kitchen crop (`object-position: 50% 35%`) is therefore not visually confirmed here; Thomas to check it on his running dev server.

**Verified on Thomas's own dev server (port 4200)**, which was already running this project with hot reload, rather than starting a second one.
