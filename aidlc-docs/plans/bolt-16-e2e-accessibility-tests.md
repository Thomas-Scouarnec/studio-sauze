# Bolt 16 Plan — End-to-End and Accessibility Tests

**Intent:** Add Playwright tests and AXE scans that run the built site in Chromium, locally and in CI.
**Date:** 2026-09-29
**Status:** Implemented on 2026-09-29
**Stories:** [e2e-accessibility-tests.md](../story-artifacts/e2e-accessibility-tests.md) · **Design:** [design-artifacts/e2e-accessibility-tests.md](../design-artifacts/e2e-accessibility-tests.md)

---

## Known before the bolt

- **No browser tests in the repo.** Every Bolt since 9 was checked by hand in headless Chromium, with AXE run from throwaway scripts
- **Versions:** `@playwright/test` 1.63, `@axe-core/playwright` 4.13 (AXE 4.13; the hand checks used 4.10, so newer rules may report new findings)
- **Known AXE backlog:** 9 `color-contrast` nodes on the home page, 1 on `/stay` (Bolts 9 to 15)
- **Work on `main`,** as agreed in Session 15

## Steps

- [x] **Step 1 — Install and configure**
  - `@playwright/test` and `@axe-core/playwright` as dev dependencies; Chromium via `npx playwright install chromium`
  - `playwright.config.ts`, `e2e/tsconfig.json`, `scripts/serve-dist.mjs`, `npm run e2e` and `e2e:ui`
  - `.gitignore`: `/playwright-report`, `/test-results`
  - Gate: an empty smoke test loads `/` and `/en/` and passes; `npm test` still runs only the Vitest files

- [x] **Step 2 — AXE helper and first scan**
  - `e2e/axe.ts`, `e2e/accessibility.spec.ts` over the four pages × two projects
  - First run with an empty baseline; findings compared with the known backlog
  - Gate: anything beyond the known `color-contrast` nodes is reported to Thomas before going on

- [x] **Step 3 — Baseline**
  - `e2e/known-violations.ts` with the confirmed nodes
  - Scans of the open states: home menu (phone), `/stay` list (phone), gallery
  - Gate: all scans pass; removing one baseline entry makes its test fail, and adding a fake one does too

- [x] **Step 4 — Flow tests**
  - `home-nav.spec.ts`, `stay-nav.spec.ts`, `localization.spec.ts` (US-3)
  - Landmarks and links by role and accessible name (`getByRole`), so the tests also check what assistive technology sees; the menu buttons by `aria-controls`, the same in both languages
  - Gate: each test fails when the behaviour it covers is broken on purpose (checked once per test, then reverted)

- [x] **Step 5 — CI**
  - `e2e` job in `.github/workflows/test.yml`: Node 22, `npm ci`, `npx playwright install --with-deps chromium`, `npm run e2e`, report uploaded on failure
  - Gate: after Thomas pushes, both jobs green on GitHub

- [x] **Step 6 — Verify and record**
  - `npm test`; the whole suite three times in CI mode; `npm run e2e` from an empty `dist/`
  - Results in this plan; Session 16 closed in `prompts.md`; the README gets a « Tests » section

---

## NFRs

- TypeScript strict in `e2e/`, no `any`
- No new runtime dependency; the static server uses Node only
- Tests independent of each other and of order; no fixed `waitForTimeout`
- The whole `npm run e2e` under 3 minutes locally, build included

---

## Out of scope (deliberate)

- Fixing the `color-contrast` backlog (the accessibility Bolt, D3)
- WebKit and Firefox (D2)
- Visual regression screenshots
- Testing the live site after `npm run deploy`

---

## Risks

| Risk | Handling |
|---|---|
| AXE 4.13 finds more than 4.10 did | Step 2 gate: reported to Thomas, not silently baselined |
| Flaky scroll and sticky tests (smooth scrolling, observers) | `reducedMotion: 'reduce'` in the config; web-first assertions (`toBeFocused`, `toHaveAttribute`) that retry |
| Contrast measured before fonts or photos load | The helper waits for fonts and images |
| The build is slow for every run | `reuseExistingServer` locally; CI builds once per job |
| Windows locally, Linux in CI: font rendering differs | No screenshot comparison; layout checks use tolerances of a pixel |

---

**Bolt 16 implemented on 2026-09-29**, after Thomas approved the plan.

## Verification results

| Check | Result |
|---|---|
| Browser tests | 26 passing, 10 skipped by design (phone-only or desktop-only tests in the other project): 16 AXE scans, 10 flow tests |
| Stability | The whole suite 3 times in CI mode (`CI=1`, one retry allowed): 78/78 first time, no retry used |
| Duration | `npm run e2e` in 24 s locally with a warm Angular cache, build included |
| AXE 4.13 (first run, empty baseline) | Only `color-contrast`: the 9 known home nodes and the known `/stay` `.footer-copy`, the same in both languages and at both widths. Nothing new since the hand checks with 4.10 |
| Baseline gate | Removing an entry fails its test; adding a fake one fails it too |
| Mutation gate (each behaviour broken on purpose, then reverted) | Home offset set to 0, Escape not returning focus, focus after navigation removed, `/stay` offset set to 0, chips without `aria-current`, no `en/stay.html`, the English flag's `href` wrong: each caught by its test |
| Unit tests | `npm test`: 222 passing, unchanged; Vitest does not pick up `e2e/` |
| Types | `tsc -p e2e/tsconfig.json`: no error |
| CI (GitHub Actions) | Runs #23 (Bolt 16) and #24 (Bolt 17): `test` and `e2e` both green; `e2e` 1m 7s |

## Found and fixed during the build

- **Angular's generated attributes in AXE selectors.** axe names some nodes `.section-label[_ngcontent-ng-c683854846=""]`, an id that changes with the build. The helper strips `_ngcontent-…` / `_nghost-…` before comparing with the baseline
- **Two tests passed with their behaviour broken** (the mutation gate): the home jump checked the heading, which sits low in its section and stayed below the bar with no offset at all, so it now checks the section's top edge against the bar; the Escape test left focus on the button it had just clicked, so it now tabs into the list first
- **The English flag passed with a wrong `href`:** clicking it saves « English », and the saved choice redirects `/` to `/en/` anyway. The test now checks the link itself
- **A 1.27px miss that was the test's:** the sticky element is `app-home-nav`, 1px taller than its `nav` for the bottom border. Measured against the host, the section lands 0.27px below the bar (`offsetHeight` rounding), within the 1px tolerance
- **Hidden menu links are out of the accessibility tree,** so `aria-current` on a closed menu is checked through the link's fragment, not `getByRole`

## Noticed, not fixed here

- **`npm audit`** reported 34 vulnerabilities in the dependency tree, the same count as before the install. Fixed on 2026-09-29 (Angular 21.2.24 and `npm audit fix`): 0 left

## Left to Thomas

- ~~Push, then check both jobs~~ Done: runs #23 and #24 green, `e2e` in about 1 min on GitHub
- Try `npm run e2e:ui` to watch the tests run
