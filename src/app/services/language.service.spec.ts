import { Component, LOCALE_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { LanguageService } from './language.service';

@Component({ template: '' })
class BlankPage {}

describe('LanguageService', () => {
  function setUp(localeId: string): void {
    TestBed.configureTestingModule({
      providers: [
        { provide: LOCALE_ID, useValue: localeId },
        provideRouter([
          { path: '', component: BlankPage },
          { path: 'stay', component: BlankPage },
        ]),
      ],
    });
  }

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('should take the current language from the build (LOCALE_ID)', () => {
    setUp('fr');
    expect(TestBed.inject(LanguageService).current).toBe('fr');
    TestBed.resetTestingModule();
    setUp('en');
    expect(TestBed.inject(LanguageService).current).toBe('en');
  });

  it('should link both languages to the current page, section included (FR-7)', async () => {
    setUp('fr');
    const harness = await RouterTestingHarness.create();
    const service = TestBed.inject(LanguageService);

    await harness.navigateByUrl('/stay#arrival');
    expect(service.links()).toEqual([
      { code: 'fr', name: 'Français', href: '/stay#arrival', isCurrent: true },
      { code: 'en', name: 'English', href: '/en/stay#arrival', isCurrent: false },
    ]);

    await harness.navigateByUrl('/#contact');
    expect(service.links().map((link) => link.href)).toEqual(['/#contact', '/en/#contact']);
  });

  it('should mark English as current in the English app', async () => {
    setUp('en');
    await RouterTestingHarness.create('/');
    const current = TestBed.inject(LanguageService)
      .links()
      .filter((link) => link.isCurrent);
    expect(current.map((link) => link.code)).toEqual(['en']);
  });

  it('should save the chosen language (FR-8)', () => {
    setUp('fr');
    TestBed.inject(LanguageService).choose('en');
    expect(localStorage.getItem('refuge.lang')).toBe('en');
  });

  it('should survive a storage that throws (BR-6)', () => {
    setUp('fr');
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    expect(() => TestBed.inject(LanguageService).choose('en')).not.toThrow();
  });
});
