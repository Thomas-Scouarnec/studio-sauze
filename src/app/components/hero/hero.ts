import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar';
import { FlatInfoService } from '../../services/flat-info.service';

@Component({
  selector: 'app-hero',
  imports: [NavbarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './hero.html',
  styleUrl: './hero.css',
  host: { role: 'banner' }
})
export class HeroComponent {
  protected readonly flatInfo = inject(FlatInfoService);
}
