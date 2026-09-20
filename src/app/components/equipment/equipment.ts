import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IMAGE_LOADER, NgOptimizedImage } from '@angular/common';
import { FlatInfoService } from '../../services/flat-info.service';
import { GalleryService } from '../../services/gallery.service';
import { responsiveImageLoader } from '../../loaders/responsive-image-loader';

@Component({
  selector: 'app-equipment',
  imports: [NgOptimizedImage],
  // Scoped to this component: only its images follow the `<name>-<width>w.webp` convention.
  providers: [{ provide: IMAGE_LOADER, useValue: responsiveImageLoader }],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './equipment.html',
  styleUrl: './equipment.css',
  host: {
    id: 'equipment',
    role: 'region',
    'aria-labelledby': 'equipment-heading'
  }
})
export class EquipmentComponent {
  protected readonly flatInfo = inject(FlatInfoService);
  protected readonly gallery = inject(GalleryService);
}
