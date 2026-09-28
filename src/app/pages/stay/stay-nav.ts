import { ChangeDetectionStrategy, Component, ElementRef, afterRenderEffect, input, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StaySection } from '../../services/stay.service';

/**
 * The stay page's sticky section menu (FR-14, FR-22, FR-23): one numbered
 * row of chips, the section being read marked as the current location.
 */
@Component({
  selector: 'app-stay-nav',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="stay-nav" aria-label="Sommaire" i18n-aria-label="@@stay.toc.label">
      <!-- An ordered list: screen readers announce « 5 of 9 », so the visible number is hidden from them. -->
      <ol #list>
        @for (section of sections(); track section.id) {
          <li>
            <a
              routerLink="/stay"
              [fragment]="section.id"
              [attr.aria-current]="section.id === activeId() ? 'location' : null"
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
