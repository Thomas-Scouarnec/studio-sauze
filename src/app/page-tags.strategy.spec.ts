import { Component, LOCALE_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TitleStrategy, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { PageTags, PageTagsStrategy } from './page-tags.strategy';

@Component({ template: '' })
class PageComponent {}

const indexed: PageTags = { description: 'A page for everyone.', indexed: true };
const unlisted: PageTags = { description: 'A page for guests.', indexed: false };

const testRoutes = [
  { path: '', component: PageComponent, title: 'Home', data: { tags: indexed } },
  { path: 'stay', component: PageComponent, title: 'Stay', data: { tags: unlisted } },
  { path: 'bare', component: PageComponent, title: 'Bare' },
];

/** The `<head>` as the strategy leaves it. */
const head = {
  meta: (selector: string) =>
    document.head.querySelector(`meta[${selector}]`)?.getAttribute('content') ?? null,
  count: (selector: string) => document.head.querySelectorAll(selector).length,
  hrefs: (selector: string) =>
    [...document.head.querySelectorAll(selector)].map((link) => link.getAttribute('href')),
};

describe('PageTagsStrategy', () => {
  function setUp(locale: string): Promise<RouterTestingHarness> {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(testRoutes),
        { provide: TitleStrategy, useClass: PageTagsStrategy },
        { provide: LOCALE_ID, useValue: locale },
      ],
    });
    return RouterTestingHarness.create();
  }

  afterEach(() => {
    document.head
      .querySelectorAll('meta[name], meta[property], link[rel="canonical"], link[hreflang]')
      .forEach((element) => element.remove());
  });

  describe('on an indexed page', () => {
    it('should set the title, description and preview tags (FR-1, FR-3)', async () => {
      const harness = await setUp('fr');
      await harness.navigateByUrl('/#contact');

      expect(document.title).toBe('Home');
      expect(head.meta('name="description"')).toBe('A page for everyone.');
      expect(head.meta('property="og:description"')).toBe('A page for everyone.');
      expect(head.meta('property="og:title"')).toBe('Home');
      expect(head.meta('property="og:site_name"')).toBe('Notre Refuge au Sauze');
      expect(head.meta('property="og:type"')).toBe('website');
      expect(head.meta('name="twitter:card"')).toBe('summary_large_image');
    });

    it('should use absolute URLs, without the section (FR-5)', async () => {
      const harness = await setUp('fr');
      await harness.navigateByUrl('/#contact');

      expect(head.meta('property="og:url"')).toBe('https://refugedusauze.com/');
      expect(head.meta('property="og:image"')).toBe(
        'https://refugedusauze.com/images/share/preview-1200x630.jpg',
      );
      expect(head.meta('property="og:image:width"')).toBe('1200');
      expect(head.meta('property="og:image:height"')).toBe('630');
      expect(head.meta('property="og:image:alt"')).toContain('Sauze');
    });

    it('should link to itself and to both languages, French by default (FR-7, FR-8)', async () => {
      const harness = await setUp('fr');
      await harness.navigateByUrl('/');

      expect(head.hrefs('link[rel="canonical"]')).toEqual(['https://refugedusauze.com/']);
      expect(head.hrefs('link[hreflang="fr"]')).toEqual(['https://refugedusauze.com/']);
      expect(head.hrefs('link[hreflang="en"]')).toEqual(['https://refugedusauze.com/en/']);
      expect(head.hrefs('link[hreflang="x-default"]')).toEqual(['https://refugedusauze.com/']);
      expect(head.count('meta[name="robots"]')).toBe(0);
    });

    it('should describe the English page in English (FR-4)', async () => {
      const harness = await setUp('en-US');
      await harness.navigateByUrl('/');

      expect(head.meta('property="og:url"')).toBe('https://refugedusauze.com/en/');
      expect(head.hrefs('link[rel="canonical"]')).toEqual(['https://refugedusauze.com/en/']);
      expect(head.meta('property="og:locale"')).toBe('en_GB');
      expect(head.meta('property="og:locale:alternate"')).toBe('fr_FR');
    });

    it('should mark the French page as French', async () => {
      const harness = await setUp('fr');
      await harness.navigateByUrl('/');

      expect(head.meta('property="og:locale"')).toBe('fr_FR');
      expect(head.meta('property="og:locale:alternate"')).toBe('en_GB');
    });
  });

  describe('on an unlisted page', () => {
    it('should add noindex, with no canonical or language links (FR-9)', async () => {
      const harness = await setUp('fr');
      await harness.navigateByUrl('/stay');

      expect(head.meta('name="robots"')).toBe('noindex');
      expect(head.count('link[rel="canonical"], link[hreflang]')).toBe(0);
    });

    it('should still give a description and a preview (FR-10)', async () => {
      const harness = await setUp('fr');
      await harness.navigateByUrl('/stay');

      expect(head.meta('name="description"')).toBe('A page for guests.');
      expect(head.meta('property="og:url"')).toBe('https://refugedusauze.com/stay');
    });
  });

  it('should treat a route without tags as unlisted, with no description', async () => {
    const harness = await setUp('fr');
    await harness.navigateByUrl('/bare');

    expect(head.meta('name="robots"')).toBe('noindex');
    expect(head.count('meta[name="description"], meta[property="og:description"]')).toBe(0);
  });

  it('should leave only the current page’s tags after moving between pages (FR-13)', async () => {
    const harness = await setUp('fr');
    await harness.navigateByUrl('/');
    await harness.navigateByUrl('/stay');
    await harness.navigateByUrl('/');

    expect(head.count('meta[name="robots"]')).toBe(0);
    expect(head.count('meta[name="description"]')).toBe(1);
    expect(head.count('meta[property="og:title"]')).toBe(1);
    expect(head.count('link[rel="canonical"]')).toBe(1);
    expect(head.count('link[hreflang]')).toBe(3);
    expect(head.meta('name="description"')).toBe('A page for everyone.');
  });
});
