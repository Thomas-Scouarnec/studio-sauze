import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ContactService } from '../../services/contact.service';

@Component({
  selector: 'app-contact',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './contact.html',
  styleUrl: './contact.css',
  host: {
    id: 'contact',
    role: 'region',
    'aria-labelledby': 'contact-heading'
  }
})
export class ContactComponent {
  protected readonly contact = inject(ContactService);
}
