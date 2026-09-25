# Design — Localization

**Unit:** Localization
**Date:** 2026-09-25
**Stories:** [localization.md](../story-artifacts/localization.md) · **Spec:** [localization.md](../functional-specs/localization.md)

## Responsibility

Compile the site in French (source) and English with Angular's built-in i18n, add a flag switcher to the navbar, and remember the visitor's choice. No content changes: every English text below is a translation of the existing French.

## How built-in i18n works here

1. French text stays in the templates and services, **marked** for translation:
   - templates: `i18n="@@hero.subtitle"` on elements, `i18n-alt`, `i18n-aria-label` on attributes
   - TypeScript: `` $localize`:@@equipment.arrival.title:Vos skis restent en bas` ``
2. `ng extract-i18n` collects every marked text into `src/locale/messages.json` (the French source, generated).
3. `src/locale/messages.en.json` holds the English for each id (hand-written).
4. `ng build` compiles the app once, then **inlines** each language into a copy: `browser/` (fr) and `browser/en/`. No translation lookup happens at runtime; each app contains one language only.

Checked in a throwaway build before planning: an empty `subPath` is accepted for the source locale, and the build sets `<html lang>` and `<base href>` for each copy (`lang="fr"`, `/` and `lang="en"`, `/en/`).

### `angular.json`

```jsonc
"projects": { "studio-sauze": {
  "i18n": {
    "sourceLocale": { "code": "fr", "subPath": "" },
    "locales": { "en": { "translation": "src/locale/messages.en.json", "subPath": "en" } }
  },
  "architect": {
    "build": {
      "options": {
        "localize": true,                        // both languages in every build
        "i18nMissingTranslation": "error",       // BR-4
        "polyfills": ["@angular/localize/init"]
      },
      "configurations": {
        "development": { "localize": ["fr"] },   // ng serve serves one language
        "en": { "localize": ["en"] }
      }
    },
    "serve": { "configurations": {
      "development-en": { "buildTarget": "studio-sauze:build:development,en" }
    } },
    "extract-i18n": { "builder": "@angular/build:extract-i18n",
                      "options": { "format": "json", "outputPath": "src/locale" } }
  }
} }
```

JSON rather than XLIFF: one line per text, easy to read and diff. The trade-off is no translator notes. Nobody but Thomas and Claude translates here, so they are not needed.

### IDs

`@@<area>.<key>`, for example `nav.about`, `about.title`, `equipment.sleeping.body`, `stay.arrival.flat.text`, `gallery.counter`. Custom ids keep a translation attached when the French is reworded (BR-3). Without them, the id is a hash of the French text, and any edit orphans the English.

### Text with values

```ts
// A value inside a translated sentence becomes a named placeholder.
text: $localize`:@@stay.flat.problem.text:Appelez-nous (numéro dans votre email de confirmation) ou écrivez-nous à ${email}:email:.`
```
```json
"stay.flat.problem.text": "Call us (number in your confirmation email) or email us at {$email}."
```

## New code

### `LanguageService` — `src/app/services/language.service.ts`

```ts
export type Language = 'fr' | 'en';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly router = inject(Router);

  /** The language this app was compiled for (set by the build: 'fr' or 'en'). */
  readonly current: Language = inject(LOCALE_ID).startsWith('en') ? 'en' : 'fr';

  /** The current route, including the #fragment, updated on every navigation. */
  private readonly url = toSignal(
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd), map(() => this.router.url)),
    { initialValue: this.router.url }
  );

  /** The same page in each language: '/stay#arrival' ↔ '/en/stay#arrival'. */
  readonly links = computed(() => LANGUAGES.map((lang) => ({ ...lang, href: urlFor(lang.code, this.url()) })));

  /** Saves the choice (FR-8). The link's own navigation does the switch. */
  choose(language: Language): void {
    try { localStorage.setItem(LANGUAGE_STORAGE_KEY, language); } catch { /* BR-6 */ }
  }
}
```

The storage key is `refuge.lang`, next to Bolt 10's `refuge.guest`.

