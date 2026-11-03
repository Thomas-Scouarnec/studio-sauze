# Design — Photo Refresh

**Unit:** Photo Refresh
**Date:** 2026-11-03
**Stories:** [photo-refresh.md](../story-artifacts/photo-refresh.md) · **Spec:** [flat-info.md](../functional-specs/flat-info.md), [stay.md](../functional-specs/stay.md) · **Builds on:** [about-photos.md](about-photos.md), [equipment-photos.md](equipment-photos.md), [photo-gallery.md](photo-gallery.md), [stay-content.md](stay-content.md)

## Responsibility

Replaces every photo of the flat with the ones Thomas took in autumn 2026, adds a few to the gallery, and fills the photo slots of the guest guide. The Seasons photos stay (no winter or summer photo in this batch).

## Source files

50 files from Thomas's Google Drive folder « Sauze » (downloaded 2026-11-03): 43 iPhone HEIC photos (3024×4032 to 5712×4284) and 7 PNG screenshots. All 50 are copied, unchanged, to `photos/originals/2026-11/`, **git-ignored**. The repository is public, so anything committed is published even if no page links to it.

| Group | Files | Fate |
|---|---|---|
| Published | 17 photos, mapped below | Re-encoded to WebP in `public/images/` |
| Private parking | `private_parking_*` (8), incl. `private_parking_keys` | Not published, not committed: the parking is not part of the rental yet, and the keys photo shows where a key is kept |
| Treasure hunt | `jeu_de_piste_*` (7 screenshots) | Not published, not committed: a later initiative; they show other people's names and live locations |
| Not used (near-duplicates or weaker shots) | `kitchen_1`, `coin_montagne_open_1`, `dining_table_1`, `landscape_church_2`, `living_room_4`, `raclette2`, `tennis_court_2`/`_3`, `petanque_field_1`, `additional_parking_slots_2`–`_4`, `landscape_church`, `acces_residence_indication_take_left`, `acces_residence_indication_street_name`, `parking_slots_2`, `outside_games_1`/`_2` | Kept in `photos/originals/` only |

## Encoding

