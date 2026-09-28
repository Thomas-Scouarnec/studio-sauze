# Design — Stay Navigation

**Unit:** Stay Navigation
**Date:** 2026-09-28
**Stories:** [stay-navigation.md](../story-artifacts/stay-navigation.md) · **Spec:** [stay.md](../functional-specs/stay.md) (FR-14, FR-22 to FR-26)

## Responsibility

Turn the « Sommaire » grid at the top of `/stay` into a sticky bar that follows the guest, highlights the section on screen, and numbers the sections. Add a « Haut de page » button. No change to `StayService`: the content and its data stay as they are.

## Layout

```
┌───────────────────────────────────────────────┐
│ ‹ 3 À l'arrivée  [5 Activités]  6 Commerces … │  ← sticky, top: 0
├───────────────────────────────────────────────┤
│ 5  Activités                                  │
│    HIVER                                      │
│    Le domaine skiable …                       │
│                                   ┌────────┐  │
│                                   │ ↑ Haut │  │  ← fixed, bottom right
└───────────────────────────────────┴────────┴──┘
```

- One row of chips at every width. When they don't fit, the row scrolls sideways (`overflow-x: auto`); the page never does
- The bar has the `--snow` background and a `--mist` bottom border, so the text scrolling underneath never shows through
- The active chip: `--rust` background, `--cream` text, plus bold. The bold is the non-colour cue (WCAG 1.4.1)
- The bar sits in `main`, so it only sticks while `main` is on screen: never over the banner or the footer

## Components

### `StayNavComponent` — new, `src/app/pages/stay/stay-nav.ts`

The bar is now a real piece of behaviour (observer, active state, scrolling the row), so it leaves `stay.html` for a small component of its own.

| Member | Kind | Description |
|---|---|---|
| `sections` | `input.required<StaySection[]>()` | What to list |
| `activeId` | `input<string \| null>()` | The section on screen, owned by the page |

```html
<nav class="stay-nav" aria-label="Sommaire">
  <ol>
    @for (section of sections(); track section.id) {
      <li>
        <a routerLink="/stay" [fragment]="section.id"
           [attr.aria-current]="section.id === activeId() ? 'location' : null">
          <span class="stay-nav-number" aria-hidden="true">{{ $index + 1 }}</span>
          {{ section.title }}
        </a>
      </li>
    }
  </ol>
</nav>
```

- `<ol>`, not `<ul>`: screen readers announce « 5 of 9 », so the visible number is `aria-hidden` and not read twice
- `aria-current="location"`: the ARIA value for « where you are in the page », rather than `page`
- An `effect()` on `activeId` scrolls the row so the active chip is visible, by setting the `<ol>`'s `scrollLeft`. Not `scrollIntoView()`, which may also scroll the page vertically

### `spyOnSections()` — new function, `src/app/pages/stay/section-spy.ts`

A function the page calls once, returning a signal:

```ts
export function spyOnSections(ids: () => string[], topOffset: () => number): Signal<string | null>
```

- Called in the component's constructor, so it can use `inject()`, `afterNextRender()` and `DestroyRef`
- Uses an `IntersectionObserver` over the nine `<section>` elements, with a « reading line » just below the bar: `rootMargin: -<bar height>px 0px -60% 0px`. The section crossing that band is the active one
- Between two sections (the 4 rem gap), nothing crosses the band: the previous value is kept, so the highlight doesn't flicker
- Above the first section (the page top), the value is `null`: no chip is highlighted
- **Page bottom:** the last sections are short and may never reach the band. When the window is scrolled to the bottom, the last section wins. This needs one passive `scroll` listener; the observer does the rest
- Disconnected through `DestroyRef`: the same clean-up pattern as the `robots` meta tag
- Does nothing on the server or in tests without `IntersectionObserver` (returns `null` forever)

Why a function rather than a service: the state belongs to one page instance and dies with it. A root service would outlive the page; a component-level provider is more ceremony for the same result. This is Angular's « composable » pattern, the same idea as `inject()` itself.

### `StayComponent` — changes

- `protected readonly activeSectionId = spyOnSections(...)`, passed to `<app-stay-nav [activeId]="activeSectionId()" />`
- Headings get the number: `<span class="stay-section-number" aria-hidden="true">{{ $index + 1 }}</span>` before the title. The heading's accessible name stays « Activités »
- `showBackToTop`: a second, one-element observer on the banner, as a signal. The button is rendered with `@if (showBackToTop())`
- The back-to-top button: `<button type="button" class="stay-back-to-top">`, text « Haut de page » with a `↑` marked `aria-hidden`. On click: `window.scrollTo({ top: 0 })`, then focus the `h1` with `preventScroll`. A `<button>`, not a link: it doesn't navigate

## The sticky bar and scrolling to a section

Two browser mechanisms scroll the page, and both must stop below the bar:

| Who scrolls | How | Fix |
|---|---|---|
| The router, after a chip click (`anchorScrolling`) | `ViewportScroller.scrollToAnchor()` computes the position and calls `window.scrollTo`, minus its own `offset` | `ViewportScroller.setOffset(() => [0, barHeight])` in `StayComponent`; reset to `[0, 0]` on destroy, so the home page's navbar links are unchanged |
| The browser, when keyboard focus lands on a hidden element | Scrolls it into view, honouring `scroll-padding-top` | `html:has(.stay-nav) { scroll-padding-top: … }` in `styles.css`: applies only while the bar exists |

CSS `scroll-margin-top` would not be enough: the router does not use `scrollIntoView`, so it ignores it. `setOffset` takes a function, so the bar's real height is read at scroll time (it changes with the font size and zoom).

## Motion

- **Found during the build:** `styles.css` set `html { scroll-behavior: smooth }` for the whole site, with no guard, so every scroll (router, back-to-top) was smooth for everyone. It now sits under `@media (prefers-reduced-motion: no-preference)`: smooth by default, instant for visitors who ask for less motion
- The chip row follows the same rule

## Copy

| Key | French | English |
|---|---|---|
| `stay.backToTop` | Haut de page | Back to top |

The « Sommaire » / `stay.toc.label` key is kept. No other text changes: the numbers are not translated text.

## Files

| File | Change |
|---|---|
| `src/app/pages/stay/stay-nav.ts` (+ `.css`, `.spec.ts`) | New |
| `src/app/pages/stay/section-spy.ts` (+ `.spec.ts`) | New |
| `src/app/pages/stay/stay.ts`, `.html`, `.css`, `.spec.ts` | Bar moved out, numbers, back-to-top, offset |
| `src/styles.css` | `scroll-padding-top` for `/stay` |
| `src/locale/messages.xlf`, `messages.en.xlf` | `stay.backToTop` |
