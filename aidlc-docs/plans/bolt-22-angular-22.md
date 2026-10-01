# Bolt 22 Plan — Angular 22

**Intent:** « Can you create a bolt to migrate to the latest version of Angular? I think it is Angular 22. »
**Date:** 2026-10-01
**Status:** Implemented on 2026-10-01; CI and deployment once pushed (step 4)

---

## Known before the bolt

- **Angular 21.2.24;** the latest release is **22.2.1** (`latest` on npm, checked 2026-10-01)
- **Vitest 5 runs on an npm `overrides` entry:** `@angular/build` 21 only accepts Vitest 4 as a peer; 22 accepts `^4.0.8 || ^5.0.0`
- **`npm audit`: 2 critical,** `piscina` through `@angular/build` 21; fixed only in `@angular/build` 22
- Dependabot leaves Angular majors alone on purpose: they come through `ng update` and its code migrations, as their own piece of work (this Bolt)

## What Angular 22 asks for

| Requirement | Here | Action |
|---|---|---|
| **TypeScript `>=6.0 <6.1`** | 5.9 | `ng update` installs 6.0.3 |
| **Node `^22.22.3 \|\| ^24.15.0 \|\| >=26`** | 24.15.0 locally; CI `node-version: 22` (latest 22.x) | None |
| **angular-eslint 22** (21.4 refuses `@angular/cli` 22) | 21.4.0 | Updated in the same `ng update` |

## Trial run (throwaway worktree, since deleted)

`ng update @angular/core@22 @angular/cli@22 angular-eslint@22` on today's `main`:

| Migration | Result here |
|---|---|
| `ChangeDetectionStrategy.Eager` added to components without a strategy | **No change:** all 14 components already set `OnPush` |
| `withNoIncrementalHydration()` added to `provideClientHydration()` | `hydration.ts` changed (see D3) |
| `nullishCoalescingNotNullable` and `optionalChainNotNullable` diagnostics turned off | Both tsconfigs changed (see D4) |
| `canMatch` third argument, `withXhr`, duplicate outputs, optional chaining, `strictTemplates` | No change |

Then, with the override and the suppressions removed:

| Check | Result |
|---|---|
| `ng build` | 4 routes prerendered; no warnings |
| Unit tests | 214 passing |
| Browser tests | 62 passing, 10 skipped by design; hydration without errors; AXE 0 violations |
| `ng lint`, Prettier | Clean (Prettier only after reformatting `package.json`, which `ng update` rewrites) |
| `npm ci`, `npm install` | Clean, no conflict, no override |
| `npm audit` | **0 vulnerabilities** |

## Decisions

| # | Decision | Why | Alternative |
|---|---|---|---|
| D1 | **`ng update`, not a version bump by hand** | Runs Angular's code migrations; what the Dependabot comment promises | Edit `package.json` |
| D2 | **angular-eslint 22 and TypeScript 6.0 in the same step** | Neither Angular 22 nor angular-eslint 21 installs without the other | Separate commits: none of them would install |
| D3 | **Drop `withNoIncrementalHydration()`** added by the migration | It keeps pre-22 behaviour for `@defer (hydrate …)` blocks; the site has no `@defer` at all, so it changes nothing and would only puzzle a reader. The browser hydration tests confirm | Keep it, as the migration wrote it |
| D4 | **Drop the two suppressed template diagnostics** | Without them the build reports nothing: no template has a needless `??` or `?.`. Left on, they keep catching the next one | Keep the migration's suppressions |
| D5 | **Remove the Vitest `overrides`** | Angular 22 accepts Vitest 5; the override was only a bridge (commit `372fd28`) | — |
| D6 | **Keep `changeDetection: OnPush` written out** in every component | CLAUDE.md asks for it, and `prefer-on-push-component-change-detection` (Bolt 20) checks it | Rely on the framework default |

## Steps

- [x] **Step 1 — Update:** `ng update @angular/core@22 @angular/cli@22 angular-eslint@22`; reformat `package.json`
- [x] **Step 2 — Tidy the migrations:** D3, D4, D5; `npm install` to refresh the lockfile
- [x] **Step 3 — Verify:** build, unit, lint, format, browser tests, `npm ci`, `npm audit`; screenshots of `/` and `/stay` at both widths, compared with today's site
- [ ] **Step 4 — CI:** push; the CI run (lint, unit, browser) then deploys

## Verification

| Check | Result |
|---|---|
| `ng update` | Same migrations as the trial; with D3 to D5 applied, only `package.json` and the lockfile change |
| `npm ci` | Clean, without the override |
| `ng build` | 4 routes prerendered; no warnings or diagnostics |
| Unit tests | 214 passing |
| `ng lint`, Prettier | Clean |
| Browser tests | 62 passing, 10 skipped by design; hydration without errors; AXE 0 violations |
| Screenshots against the live site (Angular 21) | `/`, `/stay`, `/en/`, `/en/stay` at 1280 and 375 px: full-page pixels and page text identical (8 of 8, two runs in a row) |
| `npm audit` | **0 vulnerabilities** (was 2 critical) |
| CI and deployment | Pending the push (step 4) |

## Found along the way

- **One screenshot pair differed in a first run:** `/` at 1280 px, inside the photos only, invisible to the eye. Same image files (identical hashes) and same variants chosen; the live site against itself, and the next two full runs, were identical. A capture artefact, not a change
