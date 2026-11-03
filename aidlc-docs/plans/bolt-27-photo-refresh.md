# Bolt 27 Plan — Photo Refresh

**Intent:** Replace every photo of the flat with the autumn 2026 ones, add three to the gallery, fill the guest guide's photo slots.
**Date:** 2026-11-03
**Stories:** [photo-refresh.md](../story-artifacts/photo-refresh.md) · **Design:** [design-artifacts/photo-refresh.md](../design-artifacts/photo-refresh.md) · **Spec:** [flat-info.md](../functional-specs/flat-info.md), [stay.md](../functional-specs/stay.md)
**Status:** Implemented on 2026-11-03

---

## Known before the bolt

- **50 files** in `C:\Users\thoma\Downloads\Sauze-20261103T183906Z-1-001\Sauze` (137 MB): 43 HEIC, 7 PNG screenshots
- **The repository is public** (github.com/Thomas-Scouarnec/studio-sauze): a committed file is published, linked or not
- **No HEIC decoder in the project**; `heic-convert` + `sharp` in the scratchpad read all 50 without error
- **Old photos show old furniture** (patterned sofa, now red)
- **The `/stay` photo slots already render** (FR-21): filling `photo` is enough
- **Lighthouse CI** fails a page above 1 MiB (Bolt 25)
- **Work on `main`,** as agreed in Session 15

## Decisions

