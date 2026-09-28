# Design — Stay Compact Navigation

**Unit:** Stay Compact Navigation
**Date:** 2026-09-28
**Stories:** [stay-compact-nav.md](../story-artifacts/stay-compact-nav.md) · **Spec:** [stay.md](../functional-specs/stay.md) (FR-14, FR-22, FR-27, FR-28) · **Builds on:** [stay-navigation.md](stay-navigation.md) (Bolt 13)

## Responsibility

Give `StayNavComponent` a second presentation for narrow screens: a compact bar that names the current section and opens the full list, with a progress line. The wide presentation (the row of chips) is unchanged. `spyOnSections()`, the heading numbers, the router offset and « Haut de page » are untouched.

## Layout

```
Narrow, closed (sticky)             Narrow, open
┌────────────────────────────┐     ┌────────────────────────────┐
│ 5/9 · Activités          ▾ │     │ 5/9 · Activités          ▴ │
│▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░│     ├────────────────────────────┤
└────────────────────────────┘     │ 1  Bienvenue               │
                                   │ …                          │
                                   │ 5  Activités    (current)  │
                                   │ …                          │
                                   │ 9  Après votre séjour      │
                                   └────────────────────────────┘
```

- **The switch:** `@media (max-width: 79.99em)`, i.e. below 1280px at the default font size. In `em`, so a visitor who sets a larger default font gets the compact bar sooner, when the chips would no longer fit. Page zoom shrinks the CSS viewport, so it switches on its own too
- **Why a CSS switch and not a measurement in JavaScript:** one media query, no layout reading, no flicker on load. The chips fit at 1280px in both languages (measured in Bolt 13)
- **The open list** hangs below the bar (`position: absolute`), over the page, with a shadow. It doesn't push the page down, so the router offset (the bar's height) stays right. Its height is capped at `100dvh` minus the bar, and it scrolls on its own
- **Entries:** full-width rows, at least 2.75rem (44px) tall, number then title; the current one uses the chip's highlight (rust background, bold)

## One list, two presentations

The component keeps **one** `<nav aria-label="Sommaire">` and **one** `<ol>`. Rendering a second navigation for phones would create two landmarks with the same name (an AXE failure) and duplicate the links.

```html
<nav class="stay-nav" aria-label="Sommaire" (keydown.escape)="close(true)" (focusout)="onFocusOut($event)">
  <button #toggle type="button" class="stay-nav-toggle"
          [attr.aria-expanded]="open()" aria-controls="stay-nav-list" (click)="toggle()">
    @if (position(); as p) {
      <span class="visually-hidden">Section {{ p.number }} sur {{ p.total }} :</span>
      <span aria-hidden="true">{{ p.number }}/{{ p.total }} ·</span>
      {{ p.title }}
    } @else {
      Sommaire
    }
    <span class="stay-nav-chevron" aria-hidden="true"></span>
  </button>
  <span class="stay-nav-progress" aria-hidden="true" [style.transform]="'scaleX(' + progress() + ')'"></span>

  <ol #list id="stay-nav-list" [class.is-open]="open()"> … same links as Bolt 13, plus (click)="close(false)" … </ol>
</nav>
```

| Width | Toggle button and progress line | `<ol>` |
|---|---|---|
| Wide (≥ 80em) | `display: none` | The row of chips, as in Bolt 13 |
| Narrow | Shown | `display: none`, or the open list when `.is-open` |

On a wide screen the button is `display: none`, so it is neither focusable nor announced; the chips work exactly as before.

## State — `StayNavComponent` additions

| Member | Kind | Description |
|---|---|---|
| `open` | `signal(false)` | Whether the list is shown (narrow only) |
| `position` | `computed()` | `{ number, total, title }` of `activeId()`, or `null` |
| `progress` | `computed()` | `number / total`, `0` when `position` is `null` |
| `toggle()` | method | Flips `open` |
| `close(returnFocus)` | method | Closes; on Escape, focus goes back to the button |

`position` and `progress` derive from inputs the component already has (`sections`, `activeId`): no new input, no change to the page.

## Closing the list

| Trigger | How | Focus |
|---|---|---|
| Tap the bar again | `toggle()` | Stays on the button |
| Choose a section | `(click)` on the link | Moves to the section (router + `App`, as in Bolt 13) |
| Escape | `(keydown.escape)` on the `nav` | Back to the button (WCAG 2.1.2, no trap) |
| Tab out of the list | `(focusout)`: closes when `relatedTarget` is outside the `nav` | Wherever the guest tabbed |
| Tap outside | A `document:click` listener in the component's `host` object, ignoring clicks inside the `nav` | Unchanged |

A disclosure (a button with `aria-expanded` and `aria-controls`), not an ARIA `menu`: the entries are ordinary links, reached with Tab, and a `menu` role would promise arrow-key navigation.

## Progress line

- A 3px `--rust` line along the bottom edge of the bar, over the existing `--mist` border
- `transform: scaleX(progress)` with `transform-origin: left`: animating `transform` doesn't trigger a new layout
- `transition: transform 0.3s` only under `prefers-reduced-motion: no-preference`
- `aria-hidden`: the button already says « Section 5 sur 9 »

## Copy

| Key | French | English |
|---|---|---|
| `stay.nav.position` | Section {{ number }} sur {{ total }} : | Section {{ number }} of {{ total }}: |

« Sommaire » reuses the existing `stay.toc.label` text, now as a visible label too (a new key, `stay.nav.toggle`, with the same text, so the aria-label and the visible text can differ later if needed).

## Files

| File | Change |
|---|---|
| `src/app/pages/stay/stay-nav.ts` | Toggle button, progress line, `open` / `position` / `progress`, the closing triggers |
| `src/app/pages/stay/stay-nav.css` | The narrow presentation under the media query |
| `src/app/pages/stay/stay-nav.spec.ts` | Label, `aria-expanded`, the closing triggers, progress |
| `src/locale/messages.xlf`, `messages.en.xlf` | `stay.nav.position`, `stay.nav.toggle` |

## Changed during the build: focus clearance

Bolt 13 kept focused elements clear of the bar with `scroll-padding-top` on `html`. That also counted the bar's own area as hidden, so focusing the bar (tapping it, or tabbing onto a chip) scrolled the page about 410px up. Replaced by `scroll-margin-top: 5rem` on `.stay-section :is(a, button, [tabindex])` in `stay.css`: the same clearance for the content, none for the bar.
