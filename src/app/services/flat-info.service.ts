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

export interface GalleryPhotos {
  mountainCornerClosed: ResponsivePhoto;
  diningTable: ResponsivePhoto;
  livingRoomWindowSide: ResponsivePhoto;
}

export interface FlatInfo {
  name: string;
  station: string;
  city: string;
  region: string;
  residenceName: string;
  buildingName: string;
  /**
   * Postal address. Guest page only (BR-2 of `flat-info.md`): the public
   * sections show the residence, the building and `mapsUrl`, never the street.
   */
  street: string;
  postalCode: string;
  commune: string;
  mapsUrl: string;
  surface: number;
  minGuests: number;
  maxGuests: number;
}

@Injectable({ providedIn: 'root' })
export class FlatInfoService {
  private readonly _info = signal<FlatInfo>({
    name: 'Studio Sauze',
    station: $localize`:@@flatInfo.station:Station du Sauze`,
    city: 'Barcelonnette',
    region: 'Alpes de Haute-Provence',
    residenceName: 'Le Roi Soleil',
    buildingName: 'Crépuscule',
    street: '276 Imp. du Roi Soleil',
    postalCode: '04400',
    commune: 'Enchastrayes',
    mapsUrl: 'https://maps.app.goo.gl/ujDrvDNVL2vmLQ488',
    surface: 32,
    minGuests: 2,
    maxGuests: 5,
  });

  private readonly _equipmentBlocks = signal<EquipmentBlock[]>([
    {
      id: 'arrival',
      title: $localize`:@@equipment.arrival.title:Vos skis restent en bas`,
      body: $localize`:@@equipment.arrival.body:Parking gratuit au pied du bâtiment et casier à skis sécurisé au rez-de-chaussée : vous y déposez le matériel en arrivant, puis vous montez au 1er étage en ascenseur.`,
      // No ski locker photo yet: the residence entrance stands in (Bolt 27, D2).
      photo: {
        src: 'equipment/arrival',
        srcset: '800w, 1200w',
        alt: $localize`:@@equipment.arrival.alt:L'entrée du bâtiment ${this._info().buildingName}:building:, résidence ${this._info().residenceName}:residence:`,
      },
    },
    {
      id: 'sleeping',
      title: $localize`:@@equipment.sleeping.title:Cinq vrais couchages, et de l'intimité`,
      body: $localize`:@@equipment.sleeping.body:Le coin montagne accueille 3 personnes sur de véritables couchages de 80 cm adaptés aux adultes, isolables par un rideau. Dans le séjour, un canapé-lit 160 cm de très bonne qualité pour deux personnes de plus.`,
      photo: {
        src: 'equipment/sleeping',
        srcset: '800w, 1200w',
        alt: $localize`:@@equipment.sleeping.alt:Le coin montagne : les lits superposés et le lit gigogne tiré`,
      },
    },
    {
      id: 'kitchen',
      title: $localize`:@@equipment.kitchen.title:Une cuisine où l'on cuisine vraiment`,
      body: $localize`:@@equipment.kitchen.body:Grand réfrigérateur de 140 cm, four, lave-vaisselle, plaques, micro-ondes, bouilloire et cafetière filtre — sans oublier l'appareil à raclette. Autour de la grande table en bois, vous tenez à cinq : trois chaises et un banc.`,
      photo: {
        src: 'equipment/kitchen',
        srcset: '800w, 1200w',
        alt: $localize`:@@equipment.kitchen.alt:Le coin cuisine : réfrigérateur, plan de travail et meubles en pin`,
      },
    },
  ]);

  private readonly _equipmentItems = signal<EquipmentItem[]>([
    { icon: '🛁', label: $localize`:@@equipment.item.bath:Baignoire et douche` },
    { icon: '🚽', label: $localize`:@@equipment.item.toilet:WC séparés` },
    { icon: '🧺', label: $localize`:@@equipment.item.washingMachine:Lave-linge` },
    { icon: '📺', label: $localize`:@@equipment.item.tv:TV (TNT)` },
    { icon: '🧳', label: $localize`:@@equipment.item.storage:Plusieurs espaces de rangement` },
    {
      icon: '🥾',
      label: $localize`:@@equipment.item.drying:Emplacement pour sécher chaussures et gants`,
    },
    {
      icon: '📶',
      label: $localize`:@@equipment.item.network:Très bon réseau 4G/5G — pas de Wi-Fi`,
    },
    { icon: '🌲', label: $localize`:@@equipment.item.forestView:Vue sur la forêt` },
  ]);

  private readonly _aboutPhotos = signal<AboutPhotos>({
    livingRoom: {
      src: 'about/living-room',
      srcset: '800w, 1200w',
      alt: $localize`:@@about.photo.livingRoom.alt:Le séjour : le canapé-lit rouge, la table et la grande fenêtre`,
    },
    forestView: {
      src: 'about/forest-view',
      srcset: '800w, 1200w',
      alt: $localize`:@@about.photo.forestView.alt:La fenêtre du séjour, ouverte sur la forêt`,
    },
    mountain: {
      src: 'about/mountain',
      srcset: '800w, 1200w',
      alt: $localize`:@@about.photo.mountain.alt:Les sommets de l'Ubaye au-dessus du Sauze, aux couleurs de l'automne`,
    },
  });

  /**
   * Flat photos shown only in the gallery, declared here once (BR-8):
   * `GalleryService` places them among the section photos.
   */
  private readonly _galleryPhotos = signal<GalleryPhotos>({
    mountainCornerClosed: {
      src: 'gallery/mountain-corner-closed',
      srcset: '800w, 1200w',
      alt: $localize`:@@gallery.photo.mountainCornerClosed.alt:Le coin montagne, rideau tiré pour l'intimité`,
    },
    diningTable: {
      src: 'gallery/dining-table',
      srcset: '800w, 1200w',
      alt: $localize`:@@gallery.photo.diningTable.alt:La table du séjour dressée pour une raclette`,
    },
    livingRoomWindowSide: {
      src: 'gallery/living-room-window-side',
      srcset: '800w, 1200w',
      alt: $localize`:@@gallery.photo.livingRoomWindowSide.alt:Le séjour côté fenêtre : fauteuil en rotin, étagère et commode en pin`,
    },
  });

  readonly info = this._info.asReadonly();

  readonly aboutPhotos = this._aboutPhotos.asReadonly();

  readonly galleryPhotos = this._galleryPhotos.asReadonly();

  readonly equipmentBlocks = this._equipmentBlocks.asReadonly();

  readonly equipmentItems = this._equipmentItems.asReadonly();

  readonly fullLocation = computed(() => `${this._info().station} · ${this._info().region}`);

  readonly guestRange = computed(() => `${this._info().minGuests}–${this._info().maxGuests}`);

  readonly isAvailableForRental = computed(() => this._info().maxGuests > 0);
}
