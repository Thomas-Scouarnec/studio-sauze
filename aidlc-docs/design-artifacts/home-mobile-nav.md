# Design — Home Mobile Navigation

**Unit:** Home Mobile Navigation
**Date:** 2026-09-28
**Stories:** [home-mobile-nav.md](../story-artifacts/home-mobile-nav.md) · **Spec:** [navigation.md](../functional-specs/navigation.md) · **Builds on:** [stay-navigation.md](stay-navigation.md) (Bolt 13), [stay-compact-nav.md](stay-compact-nav.md) (Bolt 14)

## Responsibility

A sticky bar on the home page, on phones only, with a menu of the four sections plus « Mon séjour » and the language, and a permanent « Contact » shortcut. The behaviour shared with the `/stay` bar is extracted so both pages use the same code.

## Layout

```
Closed (sticky, below 768px)            Open
┌──────────────────────────────────┐   ┌──────────────────────────────────┐
│ Équipements ▾          [Contact] │   │ Équipements ▴          [Contact] │
└──────────────────────────────────┘   ├──────────────────────────────────┤
                                       │ L'appartement                    │
                                       │ Équipements               (current)
                                       │ Activités                        │
                                       │ Contact                          │
                                       │ ──────────────────────────────── │
                                       │ Mon séjour           (guests)    │
                                       │ [FR] [GB]                        │
                                       └──────────────────────────────────┘
```

- **Where:** the first child of the home page's `main`, right after the hero. At the top of the page it sits just under the hero; it sticks once it reaches the top of the screen, and stays there to the end (sticky within `main`, so never over the footer)
- **When:** `@media (max-width: 768px)`, the exact breakpoint where the navbar hides its section links. In `px`, like the navbar, so the two always switch together. From 769px, `display: none`
- **Look:** `--snow` background, `--mist` bottom border, like the `/stay` bar; the button on the left, the « Contact » pill (`--rust`, `--cream` text, 44px tall) on the right

## Shared code — extracted first

Bolt 14 wrote the list's opening and closing inside `StayNavComponent`. Two bars need it now, so it moves out before the home bar is built.

### `DisclosureDirective` — `src/app/shared/disclosure.ts`

A directive put on the element that wraps the button and the list: `<nav appDisclosure #menu="disclosure">`.

| Member | Kind | Description |
|---|---|---|
| `open` | `Signal<boolean>` (read-only) | Whether the list is shown |
| `toggle()` | method | Flips it |
| `close(returnFocus)` | method | Closes; with `true`, focus goes back to the button |
| host `(keydown.escape)` | listener | `close(true)` |
| host `(focusout)` | listener | Closes when focus goes to a known element outside (the iOS rule from Bolt 14) |
| host `(document:click)` | listener | Closes on a click outside |
| `toggleButton` | `contentChild('disclosureToggle')` | The button that gets focus back |

- **A directive, not a base class or a service:** the behaviour belongs to one element and its listeners. A directive attaches that behaviour to any element, without inheritance, and `exportAs: 'disclosure'` lets the template read its state (`menu.open()`, `menu.toggle()`)
- **`contentChild`** finds the button declared inside the element the directive sits on, in the same template: the directive doesn't need to be told which button it is
- `StayNavComponent` is refactored onto it, with its tests unchanged: they are the proof that behaviour did not change

### `spyOnSections()` — moved to `src/app/shared/section-spy.ts`

Unchanged; only its folder moves, with its tests. `stay.ts` updates its import.

### `HOME_SECTIONS` — `src/app/shared/home-sections.ts`