### `resolveLanguageRedirect()` — `src/app/language-redirect.ts`

A pure function, so the redirect rules are unit-tested without a browser:

```ts
/** Returns the URL to go to, or null to stay. */
export function resolveLanguageRedirect(appLanguage: Language, saved: string | null, location: { pathname: string; search: string; hash: string }): string | null
```

| App | Saved | Path | Result | Why |
|---|---|---|---|---|
| fr | `en` | `/stay` | `/en/stay` (+ search, hash) | FR-9 |
| fr | `en` | `/en/…` | `null` | The French app is answering an English URL (a GitHub Pages 404 fallback, or `ng serve`): redirecting would loop |
| fr | `fr` / none / junk | any | `null` | FR-2 |
| en | any | any | `null` | FR-10: an `/en/` URL always shows English |

`main.ts` calls it before `bootstrapApplication`. On a redirect it calls `location.replace()` and does not bootstrap, so nothing French is painted (US-2). The one cost is that the redirect waits for the main bundle (~80 kB transferred) rather than running from an inline script. It is kept in TypeScript because that way it is tested, typed, and does not need a CSP exception if one is ever added.

### `LanguageSwitcherComponent` — `src/app/components/language-switcher/`

Rendered at the end of the navbar, outside the section-link list, so it stays visible on phones.

```html
<ul class="lang-switcher" aria-label="Langue" i18n-aria-label="@@lang.label">
  @for (lang of language.links(); track lang.code) {
    <li>
      @if (lang.code === language.current) {
        <span class="lang-flag is-current" aria-current="true" [attr.lang]="lang.code">
          <!-- flag svg, aria-hidden --><span class="visually-hidden">{{ lang.name }}</span>
        </span>
      } @else {
        <a class="lang-flag" [href]="lang.href" [attr.hreflang]="lang.code" [attr.lang]="lang.code"
           (click)="language.choose(lang.code)">
          <!-- flag svg, aria-hidden --><span class="visually-hidden">{{ lang.name }}</span>
        </a>
      }
    </li>
  }
</ul>
```

- **Language names are not translated:** « Français » and « English » are each written in their own language, with `lang` for pronunciation (US-5)
- **A plain `href`, not `routerLink`:** the other language is a different app, so a page load is needed
- **Flags are inline SVG, 24 × 16, `aria-hidden`.** Emoji flags do not render on Windows, which shows the letters « FR » / « GB » instead
- **Current language:** full opacity with a 2 px `--cream` underline. The other flag is at 70 % opacity and goes to 100 % on hover or focus. The focus ring is the navbar's `2px solid var(--amber)`
- **Touch target:** 44 × 44 px (the flag is centred in its padding), the same as « Mon séjour »

## GitHub Pages

| URL | Served file | Status |
|---|---|---|
| `/`, `/en/` | `index.html`, `en/index.html` | 200 |
| `/stay` | `404.html` (copy of the French `index.html`, written by `angular-cli-ghpages`) | 404, works, as today |
| `/en/stay` | **`en/stay.html`**, a copy of `en/index.html` written by a post-build script | 200 |
| `/en/anything-else` | `404.html` (French app) → French home, then the saved-choice redirect | acceptable: not a real page |

Without `en/stay.html`, a direct `/en/stay` would fall back to the French `404.html`. GitHub Pages resolves `/en/stay` to `en/stay.html`.

- `scripts/i18n-deep-links.mjs` copies `en/index.html` to `en/<route>.html` for each route (only `stay` today)
- `npm run deploy` = `ng build` → the script → `ng deploy --no-build`. Plain `ng deploy` would rebuild and drop the copied file, so the README's deployment section says to use `npm run deploy`

### Images

The loader returns `images/…`, relative to `<base href>`, so English pages would load `/en/images/…`. The build copies the images there, but a visitor who switches language downloads every photo again. The loader will return `/images/…` instead, so both languages share one copy in the browser cache. The build still writes both copies to `gh-pages` (+1.2 MB, not served twice).

### `hreflang`

`src/index.html` (shared by both builds) gets:

