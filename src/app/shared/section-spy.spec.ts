import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  viewChild,
  viewChildren,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FakeIntersectionObserver } from '../testing/fake-intersection-observer';
import { spyOnSections, spyOnVisibility } from './section-spy';

@Component({
  selector: 'app-spy-host',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header #banner>Banner</header>
    @for (id of ids; track id) {
      <section #section [id]="id">{{ id }}</section>
    }
  `,
})
class SpyHostComponent {
  // Ids used nowhere else: jsdom resolves a scoped `#id` query through the whole
  // document, where another spec's fixture may hold the same id.
  readonly ids = ['spy-first', 'spy-second', 'spy-third'];
  private readonly sectionRefs = viewChildren<ElementRef<HTMLElement>>('section');
  private readonly banner = viewChild.required<ElementRef<HTMLElement>>('banner');

  readonly active = spyOnSections(
    () => this.sectionRefs().map((ref) => ref.nativeElement),
    () => 64,
  );
  readonly bannerVisible = spyOnVisibility(() => this.banner().nativeElement);
}

describe('spyOnSections', () => {
  beforeEach(() => {
    FakeIntersectionObserver.reset();
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  async function render() {
    const fixture = TestBed.createComponent(SpyHostComponent);
    await fixture.whenStable();
    const host: HTMLElement = fixture.nativeElement;
    const section = (id: string) => host.querySelector<HTMLElement>(`#${id}`)!;
    const observer = FakeIntersectionObserver.watching(section('spy-first'));
    return { fixture, component: fixture.componentInstance, section, observer };
  }

  it('should observe every section, with a band starting 1px below the menu', async () => {
    const { observer, section } = await render();
    expect(observer.observed).toEqual([
      section('spy-first'),
      section('spy-second'),
      section('spy-third'),
    ]);
    expect(observer.options?.rootMargin).toBe('-65px 0px -60% 0px');
  });

  it('should be null above the first section', async () => {
    const { component, observer, section } = await render();
    observer.report([{ target: section('spy-first'), isIntersecting: false, top: 500 }]);
    expect(component.active()).toBeNull();
  });

  it('should pick the section crossing the band', async () => {
    const { component, observer, section } = await render();
    observer.report([{ target: section('spy-second'), isIntersecting: true }]);
    expect(component.active()).toBe('spy-second');
  });

  it('should pick the first in page order when two sections cross the band', async () => {
    const { component, observer, section } = await render();
    observer.report([
      { target: section('spy-third'), isIntersecting: true },
      { target: section('spy-second'), isIntersecting: true },
    ]);
    expect(component.active()).toBe('spy-second');
  });

  it('should keep the previous section while none crosses the band', async () => {
    const { component, observer, section } = await render();
    observer.report([{ target: section('spy-second'), isIntersecting: true }]);
    observer.report([{ target: section('spy-second'), isIntersecting: false, top: -800 }]);
    expect(component.active()).toBe('spy-second');
  });

  it('should go back to null when scrolling back above the first section', async () => {
    const { component, observer, section } = await render();
    observer.report([{ target: section('spy-first'), isIntersecting: true }]);
    expect(component.active()).toBe('spy-first');
    observer.report([{ target: section('spy-first'), isIntersecting: false, top: 400 }]);
    expect(component.active()).toBeNull();
  });

  it('should pick the last section at the page bottom', async () => {
    const { component, observer, section } = await render();
    observer.report([{ target: section('spy-second'), isIntersecting: true }]);

    // jsdom has no layout: scrollHeight is 0, so any scrolled window « reaches » the bottom.
    Object.defineProperty(window, 'scrollY', { value: 100, configurable: true });
    try {
      window.dispatchEvent(new Event('scroll'));
      expect(component.active()).toBe('spy-third');
    } finally {
      Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
    }
  });

  it('should stop observing when the page is destroyed', async () => {
    const { fixture, observer } = await render();
    fixture.destroy();
    expect(observer.disconnected).toBe(true);
  });

  it('should stay null where IntersectionObserver does not exist', async () => {
    vi.unstubAllGlobals();
    const saved = globalThis.IntersectionObserver;
    // @ts-expect-error — removing the API to simulate an environment without it
    delete globalThis.IntersectionObserver;
    try {
      const fixture = TestBed.createComponent(SpyHostComponent);
      await fixture.whenStable();
      expect(fixture.componentInstance.active()).toBeNull();
    } finally {
      if (saved) {
        globalThis.IntersectionObserver = saved;
      }
    }
  });
});

describe('spyOnVisibility', () => {
  beforeEach(() => {
    FakeIntersectionObserver.reset();
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should be true until told otherwise, then follow the element', async () => {
    const fixture = TestBed.createComponent(SpyHostComponent);
    await fixture.whenStable();
    const banner = (fixture.nativeElement as HTMLElement).querySelector('header')!;
    const observer = FakeIntersectionObserver.watching(banner);

    expect(fixture.componentInstance.bannerVisible()).toBe(true);
    observer.report([{ target: banner, isIntersecting: false }]);
    expect(fixture.componentInstance.bannerVisible()).toBe(false);
    observer.report([{ target: banner, isIntersecting: true }]);
    expect(fixture.componentInstance.bannerVisible()).toBe(true);
  });
});
