# Bolt 26 Plan — Code Coverage

**Intent:** Measure the unit tests' code coverage in CI, show it on each run, and fail CI when it drops below a floor.
**Date:** 2026-10-04
**Status:** Implemented on 2026-10-04; in CI once pushed

---

## Known before the bolt

- **No coverage anywhere:** the `test` job runs `npm test`, which only passes or fails
- **Measured once by Claude** (2026-10-04, `@vitest/coverage-v8` 5.0.3 installed with `--no-save`, since removed): lines **97.3 %** (652/670), statements **97.6 %**, branches **92.5 %**, functions **88.9 %**
- **Angular's test builder supports it natively** (`@angular/build:unit-test`): `coverage`, `coverageInclude`, `coverageExclude`, `coverageReporters`, `coverageThresholds` in `angular.json`. Only the `@vitest/coverage-v8` package is missing
- **What the numbers mean here:**
  - Only unit tests count. The browser tests cover a lot more (`home.ts` shows 72 % of lines; its scrolling and menu are tested in Playwright)
  - Many components sit at 88.9 % of branches on one line (`about.ts:10`, `hero.ts:13`…): code the Angular compiler generates, not a missing test
  - The real gaps are few: `app.ts` (focus after navigation, 63 % of lines), `stay.service.ts` lines 221–231
  - `src/app/testing/` (a test helper) is counted, and should not be
- **Tooling Bolt:** no user-facing change, so no stories or spec (as Bolts 20, 21, 25)
- **Work on `main`,** as agreed in Session 15

## Decisions (approved)

| # | Decision | Why | Alternative |
|---|---|---|---|
| D1 | **`@vitest/coverage-v8` as a dev dependency,** the exact version of `vitest`; Dependabot's `testing` group gains `@vitest/*` | It must match Vitest exactly (a peer dependency); one group updates both together. Its own dependencies add no `npm audit` finding (checked) | `istanbul`: slower, needs code instrumentation |
| D2 | **`npm run test:coverage` for coverage; `npm test` unchanged** | `npm test` stays the fast loop you run while coding; coverage and its floors belong to CI, and to a check before pushing | Coverage on every `npm test`: slower, and a floor failing in watch mode while code is half-written |
| D3 | **Settings in `angular.json`:** only `src/app/**/*.ts` and templates; excluded: `*.spec.ts`, `src/app/testing/`, and (added at implementation) the five configuration files that only declare providers, `app.config.ts`, `app.config.server.ts`, `app.routes.server.ts`, `hydration.ts`, `hydration.development.ts`, which no unit test loads and the build and browser tests exercise; reporters: text summary (terminal), HTML (to browse), JSON summary (for CI) | The site's code only | A separate Vitest config file |
| D4 | **Floors, global, a few points under the measured figures** (set at Step 1, after the exclusion): about **95 %** lines and statements, **90 %** branches, **85 %** functions | Catches a new feature arriving without unit tests, without failing on a small refactor. Coverage does not vary between machines, unlike Lighthouse, so the margin can be small | Per-file floors: `home.ts` (72 %, tested in Playwright) would fail at once |
| D5 | **The `test` job runs `npm run test:coverage`;** the four figures on the run's summary page; the HTML report as an artifact (14 days) | Visible on each run, details one click away | Only the pass/fail |
| D6 | **No external service** (Codecov, Coveralls) | Needs an account and a token, and publishes the code's report; the summary page is enough for one developer | A badge in the README |
| D7 | **Browser tests not counted** | Measuring them needs an instrumented production build: slower, and a second build that is not the one deployed | Merge both coverages |

## Steps

- [x] **Step 1 — Coverage locally**
  - `@vitest/coverage-v8`, the `angular.json` settings (D3), `npm run test:coverage`; `coverage/` already in `.gitignore`
  - Gate: the figures within a point of the measurement above, `src/app/testing/` no longer listed; `npm audit` still 0
  - **Done:** lines 97.54 % (635/651), statements 97.74 %, branches 92.71 %, functions 89.51 %; 36 files. A first include of `src/app/**` also counted the CSS files (nothing to measure) and the configuration files at 0 %: narrowed (D3). `app.html` and `app.css`, empty leftovers of the first commit (« replaced by inline template/styles in app.ts »), deleted

- [x] **Step 2 — Floors**
  - `coverageThresholds` from Step 1's figures (D4)
  - Gate: a floor fails when broken on purpose (a spec file emptied; a new untested function), then passes again
  - **Floors:** lines and statements 95 %, branches 90 %, functions 85 %
  - **Done, with one finding.** `photo-gallery.spec.ts` removed: lines 90.8 %, functions 78.3 %, all four floors fail. **A small untested file** (8 lines, 3 functions) **passes:** lines 96.4 %, functions 87.7 %. Global floors absorb it; about 18 untested lines or 8 untested functions trip one. Kept as approved (D4), and said in the README

- [x] **Step 3 — CI**
  - `test` job: `npm run test:coverage`, the summary (a small script reading the JSON summary, as for Lighthouse), the HTML report uploaded; Dependabot group (D1)
  - Gate: after the push, the run green and the figures on its summary page (read by Thomas, since GitHub shows them only when signed in)

- [x] **Step 4 — Verify and record**
  - `npm test`, `npm run test:coverage`, `npm run lint`, `npm run format:check`, `npm run e2e`
  - README « Running unit tests » section: coverage, how to open the report, what to do when a floor fails; results in this plan; Session 26 closed in `prompts.md`

---

## Verification results

| Check | Result |
|---|---|
| `npm run test:coverage` | 232 tests passing, every floor met; the summary script prints the table |
| `npm test` | Unchanged: no coverage, about 4.5 s |
| Browser tests | 108 passing |
| Lint, format | Clean |
| `npm audit` | 0 vulnerabilities |
| CI | After the push: the figures on the run's summary page (Thomas, signed in) |

## NFRs

- `npm test` unchanged in speed and behaviour (D2)
- The `test` job a few seconds longer at most (it runs in parallel and is not the longest)
- `npm audit` stays at 0

---

## Out of scope (deliberate)

- **Writing tests for today's gaps** (`app.ts` focus handling, `stay.service.ts` 221–231): a later Bolt if wanted
- Coverage of the browser tests (D7)
- A coverage badge or an external service (D6)

---

## Risks

| Risk | Handling |
|---|---|
| A floor fails on a harmless refactor | Margins of 2 to 4 points (D4); lower one only with a reason, written next to it |
| Coverage taken as proof of quality | README: it shows which code ran, not that the tests checked the right result; the deliberate-break checks of each Bolt remain the stronger evidence |
| Vitest and the coverage package drift apart | One Dependabot group (D1); `npm ci` fails loudly if they mismatch |

---

## Left to Thomas

- ~~Approve the plan~~ Done
- After the push (Step 3): read the figures on the run's summary page
