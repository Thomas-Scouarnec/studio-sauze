import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  viewChild,
  viewChildren,
} from '@angular/core';
import { IMAGE_LOADER, NgOptimizedImage, ViewportScroller } from '@angular/common';
import { Meta } from '@angular/platform-browser';
import { responsiveImageLoader } from '../../loaders/responsive-image-loader';
import { NavbarComponent } from '../../components/navbar/navbar';
import { GuestAccessService } from '../../services/guest-access.service';
import { StayService } from '../../services/stay.service';
import { StayNavComponent } from './stay-nav';
import { spyOnSections, spyOnVisibility } from '../../shared/section-spy';

/** Space kept between the sticky menu and a section heading after a jump. */
const HEADING_GAP = 16;

/**
 * The unlisted page for guests, shown at `/stay` (FR-1). It is reached only
 * from the link in the booking email — nothing on the public site points here
 * until the visitor has been here once (FR-2, FR-6).
 */
@Component({
  selector: 'app-stay',
  imports: [NavbarComponent, StayNavComponent, NgOptimizedImage],
  // Scoped to this page: only its images follow the `<name>-<width>w.webp` convention.
  providers: [{ provide: IMAGE_LOADER, useValue: responsiveImageLoader }],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './stay.html',
  styleUrl: './stay.css',
})
export class StayComponent {
  protected readonly stay = inject(StayService);

  private readonly banner = viewChild.required<ElementRef<HTMLElement>>('banner');
  private readonly title = viewChild.required<ElementRef<HTMLElement>>('title');
  private readonly menu = viewChild.required<StayNavComponent, ElementRef<HTMLElement>>(
    StayNavComponent,
    {
      read: ElementRef,
    },
  );
  private readonly sectionElements = viewChildren<ElementRef<HTMLElement>>('sectionElement');

  /** The height the sticky menu hides at the top of the window. */
  private readonly menuHeight = (): number => this.menu().nativeElement.offsetHeight;

  protected readonly activeSectionId = spyOnSections(
    () => this.sectionElements().map((ref) => ref.nativeElement),
    this.menuHeight,
  );
  protected readonly bannerVisible = spyOnVisibility(() => this.banner().nativeElement);

  constructor() {
    inject(GuestAccessService).markAsGuest();

    // FR-3: noindex on this page only, so it must not outlive it.
    const meta = inject(Meta);
    meta.updateTag({ name: 'robots', content: 'noindex' });

    // FR-24: the router computes where to scroll itself and ignores CSS
    // `scroll-margin-top`, so it is told what the sticky menu covers. A
    // function, so the real height is read at each jump (zoom, font size).
    // Reset on leaving: the home page has no sticky menu.
    const scroller = inject(ViewportScroller);
    scroller.setOffset(() => [0, this.menuHeight() + HEADING_GAP]);

    inject(DestroyRef).onDestroy(() => {
      meta.removeTag('name="robots"');
      scroller.setOffset([0, 0]);
    });
  }

  /** FR-26: back to the top, with focus on the page heading rather than left on a button that disappears. */
  protected backToTop(): void {
    globalThis.window?.scrollTo({ top: 0 });
    this.title().nativeElement.focus({ preventScroll: true });
  }
}
