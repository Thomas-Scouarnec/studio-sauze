import { Injectable, signal, computed } from '@angular/core';

export interface FlatInfo {
  name: string;
  location: string;
  region: string;
  maxGuests: number;
  description: string;
}

@Injectable({ providedIn: 'root' })
export class FlatInfoService {
  private readonly _info = signal<FlatInfo>({
    name: 'Studio Sauze',
    location: 'Barcelonnette',
    region: 'Alpes de Haute Provence',
    maxGuests: 4,
    description: 'A cosy studio flat in the heart of the Southern Alps.',
  });

  readonly info = this._info.asReadonly();

  readonly fullLocation = computed(
    () => `${this._info().location}, ${this._info().region}`
  );

  readonly isAvailableForRental = computed(() => this._info().maxGuests > 0);
}
