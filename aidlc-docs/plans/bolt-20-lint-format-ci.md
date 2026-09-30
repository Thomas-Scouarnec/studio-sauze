# Bolt 20 Plan — ESLint and Prettier in CI

**Intent:** Check code style and the project's Angular conventions automatically, locally and in CI (idea 6 of Session 18).
**Date:** 2026-09-30
**Status:** Implemented on 2026-09-30

---

## Known before the bolt

- **Prettier was installed and configured** (`.prettierrc` from the Angular CLI: 100 columns, single quotes) **but never run:** 55 files differed from its style, whatever the settings tried
- **No linter;** CLAUDE.md's conventions were checked by review only

## Decisions

| # | Decision | Why |
|---|---|---|
| D1 | **`ng add angular-eslint` (21.4)**, recommended TypeScript, Angular and template accessibility rules | The official Angular setup, `ng lint` |
| D2 | **Rules for CLAUDE.md's conventions:** `prefer-on-push-component-change-detection`, `prefer-signals`, `prefer-output-emitter-ref`, `prefer-output-readonly`, `prefer-host-metadata-property`, `no-uncalled-signals`, `use-injectable-provided-in`; templates: `prefer-control-flow`, `prefer-class-binding`, `prefer-ngsrc` | Conventions checked, not remembered. No rule exists for `ngStyle` |
| D3 | **Typed linting** (`projectService`) | Needed by `no-uncalled-signals`; about 8 s for the whole project |
| D4 | **`src/` and `e2e/` linted;** empty functions allowed in test doubles only | The Playwright tests are code too |
| D5 | **`.prettierrc` kept as is,** plus `endOfLine: auto` (Windows checkouts) | The Angular CLI default; any other setting changed as many files |
| D6 | **One formatting-only commit**, listed in `.git-blame-ignore-revs` | Reviewable on its own; `git blame` skips it |
| D7 | **Markdown not formatted** (`.prettierignore`), nor generated files | Reflowing prose and tables would only add noise |
| D8 | **A `lint` CI job**, next to `test` and `e2e` | Fails independently, in parallel |

## Steps

- [x] **Step 1 — Tooling** (commit `4a796fe`): angular-eslint, rules, scripts `lint`, `format`, `format:check`; three test host components given `OnPush` (the only findings besides empty test doubles)
- [x] **Step 2 — Format** (commit `083ea60`): `npm run format` only; `messages.xlf` re-extracted
- [x] **Step 3 — CI and docs:** `lint` job, `.git-blame-ignore-revs`, README « Linting and formatting », VS Code recommendations

---

## Verification results

| Check | Result |
|---|---|
| `npm run lint` | All files pass (src + e2e) |
| `npm run format:check` | All matched files use Prettier code style |
| Rules gate | A throwaway component with `*ngIf`, `[ngClass]`, `<img src>`, `@Input`, `@HostListener` and no `OnPush`: all six convention rules report it |
| Formatting changed nothing visible | Page text and accessible names (`aria-label`, `alt`, `title`) identical before and after on `/`, `/stay`, `/en/`, `/en/stay`, with and without JavaScript, at both widths (16 captures); full-page screenshots pixel-identical (8) |
| `messages.xlf` | Line numbers, and leading or trailing spaces in some French sources where Prettier wrapped a paragraph; ids unchanged, so the English still attaches (the build and the English captures confirm it) |
| Unit tests | 214 passing |
| Browser tests | 62 passing, 10 skipped by design; AXE 0 violations |

## Found along the way

- **Bolt 19's result said 64 browser tests;** that run included two temporary screenshot tests. Corrected to 62 in its plan
