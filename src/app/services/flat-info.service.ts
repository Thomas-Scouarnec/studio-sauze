import { Injectable, signal, computed } from '@angular/core';

export interface FlatInfo {
  name: string;
  station: string;
  city: string;
  region: string;
  surface: number;
  minGuests: number;
  maxGuests: number;
  description: string;
}

@Injectable({ providedIn: 'root' })
export class FlatInfoService {
  private readonly _info = signal<FlatInfo>({
    name: 'Studio Sauze',
    station: 'Station du Sauze',
    city: 'Barcelonnette',
    region: 'Alpes de Haute-Provence',
    surface: 32,
    minGuests: 2,
    maxGuests: 4,
    description: 'A cosy studio flat in the heart of the Southern Alps.',
  });

  readonly info = this._info.asReadonly();

  readonly fullLocation = computed(
    () => `${this._info().station} · ${this._info().region}`
  );

  readonly guestRange = computed(
    () => `${this._info().minGuests}–${this._info().maxGuests}`
  );

  readonly isAvailableForRental = computed(() => this._info().maxGuests > 0);
}
