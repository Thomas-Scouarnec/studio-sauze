import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HomeNavComponent } from './home-nav';
import { GuestAccessService } from '../../services/guest-access.service';
import { HOME_SECTIONS } from '../../shared/home-sections';

describe('HomeNavComponent', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [HomeNavComponent],
      // An empty-path route, so choosing a section in a test can navigate to `/`.
      providers: [provideRouter([{ path: '', children: [] }])],
    }).compileComponents();
  });

  afterEach(() => {
    localStorage.clear();
  });

  async function render(activeId: string | null = null) {
    const fixture = TestBed.createComponent(HomeNavComponent);
    fixture.componentRef.setInput('activeId', activeId);
    await fixture.whenStable();
    const host: HTMLElement = fixture.nativeElement;
    const button = () => host.querySelector<HTMLButtonElement>('button.home-nav-toggle')!;
    const panel = () => host.querySelector<HTMLElement>('.home-nav-panel')!;
    const sectionLinks = () =>
      Array.from(host.querySelectorAll<HTMLAnchorElement>('.home-nav-sections a'));
    const click = async (element: HTMLElement) => {
      element.click();
      await fixture.whenStable();
    };
    return { fixture, host, button, panel, sectionLinks, click };
  }

  /** What a screen reader reads: the text outside `aria-hidden`, whitespace collapsed. */
  function spokenText(element: Element): string {
    const clone = element.cloneNode(true) as Element;
    clone.querySelectorAll('[aria-hidden="true"]').forEach((hidden) => hidden.remove());
    return clone.textContent?.replace(/\s+/g, ' ').trim() ?? '';
  }

  it('should be a navigation landmark named apart from the navbar (BR-2)', async () => {
    const { host } = await render();
    expect(host.querySelector('nav')?.getAttribute('aria-label')).toBe('Navigation de la page');
  });

  it('should read « Menu » above the first section (FR-2)', async () => {
    const { button } = await render(null);
    expect(spokenText(button())).toBe('Menu');
  });

  it('should name the section being read, and say « Menu, section actuelle : » to screen readers (FR-2)', async () => {
    const { fixture, button } = await render('equipment');
    expect(spokenText(button())).toBe('Menu, section actuelle : Équipements');
    expect(button().querySelector('.visually-hidden')?.textContent).toBe(
      'Menu, section actuelle :',
    );

    fixture.componentRef.setInput('activeId', 'contact');
    await fixture.whenStable();
    expect(spokenText(button())).toBe('Menu, section actuelle : Contact');
  });

  it('should be a disclosure button for the panel', async () => {
    const { button, panel } = await render();
    expect(button().type).toBe('button');
    expect(button().getAttribute('aria-controls')).toBe(panel().id);
    expect(button().getAttribute('aria-expanded')).toBe('false');
    expect(panel().classList).not.toContain('is-open');
  });

  it('should list the four home sections in page order, linked by fragment (FR-3)', async () => {
    const { sectionLinks } = await render();
    expect(sectionLinks().map((a) => a.getAttribute('href'))).toEqual(
      HOME_SECTIONS.map((s) => `/#${s.id}`),
    );
    expect(sectionLinks().map((a) => a.textContent?.trim())).toEqual([
      "L'appartement",
      'Équipements',
      'Activités',
      'Contact',
    ]);
  });

  it('should mark the section being read as the current location (FR-3)', async () => {
    const { sectionLinks } = await render('activities');
    expect(sectionLinks().map((a) => a.getAttribute('aria-current'))).toEqual([
      null,
      null,
      'location',
      null,
    ]);
  });

  it('should open the panel, and close it when a section is chosen (FR-6)', async () => {
    const { button, panel, sectionLinks, click } = await render();
    await click(button());
    expect(button().getAttribute('aria-expanded')).toBe('true');
    expect(panel().classList).toContain('is-open');

    await click(sectionLinks()[1]);
    expect(button().getAttribute('aria-expanded')).toBe('false');
  });

  it('should always show a « Contact » link outside the panel (FR-5)', async () => {
    const { host, panel } = await render();
    const contact = host.querySelector<HTMLAnchorElement>('.home-nav-bar a.home-nav-contact');
    expect(contact?.getAttribute('href')).toBe('/#contact');
    expect(contact?.textContent?.trim()).toBe('Contact');
    expect(panel().contains(contact)).toBe(false);
  });

  it('should close the panel when « Contact » is chosen', async () => {
    const { host, button, click } = await render();
    await click(button());
    await click(host.querySelector<HTMLAnchorElement>('a.home-nav-contact')!);
    expect(button().getAttribute('aria-expanded')).toBe('false');
  });

  it('should hold the language flags, and « Mon séjour » for guests only (FR-4)', async () => {
    const first = await render();
    expect(first.panel().querySelector('app-language-switcher')).not.toBeNull();
    expect(first.panel().querySelector('a[href="/stay"]')).toBeNull();

    TestBed.inject(GuestAccessService).markAsGuest();
    await first.fixture.whenStable();
    const stay = first.panel().querySelector<HTMLAnchorElement>('a[href="/stay"]');
    expect(stay?.textContent?.trim()).toBe('Mon séjour');
  });
});
