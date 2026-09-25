import { Injectable, signal } from '@angular/core';
import { ResponsivePhoto } from '../loaders/responsive-image-loader';

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
  photo: ResponsivePhoto;
  highlights: SeasonHighlight[];
  tags: string[];
  link: SeasonLink;
}

@Injectable({ providedIn: 'root' })
export class SeasonsService {
  private readonly _seasons = signal<Season[]>([
    {
      id: 'winter',
      marker: $localize`:@@seasons.winter.marker:Décembre – Avril`,
      title: $localize`:@@seasons.winter.title:L'hiver`,
      description: $localize`:@@seasons.winter.description:De décembre à avril, la station vit au rythme de la neige, loin de l'agitation des grandes stations.`,
      photo: {
        src: 'seasons/sauze-winter',
        srcset: '800w, 1600w',
        alt: $localize`:@@seasons.winter.alt:Le front de neige du Sauze, au pied des chalets, face aux sommets enneigés`,
      },
      highlights: [
        {
          title: $localize`:@@seasons.winter.skiArea.title:Le domaine Sauze – Super-Sauze`,
          text: $localize`:@@seasons.winter.skiArea.text:Des pistes pour tous les niveaux, du débutant au skieur confirmé.`,
        },
        {
          title: $localize`:@@seasons.winter.snowshoes.title:Raquettes au départ de la résidence`,
          text: $localize`:@@seasons.winter.snowshoes.text:Les itinéraires commencent à quelques mètres.`,
        },
        {
          title: $localize`:@@seasons.winter.sledging.title:Luge`,
          text: $localize`:@@seasons.winter.sledging.text:De quoi occuper les après-midis en famille.`,
        },
      ],
      tags: [
        $localize`:@@seasons.winter.tag.ski:Ski alpin`,
        $localize`:@@seasons.winter.tag.snowboard:Snowboard`,
        $localize`:@@seasons.winter.tag.praLoup:Pra-Loup à 15 km`,
      ],
      link: {
        label: $localize`:@@seasons.winter.link:Domaine du Sauze`,
        url: 'https://www.sauze.com/',
      },
    },
    {
      id: 'summer',
      marker: $localize`:@@seasons.summer.marker:Juin – Septembre`,
      title: $localize`:@@seasons.summer.title:L'été`,
      description: $localize`:@@seasons.summer.description:L'été, la vallée de l'Ubaye change de visage : sentiers, rivières et grands espaces à portée de main.`,
      photo: {
        src: 'seasons/barcelonnette-summer',
        srcset: '800w, 1260w',
        alt: $localize`:@@seasons.summer.alt:Danseuses en robes colorées dans une rue de Barcelonnette pendant les Fêtes Latino-Mexicaines`,
      },
      highlights: [
        {
          title: $localize`:@@seasons.summer.festival.title:Les Fêtes Latino-Mexicaines de Barcelonnette`,
          text: $localize`:@@seasons.summer.festival.text:Dix jours à la mi-août, héritage de l'émigration de la vallée vers le Mexique.`,
        },
        {
          title: $localize`:@@seasons.summer.lake.title:Le lac de Serre-Ponçon`,
          text: $localize`:@@seasons.summer.lake.text:À 45 minutes de voiture, baignade et sports nautiques.`,
        },
        {
          title: $localize`:@@seasons.summer.mercantour.title:Randonnée dans le Mercantour`,
          text: $localize`:@@seasons.summer.mercantour.text:Les sentiers du parc national au départ de la vallée.`,
        },
      ],
      tags: [
        $localize`:@@seasons.summer.tag.trail:Trail`,
        $localize`:@@seasons.summer.tag.mtb:VTT`,
        $localize`:@@seasons.summer.tag.paragliding:Parapente`,
        $localize`:@@seasons.summer.tag.canyoning:Canyoning`,
      ],
      link: {
        label: $localize`:@@seasons.summer.link:Offices de tourisme de l'Ubaye`,
        url: 'https://www.ubaye.com/votre-sejour/offices-de-tourisme/',
      },
    },
  ]);

  readonly seasons = this._seasons.asReadonly();
}
