# Design — Seasons Section

**Unit:** Seasons Section
**Date:** 2026-09-17
**Stories:** [seasons-section.md](../story-artifacts/seasons-section.md) · **Spec:** [seasons.md](../functional-specs/seasons.md)

## Responsibility

Renders the two season cards. The component is presentational; all published copy comes from a new `SeasonsService`.

## Data model

```ts
export interface SeasonHighlight {
  title: string;
  text: string;
}

export interface SeasonLink {
  label: string;
  url: string;
}

export interface Season {
  id: string;
  marker: string;
  title: string;
  description: string;
  photoLabel: string;
  highlights: SeasonHighlight[];
  tags: string[];
  link: SeasonLink;
}
```

Changes from the previous shape: `highlights`, `photoLabel` and `link` are added; `bgSymbol` is removed (FR-12); `modifier` is removed because it duplicated `id` exactly — the card's variant class is derived from `id` instead.

## Service — `SeasonsService`

| Signal | Type | Description |
|---|---|---|
| `seasons` (readonly) | `Signal<Season[]>` | The two seasons, in display order |

`providedIn: 'root'`, private `_seasons` signal exposed via `asReadonly()` — the same idiom as `FlatInfoService`.

**Content (final, validated in Session 4):**

| | Winter | Summer |
|---|---|---|
| `id` | `winter` | `summer` |
| `marker` | Décembre – Avril | Juin – Septembre |
| `title` | L'hiver | L'été |
| `description` | De décembre à avril, la station vit au rythme de la neige, loin de l'agitation des grandes stations. | L'été, la vallée de l'Ubaye change de visage : sentiers, rivières et grands espaces à portée de main. |
| `photoLabel` | Photo — les pistes du Sauze | Photo — Barcelonnette pendant les Fêtes Latino-Mexicaines |
| `tags` | Ski alpin · Snowboard · Pra-Loup à 15 km | Trail · VTT · Parapente · Canyoning |
| `link` | Domaine du Sauze → sauze.com | Offices de tourisme de l'Ubaye → ubaye.com |

Highlights:

| Season | Title | Text |
|---|---|---|
| Winter | Le domaine Sauze – Super-Sauze | Des pistes pour tous les niveaux, du débutant au skieur confirmé. |
| Winter | Raquettes au départ de la résidence | Les itinéraires commencent à quelques mètres. |
| Winter | Luge | De quoi occuper les après-midis en famille. |
| Summer | Les Fêtes Latino-Mexicaines de Barcelonnette | Dix jours à la mi-août, héritage de l'émigration de la vallée vers le Mexique. |
| Summer | Le lac de Serre-Ponçon | À 45 minutes de voiture, baignade et sports nautiques. |
| Summer | Randonnée dans le Mercantour | Les sentiers du parc national au départ de la vallée. |

The winter first highlight reads "du débutant au skieur confirmé" rather than "dans une ambiance authentique", so it does not repeat the scene-setting sentence directly above it.

## Component model — `SeasonsComponent`

Selector stays `app-seasons`, with `role: 'region'` and `OnPush`. The host id becomes `activities` (was `seasons`) and the heading id `activities-heading`, so the anchor matches the navbar's "Activités" label — the same reasoning as `#equipment` in Bolt 3. State moves out to the service; the component injects it with `inject()`.

Template order per card: marker → title → photo slot → description → highlights → tags → link.

## Accessibility

- Heading order: `h2` (section) → `h3` (season title) → `h4` (highlight titles). No skipped levels.
- The photo slot is decorative and `aria-hidden="true"`; its label is presentational text describing what image belongs there.
- External links carry a visually hidden "(nouvel onglet)" span, matching `about.html`.
- Text contrast on the dark cards is raised from 68% to 85% opacity on the cream tone, taking body copy from roughly 4.9:1 to roughly 6.8:1. Exact values to be confirmed in the browser during verification.

## Decisions and alternatives considered

**Content moves to a `SeasonsService` rather than staying in the component.** The equipment rework established that published copy lives in a service, and Thomas asked for this section to be reworked "the same way". Uniformity matters more here than minimalism: on a site whose recurring defect has been copy drifting out of sync with reality, "all published copy lives in a service" is a rule with no exceptions to remember.

**A separate service rather than extending `FlatInfoService`.** Seasonal activities are facts about the *valley*, not the flat. Folding them into `FlatInfoService` would break its single responsibility and muddy BR-3 in `flat-info.md`.

**`modifier` dropped.** It held the same value as `id` in both entries, so the card variant class is derived from `id` directly.

**`bgSymbol` dropped rather than kept alongside the photo.** Two decorative layers in one card fight each other; the photo is the one that will carry meaning.

## Notes

- Layout stays a two-column grid collapsing to one column at 768px, as today.
- ~~Cards will end at different heights side by side, since the summer card carries more tag and highlight text.~~ Wrong — CSS grid stretches both items to the row height, so they render identically (868px at 1280px wide).
- Copy stays French; identifiers English.
