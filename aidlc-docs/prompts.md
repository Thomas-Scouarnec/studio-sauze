# AI-DLC Prompts Log

All prompts in session order.

---

## Session 1 — 2026-06-13

**Intent:** Add unit tests and Vitest to the project.

**Clarifications provided by Thomas:**
- Test scope priority: Services
- Coverage threshold: None (just get it running)
- CI: Yes, add to GitHub Actions on every push to main

**Plan approved by Thomas:** 3 Units, 1 Bolt

---

## Session 2 — 2026-08-27

**Intent:** Update the appartment description section in order to be as accurate and precise as possible.

**Clarifications provided by Thomas:**
- Max guests is 5, not 4
- Sleeping split: bunk bed + drawer ("coin montagne") sleeps 3; sofa bed (160cm, converts to a bed) sleeps 2
- Drop the "studio lumineux" (bright) claim — not accurate
- Multiple storage spaces exist; exact count not important to state
- Emphasize all-season appeal: hikes/snowshoeing accessible from the flat in summer, not just skiing in winter
- Highlight that the kitchen is well-equipped
- Replace "0 marche jusqu'aux pistes" with "a couple of meters" — applies to ski slopes, hiking trails, and snowshoe trails
- Add ~10 minutes by car from Barcelonnette
- Share precise location as: residence name + Google Maps link (not the exact door/apartment number, for owner security/privacy)
- Remove the unused `description` field from `FlatInfoService`
- Scope: French copy only for now (no localization in this bolt)

**Further precisions from Thomas:**
- Residence name and building name are two distinct pieces of information: Résidence = "Le Roi Soleil", Bâtiment = "Crépuscule"
- Google Maps link: https://maps.app.goo.gl/AYnuYPqsfuqbwnkR6
- Noticed while designing: the Contact form's "Nombre de personnes" dropdown caps at 4, inconsistent with the corrected max of 5 — added as Step 4 to the bolt plan

**Plan drafted:** 1 Unit ("Apartment Description Accuracy"), 5 stories, 1 Bolt (5 steps) — pending Thomas's approval to implement.

**Workflow addition:** Introduced `aidlc-docs/functional-specs/` — persistent, per-domain functional specs (unlike session-scoped story-artifacts) capturing durable facts and cross-cutting business rules, to catch drift like the Contact form guest-count bug. First spec: [functional-specs/flat-info.md](functional-specs/flat-info.md), pending Thomas's validation before the bolt starts.

**Artifact review before implementation — decisions from Thomas:**
- Contact form's guest selector must be derived from `FlatInfoService` (not hardcoded) — added `guestCountOptions` computed signal to enforce BR-1 going forward
- "Bunk bed + a drawer" = "lit superposé + tiroir-lit" (confirmed wording for French copy)
- Building name keeps the accent: "Crépuscule" (Thomas just can't type it on his keyboard)

**Plan approved by Thomas — ready to implement Bolt 2.**
