# Design — Équipements Photos

**Unit:** Équipements Photos
**Date:** 2026-09-19
**Stories:** [equipment-photos.md](../story-artifacts/equipment-photos.md) · **Spec:** [flat-info.md](../functional-specs/flat-info.md) · **Builds on:** [about-photos.md](about-photos.md) (shared `ResponsivePhoto`, site-wide file check)

## Responsibility

Fills the Équipements blocks' photo frames where a photo exists, and removes the frame where none does. Block layout and copy do not change.

## Files provided by Thomas

| Provided as | Outcome | Size | Ratio | Weight |
|---|---|---|---|---|
| `equipement/coin-montagne-800w.webp` | → `equipment/sleeping-800w.webp` | 800×600 | 4:3 | 90 KB |
| `equipement/kitchen-800w.webp` | → `equipment/kitchen-800w.webp` | 800×1067 | 3:4 | 110 KB |
| `equipement/ski-box-800w.webp` | first held back (locker numbers, BR-7) and sent to the Recycle Bin; re-added by Thomas and published at his request → `equipment/arrival-800w.webp` | 796×1061 | 3:4 | 18 KB |
| three `*-800w.jpeg` originals | **removed before the bolt** — iPhone EXIF with GPS coordinates (BR-2); sent to the Recycle Bin | — | — | 3.9–6.6 MB |

The folder is renamed `equipment` (English identifiers). Files are named after their block id, so a replacement photo is a same-name file drop.

## Data — `FlatInfoService`

`EquipmentBlock` gains an optional photo:

```ts
export interface EquipmentBlock {
  id: string;
  title: string;
  body: string;
  photo?: ResponsivePhoto;
}
```

| Block | `src` | `srcset` | `alt` |
|---|---|---|---|
| `arrival` | `equipment/arrival` | `800w` | Les casiers à skis sécurisés du rez-de-chaussée |
| `sleeping` | `equipment/sleeping` | `800w` | Deux enfants blottis dans les couchages du coin montagne |
| `kitchen` | `equipment/kitchen` | `800w` | Le coin cuisine : micro-ondes et meubles en pin, à côté de la télévision |

Optional rather than required: the data states honestly that a block has no photo yet, and the template renders accordingly.

## Component — `EquipmentComponent`

- Imports `NgOptimizedImage`; provides `IMAGE_LOADER` with `responsiveImageLoader`, the same component-scoped provider as Seasons and About.
- The frame renders only when the block has a photo:

```html
@if (block.photo; as photo) {
  <div class="equipment-photo">
    <img [ngSrc]="photo.src" [ngSrcset]="photo.srcset"
         sizes="(max-width: 768px) 90vw, 280px" [alt]="photo.alt" fill />
  </div>
}
```

- `aria-hidden` leaves the frame: it now holds an informative image. The list icons keep theirs.
- A block without a photo gets a `text-only` class, used by the layout below.

## Layout

- `.equipment-photo` keeps `flex: 0 0 280px` and `aspect-ratio: 4 / 3`; it gains `position: relative` and `overflow: hidden` (fill mode).
- `object-fit: cover` on the images. The kitchen photo is portrait, so only 56% of its height fits; `object-position` keeps the microwave and worktop (tuned in the browser, around `50% 35%`).
- **Text-only block, desktop:** its text is indented by the frame width plus the gap (`280px + 2.5rem`), so all three block texts share one left edge. **Phones:** no indent, since frames stack above the text there.

**`sizes`:** 280px on desktop; below 768px the frame is full width, `90vw`. Only 800w exists, so tablets (about 690px × 2) get a slightly soft image. Acceptable for temporary photos; the final photos should add 1200w.

## Tests

- `photo-files.spec.ts`: `allPhotos()` also collects the Équipements block photos, so the file and alt checks cover them.
- `flat-info.service.spec.ts`: all three blocks have their photo and alt text.
- `equipment.spec.ts`: the decorative-elements test is split. Icons stay `aria-hidden`; each of the three frames holds a described, lazy-loaded image with the expected `srcset`. A second `describe` block provides a stub `FlatInfoService` with a photo-less block and checks it renders text-only, with no frame.

## Decisions and alternatives considered

**No frame rather than an empty frame.** The amber block in Bolt 7 showed that an empty, photo-shaped box reads as a missing photo. The frames live today are the same problem.

**Ski locker photo: first excluded, then published at Thomas's request.** It was held back under BR-7 (readable locker numbers). Thomas re-added it and asked for it to be used anyway; it is recorded as an explicit exception in `flat-info.md` BR-7, limited to this photo. The file is 796px wide but named and declared as 800w, which the loader convention requires; the 0.5% difference has no visible effect.

**Text-only capability kept.** All three blocks now have a photo, but the optional `photo` and the `text-only` layout stay, tested with a stub service, so a missing photo never again means an empty frame.

**Kitchen photo published as a stopgap.** Chosen by Thomas, knowing it shows the TV unit also visible in the About photo and a handbag at its edge. To be replaced by a shot of the wooden table, fridge and oven that the block describes.

**Children's faces in the sleeping photo.** Accepted by Thomas.
