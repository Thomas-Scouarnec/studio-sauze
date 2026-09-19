import { Injectable, signal, computed } from '@angular/core';
import { ResponsivePhoto } from '../loaders/responsive-image-loader';

export interface EquipmentBlock {
  id: string;
  title: string;
  body: string;
  /** Absent until a photo that meets BR-7 exists: the block then renders text only. */
  photo?: ResponsivePhoto;
}

export interface EquipmentItem {
  icon: string;
  label: string;
}

export interface AboutPhotos {
  livingRoom: ResponsivePhoto;
  forestView: ResponsivePhoto;
  mountain: ResponsivePhoto;
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
      // Shows locker numbers: published at the owner's explicit request, an exception to BR-7.
      photo: {
        src: 'equipment/arrival',
        srcset: '800w',
        alt: 'Les casiers à skis sécurisés du rez-de-chaussée',
      },
    },
    {
      id: 'sleeping',
      title: "Cinq vrais couchages, et de l'intimité",
      body: "Le coin montagne accueille 3 personnes sur de véritables couchages de 80 cm adaptés aux adultes, isolables par un rideau. Dans le séjour, un canapé-lit 160 cm de très bonne qualité pour deux personnes de plus.",
      photo: {
        src: 'equipment/sleeping',
        srcset: '800w',
        alt: 'Deux enfants blottis dans les couchages du coin montagne',
      },
    },
    {
      id: 'kitchen',
      title: "Une cuisine où l'on cuisine vraiment",
      body: "Grand réfrigérateur de 140 cm, four, lave-vaisselle, plaques, micro-ondes, bouilloire et cafetière filtre — sans oublier l'appareil à raclette. Autour de la grande table en bois, vous tenez à cinq : trois chaises et un banc.",
      photo: {
        src: 'equipment/kitchen',
        srcset: '800w',
        alt: 'Le coin cuisine : micro-ondes et meubles en pin, à côté de la télévision',
      },
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

  private readonly _aboutPhotos = signal<AboutPhotos>({
    livingRoom: {
      src: 'about/living-room',
      srcset: '800w, 1200w',
      alt: 'Le séjour, avec son canapé-lit et sa commode en pin',
    },
    forestView: {
      src: 'about/forest-view',
      srcset: '800w',
      alt: 'La fenêtre du séjour, ouverte sur la forêt',
    },
    mountain: {
      src: 'about/mountain',
      srcset: '800w',
      alt: 'Le Chapeau du Gendarme, sommet calcaire sous un ciel bleu',
    },
  });

  readonly info = this._info.asReadonly();

  readonly aboutPhotos = this._aboutPhotos.asReadonly();

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
