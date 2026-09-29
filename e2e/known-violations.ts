/**
 * AXE violations known and accepted for now, by page state (the same in both
 * languages and at both widths): `rule selector`, as axe reports them, without
 * Angular's generated attributes. The tests fail on anything else, and on any
 * entry here that no longer fails, so this list only shrinks.
 *
 * All of them are the contrast backlog recorded since Bolt 9: `.section-label`
 * and `.stat-label` (amber on cream), `.footer-copy`. They are for the
 * accessibility Bolt, which changes colours; fixing one means deleting its line.
 */
const homeContrast = [
  'color-contrast .section-label', // L'appartement
  'color-contrast .stat[role="listitem"]:nth-child(1) > .stat-label',
  'color-contrast .stat[role="listitem"]:nth-child(2) > .stat-label',
  'color-contrast .stat[role="listitem"]:nth-child(3) > .stat-label',
  'color-contrast .equipment-header > .section-label',
  'color-contrast #equipment-extras-heading', // « Et aussi », a .section-label
  'color-contrast #activities > .section-label',
  'color-contrast .section-label', // Contact
  'color-contrast .footer-copy',
];

export const knownViolations: Record<string, readonly string[]> = {
  home: homeContrast,
  // The open menu covers « L'appartement »'s label, so axe cannot measure it.
  'home, menu open': homeContrast.filter((_, index) => index !== 0),
  // A modal dialog: the page behind is inert, and the dialog itself passes.
  'home, gallery open': [],
  stay: ['color-contrast .footer-copy'],
  'stay, list open': ['color-contrast .footer-copy'],
};
