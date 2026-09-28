import { DestroyRef, Signal, afterNextRender, inject, signal } from '@angular/core';

/**
 * Tracks which section the guest is reading (FR-22).
 *
 * A function rather than a service: the state belongs to one page and dies
 * with it. Call it from a constructor, where `inject()` works.
 *
 * A section is « being read » when it crosses a reading band that starts just
 * below the sticky menu and ends at 40 % of the window height. Between two
 * sections nothing crosses the band, so the previous value is kept and the
 * highlight does not flicker. The last sections are short and may never
 * reach the band, so at the page bottom the last one wins.
 *
 * @param sections the section elements, in page order; each needs an `id`
 * @param topOffset the height hidden by the sticky menu, read when observing starts
 * @returns the `id` of the section being read, or `null` above the first one
 */
export function spyOnSections(sections: () => readonly Element[], topOffset: () => number): Signal<string | null> {
  const active = signal<string | null>(null);
  const destroyRef = inject(DestroyRef);

  afterNextRender(() => {
    const view = globalThis.window;
    if (typeof IntersectionObserver === 'undefined' || !view) {
      return;
    }
    const elements = sections();
    const ids = elements.map((element) => element.id);

    // Plain variables, not signals: only `active` is read by the template.
    // It is set right away on each change, so « keep the previous section »
    // never depends on when the template last looked.
    const visible = new Set<string>();
    let beforeFirst = true;
    let atBottom = false;

    const update = (): void => {
      if (atBottom && ids.length > 0) {
        active.set(ids[ids.length - 1]);
        return;
      }
      const reading = ids.find((id) => visible.has(id));
      if (reading) {
        active.set(reading);
      } else if (beforeFirst) {
        active.set(null);
      }
      // Otherwise between two sections: keep the current value.
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visible.add(entry.target.id);
            beforeFirst = false;
          } else {
            visible.delete(entry.target.id);
            // The first section out of the band and below it: the guest is back above it.
            const bandBottom = entry.rootBounds?.bottom ?? 0;
            if (entry.target === elements[0] && entry.boundingClientRect.top >= bandBottom) {
              beforeFirst = true;
            }
          }
        }
        update();
      },
      { rootMargin: `-${Math.round(topOffset())}px 0px -60% 0px` }
    );
    elements.forEach((element) => observer.observe(element));

    // `scrollY > 0`: a page that has not scrolled is at its top, even when it is short.
    const root = view.document.documentElement;
    const onScroll = (): void => {
      const wasAtBottom = atBottom;
      atBottom = view.scrollY > 0 && view.innerHeight + view.scrollY >= root.scrollHeight - 2;
      if (atBottom !== wasAtBottom) {
        update();
      }
    };
    view.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    destroyRef.onDestroy(() => {
      observer.disconnect();
      view.removeEventListener('scroll', onScroll);
    });
  });

  return active.asReadonly();
}

/**
 * Whether an element is on screen at all — used to show « Haut de page »
 * once the banner has scrolled away (FR-26). `true` until observed, so
 * nothing appears before the first check.
 */
export function spyOnVisibility(target: () => Element | undefined): Signal<boolean> {
  const isVisible = signal(true);
  const destroyRef = inject(DestroyRef);

  afterNextRender(() => {
    const element = target();
    if (typeof IntersectionObserver === 'undefined' || !element) {
      return;
    }
    const observer = new IntersectionObserver(([entry]) => isVisible.set(entry.isIntersecting));
    observer.observe(element);
    destroyRef.onDestroy(() => observer.disconnect());
  });

  return isVisible.asReadonly();
}
