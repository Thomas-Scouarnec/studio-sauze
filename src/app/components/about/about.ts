import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IMAGE_LOADER, NgOptimizedImage } from '@angular/common';
import { FlatInfoService } from '../../services/flat-info.service';
import { responsiveImageLoader } from '../../loaders/responsive-image-loader';

@Component({
  selector: 'app-about',
  imports: [NgOptimizedImage],
  // Scoped to this component: only its images follow the `<name>-<width>w.webp` convention.
  providers: [{ provide: IMAGE_LOADER, useValue: responsiveImageLoader }],
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
