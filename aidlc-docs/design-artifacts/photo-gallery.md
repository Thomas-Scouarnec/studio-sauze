# Design — Photo Gallery

**Unit:** Photo Gallery
**Date:** 2026-09-20
**Stories:** [photo-gallery.md](../story-artifacts/photo-gallery.md) · **Spec:** [flat-info.md](../functional-specs/flat-info.md) (FR-25 to FR-30, BR-3, BR-8)

## Responsibility

A single full-screen gallery of the flat's photos, opened from the Équipements thumbnails at the clicked photo. The gallery owns *presentation and navigation only* — it declares no photo of its own, deriving its list from the photos already published by `FlatInfoService`. That keeps BR-3: a photo's `src` and alt text exist in exactly one place.

## Why derive rather than declare

The obvious alternative — a hand-written list of gallery photos — would restate every `src` and `alt` already held in `equipmentBlocks` and `aboutPhotos`, and the two copies would drift the first time a photo is swapped. `GalleryService.photos` is therefore a `computed()` over `FlatInfoService`. Adding a photo to Équipements adds it to the gallery automatically; nothing has to be kept in sync by hand.

The cost is that inclusion is decided by *where a photo is used*, not by a flag on the photo. Landscape shots are excluded by picking the About photos explicitly (`livingRoom`, `forestView` — never `mountain`) and by not reading `SeasonsService` at all. This is written out in the service, so the rule is visible at the point it is applied.

## Data model

No new interface. `ResponsivePhoto.src` (`equipment/kitchen`, `about/living-room`) is already unique across the site and serves as the photo's identity, so `openAt()` takes a `src`. Adding an `id` field would be a second identifier for the same thing.

## New service — `GalleryService`

`src/app/services/gallery.service.ts`, `providedIn: 'root'`.

| Member | Type | Description |
|---|---|---|
| `photos` | `Signal<ResponsivePhoto[]>` | Flat photos in walk-through order — `computed()` |
| `openIndex` | `Signal<number or null>` | Index of the shown photo; `null` when closed |
| `isOpen` | `Signal<boolean>` | `openIndex() !== null` |
| `currentPhoto` | `Signal<ResponsivePhoto or null>` | The photo at `openIndex` |
| `count` | `Signal<number>` | `photos().length` — used by the thumbnail badge |
| `openAt(src)` | `void` | Opens at that photo; a `src` not in the list is ignored |
| `close()` | `void` | Sets `openIndex` to `null` |
| `next()` / `previous()` | `void` | Wrap around at both ends, via `update()` |

Order: `arrival`, `sleeping`, `kitchen` (from `equipmentBlocks`, in their display order), then `living-room`, `forest-view`. It reads as a walk through the flat — arrive, sleep, cook, live, look out — and it follows the page order, so the gallery never feels shuffled relative to what the visitor just scrolled past.

Blocks without a photo are skipped, so FR-22 keeps working: a future photo-less block contributes nothing rather than a hole.

## New component — `PhotoGalleryComponent`

`src/app/components/photo-gallery/`, external template and styles (it is past the size where an inline template stays readable).

| Aspect | Value |
|---|---|
| Selector | `app-photo-gallery` |
| Change detection | `OnPush` |
| Imports | `NgOptimizedImage` |
| Providers | `IMAGE_LOADER` → `responsiveImageLoader`, scoped as in `EquipmentComponent` |
| State | None of its own — reads `GalleryService` |

**Mounted once**, in `AppComponent`'s inline template, after the sections. Not once per section: three dialogs would mean three copies of the state and three focus traps.

### Native `<dialog>`, deliberately

Opened with `showModal()`. This is the single biggest accessibility decision in the bolt: the platform then supplies the focus trap, `inert` on the page behind, Esc-to-close, `::backdrop`, and focus returning to the element that opened it. A hand-rolled `role="dialog"` would have to reimplement all five, and that is where this kind of component usually fails AXE.

Two wiring details follow from using the real element:

- An `effect()` mirrors `gallery.isOpen()` onto the element: `showModal()` when it becomes true, `close()` when false. The element is reached with `viewChild`
- The dialog's native `(close)` event calls `gallery.close()`. Without it, Esc would shut the element while `openIndex` still held a number, and the signal and the DOM would disagree

### Scroll lock without JavaScript

