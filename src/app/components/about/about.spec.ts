import { TestBed } from '@angular/core/testing';
import { AboutComponent } from './about';

describe('AboutComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(AboutComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should have the correct ARIA attributes on the host element', () => {
    const fixture = TestBed.createComponent(AboutComponent);
    const host: HTMLElement = fixture.nativeElement;
    expect(host.getAttribute('role')).toBe('region');
    expect(host.getAttribute('aria-labelledby')).toBe('about-heading');
  });

  it('should render the séjour and forest photos, described and lazy-loaded (FR-19, FR-20)', async () => {
    const fixture = TestBed.createComponent(AboutComponent);
    await fixture.whenStable();
    const main: HTMLImageElement = fixture.nativeElement.querySelector('.about-photo-main img');
    const side: HTMLImageElement = fixture.nativeElement.querySelector('.about-photo-side img');

    expect(main.getAttribute('alt')).toBe('Le séjour, avec son canapé-lit et sa commode en pin');
    expect(main.getAttribute('srcset')).toBe(
      '/images/about/living-room-800w.webp 800w, /images/about/living-room-1200w.webp 1200w',
    );
    expect(side.getAttribute('alt')).toBe('La fenêtre du séjour, ouverte sur la forêt');
    expect(side.getAttribute('srcset')).toBe('/images/about/forest-view-800w.webp 800w');
    for (const img of [main, side]) {
      expect(img.getAttribute('loading')).toBe('lazy');
      expect(img.getAttribute('sizes')).toBeTruthy();
    }
  });

  it('should hide nothing in the collage from assistive technology', async () => {
    const fixture = TestBed.createComponent(AboutComponent);
    await fixture.whenStable();
    const visual: HTMLElement = fixture.nativeElement.querySelector('.about-visual');
    expect(visual.getAttribute('aria-hidden')).toBeNull();
    expect(visual.querySelector('[aria-hidden="true"]')).toBeNull();
  });

  it('should show only photos in the collage, with no empty block', async () => {
    const fixture = TestBed.createComponent(AboutComponent);
    await fixture.whenStable();
    const visual: HTMLElement = fixture.nativeElement.querySelector('.about-visual');
    expect(visual.children.length).toBe(3);
    expect(visual.querySelectorAll('.about-photo img').length).toBe(3);
  });

  it('should render the Chapeau du Gendarme as the wide photo', async () => {
    const fixture = TestBed.createComponent(AboutComponent);
    await fixture.whenStable();
    const wide: HTMLImageElement = fixture.nativeElement.querySelector('.about-photo-wide img');
    expect(wide.getAttribute('alt')).toBe('Le Chapeau du Gendarme, sommet calcaire sous un ciel bleu');
    expect(wide.getAttribute('srcset')).toBe('/images/about/mountain-800w.webp 800w');
    expect(wide.getAttribute('loading')).toBe('lazy');
  });

  it('should no longer show the decorative emoji', async () => {
    const fixture = TestBed.createComponent(AboutComponent);
    await fixture.whenStable();
    const visual: HTMLElement = fixture.nativeElement.querySelector('.about-visual');
    expect(visual.textContent).not.toMatch(/⛷|🏔/u);
  });

  it('should keep the Maps link opening safely in a new tab', async () => {
    const fixture = TestBed.createComponent(AboutComponent);
    await fixture.whenStable();
    const link: HTMLAnchorElement = fixture.nativeElement.querySelector('.about-maps-link');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    expect(link.querySelector('.visually-hidden')?.textContent).toContain('nouvel onglet');
  });
});
