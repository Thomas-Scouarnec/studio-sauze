import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { GuestAccessService } from '../../services/guest-access.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav aria-label="Navigation principale">
      <a class="nav-logo" routerLink="/">Notre <span>Refuge</span></a>
      <ul class="nav-links">
        <!-- routerLink + fragment, so the links also work from /stay (FR-8). -->
        <li><a routerLink="/" fragment="about">L'appartement</a></li>
        <li><a routerLink="/" fragment="equipment">Équipements</a></li>
        <li><a routerLink="/" fragment="activities">Activités</a></li>
        <li><a routerLink="/" fragment="contact">Contact</a></li>
        @if (guestAccess.isGuest()) {
          <li class="nav-guest">
            <a routerLink="/stay" routerLinkActive="is-active" ariaCurrentWhenActive="page">Mon séjour</a>
          </li>
        }
      </ul>
    </nav>
  `,
  styleUrl: './navbar.css'
})
export class NavbarComponent {
  protected readonly guestAccess = inject(GuestAccessService);
}
