/**
 * AXE violations known and accepted for now, by page state (the same in both
 * languages and at both widths): `rule selector`, as axe reports them, without
 * Angular's generated attributes. The tests fail on anything else, and on any
 * entry here that no longer fails, so this list only shrinks.
 *
 * Empty since Bolt 17, which fixed the contrast backlog. Keep it that way:
 * fix a new violation rather than listing it here.
 */
export const knownViolations: Record<string, readonly string[]> = {};
