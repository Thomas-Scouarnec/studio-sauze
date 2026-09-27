import { TestBed } from '@angular/core/testing';
import { StayService, StayItem } from './stay.service';
import { FlatInfoService } from './flat-info.service';
import { ContactService } from './contact.service';
import { SeasonsService } from './seasons.service';

describe('StayService', () => {
  function service(): StayService {
    return TestBed.inject(StayService);
  }

  function allItems(): StayItem[] {
    return service()
      .sections()
      .flatMap((section) => section.groups.flatMap((group) => group.items));
  }

  it('should expose the nine sections in trip order, with English ids (FR-13)', () => {
    const sections = service().sections();
    expect(sections.map((s) => s.id)).toEqual([
      'welcome',
      'before-arrival',
      'arrival',
      'flat',
      'activities',
      'shops',
      'practical',
      'before-leaving',
      'after-leaving',
    ]);
    expect(sections.map((s) => s.title)).toEqual([
      'Bienvenue',
      "Avant d'arriver",
      "À l'arrivée",
      "L'appartement",
      'Activités',
      'Commerces et services',
      'Infos pratiques',
      'Avant de partir',
      'Après votre séjour',
    ]);
  });

  it('should keep the activities to a lead item and three groups (FR-15)', () => {
    const activities = service().sections().find((s) => s.id === 'activities');
    expect(activities?.groups.map((g) => g.title)).toEqual([
      undefined,
      'Hiver',
      'Été',
      "Toute l'année",
    ]);
    // The lead item is the valley's own site, before any season.
    expect(activities?.groups[0].items[0].title).toBe("Office de tourisme de l'Ubaye");
  });

  it('should keep hikes, paths and trails as one item (FR-15)', () => {
    const summer = service()
      .sections()
      .find((s) => s.id === 'activities')!
      .groups.find((g) => g.title === 'Été');
    expect(summer?.items[0].title).toBe('Randonnées, sentiers et trails');
    expect(summer?.items.filter((i) => i.pending).length).toBe(1);
  });

  it('should reuse the ski domain and tourism office links from SeasonsService (BR-5)', () => {
    const seasons = TestBed.inject(SeasonsService).seasons();
    const winterLink = seasons.find((s) => s.id === 'winter')!.link;
    const summerLink = seasons.find((s) => s.id === 'summer')!.link;

    expect(allItems().find((i) => i.title === 'Le domaine skiable')?.link).toEqual(winterLink);
    expect(allItems().find((i) => i.title === "Office de tourisme de l'Ubaye")?.link).toEqual(
      summerLink,
    );
  });

  it('should list the rink, the water base and the cinema, each with a link', () => {
    const titles = ['Patinoire de Pra-Loup', 'La base nautique de Jausiers', 'Cinéma'];
    for (const title of titles) {
      const item = allItems().find((i) => i.title === title);
      expect(item?.pending).toBeUndefined();
      expect(item?.link?.url).toMatch(/^https:\/\//);
    }
  });

  it('should list the tennis courts, the pétanque court and the wooden games', () => {
    const activities = service().sections().find((s) => s.id === 'activities');
    const titlesOf = (group: string) =>
      activities?.groups.find((g) => g.title === group)?.items.map((item) => item.title);
    expect(titlesOf('Été')).toEqual(expect.arrayContaining(['Tennis', 'Pétanque']));
    expect(titlesOf("Toute l'année")).toContain('Jeux en bois');
  });

  it('should list the restaurants among the shops and services, not the activities (FR-15)', () => {
    const sections = service().sections();
    const shops = sections.find((s) => s.id === 'shops');
    const activities = sections.find((s) => s.id === 'activities');

    expect(shops?.groups[0].items.map((item) => item.title)).toEqual([
      'Supermarché',
      'Boulangerie',
      'Restaurants',
      'Pharmacie',
      'Médecin',
      'Hôpital le plus proche',
    ]);
    expect(JSON.stringify(activities)).not.toContain('Restaurant');
  });

  it('should state the linen rule before arriving (FR-18)', () => {
    const before = service().sections().find((s) => s.id === 'before-arrival');
    const texts = before!.groups.flatMap((g) => g.items).map((i) => i.text ?? '').join(' ');
    expect(texts).toContain('ne sont pas fournis');
  });

  it('should put the arrival time and the key handover in the arrival section (FR-17)', () => {
    const sections = service().sections();
    const arrival = sections.find((s) => s.id === 'arrival');
    const item = arrival!.groups
      .flatMap((g) => g.items)
      .find((i) => i.title === 'Arrivée et remise des clés');

    expect(item?.text).toContain('à partir de 16 h');
    expect(item?.text).toContain('remet les clés');
    expect(item?.text).toContain('email de confirmation');

    // They belong where they are used, so they are not also stated before arriving.
    const before = sections.find((s) => s.id === 'before-arrival');
    expect(JSON.stringify(before)).not.toContain('16 h');
    expect(JSON.stringify(before)).not.toContain('clés');
  });

  it('should keep the departure time in the checkout checklist (FR-17)', () => {
    const leaving = service().sections().find((s) => s.id === 'before-leaving');
    const texts = leaving!.groups.flatMap((g) => g.items).map((i) => i.text ?? '');
    expect(texts).toContain('Départ avant 11 h.');
  });

  it('should link the official winter equipment page (FR-19)', () => {
    const link = allItems().find((item) => item.title === "En voiture l'hiver")?.link;
    expect(link?.url).toBe(
      'https://www.securite-routiere.gouv.fr/equipements-hivernaux-departements-et-communes',
    );
  });

  it('should read the postal address and Maps link from FlatInfoService (BR-5, FR-20)', () => {
    const flatInfo = TestBed.inject(FlatInfoService).info();
    const address = allItems().find((i) => i.title === "L'adresse");
    expect(address?.text).toContain(flatInfo.residenceName);
    expect(address?.text).toContain(flatInfo.buildingName);
    expect(address?.text).toContain(flatInfo.street);
    expect(address?.text).toContain(flatInfo.postalCode);
    expect(address?.text).toContain(flatInfo.commune);
    expect(address?.link?.url).toBe(flatInfo.mapsUrl);
  });

  it('should give the way from the lift to the flat (FR-20)', () => {
    const item = allItems().find((i) => i.title === "Jusqu'à l'appartement");
    expect(item?.text).toContain('1er étage');
    expect(item?.text).toContain('n° 10');
  });

  it('should read the contact email from ContactService (BR-5)', () => {
    const email = TestBed.inject(ContactService).email;
    const withEmail = allItems().filter((item) => item.text?.includes(email));
    expect(withEmail.length).toBeGreaterThanOrEqual(3);
  });

  it('should carry no phone number (BR-4)', () => {
    const everything = JSON.stringify(service().sections());
    expect(everything).not.toMatch(/(\+33|\b0[1-9])[\s.-]?(\d{2}[\s.-]?){4}/);
  });

  it('should warn about the similar residence on the way to the parking', () => {
    const parking = allItems().find((item) => item.title === 'Accéder au parking');
    const flatInfo = TestBed.inject(FlatInfoService).info();
    expect(parking?.pending).toBeUndefined();
    expect(parking?.text).toContain('Le Soleil du Sauze');
    expect(parking?.text).toContain(flatInfo.residenceName);
    expect(parking?.text).toContain(flatInfo.buildingName);
  });

  it('should declare the two parking photos still to take, each described (FR-21)', () => {
    const parking = allItems().find((item) => item.title === 'Accéder au parking');
    expect(parking?.photos?.length).toBe(2);
    for (const slot of parking!.photos!) {
      expect(slot.description.length).toBeGreaterThan(0);
      expect(slot.photo).toBeUndefined();
    }
  });

  it('should mark the facts still missing as pending, with a title to fill (FR-16)', () => {
    const pending = allItems().filter((item) => item.pending);
    expect(pending.length).toBeGreaterThan(0);
    for (const item of pending) {
      expect(item.title).toBeTruthy();
    }
  });

  it('should frame the inventory as what to expect, not a checklist to audit', () => {
    const inventory = allItems().find((item) => item.title === 'Inventaire');
    expect(inventory?.pending).toBe(true);
    expect(inventory?.text).toContain('ce qui vous attend');
    expect(inventory?.text).toContain('Rien à recompter au départ');
  });
});
