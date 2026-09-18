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

**Design decision approved by Thomas:** equipment content moves into `FlatInfoService` as structured data, so the component stays presentational and the published copy cannot drift from the spec (BR-3).

**Noticed while designing:** the current `.feature-desc` body copy uses `var(--stone)` on `var(--snow)`, measuring ≈3.6:1 — below the WCAG AA 4.5:1 minimum. Fixed as part of the rewrite rather than carried over.

**Plan drafted:** 1 Unit ("Equipment Section"), 7 stories, 1 Bolt (6 steps).

**Artifact review before implementation — decisions from Thomas:**
- URL fragment may change from `#features` to `#equipment` — approved, it is the better name
- **Convention:** technical identifiers (HTML ids, block ids, CSS classes, TS symbols) are written in English even though localization only supports French for now. Only user-visible copy is French. Block ids corrected accordingly: `arrivee`/`couchages`/`cuisine` → `arrival`/`sleeping`/`kitchen`

**Plan approved by Thomas — Bolt 3 implemented on 2026-09-17.** All 6 steps done, 22 tests passing, verified in the browser at desktop and mobile widths.

**Copy refinement after review:** the closing sentence of the `arrival` block, "Pas un escalier, jamais.", was removed — too absolute, since guests can take the stairs if they prefer. The block now states the mechanism (drop the gear downstairs, take the lift up) without the absolute claim.

**Noticed while verifying — candidate for a future bolt:** `var(--stone)` on `var(--snow)` measures 3.63:1, below the WCAG AA 4.5:1 minimum. Bolt 3 removed the last usage from the Équipements section, but 10 elements still use it elsewhere — the three About stat labels and all seven Contact form labels. Form labels failing contrast is the more serious case. Not fixed here to avoid widening the bolt's scope.

---

## Session 4 — 2026-09-17

**Intent:** Rework the "Toute l'année" (Seasons) section to highlight what there is to do in winter and in summer, reworked the same way as the Équipements section. The existing two-card structure is a good basis and is kept.

**Clarifications provided by Thomas:**
- **Ski de fond removed** — Thomas is not sure it is accurate, so it does not ship (BR-5)
- **Winter additions:** Luge only. Ski de randonnée explicitly rejected. Chiens de traîneau, patinoire and Espace Lumière were proposed but not confirmed, so they are not added
- **Summer additions:** Trail, Parapente (moved from the winter candidates), the Mexican festival, and the Lac de Serre-Ponçon
- **Festival:** official name is "Fêtes Latino-Mexicaines de Barcelonnette", running ten days mid-August. Exact dates change every year, so no specific dates are published — the Ubaye tourist office link carries them instead
- **Lac de Serre-Ponçon:** 45 minutes by car
- **Photos:** agreed, but Thomas does not have them yet — placeholder labels describing the intended subject are used for now (e.g. "Photo — Barcelonnette pendant les Fêtes Latino-Mexicaines"). One photo per card, not one per highlight, to limit sourcing to two licensed images
- **Background symbol (❄ / ☀) removed** — it would compete with the photo once images land
- **Links (provided by Thomas):** https://www.sauze.com/ for winter, https://www.ubaye.com/votre-sejour/offices-de-tourisme/ for summer. Limited to two: the tourist office is what keeps the festival's shifting dates accurate without yearly maintenance
- **Season descriptions kept** — Thomas likes the two scene-setting sentences and wants them retained. To remove the overlap I had flagged, the winter first highlight's line changed to "du débutant au skieur confirmé" instead of repeating "ambiance authentique"

**Format decision — validated after a visual mockup:** the two-card structure stays, but each card's content is split into a photo, a scene-setting sentence, three named highlights with a line of text each, activity tags, and one external link.

**Plan drafted:** 1 Unit ("Seasons Section"), 6 stories, 1 Bolt (6 steps). Thomas asked to proceed directly to implementation.

**Bolt 4 implemented on 2026-09-17.** All 6 steps done, 37 tests passing, verified in the browser. Lowest contrast on the dark cards is 4.74:1, above the AA minimum.

**Workflow addition:** introduced `functional-specs/seasons.md` — a second per-domain spec covering the valley and its activities, sibling to `flat-info.md` which owns the flat itself. The split keeps "facts about the property" and "facts about the place" from bleeding into each other.

