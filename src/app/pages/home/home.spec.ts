import { TestBed } from '@angular/core/testing';
import { ViewportScroller } from '@angular/common';
import { provideRouter } from '@angular/router';
import { HomeComponent } from './home';

describe('HomeComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [provideRouter([])]
    }).compileComponents();
  });

  it('should put the mobile bar first in main, before the sections (FR-1)', async () => {
    const fixture = TestBed.createComponent(HomeComponent);
    await fixture.whenStable();
    const main = (fixture.nativeElement as HTMLElement).querySelector('main')!;
    expect(Array.from(main.children).map((child) => child.tagName.toLowerCase())).toEqual([
      'app-home-nav',
      'app-about',
      'app-equipment',
      'app-seasons',
      'app-contact'
    ]);
  });

  it('should offset the router by the bar only when it shows, and reset on leaving (FR-6, FR-8)', async () => {
    const scroller = TestBed.inject(ViewportScroller);
    const setOffset = vi.spyOn(scroller, 'setOffset');
    const fixture = TestBed.createComponent(HomeComponent);
    await fixture.whenStable();

    const offset = setOffset.mock.calls[0][0] as () => [number, number];
    // jsdom has no layout: the bar measures 0, as it does on a desktop where it is hidden.
    expect(offset()).toEqual([0, 0]);

    fixture.destroy();
    expect(setOffset).toHaveBeenLastCalledWith([0, 0]);
  });
});
