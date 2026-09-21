import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NavbarComponent } from './navbar';
import { GuestAccessService } from '../../services/guest-access.service';

describe('NavbarComponent', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  afterEach(() => {
    localStorage.clear();
  });

  async function render(): Promise<HTMLElement> {
    const fixture = TestBed.createComponent(NavbarComponent);
    await fixture.whenStable();
    return fixture.nativeElement;
  }

  it('should label the navigation landmark in French', async () => {
    const host = await render();
    expect(host.querySelector('nav')?.getAttribute('aria-label')).toBe('Navigation principale');
  });

  it('should link the logo to the home page (FR-9)', async () => {
    const host = await render();
    const logo = host.querySelector<HTMLAnchorElement>('a.nav-logo');
    expect(logo?.getAttribute('href')).toBe('/');
    expect(logo?.textContent?.replace(/\s+/g, ' ').trim()).toBe('Notre Refuge');
  });

  it('should point the four section links at the home page with a fragment (FR-8)', async () => {
    const host = await render();
    const hrefs = Array.from(host.querySelectorAll<HTMLAnchorElement>('.nav-links li:not(.nav-guest) a')).map(
      (link) => link.getAttribute('href'),
    );
    expect(hrefs).toEqual(['/#about', '/#equipment', '/#activities', '/#contact']);
  });

  it('should not show « Mon séjour » to a visitor who never opened /stay (FR-6)', async () => {
    const host = await render();
    expect(host.querySelector('.nav-guest')).toBeNull();
    expect(host.querySelector('a[href="/stay"]')).toBeNull();
  });

  it('should show « Mon séjour » after Contact once the visitor is a guest (FR-5)', async () => {
    TestBed.inject(GuestAccessService).markAsGuest();
    const host = await render();
    const items = host.querySelectorAll('.nav-links li');
    const last = items[items.length - 1];
    expect(items.length).toBe(5);
    expect(last.classList.contains('nav-guest')).toBe(true);
    const link = last.querySelector('a');
    expect(link?.textContent?.trim()).toBe('Mon séjour');
    expect(link?.getAttribute('href')).toBe('/stay');
  });
});
