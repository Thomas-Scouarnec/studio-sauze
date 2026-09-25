import { Injectable, computed, inject } from '@angular/core';
import { FlatInfoService } from './flat-info.service';

export interface ContactChecklistItem {
  icon: string;
  label: string;
}

@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly flatInfo = inject(FlatInfoService);

  readonly email = 'refugedusauze@gmail.com';

  readonly mailtoUrl = `mailto:${this.email}`;

  readonly requestChecklist = computed<ContactChecklistItem[]>(() => [
    { icon: '📅', label: $localize`:@@contact.checklist.dates:Vos dates d'arrivée et de départ` },
    {
      icon: '👥',
      label: $localize`:@@contact.checklist.guests:Le nombre de personnes (${this.flatInfo.info().maxGuests}:maxGuests: au maximum)`,
    },
    { icon: '💬', label: $localize`:@@contact.checklist.questions:Vos questions éventuelles` },
  ]);
}
