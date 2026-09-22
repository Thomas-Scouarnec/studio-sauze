import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { StayComponent } from './stay';
import { GuestAccessService } from '../../services/guest-access.service';
import { StayService } from '../../services/stay.service';

describe('StayComponent', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [StayComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  afterEach(() => {
    localStorage.clear();
    document.head.querySelector('meta[name="robots"]')?.remove();
  });

  async function render(): Promise<HTMLElement> {
    const fixture = TestBed.createComponent(StayComponent);
    await fixture.whenStable();
    return fixture.nativeElement;
  }

  it('should render a banner with the navbar and the « Votre séjour » heading', async () => {
    const host = await render();
    const banner = host.querySelector('header.stay-banner');
    expect(banner?.querySelector('nav[aria-label="Navigation principale"]')).not.toBeNull();
    const heading = banner?.querySelector('h1');
    expect(heading?.textContent?.trim()).toBe('Votre séjour');
    expect(heading?.getAttribute('tabindex')).toBe('-1');
  });

  it('should render one focusable main landmark', async () => {
    const host = await render();
    const mains = host.querySelectorAll('main');
    expect(mains.length).toBe(1);
    expect(mains[0].id).toBe('main-content');
    expect(mains[0].getAttribute('tabindex')).toBe('-1');
  });

  it('should record the visitor as a guest (FR-4)', async () => {
    await render();
    expect(TestBed.inject(GuestAccessService).isGuest()).toBe(true);
  });

  it('should add noindex while shown and remove it when left (FR-3)', async () => {
    const fixture = TestBed.createComponent(StayComponent);
    await fixture.whenStable();
    expect(document.head.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex');

    fixture.destroy();
    expect(document.head.querySelector('meta[name="robots"]')).toBeNull();
  });

  it('should list every section in a « Sommaire » menu (FR-14)', async () => {
    const host = await render();
    const sections = TestBed.inject(StayService).sections();
    const toc = host.querySelector('nav[aria-label="Sommaire"]');
    const links = toc!.querySelectorAll<HTMLAnchorElement>('a');

    expect(links.length).toBe(sections.length);
    expect(Array.from(links).map((a) => a.getAttribute('href'))).toEqual(
      sections.map((section) => `/stay#${section.id}`),
    );
    expect(Array.from(links).map((a) => a.textContent?.trim())).toEqual(
      sections.map((section) => section.title),
    );
  });

  it('should render each section as a region labelled by its heading (FR-13)', async () => {
    const host = await render();
    const sections = TestBed.inject(StayService).sections();
    const rendered = host.querySelectorAll('section.stay-section');

    expect(rendered.length).toBe(sections.length);
    rendered.forEach((element, index) => {
      const { id, title } = sections[index];
      expect(element.id).toBe(id);
      const heading = element.querySelector('h2');
      expect(heading?.id).toBe(`${id}-heading`);
      expect(element.getAttribute('aria-labelledby')).toBe(heading?.id);
      expect(heading?.textContent?.trim()).toBe(title);
    });
  });

  it('should render the activity group titles as h3 (FR-15)', async () => {
    const host = await render();
    const titles = Array.from(host.querySelectorAll('#activities h3')).map((h) => h.textContent?.trim());
    expect(titles).toEqual(['Hiver', 'Été', 'En famille', 'Par temps de pluie']);
  });

  it('should show « Information à venir » for a fact not supplied yet (FR-16)', async () => {
    const host = await render();
    const pendingCount = TestBed.inject(StayService)
      .sections()
      .flatMap((s) => s.groups.flatMap((g) => g.items))
      .filter((item) => item.pending).length;

    const rendered = host.querySelectorAll('.stay-pending');
    expect(rendered.length).toBe(pendingCount);
    expect(rendered[0].textContent?.trim()).toBe('Information à venir');
  });

  it('should open external links in a new tab, and say so to screen readers', async () => {
    const host = await render();
    const links = host.querySelectorAll<HTMLAnchorElement>('.stay-item-link');
    expect(links.length).toBeGreaterThan(0);
    for (const link of Array.from(links)) {
      expect(link.target).toBe('_blank');
      expect(link.rel).toContain('noopener');
      expect(link.querySelector('.visually-hidden')?.textContent).toContain('nouvel onglet');
    }
  });
});
