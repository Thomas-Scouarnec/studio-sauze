/**
 * jsdom 28 renders `<dialog>` markup and reflects its `open` attribute, but
 * implements none of the modal behaviour: `showModal()` and `close()` simply
 * do not exist. `PhotoGalleryComponent` drives a real dialog, so the tests
 * need enough of one to observe `open` and to receive the `close` event.
 *
 * What this shim deliberately does not fake is everything the gallery relies
 * on the platform for — the focus trap, the inert page behind, Esc-to-close
 * and focus return. Those are verified in a browser, not here.
 */
/**
 * jsdom does not implement pointer capture either. The gallery captures the
 * pointer so a swipe that ends off the photo still reports its release, so the
 * calls have to exist for the swipe tests to run at all.
 */
const elementPrototype = globalThis.Element?.prototype as
  | (Element & { setPointerCapture?: unknown; releasePointerCapture?: unknown })
  | undefined;

if (elementPrototype && typeof elementPrototype.setPointerCapture !== 'function') {
  elementPrototype.setPointerCapture = () => {};
  elementPrototype.releasePointerCapture = () => {};
  elementPrototype.hasPointerCapture = () => false;
}

const dialogPrototype = globalThis.HTMLDialogElement?.prototype;

if (dialogPrototype && typeof dialogPrototype.showModal !== 'function') {
  dialogPrototype.showModal = function (this: HTMLDialogElement): void {
    this.open = true;
  };

  dialogPrototype.close = function (this: HTMLDialogElement, returnValue?: string): void {
    if (!this.open) {
      return;
    }
    this.open = false;
    if (returnValue !== undefined) {
      this.returnValue = returnValue;
    }
    this.dispatchEvent(new Event('close'));
  };
}