```html
<link rel="alternate" hreflang="fr" href="https://refugedusauze.com/">
<link rel="alternate" hreflang="en" href="https://refugedusauze.com/en/">
<link rel="alternate" hreflang="x-default" href="https://refugedusauze.com/">
```

These are only right for the home page. The stay page carries them too, but it is `noindex`, so search engines ignore them there.

## Tests

- `src/test-setup.ts` imports `@angular/localize/init`. Specs run on the French source text, so the existing assertions stay as they are
- `language-redirect.spec.ts`: every row of the table above
- `language.service.spec.ts`: `links()` for `/`, `/stay`, `/#contact`, `/stay#arrival`, in both languages (`LOCALE_ID` provided); `choose()` writes the key; `choose()` with a throwing `localStorage` does not throw
- `language-switcher.spec.ts`: two items; current is a `span` with `aria-current`; the other is an `a` with `href`, `hreflang`, `lang`; a click saves the choice
- `navbar.spec.ts`: the switcher renders, also without the guest flag

The English strings themselves are checked by the build (BR-4) and in the browser, not in unit tests.

---

## English copy — for Thomas's review

British English (BR-2). Proper names unchanged (BR-1). **Bold** rows are choices worth a look.

### Shared

| Where | French | English |
|---|---|---|
| Skip link | Aller au contenu principal | Skip to main content |
| Navbar label | Navigation principale | Main navigation |
| Navbar | L'appartement · Équipements · Activités · Contact · Mon séjour | The flat · Amenities · Activities · Contact · My stay |
| **Logo, hero title, footer logo** | Notre Refuge (au Sauze) | **unchanged: it is the brand (BR-1)** |
| Switcher label | Langue | Language |
| Tab titles | Notre Refuge au Sauze · Votre séjour — Notre Refuge au Sauze | Notre Refuge au Sauze · Your stay — Notre Refuge au Sauze |
| New tab hint | (nouvel onglet) | (new tab) |
| Footer | Tous droits réservés | All rights reserved |

### Hero

| French | English |
|---|---|
| Station du Sauze · Alpes de Haute-Provence | Le Sauze ski resort · Alpes de Haute-Provence |
| Un studio montagne au cœur des Alpes provençales, skis aux pieds, entre ciel et forêt. | A mountain studio in the heart of the Provençal Alps, ski-in ski-out, between sky and forest. |
| Nous contacter | Contact us |
| Découvrir | Explore |

### About

| French | English |
|---|---|
| 32 m² de confort alpin | 32 m² of alpine comfort |
| Situé dans la résidence **Le Roi Soleil** (bâtiment **Crépuscule**) à la station du Sauze - à environ 10 minutes en voiture de Barcelonnette, cet appartement studio profite d'un accès direct aux pistes et itinéraires raquettes l'hiver, et aux sentiers de randonnée l'été. | In the **Le Roi Soleil** residence (**Crépuscule** building) at the Le Sauze ski resort, about 10 minutes' drive from Barcelonnette, this studio flat has direct access to the slopes and snowshoe trails in winter, and to hiking paths in summer. |
| Le coin montagne, avec son lit superposé complété d'un tiroir-lit, accueille jusqu'à 3 personnes ; un confortable canapé-lit (160 cm) dans le séjour permet d'en loger 2 de plus, pour une capacité totale de 5 personnes. L'espace séjour dispose d'un coin cuisine bien équipé, d'une salle de bain complète et de WC séparés, ainsi que de plusieurs espaces de rangement pour équipements et bagages. | The mountain nook, with its bunk bed and pull-out trundle bed, sleeps up to 3; a comfortable sofa bed (160 cm) in the living room sleeps 2 more, for 5 guests in all. The living area has a well-equipped kitchenette, a full bathroom and a separate toilet, as well as plenty of storage for gear and luggage. |
| Caractéristiques de l'appartement | Key features of the flat |
| personnes · Sur place · pistes, sentiers & raquettes | guests · On site · slopes, trails & snowshoeing |
| Voir la résidence sur Google Maps | See the residence on Google Maps |
| *alt* Le séjour, avec son canapé-lit et sa commode en pin | The living room, with its sofa bed and pine chest of drawers |
| *alt* La fenêtre du séjour, ouverte sur la forêt | The living-room window, looking out onto the forest |
| *alt* Le Chapeau du Gendarme, sommet calcaire sous un ciel bleu | The Chapeau du Gendarme, a limestone peak under a blue sky |

