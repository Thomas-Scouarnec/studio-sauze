# Design — Search and Sharing

**Unit:** Search and Sharing
**Date:** 2026-10-01
**Stories:** [search-and-sharing.md](../story-artifacts/search-and-sharing.md) · **Spec:** [search-and-sharing.md](../functional-specs/search-and-sharing.md) · **Builds on:** [prerendering.md](prerendering.md) (Bolt 18), [localization.md](localization.md) (Bolt 12)

## Responsibility

Writes each page's `<head>` tags (description, Open Graph, canonical, alternates, robots) from the route that is shown, both while prerendering and in the browser. Adds the preview image and the two static files crawlers look for.

## What exists today

| Tag | Where | State |
|---|---|---|
| `<title>` | Route `title` (`app.routes.ts`), set by Angular's default `TitleStrategy` | Translated, per page. Kept |
| `hreflang` alternates | Static, in `src/index.html` | On every page, so the stay page declares the **home** page's alternates. Moved (D3) |
| `robots` `noindex` | `StayComponent` constructor, removed on destroy | Works. Moved (D2) |
| Description, Open Graph, canonical | — | Missing |
| `robots.txt`, `sitemap.xml` | — | Missing |

## How it works

Angular calls a `TitleStrategy` after every navigation, on the server while prerendering as in the browser. A subclass of the default one (`PageTagsStrategy`) sets the title as before, then the other tags, from the route's `data`:

```ts
// app.routes.ts
{
  path: '',
  component: HomeComponent,
  title: $localize`:@@route.home.title:Notre Refuge au Sauze`,
  data: { tags: { description: $localize`:@@seo.home.description:…`, indexed: true } },
}
```

```
navigation ends
  → PageTagsStrategy.updateTitle(snapshot)
      → super: <title>
      → Meta.updateTag: description, og:*, twitter:card, robots (or removeTag)
      → <link rel="canonical"> and hreflang <link>s: added, or removed when not indexed
```

`Meta` and `Title` already work on the server; the `<link>` elements are made through `DOCUMENT`, which works there too. Because it runs at each navigation, there is nothing to clean up in components, and nothing can be left behind (US-4).

## Decisions (approved)

| # | Decision | Why | Alternative |
|---|---|---|---|
| D1 | **A custom `TitleStrategy`** (`PageTagsStrategy`, provided in `app.config.ts`), with the tags in each route's `data` | One place for the whole `<head>`, next to the title it already handles; the route stays the single description of a page. A common Angular pattern worth knowing | A service subscribed to `NavigationEnd`; or each page component setting its own tags (the stay page's current way), which repeats itself and must clean up |
| D2 | **`noindex` moves from `StayComponent` to the route** (`indexed: false`) | Same mechanism for every head tag; removes the cleanup code the component needs today. Its unit test moves to the strategy's | Leave it in the component, beside the new mechanism |
| D3 | **`hreflang` moves from `index.html` to the strategy**, home pages only, per language | FR-8: the stay page should not declare the home page's alternates | Keep them static on every page |
| D4 | **The stay pages get a description and preview, no canonical** | A guest forwarding the link gets a preview (US-3); a canonical on a `noindex` page sends mixed signals | No tags at all on the stay page |
| D5 | **One preview image, from `sauze-winter-1600w.webp`,** cropped to 1200×630 and saved as `public/images/share/preview-1200x630.jpg` | The widest photo, already the site's winter picture; it shows the resort and the mountains, which reads at thumbnail size. The living-room photo is 4:3 and loses too much when cropped | The living-room photo; a picture made for the purpose (Thomas, later) |
| D6 | **Made once with `sharp` run through `npx` from the scratchpad, not added to the project** | A one-off conversion; the project needs no image tool after it | A dependency and a build step |
| D7 | **`robots.txt` and `sitemap.xml` hand-written in `public/`** | Two URLs, rarely changing; a generator would be more code than the files | Generate them from the routes at build time |
| D8 | **Angular copies `public/` into each language folder,** so `finish-static-build.mjs` removes `en/robots.txt` and `en/sitemap.xml` | Crawlers only read them at the root; copies under `/en/` would only puzzle | Leave the copies |
| D9 | **The site origin is one constant** (`SITE_ORIGIN = 'https://refugedusauze.com'`) | Absolute URLs (FR-5) need it; the prerendered page has no way to know its host | Read it from `location` (empty while prerendering) |
| D10 | **No `og:image` cache-busting suffix** | The image will rarely change; if it does, a new file name refreshes every platform's cache | `?v=` query strings |

## Copy (validated by Thomas, 2026-10-03)

Facts only from flat-info.md (FR-2). Lengths include spaces.

| Id | French | English |
|---|---|---|
| `seo.home.description` | Studio de montagne pour 5 personnes au Sauze, à 10 min de Barcelonnette : accès direct aux pistes l'hiver, aux sentiers de randonnée l'été. (139) | Mountain studio flat for 5 at Le Sauze, 10 minutes from Barcelonnette: direct access to the slopes in winter and hiking paths in summer. (136) |
| `seo.stay.description` | Le guide de votre séjour à Notre Refuge au Sauze : avant d'arriver, à l'arrivée, sur place et aux alentours. (108) | Your guide to staying at Notre Refuge au Sauze: before you come, on arrival, during your stay and around. (105) |
| `seo.image.alt` | La station du Sauze sous la neige, au pied des sommets enneigés de la vallée de l'Ubaye | Le Sauze ski resort under snow, below the snowy peaks of the Ubaye valley |

`og:title` reuses each route's title; `og:site_name` is « Notre Refuge au Sauze » in both languages (BR-2).

## Files

| File | Change |
|---|---|
| `src/app/page-tags.strategy.ts` (+ spec) | New: `PageTagsStrategy`, `PageTags` type, `SITE_ORIGIN` |
| `src/app/app.config.ts` | `{ provide: TitleStrategy, useClass: PageTagsStrategy }` |
| `src/app/app.routes.ts` | `data.tags` on both routes |
| `src/app/pages/stay/stay.ts` (+ spec) | `noindex` code and its test removed (D2) |
| `src/app/language-redirect.ts` (+ spec), `services/language.service.ts` | `languageOf()`, shared by `LanguageService` and the strategy (which cannot inject `LanguageService`: it needs the router, which creates the strategy) |
| `scripts/serve-dist.mjs` | Serves `.xml` as `application/xml`, like GitHub Pages |
| `src/index.html` | The three `hreflang` links removed (D3) |
| `src/locale/messages.xlf`, `messages.en.xlf` | Three new units |
| `public/robots.txt`, `public/sitemap.xml` | New |
| `public/images/share/preview-1200x630.jpg` | New |
| `scripts/finish-static-build.mjs` | Remove the `en/` copies (D8) |
| `e2e/search-and-sharing.spec.ts` | New: tags with JavaScript off on the 4 pages; tags after in-app navigation; `robots.txt`, `sitemap.xml` and the image served |
| `e2e/prerendering.spec.ts` | Its `noindex` check stays as is: the behaviour does not change |
| Specs | localization.md FR-13 points to search-and-sharing.md FR-8 |