```css
html:has(dialog[open]) { overflow: hidden; }
```

`showModal()` makes the page inert but does not stop it scrolling. Doing this in CSS avoids a component reaching into `document.body`, and disappears by itself if the dialog is ever removed.

### Layout

| Element | Treatment |
|---|---|
| Stage | `min(90vw, 800px)` wide, `min(80vh, 100%)` tall, `position: relative` for `fill` |
| Photo | `NgOptimizedImage` with `fill` and `object-fit: contain`, `sizes="(max-width: 880px) 90vw, 800px"` |
| Controls | Previous / next / close, each at least 44×44px, on an opaque chip — never directly on the photo, so contrast does not depend on the image |
| Counter | « Photo 3 sur 5 », below the stage, `aria-live="polite"` |

`object-fit: contain` is what lets one stage hold both the 4:3 and the 3:4 photos without distortion or cropping. The letterboxing it produces is the intended look, not a compromise to hide.

No `priority` on the gallery image: it is never the LCP element. `loading="lazy"` inside a closed dialog means the photos cost nothing on page load — a `display: none` subtree never triggers the visibility check.

### Preloading the neighbours

An `effect()` constructs `new Image()` for the next and previous `src` whenever `openIndex` changes, so a click on « suivant » shows a decoded image rather than a blank stage. Rendering the neighbours in the DOM instead would work too, but would need them hidden in a way that does not defeat lazy loading — more moving parts for the same result.

The three Équipements photos are requested at 800w by the thumbnails already (their `srcset` offers only that width), so opening the gallery from a thumbnail draws on the HTTP cache.

### Keyboard and pointer

| Input | Effect |
|---|---|
| `ArrowLeft` / `ArrowRight` | previous / next, bound on the dialog in the template |
| `Escape` | closes — native, no binding |
| Click on `::backdrop` | closes; detected by comparing `event.target` with the dialog element |
| Horizontal swipe over 50px | previous / next, via `pointerdown` / `pointerup` on the stage |

## Changes to `EquipmentComponent`

The frame becomes a button. The element that carried `.equipment-photo` is now a `<button type="button">` with the same class, reset to `padding: 0; border: 0; background: none;` and keeping `position: relative`, so the existing 280×210 frame and the `object-position` crops are untouched.

```html
<button type="button" class="equipment-photo" (click)="gallery.openAt(photo.src)">
  <img [ngSrc]="photo.src" [ngSrcset]="photo.srcset" [alt]="photo.alt" sizes="..." fill />
  <span class="equipment-photo-badge" aria-hidden="true">{{ gallery.count() }} photos</span>
  <span class="visually-hidden"> — ouvrir la galerie ({{ gallery.count() }} photos)</span>
</button>
```

**Why the alt text stays on the `<img>`.** The button's accessible name is built from its contents, so it reads « Le coin cuisine : micro-ondes et meubles en pin, à côté de la télévision — ouvrir la galerie (5 photos) »: the photo is still described (FR-24) *and* the action is stated. Moving the description onto an `aria-label` would name the action but lose the description; setting `alt=""` would lose it outright.

The visible badge is `aria-hidden` because the hidden span already carries the count — otherwise the number is announced twice.

**Why the badge is always visible, not on hover.** A hover-only affordance does not exist on a phone, which is where most visitors are.

## Testing

| File | Covers |
|---|---|
| `gallery.service.spec.ts` (new) | The five photos, in order; `mountain` and the Seasons photos absent; `openAt` on a known and an unknown `src`; `next`/`previous` wrapping at both ends; `close` resetting |
| `photo-gallery.spec.ts` (new) | Dialog accessible name; counter text and `aria-live`; French labels on the three controls; arrow keys; `(close)` resetting the service |
| `equipment.spec.ts` (extended) | Each photo is inside a button whose accessible name contains both the alt text and « ouvrir la galerie » |
| `photo-files.spec.ts` | Unchanged — the gallery derives from sources it already checks |

## NFRs

- Standalone, `OnPush`, signals, `computed()`, `inject()`, native control flow
- `NgOptimizedImage` for the gallery photo
- Visible copy French; identifiers, class names and ids English
- WCAG AA: focus visible, focus returned, contrast on opaque chips, targets at least 44px, live region, no autoplay, `prefers-reduced-motion` honoured
