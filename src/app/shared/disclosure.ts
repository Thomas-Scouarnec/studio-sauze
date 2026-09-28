import { Directive, ElementRef, contentChild, inject, signal } from '@angular/core';

/**
 * A button that shows and hides a panel — the « disclosure » pattern — with
 * the site's one way of closing it (BR-1 of navigation.md): the button
 * toggles it; choosing an entry, a click outside, Escape and tabbing out
 * close it.
 *
 * Put it on the element that wraps the button and the panel, and mark the
 * button `#disclosureToggle`:
 *
 * ```html
 * <nav appDisclosure #menu="disclosure">
 *   <button #disclosureToggle [attr.aria-expanded]="menu.open()" (click)="menu.toggle()">…</button>
 *   <ul [class.is-open]="menu.open()">… (click)="menu.close(false)" …</ul>
 * </nav>
 * ```
 *
 * A directive rather than a base class or a service: the behaviour belongs
 * to one element and its listeners, and any component can attach it.
 * `exportAs` is what lets the template read `menu.open()`.
 */
@Directive({
  selector: '[appDisclosure]',
  exportAs: 'disclosure',
  host: {
    '(keydown.escape)': 'close(true)',
    '(focusout)': 'onFocusOut($event)',
    '(document:click)': 'onDocumentClick($event)'
  }
})
export class DisclosureDirective {
  private readonly isOpen = signal(false);
  /** Whether the panel is shown. */
  readonly open = this.isOpen.asReadonly();

  private readonly element: HTMLElement = inject(ElementRef).nativeElement;
  // A content query: the button is declared inside the element this directive
  // sits on, in the same template, so the directive finds it by its name.
  private readonly toggleButton = contentChild<ElementRef<HTMLElement>>('disclosureToggle');

  toggle(): void {
    this.isOpen.update((open) => !open);
  }

  /** Escape passes `true`: focus goes back to the button rather than staying on a hidden entry. */
  close(returnFocus: boolean): void {
    if (!this.isOpen()) {
      return;
    }
    this.isOpen.set(false);
    if (returnFocus) {
      this.toggleButton()?.nativeElement.focus();
    }
  }

  /**
   * Tabbing out closes the panel. Only when focus lands somewhere known:
   * iOS Safari doesn't focus a tapped button, so a tap on the toggle reports
   * `null` here and must not close the panel it is about to toggle.
   */
  protected onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget;
    if (next instanceof Node && !this.element.contains(next)) {
      this.close(false);
    }
  }

  /** A click anywhere outside closes the panel. */
  protected onDocumentClick(event: MouseEvent): void {
    if (this.isOpen() && event.target instanceof Node && !this.element.contains(event.target)) {
      this.close(false);
    }
  }
}
