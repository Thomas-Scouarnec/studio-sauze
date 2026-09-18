import { TestBed } from '@angular/core/testing';
import { ContactComponent } from './contact';
import { ContactService } from '../../services/contact.service';

describe('ContactComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactComponent],
    }).compileComponents();
  });

  async function render(): Promise<HTMLElement> {
    const fixture = TestBed.createComponent(ContactComponent);
    await fixture.whenStable();
    return fixture.nativeElement;
  }

  it('should create', () => {
    const fixture = TestBed.createComponent(ContactComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should have the correct ARIA attributes on the host element', () => {
    const host: HTMLElement = TestBed.createComponent(ContactComponent).nativeElement;
    expect(host.getAttribute('id')).toBe('contact');
    expect(host.getAttribute('role')).toBe('region');
    expect(host.getAttribute('aria-labelledby')).toBe('contact-heading');
  });

  it('should be labelled "Contact" to match the navbar (FR-10)', async () => {
    const host = await render();
    expect(host.querySelector('.section-label')?.textContent?.trim()).toBe('Contact');
    const heading = host.querySelector('.section-title');
    expect(heading?.tagName).toBe('H2');
    expect(heading?.id).toBe('contact-heading');
  });

  it('should not render any form (FR-4)', async () => {
    const host = await render();
    expect(host.querySelector('form, input, textarea, select, button')).toBeNull();
  });

  it('should render the email as a visible mailto link', async () => {
    const host = await render();
    const email = TestBed.inject(ContactService).email;
    const link = host.querySelector<HTMLAnchorElement>('.contact-email');
    expect(link?.getAttribute('href')).toBe(`mailto:${email}`);
    expect(link?.textContent).toContain(email);
  });

  it('should render three checklist items labelled by their heading', async () => {
    const host = await render();
    const heading = host.querySelector('.contact-request-title');
    const list = host.querySelector('.contact-checklist');
    expect(heading?.tagName).toBe('H3');
    expect(list?.getAttribute('aria-labelledby')).toBe(heading?.id);
    expect(host.querySelectorAll('.contact-checklist-item').length).toBe(3);
  });

  it('should state that no booking is recorded on the site (FR-8)', async () => {
    const host = await render();
    expect(host.querySelector('.contact-request-note')?.textContent).toContain(
      "aucune réservation n'est enregistrée sur ce site"
    );
  });

  it('should promise a quick reply without a time figure (FR-7)', async () => {
    const text = (await render()).textContent ?? '';
    expect(text).toContain('rapidement');
    expect(text).not.toMatch(/\d+\s*h\b|heures|jours/);
  });

  it('should contain no location facts (FR-9)', async () => {
    const text = (await render()).textContent ?? '';
    for (const fact of ['Station du Sauze', 'Alpes de Haute-Provence', '04400']) {
      expect(text).not.toContain(fact);
    }
  });

  it('should hide decorative icons from assistive technology', async () => {
    const host = await render();
    const icons = host.querySelectorAll('.contact-email-icon, .contact-checklist-icon');
    expect(icons.length).toBe(4);
    icons.forEach((el) => expect(el.getAttribute('aria-hidden')).toBe('true'));
  });
});
