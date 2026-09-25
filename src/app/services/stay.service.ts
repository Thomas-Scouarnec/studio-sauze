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

const GROCERIES_URL =
  'https://www.google.com/maps/search/?api=1&query=Intermarch%C3%A9+Barcelonnette';

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
    const groceriesLink: StayLink = {
      label: $localize`:@@stay.groceries.link:Intermarché de Barcelonnette sur Google Maps`,
      url: GROCERIES_URL,
    };

    return [
      {
        id: 'welcome',
        title: $localize`:@@stay.welcome.title:Bienvenue`,
        groups: [
          {
            items: [
              {
                text: $localize`:@@stay.welcome.message.text:Bienvenue au Refuge ! Nous sommes heureux de vous accueillir au Sauze. Vous trouverez ici tout ce qu'il faut savoir pour votre séjour, de l'arrivée au départ. Une question ? Écrivez-nous à ${email}:email:. — Thomas et sa famille`,
              },
            ],
          },
        ],
      },
      {
        id: 'before-arrival',
        title: $localize`:@@stay.beforeArrival.title:Avant d'arriver`,
        groups: [
          {
            items: [
              {
                title: $localize`:@@stay.beforeArrival.linen.title:Linge de maison`,
                text: $localize`:@@stay.beforeArrival.linen.text:Draps, housses de couette, taies d'oreiller et serviettes ne sont pas fournis : pensez à les apporter. Les oreillers et les couvertures, eux, restent dans l'appartement.`,
              },
              {
                title: $localize`:@@stay.beforeArrival.times.title:Horaires`,
                text: $localize`:@@stay.beforeArrival.times.text:Arrivée à partir de 16 h, départ avant 11 h.`,
              },
              {
                title: $localize`:@@stay.beforeArrival.keys.title:Remise des clés`,
                text: $localize`:@@stay.beforeArrival.keys.text:Une personne sur place vous accueille directement à la résidence et vous remet les clés. Ses coordonnées figurent dans votre email de confirmation. Vous arriverez plus tard que prévu ? Prévenez-nous, nous trouverons une solution.`,
              },
              {
                title: $localize`:@@stay.beforeArrival.winterDriving.title:En voiture l'hiver`,
                text: $localize`:@@stay.beforeArrival.winterDriving.text:Du 1er novembre au 31 mars, la station est soumise à la loi Montagne : pneus hiver obligatoires, ou chaînes / chaussettes à neige dans le coffre.`,
                link: {
                  label: $localize`:@@stay.beforeArrival.winterDriving.link:Les règles sur le site de la Sécurité Routière`,
                  url: WINTER_TYRES_URL,
                },
              },
              {
                title: $localize`:@@stay.beforeArrival.groceries.title:Les courses`,
                text: $localize`:@@stay.beforeArrival.groceries.text:Faites vos courses avant de monter : nous vous recommandons l'Intermarché de Barcelonnette.`,
                link: groceriesLink,
              },
            ],
          },
        ],
      },
      {
        id: 'arrival',
        title: $localize`:@@stay.arrival.title:À l'arrivée`,
        groups: [
          {
            items: [
              { title: $localize`:@@stay.arrival.parking.title:Accéder au parking`, pending: true },
              {
                title: $localize`:@@stay.arrival.parkingFull.title:Si le parking est complet`,
                pending: true,
              },
              {
                title: $localize`:@@stay.arrival.flat.title:Jusqu'à l'appartement`,
                text: $localize`:@@stay.arrival.flat.text:Résidence ${residenceName}:residence:, bâtiment ${buildingName}:building:. Prenez l'ascenseur jusqu'au 1er étage : l'appartement n° 10 est à gauche en sortant.`,
                link: {
                  label: $localize`:@@stay.arrival.flat.link:Voir sur Google Maps`,
                  url: mapsUrl,
                },
              },
              {
                title: $localize`:@@stay.arrival.skiLocker.title:Le casier à skis`,
                text: $localize`:@@stay.arrival.skiLocker.text:Au rez-de-chaussée, il s'ouvre avec la même clé que la porte d'entrée.`,
              },
              {
                title: $localize`:@@stay.arrival.network.title:Connexion`,
                text: $localize`:@@stay.arrival.network.text:Pas de Wi-Fi, mais un très bon réseau 4G/5G.`,
              },
            ],
          },
        ],
      },
      {
        id: 'flat',
        title: $localize`:@@stay.flat.title:L'appartement`,
        groups: [
          {
            items: [
              { title: $localize`:@@stay.flat.inventory.title:Inventaire`, pending: true },
              { title: $localize`:@@stay.flat.cooking.title:Plaques et four`, pending: true },
              { title: $localize`:@@stay.flat.sofaBed.title:Ouvrir le canapé-lit`, pending: true },
              { title: $localize`:@@stay.flat.washingMachine.title:Lave-linge`, pending: true },
              {
                title: $localize`:@@stay.flat.provided.title:Déjà sur place`,
                text: $localize`:@@stay.flat.provided.text:Café et filtres, sel, huile, tablettes pour le lave-vaisselle et produits d'entretien.`,
              },
              {
                title: $localize`:@@stay.flat.problem.title:Un souci ?`,
                text: $localize`:@@stay.flat.problem.text:Appelez-nous (numéro dans votre email de confirmation) ou écrivez-nous à ${email}:email:.`,
              },
            ],
          },
        ],
      },
      {
        id: 'activities',
        title: $localize`:@@stay.activities.title:Activités`,
        groups: [
          {
            title: $localize`:@@stay.activities.winter.title:Hiver`,
            items: [
              {
                title: $localize`:@@stay.activities.snowshoes.title:Randonnées en raquettes`,
                pending: true,
              },
            ],
          },
          {
            title: $localize`:@@stay.activities.summer.title:Été`,
            items: [
              { title: $localize`:@@stay.activities.hikes.title:Randonnées`, pending: true },
              {
                title: $localize`:@@stay.activities.trails.title:Sentiers et trails`,
                pending: true,
              },
            ],
          },
          {
            title: $localize`:@@stay.activities.family.title:En famille`,
            items: [
              {
                title: $localize`:@@stay.activities.children.title:Activités avec les enfants`,
                pending: true,
              },
            ],
          },
          {
            title: $localize`:@@stay.activities.rain.title:Par temps de pluie`,
            items: [
              {
                text: $localize`:@@stay.activities.rain.text:Des jeux de société vous attendent dans l'appartement.`,
              },
            ],
          },
        ],
      },
      {
        id: 'shops',
        title: $localize`:@@stay.shops.title:Commerces et services`,
        groups: [
          {
            items: [
              {
                title: $localize`:@@stay.shops.supermarket.title:Supermarché`,
                text: $localize`:@@stay.shops.supermarket.text:Intermarché de Barcelonnette.`,
                link: groceriesLink,
              },
              { title: $localize`:@@stay.shops.bakery.title:Boulangerie`, pending: true },
              { title: $localize`:@@stay.shops.restaurants.title:Restaurants`, pending: true },
              { title: $localize`:@@stay.shops.pharmacy.title:Pharmacie`, pending: true },
              { title: $localize`:@@stay.shops.doctor.title:Médecin`, pending: true },
              {
                title: $localize`:@@stay.shops.hospital.title:Hôpital le plus proche`,
                pending: true,
              },
            ],
          },
        ],
      },
      {
        id: 'practical',
        title: $localize`:@@stay.practical.title:Infos pratiques`,
        groups: [
          {
            items: [
              { title: $localize`:@@stay.practical.rubbish.title:Les poubelles`, pending: true },
              {
                title: $localize`:@@stay.practical.rules.title:Règles de la résidence`,
                text: $localize`:@@stay.practical.rules.text:Les skis restent au casier : ils ne montent pas dans les étages. On ne circule pas en chaussures de ski dans la résidence.`,
              },
            ],
          },
        ],
      },
      {
        id: 'before-leaving',
        title: $localize`:@@stay.beforeLeaving.title:Avant de partir`,
        groups: [
          {
            items: [
              { text: $localize`:@@stay.beforeLeaving.time.text:Départ avant 11 h.` },
              { text: $localize`:@@stay.beforeLeaving.dishes.text:Vaisselle faite et rangée.` },
              { text: $localize`:@@stay.beforeLeaving.fridge.text:Réfrigérateur vidé.` },
              { text: $localize`:@@stay.beforeLeaving.rubbish.text:Poubelles descendues.` },
              {
                text: $localize`:@@stay.beforeLeaving.windows.text:Fenêtres fermées, lumières éteintes.`,
              },
              { text: $localize`:@@stay.beforeLeaving.skiLocker.text:Casier à skis vidé.` },
              {
                text: $localize`:@@stay.beforeLeaving.keys.text:Clés remises à la personne qui vous a accueillis.`,
              },
            ],
          },
        ],
      },
      {
        id: 'after-leaving',
        title: $localize`:@@stay.afterLeaving.title:Après votre séjour`,
        groups: [
          {
            items: [
              {
                text: $localize`:@@stay.afterLeaving.message.text:Merci d'avoir séjourné au Refuge ! Un avis, une suggestion ? Écrivez-nous à ${email}:email:. Et si vous avez aimé, parlez-en autour de vous : le bouche-à-oreille est notre meilleure publicité.`,
              },
            ],
          },
        ],
      },
    ];
  });
}
