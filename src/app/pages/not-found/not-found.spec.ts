import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NotFoundComponent } from './not-found';

describe('NotFoundComponent', () => {
  async function render(): Promise<HTMLElement> {
    await TestBed.configureTestingModule({
      imports: [NotFoundComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(NotFoundComponent);
    await fixture.whenStable();
    return fixture.nativeElement;
  }

  it('should show the navbar and the « Page introuvable » heading in a banner (FR-3)', async () => {
    const host = await render();
    const banner = host.querySelector('header.page-banner');
    expect(banner?.querySelector('nav[aria-label="Navigation principale"]')).not.toBeNull();
    const headings = host.querySelectorAll('h1');
    expect(headings.length).toBe(1);
    expect(headings[0].textContent?.trim()).toBe('Page introuvable');
    expect(headings[0].getAttribute('tabindex')).toBe('-1');
  });

  it('should explain, without blaming the visitor (FR-3, BR-2)', async () => {
    const host = await render();
    expect(host.querySelector('main p')?.textContent?.trim()).toBe(
      'Cette adresse ne mène à aucune page du site : le lien est peut-être ancien, ou mal recopié.',
    );
  });

  it('should link back to the home page (FR-3)', async () => {
    const host = await render();
    const link = host.querySelector('main a');
    expect(link?.textContent?.trim()).toBe("Retour à l'accueil");
    expect(link?.getAttribute('href')).toBe('/');
  });

  it('should have one focusable main landmark, for the skip link', async () => {
    const host = await render();
    const mains = host.querySelectorAll('main');
    expect(mains.length).toBe(1);
    expect(mains[0].id).toBe('main-content');
    expect(mains[0].getAttribute('tabindex')).toBe('-1');
  });
});
