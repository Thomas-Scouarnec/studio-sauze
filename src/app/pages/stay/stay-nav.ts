import { ChangeDetectionStrategy, Component, ElementRef, afterRenderEffect, computed, input, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StaySection } from '../../services/stay.service';
import { DisclosureDirective } from '../../shared/disclosure';

/**
 * The stay page's sticky section menu (FR-14, FR-22, FR-23, FR-27, FR-28).
 *
 * One list of links, shown two ways by CSS: a numbered row of chips where
 * they all fit, and below that a compact bar « 5/9 · Activités » that opens
 * the same list (a disclosure). One list rather than two menus: two `nav`
 * landmarks with the same name, and every link twice, would be the cost.
 * Opening and closing is `DisclosureDirective`, shared with the home page.
 */
@Component({
  selector: 'app-stay-nav',
  imports: [RouterLink, DisclosureDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="stay-nav" aria-label="Sommaire" i18n-aria-label="@@stay.toc.label" appDisclosure #menu="disclosure">
      <!-- Narrow screens only: hidden with display: none where the chips fit. -->
      <button
        #disclosureToggle
        type="button"
        class="stay-nav-toggle"
        aria-controls="stay-nav-list"
        [attr.aria-expanded]="menu.open()"
        (click)="menu.toggle()"
      >
        <span class="stay-nav-label">
          @if (position(); as p) {
            <span class="visually-hidden" i18n="@@stay.nav.position">Section {{ p.number }} sur {{ p.total }} :</span>
            <span class="stay-nav-fraction" aria-hidden="true">{{ p.number }}/{{ p.total }} ·</span>
            {{ p.title }}
          } @else {
            <ng-container i18n="@@stay.nav.toggle">Sommaire</ng-container>
          }
        </span>
        <span class="stay-nav-chevron" aria-hidden="true"></span>
      </button>
      <span class="stay-nav-progress" aria-hidden="true" [style.transform]="'scaleX(' + progress() + ')'"></span>

      <!-- An ordered list: screen readers announce « 5 of 9 », so the visible number is hidden from them. -->
      <ol #list id="stay-nav-list" [class.is-open]="menu.open()">
        @for (section of sections(); track section.id) {
          <li>
            <a
              routerLink="/stay"
              [fragment]="section.id"
              [attr.aria-current]="section.id === activeId() ? 'location' : null"
              (click)="menu.close(false)"
            >
              <span class="stay-nav-number" aria-hidden="true">{{ $index + 1 }}</span>
              {{ section.title }}
            </a>
          </li>
        }
      </ol>
    </nav>
  `,
  styleUrl: './stay-nav.css'
})
export class StayNavComponent {
  readonly sections = input.required<readonly StaySection[]>();
  /** The section being read; owned by the page, which observes the scroll. */
  readonly activeId = input<string | null>(null);

  /** « 5/9 · Activités », or `null` above the first section (FR-27). */
  protected readonly position = computed(() => {
    const sections = this.sections();
    const index = sections.findIndex((section) => section.id === this.activeId());
    return index < 0 ? null : { number: index + 1, total: sections.length, title: sections[index].title };
  });

  /** The share of the progress line filled, from 0 to 1 (FR-28). */
  protected readonly progress = computed(() => {
    const position = this.position();
    return position ? position.number / position.total : 0;
  });

  private readonly list = viewChild.required<ElementRef<HTMLOListElement>>('list');

  constructor() {
    // After the DOM shows the new `aria-current`: bring that chip into the row's view.
    // Setting `scrollLeft` rather than `scrollIntoView()`, which could also scroll the page.
    afterRenderEffect(() => {
      this.activeId();
      const list = this.list().nativeElement;
      const link = list.querySelector<HTMLElement>('[aria-current]');
      if (!link || typeof list.scrollTo !== 'function') {
        return;
      }
      list.scrollTo({ left: link.offsetLeft - (list.clientWidth - link.offsetWidth) / 2 });
    });
  }
}
