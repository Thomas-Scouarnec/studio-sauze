import { TestBed } from '@angular/core/testing';
import { ViewportScroller } from '@angular/common';
import { provideRouter } from '@angular/router';
import { FakeIntersectionObserver } from '../../testing/fake-intersection-observer';
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
  });

  async function render(): Promise<HTMLElement> {
    const fixture = TestBed.createComponent(StayComponent);
    await fixture.whenStable();
    return fixture.nativeElement;
  }

  /** What a screen reader reads: the text outside `aria-hidden`. */
  function spokenText(element: Element): string {
    const clone = element.cloneNode(true) as Element;
    clone.querySelectorAll('[aria-hidden="true"]').forEach((hidden) => hidden.remove());
    return clone.textContent?.trim() ?? '';
  }

  it('should render a banner with the navbar and the « Votre séjour » heading', async () => {
    const host = await render();
    const banner = host.querySelector('header.page-banner');
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

  it('should list every section in a « Sommaire » menu (FR-14)', async () => {
    const host = await render();
    const sections = TestBed.inject(StayService).sections();
    const toc = host.querySelector('main app-stay-nav nav[aria-label="Sommaire"]');
    const links = toc!.querySelectorAll<HTMLAnchorElement>('a');

    expect(links.length).toBe(sections.length);
    expect(Array.from(links).map((a) => a.getAttribute('href'))).toEqual(
      sections.map((section) => `/stay#${section.id}`),
    );
    expect(Array.from(links).map(spokenText)).toEqual(sections.map((section) => section.title));
  });

  it('should number the section headings in page order, hidden from screen readers (FR-23)', async () => {
    const host = await render();
    const numbers = Array.from(
      host.querySelectorAll('section.stay-section h2 .stay-section-number'),
    );
    expect(numbers.map((n) => n.textContent?.trim())).toEqual(
      TestBed.inject(StayService)
        .sections()
        .map((_, index) => String(index + 1)),
    );
    numbers.forEach((n) => expect(n.getAttribute('aria-hidden')).toBe('true'));
  });

  it('should tell the router what the sticky menu covers, and reset it when left (FR-24)', async () => {
    const scroller = TestBed.inject(ViewportScroller);
    const setOffset = vi.spyOn(scroller, 'setOffset');
    const fixture = TestBed.createComponent(StayComponent);
    await fixture.whenStable();

    const offset = setOffset.mock.calls[0][0];
    expect(typeof offset).toBe('function');
    // jsdom has no layout: the menu measures 0, leaving only the gap under it.
    expect((offset as () => [number, number])()).toEqual([0, 16]);

    fixture.destroy();
    expect(setOffset).toHaveBeenLastCalledWith([0, 0]);
  });

  describe('« Haut de page » (FR-26)', () => {
    beforeEach(() => {
      FakeIntersectionObserver.reset();
      vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('should appear only once the banner has scrolled away', async () => {
      const fixture = TestBed.createComponent(StayComponent);
      await fixture.whenStable();
      const host: HTMLElement = fixture.nativeElement;
      const banner = host.querySelector('header.page-banner')!;
      expect(host.querySelector('.stay-back-to-top')).toBeNull();

      FakeIntersectionObserver.watching(banner).report([{ target: banner, isIntersecting: false }]);
      await fixture.whenStable();
      const button = host.querySelector<HTMLButtonElement>('button.stay-back-to-top');
      expect(button?.type).toBe('button');
      expect(spokenText(button!)).toBe('Haut de page');

      FakeIntersectionObserver.watching(banner).report([{ target: banner, isIntersecting: true }]);
      await fixture.whenStable();
      expect(host.querySelector('.stay-back-to-top')).toBeNull();
    });

    it('should scroll to the top and focus « Votre séjour »', async () => {
      const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
      const fixture = TestBed.createComponent(StayComponent);
      await fixture.whenStable();
      const host: HTMLElement = fixture.nativeElement;
      const banner = host.querySelector('header.page-banner')!;
      FakeIntersectionObserver.watching(banner).report([{ target: banner, isIntersecting: false }]);
      await fixture.whenStable();

      host.querySelector<HTMLButtonElement>('.stay-back-to-top')!.click();
      expect(scrollTo).toHaveBeenCalledWith({ top: 0 });
      expect(document.activeElement).toBe(host.querySelector('h1'));
      scrollTo.mockRestore();
    });
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
      expect(spokenText(heading!)).toBe(title);
    });
  });

  it('should render the activity group titles as h3 (FR-15)', async () => {
    const host = await render();
    const titles = Array.from(host.querySelectorAll('#activities h3')).map((h) =>
      h.textContent?.trim(),
    );
    expect(titles).toEqual(['Hiver', 'Été', "Toute l'année"]);
  });

  it('should show an introduction before the placeholder when the item has one (FR-16)', async () => {
    const host = await render();
    const item = Array.from(host.querySelectorAll('#flat .stay-item')).find((li) =>
      li.textContent?.includes('Inventaire'),
    );
    expect(item?.querySelector('.stay-item-text')?.textContent).toContain('Rien à recompter');
    expect(item?.querySelector('.stay-pending')?.textContent?.trim()).toBe('Information à venir');
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

  it('should announce a photo still to take, naming what it must show (FR-21)', async () => {
    const host = await render();
    const slots = TestBed.inject(StayService)
      .sections()
      .flatMap((s) => s.groups.flatMap((g) => g.items))
      .flatMap((item) => item.photos ?? []);

    const rendered = host.querySelectorAll('.stay-photo-pending');
    expect(rendered.length).toBe(slots.filter((slot) => !slot.photo).length);
    expect(rendered[0].textContent).toContain('Photo à venir');
    expect(rendered[0].textContent).toContain(slots[0].description);
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
