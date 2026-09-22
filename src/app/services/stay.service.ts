import { Injectable, computed, inject } from '@angular/core';
import { ContactService } from './contact.service';
import { FlatInfoService } from './flat-info.service';

export interface StayLink {
  label: string;
  url: string;
}

export interface StayItem {
  title?: string;
  text?: string;
  link?: StayLink;
  /** A fact Thomas has not supplied yet: renders « Information à venir » (FR-16). */
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
  label: 'Intermarché de Barcelonnette sur Google Maps',
  url: 'https://www.google.com/maps/search/?api=1&query=Intermarch%C3%A9+Barcelonnette',
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

  readonly sections = computed<StaySection[]>(() => {
    const { residenceName, buildingName, mapsUrl } = this.flatInfo.info();
    const email = this.contact.email;

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
                title: 'Horaires',
                text: 'Arrivée à partir de 16 h, départ avant 11 h.',
              },
              {
                title: 'Remise des clés',
                text:
                  'Une personne sur place vous accueille directement à la résidence et vous remet les clés. ' +
                  'Ses coordonnées figurent dans votre email de confirmation. Vous arriverez plus tard que prévu ? ' +
                  'Prévenez-nous, nous trouverons une solution.',
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
                text: "Faites vos courses avant de monter : nous vous recommandons l'Intermarché de Barcelonnette.",
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
              { title: 'Accéder au parking', pending: true },
              { title: 'Si le parking est complet', pending: true },
              {
                title: "Jusqu'à l'appartement",
                text:
                  `Résidence ${residenceName}, bâtiment ${buildingName}. Prenez l'ascenseur jusqu'au 1er étage : ` +
                  `l'appartement n° 10 est à gauche en sortant.`,
                link: { label: 'Voir sur Google Maps', url: mapsUrl },
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
              { title: 'Inventaire', pending: true },
              { title: 'Plaques et four', pending: true },
              { title: 'Ouvrir le canapé-lit', pending: true },
              { title: 'Lave-linge', pending: true },
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
          { title: 'Hiver', items: [{ title: 'Randonnées en raquettes', pending: true }] },
          {
            title: 'Été',
            items: [
              { title: 'Randonnées', pending: true },
              { title: 'Sentiers et trails', pending: true },
            ],
          },
          { title: 'En famille', items: [{ title: 'Activités avec les enfants', pending: true }] },
          {
            title: 'Par temps de pluie',
            items: [{ text: "Des jeux de société vous attendent dans l'appartement." }],
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
                text: 'Intermarché de Barcelonnette.',
                link: GROCERIES_LINK,
              },
              { title: 'Boulangerie', pending: true },
              { title: 'Restaurants', pending: true },
              { title: 'Pharmacie', pending: true },
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
              { title: 'Les poubelles', pending: true },
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