### Amenities

| French | English |
|---|---|
| **Équipements** · Ce qui vous attend | **Amenities** · What awaits you |
| Vos skis restent en bas | Your skis stay downstairs |
| Parking gratuit au pied du bâtiment et casier à skis sécurisé au rez-de-chaussée : vous y déposez le matériel en arrivant, puis vous montez au 1er étage en ascenseur. | Free parking at the foot of the building and a secure ski locker on the ground floor: drop your gear off as you arrive, then take the lift up to the first floor. |
| Cinq vrais couchages, et de l'intimité | Five proper beds, and some privacy |
| Le coin montagne accueille 3 personnes sur de véritables couchages de 80 cm adaptés aux adultes, isolables par un rideau. Dans le séjour, un canapé-lit 160 cm de très bonne qualité pour deux personnes de plus. | The mountain nook sleeps 3 in real 80 cm beds suited to adults, which a curtain can close off. In the living room, a very good-quality 160 cm sofa bed sleeps two more. |
| Une cuisine où l'on cuisine vraiment | A kitchen made for real cooking |
| Grand réfrigérateur de 140 cm, four, lave-vaisselle, plaques, micro-ondes, bouilloire et cafetière filtre — sans oublier l'appareil à raclette. Autour de la grande table en bois, vous tenez à cinq : trois chaises et un banc. | A large 140 cm fridge, oven, dishwasher, hob, microwave, kettle and filter coffee maker — not forgetting the raclette machine. The big wooden table seats five: three chairs and a bench. |
| — ouvrir la galerie ({{n}} photos) | — open the gallery ({{n}} photos) |
| Et aussi | Also in the flat |
| Baignoire et douche · WC séparés · Lave-linge · TV (TNT) | Bath and shower · Separate toilet · Washing machine · TV (free-to-air channels) |
| Plusieurs espaces de rangement · Emplacement pour sécher chaussures et gants | Plenty of storage space · A place to dry boots and gloves |
| Très bon réseau 4G/5G — pas de Wi-Fi · Vue sur la forêt | Very good 4G/5G coverage — no Wi-Fi · Forest view |
| *alt* Les casiers à skis sécurisés du rez-de-chaussée | The secure ski lockers on the ground floor |
| *alt* Deux enfants blottis dans les couchages du coin montagne | Two children snuggled up in the beds of the mountain nook |
| *alt* Le coin cuisine : micro-ondes et meubles en pin, à côté de la télévision | The kitchen corner: microwave and pine units, next to the TV |

### Seasons

