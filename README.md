# StudioSauze

Showcase website for a mountain studio rental located at Le Sauze, in the Alpes de Haute-Provence (French Alps). Built with Angular, it presents the property, seasonal activities (skiing in winter, hiking and MTB in summer), and contact information.

## GitHub repository
https://github.com/Thomas-Scouarnec/studio-sauze

## Production url
https://refugedusauze.com/

## TO DO
- More languages (ES, IT...): see *Localization* below
- Add unit tests
- Update content
    - Photos
    - Description
- add altitude (1450m) in main description
- should we support pets?


# Development

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

`ng serve` builds one language at a time, so there are three ways to run the site:

| Command | Serves | Flags |
|---|---|---|
| `npm start` | French at `http://localhost:4200/` | The British flag leads nowhere |
| `npm run start:en` | English at `http://localhost:4201/en/` | The French flag leads nowhere |
| `npm run start:all` | Both: French at `http://localhost:4200/`, which forwards `/en/*` to the English server | **Work, as in production** |

`start:all` runs two dev servers (`scripts/start-all.mjs`); Ctrl+C stops both. Browse port 4200. `proxy.conf.json` forwards `/en` from the French server to the English one; `proxy.en.conf.json` lets the English server answer the absolute `/images/…` photo URLs.

## Localization

The site is in French (the source language, served at `/`) and English (served at `/en/`), with Angular's built-in i18n (`@angular/localize`). `ng build` compiles one app per language: `dist/studio-sauze/browser/` and `dist/studio-sauze/browser/en/`.

- **Marking a text:** `i18n="@@area.key"` on an element in a template, `i18n-alt` / `i18n-aria-label` for attributes, and ``$localize`:@@area.key:Texte` `` in TypeScript. Always give a custom `@@` id, so the English stays attached when the French is reworded.
- **Extracting:** `npm run extract-i18n` rewrites `src/locale/messages.xlf` (XLIFF 1.2), the list of every French text. After changing French copy, `git diff src/locale/messages.xlf` shows which ids changed.
- **Translating:** add or update the matching `<trans-unit>` in `src/locale/messages.en.xlf`, with a `<target>`. Keep every `<x id="…"/>` placeholder of the source in the target.
- **Missing translations fail the build** (`i18nMissingTranslation: "error"`), naming the id.
- **The visitor's choice** of language is saved in `localStorage` (`refuge.lang`). A visitor who chose English and opens a French URL is sent to `/en/…` by a small inline script in `src/index.html`, before the prerendered French page can paint.

## Fonts

Playfair Display (headings) and Jost (text) are served from the site itself, not from Google Fonts: the `@fontsource/playfair-display` and `@fontsource/jost` packages, listed in `angular.json` `styles`. Only the faces used, latin subset only: Playfair Display 400, 400 italic, 600; Jost 300, 400, 500. The build copies them to `media/` with hashed names.

- **Adding a weight or style:** add its `latin-<weight>[-italic].css` file to `styles` in `angular.json`, and to `FACES` in `e2e/fonts.spec.ts`, which checks that nothing else loads and that no page calls Google.
- **Headings ask for bold (700) and get 600,** the heaviest Playfair face loaded. Adding 700 would make every heading heavier.

## Search and link previews

Each page's `<head>` (title, description, Open Graph preview tags, canonical link, `hreflang` alternates, `noindex`) is written by `PageTagsStrategy` (`src/app/page-tags.strategy.ts`), after every navigation and while prerendering, from the route's `data.tags` in `src/app/app.routes.ts`. Rules in `aidlc-docs/functional-specs/search-and-sharing.md`.

- **Adding a page:** give its route a `title` and `data.tags` (`description` of at most 160 characters, `indexed`). An indexed page also belongs in `public/sitemap.xml`.
- **The preview image** is `public/images/share/preview-1200x630.jpg`, for every page. If it changes, give it a new file name: WhatsApp and Facebook keep old previews for weeks.
- **`robots.txt` and `sitemap.xml`** live in `public/`, and are kept at the root only by `finish-static-build.mjs`. Neither names `/stay`, which must stay unlisted.
- **Checking a preview after deploying:** share the link in a WhatsApp chat, or use Facebook's Sharing Debugger, which also refreshes its cache.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Prerendering

