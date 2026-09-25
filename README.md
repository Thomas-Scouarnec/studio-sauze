# StudioSauze

Showcase website for a mountain studio rental located at Le Sauze, in the Alpes de Haute-Provence (French Alps). Built with Angular, it presents the property, seasonal activities (skiing in winter, hiking and MTB in summer), and contact information.

## GitHub repository
https://github.com/Thomas-Scouarnec/studio-sauze

## Production url
https://refugedusauze.com/

## TO DO
- More languages (ES, IT...): see *Localization* below
- Add unit tests
- Add automated accessibility testing (Axe). Options: `axe-core` in the existing Vitest/jsdom setup (structural/ARIA checks only), or Playwright + `@axe-core/playwright` for a full browser run covering color contrast and focus-visible.
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
- **The visitor's choice** of language is saved in `localStorage` (`refuge.lang`). A visitor who chose English and opens a French URL is sent to `/en/…` before the app starts (`src/app/language-redirect.ts`).

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

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

# Deployment

The site is published to [GitHub Pages](https://github.com/Thomas-Scouarnec/studio-sauze) using [`angular-cli-ghpages`](https://github.com/angular-schule/angular-cli-ghpages), wired into `angular.json` as the `deploy` builder target. It builds the app and pushes the output to the `gh-pages` branch, which GitHub Pages serves from, behind the custom domain `refugedusauze.com` (set via a `CNAME` file on the `gh-pages` branch and configured in the DNS provider). Because the custom domain serves the site from the root (not from a `/studio-sauze/` sub-path like the default `github.io` URL would), the deploy target uses `baseHref: "/"`.

There is no CI workflow that deploys automatically on push to `main` — deployment is a manual step.

**Deploy with `npm run deploy`, not `ng deploy`.** The script builds both languages, then writes `en/stay.html` (`scripts/i18n-deep-links.mjs`) so that a direct link to `/en/stay` opens in English (GitHub Pages otherwise falls back to the French `404.html`), then runs `ng deploy --no-build`. A plain `ng deploy` rebuilds and drops that file.

## Trigger a deployment

```bash
ng deploy
```

## Monitor deployment status on GitHub

- **Actions tab** — pushing to `gh-pages` automatically triggers a built-in "pages build and deployment" run; check its status there.
- **Environments** (repo homepage sidebar, or `Settings → Environments`) — shows the `github-pages` environment with deployment history and a link to the live site.
- **Settings → Pages** — shows "Your site is live at [URL]" with the timestamp of the last successful deployment.
