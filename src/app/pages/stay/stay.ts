import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { IMAGE_LOADER, NgOptimizedImage } from '@angular/common';
import { Meta } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { responsiveImageLoader } from '../../loaders/responsive-image-loader';
import { NavbarComponent } from '../../components/navbar/navbar';
import { GuestAccessService } from '../../services/guest-access.service';
import { StayService } from '../../services/stay.service';

/**
 * The unlisted page for guests, shown at `/stay` (FR-1). It is reached only
 * from the link in the booking email — nothing on the public site points here
 * until the visitor has been here once (FR-2, FR-6).
 */
@Component({
  selector: 'app-stay',
  imports: [NavbarComponent, RouterLink, NgOptimizedImage],
  // Scoped to this page: only its images follow the `<name>-<width>w.webp` convention.
  providers: [{ provide: IMAGE_LOADER, useValue: responsiveImageLoader }],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './stay.html',
  styleUrl: './stay.css'
})
export class StayComponent {
  protected readonly stay = inject(StayService);

  constructor() {
    inject(GuestAccessService).markAsGuest();

    // FR-3: noindex on this page only, so it must not outlive it.
    const meta = inject(Meta);
    meta.updateTag({ name: 'robots', content: 'noindex' });
    inject(DestroyRef).onDestroy(() => meta.removeTag('name="robots"'));
  }
}