```ts
export const HOME_SECTIONS: readonly { id: string; title: string }[] = [
  { id: 'about', title: $localize`:@@nav.about:L'appartement` },
  { id: 'equipment', title: $localize`:@@nav.equipment:Équipements` },
  { id: 'activities', title: $localize`:@@nav.activities:Activités` },
  { id: 'contact', title: $localize`:@@nav.contact:Contact` }
];
```

One list for the navbar and the new bar (BR-3). The navbar's four `<li>` become an `@for` over it. The translation ids are the navbar's existing ones, so no text is translated twice and the English file keeps its targets.

## New component — `HomeNavComponent`

`src/app/components/home-nav/home-nav.ts`

| Member | Kind | Description |
|---|---|---|
| `activeId` | `input<string \| null>()` | The section being read, owned by the page |
| `sections` | `HOME_SECTIONS` | The list |
| `current` | `computed()` | The active section's title, or `null` |

```html
<nav appDisclosure #menu="disclosure" aria-label="Navigation de la page">
  <div class="home-nav-bar">
    <button #disclosureToggle type="button" [attr.aria-expanded]="menu.open()" aria-controls="home-nav-list" (click)="menu.toggle()">
      @if (current(); as title) {
        <span class="visually-hidden">Menu, section actuelle :</span> {{ title }}
      } @else { Menu }
      <span class="chevron" aria-hidden="true"></span>
    </button>
    <a class="home-nav-contact" routerLink="/" fragment="contact">Contact</a>
  </div>
  <div id="home-nav-list" class="home-nav-panel" [class.is-open]="menu.open()">
    <ul> … the four sections, aria-current="location" on the current one, (click)="menu.close(false)" … </ul>
    <ul class="home-nav-site">
      @if (guestAccess.isGuest()) { <li><a routerLink="/stay">Mon séjour</a></li> }
    </ul>
    <app-language-switcher />
  </div>
</nav>
```

- **Its own landmark name,** « Navigation de la page », distinct from the navbar's « Navigation principale »: two `nav` landmarks must not share a name (AXE `landmark-unique`)
- **A `<ul>`, not an `<ol>`:** the home sections are not steps
- **The panel,** not the list, carries `aria-controls`' id: it holds the sections, « Mon séjour » and the flags
- **« Contact » is a link, not a button:** it navigates. It is outside the disclosure, always visible, and it doesn't open or close the menu
- The Contact link, and the four section links, use `routerLink="/"` with a `fragment`, like the navbar: the router scrolls, and `App` moves focus (Bolt 10)

## Page — `HomeComponent` changes

- `<app-home-nav [activeId]="activeSectionId()" />` as the first child of `main`
- `activeSectionId = spyOnSections(...)` over the four section hosts (`viewChild(AboutComponent, { read: ElementRef })`, and so on)
- **Router offset,** as on `/stay`: `ViewportScroller.setOffset(() => [0, barHeight])` (no extra gap: the home sections are full-width blocks with their own top padding and background; a gap would show a strip of the previous section), reset on destroy. On a desktop the bar is `display: none` and its `offsetHeight` is 0, so the offset is 0 and the navbar links land exactly where they do today
- **Focus clearance:** `scroll-margin-top: 4.5rem` on the links, buttons and form fields inside the sections, under the same 768px media query (the Bolt 14 lesson: on the content, never `scroll-padding` on the page)

## The two pages side by side

| | `/stay` | Home |
|---|---|---|
| Navbar | Scrolls away with the banner | Scrolls away with the hero |
| Sticky bar | Always (chips from 1280px, compact below) | Below 768px only |
| Label | « 5/9 · Activités », numbered | « Équipements », not numbered |
| Progress line | Yes | No |
| Menu holds | The nine sections | The four sections, « Mon séjour », the language |
| Shortcut | « Haut de page » (bottom) | « Contact » (in the bar) |
| Shared code | `DisclosureDirective`, `spyOnSections()` | The same |

## Copy

| Key | French | English |
|---|---|---|
| `homeNav.label` | Navigation de la page | Page navigation |
| `homeNav.menu` | Menu | Menu |
| `homeNav.current` | Menu, section actuelle : | Menu, current section: |

Section titles, « Contact » and « Mon séjour » reuse the navbar's keys (`nav.*`).

## Files

| File | Change |
|---|---|
| `src/app/shared/disclosure.ts` (+ spec) | New |
| `src/app/shared/section-spy.ts` (+ spec) | Moved from `pages/stay/` |
| `src/app/shared/home-sections.ts` | New |
| `src/app/pages/stay/stay-nav.ts` | Uses `DisclosureDirective`; its own closing code removed |
| `src/app/pages/stay/stay.ts` | Import path |
| `src/app/components/navbar/navbar.ts` | `@for` over `HOME_SECTIONS` |
| `src/app/components/home-nav/home-nav.ts`, `.css`, `.spec.ts` | New |
| `src/app/pages/home/home.ts` (+ spec) | The bar, the spy, the offset, the focus clearance |
| `src/locale/messages.xlf`, `messages.en.xlf` | Three keys |
