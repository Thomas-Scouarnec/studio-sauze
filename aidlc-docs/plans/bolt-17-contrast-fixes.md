# Bolt 17 Plan — Contrast Fixes

**Intent:** Fix every existing AXE violation: the `color-contrast` backlog recorded since Bolt 9 and baselined in Bolt 16.
**Date:** 2026-09-29
**Status:** Implemented on 2026-09-29
**Builds on:** [bolt-16-e2e-accessibility-tests.md](bolt-16-e2e-accessibility-tests.md) (the AXE tests and their baseline)

---

## Known before the bolt

- **10 nodes, one rule:** `color-contrast` (WCAG 1.4.3), all small text (under 12px), so each needs 4.5:1
- **Four colour pairs** (measured by axe 4.13):

| Element | Colours | Ratio |
|---|---|---|
| `.section-label` on light sections (6 nodes) | `--amber` `#C8854A` on cream / snow | 2.67 / 2.86 |
| `.section-label` in « Activités » | `--amber` on `--bark` | 4.41 |
| `.stat-label` (3 nodes) | `--stone` `#8C8074` on cream | 3.39 |
| `.footer-copy` (home and `/stay`) | `rgba(197, 180, 160, 0.4)` on `--text` | 2.44 |

- **Plain amber passes elsewhere** (the hero, navbar, footer logo, focus rings): changing `--amber` itself would alter them for nothing

## Decisions

- **Same hues, only the lightness moves,** with some margin above 4.5:1
- **Two new tokens** for amber small text: `--amber-on-light: #8C5D34` (4.96:1 on cream, 5.31 on snow) and `--amber-on-dark: #CE915C` (5.01:1 on bark); `--amber` unchanged
- **`--stone` darkened** to `#70665D` (4.94:1 on cream). Its only other use is the dashed border of the `/stay` photo placeholders, which only gets more visible
- **Footer copyright** at 75% opacity instead of 40% (5.11:1)

## Steps

- [x] **Step 1 — Colours:** tokens in `styles.css`; `.section-label` uses `--amber-on-light`, overridden with `--amber-on-dark` in `seasons.css`; footer opacity
- [x] **Step 2 — Baseline emptied:** `e2e/known-violations.ts` is now empty
- [x] **Step 3 — Verify:** AXE, Playwright, Vitest, production build, screenshots

---

## Verification results

| Check | Result |
|---|---|
| AXE (16 scans: 4 pages, both widths, menus and gallery open) | **0 violations**, empty baseline |
| Browser tests | 26 passing |
| Unit tests | 222 passing |
| Production build | Both languages, no warning (component style budget included) |
| Screenshots at 1280px | Labels still read as amber; the copyright stays discreet |

## Left to Thomas

- A look at the new label and footer colours on the live site after deploying
