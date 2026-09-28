import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  input,
  signal,
  viewChild
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { StaySection } from '../../services/stay.service';

/**
 * The stay page's sticky section menu (FR-14, FR-22, FR-23, FR-27, FR-28).
 *
 * One list of links, shown two ways by CSS: a numbered row of chips where
 * they all fit, and below that a compact bar « 5/9 · Activités » that opens
 * the same list (a disclosure). One list rather than two menus: two `nav`
 * landmarks with the same name, and every link twice, would be the cost.
 */
@Component({
  selector: 'app-stay-nav',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'onDocumentClick($event)'
  },
  template: `
    <nav
      #nav
      class="stay-nav"
      aria-label="Sommaire"
      i18n-aria-label="@@stay.toc.label"
      (keydown.escape)="close(true)"
      (focusout)="onFocusOut($event)"
    >
      <!-- Narrow screens only: hidden with display: none where the chips fit. -->
      <button
        #bar
        type="button"
        class="stay-nav-toggle"
        aria-controls="stay-nav-list"
        [attr.aria-expanded]="open()"
        (click)="toggle()"
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
      <ol #list id="stay-nav-list" [class.is-open]="open()">
        @for (section of sections(); track section.id) {
          <li>
            <a
              routerLink="/stay"
              [fragment]="section.id"
              [attr.aria-current]="section.id === activeId() ? 'location' : null"
              (click)="close(false)"
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

  /** Whether the compact bar's list is shown. Meaningless where the chips show. */
  protected readonly open = signal(false);

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

  private readonly nav = viewChild.required<ElementRef<HTMLElement>>('nav');
  private readonly toggleButton = viewChild.required<ElementRef<HTMLButtonElement>>('bar');
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

  protected toggle(): void {
    this.open.update((open) => !open);
  }

  /** Escape passes `true`: focus goes back to the bar rather than staying on a hidden link. */
  protected close(returnFocus: boolean): void {
    if (!this.open()) {
      return;
    }
    this.open.set(false);
    if (returnFocus) {
      this.toggleButton().nativeElement.focus();
    }
  }

  /**
   * Tabbing out of the menu closes the list. Only when focus lands somewhere
   * known: iOS Safari doesn't focus a tapped button, so a tap on the bar
   * reports `null` here and must not close the list it is about to toggle.
   */
  protected onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget;
    if (next instanceof Node && !this.nav().nativeElement.contains(next)) {
      this.close(false);
    }
  }

  /** A tap anywhere outside the menu closes the list. */
  protected onDocumentClick(event: MouseEvent): void {
    if (this.open() && event.target instanceof Node && !this.nav().nativeElement.contains(event.target)) {
      this.close(false);
    }
  }
}