| French | English |
|---|---|
| Toute l'année · Deux saisons, mille plaisirs | All year round · Two seasons, endless pleasures |
| Décembre – Avril · L'hiver | December – April · Winter |
| De décembre à avril, la station vit au rythme de la neige, loin de l'agitation des grandes stations. | From December to April, the resort lives to the rhythm of the snow, far from the bustle of the big resorts. |
| Le domaine Sauze – Super-Sauze · Des pistes pour tous les niveaux, du débutant au skieur confirmé. | The Sauze – Super-Sauze ski area · Slopes for every level, from beginners to experienced skiers. |
| Raquettes au départ de la résidence · Les itinéraires commencent à quelques mètres. | Snowshoeing from the residence · The trails start a few metres away. |
| Luge · De quoi occuper les après-midis en famille. | Sledging · Something to fill family afternoons. |
| Ski alpin · Snowboard · Pra-Loup à 15 km | Alpine skiing · Snowboarding · Pra-Loup 15 km away |
| Domaine du Sauze | Le Sauze ski area |
| Juin – Septembre · L'été | June – September · Summer |
| L'été, la vallée de l'Ubaye change de visage : sentiers, rivières et grands espaces à portée de main. | In summer, the Ubaye valley changes face: trails, rivers and wide open spaces within easy reach. |
| Les Fêtes Latino-Mexicaines de Barcelonnette · Dix jours à la mi-août, héritage de l'émigration de la vallée vers le Mexique. | Barcelonnette's Latino-Mexican Festival · Ten days in mid-August, a legacy of the valley's emigration to Mexico. |
| Le lac de Serre-Ponçon · À 45 minutes de voiture, baignade et sports nautiques. | Lake Serre-Ponçon · 45 minutes by car, for swimming and water sports. |
| Randonnée dans le Mercantour · Les sentiers du parc national au départ de la vallée. | Hiking in the Mercantour · The national park's trails, starting from the valley. |
| Trail · VTT · Parapente · Canyoning | Trail running · Mountain biking · Paragliding · Canyoning |
| **Offices de tourisme de l'Ubaye** | **Ubaye tourist offices (in French)** — FR-14 |
| Activités (tag list label) | Activities |
| *alt* Le front de neige du Sauze, au pied des chalets, face aux sommets enneigés | The snow front at Le Sauze, at the foot of the chalets, facing the snowy peaks |
| *alt* Danseuses en robes colorées dans une rue de Barcelonnette pendant les Fêtes Latino-Mexicaines | Dancers in colourful dresses in a Barcelonnette street during the Latino-Mexican Festival |

### Contact

| French | English |
|---|---|
| Écrivez-nous | Write to us |
| Une question sur l'appartement, une envie de séjour ? Écrivez-nous par email, nous vous répondrons rapidement. | A question about the flat, or thinking of a stay? Email us and we will get back to you quickly. |
| Pour une demande de séjour, précisez : | For a booking request, please include: |
| Vos dates d'arrivée et de départ | Your arrival and departure dates |
| Le nombre de personnes (5 au maximum) | The number of guests (5 at most) |
| Vos questions éventuelles | Any questions you may have |
| Votre séjour est confirmé par notre réponse : aucune réservation n'est enregistrée sur ce site. | Your stay is confirmed by our reply: no booking is made on this site. |

### Photo gallery

| French | English |
|---|---|
| Galerie photos du studio | Photo gallery of the studio |
| Fermer la galerie · Photo précédente · Photo suivante | Close the gallery · Previous photo · Next photo |
| Photo {{a}} sur {{b}} | Photo {{a}} of {{b}} |

### Stay page

