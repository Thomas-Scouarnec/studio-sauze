import { Injectable, computed, inject } from '@angular/core';
import { ResponsivePhoto } from '../loaders/responsive-image-loader';
import { ContactService } from './contact.service';
import { FlatInfoService } from './flat-info.service';
import { SeasonsService } from './seasons.service';

export interface StayLink {
  label: string;
  url: string;
}

/**
 * An illustration for an item. `description` states what the photo must show;
 * it becomes the alt text once `photo` exists, and meanwhile it is what the
 * « Photo à venir » slot announces (FR-21).
 */
export interface StayPhoto {
  description: string;
  photo?: ResponsivePhoto;
}

export interface StayItem {
  title?: string;
  text?: string;
  link?: StayLink;
  photos?: StayPhoto[];
  /**
   * A fact Thomas has not supplied yet: renders « Information à venir » (FR-16),
   * after `text` when the item already carries an introduction.
   */
  pending?: true;
}

export interface StayGroup {
  title?: string;
  items: StayItem[];
}

export interface StaySection {
  /** English anchor id, French title — the project convention. */
  id: string;
  title: string;
  groups: StayGroup[];
}

const WINTER_TYRES_URL =
  'https://www.securite-routiere.gouv.fr/equipements-hivernaux-departements-et-communes';

const GROCERIES_LINK: StayLink = {
  label: 'Intermarché de Saint-Pons sur Google Maps',
  url: 'https://www.google.com/maps/search/?api=1&query=Intermarch%C3%A9+Saint-Pons+04400',
};

/**
 * The guest guide shown on `/stay` (FR-13 to FR-20).
 *
 * A `computed()` rather than a plain signal, because several sentences embed
 * facts owned elsewhere — the residence and building names, the Maps link and
 * the contact email — which are read, never restated (BR-5).
 *
 * No phone number appears here (BR-4): the owners' number and the key
 * holder's contact belong to the booking email, not to a page whose source is
 * public.
 */
@Injectable({ providedIn: 'root' })
export class StayService {
  private readonly flatInfo = inject(FlatInfoService);
  private readonly contact = inject(ContactService);
  private readonly seasons = inject(SeasonsService);

  /** The Seasons section already publishes these links; they are reused, not restated (BR-5). */
  private seasonLink(id: string): StayLink | undefined {
    return this.seasons.seasons().find((season) => season.id === id)?.link;
  }

