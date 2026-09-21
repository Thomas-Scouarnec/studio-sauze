# Design — Stay Page

**Unit:** Stay Page
**Date:** 2026-09-21
**Stories:** [stay-page.md](../story-artifacts/stay-page.md) · **Spec:** [stay.md](../functional-specs/stay.md)

## Responsibility

Turn the one-page site into a two-page Angular app: the existing home page, and an unlisted `/stay` page for guests. This bolt owns the routing, the navigation between the two pages and the guest flag. The stay page ships as a shell (banner, heading, placeholder) until Thomas decides its content.

## Why this is mostly a routing bolt

The site has never needed the router: `app.routes.ts` is empty, `App` renders the sections itself, and every link is a plain `#fragment` anchor. Adding a second page changes that for the whole site. The work is therefore less about the new page than about the home page continuing to behave exactly as before once it sits behind a route.

## Structure

```
App                          skip link · <router-outlet /> · footer · photo gallery
├─ ""      → HomeComponent   hero (with navbar) + <main> with the 4 sections   — eager
├─ "stay"  → StayComponent   banner (with navbar) + <main> with the placeholder — lazy
└─ "**"    → redirect to ""
```

New folder **`src/app/pages/`** for `home/` and `stay/`. A page is what a route displays; the existing `components/` stay the building blocks pages are made of. This is a common Angular convention and keeps the distinction visible.

`HomeComponent` takes over, unchanged, what `App` renders today between the skip link and the footer: `<app-hero />` and `<main id="main-content">` with the four sections. It is **eager**, since it is the landing page. `StayComponent` is loaded with `loadComponent`, so its code is a separate chunk that only guests download.

The photo gallery stays mounted in `App`, as Bolt 9 left it. Only the home page opens it, and a closed `<dialog>` costs nothing on `/stay`.

### Routes

```ts
export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'Notre Refuge au Sauze' },
  {
    path: 'stay',
    loadComponent: () => import('./pages/stay/stay').then(m => m.StayComponent),
    title: 'Votre séjour — Notre Refuge au Sauze'
  },
  { path: '**', redirectTo: '' }
];
```

The route `title` property sets `document.title` on every navigation, so no component touches the `Title` service.

### Router configuration — `app.config.ts`

```ts
provideRouter(
  routes,
  withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }),
  withRouterConfig({ onSameUrlNavigation: 'reload' })
)
```

- `anchorScrolling` scrolls to the fragment after navigation. That is what makes `routerLink="/" fragment="contact"` work from `/stay`
- `scrollPositionRestoration` returns to the top on a new page and restores the position on back/forward
- `onSameUrlNavigation: 'reload'` covers a trap: by default the router ignores a navigation to the URL it is already on, so clicking « Équipements » a second time, after scrolling away, would do nothing

## New service — `GuestAccessService`

`src/app/services/guest-access.service.ts`, `providedIn: 'root'`.

| Member | Type | Description |
|---|---|---|
| `isGuest` | `Signal<boolean>` | Read from `localStorage` once, at creation; readonly |
| `markAsGuest()` | `void` | Sets the signal and writes the flag |

- Storage key `refuge.guest`, value `'1'`
- Every storage access sits in `try/catch`. When storage throws, `isGuest` still becomes `true` for the current visit, so the link appears while the guest browses, and simply is not remembered (BR-3)
- It follows the project's private-signal and `asReadonly()` idiom

## New page — `StayComponent`

`src/app/pages/stay/`, external template and styles (the banner has enough CSS to justify its own file).

| Aspect | Value |
|---|---|
| Selector | `app-stay` |
| Change detection | `OnPush` |
| Imports | `NavbarComponent` |
| On creation | `markAsGuest()`; adds the `noindex` meta tag, removed on destroy through `DestroyRef` |

Markup:

