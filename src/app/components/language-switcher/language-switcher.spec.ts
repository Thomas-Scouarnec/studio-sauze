import { Component, LOCALE_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { LanguageSwitcherComponent } from './language-switcher';

@Component({ imports: [LanguageSwitcherComponent], template: '<app-language-switcher />' })
class StayStub {}

describe('LanguageSwitcherComponent', () => {
  async function renderAt(url: string, localeId: string): Promise<HTMLElement> {
    TestBed.configureTestingModule({
      providers: [
        { provide: LOCALE_ID, useValue: localeId },
        provideRouter([{ path: 'stay', component: StayStub }]),
      ],
    });
    const harness = await RouterTestingHarness.create(url);
    return harness.routeNativeElement!;
  }

  afterEach(() => {
    localStorage.clear();
  });

  it('should name the list in the page language and show one item per language', async () => {
    const host = await renderAt('/stay', 'fr');
    const list = host.querySelector('ul.lang-switcher');
    expect(list?.getAttribute('aria-label')).toBe('Langue');
    expect(list?.querySelectorAll('li').length).toBe(2);
  });

  it('should announce the current language as current, without a link (FR-7)', async () => {
    const host = await renderAt('/stay', 'fr');
    const current = host.querySelector('.lang-flag.is-current');
    expect(current?.tagName).toBe('SPAN');
    expect(current?.querySelector('a')).toBeNull();
    expect(current?.querySelector('[lang="fr"]')?.textContent).toBe('Français');
    expect(current?.textContent?.replace(/\s+/g, ' ').trim()).toBe('Français (langue actuelle)');
  });

  it('should link the other language to the same page and section (FR-7)', async () => {
    const host = await renderAt('/stay#arrival', 'fr');
    const link = host.querySelector<HTMLAnchorElement>('a.lang-flag');
    expect(link?.getAttribute('href')).toBe('/en/stay#arrival');
    expect(link?.getAttribute('hreflang')).toBe('en');
    // Named in its own language, pronounced as such (US-5).
    expect(link?.getAttribute('lang')).toBe('en');
    expect(link?.textContent?.trim()).toBe('English');
  });

  it('should link back to French from the English app', async () => {
    const host = await renderAt('/stay', 'en');
    const link = host.querySelector<HTMLAnchorElement>('a.lang-flag');
    expect(link?.getAttribute('href')).toBe('/stay');
    expect(link?.textContent?.trim()).toBe('Français');
  });

  it('should save the choice when a flag is clicked (FR-8)', async () => {
    const host = await renderAt('/stay', 'fr');
    const link = host.querySelector<HTMLAnchorElement>('a.lang-flag')!;
    // jsdom does not navigate; only the side effect of the click matters here.
    link.addEventListener('click', (event) => event.preventDefault());
    link.click();
    expect(localStorage.getItem('refuge.lang')).toBe('en');
  });

  it('should keep the flags out of the accessibility tree', async () => {
    const host = await renderAt('/stay', 'fr');
    const flags = Array.from(host.querySelectorAll('svg.flag'));
    expect(flags.length).toBe(2);
    expect(flags.every((flag) => flag.getAttribute('aria-hidden') === 'true')).toBe(true);
  });
});