- HEIC decoded with `heic-convert` (libheif in WebAssembly; `sharp`'s prebuilt build cannot read iPhone HEIC), then `sharp`: EXIF orientation applied, cropped to the frame's ratio, resized, WebP quality 80
- `sharp` writes no metadata unless asked, so no EXIF GPS reaches `public/` (BR-7); checked on every output file
- Both packages installed in Claude's scratchpad, never in `package.json`, as the share image in Bolt 23 (D6)
- **Widths:** the originals now exist, so flat photos ship at `800w, 1200w`; guest-guide photos at `800w` only, as they are shown at most 400px wide

## Home page — same file names, new pictures

Each file keeps its name, so `src` and `srcset` paths stay; only the pictures, the widths and the alt texts change.

| `src` | Source | Crop | `srcset` | Alt (FR) | Alt (EN) |
|---|---|---|---|---|---|
| `about/living-room` | `living_room_1` | 4:3 | 800w, 1200w | Le séjour : le canapé-lit rouge, la table et la grande fenêtre | The living room: the red sofa bed, the table and the large window |
| `about/forest-view` | `living_room_2` | 3:4, on the window | 800w, 1200w | La fenêtre du séjour, ouverte sur la forêt *(unchanged)* | *(unchanged)* |
| `about/mountain` | `landscape_2` | 16:9 | 800w, 1200w | Les sommets de l'Ubaye au-dessus du Sauze, aux couleurs de l'automne | The Ubaye peaks above Le Sauze, in autumn colours |
| `equipment/arrival` | `residence_entrance` | 4:3 | 800w, 1200w | L'entrée du bâtiment Crépuscule, résidence Le Roi Soleil | The entrance of the Crépuscule building, Le Roi Soleil residence |
| `equipment/sleeping` | `coin_montagne_open_drawer_open` | 4:3 | 800w, 1200w | Le coin montagne : les lits superposés et le lit gigogne tiré | The mountain corner: the bunk beds and the pulled-out trundle bed |
| `equipment/kitchen` | `kitchen_2` | 4:3 | 800w, 1200w | Le coin cuisine : réfrigérateur, plan de travail et meubles en pin | The kitchen corner: fridge, worktop and pine furniture |

The `arrival` alt reads the residence and building names from `FlatInfoService.info()` rather than restating them (BR-5).

## Gallery — three more photos of the flat

Declared once, in a new readonly signal `FlatInfoService.galleryPhotos` (flat photos shown only in the gallery). `GalleryService` still declares nothing (BR-8); it gives up the generic `flatMap` over the Équipements blocks for an explicit walk-through order:

1. `equipment/arrival` — the entrance
2. `equipment/sleeping` — the mountain corner, open
3. `gallery/mountain-corner-closed` — the same, curtain drawn
4. `equipment/kitchen`
5. `gallery/dining-table` — set for a raclette
6. `about/living-room`
7. `gallery/living-room-window-side`
8. `about/forest-view`

| `src` | Source | Crop | Alt (FR) | Alt (EN) |
|---|---|---|---|---|
| `gallery/mountain-corner-closed` | `coin_montagne_closed_1` | 3:4 | Le coin montagne, rideau tiré pour l'intimité | The mountain corner, its curtain drawn for privacy |
| `gallery/dining-table` | `raclette` | 3:4 | La table du séjour dressée pour une raclette | The living-room table set for a raclette |
| `gallery/living-room-window-side` | `living_room_3` | 4:3 | Le séjour côté fenêtre : fauteuil en rotin, étagère et commode en pin | The living room by the window: wicker armchair, shelves and pine chest of drawers |

All three at `800w, 1200w`. Landscapes stay out of the gallery (FR-26).

## Guest guide (`/stay`) — slots filled

| Item | `src` | Source | Description / alt (FR) | EN |
|---|---|---|---|---|
| Accéder au parking — road | `stay/access-road` | `acces_residence_indication_take_left_2` | La route à gauche à prendre pour monter à la résidence *(existing)* | *(existing)* |
| Accéder au parking — car park | `stay/car-park` | `parking_slots` | Le parking du bâtiment Crépuscule *(existing)* | *(existing)* |
| Si le parking est complet *(new slot)* | `stay/overflow-parking` | `additional_parking_slots` | Un des autres parkings, le long de la montée | One of the other car parks, on the way up |
| Jusqu'à l'appartement *(new slot)* | `equipment/arrival` | *reused* | its alt, read from `FlatInfoService` | — |
| Tennis | `stay/tennis` | `tennis_court_1` | Les deux courts de tennis *(existing)* | *(existing)* |
| Pétanque | `stay/petanque` | `petanque_field_2` | Le terrain de pétanque de la résidence *(existing)* | *(existing)* |
| Jeux en bois *(new slots)* | `stay/outdoor-games` | `outside_games_3` | L'aire de jeux en bois, avec son toboggan | The wooden play area and its slide |
| | `stay/table-tennis` | `outside_games_4` | La table de ping-pong, à côté de l'aire de jeux | The table-tennis table, next to the play area |
| Les poubelles *(new slot)* | `stay/rubbish` | `outside_rubbish` | Les conteneurs à ordures ménagères et de tri sélectif | The household waste and recycling containers |

Since a ping-pong table now shows, the « Jeux en bois » text gains it: « Des jeux en bois pour les enfants et une table de ping-pong, à 300 m de la résidence. » / "Wooden games for children and a table-tennis table, 300 m from the residence."

## Share image

`share/preview-1200x630.jpg` regenerated from `living_room_1` (1200×630 crop, JPEG). `og:image:alt` becomes « Le séjour de notre appartement au Sauze : canapé-lit rouge, table et grande fenêtre » / "The living room of our flat in Le Sauze: red sofa bed, table and large window" (the test requires « Sauze »).

## Privacy check (BR-7)

- No readable licence plate in `parking_slots` or `acces_residence_indication_take_left_2` at 1200px (cars too far or seen side-on); rechecked on the final files
- `residence_entrance` shows the residence sign, already named on the site; no unit or locker number
- No people in any published photo (the photographer's shadow in `outside_games_2` is not used)

## Tests

- `photo-files.spec.ts`: `allPhotos()` also returns `galleryPhotos` and the guest-guide photos, so every new file is checked on disk in every width
- `gallery.service.spec.ts`: the eight photos in the order above
- `stay.service.spec.ts`: no « Photo à venir » slot left in the items listed above
- `page-tags.strategy.spec.ts`: unchanged (the alt still contains « Sauze »)
