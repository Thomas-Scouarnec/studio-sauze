# Design — FlatInfoService

**Unit:** Vitest Unit Testing (reference service)
**Date:** 2026-06-13

## Responsibility

Provides read-only flat metadata to any component that needs it. Single source of truth for flat name, location, and rental info.

## Component Model

### Signals
| Signal | Type | Description |
|---|---|---|
| `info` (readonly) | `Signal<FlatInfo>` | Core flat metadata |
| `fullLocation` | `ComputedSignal<string>` | `location + region` concatenated |
| `isAvailableForRental` | `ComputedSignal<boolean>` | `true` when `maxGuests > 0` |

### FlatInfo interface
| Field | Type |
|---|---|
| `name` | `string` |
| `location` | `string` |
| `region` | `string` |
| `maxGuests` | `number` |
| `description` | `string` |

## Notes
- `providedIn: 'root'` — singleton, no module needed
- State is read-only externally; internal `_info` signal is private
- No HTTP calls — data is static for now
