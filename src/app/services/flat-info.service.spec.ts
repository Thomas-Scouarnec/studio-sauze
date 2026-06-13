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

  it('should expose the correct location', () => {
    expect(service.info().location).toBe('Barcelonnette');
    expect(service.info().region).toBe('Alpes de Haute Provence');
  });

  it('should compute the full location', () => {
    expect(service.fullLocation()).toBe('Barcelonnette, Alpes de Haute Provence');
  });

  it('should indicate the flat is available for rental', () => {
    expect(service.isAvailableForRental()).toBe(true);
  });

  it('should expose a positive max guests count', () => {
    expect(service.info().maxGuests).toBeGreaterThan(0);
  });
});
