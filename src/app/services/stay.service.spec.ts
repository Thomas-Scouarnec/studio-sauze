import { TestBed } from '@angular/core/testing';
import { StayService, StayItem } from './stay.service';
import { FlatInfoService } from './flat-info.service';
import { ContactService } from './contact.service';

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

  it('should group the activities by season, then family and rain (FR-15)', () => {
    const activities = service().sections().find((s) => s.id === 'activities');
    expect(activities?.groups.map((g) => g.title)).toEqual([
      'Hiver',
      'Été',
      'En famille',
      'Par temps de pluie',
    ]);
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

  it('should state the arrival and departure times and the linen rule (FR-17, FR-18)', () => {
    const texts = allItems()
      .map((item) => item.text ?? '')
      .join(' ');
    expect(texts).toContain('Arrivée à partir de 16 h, départ avant 11 h.');
    expect(texts).toContain('ne sont pas fournis');
    expect(texts).toContain('remet les clés');
  });

  it('should link the official winter equipment page (FR-19)', () => {
    const link = allItems().find((item) => item.title === "En voiture l'hiver")?.link;
    expect(link?.url).toBe(
      'https://www.securite-routiere.gouv.fr/equipements-hivernaux-departements-et-communes',
    );
  });

  it('should read the residence, building and Maps link from FlatInfoService (BR-5, FR-20)', () => {
    const flatInfo = TestBed.inject(FlatInfoService).info();
    const item = allItems().find((i) => i.title === "Jusqu'à l'appartement");
    expect(item?.text).toContain(flatInfo.residenceName);
    expect(item?.text).toContain(flatInfo.buildingName);
    expect(item?.text).toContain('n° 10');
    expect(item?.link?.url).toBe(flatInfo.mapsUrl);
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

  it('should mark the facts still missing as pending, with a title to fill (FR-16)', () => {
    const pending = allItems().filter((item) => item.pending);
    expect(pending.length).toBeGreaterThan(0);
    for (const item of pending) {
      expect(item.title).toBeTruthy();
      expect(item.text).toBeUndefined();
    }
  });
});
