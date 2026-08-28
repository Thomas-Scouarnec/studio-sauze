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
    expect(service.info().mapsUrl).toBe('https://maps.app.goo.gl/AYnuYPqsfuqbwnkR6');
  });

  it('should compute the guest count options from 1 to maxGuests', () => {
    expect(service.guestCountOptions()).toEqual([1, 2, 3, 4, 5]);
  });

  it('should expose a positive surface', () => {
    expect(service.info().surface).toBeGreaterThan(0);
  });

  it('should indicate the flat is available for rental', () => {
    expect(service.isAvailableForRental()).toBe(true);
  });
});
