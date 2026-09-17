import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SeasonsService } from '../../services/seasons.service';

@Component({
  selector: 'app-seasons',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './seasons.html',
  styleUrl: './seasons.css',
  host: {
    id: 'activities',
    role: 'region',
    'aria-labelledby': 'activities-heading'
  }
})
export class SeasonsComponent {
  protected readonly seasonsService = inject(SeasonsService);
}
