import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { GuestAccessService } from '../../services/guest-access.service';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher';
import { HOME_SECTIONS } from '../../shared/home-sections';

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
          @for (section of sections; track section.id) {
            <li><a routerLink="/" [fragment]="section.id">{{ section.title }}</a></li>
          }
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
  protected readonly sections = HOME_SECTIONS;
}
