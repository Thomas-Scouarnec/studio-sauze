# Bolt 21 Plan — Deploy from CI

**Intent:** « Deploy from CI instead of by hand. It is too risky to be able to deploy the site whereas CI has not run. » (idea 5 of Session 18)
**Date:** 2026-09-30
**Status:** Implemented on 2026-09-30; live once Thomas switches the Pages source (below)

---

## Known before the bolt

- `npm run deploy` built on the developer's machine and pushed `dist/` to the `gh-pages` branch with `angular-cli-ghpages`, whatever the state of the tests; CI only tested
- The browser tests (`e2e` job) already build, prerender and finish the site exactly as for production

## Decisions

| # | Decision | Why | Alternative |
|---|---|---|---|
| D1 | **GitHub Pages' own Actions deployment** (`upload-pages-artifact` v5, `deploy-pages` v5); Pages source set to « GitHub Actions » | Pages then publishes only what the workflow sends: a deploy that skips CI becomes impossible, not only discouraged | Keep `gh-pages` and push it from CI: a manual push would still publish |
| D2 | **`deploy` needs `lint`, `test` and `e2e`,** on `main` only, never for a pull request | The requirement itself | — |
| D3 | **Deploy the build the browser tests ran against,** uploaded by the `e2e` job | What was tested is what is published; no second build to differ | Rebuild in the deploy job |
| D4 | **Every manual path removed:** the `deploy` script, the `ng deploy` target, `angular-cli-ghpages` | Nothing to run by mistake | Keep them « just in case » |
| D5 | **`workflow_dispatch`** to redeploy without a commit, through every check | A way to republish that still cannot skip CI | — |
| D6 | **One deployment at a time** (`concurrency: pages`, no cancelling) | A deployment is never cut halfway | — |
| D7 | **Workflow renamed « Tests » → « CI »** (`test.yml` → `ci.yml`) | It now deploys | — |

## Steps

- [x] **Step 1 — Workflow:** `ci.yml` with the `deploy` job; the `e2e` job uploads the tested site on `main`
- [x] **Step 2 — Manual paths removed;** references updated (README, Dependabot comments, `finish-static-build.mjs`)
- [ ] **Step 3 — Switch-over (Thomas, on GitHub):** push; Settings → Pages → Source: « GitHub Actions »; Actions → CI → Run workflow; check the site

## Verification

| Check | Result |
|---|---|
| Workflow | Valid (action-validator); Prettier clean |
| Lint, format, unit, browser tests | Pass |
| Live deployment | Pending the switch-over (step 3) |

## Switch-over order (no downtime)

1. **Push.** Until the source is switched, the `deploy` job fails (Pages still publishes from `gh-pages`), and the site stays as it is
2. **Settings → Pages → Build and deployment → Source: « GitHub Actions ».** The custom domain setting is kept; no `CNAME` file is needed with Actions
3. **Actions → CI → Run workflow** (or re-run the failed jobs): checks, then deploys
4. Check refugedusauze.com; the `gh-pages` branch can then be deleted
