import { Injectable, signal } from '@angular/core';

export interface SeasonHighlight {
  title: string;
  text: string;
}

export interface SeasonLink {
  label: string;
  url: string;
}

export interface Season {
  id: string;
  marker: string;
  title: string;
  description: string;
  photoLabel: string;
  highlights: SeasonHighlight[];
  tags: string[];
  link: SeasonLink;
}

@Injectable({ providedIn: 'root' })
export class SeasonsService {
  private readonly _seasons = signal<Season[]>([
    {
      id: 'winter',
      marker: 'Décembre – Avril',
      title: "L'hiver",
      description:
        "De décembre à avril, la station vit au rythme de la neige, loin de l'agitation des grandes stations.",
      photoLabel: 'Photo — les pistes du Sauze',
      highlights: [
        {
          title: 'Le domaine Sauze – Super-Sauze',
          text: 'Des pistes pour tous les niveaux, du débutant au skieur confirmé.',
        },
        {
          title: 'Raquettes au départ de la résidence',
          text: 'Les itinéraires commencent à quelques mètres.',
        },
        {
          title: 'Luge',
          text: 'De quoi occuper les après-midis en famille.',
        },
      ],
      tags: ['Ski alpin', 'Snowboard', 'Pra-Loup à 15 km'],
      link: { label: 'Domaine du Sauze', url: 'https://www.sauze.com/' },
    },
    {
      id: 'summer',
      marker: 'Juin – Septembre',
      title: "L'été",
      description:
        "L'été, la vallée de l'Ubaye change de visage : sentiers, rivières et grands espaces à portée de main.",
      photoLabel: 'Photo — Barcelonnette pendant les Fêtes Latino-Mexicaines',
      highlights: [
        {
          title: 'Les Fêtes Latino-Mexicaines de Barcelonnette',
          text: "Dix jours à la mi-août, héritage de l'émigration de la vallée vers le Mexique.",
        },
        {
          title: 'Le lac de Serre-Ponçon',
          text: 'À 45 minutes de voiture, baignade et sports nautiques.',
        },
        {
          title: 'Randonnée dans le Mercantour',
          text: 'Les sentiers du parc national au départ de la vallée.',
        },
      ],
      tags: ['Trail', 'VTT', 'Parapente', 'Canyoning'],
      link: {
        label: "Offices de tourisme de l'Ubaye",
        url: 'https://www.ubaye.com/votre-sejour/offices-de-tourisme/',
      },
    },
  ]);

  readonly seasons = this._seasons.asReadonly();
}
