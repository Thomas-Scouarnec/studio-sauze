/** The languages the site is compiled in (FR-1). French is the source and the default (FR-2). */
export type Language = 'fr' | 'en';

/**
 * Next to `refuge.guest` (Bolt 10): one prefix for everything the site stores.
 * Also read by the inline redirect in `src/index.html`: keep the two in step.
 */
export const LANGUAGE_STORAGE_KEY = 'refuge.lang';

/** Where each language's app is served: French at the root, English under `/en/` (FR-3). */
const PATH_PREFIX: Record<Language, string> = { fr: '', en: '/en' };

/**
 * The same page in `language`, from a URL of the app itself — the router's
 * `url`, which never includes the `/en` base.
 *
 * Example: `('en', '/stay#arrival')` → `/en/stay#arrival`; `('en', '/')` → `/en/`
 */
export function languageUrl(language: Language, appUrl: string): string {
  return PATH_PREFIX[language] + appUrl;
}

/** The language of this compiled app, from its `LOCALE_ID` (`fr`, or `en-…` in the English build). */
export function languageOf(localeId: string): Language {
  return localeId.startsWith('en') ? 'en' : 'fr';
}
