# Design — Page Not Found

**Unit:** Page Not Found
**Date:** 2026-10-03
**Stories:** [not-found.md](../story-artifacts/not-found.md) · **Spec:** [not-found.md](../functional-specs/not-found.md) · **Builds on:** [prerendering.md](prerendering.md) (Bolt 18), [search-and-sharing.md](search-and-sharing.md) (Bolt 23)

## Responsibility

A lazy-loaded `NotFoundComponent`, shown by the router for any unknown path, and prerendered into the `404.html` that GitHub Pages answers unknown addresses with.

## What exists today

| Piece | Behaviour |
|---|---|
| `app.routes.ts` | `{ path: '**', redirectTo: '' }`: any unknown path becomes the home page (stay.md FR-12) |
| `404.html` | Written by `finish-static-build.mjs` from `index.csr.html`, the empty client-side shell: blank until the JavaScript loads, then the router redirects to `/` |
| GitHub Pages | Answers any missing file with the root `404.html` and status 404, including under `/en/`; the address bar keeps the address |

So today a broken link shows a blank page, then the home page at `/`, and the visitor cannot tell anything went wrong.

## Spike (2026-10-03, throwaway worktree, since deleted)

| Question | Answer |
|---|---|
| Can the `**` route be prerendered? | No: « Prerendered 4 static routes », the wildcard has no address to render at |
| A real route rendering the same component? | Yes: a `not-found` route was prerendered in both languages (6 routes) |
| That HTML used as `404.html`, opened at `/nowhere`, `/a/b/c`, `/stay/oops`? | Status 404, address kept, the page shown at once; hydration adopts the prerendered `<h1>` (same DOM node) with no error. The router matches `**`, which renders the same component, so the DOM is the same |
| `/en/nowhere`? | The French page: GitHub Pages only serves the root `404.html` |

## How it works

```
/nowhere            → GitHub Pages: 404.html (status 404)
                       = the prerendered French page of the « 404 » route
                       → hydrates; the router matches **, same component

/en/nowhere         → 404.html (French), whose first script sees /en/
                       → location.replace('/en/404') → en/404.html, English (D3)

/nowhere + saved EN → the FR-9 script (every page) → /en/nowhere → as above
```

## Decisions (approved; D3: the redirect)

| # | Decision | Why | Alternative |
|---|---|---|---|
| D1 | **`**` renders `NotFoundComponent` instead of redirecting,** lazy-loaded like the stay page | The address stays; the component costs nothing to visitors who never meet it | Keep the redirect (the problem itself) |
| D2 | **A `404` route renders the same component, prerendered;** `finish-static-build.mjs` turns its `404/index.html` into `404.html` (the step that already flattens `stay/`) and stops copying `index.csr.html` | The page reads at once and without JavaScript, like every other page (FR-8); the spike shows it hydrates cleanly at any address | Keep the empty shell as `404.html`: blank until the JavaScript loads |
| D3 | **English: the root `404.html` sends `/en/…` to `/en/404`,** through a one-line script that `finish-static-build.mjs` writes first in its `<head>`, before anything paints | GitHub Pages serves one `404.html`. The redirect gives the full English page, navbar and title included. The address shown becomes `/en/404`, losing the one asked for | **A bilingual page** (French and English text on the one French page, the English part `lang="en"`): no redirect, the address stays, but the navbar and title stay French for English visitors |
| D4 | **No `data.tags` on these routes:** `PageTagsStrategy` already treats a route without tags as `noindex`, with no description, canonical or alternates | FR-7 for free | Explicit tags |
| D5 | **The page looks like the stay page:** the same dark banner with the navbar and the heading, then a light content area | The navbar's light text needs the dark background; the site keeps one look for its inner pages | A page of its own design |
| D6 | **The banner's styles move from `stay.css` to `styles.css`** as `.page-banner`, `.page-banner-bg`, `.page-title`, used by both pages | One banner, not two copies that drift. Gate: the stay page pixel-identical before and after | Copy the 25 lines into the new page |
| D7 | **Focus is already handled:** `App` moves focus to the `<h1>` after an in-app navigation | Nothing to add; tested | — |

## Copy (validated by Thomas, 2026-10-03)

| Id | French | English |
|---|---|---|
| `route.notFound.title` | Page introuvable — Notre Refuge au Sauze | Page not found — Notre Refuge au Sauze |
| `notFound.title` (h1) | Page introuvable | Page not found |
| `notFound.text` | Cette adresse ne mène à aucune page du site : le lien est peut-être ancien, ou mal recopié. | This address does not lead to any page of the site: the link may be old, or mistyped. |
| `notFound.home` | Retour à l'accueil | Back to the home page |

## Files

| File | Change |
|---|---|
| `src/app/pages/not-found/not-found.ts`, `.html`, `.css` (+ spec) | New: banner with navbar and heading; the sentence and the home link |
| `src/app/app.routes.ts` (+ spec) | `404` and `**` routes to `NotFoundComponent`, with the title; the redirect removed |
| `src/styles.css`, `src/app/pages/stay/stay.html`, `stay.css` | The banner classes shared (D6) |
| `src/locale/messages.xlf`, `messages.en.xlf` | Four new units |
| `scripts/finish-static-build.mjs` | `404/index.html` → `404.html` in both languages, `index.csr.html` no longer copied; the `/en/` script written into the root `404.html` (D3) |
| `e2e/not-found.spec.ts` | New: status, address kept, content with JavaScript off, both languages, saved English, the home link, hydration without error |
| `e2e/prerendering.spec.ts` | « an unknown address gets a 404, then the home page » replaced by the new spec |
| `e2e/accessibility.spec.ts` | AXE on `/nowhere` and `/en/nowhere` |
| Specs | stay.md FR-12 points to not-found.md |
