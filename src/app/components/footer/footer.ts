import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer>
      <div class="footer-logo">Notre <span>Refuge</span> · Le Sauze</div>
      <p class="footer-copy">© 2025 · Tous droits réservés</p>
    </footer>
  `,
  styleUrl: './footer.css'
})
export class FooterComponent {}
