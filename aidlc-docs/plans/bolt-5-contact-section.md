# Bolt 5 Plan — Contact Section

**Intent:** Redesign the "Nous rejoindre" section into an honest, email-only contact section.
**Date:** 2026-09-18
**Stories:** [contact-section.md](../story-artifacts/contact-section.md) · **Design:** [design-artifacts/contact-section.md](../design-artifacts/contact-section.md) · **Spec:** [contact.md](../functional-specs/contact.md)

---

## Steps

- [x] **Step 1 — Create `ContactService`**
  - New `src/app/services/contact.service.ts`, `providedIn: 'root'`
  - `email`, `mailtoUrl`, and a `requestChecklist` computed from `FlatInfoService.info().maxGuests`

- [x] **Step 2 — Remove `guestCountOptions` from `FlatInfoService`**
  - Delete the computed and its test; update `flat-info.md` (consumers table, BR-1 wording, revision history)

- [x] **Step 3 — Rewrite `ContactComponent`**
  - `contact.ts`: drop `ReactiveFormsModule`, `FormBuilder`, `form`, `submitted`, `onSubmit()`; inject `ContactService`
  - `contact.html`: label "Contact", `h2` "Écrivez-nous", intro, email link; checklist card with `h3`, labelled `ul`, confirmation note
  - Location block removed

- [x] **Step 4 — Rewrite `contact.css`**
  - Two columns collapsing to one at 768px; remove all form rules and every `--stone` usage
  - Email link styled as a prominent button with `:focus-visible` outline; long address wraps

- [x] **Step 5 — Tests**
  - New `contact.service.spec.ts`: address is a valid email and not the old placeholder; `mailtoUrl` has no query string; three checklist items; maximum derived from `maxGuests`; no mention of pets
  - New `contact.spec.ts`: host ARIA; no `form` element; mailto link; three checklist items labelled by their heading; confirmation note present; no reply-time figure; no location facts

- [x] **Step 6 — Verify**
  - `npm test` and production build pass
  - Browser check at desktop and 375px: columns, no horizontal overflow, email wraps
  - Measure contrast of every text element in the section; heading order h2 → h3

---

## NFRs

- Copy stays in French; identifiers in English
- Standalone, `OnPush`, signals, `inject()`, native control flow
- WCAG AA contrast, labelled list, decorative icons hidden

---

## Out of scope (deliberate)

- Any form or form service
- Access / travel information
- Pets policy
- `--stone` defect in other sections

---

**Bolt 5 implemented on 2026-09-18.**

## Verification results

| Check | Result |
|---|---|
| `npm test` | 52 tests pass (7 files) |
| Production build | Succeeds, within budgets |
| Contrast (on `--cream` / white) | Checklist items 16.06:1 · request heading 13.43:1 · heading and email link 11.84:1 · note 8.45:1 · intro 7.45:1 |
| Heading order | h2 → h3, no skipped levels |
| Desktop (1280px) | Two columns of 530px, side by side |
| Mobile (375px) | One column, no horizontal overflow, email link fits (254px) |
| Content | No `form` element, `mailto:` link with no query string, no location facts, no console errors |

## Noticed during verification — not in scope

**`.section-label` fails contrast site-wide.** The global label style is `--amber` (`#C8854A`) on `--cream`, measuring **2.68:1**, well below 4.5:1. Every section's label shares it, so fixing it only here would make the Contact label inconsistent with the others. Recommended for the same dedicated accessibility bolt as the `--stone` defect (Bolt 3). Removing the form cuts the `--stone` usages from 10 elements to 3 (the About stat labels).

**The email address was unconfirmed at implementation time.** Resolved the same day: Thomas created and confirmed `refugedusauze@gmail.com`.
