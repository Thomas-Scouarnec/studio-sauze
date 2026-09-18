import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IMAGE_LOADER, NgOptimizedImage } from '@angular/common';
import { SeasonsService } from '../../services/seasons.service';
import { responsiveImageLoader } from '../../loaders/responsive-image-loader';

@Component({
  selector: 'app-seasons',
  imports: [NgOptimizedImage],
  // Scoped to this component: only its images follow the `<name>-<width>w.webp` convention.
  providers: [{ provide: IMAGE_LOADER, useValue: responsiveImageLoader }],
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
