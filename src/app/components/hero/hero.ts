import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar';

@Component({
  selector: 'app-hero',
  imports: [NavbarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './hero.html',
  styleUrl: './hero.css',
  host: { role: 'banner' }
})
export class HeroComponent {}
