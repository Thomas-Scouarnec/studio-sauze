import { Injectable, signal, computed } from '@angular/core';

export interface FlatInfo {
  name: string;
  station: string;
  city: string;
  region: string;
  residenceName: string;
  buildingName: string;
  mapsUrl: string;
  surface: number;
  minGuests: number;
  maxGuests: number;
}

@Injectable({ providedIn: 'root' })
export class FlatInfoService {
  private readonly _info = signal<FlatInfo>({
    name: 'Studio Sauze',
    station: 'Station du Sauze',
    city: 'Barcelonnette',
    region: 'Alpes de Haute-Provence',
    residenceName: 'Le Roi Soleil',
    buildingName: 'Crépuscule',
    mapsUrl: 'https://maps.app.goo.gl/AYnuYPqsfuqbwnkR6',
    surface: 32,
    minGuests: 2,
    maxGuests: 5,
  });

  readonly info = this._info.asReadonly();

  readonly fullLocation = computed(
    () => `${this._info().station} · ${this._info().region}`
  );

  readonly guestRange = computed(
    () => `${this._info().minGuests}–${this._info().maxGuests}`
  );

  readonly guestCountOptions = computed(() =>
    Array.from({ length: this._info().maxGuests }, (_, i) => i + 1)
  );

  readonly isAvailableForRental = computed(() => this._info().maxGuests > 0);
}
