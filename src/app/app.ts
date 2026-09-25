import { ChangeDetectionStrategy, Component, DOCUMENT, Injector, afterNextRender, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, skip } from 'rxjs';
import { FooterComponent } from './components/footer/footer';
import { PhotoGalleryComponent } from './components/photo-gallery/photo-gallery';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FooterComponent, PhotoGalleryComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="skip-link" href="#main-content" (click)="skipToMain($event)" i18n="@@app.skipLink">Aller au contenu principal</a>
    <router-outlet />
    <app-footer />
    <!-- Mounted once for the whole site: one dialog, one focus trap. -->
    <app-photo-gallery />
  `,
  // A column filling the window, so a short page (the stay page) still keeps
  // the footer at the bottom; the routed page takes the remaining height.
  styles: [':host { display: flex; flex-direction: column; min-height: 100vh; }']
})
export class App {
  private readonly document = inject(DOCUMENT);

  constructor() {
    const injector = inject(Injector);

    // A router navigation replaces the page without a browser page load, so
    // focus would stay on a link that may no longer exist. Move it to where
    // the visitor asked to go. The first navigation is the page load itself,
    // where the browser's own starting point is the right one.
    inject(Router)
      .events.pipe(
        filter((event) => event instanceof NavigationEnd),
        skip(1),
        takeUntilDestroyed()
      )
      .subscribe(() => {
        afterNextRender(() => this.focusAfterNavigation(), { injector });
      });
  }

  /**
   * `href="#main-content"` resolves against `<base href="/">`, so on `/stay`
   * the browser would load the home page. Focus the current page's `main`
   * instead; the `href` stays for its semantics.
   */
  protected skipToMain(event: Event): void {
    event.preventDefault();
    this.focusElement(this.document.getElementById('main-content'), false);
  }

  private focusAfterNavigation(): void {
    const fragment = this.document.defaultView?.location.hash.slice(1);
    const target = fragment
      ? this.document.getElementById(decodeURIComponent(fragment))
      : this.document.querySelector('h1');
    // The router scrolls on its own (anchor scrolling, scroll restoration).
    this.focusElement(target, true);
  }

  private focusElement(element: HTMLElement | null, preventScroll: boolean): void {
    if (!element) {
      return;
    }
    if (!element.hasAttribute('tabindex')) {
      element.setAttribute('tabindex', '-1');
    }
    element.focus({ preventScroll });
  }
}
