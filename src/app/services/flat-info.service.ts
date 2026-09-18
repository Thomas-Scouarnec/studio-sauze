import { Injectable, signal, computed } from '@angular/core';

export interface EquipmentBlock {
  id: string;
  title: string;
  body: string;
}

export interface EquipmentItem {
  icon: string;
  label: string;
}

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
    mapsUrl: 'https://maps.app.goo.gl/ujDrvDNVL2vmLQ488',
    surface: 32,
    minGuests: 2,
    maxGuests: 5,
  });

  private readonly _equipmentBlocks = signal<EquipmentBlock[]>([
    {
      id: 'arrival',
      title: 'Vos skis restent en bas',
      body: "Parking gratuit au pied du bâtiment et casier à skis sécurisé au rez-de-chaussée : vous y déposez le matériel en arrivant, puis vous montez au 1er étage en ascenseur.",
    },
    {
      id: 'sleeping',
      title: "Cinq vrais couchages, et de l'intimité",
      body: "Le coin montagne accueille 3 personnes sur de véritables couchages de 80 cm adaptés aux adultes, isolables par un rideau. Dans le séjour, un canapé-lit 160 cm de très bonne qualité pour deux personnes de plus.",
    },
    {
      id: 'kitchen',
      title: "Une cuisine où l'on cuisine vraiment",
      body: "Grand réfrigérateur de 140 cm, four, lave-vaisselle, plaques, micro-ondes, bouilloire et cafetière filtre — sans oublier l'appareil à raclette. Autour de la grande table en bois, vous tenez à cinq : trois chaises et un banc.",
    },
  ]);

  private readonly _equipmentItems = signal<EquipmentItem[]>([
    { icon: '🛁', label: 'Baignoire et douche' },
    { icon: '🚽', label: 'WC séparés' },
    { icon: '🧺', label: 'Lave-linge' },
    { icon: '📺', label: 'TV (TNT)' },
    { icon: '🧳', label: 'Plusieurs espaces de rangement' },
    { icon: '🥾', label: 'Emplacement pour sécher chaussures et gants' },
    { icon: '📶', label: 'Très bon réseau 4G/5G — pas de Wi-Fi' },
    { icon: '🌲', label: 'Vue sur la forêt' },
  ]);

  readonly info = this._info.asReadonly();

  readonly equipmentBlocks = this._equipmentBlocks.asReadonly();

  readonly equipmentItems = this._equipmentItems.asReadonly();

  readonly fullLocation = computed(
    () => `${this._info().station} · ${this._info().region}`
  );

  readonly guestRange = computed(
    () => `${this._info().minGuests}–${this._info().maxGuests}`
  );

  readonly isAvailableForRental = computed(() => this._info().maxGuests > 0);
}