`ng build` does not only compile the app: it also **runs** it once per page and language, on Node, and saves the resulting HTML (`outputMode: "static"`, every route `RenderMode.Prerender` in `src/app/app.routes.server.ts`). Visitors, search engines and link previews get the finished page at once. In the browser, the app then **hydrates**: it adopts the HTML already on screen instead of drawing it again (`src/app/hydration.ts`).

- **Code that runs while prerendering has no `window`, `document`, `localStorage` or `IntersectionObserver`.** Put browser-only work in `afterNextRender()` / `afterRenderEffect()` (never run on the server), or behind `isPlatformBrowser()`; keep storage in `try`/`catch`. Breaking this fails the build, which is the point.
- **The first render must be the same on the server and in the browser**, or hydration reports a mismatch (NG0500). Something that depends on the visitor (a stored flag, the screen size) must not change the page's structure before hydration; it can change it afterwards.
- **After `ng build`, run `node scripts/finish-static-build.mjs`** (CI's `e2e` job and `npm run e2e` do): it moves `stay/index.html` to `stay.html` so GitHub Pages serves `/stay` without a redirect, turns the prerendered `404` route into `404.html` (see below), and removes the `en/` copies of `robots.txt` and `sitemap.xml`.
- **The dev servers do not prerender** (`"server": false` in the development configurations, and `hydration.development.ts` replaces `hydration.ts`): they render in the browser, as before. `npm run e2e` is where prerendering is tested.
- **Unknown addresses** get the « page not found » page (`src/app/pages/not-found/`), with status 404 and the address kept. Angular cannot prerender the `**` route, so a `404` route renders the same page and becomes `404.html`. GitHub Pages only serves the root one, the French page: a script that `finish-static-build.mjs` writes first in its `<head>` sends `/en/…` addresses to the English page at `/en/404`. The page must not show anything that depends on the address, or hydrating it elsewhere would not match.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

### Coverage

```bash
npm run test:coverage
```

Runs the unit tests once with coverage: which share of the site's code ran during them. It prints the four figures, writes a report to `coverage/studio-sauze/` (open its `index.html` to see each file, line by line), and fails under the floors set in `angular.json` (`coverageThresholds`). `npm test` stays without coverage, for the fast loop while coding.

- **Floors:** lines and statements 95 %, branches 90 %, functions 85 %, for the whole code (October 2026: 97.5, 97.7, 92.7, 89.5). A component arriving without tests fails them; a small untested helper does not (about 18 untested lines or 8 untested functions trip one).
- **Not counted:** the spec files, `src/app/testing/`, and the configuration files that only declare providers (`app.config*.ts`, `app.routes.server.ts`, `hydration*.ts`), which the build and the browser tests exercise.
- **Only unit tests count,** not the browser tests: `home.ts` shows 72 % of lines, but its scrolling and menu are tested in `e2e/`.
- **Coverage shows which code ran, not that the tests checked the right result.** Breaking the code on purpose and watching a test fail remains the stronger proof.
- **CI:** the `test` job runs it; the figures are on the run's summary page (signed in to GitHub), the report is the `coverage-report` artifact. Under a floor, CI fails and the site is not deployed.
- **When a floor fails:** add the missing tests. Lower a floor only for a reason, and write it next to the value.

## Running end-to-end tests

Browser tests use [Playwright](https://playwright.dev/) in Chromium, with [AXE](https://github.com/dequelabs/axe-core) scans of every page. They run against the production build, in both languages, at 1280px (« desktop ») and 375px (« phone »):

```bash
npm run e2e
```

The first time, install the browser with `npx playwright install chromium`.

- **What it does:** `ng build`, `scripts/finish-static-build.mjs`, then `scripts/serve-dist.mjs` serves `dist/` on `http://localhost:4300/` the way GitHub Pages does, and the tests in `e2e/` run against it.
- **Watching the tests:** `npm run e2e:ui` opens Playwright's UI mode, to run one test and step through it.
- **After a failure:** `npx playwright show-report` opens the report, with a screenshot of the failing step and, for AXE, the rule and HTML of each unexpected violation.
- **AXE:** WCAG 2.0 to 2.2, A and AA, plus best practices. The site has no known violation: any violation fails the test. `e2e/known-violations.ts` can list accepted ones temporarily; a listed one that no longer fails also fails the test.
- **CI:** the `e2e` job of `.github/workflows/ci.yml` runs them on every push to `main` and on pull requests, and uploads the report when they fail.

## Lighthouse

[Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci) audits every page (`/`, `/stay`, `/en/`, `/en/stay`, and the not-found page at `/404`) on a phone profile, 3 times each, and keeps the median:

```bash
npm run lighthouse
```

It builds the site, serves it on `http://localhost:4301/` (`serve-dist.mjs`, compressed as GitHub Pages does), prints a score table and checks the floors in `lighthouserc.cjs`. Reports land in `lighthouse-report/`: open a `.report.html` to see each audit. `@lhci/cli` runs through `npx`, pinned, not as a dependency (its own dependencies carry `npm audit` findings).

- **Floors:** accessibility, best practices and SEO 100; performance 80 (medians on GitHub's runners were 86 to 97); at most 1 MiB per page (pages weigh 222 to 590 KiB; one unresized phone photo is 2 to 5 MB). The guest and not-found pages fail « is-crawlable » on purpose (`noindex`), so their other SEO audits are checked one by one.
- **CI:** the `lighthouse` job runs it on every push; a score under its floor fails CI, and the site is not deployed. The scores are on the run's summary page (signed in to GitHub); the reports are the `lighthouse-report` artifact.
- **When a floor fails:** open the page's report and look at the failing audit. If the site really got slower or heavier, fix that; lower a floor only if GitHub's runners moved, and say why in `lighthouserc.cjs`.
- **Locally, performance depends on the machine:** a laptop on battery can run its processor ten times slower, and scores drop by 10 to 15 points (the report's « benchmarkIndex » shows it). Measure on mains power; CI's runners are what count.

## Linting and formatting

```bash
npm run lint
```

```bash
npm run format
```

- **ESLint** (`eslint.config.js`, [angular-eslint](https://github.com/angular-eslint/angular-eslint)) checks `src/` and `e2e/`: TypeScript and Angular recommended rules, template accessibility, and the project's conventions from `.claude/CLAUDE.md` (`OnPush`, `input()` / `output()`, `host: {}` rather than `@HostListener`, `@if` / `@for`, class bindings rather than `ngClass`, `NgOptimizedImage`). Some rules use type information (`no-uncalled-signals` catches `if (open)` for `if (open())`).
- **Prettier** (`.prettierrc`: 100 columns, single quotes) formats code, templates, styles, JSON and YAML; `.prettierignore` leaves out build output, generated files and Markdown. `npm run format:check` only reports.
- **CI:** the `lint` job of `.github/workflows/ci.yml` runs both on every push and pull request.
- **In VS Code,** install the recommended ESLint and Prettier extensions (`.vscode/extensions.json`), and turn on *Format on Save*.
- **`git blame`** skips the commit that formatted everything (`.git-blame-ignore-revs`; GitHub reads it; locally: `git config blame.ignoreRevsFile .git-blame-ignore-revs`).

## Dependency updates

[Dependabot](https://docs.github.com/code-security/dependabot) (`.github/dependabot.yml`) opens grouped pull requests every Monday: `angular` (all `@angular/*` together: they must share one version), `testing`, `fonts`, and `tooling` (the rest, minor and patch only); GitHub Actions monthly. The CI workflow runs on each one: merge it on GitHub when its checks are green (merging deploys the site), then `git pull`.

- **Angular majors are not proposed:** run `ng update @angular/core @angular/cli` by hand, which also migrates the code.
- **Security fixes** come as separate pull requests when *Dependabot alerts* and *Dependabot security updates* are on (repository Settings → Code security).

# Deployment

The site is deployed **only by CI**, never from a developer's machine. The `deploy` job of `.github/workflows/ci.yml` publishes to [GitHub Pages](https://docs.github.com/pages) (custom domain `refugedusauze.com`) when:

1. a commit reaches `main` (a push, or a merged pull request), and
2. the `lint`, `test` and `e2e` jobs have all passed on that commit.

It publishes the very build the browser tests ran against (`dist/studio-sauze/browser`, prerendered and finished by `scripts/finish-static-build.mjs`), not a rebuild. Pages is set to publish from GitHub Actions (Settings → Pages → Source), so a manual push cannot publish anything.

- **Redeploy without a new commit:** Actions tab → *CI* → *Run workflow* on `main`. It still runs every check first.
- **Follow a deployment:** the Actions tab (the *CI* run, its `deploy` job), or the `github-pages` environment (repository home page sidebar), which lists every deployment with its commit and a link to the site.
- **Roll back:** revert the faulty commit on `main` and push: CI checks and deploys the reverted state.
- **A pull request never deploys;** its checks run, and the site changes once it is merged.
