import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav aria-label="Navigation principale">
      <div class="nav-logo">Notre <span>Refuge</span></div>
      <ul class="nav-links">
        <li><a href="#about">L'appartement</a></li>
        <li><a href="#features">Équipements</a></li>
        <li><a href="#seasons">Activités</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
    </nav>
  `,
  styleUrl: './navbar.css'
})
export class NavbarComponent {}
