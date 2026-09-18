# Design — Seasons Photos

**Unit:** Seasons Photos
**Date:** 2026-09-18
**Stories:** [seasons-photos.md](../story-artifacts/seasons-photos.md) · **Spec:** [seasons.md](../functional-specs/seasons.md) · **Previous design:** [seasons-section.md](seasons-section.md)

## Responsibility

Turns each season card's photo placeholder into a real, responsive image. The card layout from Bolt 4 does not change.

## Files provided by Thomas

| File | Size | Ratio |
|---|---|---|
| `public/images/seasons/sauze-winter-1600w.webp` | 1600×960 | 5:3 |
| `public/images/seasons/sauze-winter-800w.webp` | 800×480 | 5:3 |
| `public/images/seasons/barcelonnette-summer-1260w.webp` | 1260×839 | 3:2 |
| `public/images/seasons/barcelonnette-summer-800w.webp` | 800×533 | 3:2 |

WebP, no embedded metadata. The summer source is only 1260px wide, so its large file is named for its real width rather than 1600.

## Naming convention and loader

Every photo lives at `public/images/<name>-<width>w.webp`. Angular copies `public/` to the site root, so the URL is `images/<name>-<width>w.webp`.

`NgOptimizedImage` builds `src` and `srcset` by calling an **image loader**, a plain function from `{ src, width }` to a URL. Without a loader it cannot produce a `srcset`, and `ngSrcset` has no effect. The site has no image CDN, so a small custom loader encodes the convention:

```ts
// src/app/loaders/responsive-image-loader.ts
export const FALLBACK_IMAGE_WIDTH = 800;

export function responsiveImageLoader(config: ImageLoaderConfig): string {
  return `images/${config.src}-${config.width ?? FALLBACK_IMAGE_WIDTH}w.webp`;
}
```

Angular calls the loader **without a width** for the plain `src` attribute (checked in `@angular/common` 21.2). The fallback width therefore makes 800w a required variant of every photo. A service test enforces it.

**Provided on `SeasonsComponent`, not app-wide.** The loader is registered with `providers: [{ provide: IMAGE_LOADER, useValue: responsiveImageLoader }]` on the component. Angular's element injector hands it to every `<img ngSrc>` inside that component and nowhere else. An app-wide provider would silently apply the convention to any future image (a logo, an SVG) that does not follow it. When Équipements gets photos, it adds the same one-line provider.

## Data model

`photoLabel: string` is replaced by a `photo` object:

```ts
export interface SeasonPhoto {
  src: string;    // path under images/, without width suffix or extension
  srcset: string; // available widths, e.g. '800w, 1600w'
  alt: string;
}
```

| | Winter | Summer |
|---|---|---|
| `src` | `seasons/sauze-winter` | `seasons/barcelonnette-summer` |
| `srcset` | `800w, 1600w` | `800w, 1260w` |
| `alt` | Le front de neige du Sauze, au pied des chalets, face aux sommets enneigés | Danseuses en robes colorées dans une rue de Barcelonnette pendant les Fêtes Latino-Mexicaines |

`srcset` is stored as the string `ngSrcset` expects, rather than a `number[]`, so the template needs no join logic.

## Template

```html
<div class="season-photo">
  <img
    [ngSrc]="season.photo.src"
    [ngSrcset]="season.photo.srcset"
    sizes="(max-width: 768px) calc(90vw - 80px), calc(45vw - 80px)"
    [alt]="season.photo.alt"
    fill
  />
</div>
```

- **`fill` mode** instead of `width`/`height`. The frame is 16:9 but neither photo is, so fixed dimensions would either distort the photo or trigger `NgOptimizedImage`'s distortion warning. In fill mode the image is absolutely positioned to cover its parent, and the parent's `aspect-ratio: 16 / 9` reserves the space, so there is no layout shift.
- **`sizes`** tells the browser how wide the photo displays before it downloads anything. Section padding is 5vw per side and card padding 2.5rem (40px) per side. That gives `90vw - 80px` in one column and `45vw - 80px` in two. At 375px the photo is about 258px wide, so even a 2× phone takes the 800w file.
- **No `priority`.** Both photos are far below the fold; the default `loading="lazy"` is correct.

## Styles

- `.season-photo` keeps `aspect-ratio: 16 / 9`, the border and the faint background (visible while the photo loads). It gains `position: relative` (required by fill mode) and `overflow: hidden`. All placeholder text styles go: flex centring, padding, font, letter-spacing, uppercase and colour.
- `.season-photo img { object-fit: cover; }` fills the frame, trimming evenly by default. The winter photo loses about 6% of its height, a strip of snow.
- `.season-card.summer .season-photo img { object-position: center bottom; }` makes the summer photo lose its 16% from the top (rooftops), keeping the dancers' skirts.

## Accessibility

- The photo is informative and carries French alt text. `aria-hidden` is removed with the placeholder.
- Alt text does not repeat "photo de" — screen readers already announce an image.
- No text sits over the photo, so no new contrast pairs are introduced.

## Decisions and alternatives considered

**CSS anchoring rather than re-cropping the summer files.** Chosen by Thomas. It keeps the provided files untouched; the cost is one CSS rule tied to that photo's framing, noted here so a replacement photo gets the rule re-checked.

**Two explicit widths (`ngSrcset`) rather than Angular's automatic breakpoints.** With a loader and `sizes`, `NgOptimizedImage` can generate a `srcset` from its default breakpoints (640, 750, 828, 1080, 1200, 1920…). The loader would then have to invent files for widths that do not exist. `ngSrcset` lists only the files that are actually on disk.

**Informative rather than decorative images.** Chosen by Thomas. The card text names the resort and the festival but does not show them; the photo adds content, so it gets a description.
