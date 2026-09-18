# Bolt 6 Plan — Seasons Photos

**Intent:** Replace the two season card placeholders with real, responsive photos.
**Date:** 2026-09-18
**Stories:** [seasons-photos.md](../story-artifacts/seasons-photos.md) · **Design:** [design-artifacts/seasons-photos.md](../design-artifacts/seasons-photos.md) · **Spec:** [seasons.md](../functional-specs/seasons.md)

---

## Steps

- [x] **Step 1 — Create the image loader**
  - New `src/app/loaders/responsive-image-loader.ts`: `responsiveImageLoader` and `FALLBACK_IMAGE_WIDTH`
  - New `responsive-image-loader.spec.ts`: builds `images/<src>-<width>w.webp`; falls back to 800w when no width is given

- [x] **Step 2 — Replace `photoLabel` with `photo` in `SeasonsService`**
  - Add `SeasonPhoto` (`src`, `srcset`, `alt`); winter and summer data as in the design
  - `@types/node` added as a dev dependency, and `node` added to the `tsconfig.spec.json` types, so the spec can read the disk
  - `seasons.service.spec.ts`: every photo has non-empty alt text; every `srcset` includes the fallback width; every declared width has a matching file in `public/images/`; no `photoLabel` remains

- [x] **Step 3 — Render the photos in `SeasonsComponent`**
  - `seasons.ts`: import `NgOptimizedImage`; provide `IMAGE_LOADER` on the component
  - `seasons.html`: `<img>` in fill mode with `ngSrc`, `ngSrcset`, `sizes` and `alt`; drop `aria-hidden` and the label text

- [x] **Step 4 — Update `seasons.css`**
  - Photo frame: keep ratio, border and background; add `position: relative` and `overflow: hidden`; remove placeholder text styles
  - `object-fit: cover` for both photos; `object-position: center bottom` for summer

- [x] **Step 5 — Component tests**
  - `seasons.spec.ts`: replace the placeholder test. Each card renders one `img` with French alt text, a `srcset` listing its two files, a `sizes` attribute and `loading="lazy"`; no element is `aria-hidden`

- [x] **Step 6 — Clean up and verify**
  - Delete `public/images/seasons/.gitkeep`
  - `npm test` and production build pass
  - Browser at 1280px and 375px: both photos visible, frame stays 16:9, dancers not cut off, no horizontal overflow
  - Network: at 375px only the 800w files download; no 404s
  - Console: no `NgOptimizedImage` warnings

---

## NFRs

- Standalone, `OnPush`, signals, `inject()`, native control flow
- `NgOptimizedImage` for all photos (project rule)
- Alt text in French; identifiers in English
- WCAG AA: informative images have alt text; no new contrast pairs

---

## Out of scope (deliberate)

- Équipements photos, carousel, lightbox
- Photo credits and licensing
- AVIF, blurred placeholders
- `.section-label` and `--stone` contrast defects (accessibility bolt)

---

**Bolt 6 implemented on 2026-09-18.**

## Verification results

| Check | Result |
|---|---|
| `npm test` | 59 tests pass (8 files) |
| File guard (BR-5) | Hiding `barcelonnette-summer-1260w.webp` fails the test, naming the missing file |
| Production build | Succeeds, within budgets; the four photos are copied to `dist/studio-sauze/browser/images/seasons/` |
| Desktop 1280px (1.25× density) | 486×273 frames, 16:9; the browser picks both 800w files |
| Desktop 1920px (1.25× density) | 774px frames; the browser picks `sauze-winter-1600w` and `barcelonnette-summer-1260w` |
| Mobile 375px (2× density) | 258×145 frames; only the two 800w files are downloaded; no horizontal overflow |
| Framing | Summer photo anchored at `50% 100%`: rooftops trimmed, dancers intact |
| Accessibility | Both images carry their French alt text; no `aria-hidden` element left in the section |
| Network / console | All photo requests return 200; no `NgOptimizedImage` warning on a normal load |

## Noted during verification

**Angular prepends `sizes="auto"`.** For lazy images, `NgOptimizedImage` renders `sizes="auto, <our value>"`. Browsers that support `auto` use the image's real layout width; others fall back to our `calc()` expressions. Nothing to change.

**The LCP warning (NG02955) is a test artifact.** It appears only when a script scrolls the photos into view right after load, before any user input. On a normal load from the top, the LCP element is the hero heading and no warning is raised. `priority` stays off, as designed.
