# Design — Stay Content

**Unit:** Stay Content
**Date:** 2026-09-22
**Stories:** [stay-content.md](../story-artifacts/stay-content.md) · **Spec:** [stay.md](../functional-specs/stay.md) (FR-13 to FR-20, BR-1, BR-4, BR-5) · **Notes:** [ideas/stay-content.md](../ideas/stay-content.md)

## Responsibility

Replace the Bolt 10 placeholder sentence with the page's real structure: nine sections of guest information, a section menu, and visible placeholders where Thomas has not supplied a fact yet. The content lives as data, so filling a placeholder later touches one line of the service and no template.

## Data model

```ts
export interface StayLink {
  label: string;
  url: string;
}

export interface StayItem {
  title?: string;
  text?: string;
  link?: StayLink;
  /** Fact not supplied yet: renders « Information à venir » (FR-16). */
  pending?: true;
}

export interface StayGroup {
  title?: string;
  items: StayItem[];
}

export interface StaySection {
  id: string;     // English anchor: welcome, before-arrival, …
  title: string;  // French heading
  groups: StayGroup[];
}
```

Three levels rather than a flat list, because « Activités » needs its season groups (FR-15). The other sections have a single untitled group, so they render as a plain list.

A placeholder is `{ title: 'Accéder au parking', pending: true }`. Filling it later means replacing `pending: true` with `text: '…'`. A grep for `pending: true` lists every remaining gap.

## New service — `StayService`

`src/app/services/stay.service.ts`, `providedIn: 'root'`.

| Member | Type | Description |
|---|---|---|
| `sections` | `Signal<StaySection[]>` | `computed()` over `FlatInfoService.info` and `ContactService.email` (BR-5) |

A `computed()` rather than a plain `signal()`, because four pieces of text embed facts owned by other services: the residence, the building, the Maps link and the email. That is the same idiom as `ContactService.requestChecklist`.

## Page — `StayComponent` changes

```html
<header class="stay-banner"> … unchanged … </header>

<main id="main-content" class="stay-content" tabindex="-1">
  <nav class="stay-toc" aria-label="Sommaire">
    <ul>
      @for (section of stay.sections(); track section.id) {
        <li><a routerLink="/stay" [fragment]="section.id">{{ section.title }}</a></li>
      }
    </ul>
  </nav>

  @for (section of stay.sections(); track section.id) {
    <section class="stay-section" [id]="section.id" [attr.aria-labelledby]="section.id + '-heading'">
      <h2 [id]="section.id + '-heading'" class="section-title">{{ section.title }}</h2>
      @for (group of section.groups; track $index) {
        @if (group.title) { <h3 class="stay-group-title">{{ group.title }}</h3> }
        <ul class="stay-items">
          @for (item of group.items; track $index) {
            <li class="stay-item">
              @if (item.title) { <strong class="stay-item-title">{{ item.title }}</strong> }
              @if (item.pending) {
                <span class="stay-pending">Information à venir</span>
              } @else {
                @if (item.text) { <span>{{ item.text }}</span> }
                @if (item.link) { <a [href]="item.link.url" target="_blank" rel="noopener">{{ item.link.label }}</a> }
              }
            </li>
          }
        </ul>
      }
    </section>
  }
</main>
```

- **Menu links** use `routerLink` + `fragment`, like the navbar, so Bolt 10's anchor scrolling and focus handling apply unchanged
- **External links** open in a new tab, since the guest is reading a guide they will come back to. The accessible name stays the visible label. A visually hidden « (nouvel onglet) » warns screen-reader users
- **Placeholders** are italic, in `--text` rather than a grey, because `--stone` fails 4.5:1 on `--snow`
- No `innerHTML`: text only, as elsewhere on the site
- The section menu is a two-column grid on desktop and a single column on phones

## Content — French copy (to validate)

`{residence}`, `{building}`, `{maps}` and `{email}` are read from the other services. ⏳ marks a placeholder.

### 1. Bienvenue — `welcome`
- « Bienvenue au Refuge ! Nous sommes heureux de vous accueillir au Sauze. Vous trouverez ici tout ce qu'il faut savoir pour votre séjour, de l'arrivée au départ. Une question ? Écrivez-nous à {email}. — Thomas et sa famille »

