# Design — About Photos

**Unit:** About Photos
**Date:** 2026-09-18
**Stories:** [about-photos.md](../story-artifacts/about-photos.md) · **Spec:** [flat-info.md](../functional-specs/flat-info.md) · **Builds on:** [seasons-photos.md](seasons-photos.md) (loader and file convention)

## Responsibility

Turns the About section's decorative collage into a two-photo collage of the flat. The text column does not change.

## Files provided by Thomas

| Provided as | Renamed to | Size | Ratio | Weight |
|---|---|---|---|---|
| `living-room-1200.webp` | `living-room-1200w.webp` | 1200×900 | 4:3 | 111 KB |
| `living-room-800.webp` | `living-room-800w.webp` | 800×600 | 4:3 | 50 KB |
| `forest-800.webp` | `forest-view-800w.webp` | 800×1067 | 3:4 | 83 KB |
| `residence-800.webp` | *removed from `public/`* | 800×450 | 16:9 | 73 KB |
| `mountain-800.webp` (added after review) | `mountain-800w.webp` | 800×600 | 4:3 | 119 KB |

All WebP, no embedded metadata. The `w` suffix is added so the files match the loader's `<name>-<width>w.webp` convention. The residence photo shows readable licence plates, so it is not published. Leaving it in `public/` would still deploy it at a guessable URL, so it is removed from the folder. It was sent to the Windows Recycle Bin rather than deleted, since Thomas had not confirmed keeping an original.

## Shared photo type

`SeasonPhoto` (Bolt 6) and the About photos have the same shape, so the interface moves next to the loader and is renamed:

```ts
// src/app/loaders/responsive-image-loader.ts
export interface ResponsivePhoto {
  src: string;    // path under images/, without width suffix or extension
  srcset: string; // available widths, e.g. '800w, 1200w'
  alt: string;
}
```

`SeasonsService` uses `ResponsivePhoto` instead of `SeasonPhoto`. The loader file owns the file convention, so the type describing a file under that convention belongs with it.

## Data — `FlatInfoService`

A new readonly signal, following the service's private-signal / `asReadonly()` idiom:

```ts
export interface AboutPhotos {
  livingRoom: ResponsivePhoto;
  forestView: ResponsivePhoto;
  mountain: ResponsivePhoto;
}
```

| | `livingRoom` | `forestView` | `mountain` |
|---|---|---|---|
| `src` | `about/living-room` | `about/forest-view` | `about/mountain` |
| `srcset` | `800w, 1200w` | `800w` | `800w` |
| `alt` | Le séjour, avec son canapé-lit et sa commode en pin | La fenêtre du séjour, ouverte sur la forêt | Le Chapeau du Gendarme, sommet calcaire sous un ciel bleu |

Named properties rather than an array: each photo has its own place in the collage, and the template should say which is which.

## Component — `AboutComponent`

- Imports `NgOptimizedImage`; provides `IMAGE_LOADER` with `responsiveImageLoader`, the same component-scoped provider as `SeasonsComponent`.
- `@let` gives the template a short local name for the photo data.
- `aria-hidden` is removed from `.about-visual`. The two emoji boxes are replaced by two photo frames, and the amber block is removed (see Decisions).

```html
@let photos = flatInfo.aboutPhotos();
<div class="about-visual">
  <div class="about-photo about-photo-main">
    <img [ngSrc]="…livingRoom.src" [ngSrcset]="…" sizes="…" [alt]="…" fill />
  </div>
  <div class="about-photo about-photo-side">
    <img [ngSrc]="…forestView.src" [ngSrcset]="…" sizes="…" [alt]="…" fill />
  </div>
</div>
```

## Layout

Today the collage has a fixed 420px height and a percentage width, so every box changes shape with the screen (the main box goes from 0.74:1 to 2.45:1). The new collage has a **fixed proportion** instead:

