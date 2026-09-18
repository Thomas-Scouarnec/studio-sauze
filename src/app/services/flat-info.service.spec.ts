import { TestBed } from '@angular/core/testing';
import { FlatInfoService } from './flat-info.service';

describe('FlatInfoService', () => {
  let service: FlatInfoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FlatInfoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should expose the flat name', () => {
    expect(service.info().name).toBe('Studio Sauze');
  });

  it('should expose station and region', () => {
    expect(service.info().station).toBe('Station du Sauze');
    expect(service.info().region).toBe('Alpes de Haute-Provence');
  });

  it('should compute the full location', () => {
    expect(service.fullLocation()).toBe('Station du Sauze · Alpes de Haute-Provence');
  });

  it('should compute the guest range', () => {
    expect(service.guestRange()).toBe('2–5');
  });

  it('should expose the residence and building name', () => {
    expect(service.info().residenceName).toBe('Le Roi Soleil');
    expect(service.info().buildingName).toBe('Crépuscule');
  });

  it('should expose a maps URL', () => {
    expect(service.info().mapsUrl).toBe('https://maps.app.goo.gl/ujDrvDNVL2vmLQ488');
  });

  it('should expose a positive surface', () => {
    expect(service.info().surface).toBeGreaterThan(0);
  });

  it('should indicate the flat is available for rental', () => {
    expect(service.isAvailableForRental()).toBe(true);
  });

  it('should expose the three equipment blocks in display order', () => {
    expect(service.equipmentBlocks().map((block) => block.id)).toEqual([
      'arrival',
      'sleeping',
      'kitchen',
    ]);
  });

  it('should give every equipment block a title and a body', () => {
    for (const block of service.equipmentBlocks()) {
      expect(block.title.trim().length).toBeGreaterThan(0);
      expect(block.body.trim().length).toBeGreaterThan(0);
    }
  });

  it('should expose the eight secondary equipment items', () => {
    expect(service.equipmentItems()).toHaveLength(8);
    for (const item of service.equipmentItems()) {
      expect(item.icon.trim().length).toBeGreaterThan(0);
      expect(item.label.trim().length).toBeGreaterThan(0);
    }
  });

  it('should never publish an appliance brand name (FR-12)', () => {
    const copy = equipmentCopy(service).toLowerCase();
    for (const brand of ['beko', 'bosch', 'moulinex']) {
      expect(copy).not.toContain(brand);
    }
  });

  it('should not describe the drying spot as a sèche-chaussures (FR-16)', () => {
    expect(equipmentCopy(service).toLowerCase()).not.toContain('sèche-chaussures');
  });

  it('should describe every About photo in French alt text (FR-20)', () => {
    const { livingRoom, forestView, mountain } = service.aboutPhotos();
    expect(livingRoom.alt).toBe('Le séjour, avec son canapé-lit et sa commode en pin');
    expect(forestView.alt).toBe('La fenêtre du séjour, ouverte sur la forêt');
    expect(mountain.alt).toBe('Le Chapeau du Gendarme, sommet calcaire sous un ciel bleu');
  });
});

function equipmentCopy(service: FlatInfoService): string {
  return [
    ...service.equipmentBlocks().flatMap((block) => [block.title, block.body]),
    ...service.equipmentItems().map((item) => item.label),
  ].join(' ');
}
