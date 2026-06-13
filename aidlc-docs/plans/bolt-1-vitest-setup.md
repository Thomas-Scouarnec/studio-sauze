# Bolt 1 Plan — Vitest Setup

**Intent:** Add unit tests and Vitest to the studio-sauze Angular project.
**Date:** 2026-06-13

---

## Steps

- [x] **Step 1 — Configure angular.json**
  Wire up `@angular/build:unit-test` with `tsConfig: tsconfig.spec.json` and `runner: vitest`.
  Update the existing `app.spec.ts` to be Vitest-compatible if needed.

- [x] **Step 2 — Create FlatInfoService**
  Create `src/app/services/flat-info.service.ts` exposing flat metadata as signals.
  Create `src/app/services/flat-info.service.spec.ts` covering all public API.

- [x] **Step 3 — Add GitHub Actions CI**
  Create `.github/workflows/test.yml` that installs dependencies and runs `npm test` on push to `main` and on pull requests.

- [x] **Step 4 — Verify**
  7/7 tests pass. Vitest v4.1.6 running via `@angular/build:unit-test`.

---

## NFRs
- No coverage threshold (US-1 acceptance criteria)
- Tests must use Vitest globals, not Jasmine
- CI must use Node.js 22 (LTS as of 2026)
