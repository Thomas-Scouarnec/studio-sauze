import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { StaySection } from '../../services/stay.service';
import { StayNavComponent } from './stay-nav';

describe('StayNavComponent', () => {
  const sections: StaySection[] = [
    { id: 'welcome', title: 'Bienvenue', groups: [] },
    { id: 'arrival', title: "À l'arrivée", groups: [] },
    { id: 'activities', title: 'Activités', groups: [] },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StayNavComponent],
      // A `stay` route, so choosing a section in a test can navigate.
      providers: [provideRouter([{ path: 'stay', children: [] }])],
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
    expect(links().map((a) => a.getAttribute('href'))).toEqual([
      '/stay#welcome',
      '/stay#arrival',
      '/stay#activities',
    ]);
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

  describe('compact bar (FR-27, FR-28)', () => {
    // Which of the two presentations shows is CSS (a media query), which jsdom
    // does not apply: these tests check the markup and behaviour; the browser
    // checks in the Bolt 14 plan cover the layout.
    async function renderBar(activeId: string | null = null) {
      const rendered = await render(activeId);
      const { host, fixture } = rendered;
      const button = () => host.querySelector<HTMLButtonElement>('button.stay-nav-toggle')!;
      const list = () => host.querySelector<HTMLOListElement>('ol')!;
      const progress = () => host.querySelector<HTMLElement>('.stay-nav-progress')!;
      const click = async (element: HTMLElement) => {
        element.click();
        await fixture.whenStable();
      };
      return { ...rendered, button, list, progress, click };
    }

    it('should read « Sommaire » above the first section', async () => {
      const { button } = await renderBar(null);
      expect(spokenText(button())).toBe('Sommaire');
    });

    it("should show « 2/3 · À l'arrivée », and say « Section 2 sur 3 : » to screen readers", async () => {
      const { button } = await renderBar('arrival');
      expect(button().textContent?.replace(/\s+/g, ' ').trim()).toBe(
        "Section 2 sur 3 :2/3 · À l'arrivée",
      );
      expect(spokenText(button()).replace(/\s+/g, ' ')).toBe("Section 2 sur 3 : À l'arrivée");
      expect(button().querySelector('.visually-hidden')?.textContent).toBe('Section 2 sur 3 :');
    });

    it('should follow the section being read', async () => {
      const { fixture, button } = await renderBar('arrival');
      fixture.componentRef.setInput('activeId', 'activities');
      await fixture.whenStable();
      expect(spokenText(button()).replace(/\s+/g, ' ')).toBe('Section 3 sur 3 : Activités');
    });

    it('should be a disclosure button for the list', async () => {
      const { button, list } = await renderBar();
      expect(button().type).toBe('button');
      expect(button().getAttribute('aria-controls')).toBe(list().id);
      expect(button().getAttribute('aria-expanded')).toBe('false');
      expect(list().classList).not.toContain('is-open');
    });

    it('should open and close the list on each tap of the bar', async () => {
      const { button, list, click } = await renderBar('arrival');
      await click(button());
      expect(button().getAttribute('aria-expanded')).toBe('true');
      expect(list().classList).toContain('is-open');

      await click(button());
      expect(button().getAttribute('aria-expanded')).toBe('false');
      expect(list().classList).not.toContain('is-open');
    });

    it('should close the list when a section is chosen', async () => {
      const { button, links, click } = await renderBar();
      await click(button());
      await click(links()[2]);
      expect(button().getAttribute('aria-expanded')).toBe('false');
    });

    it('should close the list on Escape and put focus back on the bar', async () => {
      const { fixture, button, links, click } = await renderBar();
      document.body.appendChild(fixture.nativeElement);
      await click(button());
      links()[1].focus();

      links()[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await fixture.whenStable();
      expect(button().getAttribute('aria-expanded')).toBe('false');
      expect(document.activeElement).toBe(button());
      fixture.nativeElement.remove();
    });

    it('should close the list on a tap outside, not on a tap inside', async () => {
      const { fixture, host, button, click } = await renderBar();
      await click(button());

      await click(host.querySelector('ol')!);
      expect(button().getAttribute('aria-expanded')).toBe('true');

      document.body.click();
      await fixture.whenStable();
      expect(button().getAttribute('aria-expanded')).toBe('false');
    });

    it('should close the list when focus leaves it, not when it moves within it', async () => {
      const { fixture, button, links, click } = await renderBar();
      await click(button());
      const outside = document.createElement('button');
      document.body.appendChild(outside);

      links()[0].dispatchEvent(
        new FocusEvent('focusout', { bubbles: true, relatedTarget: links()[1] }),
      );
      await fixture.whenStable();
      expect(button().getAttribute('aria-expanded')).toBe('true');

      // iOS Safari: tapping the bar gives no focus target; the tap itself toggles.
      links()[0].dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: null }));
      await fixture.whenStable();
      expect(button().getAttribute('aria-expanded')).toBe('true');

      links()[2].dispatchEvent(
        new FocusEvent('focusout', { bubbles: true, relatedTarget: outside }),
      );
      await fixture.whenStable();
      expect(button().getAttribute('aria-expanded')).toBe('false');
      outside.remove();
    });

    it('should fill the progress line in proportion, hidden from screen readers', async () => {
      const { fixture, progress } = await renderBar(null);
      expect(progress().getAttribute('aria-hidden')).toBe('true');
      expect(progress().style.transform).toBe('scaleX(0)');

      fixture.componentRef.setInput('activeId', 'arrival');
      await fixture.whenStable();
      expect(progress().style.transform).toBe(`scaleX(${2 / 3})`);

      fixture.componentRef.setInput('activeId', 'activities');
      await fixture.whenStable();
      expect(progress().style.transform).toBe('scaleX(1)');
    });
  });
});
