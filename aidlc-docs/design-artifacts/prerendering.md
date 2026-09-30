# Design — Prerendering

**Unit:** Prerendering
**Date:** 2026-09-30
**Stories:** [prerendering.md](../story-artifacts/prerendering.md) · **Spec:** [localization.md](../functional-specs/localization.md) (FR-9 reworded) · **Builds on:** [localization.md](localization.md) (Bolt 12), [e2e-accessibility-tests.md](e2e-accessibility-tests.md) (Bolt 16)

## Responsibility

At build time, Angular runs the app once per page and language (on Node, not in a browser) and writes the resulting HTML. In the visitor's browser, the app then **hydrates**: it adopts the DOM that is already there, attaching listeners and state, instead of throwing it away and rendering again. Hosting does not change: the output is still plain files for GitHub Pages.

```
Today                                    After
index.html: <app-root></app-root>        index.html: the whole home page, as HTML
  → download JS → render everything        → painted at once
                                           → download JS → hydrate (adopt the DOM)
```

## Spike (2026-09-30, throwaway worktree, since deleted)

`ng add @angular/ssr` then switched to static output. Findings:

| Question | Answer |
|---|---|
| Works with the two language builds? | Yes: « Prerendered 4 static routes » — `index.html` and `stay/index.html` in `browser/` (`lang="fr"`, `<base href="/">`) and in `browser/en/` (`lang="en"`, `<base href="/en/">`) |
| Titles, `noindex`? | Translated `<title>` in each file; `noindex` in both `stay/index.html` |
| Does the current code run on the server? | Yes, no change needed: the build prerendered with no error. `localStorage` is already guarded by `try`/`catch`; observers and focus code already run in `afterNextRender`, which the server skips |
| Hydration? | Development build: « Angular hydrated 13 component(s) … 0 skipped » on `/`, 7 on `/stay`; no mismatch warning, also for a returning guest (« Mon séjour » added after hydration without error) |
| Existing tests? | 26/26 browser tests and AXE scans pass against the prerendered build; 222/222 unit tests |
| `/stay/` (GitHub Pages redirects `/stay` there when `stay/` is a folder) | The router normalises it back to `/stay`, but at the cost of a redirect on every direct visit |
| A client-only shell for `404.html`? | Angular also writes `index.csr.html`: the empty shell, right for the fallback |
| `ng add` side effects to undo | Adds `src/server.ts` and `outputMode: "server"` (a Node server: not for GitHub Pages); downgrades `@types/node` to `^20` |

## Decisions (proposed)

| # | Decision | Why | Alternative |
|---|---|---|---|
| D1 | **`outputMode: "static"`, every route prerendered** (`RenderMode.Prerender`) | The site is static; GitHub Pages cannot run Node | Server rendering: needs a host running Node |
| D2 | **Hydration with `withEventReplay()` and `withI18nSupport()`** | Event replay keeps a tap made before hydration finishes; i18n support is needed to hydrate `i18n` blocks instead of redrawing them | No hydration: Angular would destroy and redraw the prerendered DOM (a flash) |
| D3 | **Same URLs: `stay/index.html` becomes `stay.html`** after the build, in both languages | GitHub Pages serves `/stay` from `stay.html` with no redirect (proven in production by `/en/stay` since Bolt 12); a `stay/` folder would redirect `/stay` → `/stay/` first | Keep folders and accept the redirect and the trailing slash |
| D4 | **`404.html` from `index.csr.html`**, `ng deploy --no-notfound` | Unknown URLs get the empty shell, which routes client-side as today. `angular-cli-ghpages` would otherwise copy the prerendered **home** page as `404.html`, then hydrate it at the wrong URL | Its default `404.html` |
| D5 | **The language redirect moves to an inline `<script>` in `index.html`'s `<head>`** | With prerendering, French HTML paints before `main.js` runs, so today's redirect in `main.ts` would show French first (FR-9 broken). A blocking script in `<head>` runs before the body is parsed. It only reads the path, so the same script works in both builds | Keep it in `main.ts` and accept a French flash |
| D6 | **The browser tests run against the prerendered build**, plus new checks: content with JavaScript off, no console error during hydration, the redirect with the app's JavaScript blocked | They already serve `dist/` like GitHub Pages | Only the existing tests |
| D7 | **Dev servers stay client-rendered** if `ng serve` with a server entry breaks `start:all`'s proxy | Development speed and the two-server setup matter more than SSR in dev | SSR in dev |