  readonly sections = computed<StaySection[]>(() => {
    const { residenceName, buildingName, street, postalCode, commune, mapsUrl } =
      this.flatInfo.info();
    const email = this.contact.email;
    const skiDomainLink = this.seasonLink('winter');
    const tourismOfficeLink = this.seasonLink('summer');

    return [
      {
        id: 'welcome',
        title: 'Bienvenue',
        groups: [
          {
            items: [
              {
                text:
                  `Bienvenue au Refuge ! Nous sommes heureux de vous accueillir au Sauze. ` +
                  `Vous trouverez ici tout ce qu'il faut savoir pour votre séjour, de l'arrivée au départ. ` +
                  `Une question ? Écrivez-nous à ${email}. — Thomas et sa famille`,
              },
            ],
          },
        ],
      },
      {
        id: 'before-arrival',
        title: "Avant d'arriver",
        groups: [
          {
            items: [
              {
                title: 'Linge de maison',
                text:
                  "Draps, housses de couette, taies d'oreiller et serviettes ne sont pas fournis : " +
                  "pensez à les apporter. Les oreillers et les couvertures, eux, restent dans l'appartement.",
              },
              {
                title: "En voiture l'hiver",
                text:
                  'Du 1er novembre au 31 mars, la station est soumise à la loi Montagne : pneus hiver obligatoires, ' +
                  'ou chaînes / chaussettes à neige dans le coffre.',
                link: { label: 'Les règles sur le site de la Sécurité Routière', url: WINTER_TYRES_URL },
              },
              {
                title: 'Les courses',
                text:
                  'Faites vos courses avant de monter : nous vous recommandons ' +
                  "l'Intermarché de Saint-Pons, juste à côté de Barcelonnette.",
                link: GROCERIES_LINK,
              },
            ],
          },
        ],
      },
      {
        id: 'arrival',
        title: "À l'arrivée",
        groups: [
          {
            items: [
              {
                title: 'Arrivée et remise des clés',
                text:
                  'Arrivée à partir de 16 h. Une personne sur place vous accueille directement à la résidence ' +
                  'et vous remet les clés ; ses coordonnées figurent dans votre email de confirmation. ' +
                  'Vous arriverez plus tard que prévu ? Prévenez-nous, nous trouverons une solution.',
              },
              {
                title: "L'adresse",
                text: `Résidence ${residenceName}, bâtiment ${buildingName} — ${street}, ${postalCode} ${commune}.`,
                link: { label: 'Voir sur Google Maps', url: mapsUrl },
              },
              {
                title: 'Accéder au parking',
                text:
                  `Attention : vous passez d'abord devant la résidence Le Soleil du Sauze — ce n'est pas la bonne. ` +
                  `La nôtre est la résidence ${residenceName}. Prenez la route à gauche, qui monte : ` +
                  `allez jusqu'en haut, vous arrivez au parking du bâtiment ${buildingName}.`,
                photos: [
                  { description: 'La route à gauche à prendre pour monter à la résidence' },
                  { description: `Le parking du bâtiment ${buildingName}` },
                ],
              },
              {
                title: 'Si le parking est complet',
                text:
                  'Vous pouvez vous garer sur les autres parkings que vous croisez en montant : ' +
                  "c'est autorisé. Sinon, redescendez et garez-vous route de la Grande Ourse : " +
                  "la montée à pied, c'est l'échauffement avant les pistes 😉",
                link: {
                  label: 'Le stationnement route de la Grande Ourse sur Google Maps',
                  url: 'https://maps.app.goo.gl/WXZBYDgAtsWy799L8',
                },
              },
              {
                title: "Jusqu'à l'appartement",
                text:
                  "Prenez l'ascenseur jusqu'au 1er étage : l'appartement n° 10 est à gauche en sortant.",
              },
              {
                title: 'Le casier à skis',
                text: "Au rez-de-chaussée, il s'ouvre avec la même clé que la porte d'entrée.",
              },
              {
                title: 'Connexion',
                text: 'Pas de Wi-Fi, mais un très bon réseau 4G/5G.',
              },
            ],
          },
        ],
      },
      {
        id: 'flat',
        title: "L'appartement",
        groups: [
          {
            items: [
              {
                title: 'Inventaire',
                text:
                  "Cette liste est là pour que vous sachiez ce qui vous attend et ce qu'il reste à prévoir. " +
                  "Rien à recompter au départ : prenez simplement soin des lieux, comme chez vous.",
                pending: true,
              },
              { title: 'Plaques et four', pending: true },
              { title: 'Ouvrir le canapé-lit', pending: true },
              { title: 'Lave-linge', pending: true },
              {
                title: 'Jeux et livres',
                text:
                  'Des jeux de société et des livres, pour les grands comme pour les enfants, ' +
                  'vous attendent sur place.',
              },
              {
                title: 'Déjà sur place',
                text: 'Café et filtres, sel, huile, tablettes pour le lave-vaisselle et produits d\'entretien.',
              },
              {
                title: 'Un souci ?',
                text: `Appelez-nous (numéro dans votre email de confirmation) ou écrivez-nous à ${email}.`,
              },
            ],
          },
        ],
      },
      {
        id: 'activities',
        title: 'Activités',
        groups: [
          {
            // Untitled, so it reads as the section's opening line: the valley's own site covers
            // both seasons and stays up to date (BR-2 of seasons.md — no perishable fact copied).
            items: [
              {
                title: "Office de tourisme de l'Ubaye",
                text: 'Horaires, événements et idées de sorties, tenus à jour par la vallée.',
                ...(tourismOfficeLink ? { link: tourismOfficeLink } : {}),
              },
            ],
          },
          {
            title: 'Hiver',
            items: [
              {
                title: 'Le domaine skiable',
                text:
                  'Les pistes du Sauze – Super-Sauze, pour tous les niveaux. ' +
                  'Skiez à votre rythme et gardez un œil sur les autres : ' +
                  "on vous préfère au bar des pistes qu'au cabinet du médecin 🙂",
                ...(skiDomainLink ? { link: skiDomainLink } : {}),
              },
              { title: 'Randonnées en raquettes', pending: true },
              {
                title: 'Patinoire de Pra-Loup',
                text: 'Patinoire en plein air au cœur de Pra-Loup 1600, patins à louer sur place.',
                link: {
                  label: "La patinoire sur le site de l'Ubaye",
                  url: 'https://www.ubaye.com/activites/activites-hiver/patinoire/',
                },
              },
            ],
          },
          {
            title: 'Été',
            items: [
              { title: 'Randonnées, sentiers et trails', pending: true },
              {
                title: 'La base nautique de Jausiers',
                text:
                  "Baignade, paddle, tennis et coin pique-nique autour du plan d'eau, " +
                  'à environ 15 minutes en voiture par Barcelonnette.',
                link: {
                  label: 'La base nautique de Jausiers sur Google Maps',
                  url: 'https://www.google.com/maps/search/?api=1&query=Base+nautique+Jausiers',
                },
              },
            ],
          },
          {
            // One catch-all rather than a group per occasion: family and rainy-day ideas are the
            // same handful of things, and they do not depend on the season.
            title: "Toute l'année",
            items: [
              { title: 'Activités avec les enfants', pending: true },
              {
                title: 'Cinéma',
                text: 'Le cinéma de Barcelonnette programme les sorties du moment.',
                link: {
                  label: 'Le cinéma de Barcelonnette sur Google Maps',
                  url: 'https://www.google.com/maps/search/?api=1&query=Cin%C3%A9ma+Barcelonnette',
                },
              },
            ],
          },
        ],
      },
      {
        id: 'shops',
        title: 'Commerces et services',
        groups: [
          {
            items: [
              {
                title: 'Supermarché',
                text: "Intermarché de Saint-Pons, juste à côté de Barcelonnette.",
                link: GROCERIES_LINK,
              },
              {
                title: 'Boulangerie',
                text: 'Boulangerie Reynet, au Sauze.',
                link: {
                  label: 'Boulangerie Reynet sur Google Maps',
                  url: 'https://maps.app.goo.gl/dgTDuVboWhTcPjUq8',
                },
              },
              { title: 'Restaurants', pending: true },
              {
                title: 'Pharmacie',
                text: 'Pharmacie Damery.',
                link: {
                  label: 'Pharmacie Damery sur Google Maps',
                  url: 'https://maps.app.goo.gl/YTtH7UnrXWrw8qur7',
                },
              },
              { title: 'Médecin', pending: true },
              { title: 'Hôpital le plus proche', pending: true },
            ],
          },
        ],
      },
      {
        id: 'practical',
        title: 'Infos pratiques',
        groups: [
          {
            items: [
              {
                title: 'Les poubelles',
                text:
                  'Tous les conteneurs sont au même endroit : ordures ménagères et tri sélectif ' +
                  '(plastique, verre…).',
                link: {
                  label: 'Le point de collecte sur Google Maps',
                  url: 'https://maps.app.goo.gl/k2WmAZeY1MsF18go9',
                },
              },
              {
                title: 'Règles de la résidence',
                text:
                  'Les skis restent au casier : ils ne montent pas dans les étages. ' +
                  'On ne circule pas en chaussures de ski dans la résidence.',
              },
            ],
          },
        ],
      },
      {
        id: 'before-leaving',
        title: 'Avant de partir',
        groups: [
          {
            items: [
              { text: 'Départ avant 11 h.' },
              { text: 'Vaisselle faite et rangée.' },
              { text: 'Réfrigérateur vidé.' },
              { text: 'Poubelles descendues.' },
              { text: 'Fenêtres fermées, lumières éteintes.' },
              { text: 'Casier à skis vidé.' },
              { text: 'Clés remises à la personne qui vous a accueillis.' },
            ],
          },
        ],
      },
      {
        id: 'after-leaving',
        title: 'Après votre séjour',
        groups: [
          {
            items: [
              {
                text:
                  `Merci d'avoir séjourné au Refuge ! Un avis, une suggestion ? Écrivez-nous à ${email}. ` +
                  `Et si vous avez aimé, parlez-en autour de vous : le bouche-à-oreille est notre meilleure publicité.`,
              },
            ],
          },
        ],
      },
    ];
  });
}