| Element | Position | Size | Shape |
|---|---|---|---|
| `.about-visual` | right column, centred | `width: 100%`, `max-width: 600px` | `aspect-ratio: 5 / 4` |
| Séjour (`-main`) | top left | 72% wide | `aspect-ratio: 4 / 3` (about 68% of the height) |
| Mountain (`-wide`) | bottom, 6% from the left | 53% wide | `aspect-ratio: 16 / 9`, overlapping the séjour's lower edge; `object-position: 50% 10%` trims the scree of the 4:3 photo and keeps the summit |
| Forest (`-side`) | bottom right | 34% wide | `aspect-ratio: 3 / 4` (about 57% of the height), overlapping the séjour's lower right corner |

The side photo sits above the main one in stacking order, with a 6px border in the section background colour to separate the overlap. The séjour is 72% wide (74% in the first draft), leaving a clear overlap with the forest photo.

**`sizes`**, derived from the layout: the right column is 42.5vw (padding 5vw × 2, gap 5vw), capped by the 600px max-width from a 1412px viewport.

| Photo | `sizes` | Largest need |
|---|---|---|
| Séjour | `(max-width: 768px) 90vw, (max-width: 1411px) 31vw, 432px` | 432px × 2 = 864 → 1200w on 2× screens |
| Mountain | `(max-width: 1411px) 23vw, 318px` | 318px × 2 = 636 → 800w is always enough |
| Forest | `(max-width: 1411px) 15vw, 204px` | 204px × 2 = 408 → 800w is always enough |

Media-query `sizes` are used rather than `min()`, which older browsers do not accept inside `sizes`.

## Phones (≤ 768px)

- `.about-visual` is shown again (it is `display: none` today), below the text since the host grid is already one column.
- The forest and mountain photos are `display: none`. A lazy image that is not rendered is never downloaded, so phones fetch only the séjour.
- The séjour frame becomes `position: relative`, full width, `aspect-ratio: 4 / 3`; the collage's own ratio and max-width are dropped.

## Tests

- **One check for every photo's files.** Bolt 6 put the file-existence test in `seasons.service.spec.ts`. With a second section declaring photos, it moves to a single `src/app/loaders/photo-files.spec.ts` that walks the photos of both `SeasonsService` and `FlatInfoService`. The same file checks that every photo includes the 800w fallback.
- `flat-info.service.spec.ts`: both About photos have alt text that does not start with "photo"/"image".
- New `about.spec.ts` (the component had none): host ARIA; two images with alt text, `loading="lazy"`, the expected `srcset`; nothing in the collage is `aria-hidden`; the collage holds exactly the two photo frames; no emoji left; the Maps link keeps its new-tab warning.

## Decisions and alternatives considered

**Two photos rather than three.** Chosen by Thomas. The residence photo has readable licence plates and harsh backlight; the collage reads better around two strong photos.

**Collage reshaped to the photos, not photos cropped to the collage.** Keeping the old boxes would have cut the portrait forest photo to a strip of 42% of its height.

**Séjour only on phones.** Chosen by Thomas. A scaled-down collage would make both photos too small to read; the séjour is the one photo that shows the flat itself.

**Amber block removed after review.** The first implementation kept it as a colour accent, as validated in the layout sketch. Seen in the browser, Thomas read it as a photo slot left empty: at 38% × 24% of the collage it was too large and too photo-shaped to read as decoration. Removing it was preferred over shrinking it to a thin bar.

**A third, landscape photo added after review.** Removing the amber block left the lower-left of the collage empty. Thomas supplied a photo of the Chapeau du Gendarme to fill it: a 16:9 frame fits that space, and the photo brings the high-mountain setting without repeating another section. The alt text names the peak as Thomas gave it and makes no location claim beyond that (BR-5); maps usually spell it « Chapeau de Gendarme », flagged to Thomas.

**Informative, not decorative.** Chosen by Thomas, consistent with the Seasons photos.
