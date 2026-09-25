import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { GuestAccessService } from '../../services/guest-access.service';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, LanguageSwitcherComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav aria-label="Navigation principale" i18n-aria-label="@@nav.label">
      <!-- The brand stays French in every language (BR-1 of localization.md). -->
      <a class="nav-logo" routerLink="/">Notre <span>Refuge</span></a>
      <div class="nav-end">
        <ul class="nav-links">
          <!-- routerLink + fragment, so the links also work from /stay (FR-8). -->
          <li><a routerLink="/" fragment="about" i18n="@@nav.about">L'appartement</a></li>
          <li><a routerLink="/" fragment="equipment" i18n="@@nav.equipment">Équipements</a></li>
          <li><a routerLink="/" fragment="activities" i18n="@@nav.activities">Activités</a></li>
          <li><a routerLink="/" fragment="contact" i18n="@@nav.contact">Contact</a></li>
          @if (guestAccess.isGuest()) {
            <li class="nav-guest">
              <a routerLink="/stay" routerLinkActive="is-active" ariaCurrentWhenActive="page" i18n="@@nav.stay">Mon séjour</a>
            </li>
          }
        </ul>
        <!-- Outside the list, so it stays visible on phones (FR-6). -->
        <app-language-switcher />
      </div>
    </nav>
  `,
  styleUrl: './navbar.css'
})
export class NavbarComponent {
  protected readonly guestAccess = inject(GuestAccessService);
}