**Change requested after implementation:** the section anchor moves from `#seasons` to `#activities`, matching the navbar's "Activités" label — the same reasoning as `#equipment` in Bolt 3. The heading id follows (`activities-heading`). The component itself keeps the `Seasons` name, since the domain is still the two seasons.

**Noticed while verifying — candidate for a future bolt:** the hero tagline still reads "skis aux pieds", which may be the same overclaim Bolt 2 removed as "0 marche jusqu'aux pistes" (FR-7). Not changed here.

---

## Session 5 — 2026-09-18

**Intent:** Redesign the last section, "Nous rejoindre" (Contact).

**Defects found in the current section before designing:**
- The form sends nothing: `onSubmit()` only flips a `submitted` signal, yet the page thanks the visitor and promises a reply. GitHub Pages has no backend, so every request was silently lost
- The published email is a placeholder (`test@gmail.com`)
- "Réponse sous 24–48h" is an unverified commitment
- The location block ("Station du Sauze, Alpes de Haute-Provence, 04400") is hardcoded in the template (BR-3) and duplicates the hero and About
- The seven form labels use `--stone`, the contrast defect logged in Session 3
- One section, three names: "Nous rejoindre" (label), "Réservez votre séjour" (heading), "Contact" (navbar)

**Clarifications provided by Thomas:**
- **No form for now.** A browser cannot send email on its own and the site has no backend. mailto, a third-party form service and a serverless function were weighed; Thomas chose the simplest option — contact details only
- **Scope: contact only.** The section is for asking questions or requesting a stay; no booking happens on the site yet. Getting to Le Sauze stays out of scope
- **Channels: email only** — no phone, no rental-platform link
- **Dedicated address** agreed, to keep spam off a personal inbox and keep the owner's name off the page. Proposed: `refugedusauze@gmail.com`, matching the visible "Notre Refuge" brand. Thomas is creating it — not yet confirmed
- **Reply time softened:** "we will reply quickly", with no timeline commitment
- **Request checklist added** (dates, number of people, questions), so the first email carries what the owner needs
- **Location block removed** — it is not a contact channel, and its facts are already owned by the hero and About (same principle as FR-18 in `flat-info.md`)
- **No pre-filled subject** on the mailto link (proposed, declined)

**Format decision — validated by Thomas after a visual mockup:** two columns. Left: label "Contact", heading "Écrivez-nous", one intro sentence, the email address as a prominent link. Right: a checklist card "Pour une demande de séjour, précisez :" followed by a note that a stay is confirmed by the owner's reply, not by the site.

**Decisions inside the mockup, accepted by Thomas:**
- Label renamed to "Contact" to match the navbar; heading "Écrivez-nous" replaces "Réservez votre séjour", since nothing can be booked on the site
- "5 au maximum" is derived from `maxGuests`, so BR-1 survives the removal of the guest-count dropdown. `guestCountOptions` loses its only consumer and is deleted
- Pets are not mentioned in the checklist — whether pets are accepted is still an open question in the README

**Plan drafted:** 1 Unit ("Contact Section"), 5 stories, 1 Bolt (6 steps). Thomas asked to proceed directly to implementation.

**Bolt 5 implemented on 2026-09-18.** All 6 steps done, 52 tests passing, verified in the browser at desktop and mobile widths. The form, `ReactiveFormsModule` and `guestCountOptions` are gone; a new `ContactService` holds the email and derives the checklist maximum from `FlatInfoService`.

**Workflow addition:** introduced `functional-specs/contact.md`, a third per-domain spec alongside `flat-info.md` (the property) and `seasons.md` (the valley).

**Noticed while verifying — candidate for a future bolt:** the global `.section-label` style (`--amber` on `--cream`) measures 2.68:1 on every section, below the AA minimum. It belongs with the `--stone` defect from Session 3 in a dedicated accessibility bolt. Removing the form cuts the `--stone` usages from 10 to 3.

**Email confirmed by Thomas:** `refugedusauze@gmail.com` is created and live — no longer blocking.

**Accessibility bolt accepted for later:** Thomas agreed to address `.section-label` (amber, 2.68:1) and the remaining `--stone` usages in a dedicated future bolt.
