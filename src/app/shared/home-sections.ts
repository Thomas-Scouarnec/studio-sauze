/** A section of the home page, as the menus list it. */
export interface HomeSection {
  /** The section's `id` on the home page: the link's fragment. */
  id: string;
  title: string;
}

/**
 * The home page's sections, in page order: one list for the navbar and the
 * mobile bar, so their names can never drift apart (BR-3 of navigation.md).
 * The translation ids are the navbar's own, from before this list existed.
 */
export const HOME_SECTIONS: readonly HomeSection[] = [
  { id: 'about', title: $localize`:@@nav.about:L'appartement` },
  { id: 'equipment', title: $localize`:@@nav.equipment:Équipements` },
  { id: 'activities', title: $localize`:@@nav.activities:Activités` },
  { id: 'contact', title: $localize`:@@nav.contact:Contact` }
];
