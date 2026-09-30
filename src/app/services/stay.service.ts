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

const GROCERIES_URL =
  'https://www.google.com/maps/search/?api=1&query=Intermarch%C3%A9+Saint-Pons+04400';

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
    const groceriesLink: StayLink = {
      label: $localize`:@@stay.groceries.link:Intermarché de Saint-Pons sur Google Maps`,
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
                title: $localize`:@@stay.beforeArrival.winterDriving.title:En voiture l'hiver`,
                text: $localize`:@@stay.beforeArrival.winterDriving.text:Du 1er novembre au 31 mars, la station est soumise à la loi Montagne : pneus hiver obligatoires, ou chaînes / chaussettes à neige dans le coffre.`,
                link: {
                  label: $localize`:@@stay.beforeArrival.winterDriving.link:Les règles sur le site de la Sécurité Routière`,
                  url: WINTER_TYRES_URL,
                },
              },
              {
                title: $localize`:@@stay.beforeArrival.groceries.title:Les courses`,
                text: $localize`:@@stay.beforeArrival.groceries.text:Faites vos courses avant de monter : nous vous recommandons l'Intermarché de Saint-Pons, juste à côté de Barcelonnette.`,
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
              {
                title: $localize`:@@stay.arrival.keys.title:Arrivée et remise des clés`,
                text: $localize`:@@stay.arrival.keys.text:Arrivée à partir de 16 h. Une personne sur place vous accueille directement à la résidence et vous remet les clés ; ses coordonnées figurent dans votre email de confirmation. Vous arriverez plus tard que prévu ? Prévenez-nous, nous trouverons une solution.`,
              },
              {
                title: $localize`:@@stay.arrival.address.title:L'adresse`,
                text: $localize`:@@stay.arrival.address.text:Résidence ${residenceName}:residence:, bâtiment ${buildingName}:building: — ${street}:street:, ${postalCode}:postalCode: ${commune}:commune:.`,
                link: {
                  label: $localize`:@@stay.arrival.address.link:Voir sur Google Maps`,
                  url: mapsUrl,
                },
              },
              {
                title: $localize`:@@stay.arrival.parking.title:Accéder au parking`,
                text: $localize`:@@stay.arrival.parking.text:Attention : vous passez d'abord devant la résidence Le Soleil du Sauze — ce n'est pas la bonne. La nôtre est la résidence ${residenceName}:residence:. Prenez la route à gauche, qui monte : allez jusqu'en haut, vous arrivez au parking du bâtiment ${buildingName}:building:.`,
                photos: [
                  {
                    description: $localize`:@@stay.arrival.parking.photo.road:La route à gauche à prendre pour monter à la résidence`,
                  },
                  {
                    description: $localize`:@@stay.arrival.parking.photo.carPark:Le parking du bâtiment ${buildingName}:building:`,
                  },
                ],
              },
              {
                title: $localize`:@@stay.arrival.parkingFull.title:Si le parking est complet`,
                text: $localize`:@@stay.arrival.parkingFull.text:Vous pouvez vous garer sur les autres parkings que vous croisez en montant : c'est autorisé. Sinon, redescendez et garez-vous route de la Grande Ourse : la montée à pied, c'est l'échauffement avant les pistes 😉`,
                link: {
                  label: $localize`:@@stay.arrival.parkingFull.link:Le stationnement route de la Grande Ourse sur Google Maps`,
                  url: 'https://maps.app.goo.gl/WXZBYDgAtsWy799L8',
                },
              },
              {
                title: $localize`:@@stay.arrival.flat.title:Jusqu'à l'appartement`,
                text: $localize`:@@stay.arrival.flat.text:Prenez l'ascenseur jusqu'au 1er étage : l'appartement n° 10 est à gauche en sortant.`,
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
              {
                title: $localize`:@@stay.flat.inventory.title:Inventaire`,
                text: $localize`:@@stay.flat.inventory.text:Cette liste est là pour que vous sachiez ce qui vous attend et ce qu'il reste à prévoir. Rien à recompter au départ : prenez simplement soin des lieux, comme chez vous.`,
                pending: true,
              },
              { title: $localize`:@@stay.flat.cooking.title:Plaques et four`, pending: true },
              { title: $localize`:@@stay.flat.sofaBed.title:Ouvrir le canapé-lit`, pending: true },
              { title: $localize`:@@stay.flat.washingMachine.title:Lave-linge`, pending: true },
              {
                title: $localize`:@@stay.flat.games.title:Jeux et livres`,
                text: $localize`:@@stay.flat.games.text:Des jeux de société et des livres, pour les grands comme pour les enfants, vous attendent sur place.`,
              },
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
            // Untitled, so it reads as the section's opening line: the valley's own site covers
            // both seasons and stays up to date (BR-2 of seasons.md — no perishable fact copied).
            items: [
              {
                title: $localize`:@@stay.activities.tourismOffice.title:Office de tourisme de l'Ubaye`,
                text: $localize`:@@stay.activities.tourismOffice.text:Horaires, événements et idées de sorties, tenus à jour par la vallée.`,
                ...(tourismOfficeLink ? { link: tourismOfficeLink } : {}),
              },
            ],
          },
          {
            title: $localize`:@@stay.activities.winter.title:Hiver`,
            items: [
              {
                title: $localize`:@@stay.activities.skiDomain.title:Le domaine skiable`,
                text: $localize`:@@stay.activities.skiDomain.text:Les pistes du Sauze – Super-Sauze, pour tous les niveaux. Skiez à votre rythme et gardez un œil sur les autres : on vous préfère au bar des pistes qu'au cabinet du médecin 🙂`,
                ...(skiDomainLink ? { link: skiDomainLink } : {}),
              },
              {
                title: $localize`:@@stay.activities.snowshoes.title:Randonnées en raquettes`,
                pending: true,
              },
              {
                title: $localize`:@@stay.activities.iceRink.title:Patinoire de Pra-Loup`,
                text: $localize`:@@stay.activities.iceRink.text:Patinoire en plein air au cœur de Pra-Loup 1600, patins à louer sur place.`,
                link: {
                  label: $localize`:@@stay.activities.iceRink.link:La patinoire sur le site de l'Ubaye`,
                  url: 'https://www.ubaye.com/activites/activites-hiver/patinoire/',
                },
              },
            ],
          },
          {
            title: $localize`:@@stay.activities.summer.title:Été`,
            items: [
              {
                title: $localize`:@@stay.activities.hikes.title:Randonnées, sentiers et trails`,
                pending: true,
              },
              {
                title: $localize`:@@stay.activities.tennis.title:Tennis`,
                text: $localize`:@@stay.activities.tennis.text:Deux courts de tennis en accès libre et gratuit, à 300 m de la résidence.`,
                photos: [
                  {
                    description: $localize`:@@stay.activities.tennis.photo:Les deux courts de tennis`,
                  },
                ],
              },
              {
                title: $localize`:@@stay.activities.petanque.title:Pétanque`,
                text: $localize`:@@stay.activities.petanque.text:Un terrain de pétanque vous attend au pied de la résidence.`,
                photos: [
                  {
                    description: $localize`:@@stay.activities.petanque.photo:Le terrain de pétanque de la résidence`,
                  },
                ],
              },
              {
                title: $localize`:@@stay.activities.lake.title:La base nautique de Jausiers`,
                text: $localize`:@@stay.activities.lake.text:Baignade, paddle, tennis et coin pique-nique autour du plan d'eau, à environ 15 minutes en voiture par Barcelonnette.`,
                link: {
                  label: $localize`:@@stay.activities.lake.link:La base nautique de Jausiers sur Google Maps`,
                  url: 'https://www.google.com/maps/search/?api=1&query=Base+nautique+Jausiers',
                },
              },
            ],
          },
          {
            // One catch-all rather than a group per occasion: family and rainy-day ideas are the
            // same handful of things, and they do not depend on the season.
            title: $localize`:@@stay.activities.yearRound.title:Toute l'année`,
            items: [
              {
                title: $localize`:@@stay.activities.woodenGames.title:Jeux en bois`,
                text: $localize`:@@stay.activities.woodenGames.text:Des jeux en bois pour les enfants, à 300 m de la résidence.`,
              },
              {
                title: $localize`:@@stay.activities.children.title:Activités avec les enfants`,
                pending: true,
              },
              {
                title: $localize`:@@stay.activities.cinema.title:Cinéma`,
                text: $localize`:@@stay.activities.cinema.text:Le cinéma de Barcelonnette programme les sorties du moment.`,
                link: {
                  label: $localize`:@@stay.activities.cinema.link:Le cinéma de Barcelonnette sur Google Maps`,
                  url: 'https://www.google.com/maps/search/?api=1&query=Cin%C3%A9ma+Barcelonnette',
                },
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
                text: $localize`:@@stay.shops.supermarket.text:Intermarché de Saint-Pons, juste à côté de Barcelonnette.`,
                link: groceriesLink,
              },
              {
                title: $localize`:@@stay.shops.bakery.title:Boulangerie`,
                text: $localize`:@@stay.shops.bakery.text:Boulangerie Reynet, au Sauze.`,
                link: {
                  label: $localize`:@@stay.shops.bakery.link:Boulangerie Reynet sur Google Maps`,
                  url: 'https://maps.app.goo.gl/dgTDuVboWhTcPjUq8',
                },
              },
              { title: $localize`:@@stay.shops.restaurants.title:Restaurants`, pending: true },
              {
                title: $localize`:@@stay.shops.pharmacy.title:Pharmacie`,
                text: $localize`:@@stay.shops.pharmacy.text:Pharmacie Damery.`,
                link: {
                  label: $localize`:@@stay.shops.pharmacy.link:Pharmacie Damery sur Google Maps`,
                  url: 'https://maps.app.goo.gl/YTtH7UnrXWrw8qur7',
                },
              },
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
              {
                title: $localize`:@@stay.practical.rubbish.title:Les poubelles`,
                text: $localize`:@@stay.practical.rubbish.text:Tous les conteneurs sont au même endroit : ordures ménagères et tri sélectif (plastique, verre…).`,
                link: {
                  label: $localize`:@@stay.practical.rubbish.link:Le point de collecte sur Google Maps`,
                  url: 'https://maps.app.goo.gl/k2WmAZeY1MsF18go9',
                },
              },
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
