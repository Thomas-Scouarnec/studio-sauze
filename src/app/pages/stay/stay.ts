import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { NavbarComponent } from '../../components/navbar/navbar';
import { GuestAccessService } from '../../services/guest-access.service';

/**
 * The unlisted page for guests, shown at `/stay` (FR-1). It is reached only
 * from the link in the booking email — nothing on the public site points here
 * until the visitor has been here once (FR-2, FR-6).
 */
@Component({
  selector: 'app-stay',
  imports: [NavbarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './stay.html',
  styleUrl: './stay.css'
})
export class StayComponent {
  constructor() {
    inject(GuestAccessService).markAsGuest();

    // FR-3: noindex on this page only, so it must not outlive it.
    const meta = inject(Meta);
    meta.updateTag({ name: 'robots', content: 'noindex' });
    inject(DestroyRef).onDestroy(() => meta.removeTag('name="robots"'));
  }
}
