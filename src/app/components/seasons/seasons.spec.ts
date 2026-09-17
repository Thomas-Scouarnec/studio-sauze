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

  it('should render a labelled photo placeholder hidden from assistive technology', async () => {
    const fixture = TestBed.createComponent(SeasonsComponent);
    await fixture.whenStable();
    const photos = fixture.nativeElement.querySelectorAll('.season-photo');
    expect(photos.length).toBe(2);
    photos.forEach((el: HTMLElement) => {
      expect(el.getAttribute('aria-hidden')).toBe('true');
      expect(el.textContent?.trim().length).toBeGreaterThan(0);
    });
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
