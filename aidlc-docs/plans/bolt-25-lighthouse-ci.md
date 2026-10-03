# Bolt 25 Plan — Lighthouse CI

**Intent:** Audit every page with Lighthouse on each push, and fail CI (so no deploy) when a score drops below an agreed floor. Idea 8 of Session 18, the last one.
**Date:** 2026-10-03
**Status:** Implemented on 2026-10-03; the floors are live once CI passes on the push of this commit

---

## Known before the bolt

- **CI today:** `lint`, `test`, `e2e` jobs; `deploy` needs all three (Bolt 21). Nothing watches speed or the SEO basics over time
- **Tooling Bolt:** no user-facing change, so no stories or functional spec (as Bolts 1, 20, 21)
- **Work on `main`,** as agreed in Session 15

## Measurements (2026-10-03, `@lhci/cli` 0.15.1, Lighthouse 12.6.1, phone profile, 3 runs, median)

| Page | Local build (`serve-dist.mjs`, no compression) | Live site (refugedusauze.com) |
|---|---|---|
| `/` | Perf 75 · A11y 100 · BP 100 · SEO 100 | Perf 95 · 100 · 100 · 100 |
| `/stay` | Perf 79 · 100 · 100 · SEO 63 | Perf 96 · 100 · 100 · SEO 63 |
| `/en/` | Perf 68 · 100 · 100 · 100 | Perf 87 · 100 · 100 · 100 |
| `/en/stay` | Perf 74 · 100 · 100 · SEO 63 | Perf 95 · 100 · 100 · SEO 63 |
| `/404` | — | Perf 99 · 100 · 100 · SEO 54 |

What the numbers say:

- **Accessibility and best practices are 100 everywhere.**
- **SEO is 100 on the indexed pages.** The others lose points only for what they do on purpose: `noindex` (« is-crawlable ») on the stay and 404 pages, and no description on the 404 page (not-found.md FR-7)
- **Local speed is about 20 points under the live one,** mostly because `serve-dist.mjs` sends files uncompressed (Lighthouse: 286 KiB to save by compression), where GitHub Pages compresses them. A floor measured that way would be measuring the test server
- **Lighthouse refuses a page served with status 404,** so `/nowhere` cannot be audited. The same page at `/404` (status 200) can
- **`/en/` is the slowest page** (87 live), consistently below `/` (95). Its largest element is the hero title, as on `/`; not investigated here

## Decisions

| # | Decision | Why | Alternative |
|---|---|---|---|
| D1 | **`@lhci/cli` 0.15.1 run through `npx`** (changed at implementation: as a dev dependency, its own dependencies brought 14 `npm audit` findings, 11 high, where the project had 0), config in `lighthouserc.cjs`, `npm run lighthouse` to run it locally | Google's official runner: several runs per page, median, assertions, reports | Lighthouse alone, with a hand-written script to compare scores |
| D2 | **A `lighthouse` CI job beside `e2e`, and `deploy` needs it** | A drop below the floor stops the deploy, as a failing test does; parallel, so the run is no longer than today | Report only, never blocking: easy to ignore |
| D3 | **The job builds the site itself** (`ng build` + `finish-static-build.mjs`), and serves it with `serve-dist.mjs` | Same build steps as `e2e`, independent of it; about 1 minute | Reuse the `e2e` job's Pages artifact: only exists on `main` |
| D4 | **`serve-dist.mjs` compresses text files (gzip), as GitHub Pages does** | Local scores then match production; the browser tests also get closer to the real site | Measure uncompressed and set lower floors, which would no longer catch a real regression |
| D5 | **Pages audited:** `/`, `/stay`, `/en/`, `/en/stay`, `/404` | Every page and both languages; `/404` because Lighthouse refuses a 404 status | The French pages only |
| D6 | **Floors:** accessibility, best practices and SEO **100**; performance **set from GitHub's own runners** (Step 2), a few points under the lowest median seen, expected around 85. **Set to 80** after the three runs (lowest median 86, on `/en/`, which varied from 86 to 94). **Added at implementation: at most 1 MiB per page** (`total-byte-weight`), because the performance score barely moves for a heavy photo below the first screen | A11y, BP and SEO are deterministic: anything under 100 is a real change. Speed varies with the machine, so its floor needs margin or CI fails at random | One floor for everything; performance as a warning only |
| D7 | **Deliberate failures excluded, page by page:** « is-crawlable » on `/stay`, `/en/stay`, `/404`; « meta-description » on `/404` | They are the specs (stay.md FR-3, not-found.md FR-7); every other SEO audit still applies there | Lower the SEO floor on those pages, which would hide a real loss |
| D8 | **Reports kept as a CI artifact** (14 days), uploaded every run | Opening the report shows which audit fell and why | `temporary-public-storage`: a public link to reports that include the guest page's content |
| D9 | **Chrome: the one preinstalled on GitHub's Ubuntu runners;** locally, the installed Chrome or `CHROME_PATH` | Nothing to install in CI | Playwright's Chromium |

## Steps

- [x] **Step 1 — Compression in `serve-dist.mjs`**
  - gzip for HTML, JS, CSS, JSON, SVG, XML, text, when the browser asks for it (`Accept-Encoding`)
  - Gate: `npm run e2e` passes unchanged; local performance scores close to the live ones (within about 10 points)
  - **Done:** 108/108 browser tests; local performance now 93, 96, 86, 93, 97 (`/`, `/stay`, `/en/`, `/en/stay`, `/404`) against 95, 96, 87, 95, 99 live, and the three runs of each page within 1 point