## Files

| File | Change |
|---|---|
| `angular.json` | `server: src/main.server.ts`, `outputMode: "static"`; deploy `noNotfound` |
| `src/main.server.ts`, `src/app/app.config.server.ts`, `src/app/app.routes.server.ts` | New (from `ng add`): server bootstrap and « prerender every route » |
| `src/app/app.config.ts` | `provideClientHydration(withEventReplay(), withI18nSupport())` |
| `src/index.html` | Inline language redirect in `<head>` (D5) |
| `src/main.ts` | Redirect removed; bootstrap only |
| `src/app/language-redirect.ts` (+ spec) | `resolveLanguageRedirect` removed (its logic now in the inline script); `languageUrl`, `readSavedLanguage` stay |
| `scripts/i18n-deep-links.mjs` → `scripts/finish-static-build.mjs` | Flattens `stay/index.html` → `stay.html` in both languages (D3); writes `404.html` from `index.csr.html` (D4) |
| `package.json` | `deploy` runs the new script; `@angular/ssr` (21.2.24) added; `@types/node` kept at `^24` |
| `scripts/serve-dist.mjs` | Unknown paths answered with `404.html` (as GitHub Pages does) |
| `playwright.config.ts` | `webServer` runs the new script |
| `e2e/prerendering.spec.ts` | New checks (D6) |
| `README.md` | « Prerendering » section |

## The inline redirect (D5)

About ten lines of plain JavaScript, no `import`, no dependency:

1. Read `localStorage['refuge.lang']` inside `try`/`catch` (BR-6)
2. If it is `en` and the path is neither `/en` nor under `/en/`: `location.replace('/en' + path + search + hash)`

The same rules as `resolveLanguageRedirect` today, which stops being needed: in the English build the path is always under `/en/`, so the script does nothing.

## Server-safety rules (for the README)

Code that runs while prerendering has no `window`, `document`, `localStorage` or `IntersectionObserver`:
- Browser-only work goes in `afterNextRender()` / `afterRenderEffect()` (they never run on the server), or behind `isPlatformBrowser()`
- Storage stays in `try`/`catch` (already the case)
- Anything that differs between server and browser at first render must not change the HTML structure before hydration; the spike found no such case today

## Not in this Bolt

- Meta description, Open Graph tags, `schema.org` data, `sitemap.xml` (idea 2, a separate Bolt, which prerendering makes worthwhile)
- A real « page not found » page (idea 7)

## Changed during the build (Bolt 18)

- **D7 applied: the dev servers render in the browser only.** With a server entry, `ng serve` rendered each page on the server with Angular's default `LOCALE_ID` (`en-US`), so the language switcher treated the French pages as English. The development configurations set `"server": false`, and swap `src/app/hydration.ts` for `hydration.development.ts` (no hydration providers) through `fileReplacements`, since asking for hydration without server HTML logs NG0505 on every reload
- **Hydration providers live in `src/app/hydration.ts`,** not directly in `app.config.ts`, for that swap
- **`readSavedLanguage` removed too,** not only `resolveLanguageRedirect`: `main.ts` was its only user. `languageUrl` and `LANGUAGE_STORAGE_KEY` stay
- **`finish-static-build.mjs` refuses to run on a build without prerendered pages,** so neither `npm run deploy` nor `npm run e2e` can go on with empty shells (found with the mutation gate: the tests' server otherwise waited 5 minutes)
- **`serve-dist.mjs` redirects a folder without its trailing slash (301), as GitHub Pages does,** so a return of `stay/index.html` shows up in the tests as a redirect
- **`@angular/platform-server` is a dependency too** (installed by `ng add` with `@angular/ssr`)
