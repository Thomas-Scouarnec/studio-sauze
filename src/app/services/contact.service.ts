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
    { icon: '📅', label: "Vos dates d'arrivée et de départ" },
    {
      icon: '👥',
      label: `Le nombre de personnes (${this.flatInfo.info().maxGuests} au maximum)`,
    },
    { icon: '💬', label: 'Vos questions éventuelles' },
  ]);
}
