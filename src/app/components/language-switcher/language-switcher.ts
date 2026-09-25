import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { LanguageService } from '../../services/language.service';

/**
 * One small flag per language (FR-6). The other language is a plain `href`,
 * not a `routerLink`: it is a different compiled app, so it needs a page load.
 *
 * Flags are inline SVG because emoji flags do not render on Windows, which
 * shows the letters « FR » / « GB » instead. They are decorative: the
 * language name, in its own language, is what assistive technology reads.
 */
@Component({
  selector: 'app-language-switcher',
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ul class="lang-switcher" aria-label="Langue" i18n-aria-label="@@lang.label">
      @for (link of language.links(); track link.code) {
        <li>
          @if (link.isCurrent) {
            <!--
              A span has no role, so browsers drop aria-current on it: the
              state is spoken as text instead, in the page's language.
            -->
            <span class="lang-flag is-current">
              <ng-container *ngTemplateOutlet="flag; context: { $implicit: link.code }" />
              <!-- The leading space is in the translated text: Angular drops whitespace-only nodes. -->
              <span class="visually-hidden"
                ><span [attr.lang]="link.code">{{ link.name }}</span
                ><ng-container i18n="@@lang.current"> (langue actuelle)</ng-container></span
              >
            </span>
          } @else {
            <a
              class="lang-flag"
              [href]="link.href"
              [attr.hreflang]="link.code"
              [attr.lang]="link.code"
              (click)="language.choose(link.code)"
            >
              <ng-container *ngTemplateOutlet="flag; context: { $implicit: link.code }" />
              <span class="visually-hidden">{{ link.name }}</span>
            </a>
          }
        </li>
      }
    </ul>

    <ng-template #flag let-code>
      @switch (code) {
        @case ('fr') {
          <svg class="flag" viewBox="0 0 3 2" aria-hidden="true" focusable="false">
            <rect width="1" height="2" fill="#000091" />
            <rect x="1" width="1" height="2" fill="#fff" />
            <rect x="2" width="1" height="2" fill="#e1000f" />
          </svg>
        }
        @case ('en') {
          <!-- The Union Jack is 2:1; "slice" crops its ends to match the French flag's 3:2. -->
          <svg
            class="flag"
            viewBox="0 0 60 30"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
            focusable="false"
          >
            <clipPath id="lang-flag-uk-diagonals">
              <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
            </clipPath>
            <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
            <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" stroke-width="6" />
            <path
              d="M0,0 L60,30 M60,0 L0,30"
              clip-path="url(#lang-flag-uk-diagonals)"
              stroke="#c8102e"
              stroke-width="4"
            />
            <path d="M30,0 v30 M0,15 h60" stroke="#fff" stroke-width="10" />
            <path d="M30,0 v30 M0,15 h60" stroke="#c8102e" stroke-width="6" />
          </svg>
        }
      }
    </ng-template>
  `,
  styleUrl: './language-switcher.css',
})
export class LanguageSwitcherComponent {
  protected readonly language = inject(LanguageService);
}