| French | English |
|---|---|
| Votre séjour · Sommaire · Information à venir | Your stay · Contents · Information coming soon |
| **Bienvenue** — Bienvenue au Refuge ! Nous sommes heureux de vous accueillir au Sauze. Vous trouverez ici tout ce qu'il faut savoir pour votre séjour, de l'arrivée au départ. Une question ? Écrivez-nous à {email}. — Thomas et sa famille | **Welcome** — Welcome to the Refuge! We are delighted to have you at Le Sauze. Here you will find everything you need to know for your stay, from arrival to departure. Any questions? Email us at {email}. — Thomas and family |
| **Avant d'arriver** | **Before you arrive** |
| Linge de maison — Draps, housses de couette, taies d'oreiller et serviettes ne sont pas fournis : pensez à les apporter. Les oreillers et les couvertures, eux, restent dans l'appartement. | Bed linen — Sheets, duvet covers, pillowcases and towels are not provided: please bring your own. Pillows and blankets, however, are in the flat. |
| Horaires — Arrivée à partir de 16 h, départ avant 11 h. | Times — Arrival from 4 pm, departure by 11 am. |
| Remise des clés — Une personne sur place vous accueille directement à la résidence et vous remet les clés. Ses coordonnées figurent dans votre email de confirmation. Vous arriverez plus tard que prévu ? Prévenez-nous, nous trouverons une solution. | Key handover — Someone local will meet you at the residence and hand you the keys. Their contact details are in your confirmation email. Arriving later than planned? Let us know and we will find a solution. |
| En voiture l'hiver — Du 1er novembre au 31 mars, la station est soumise à la loi Montagne : pneus hiver obligatoires, ou chaînes / chaussettes à neige dans le coffre. | Driving in winter — From 1 November to 31 March, the resort falls under the loi Montagne (French mountain law): winter tyres are compulsory, or snow chains / snow socks must be carried in the boot. |
| Les règles sur le site de la Sécurité Routière | **The rules on the French road safety website (in French)** |
| Les courses — Faites vos courses avant de monter : nous vous recommandons l'Intermarché de Barcelonnette. | Groceries — Do your shopping before driving up: we recommend the Intermarché in Barcelonnette. |
| Intermarché de Barcelonnette sur Google Maps | Intermarché Barcelonnette on Google Maps |
| **À l'arrivée** | **On arrival** |
| Accéder au parking · Si le parking est complet | Getting to the car park · If the car park is full |
| Jusqu'à l'appartement — Résidence {residence}, bâtiment {building}. Prenez l'ascenseur jusqu'au 1er étage : l'appartement n° 10 est à gauche en sortant. | Finding the flat — {residence} residence, {building} building. Take the lift to the first floor: flat no. 10 is on your left as you step out. |
| Voir sur Google Maps | See on Google Maps |
| Le casier à skis — Au rez-de-chaussée, il s'ouvre avec la même clé que la porte d'entrée. | The ski locker — On the ground floor; it opens with the same key as the front door. |
| Connexion — Pas de Wi-Fi, mais un très bon réseau 4G/5G. | Connectivity — No Wi-Fi, but very good 4G/5G coverage. |
| **L'appartement** | **The flat** |
| Inventaire · Plaques et four · Ouvrir le canapé-lit · Lave-linge | Inventory · Hob and oven · Opening the sofa bed · Washing machine |
| Déjà sur place — Café et filtres, sel, huile, tablettes pour le lave-vaisselle et produits d'entretien. | Already provided — Coffee and filters, salt, oil, dishwasher tablets and cleaning products. |
| Un souci ? — Appelez-nous (numéro dans votre email de confirmation) ou écrivez-nous à {email}. | A problem? — Call us (number in your confirmation email) or email us at {email}. |
| **Activités** — Hiver · Été · En famille · Par temps de pluie | **Activities** — Winter · Summer · With children · On rainy days |
| Randonnées en raquettes · Randonnées · Sentiers et trails · Activités avec les enfants | Snowshoe walks · Hikes · Trails and trail running · Activities for children |
| Des jeux de société vous attendent dans l'appartement. | Board games are waiting for you in the flat. |
| **Commerces et services** | **Shops and services** |
| Supermarché — Intermarché de Barcelonnette. | Supermarket — Intermarché in Barcelonnette. |
| Boulangerie · Restaurants · Pharmacie · Médecin · Hôpital le plus proche | Bakery · Restaurants · Pharmacy · Doctor · Nearest hospital |
| **Infos pratiques** | **Practical information** |
| Les poubelles | Rubbish |
| Règles de la résidence — Les skis restent au casier : ils ne montent pas dans les étages. On ne circule pas en chaussures de ski dans la résidence. | Residence rules — Skis stay in the locker: they do not go up to the flats. No ski boots inside the residence. |
| **Avant de partir** | **Before you leave** |
| Départ avant 11 h. · Vaisselle faite et rangée. · Réfrigérateur vidé. · Poubelles descendues. | Departure by 11 am. · Dishes washed and put away. · Fridge emptied. · Rubbish taken down. |
| Fenêtres fermées, lumières éteintes. · Casier à skis vidé. · Clés remises à la personne qui vous a accueillis. | Windows closed, lights off. · Ski locker emptied. · Keys returned to the person who welcomed you. |
| **Après votre séjour** — Merci d'avoir séjourné au Refuge ! Un avis, une suggestion ? Écrivez-nous à {email}. Et si vous avez aimé, parlez-en autour de vous : le bouche-à-oreille est notre meilleure publicité. | **After your stay** — Thank you for staying at the Refuge! A review, a suggestion? Email us at {email}. And if you enjoyed your stay, tell your friends: word of mouth is our best advertising. |