```html
<header class="stay-banner">
  <app-navbar />
  <h1 class="stay-title" tabindex="-1">Votre séjour</h1>
</header>
<main id="main-content" class="stay-content">
  <p>Les informations pratiques pour votre séjour arrivent bientôt.</p>
</main>
```

- The banner reuses the hero's dark background (`--bark` with the hero texture), at a fixed modest height, with enough top padding to clear the absolutely positioned navbar
- The `<header>` provides the page's `banner` landmark, the role the hero host plays on the home page
- **Placeholder text** (proposed, open to rewording): « Les informations pratiques pour votre séjour arrivent bientôt. » It avoids an empty page if a guest opens the link before the content bolt

## Navbar changes

```html
<nav aria-label="Navigation principale">
  <a class="nav-logo" routerLink="/">Notre <span>Refuge</span></a>
  <ul class="nav-links">
    <li><a routerLink="/" fragment="about">L'appartement</a></li>
    <li><a routerLink="/" fragment="equipment">Équipements</a></li>
    <li><a routerLink="/" fragment="activities">Activités</a></li>
    <li><a routerLink="/" fragment="contact">Contact</a></li>
    @if (guestAccess.isGuest()) {
      <li class="nav-guest">
        <a routerLink="/stay" routerLinkActive="is-active" ariaCurrentWhenActive="page">Mon séjour</a>
      </li>
    }
  </ul>
</nav>
```

- **Logo:** the `div` becomes a link to `/`. Its accessible name is its visible text, « Notre Refuge », which satisfies label-in-name (WCAG 2.5.3)
- **« Mon séjour »:** light amber `#d4a97a`, the colour of « Refuge » in the hero title, so it reads as a personal space rather than a fifth section; `--cream` when it is the current page. Planned as `--amber`, which verification showed at 3.22:1 on the pine part of the gradient; `#d4a97a` keeps 4.54:1 at worst
- **Mobile (≤ 768px):** the list stays visible, and every item except `.nav-guest` is hidden. Visitors without the flag therefore see an empty, invisible list, as today

## Focus after navigation

The router changes the page without a browser page load, so focus stays on the clicked link, which may no longer exist. A screen-reader user would get no sign that anything happened. `App` listens for `NavigationEnd` and then:

- with a fragment: focuses that section, adding `tabindex="-1"` if it has none, with `preventScroll`, since the router already scrolled
- without a fragment, on `/stay`: focuses the `h1` (`tabindex="-1"` in the template)
- on the first page load: does nothing, so the browser's normal starting point is kept

## Skip link

`href="#main-content"` resolves against `<base href="/">`, so on `/stay` it would load the home page. The link keeps its `href`, for its semantics, and gets a `(click)` handler that calls `preventDefault()` and focuses `#main-content` on the current page. Both `main` elements get `tabindex="-1"` so they can take focus.

The hero's « Nous contacter » button (`href="#contact"`) exists only on the home page, where the plain anchor still resolves to the current page. It stays as it is.

## Deep links on GitHub Pages

Nothing to add. `angular-cli-ghpages` copies `index.html` to `404.html` at deploy time; it is already on the `gh-pages` branch. GitHub Pages answers `/stay` with that file, with an HTTP 404 status that browsers ignore, and the Angular router takes over. That status also discourages indexing, in addition to `noindex`.

## Testing approach

- `guest-access.service.spec.ts`: starts `false`, reads an existing flag, `markAsGuest()` writes and flips it, a throwing storage is survived
- `navbar.spec.ts` (new): the four links carry `fragment`; « Mon séjour » absent without the flag, present with it; the logo links to `/`
- `stay.spec.ts`: renders `h1` « Votre séjour » and a `main`; marks the visitor as a guest; adds `noindex` and removes it on destroy
- `app.routes.spec.ts`: `''` → `HomeComponent`, `stay` → `StayComponent`, unknown → `''`, with `RouterTestingHarness`
- `app.spec.ts`: renders a router outlet and the footer. The existing section specs are unaffected
