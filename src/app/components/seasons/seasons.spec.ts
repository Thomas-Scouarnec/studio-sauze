import { TestBed } from '@angular/core/testing';
import { SeasonsComponent } from './seasons';

describe('SeasonsComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeasonsComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(SeasonsComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the two season cards', async () => {
    const fixture = TestBed.createComponent(SeasonsComponent);
    await fixture.whenStable();
    const cards = fixture.nativeElement.querySelectorAll('.season-card');
    expect(cards.length).toBe(2);
    expect(fixture.nativeElement.querySelector('.season-card.winter')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.season-card.summer')).toBeTruthy();
  });

  it('should render three highlights per card, each with a title and a text', async () => {
    const fixture = TestBed.createComponent(SeasonsComponent);
    await fixture.whenStable();
    for (const card of fixture.nativeElement.querySelectorAll('.season-card')) {
      expect(card.querySelectorAll('.season-highlight').length).toBe(3);
      card
        .querySelectorAll('.season-highlight-title, .season-highlight-text')
        .forEach((el: HTMLElement) => expect(el.textContent?.trim().length).toBeGreaterThan(0));
    }
  });

  it('should render one described, lazy-loaded photo per card', async () => {
    const fixture = TestBed.createComponent(SeasonsComponent);
    await fixture.whenStable();
    const photos: NodeListOf<HTMLImageElement> =
      fixture.nativeElement.querySelectorAll('.season-photo img');
    expect(photos.length).toBe(2);
    photos.forEach((img) => {
      expect(img.getAttribute('alt')?.trim().length).toBeGreaterThan(0);
      expect(img.getAttribute('loading')).toBe('lazy');
      expect(img.getAttribute('sizes')).toBeTruthy();
    });
  });

  it('should offer each photo in its two widths through the image loader', async () => {
    const fixture = TestBed.createComponent(SeasonsComponent);
    await fixture.whenStable();
    const [winter, summer]: HTMLImageElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('.season-photo img'),
    );
    expect(winter.getAttribute('src')).toBe('/images/seasons/sauze-winter-800w.webp');
    expect(winter.getAttribute('srcset')).toBe(
      '/images/seasons/sauze-winter-800w.webp 800w, /images/seasons/sauze-winter-1600w.webp 1600w',
    );
    expect(summer.getAttribute('srcset')).toBe(
      '/images/seasons/barcelonnette-summer-800w.webp 800w, /images/seasons/barcelonnette-summer-1260w.webp 1260w',
    );
  });

  it('should not hide anything from assistive technology', async () => {
    const fixture = TestBed.createComponent(SeasonsComponent);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[aria-hidden="true"]')).toBeNull();
  });

  it('should render one safe external link per card, warning about the new tab', async () => {
    const fixture = TestBed.createComponent(SeasonsComponent);
    await fixture.whenStable();
    const links = fixture.nativeElement.querySelectorAll('.season-link');
    expect(links.length).toBe(2);
    links.forEach((el: HTMLAnchorElement) => {
      expect(el.getAttribute('target')).toBe('_blank');
      expect(el.getAttribute('rel')).toBe('noopener noreferrer');
      expect(el.querySelector('.visually-hidden')?.textContent).toContain('nouvel onglet');
    });
  });

  it('should render the activity tags', async () => {
    const fixture = TestBed.createComponent(SeasonsComponent);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('.tag').length).toBeGreaterThan(0);
  });

  it('should have the correct ARIA attributes on the host element', () => {
    const fixture = TestBed.createComponent(SeasonsComponent);
    const host: HTMLElement = fixture.nativeElement;
    expect(host.getAttribute('role')).toBe('region');
    expect(host.getAttribute('aria-labelledby')).toBe('activities-heading');
  });
});
