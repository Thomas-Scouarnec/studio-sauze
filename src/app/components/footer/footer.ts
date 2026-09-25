import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer>
      <!-- The brand stays French in every language (BR-1 of localization.md). -->
      <div class="footer-logo">Notre <span>Refuge</span> · Le Sauze</div>
      <p class="footer-copy" i18n="@@footer.copyright">© {{ year }} · Tous droits réservés</p>
    </footer>
  `,
  styleUrl: './footer.css'
})
export class FooterComponent {
  protected readonly year = new Date().getFullYear();
}
