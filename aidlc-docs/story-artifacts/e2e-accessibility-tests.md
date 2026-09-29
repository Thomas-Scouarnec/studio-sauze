# User Stories — End-to-End and Accessibility Tests

**Intent:** Add Playwright tests that run the real site in a browser, with AXE scans on every page, so accessibility and the key navigation flows are checked automatically instead of by hand at the end of each Bolt.

---

## US-1 — Run browser tests with one command

**As a** developer,
**I want** `npm run e2e` to build the site, serve it like GitHub Pages and run the Playwright tests,
**So that** I check what visitors actually get, in both languages, before deploying.

**Acceptance criteria:**
- `npm run e2e` exits with code 0 when every test passes, and with a non-zero code otherwise
- The tests run against the production build (French at `/`, English at `/en/`), not the dev server
- On a failure, an HTML report shows the failing step, a screenshot and a trace
- `npm test` (Vitest) is unchanged and does not pick up the Playwright files

---

## US-2 — Every page passes AXE

**As a** developer bound by the project's rule « it MUST pass all AXE checks »,
**I want** an AXE scan of every page, in both languages, on desktop and on a phone,
**So that** a new accessibility defect fails the tests the day it is introduced.

**Acceptance criteria:**
- Scanned: `/`, `/stay`, `/en/`, `/en/stay`, at 1280px and 375px
- Also scanned in their open state: the home menu (phone), the `/stay` section list (phone), the photo gallery
- Rules: WCAG 2.0, 2.1 and 2.2, levels A and AA, plus AXE best practices (the set used by hand since Bolt 9)
- The known `color-contrast` nodes are listed in one place, by page state and selector; any other violation fails the test, and so does a listed node that no longer fails (so the list only shrinks)

---

## US-3 — Key flows are covered

**As a** developer refactoring shared code,
**I want** the navigation built in Bolts 12 to 15 exercised in a real browser,
**So that** a regression shows up in the tests rather than on a guest's phone.

**Acceptance criteria:**
- Home, phone: the sticky bar opens its menu, a section jumps with its heading below the bar and focus on it, « Contact » is always there
- `/stay`, phone: the compact bar opens the list and a section jumps the same way
- `/stay`, desktop: the numbered chips mark the current section
- The flag switches from French to English and back
- A direct link to `/en/stay` opens in English

---

## US-4 — CI runs them on every push

**As a** developer,
**I want** GitHub Actions to run the Playwright tests on every push to `main` and on pull requests,
**So that** regressions are caught even when I forget to run them.

**Acceptance criteria:**
- A job next to the existing Vitest one in `.github/workflows/test.yml`
- The HTML report is uploaded as an artifact when the job fails
