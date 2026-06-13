import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FlatInfoService } from '../../services/flat-info.service';

@Component({
  selector: 'app-about',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './about.html',
  styleUrl: './about.css',
  host: {
    id: 'about',
    role: 'region',
    'aria-labelledby': 'about-heading'
  }
})
export class AboutComponent {
  protected readonly flatInfo = inject(FlatInfoService);
}
