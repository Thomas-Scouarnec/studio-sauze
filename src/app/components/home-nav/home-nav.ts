import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GuestAccessService } from '../../services/guest-access.service';
import { DisclosureDirective } from '../../shared/disclosure';
import { HOME_SECTIONS } from '../../shared/home-sections';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher';

/**
 * The home page's sticky bar on phones (navigation.md FR-1 to FR-6): the
 * section being read, a menu of the sections plus « Mon séjour » and the
 * language, and a « Contact » link always in view. Hidden from 769px, where
 * the navbar shows its own section links.
 */
@Component({
  selector: 'app-home-nav',
  imports: [RouterLink, DisclosureDirective, LanguageSwitcherComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav
      aria-label="Navigation de la page"
      i18n-aria-label="@@homeNav.label"
      appDisclosure
      #menu="disclosure"
    >
      <div class="home-nav-bar">
        <button
          #disclosureToggle
          type="button"
          class="home-nav-toggle"
          aria-controls="home-nav-panel"
          [attr.aria-expanded]="menu.open()"
          (click)="menu.toggle()"
        >
          <span class="home-nav-label">
            @if (current(); as title) {
              <span class="visually-hidden" i18n="@@homeNav.current">Menu, section actuelle :</span>
              {{ title }}
            } @else {
              <ng-container i18n="@@homeNav.menu">Menu</ng-container>
            }
          </span>
          <span class="home-nav-chevron" aria-hidden="true"></span>
        </button>
        <!-- A link, not part of the menu: always in view (FR-5). -->
        <a
          class="home-nav-contact"
          routerLink="/"
          fragment="contact"
          (click)="menu.close(false)"
          i18n="@@nav.contact"
          >Contact</a
        >
      </div>

      <div id="home-nav-panel" class="home-nav-panel" [class.is-open]="menu.open()">
        <ul class="home-nav-sections">
          @for (section of sections; track section.id) {
            <li>
              <a
                routerLink="/"
                [fragment]="section.id"
                [attr.aria-current]="section.id === activeId() ? 'location' : null"
                (click)="menu.close(false)"
                >{{ section.title }}</a
              >
            </li>
          }
        </ul>
        <div class="home-nav-site">
          @if (guestAccess.isGuest()) {
            <a class="home-nav-stay" routerLink="/stay" i18n="@@nav.stay">Mon séjour</a>
          }
          <app-language-switcher />
        </div>
      </div>
    </nav>
  `,
  styleUrl: './home-nav.css',
})
export class HomeNavComponent {
  /** The section being read; owned by the page, which observes the scroll. */
  readonly activeId = input<string | null>(null);

  protected readonly sections = HOME_SECTIONS;
  protected readonly guestAccess = inject(GuestAccessService);

  /** The title the button shows, or `null` above the first section (FR-2). */
  protected readonly current = computed(
    () => this.sections.find((section) => section.id === this.activeId())?.title ?? null,
  );
}
