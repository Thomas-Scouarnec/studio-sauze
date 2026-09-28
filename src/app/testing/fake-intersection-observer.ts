/**
 * jsdom has no `IntersectionObserver`, and no layout to compute one from.
 * This fake records what is observed, and lets a test say what « the
 * browser » saw by calling `report()`. Install it with
 * `vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver)`.
 */
export class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];

  readonly observed: Element[] = [];
  disconnected = false;

  constructor(
    private readonly callback: IntersectionObserverCallback,
    readonly options?: IntersectionObserverInit
  ) {
    FakeIntersectionObserver.instances.push(this);
  }

  static reset(): void {
    FakeIntersectionObserver.instances = [];
  }

  /** The observer watching this element. */
  static watching(element: Element): FakeIntersectionObserver {
    const observer = FakeIntersectionObserver.instances.find((instance) => instance.observed.includes(element));
    if (!observer) {
      throw new Error(`No observer watches <${element.tagName.toLowerCase()} id="${element.id}">`);
    }
    return observer;
  }

  observe(element: Element): void {
    this.observed.push(element);
  }

  unobserve(): void {}

  disconnect(): void {
    this.disconnected = true;
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  /**
   * Delivers entries as the browser would. `top` is the element's top edge,
   * and the band (the root after `rootMargin`) runs from 0 to `bandBottom`.
   */
  report(changes: { target: Element; isIntersecting: boolean; top?: number }[], bandBottom = 300): void {
    const entries = changes.map(
      ({ target, isIntersecting, top = 0 }) =>
        ({
          target,
          isIntersecting,
          boundingClientRect: { top } as DOMRectReadOnly,
          rootBounds: { bottom: bandBottom } as DOMRectReadOnly
        }) as IntersectionObserverEntry
    );
    this.callback(entries, this as unknown as IntersectionObserver);
  }
}
