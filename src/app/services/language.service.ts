import { Injectable, LOCALE_ID, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';
import { LANGUAGE_STORAGE_KEY, Language, languageUrl } from '../language-redirect';

export interface LanguageLink {
  code: Language;
  /** In the language itself, whatever the page's language (US-5). */
  name: string;
  /** The current page in that language, section included (FR-7). */
  href: string;
  isCurrent: boolean;
}

const LANGUAGES: readonly { code: Language; name: string }[] = [
  { code: 'fr', name: 'Français' },
  { code: 'en', name: 'English' },
];

/**
 * The language of this compiled app, and the way to the other one.
 *
 * Each language is a separate app (built-in i18n), so switching is a page
 * load to the other app's URL, not a state change here.
 */
@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly router = inject(Router);

  /** Set by the build for each language; `en-US` in tests unless provided. */
  readonly current: Language = inject(LOCALE_ID).startsWith('en') ? 'en' : 'fr';

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );

  readonly links = computed<LanguageLink[]>(() =>
    LANGUAGES.map(({ code, name }) => ({
      code,
      name,
      href: languageUrl(code, this.url()),
      isCurrent: code === this.current,
    })),
  );

  /** Remembers the choice (FR-8); the link's own navigation does the switch. */
  choose(language: Language): void {
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      // Not remembered (BR-6): the next visit opens in French, the default.
    }
  }
}
