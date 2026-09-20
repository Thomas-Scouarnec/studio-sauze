# Bolt 9 Plan — Photo Gallery

**Intent:** Turn the three Équipements photos into entry points to one full-screen gallery of every flat photo, opening at the clicked photo.
**Date:** 2026-09-20
**Status:** Implemented on 2026-09-20
**Stories:** [photo-gallery.md](../story-artifacts/photo-gallery.md) · **Design:** [design-artifacts/photo-gallery.md](../design-artifacts/photo-gallery.md) · **Spec:** [flat-info.md](../functional-specs/flat-info.md)

---

## Known before the bolt

- **The gallery ships with 5 photos:** `equipment/arrival`, `equipment/sleeping`, `equipment/kitchen`, `about/living-room`, `about/forest-view`. That is thin for a gallery; adding more later is a data-only change with no code
- **800w is the ceiling.** All five exist only at 800w and the JPEG originals went to the Recycle Bin in Bolt 8 (BR-7). The stage is capped at 800px CSS width rather than filling the viewport — pixel-accurate on a phone, a centred panel on a desktop
- **No new photo file is added or removed by this bolt**, so BR-7 is not re-engaged

## Steps

- [x] **Step 1 — Update the functional spec**
  - `flat-info.md`: FR-25 to FR-30, BR-8, consuming components, out-of-scope and revision history
  - Done at plan time, with this document

- [x] **Step 2 — Add `GalleryService`**
  - `src/app/services/gallery.service.ts`: `photos` as a `computed()` over `FlatInfoService` (equipment block photos, then `livingRoom` and `forestView`); `openIndex` signal; `isOpen`, `currentPhoto`, `count`; `openAt`, `close`, `next`, `previous` with wrap-around via `update()`
  - `gallery.service.spec.ts`: the five photos in order; `mountain` and the Seasons photos absent; `openAt` with a known and an unknown `src`; wrap-around both ways; `close` resets

- [x] **Step 3 — Add `PhotoGalleryComponent`**
  - `photo-gallery.ts`: `OnPush`, `NgOptimizedImage`, scoped `IMAGE_LOADER`; `viewChild` on the dialog; `effect()` mirroring `isOpen()` onto `showModal()` / `close()`; `effect()` preloading the neighbours with `new Image()`; swipe handlers
  - `photo-gallery.html`: `<dialog>` with French accessible name; stage with the `fill` image; previous / next / close buttons; « Photo N sur M » counter in an `aria-live="polite"` region; `(close)` and arrow-key bindings; backdrop click
  - `photo-gallery.css`: stage `min(90vw, 800px)`, `object-fit: contain`, opaque control chips at 44px minimum, visible focus ring, `::backdrop`, `html:has(dialog[open]) { overflow: hidden; }`, `prefers-reduced-motion` block

- [x] **Step 4 — Mount the gallery once**
  - `app.ts`: import and render `<app-photo-gallery />` after the sections in the inline template

- [x] **Step 5 — Make the Équipements thumbnails open it**
  - `equipment.ts`: inject `GalleryService` as `protected`
  - `equipment.html`: the `.equipment-photo` frame becomes `<button type="button">`; `<img>` keeps its alt; visible `aria-hidden` count badge plus a `visually-hidden` « — ouvrir la galerie (N photos) »
  - `equipment.css`: button reset (`padding: 0; border: 0; background: none`), existing frame rules and `object-position` crops preserved; hover and `:focus-visible` scrim; badge styling

- [x] **Step 6 — Component tests**
  - `photo-gallery.spec.ts`: dialog accessible name; counter text and `aria-live`; the three French control labels; arrow keys move; `(close)` resets the service
  - `equipment.spec.ts`: each photo sits inside a button whose accessible name contains the alt text and « ouvrir la galerie »; the photo-less block still renders no frame

- [x] **Step 7 — Verify**
  - `npm test` and a production build pass
  - Browser at 1280px: clicking each of the three photos opens the gallery at that photo; previous / next wrap; counter tracks; Esc, close button and backdrop all close; focus returns to the thumbnail used
  - Browser at 375px: gallery full width, controls reachable and at least 44px, swipe moves between photos, page behind does not scroll
  - Keyboard only: Tab reaches each thumbnail with a visible ring, Enter opens, arrows move, Esc closes
  - Network: no `images/` request for the gallery before it is opened; opening from a thumbnail serves the photo from cache
  - AXE: no violation on the page with the gallery open and closed
  - Console: no `NgOptimizedImage` warning