| # | Decision | Why | Alternative |
|---|---|---|---|
| D1 | Replace every flat photo; keep the two Seasons photos | Thomas: « replace all existing photos »; no winter or summer photo in an autumn batch (his answer) | Autumn landscapes in Seasons: contradicts « L'hiver » / « L'été » |
| D2 | Ski-locker block shows the residence entrance | Thomas's choice; no locker photo in the batch | Text only; keep the old locker photo |
| D3 | All 50 originals in git-ignored `photos/originals/2026-11/` | Public repo: parking keys and screenshots with other people's names must not reach GitHub (Thomas's answer); originals allow re-encoding later | Commit them outside `public/` |
| D4 | Same file names for the six home photos | `src` paths and tests stay; only pictures, widths and alt texts change | New names, more churn |
| D5 | Flat photos at `800w, 1200w`; guide photos at `800w` | Originals exist again (FR-30's limit goes away); guide photos are small | 800w only |
| D6 | Gallery extras declared in `FlatInfoService.galleryPhotos`; `GalleryService` orders explicitly | BR-8 (declared once) holds; the walk-through order mixes sections and extras | Add the extras to a section |
| D7 | Encoding tools in the scratchpad, not `package.json` | Same as Bolt 23 (D6); a one-off per photo session | Devdependencies + a project script |
| D8 | « Jeux en bois » text adds the ping-pong table | The photo shows it | Use only `outside_games_3` |
| D9 | Share image regenerated from `living_room_1` | Thomas's choice | Keep the snowy preview |

## Copy to validate

The alt texts and the « Jeux en bois » sentence in the [design artifact](../design-artifacts/photo-refresh.md), especially:
- `about/mountain`: « Les sommets de l'Ubaye… » — if you know the peak's name, it is better in the alt
- `stay/access-road`: does `acces_residence_indication_take_left_2` show the road *to take*, or the point where you turn?

## Steps

- [x] **Step 1 — Store the originals**
  - `photos/` added to `.gitignore`; the 50 files copied to `photos/originals/2026-11/`
  - `git status` shows only `.gitignore`

- [x] **Step 2 — Encode the photos**
  - 26 WebP files from 17 photos (6 replaced and 3 in `gallery/`, at 800w and 1200w; 8 in `stay/`, at 800w) + the share JPEG
  - Check: no EXIF in any output; no readable plate at 1200px; each file under 250 KB

- [x] **Step 3 — Home photos data**
  - `flat-info.service.ts`: new alts and `srcset: '800w, 1200w'`; `arrival` alt built from `info()`
  - `messages.en.xlf` / `messages.xlf`: updated units
  - Specs: alt texts as validated

- [x] **Step 4 — Gallery**
  - `FlatInfoService.galleryPhotos`; `GalleryService.photos` in the order of the design
  - `gallery.service.spec.ts`: eight photos, in order

- [x] **Step 5 — Guest guide**
  - `stay.service.ts`: `photo` on the existing slots; new slots for parking full, flat, wooden games, rubbish; « Jeux en bois » text
  - `stay.service.spec.ts`: these items have no pending slot

- [x] **Step 6 — File check and share image**
  - `photo-files.spec.ts`: `allPhotos()` includes `galleryPhotos` and the guide photos
  - `page-tags.strategy.ts`: new `og:image:alt`

- [x] **Step 7 — Specs**
  - `flat-info.md`: FR-25 (eight photos), FR-30 (1200w now exists), out-of-scope lines on widths and the exterior photo, change log
  - `stay.md`: out-of-scope « The photo files themselves » narrowed to what is still missing (sofa bed, ski locker…), change log

- [x] **Step 8 — Verify**
  - `npm test`, `npm run test:coverage`, lint and production build pass
  - Browser 1280px and 375px: home collage, Équipements, gallery (8 photos, keyboard navigation), `/stay` slots; no `NgOptimizedImage` warning
  - Lighthouse locally: every page under 1 MiB, scores at their floors
  - `dist/` contains no HEIC, PNG or `private_parking`/`jeu_de_piste` file

---

## NFRs

- Standalone, `OnPush`, signals, `inject()`, native control flow
- `NgOptimizedImage` for all photos (project rule)
- Alt texts in French and English; identifiers and file names in English
- WCAG AA and AXE: every new image has an alt text; no new colour pairs
- BR-7: no GPS metadata, no readable plate, no unit or locker number

---

## Out of scope (deliberate)

- The private parking and the treasure hunt (later, Thomas's choice); their photos only stored locally
- New Seasons photos (no winter or summer photo yet)
- Photos for slots still without one: sofa bed, cooking, washing machine, ski locker
- An in-repo encoding script

---

**Bolt 27 implemented on 2026-11-03.** Plan approved by Thomas as drafted; the copy points left open (mountain name, road photo, ping-pong sentence) kept as proposed.

## Verification results

| Check | Result |
|---|---|
| `npm run test:coverage` | 235 tests pass (27 files); lines 97.9 %, statements 98.0 %, branches 92.7 %, functions 89.8 % |
| Lint, Prettier, production build | Pass |
| Published files | 26 WebP + share JPEG; none carries EXIF, XMP or IPTC; `dist/` holds no HEIC, PNG, parking or treasure-hunt file |
| Originals | 50 files in `photos/originals/2026-11/`, git-ignored |
| Home, 1280px and 375px | Every photo loads; no horizontal overflow; on phones the mountain and window photos are not downloaded (about-photos US-2) |
| Gallery | 8 photos; opened on the kitchen: « Photo 4 sur 8 », arrow key → the raclette table, « Photo 5 sur 8 » |
| `/stay` | 9 photos load, no « Photo à venir » left |
| Console | No `NgOptimizedImage` warning, no error |
| Playwright (incl. AXE) | 107 pass; 1 failure in `localization.spec.ts` (the flag switch back to French), which fails the same way on the previous commit (3 runs out of 8): not caused by this Bolt |
| Lighthouse (3 runs, median) | Accessibility and best practices 100 everywhere; performance 84 to 94; assertions pass. Page weight: `/` 493 KB, `/stay` 555 KB, `/en/` 586 KB, `/en/stay` 618 KB, `/404` 222 KB |

## Noted during implementation

**Cropped at encoding, not in CSS.** Each photo is cut to its frame's ratio (4:3, 3:4, 16:9) when encoded, so the two `object-position` rules written for the old mountain and kitchen photos are removed.

**Guide photos at WebP quality 62.** At 80, the eight outdoor photos totalled about 1 MB, close to the 1 MiB page limit; at 62 they total about 720 KB and still look sharp at 320px.

**The Browser pane could not draw** (Claude's window hidden), so pages were checked with a headless Playwright script from the scratchpad instead. A `studio-sauze-dist` entry was added to `.claude/launch.json`: the preview's `PORT=4200` breaks `start:all`, which starts two servers.
