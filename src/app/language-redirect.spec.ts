import { languageOf, languageUrl } from './language-redirect';

// The redirect of a saved « English » (FR-9) is an inline script in index.html,
// so it runs before the prerendered page paints: covered by e2e/prerendering.spec.ts.

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

describe('languageOf', () => {
  it('should read English from any English locale, French otherwise', () => {
    expect(languageOf('en')).toBe('en');
    expect(languageOf('en-US')).toBe('en');
    expect(languageOf('fr')).toBe('fr');
  });
});