---

## NFRs

- Standalone, `OnPush`, signals, `computed()`, `inject()`, native control flow
- `NgOptimizedImage` for the gallery photo (project rule)
- Visible copy French; ids, class names and TypeScript symbols English
- WCAG AA: focus visible and returned, contrast on opaque chips, targets at least 44px, live region for the counter, no autoplay (2.2.2), `prefers-reduced-motion` honoured
- No photo data duplicated — the gallery list is derived, not declared (BR-3)

---

## Out of scope (deliberate)

- A « Voir toutes les photos » button — offered and declined; addable later without touching the gallery
- The About photos as entry points — they appear *in* the gallery but do not open it
- Visible captions — offered and declined
- Deep-linking the open photo into the URL; thumbnail strip; zoom / pan
- Sourcing new photos, and any width above 800w
- `--stone` / `.section-label` contrast (still owed to the accessibility bolt)

---

## Risks

| Risk | Handling |
|---|---|
| Lazy images do not load in a hidden Browser pane (seen in Bolt 8) | Verify on Thomas's own dev server, or by fetching the exact URLs the page requests |
| `<dialog>` focus behaviour differs subtly across browsers | Assert focus return in the browser pass, not only in jsdom, where `showModal` is polyfill-thin |
| `html:has(dialog[open])` scroll lock is a newer selector | Cosmetic if unsupported — the page scrolls behind an inert overlay; no functional loss |
| Five photos may not feel worth a gallery | Flagged to Thomas before implementation; the mechanism is the durable part, the photos are data |

---

**Bolt 9 implemented on 2026-09-20.**

## Verification results

| Check | Result |
|---|---|
| `npm test` | 106 tests pass (12 files), no build warning |
| Production build | Succeeds; bundle grows 0.34 kB raw (256.21 → 256.55 kB). No new image file ships |
| Desktop 1280px | Each thumbnail opens the gallery at its own photo (`sleeping` → « Photo 2 sur 5 », `kitchen` → « Photo 3 sur 5 »); previous/next wrap both ways; counter tracks throughout |
| Photo swap | All five render at an 800×720 stage: `arrival` 796×1061, `sleeping` 800×600, `kitchen` 800×1067, `living-room` 1200×900, `forest-view` 800×1067 |
| Mobile 375px | Stage 338×650, controls exactly 44×44, no horizontal overflow, `touch-action: pan-y` |
| Swipe | 240px drag left → next, 250px right → previous, 20px drag → no move (below the 50px threshold) |
| Keyboard | Tab reaches each thumbnail with the `--rust` ring at 3px/3px offset and `:focus-visible` matching; arrows move; Esc closes; focus returns to the exact thumbnail that opened the gallery |
| Scroll lock | `html` computes `overflow: hidden` while open, `visible` after closing |
| Network | A clean load requests exactly the 8 section photos; the closed dialog adds none |
| AXE 4.10.2 | **0 violations with the gallery open.** The 9 on the closed page are all pre-existing `color-contrast` on `.section-label`, `.stat-label` and `.footer-copy` — the accessibility bolt's backlog, untouched here |
| Console | A clean load with the gallery unopened logs no `NgOptimizedImage` message |

## Found and fixed during verification

**NG02953 — the gallery would have frozen on its first photo.** `NgOptimizedImage` reads `ngSrc`/`ngSrcset` once and ignores later updates, so reusing one `<img>` and swapping its bindings changed the state but never the picture. The stage now renders through `@for (photo of stagePhotos(); track photo.src)` over a zero-or-one list, which destroys and recreates the element on every change. Caught by the unit tests before it reached the browser; a regression test asserts the rendered `srcset` actually changes.