- [x] **Step 2 — Lighthouse CI, measured on GitHub**
  - `@lhci/cli`, `lighthouserc.cjs` (D5, D7), `npm run lighthouse`, `.lighthouseci/` (its local reports) in `.gitignore`; the `lighthouse` job, first in report-only mode, run 3 times on GitHub (`workflow_dispatch`) to see the runners' scores
  - Gate: the three runs complete; their performance medians recorded here
  - **Run #14** (push of `59e16f2`, 2026-10-03; read by Thomas, since GitHub shows job summaries only when signed in). Performance median (every run): `/` 94 (91, 94, 94) · `/stay` 97 (97, 97, 97) · `/en/` 89 (93, 90, 89) · `/en/stay` 93 (97, 93, 93) · `/404` 97 (97, 97, 97). Accessibility and best practices 100, SEO 100 on the indexed pages. The job took 3 min 30 s, the longest: the CI run grew from about 2 to 3.5 minutes, against the NFR
  - **Runs #15, #16** (started by Thomas from the Actions tab): `/` 94 (88, 94, 94) and 93 (93, 94, 93) · `/stay` 97 (96, 96, 97) and 97 (97, 97, 97) · `/en/` 86 (93, 86, 86) and 94 (94, 94, 94) · `/en/stay` 93 (91, 97, 93) and 93 (93, 97, 93) · `/404` 97 (96, 97, 97) and 97 (97, 97, 97). Accessibility, best practices 100 in all three runs
  - **Lowest median: 86** (`/en/`, run #15); single runs from 86 to 97

- [x] **Step 3 — Floors and the deploy gate**
  - Assertions (D6) with the performance floor from Step 2; `deploy` needs `lighthouse`
  - Gate: each floor fails when broken on purpose (a large unresized image on `/`; `noindex` on the home page; a missing `alt`), then passes again
  - **Done, with one change.** `noindex` on the home pages: SEO 58, caught. An image without `alt` on every page: accessibility 94–95 and `image-alt` 0, caught. **A 27 MB image was not caught:** the performance score stayed at 86–97, because the image was not the largest element of the first screen (the hero title is) and the score measures the first screen. Hence the 1 MiB page-weight floor. Then a 2.6 MB photo and a 1.5 MB render-blocking script (a « heavy library »): page weight 3.0–3.4 MB and performance 36–66, both caught on every page

- [x] **Step 4 — Verify and record**
  - `npm test`, `npm run lint`, `npm run format:check`, `npm run e2e`, `npm run lighthouse`
  - README « Lighthouse » section (what the floors are, how to read a report, what to do when one fails); results in this plan; Session 25 closed in `prompts.md`

---

## Verification results

| Check | Result |
|---|---|
| `npm run lighthouse` (clean code) | All floors pass on the machine at full speed (performance 86–97, weight 222–590 KiB) |
| Unit tests | 232 passing, unchanged |
| Browser tests | 108 passing, unchanged, with compression on |
| Lint, format | Clean |
| `npm audit` | 0 vulnerabilities (`@lhci/cli` through `npx`, D1) |
| CI duration | About 3.5 minutes (was 2): the `lighthouse` job is the longest. **Against the NFR**; 2 runs per page instead of 3 would save about a minute, at the cost of a less stable median |

## Found along the way

- **GitHub shows job summaries and logs only to signed-in visitors,** even on a public repository: Thomas read the scores; Claude cannot without his login
- **Lighthouse refuses pages served with status 404** (D5)
- **The performance score ignores a heavy image below the first screen:** page weight is now checked on its own
- **On battery, this laptop's processor ran ten times slower** (Lighthouse « benchmarkIndex » about 310, against 3,300 plugged in): local performance fell to 73–85 and two floors failed, on unchanged code. Documented in the README; CI is what counts
- **`@lhci/cli` as a dev dependency brought 14 `npm audit` findings** (11 high): run through `npx` instead (D1)

## NFRs

- CI run no longer than today (the job runs in parallel with `e2e`)
- No change to the site itself, apart from what a failing floor reveals
- No report published outside the repository (D8)

---

## Out of scope (deliberate)

- **Improving the scores.** Opportunities seen, for a later Bolt if wanted: unused JavaScript (about 100 KiB per page), home-page photos larger than displayed (about 120 KiB), `/en/` slower than `/`. Cache lifetimes are GitHub Pages' (10 minutes) and cannot be changed
- Real-visitor measurements (field data): too little traffic for Google to report
- Desktop profile: the phone profile is the stricter one

---

## Risks

| Risk | Handling |
|---|---|
| Performance varies between runners and CI fails at random | Floor from GitHub's own runs with margin (D6); median of 3; if it still flaps, lower it or make it a warning (decided with Thomas) |
| A Lighthouse update changes the scoring | `@lhci/cli` pinned through the lockfile; Dependabot updates arrive as their own PRs, where CI shows the effect |
| The guest page's content in the reports | Reports stay in the repository's CI artifacts (D8) |
| Compression changes the browser tests' behaviour | Step 1's gate: the whole suite unchanged |

---

## Left to Thomas

- ~~Approve the plan~~ Done; ~~runs #15 and #16~~ Done
- After the push of this commit: check that CI is green and the site deployed (the run's summary shows the scores)
