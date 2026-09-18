# Design — Contact Section

**Unit:** Contact Section
**Date:** 2026-09-18
**Stories:** [contact-section.md](../story-artifacts/contact-section.md) · **Spec:** [contact.md](../functional-specs/contact.md)

## Responsibility

Tells the visitor how to reach the owner by email and what to include in a stay request. The component is presentational; the email address and checklist come from a new `ContactService`.

## Data model

```ts
export interface ContactChecklistItem {
  icon: string;
  label: string;
}
```

## Service — `ContactService`

| Member | Type | Description |
|---|---|---|
| `email` | `string` | The dedicated rental inbox |
| `mailtoUrl` | `string` | `mailto:` + `email`, no query string |
| `requestChecklist` | `Signal<ContactChecklistItem[]>` | `computed()` from `FlatInfoService.info().maxGuests` |

`providedIn: 'root'`. It injects `FlatInfoService` with `inject()` — a service depending on another service, so the maximum guest count is never typed twice.

**Content (final, validated in Session 5):**

| Icon | Label |
|---|---|
| 📅 | Vos dates d'arrivée et de départ |
| 👥 | Le nombre de personnes (5 au maximum) — `5` from `maxGuests` |
| 💬 | Vos questions éventuelles |

## Component model — `ContactComponent`

Selector stays `app-contact`, with `role: 'region'`, host id `contact`, `aria-labelledby: 'contact-heading'` and `OnPush`. `ReactiveFormsModule`, `FormBuilder`, the `form` group, the `submitted` signal and `onSubmit()` are all removed.

Template, left column: label "Contact" → `h2` "Écrivez-nous" → intro sentence → email link.
Right column (card): `h3` "Pour une demande de séjour, précisez :" → checklist `ul` labelled by the `h3` → confirmation note.

Static prose (label, heading, intro, note) stays in the template, like the other sections' headings; data that a test must guard (address, checklist) lives in the service.

## Accessibility

- Heading order: `h2` → `h3`, no skipped levels
- The checklist `ul` has `aria-labelledby` pointing at its `h3`, matching the Équipements "Et aussi" list
- Emoji icons are `aria-hidden="true"`
- The email link's accessible name is the address itself; it gets a visible `:focus-visible` outline
- The long address wraps rather than overflowing at 375px (`overflow-wrap: anywhere`)
- Text colours: `--text` and `#5a4a3e` on `--cream` / white, both well above 4.5:1. `--stone` is not used

## Decisions and alternatives considered

**No form.** A static site cannot send email. mailto, a third-party form service and a serverless function were considered; Thomas chose contact details only. The form code is deleted, not hidden, so it cannot come back half-working.

**A new `ContactService` rather than extending `FlatInfoService`.** How to reach the owner is not a fact about the flat. Following the Session 4 split (flat vs. valley), a third small service keeps each one to a single responsibility. `FlatInfoService` stays the owner of `maxGuests`; `ContactService` reads it.

**`guestCountOptions` deleted.** Its only consumer was the removed dropdown. BR-1 of `flat-info.md` is now enforced by the checklist's computed label instead.

**Emoji icons rather than an icon font.** The mockup used line icons; the site's existing idiom (Équipements list) is emoji, and adding an icon font for three glyphs is not worth the dependency.
