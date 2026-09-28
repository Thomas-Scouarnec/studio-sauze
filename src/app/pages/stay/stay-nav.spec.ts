import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { StaySection } from '../../services/stay.service';
import { StayNavComponent } from './stay-nav';

describe('StayNavComponent', () => {
  const sections: StaySection[] = [
    { id: 'welcome', title: 'Bienvenue', groups: [] },
    { id: 'arrival', title: "À l'arrivée", groups: [] },
    { id: 'activities', title: 'Activités', groups: [] }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StayNavComponent],
      providers: [provideRouter([])]
    }).compileComponents();
  });

  async function render(activeId: string | null = null) {
    const fixture = TestBed.createComponent(StayNavComponent);
    fixture.componentRef.setInput('sections', sections);
    fixture.componentRef.setInput('activeId', activeId);
    await fixture.whenStable();
    const host: HTMLElement = fixture.nativeElement;
    const links = () => Array.from(host.querySelectorAll<HTMLAnchorElement>('a'));
    return { fixture, host, links };
  }

  /** What a screen reader reads: the text outside `aria-hidden`. */
  function spokenText(element: Element): string {
    const clone = element.cloneNode(true) as Element;
    clone.querySelectorAll('[aria-hidden="true"]').forEach((hidden) => hidden.remove());
    return clone.textContent?.trim() ?? '';
  }

  it('should be a « Sommaire » navigation with an ordered list (FR-14)', async () => {
    const { host } = await render();
    const nav = host.querySelector('nav[aria-label="Sommaire"]');
    expect(nav).not.toBeNull();
    expect(nav?.querySelector('ol')).not.toBeNull();
  });

  it('should link each chip to its section', async () => {
    const { links } = await render();
    expect(links().map((a) => a.getAttribute('href'))).toEqual(['/stay#welcome', '/stay#arrival', '/stay#activities']);
    expect(links().map(spokenText)).toEqual(['Bienvenue', "À l'arrivée", 'Activités']);
  });

  it('should number the chips 1 to n, hidden from screen readers (FR-23)', async () => {
    const { host } = await render();
    const numbers = Array.from(host.querySelectorAll('.stay-nav-number'));
    expect(numbers.map((n) => n.textContent?.trim())).toEqual(['1', '2', '3']);
    numbers.forEach((n) => expect(n.getAttribute('aria-hidden')).toBe('true'));
  });

  it('should mark no chip as current when no section is being read', async () => {
    const { host } = await render(null);
    expect(host.querySelector('[aria-current]')).toBeNull();
  });

  it('should mark the section being read as the current location (FR-22)', async () => {
    const { fixture, links } = await render('arrival');
    expect(links().map((a) => a.getAttribute('aria-current'))).toEqual([null, 'location', null]);

    fixture.componentRef.setInput('activeId', 'activities');
    await fixture.whenStable();
    expect(links().map((a) => a.getAttribute('aria-current'))).toEqual([null, null, 'location']);
  });
});
