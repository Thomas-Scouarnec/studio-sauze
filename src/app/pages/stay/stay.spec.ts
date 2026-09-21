import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { StayComponent } from './stay';
import { GuestAccessService } from '../../services/guest-access.service';

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
    expect(banner?.querySelector('nav')).not.toBeNull();
    const heading = banner?.querySelector('h1');
    expect(heading?.textContent?.trim()).toBe('Votre séjour');
    expect(heading?.getAttribute('tabindex')).toBe('-1');
  });

  it('should render one focusable main landmark with the placeholder', async () => {
    const host = await render();
    const mains = host.querySelectorAll('main');
    expect(mains.length).toBe(1);
    expect(mains[0].id).toBe('main-content');
    expect(mains[0].getAttribute('tabindex')).toBe('-1');
    expect(mains[0].textContent).toContain('arrivent bientôt');
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
});
