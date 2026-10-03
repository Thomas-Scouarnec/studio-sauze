import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Title } from '@angular/platform-browser';
import { routes } from './app.routes';
import { HomeComponent } from './pages/home/home';
import { StayComponent } from './pages/stay/stay';

describe('routes', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter(routes)],
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should show the home page at / with its title', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/', HomeComponent);
    expect(TestBed.inject(Title).getTitle()).toBe('Notre Refuge au Sauze');
  });

  it('should show the stay page at /stay with its own title (FR-1, FR-10)', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/stay', StayComponent);
    expect(TestBed.inject(Title).getTitle()).toBe('Votre séjour — Notre Refuge au Sauze');
  });

  it('should give each page a description of at most 160 characters (search-and-sharing.md FR-1)', () => {
    const tags = routes.flatMap((route) => (route.data?.['tags'] ? [route.data['tags']] : []));
    expect(tags.map((t) => t.indexed)).toEqual([true, false]);
    for (const { description } of tags) {
      expect(description.length).toBeGreaterThan(50);
      expect(description.length).toBeLessThanOrEqual(160);
    }
  });

  it('should not render any home section on the stay page (FR-1)', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/stay', StayComponent);
    const root: HTMLElement = harness.routeNativeElement!;
    expect(
      root.querySelector('app-hero, app-about, app-equipment, app-seasons, app-contact'),
    ).toBeNull();
  });

  it('should redirect an unknown path to the home page (FR-12)', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/nowhere', HomeComponent);
    expect(TestBed.inject(Router).url).toBe('/');
  });
});
