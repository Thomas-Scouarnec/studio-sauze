import {
  LANGUAGE_STORAGE_KEY,
  languageUrl,
  readSavedLanguage,
  resolveLanguageRedirect,
} from './language-redirect';

function at(pathname: string, search = '', hash = '') {
  return { pathname, search, hash };
}

describe('languageUrl', () => {
  it('should keep French URLs at the root (FR-2)', () => {
    expect(languageUrl('fr', '/')).toBe('/');
    expect(languageUrl('fr', '/stay#arrival')).toBe('/stay#arrival');
  });

  it('should put English URLs under /en (FR-3), keeping the section', () => {
    expect(languageUrl('en', '/')).toBe('/en/');
    expect(languageUrl('en', '/#contact')).toBe('/en/#contact');
    expect(languageUrl('en', '/stay#arrival')).toBe('/en/stay#arrival');
  });
});

describe('resolveLanguageRedirect', () => {
  it('should send a visitor who saved English from a French URL to the same English page (FR-9)', () => {
    expect(resolveLanguageRedirect('fr', 'en', at('/'))).toBe('/en/');
    expect(resolveLanguageRedirect('fr', 'en', at('/stay', '?utm=mail', '#arrival'))).toBe(
      '/en/stay?utm=mail#arrival',
    );
  });

  it('should leave a visitor with no saved choice, or French, on French (FR-2)', () => {
    expect(resolveLanguageRedirect('fr', null, at('/stay'))).toBeNull();
    expect(resolveLanguageRedirect('fr', 'fr', at('/stay'))).toBeNull();
  });

  it('should never redirect away from an English URL, whatever the saved choice (FR-10)', () => {
    expect(resolveLanguageRedirect('en', 'fr', at('/en/stay'))).toBeNull();
    expect(resolveLanguageRedirect('en', null, at('/en/'))).toBeNull();
  });

  it('should not loop when the French app answers an /en/ URL (404 fallback, ng serve)', () => {
    expect(resolveLanguageRedirect('fr', 'en', at('/en/'))).toBeNull();
    expect(resolveLanguageRedirect('fr', 'en', at('/en'))).toBeNull();
    expect(resolveLanguageRedirect('fr', 'en', at('/en/unknown'))).toBeNull();
  });

  it('should not mistake a French path that merely starts with "en" for English', () => {
    expect(resolveLanguageRedirect('fr', 'en', at('/enchastrayes'))).toBe('/en/enchastrayes');
  });
});

describe('readSavedLanguage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('should read a saved language', () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'en');
    expect(readSavedLanguage()).toBe('en');
  });

  it('should ignore a missing or unknown value', () => {
    expect(readSavedLanguage()).toBeNull();
    localStorage.setItem(LANGUAGE_STORAGE_KEY, '/evil.example');
    expect(readSavedLanguage()).toBeNull();
  });

  it('should survive a storage that throws (BR-6)', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    expect(readSavedLanguage()).toBeNull();
  });
});
