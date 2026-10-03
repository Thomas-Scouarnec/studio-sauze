import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar';

/**
 * Shown at any address the site does not have (not-found.md), with the
 * address kept. Prerendered as the `404` route, whose HTML GitHub Pages
 * serves as `404.html`: so it must not show anything that depends on the
 * address, or hydrating it at another one would not match.
 */
@Component({
  selector: 'app-not-found',
  imports: [NavbarComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="page-banner">
      <div class="page-banner-bg" aria-hidden="true"></div>
      <app-navbar />
      <h1 class="page-title" tabindex="-1" i18n="@@notFound.title">Page introuvable</h1>
    </header>

    <main id="main-content" class="not-found-content" tabindex="-1">
      <p i18n="@@notFound.text">
        Cette adresse ne mène à aucune page du site : le lien est peut-être ancien, ou mal recopié.
      </p>
      <a class="not-found-home" routerLink="/" i18n="@@notFound.home">Retour à l'accueil</a>
    </main>
  `,
  styles: `
    /* A column taking the window's remaining height, like the stay page. */
    :host {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .not-found-content {
      flex: 1;
      background: var(--snow);
      padding: 3rem 5vw 6rem;
    }

    .not-found-content:focus {
      outline: none;
    }

    p {
      max-width: 38rem;
      margin-bottom: 2.5rem;
      font-size: 1.05rem;
      line-height: 1.7;
      color: var(--text);
    }

    /* The hero's call to action, in rust for the light ground (6.6:1 on --snow). */
    .not-found-home {
      display: inline-block;
      padding: 0.85rem 2.2rem;
      border: 1px solid var(--rust);
      color: var(--rust);
      font-size: 0.82rem;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      text-decoration: none;
      transition: all 0.3s;
    }

    .not-found-home:hover,
    .not-found-home:focus-visible {
      background: var(--rust);
      color: var(--cream);
      outline: none;
    }
  `,
})
export class NotFoundComponent {}
