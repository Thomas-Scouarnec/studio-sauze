# Design — FlatInfoService

**Unit:** Apartment Description Accuracy (revision — original unit: Vitest Unit Testing)
**Date:** 2026-08-27

## Responsibility

Provides read-only flat metadata to any component that needs it. Single source of truth for flat name, location, and capacity info.

## Component Model

### Signals
| Signal | Type | Description |
|---|---|---|
| `info` (readonly) | `Signal<FlatInfo>` | Core flat metadata |
| `fullLocation` | `ComputedSignal<string>` | `station + region` concatenated |
| `guestRange` | `ComputedSignal<string>` | `minGuests–maxGuests` |
| `isAvailableForRental` | `ComputedSignal<boolean>` | `true` when `maxGuests > 0` |

### FlatInfo interface
| Field | Type |
|---|---|
| `name` | `string` |
| `station` | `string` |
| `city` | `string` |
| `region` | `string` |
| `residenceName` | `string` |
| `buildingName` | `string` |
| `mapsUrl` | `string` |
| `surface` | `number` |
| `minGuests` | `number` |
| `maxGuests` | `number` |

## Notes
- `providedIn: 'root'` — singleton, no module needed
- State is read-only externally; internal `_info` signal is private
- No HTTP calls — data is static for now
- `maxGuests` corrected to 5 (bunk bed + drawer sleeps 3, sofa bed sleeps 2)
- `residenceName` (e.g. "Le Roi Soleil") and `buildingName` (e.g. "Crépuscule") are two distinct pieces of information — a residence can have several buildings — and both are added along with `mapsUrl` so the About section can link to the residence on a map without hardcoding it in the template
- `description` field **removed** — it was unused by any template; free-form descriptive copy lives directly in `about.html` instead
