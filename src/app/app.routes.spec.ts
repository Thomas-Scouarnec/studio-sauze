import { TestBed } from '@angular/core/testing';
import { Router, TitleStrategy, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Title } from '@angular/platform-browser';
import { routes } from './app.routes';
import { PageTagsStrategy } from './page-tags.strategy';
import { HomeComponent } from './pages/home/home';
import { NotFoundComponent } from './pages/not-found/not-found';
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

  describe('an unknown path (not-found.md)', () => {
    for (const url of ['/nowhere', '/a/b/c', '/stay/oops']) {
      it(`should show the not-found page at ${url}, keeping the address (FR-1, FR-4)`, async () => {
        const harness = await RouterTestingHarness.create();
        await harness.navigateByUrl(url, NotFoundComponent);
        expect(TestBed.inject(Router).url).toBe(url);
        expect(TestBed.inject(Title).getTitle()).toBe('Page introuvable — Notre Refuge au Sauze');
      });
    }

    it('should show the same page at /404, the route prerendered into 404.html', async () => {
      const harness = await RouterTestingHarness.create();
      const page = await harness.navigateByUrl('/404', NotFoundComponent);
      expect(page).toBeInstanceOf(NotFoundComponent);
    });

    it('should mark it noindex, with no description or canonical link (FR-7)', async () => {
      TestBed.overrideProvider(TitleStrategy, {
        useFactory: () => new PageTagsStrategy(),
        deps: [],
      });
      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl('/nowhere', NotFoundComponent);
      const head = document.head;
      expect(head.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex');
      expect(head.querySelector('meta[name="description"], link[rel="canonical"]')).toBeNull();
      head
        .querySelectorAll('meta[name], meta[property], link[hreflang]')
        .forEach((element) => element.remove());
    });
  });
});
