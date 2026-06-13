# User Stories — Vitest Unit Testing

**Intent:** Add unit tests and Vitest to the studio-sauze Angular project.

---

## US-1 — Test runner works

**As a** developer,
**I want** `npm test` to execute all `.spec.ts` files using Vitest,
**So that** I can verify code correctness locally.

**Acceptance criteria:**
- `npm test` exits with code 0 when all tests pass
- Output clearly shows test names and pass/fail status
- Uses Vitest (not Karma)

---

## US-2 — Reference service test

**As a** developer,
**I want** a working service with a `.spec.ts` test file,
**So that** I have a concrete template for writing future tests.

**Acceptance criteria:**
- A `FlatInfoService` exists with at least 3 testable properties
- Its `.spec.ts` covers all public properties/methods
- Tests use Vitest globals (`describe`, `it`, `expect`)

---

## US-3 — CI runs tests on every push

**As a** developer,
**I want** GitHub Actions to run the test suite on every push to `main`,
**So that** regressions are caught before they reach production.

**Acceptance criteria:**
- A `.github/workflows/test.yml` workflow exists
- It installs dependencies and runs `npm test`
- It runs on `push` to `main` and on pull requests
