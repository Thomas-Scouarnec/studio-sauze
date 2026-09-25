/** The languages the site is compiled in (FR-1). French is the source and the default (FR-2). */
export type Language = 'fr' | 'en';

/** Next to `refuge.guest` (Bolt 10): one prefix for everything the site stores. */
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

/** The language saved by a flag click, or `null` if none, unknown, or storage is unavailable (BR-6). */
export function readSavedLanguage(): Language | null {
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return saved === 'fr' || saved === 'en' ? saved : null;
  } catch {
    return null;
  }
}

/**
 * Where to send the visitor before the app starts, or `null` to stay.
 *
 * Only a saved « English » moves anyone, and only off a French URL (FR-9).
 * An `/en/` URL always shows English (FR-10), so the English app never
 * redirects. The French app can itself be answering an `/en/…` URL — the
 * GitHub Pages `404.html` fallback, or `ng serve` running French only — and
 * must then stay put, or it would redirect to `/en/en/…` for ever.
 */
export function resolveLanguageRedirect(
  appLanguage: Language,
  saved: Language | null,
  location: Pick<Location, 'pathname' | 'search' | 'hash'>,
): string | null {
  const { pathname, search, hash } = location;
  const isEnglishPath = pathname === PATH_PREFIX.en || pathname.startsWith(`${PATH_PREFIX.en}/`);
  if (appLanguage !== 'fr' || saved !== 'en' || isEnglishPath) {
    return null;
  }
  return languageUrl('en', pathname + search + hash);
}