**Escape and the arrow keys did nothing, because focus never entered the dialog.** `showModal()` runs its "focus the first candidate" step in the same change-detection pass that renders the dialog's content, so there was nothing focusable yet and focus stayed on `<body>` — outside the element carrying the key bindings, which keydown therefore never reached. The dialog now takes `tabindex="-1"` and focus explicitly after `showModal()`. Esc is also bound in the template rather than left to the platform's implicit close request, which did not fire in this environment; closing on Esc is a WCAG requirement, so it should not rest on a path that cannot be verified.

**Swipe was swallowed by the browser's native image drag.** `pointerdown` fired but `pointerup` never arrived: an `<img>` is draggable by default, so a horizontal drag started a drag-and-drop instead of a gesture. Fixed with `draggable="false"`, `user-select: none` on the stage, and `setPointerCapture()` so a swipe ending off the photo still reports its release. `pointercancel` clears the gesture. Four swipe tests now cover it.

**Focus ring colour.** The site's usual `--amber` ring reaches only 2.9:1 against the `--snow` section background, under the 3:1 a focus indicator needs. The thumbnails use `--rust` (5.6:1). The gallery controls keep `--amber`, which clears 3:1 against the dark surface. The existing amber rings elsewhere on the site have the same shortfall and belong to the accessibility bolt.

## Noted during verification

**Two jsdom gaps are shimmed in a new `src/test-setup.ts`** (registered via `setupFiles` in `angular.json`, and added to `tsconfig.spec.json` so it is type-checked): jsdom 28 implements neither `dialog.showModal()`/`close()` nor pointer capture. The shim deliberately does not fake the focus trap, the inert background or focus return — those were verified in the browser instead.

**NG02955 (LCP) appears only when the gallery is opened before the page's LCP settles**, which took a scripted click during testing. A clean load leaves the console silent, and a real visitor clicks long after LCP is final. `priority` was not added: it is the wrong signal for an image that must cost nothing until it is asked for.

**NG02952 ("fill-mode image height is zero") at 375px is pre-existing**, from About hiding two of its three photos on phones (FR-21). Untouched by this bolt.

**High-DPI displays still interpolate.** The 800px cap prevents gross upscaling, but a 2× screen wants 1600 device pixels for that stage and only 800w exists. That is a photo-sourcing limit, not a code one, and it is the strongest practical argument for the photo session.

## Change requested after implementation — the thumbnail badge

Thomas found « 5 photos » repeated on all three thumbnails confusing. The diagnosis: the badge was doing two jobs at once. Signalling *this photo opens something* belongs on every thumbnail; stating *how many photos exist* is a property of the gallery, not of any one photo. Printing the total on a photo sitting beside a block of text about sleeping reads as « this block has 5 photos », which is wrong — there are five in the whole flat. Repetitive and inaccurate, not merely repetitive.

**Resolution:** the badge keeps its place and size (32×32, `--bark` on the bottom right corner) but carries an inline expand icon instead of the count. The count now appears only where it is true — the « Photo N sur M » counter inside the gallery — and in each button's screen-reader text, where an accessible name has to be self-contained.

Options offered and not taken: a text badge « Voir les photos » (explicit, but heavier in an already text-dense section); badging only the first photo (the other two would look inert); rewording to « Voir les 5 photos » (fixes the ambiguity, keeps the number printed three times).

Noted for later: dropping the visible count loses the pre-click « there is more here » lure. With five photos that lure is weak. Once there are fifteen or twenty, its right home is a single « Voir les N photos » button under the blocks — the one declined at planning time, worth revisiting then rather than returning the number to the badges.

FR-28 rewritten; `equipment.spec.ts` now asserts an `svg` in each badge and no text. 106 tests pass, AXE still reports 0 violations with the gallery open, and the button names are unchanged (« Le coin cuisine … — ouvrir la galerie (5 photos) »).

## Correction recorded

During this session the plan and the Session 9 notes both stated that adding photos later would be "a data-only change with no code". That is true for replacing a photo and false for adding one: `GalleryService.photos` derives from one photo per Équipements block plus two named About photos, so the gallery has exactly five slots and no sixth. A photo that no section displays cannot reach the gallery at all. Lifting that limit — a declared list of gallery-only photos concatenated with the derived ones, keeping BR-8 — is the natural next bolt, and is best done before the photo session rather than after.
