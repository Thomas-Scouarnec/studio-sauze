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

---

## Session 3 — 2026-09-16

**Intent:** Rework the existing "Équipements" section to highlight what differentiates this flat from other rentals in Le Sauze. Starting from scratch — the previous 6-card content and the card concept itself are both up for replacement.

**Clarifications provided by Thomas:**
- Appliance brands (Beko, Bosch, Moulinex) dropped. The intent behind them was to signal quality — carried instead by capability plus one honest quality sentence
- No Wi-Fi, but very good 4G/5G coverage with tethering possible. Phrase positive-first: "Très bon réseau 4G/5G — pas de Wi-Fi"
- TV is TNT (broadcast) only — consistent with having no internet connection
- Wooden table seating 5: three chairs + one bench
- The lift serves both the ground floor (ski locker) and the 1st floor (the flat)
- Parking: free, outdoor, first-come. Wording stays "parking gratuit au pied du bâtiment" (not qualified as non-attributed)
- Heating: all references dropped from the section entirely
- No balcony or terrace. View is mostly onto the forest (partly onto another building of the residence) — "vue sur la forêt" accepted
- Ski locker: "casier à skis sécurisé au rez-de-chaussée". Capacity not yet verified, so no number is published
- Boot drying is just a spot next to a heater — must NOT be called a sèche-chaussures. Honest wording only
- Location: flat sits between Le Sauze and Super-Sauze, much closer to Le Sauze. 5 min by car to the Le Sauze centre (shops, restaurants), 10 min to Barcelonnette. Car-dependent for shops — Thomas is comfortable stating this
- All location facts removed from this section — they will be placed in another section later. This section covers flat-related information only
- Summer content deliberately skipped for this bolt (the About section still carries the all-season message, so FR-4 is not dropped)
- Linen, towels and end-of-stay cleaning deliberately excluded — destined for a future restricted section for guests who have booked
- Segment-openers (baby equipment, pets) parked for now
- Section title stays "Ce qui vous attend"
- Block 1 headline: "Vos skis restent en bas" (the earlier "Vos skis montent en ascenseur" was factually wrong — skis are dropped in the ground-floor locker and never take the lift)

**Format decision — validated by Thomas after a visual mockup:** two tiers in one section. Tier 1 = three large persuasive blocks (arrival/access, sleeping, kitchen), each with prose and a photo slot. Tier 2 = the remaining eight items as a compact scannable list under an "Et aussi" label.

**Noted for a future bolt:** photos (likely a carousel, possibly opened by clicking a block) and a restricted guest-only section. Photo placeholders are kept in the layout now so images can slot in without a rewrite.

**Plan status:** story artifact and spec update written — design artifact and Bolt 3 plan pending, then Thomas's approval to implement.