### 2. Avant d'arriver — `before-arrival`
- **Linge de maison** — « Draps, housses de couette, taies d'oreiller et serviettes ne sont pas fournis : pensez à les apporter. Les oreillers et les couvertures, eux, restent dans l'appartement. »
- **Horaires** — « Arrivée à partir de 16 h, départ avant 11 h. »
- **Remise des clés** — « Une personne sur place vous accueille directement à la résidence et vous remet les clés. Ses coordonnées figurent dans votre email de confirmation. Vous arriverez plus tard que prévu ? Prévenez-nous, nous trouverons une solution. »
- **En voiture l'hiver** — « Du 1er novembre au 31 mars, la station est soumise à la loi Montagne : pneus hiver obligatoires, ou chaînes / chaussettes à neige dans le coffre. » Link: « Les règles sur le site de la Sécurité Routière » → `https://www.securite-routiere.gouv.fr/equipements-hivernaux-departements-et-communes`
- **Les courses** — « Faites vos courses avant de monter : nous vous recommandons l'Intermarché de Barcelonnette. » Link: « Intermarché de Barcelonnette sur Google Maps » → `https://www.google.com/maps/search/?api=1&query=Intermarch%C3%A9+Barcelonnette`

### 3. À l'arrivée — `arrival`
- **Accéder au parking** ⏳ (the tricky climb, the similar residence next door)
- **Si le parking est complet** ⏳
- **Jusqu'à l'appartement** — « Résidence {residence}, bâtiment {building}. Prenez l'ascenseur jusqu'au 1er étage : l'appartement n° 10 est à gauche en sortant. » Link: « Voir sur Google Maps » → `{maps}`
- **Le casier à skis** — « Au rez-de-chaussée, il s'ouvre avec la même clé que la porte d'entrée. »
- **Connexion** — « Pas de Wi-Fi, mais un très bon réseau 4G/5G. »

### 4. L'appartement — `flat`
- **Inventaire** ⏳
- **Plaques et four** ⏳
- **Ouvrir le canapé-lit** ⏳
- **Lave-linge** ⏳
- **Déjà sur place** — « Café et filtres, sel, huile, tablettes pour le lave-vaisselle et produits d'entretien. »
- **Un souci ?** — « Appelez-nous (numéro dans votre email de confirmation) ou écrivez-nous à {email}. »

### 5. Activités — `activities`
- **Hiver:** Randonnées en raquettes ⏳
- **Été:** Randonnées ⏳ · Sentiers et trails ⏳
- **En famille:** Activités avec les enfants ⏳
- **Par temps de pluie:** « Des jeux de société vous attendent dans l'appartement. »

> **Change requested 2026-09-22, after implementation:** Restaurants moved from « Activités » to « Commerces et services ».

### 6. Commerces et services — `shops`
- **Supermarché** — « Intermarché de Barcelonnette. » + the same Maps link
- **Boulangerie** ⏳ · **Restaurants** ⏳ · **Pharmacie** ⏳ · **Médecin** ⏳ · **Hôpital le plus proche** ⏳

### 7. Infos pratiques — `practical`
- **Les poubelles** ⏳
- **Règles de la résidence** — « Les skis restent au casier : ils ne montent pas dans les étages. On ne circule pas en chaussures de ski dans la résidence. »

### 8. Avant de partir — `before-leaving`
Checklist (Claude's draft):
- « Départ avant 11 h. »
- « Vaisselle faite et rangée. »
- « Réfrigérateur vidé. »
- « Poubelles descendues. »
- « Fenêtres fermées, lumières éteintes. »
- « Casier à skis vidé. »
- « Clés remises à la personne qui vous a accueillis. »

### 9. Après votre séjour — `after-leaving`
- « Merci d'avoir séjourné au Refuge ! Un avis, une suggestion ? Écrivez-nous à {email}. Et si vous avez aimé, parlez-en autour de vous : le bouche-à-oreille est notre meilleure publicité. »

## Testing approach

- `stay.service.spec.ts`: nine sections in FR-13 order with English ids; the activities groups in FR-15 order; residence, building, Maps link and email come from their services (BR-5), checked with stubbed services; no phone number pattern anywhere in the data (BR-4)
- `stay.spec.ts`: the menu lists nine links with the right `fragment`; each section is a region labelled by its `h2`; a pending item renders « Information à venir »; external links carry `target="_blank"` and `rel="noopener"`; the Bolt 10 assertions still hold
