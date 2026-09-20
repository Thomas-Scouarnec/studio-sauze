import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  viewChild,
} from '@angular/core';
import { IMAGE_LOADER, NgOptimizedImage } from '@angular/common';
import { GalleryService } from '../../services/gallery.service';
import { responsiveImageLoader } from '../../loaders/responsive-image-loader';

/** Past this distance a horizontal drag counts as a swipe rather than a tap. */
const SWIPE_THRESHOLD_PX = 50;

@Component({
  selector: 'app-photo-gallery',
  imports: [NgOptimizedImage],
  // Scoped to this component: only its images follow the `<name>-<width>w.webp` convention.
  providers: [{ provide: IMAGE_LOADER, useValue: responsiveImageLoader }],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './photo-gallery.html',
  styleUrl: './photo-gallery.css',
})
export class PhotoGalleryComponent {
  protected readonly gallery = inject(GalleryService);

  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  /**
   * The current photo as a list of zero or one, so `@for`'s `track` destroys
   * and recreates the `<img>` whenever it changes. `NgOptimizedImage` reads
   * `ngSrc` and `ngSrcset` once at initialisation and ignores later updates
   * (NG02953) — reusing one element would leave the first photo on screen.
   */
  protected readonly stagePhotos = computed(() => {
    const photo = this.gallery.currentPhoto();
    return photo ? [photo] : [];
  });

  private swipeStartX: number | null = null;

  constructor() {
    // Mirrors the signal onto the real <dialog>, so the platform supplies the
    // focus trap, the inert page behind and focus return. Esc is bound in the
    // template rather than left to the platform's close request, which does
    // not fire in every environment — and closing on Esc is a WCAG
    // requirement, not a nicety.
    effect(() => {
      const element = this.dialog().nativeElement;
      const shouldBeOpen = this.gallery.isOpen();
      if (shouldBeOpen && !element.open) {
        element.showModal();
        // The dialog's content renders in this same pass, so the browser's own
        // "focus the first candidate" step can run before there is anything to
        // focus and leave focus on <body> — outside the dialog, where the key
        // bindings below never see it. Taking focus explicitly is what makes
        // the keyboard work; the element itself is the target, so this does not
        // depend on a child existing yet.
        element.focus();
      } else if (!shouldBeOpen && element.open) {
        element.close();
      }
    });

    // Decodes the neighbours ahead of time, so moving between photos shows an
    // image rather than an empty stage.
    effect(() => {
      const photos = this.gallery.photos();
      const index = this.gallery.openIndex();
      if (index === null || photos.length < 2) {
        return;
      }
      for (const offset of [1, -1]) {
        const neighbour = photos[(index + offset + photos.length) % photos.length];
        new Image().src = responsiveImageLoader({ src: neighbour.src });
      }
    });
  }

  /**
   * Closes on a click outside the photo. Two elements count as "outside": the
   * dialog itself, and the wrapper that fills it — a click in the empty space
   * around the stage lands on whichever of the two is on top.
   */
  protected onSurfaceClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target === this.dialog().nativeElement || target.classList.contains('gallery-surface')) {
      this.gallery.close();
    }
  }

  protected onPointerDown(event: PointerEvent): void {
    this.swipeStartX = event.clientX;
    // Capture, so the release is reported here even if the finger or cursor
    // has left the photo by then — otherwise a swipe that ends off the stage
    // is silently dropped.
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }

  protected onPointerCancel(): void {
    this.swipeStartX = null;
  }

  protected onPointerUp(event: PointerEvent): void {
    const startX = this.swipeStartX;
    this.swipeStartX = null;
    if (startX === null) {
      return;
    }
    const distance = event.clientX - startX;
    if (Math.abs(distance) < SWIPE_THRESHOLD_PX) {
      return;
    }
    if (distance < 0) {
      this.gallery.next();
    } else {
      this.gallery.previous();
    }
  }
}
