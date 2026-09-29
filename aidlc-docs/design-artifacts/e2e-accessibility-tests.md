# Design — End-to-End and Accessibility Tests

**Unit:** E2E and Accessibility Tests
**Date:** 2026-09-29
**Stories:** [e2e-accessibility-tests.md](../story-artifacts/e2e-accessibility-tests.md) · **Builds on:** [bolt-1-vitest-setup.md](../plans/bolt-1-vitest-setup.md) (unit tests and CI)

## Responsibility

A second test layer, beside Vitest: Playwright drives Chromium through the built site, and `@axe-core/playwright` scans each page. Vitest keeps testing components in isolation; Playwright tests what the two together cannot: real layout, sticky positioning, scrolling, routing across the two language builds, and AXE on the rendered page.

## Decisions (proposed)

| # | Decision | Why | Alternative |
|---|---|---|---|
| D1 | **Test the production build**, served by a small script that behaves like GitHub Pages | Checks what is deployed: both language builds, `/en/stay` deep links, hashed assets. Same approach as the Bolt 12 verification | The dev servers (`npm run start:all`): faster to start, but not what visitors get, and known to crash when a translation is missing |
| D2 | **Chromium only**, two projects: « desktop » (1280×800) and « phone » (375×812, touch, mobile user agent) | The widths every Bolt has been checked at; one browser keeps CI short | Add WebKit (closest to Safari on iPhone) later, as one more project in the config |
| D3 | **Known `color-contrast` nodes as an explicit baseline**, in `e2e/known-violations.ts` | The tests go green now and stop any new defect; the contrast fixes are a design change (colours) that belongs to the accessibility Bolt | Fix the 9 nodes in this Bolt first, and assert zero violations |
| D4 | **A baseline node that stops failing fails the test** | The list can only shrink; fixing a colour forces removing its entry | A baseline that tolerates stale entries |
| D5 | **Tests in `e2e/`** at the root, `*.spec.ts`, own `tsconfig.json` | Outside `src/`, so Vitest's `tsconfig.spec.json` (`src/**/*.spec.ts`) never sees them | `*.e2e.ts` inside `src/` |
| D6 | **A separate CI job** in `test.yml`, Chromium installed with `npx playwright install --with-deps chromium` | Unit and browser tests fail independently and in parallel | One job running both |
| D7 | **Smoke tests, not a copy of the unit tests** | Only what needs a real browser: layout, scroll, focus, routing | Re-testing component logic in the browser |

## Files

```
e2e/
  tsconfig.json            Playwright types, Node, strict
  axe.ts                   scan(page, name): runs AXE, compares with the baseline
  known-violations.ts      the color-contrast baseline, by page and selector
  accessibility.spec.ts    AXE on every page × project, closed and open states
  home-nav.spec.ts         the home sticky bar (phone)
  stay-nav.spec.ts         the /stay chips (desktop) and compact bar (phone)
  localization.spec.ts     the flags, and /en/stay opened directly
playwright.config.ts       projects, webServer, report, trace on first retry
scripts/serve-dist.mjs     static server for dist/studio-sauze/browser
```

## `scripts/serve-dist.mjs` — like GitHub Pages

A Node `http` server, no dependency, on port 4300 (away from the dev servers' 4200 and 4201).

| Request | Answer |
|---|---|
| An existing file | The file, with its content type |
| A folder (`/`, `/en/`) | Its `index.html` |
| An extensionless path with a `.html` file (`/en/stay`) | That file (written by `i18n-deep-links.mjs`) |
| Anything else (`/stay`) | The root `index.html` with status 404, like the `404.html` copy `angular-cli-ghpages` publishes |

## `playwright.config.ts`

- `webServer`: `npm run build && node scripts/i18n-deep-links.mjs && node scripts/serve-dist.mjs`, `reuseExistingServer` locally (a server started by hand with `node scripts/serve-dist.mjs` is reused, and the build skipped), a build-sized timeout
- `baseURL`: `http://localhost:4300`
- `projects`: « desktop » and « phone » (D2); spec files that only make sense at one width say so with `test.skip` on the project name
- `retries`: 1 in CI, 0 locally; `trace: 'on-first-retry'`; `screenshot: 'only-on-failure'`
- `reporter`: `list` in the terminal, plus `html` (never opened automatically)

## AXE helper — `e2e/axe.ts`

```ts
await scan(page, 'home');                   // closed state
await scan(page, 'home, menu open');        // after opening the menu
```

- `AxeBuilder` with tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, `best-practice`
- Each violation becomes `rule + target selector`; the helper asserts that the set equals the baseline entries for that page name (D3, D4), and prints the rule, help URL and HTML of anything unexpected, so the report says what to fix
- Waits for fonts and images before scanning (`document.fonts.ready`, no pending `<img>`), so contrast is measured on the final rendering

## Baseline — `e2e/known-violations.ts`

Filled from a first run, then checked against the 9 home nodes (`.section-label`, `.stat-label`, `.footer-copy`) and the one `/stay` node (`.footer-copy`) recorded since Bolt 10. Anything else found on that first run is reported to Thomas before being either fixed or added.

## New npm scripts

| Script | Does |
|---|---|
| `npm run e2e` | Build, serve, run all Playwright tests |
| `npm run e2e:ui` | Playwright's UI mode, to watch and step through tests while learning |

## Not changed

- `npm test`, Vitest, the `test` CI job
- `.claude/launch.json` and `npm run start:all`
- `npm run deploy` (it does not run the browser tests; CI does)
