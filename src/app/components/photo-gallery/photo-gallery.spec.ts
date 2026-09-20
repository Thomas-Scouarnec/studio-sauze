import { TestBed } from '@angular/core/testing';
import { PhotoGalleryComponent } from './photo-gallery';
import { GalleryService } from '../../services/gallery.service';

/**
 * jsdom implements `<dialog>` but not the modal focus behaviour, so the focus
 * trap and focus return are verified in the browser pass, not here.
 */
describe('PhotoGalleryComponent', () => {
  let gallery: GalleryService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhotoGalleryComponent],
    }).compileComponents();
    gallery = TestBed.inject(GalleryService);
  });

  async function open(src = 'equipment/kitchen') {
    const fixture = TestBed.createComponent(PhotoGalleryComponent);
    await fixture.whenStable();
    gallery.openAt(src);
    await fixture.whenStable();
    return fixture;
  }

  it('should stay closed and render no photo until it is opened', async () => {
    const fixture = TestBed.createComponent(PhotoGalleryComponent);
    await fixture.whenStable();

    const dialog: HTMLDialogElement = fixture.nativeElement.querySelector('dialog');
    expect(dialog.open).toBe(false);
    expect(fixture.nativeElement.querySelector('img')).toBeNull();
  });

  it('should open the dialog at the requested photo', async () => {
    const fixture = await open('equipment/kitchen');

    const dialog: HTMLDialogElement = fixture.nativeElement.querySelector('dialog');
    const img: HTMLImageElement = fixture.nativeElement.querySelector('.gallery-stage img');
    expect(dialog.open).toBe(true);
    expect(img.getAttribute('srcset')).toBe('images/equipment/kitchen-800w.webp 800w');
    expect(img.getAttribute('alt')?.trim().length).toBeGreaterThan(0);
  });

  it('should give the dialog a French accessible name', async () => {
    const fixture = await open();

    const dialog: HTMLDialogElement = fixture.nativeElement.querySelector('dialog');
    expect(dialog.getAttribute('aria-label')).toBe('Galerie photos du studio');
  });

  it('should announce the position in a live region (FR-29)', async () => {
    const fixture = await open('equipment/kitchen');

    const counter: HTMLElement = fixture.nativeElement.querySelector('.gallery-counter');
    expect(counter.getAttribute('aria-live')).toBe('polite');
    expect(counter.textContent?.replace(/\s+/g, ' ').trim()).toBe('Photo 3 sur 5');
  });

  it('should label every control in French', async () => {
    const fixture = await open();

    const labels = [...fixture.nativeElement.querySelectorAll('.gallery-control')].map(
      (button) => (button as HTMLElement).textContent?.replace(/\s+/g, ' ').trim()
    );
    expect(labels).toContain('✕Fermer la galerie');
    expect(labels).toContain('‹Photo précédente');
    expect(labels).toContain('›Photo suivante');
  });

  it('should hide the control glyphs from assistive technology', async () => {
    const fixture = await open();

    const glyphs = fixture.nativeElement.querySelectorAll('.gallery-control span[aria-hidden]');
    expect(glyphs.length).toBe(3);
  });

  it('should move between photos with the previous and next buttons', async () => {
    const fixture = await open('equipment/kitchen');
    const [close, previous, next] = [
      ...fixture.nativeElement.querySelectorAll('.gallery-control'),
    ] as HTMLButtonElement[];
    expect(close.classList).toContain('gallery-close');

    next.click();
    await fixture.whenStable();
    expect(gallery.currentPhoto()?.src).toBe('about/living-room');

    previous.click();
    await fixture.whenStable();
    expect(gallery.currentPhoto()?.src).toBe('equipment/kitchen');
  });

  it('should actually swap the rendered image, not just the state (NG02953)', async () => {
    const fixture = await open('equipment/kitchen');
    const srcset = () =>
      (fixture.nativeElement.querySelector('.gallery-stage img') as HTMLImageElement).getAttribute(
        'srcset'
      );
    expect(srcset()).toBe('images/equipment/kitchen-800w.webp 800w');

    gallery.next();
    await fixture.whenStable();

    expect(srcset()).toBe('images/about/living-room-800w.webp 800w, images/about/living-room-1200w.webp 1200w');
  });

  it('should move between photos with the arrow keys', async () => {
    const fixture = await open('equipment/kitchen');
    const dialog: HTMLDialogElement = fixture.nativeElement.querySelector('dialog');

    dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await fixture.whenStable();
    expect(gallery.currentPhoto()?.src).toBe('about/living-room');

    dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    await fixture.whenStable();
    expect(gallery.currentPhoto()?.src).toBe('equipment/kitchen');
  });

  /**
   * A horizontal drag across an <img> starts the browser's native image drag
   * unless it is suppressed, which swallows the gesture entirely.
   */
  it('should not let the photo be dragged away as an image', async () => {
    const fixture = await open();

    const img: HTMLImageElement = fixture.nativeElement.querySelector('.gallery-stage img');
    expect(img.getAttribute('draggable')).toBe('false');
  });

  it('should move between photos on a swipe', async () => {
    const fixture = await open('equipment/kitchen');
    const stage: HTMLElement = fixture.nativeElement.querySelector('.gallery-stage');
    const swipe = async (from: number, to: number) => {
      stage.dispatchEvent(new PointerEvent('pointerdown', { clientX: from, bubbles: true }));
      stage.dispatchEvent(new PointerEvent('pointerup', { clientX: to, bubbles: true }));
      await fixture.whenStable();
    };

    await swipe(300, 100);
    expect(gallery.currentPhoto()?.src).toBe('about/living-room');

    await swipe(100, 300);
    expect(gallery.currentPhoto()?.src).toBe('equipment/kitchen');
  });

  it('should treat a short drag as a tap, not a swipe', async () => {
    const fixture = await open('equipment/kitchen');
    const stage: HTMLElement = fixture.nativeElement.querySelector('.gallery-stage');

    stage.dispatchEvent(new PointerEvent('pointerdown', { clientX: 200, bubbles: true }));
    stage.dispatchEvent(new PointerEvent('pointerup', { clientX: 180, bubbles: true }));
    await fixture.whenStable();

    expect(gallery.currentPhoto()?.src).toBe('equipment/kitchen');
  });

  it('should forget a cancelled gesture', async () => {
    const fixture = await open('equipment/kitchen');
    const stage: HTMLElement = fixture.nativeElement.querySelector('.gallery-stage');

    stage.dispatchEvent(new PointerEvent('pointerdown', { clientX: 300, bubbles: true }));
    stage.dispatchEvent(new PointerEvent('pointercancel', { bubbles: true }));
    stage.dispatchEvent(new PointerEvent('pointerup', { clientX: 100, bubbles: true }));
    await fixture.whenStable();

    expect(gallery.currentPhoto()?.src).toBe('equipment/kitchen');
  });

  it('should close on Escape', async () => {
    const fixture = await open();
    const dialog: HTMLDialogElement = fixture.nativeElement.querySelector('dialog');

    dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await fixture.whenStable();

    expect(gallery.isOpen()).toBe(false);
    expect(dialog.open).toBe(false);
  });

  it('should close from the close button', async () => {
    const fixture = await open();
    const close: HTMLButtonElement = fixture.nativeElement.querySelector('.gallery-close');

    close.click();
    await fixture.whenStable();

    expect(gallery.isOpen()).toBe(false);
    expect(fixture.nativeElement.querySelector('dialog').open).toBe(false);
  });

  it('should close on a click outside the photo', async () => {
    const fixture = await open();
    const surface: HTMLElement = fixture.nativeElement.querySelector('.gallery-surface');

    surface.click();
    await fixture.whenStable();

    expect(gallery.isOpen()).toBe(false);
  });

  it('should not close on a click on the photo itself', async () => {
    const fixture = await open();
    const stage: HTMLElement = fixture.nativeElement.querySelector('.gallery-stage');

    stage.click();
    await fixture.whenStable();

    expect(gallery.isOpen()).toBe(true);
  });

  it('should reset the service when the dialog closes on its own (Esc)', async () => {
    const fixture = await open();
    const dialog: HTMLDialogElement = fixture.nativeElement.querySelector('dialog');

    dialog.close();
    await fixture.whenStable();

    expect(gallery.isOpen()).toBe(false);
  });
});
