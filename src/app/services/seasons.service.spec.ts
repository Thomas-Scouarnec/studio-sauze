import { TestBed } from '@angular/core/testing';
import { SeasonsService } from './seasons.service';

describe('SeasonsService', () => {
  let service: SeasonsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SeasonsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should expose winter then summer', () => {
    expect(service.seasons().map((season) => season.id)).toEqual(['winter', 'summer']);
  });

  it('should give every season a marker, title, description and photo label', () => {
    for (const season of service.seasons()) {
      expect(season.marker.trim().length).toBeGreaterThan(0);
      expect(season.title.trim().length).toBeGreaterThan(0);
      expect(season.description.trim().length).toBeGreaterThan(0);
      expect(season.photoLabel.trim().length).toBeGreaterThan(0);
    }
  });

  it('should give every season exactly three highlights with a title and a text', () => {
    for (const season of service.seasons()) {
      expect(season.highlights).toHaveLength(3);
      for (const highlight of season.highlights) {
        expect(highlight.title.trim().length).toBeGreaterThan(0);
        expect(highlight.text.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it('should name the festival and its duration without a specific date', () => {
    const festival = service
      .seasons()
      .find((season) => season.id === 'summer')!
      .highlights.find((highlight) => highlight.title.includes('Latino-Mexicaines'));
    expect(festival).toBeDefined();
    expect(festival!.title).toBe('Les Fêtes Latino-Mexicaines de Barcelonnette');
    expect(festival!.text).toContain('mi-août');
  });

  it('should not publish an unconfirmed or rejected activity (FR-5)', () => {
    const copy = seasonsCopy(service).toLowerCase();
    for (const activity of [
      'ski de fond',
      'ski de randonnée',
      'chiens de traîneau',
      'patinoire',
      'espace lumière',
    ]) {
      expect(copy).not.toContain(activity);
    }
  });

  it('should never publish a year-specific date (BR-2)', () => {
    expect(seasonsCopy(service)).not.toMatch(/\b(19|20)\d{2}\b/);
  });

  it('should publish exactly two links, both to official sources (FR-9)', () => {
    const links = service.seasons().map((season) => season.link);
    expect(links).toHaveLength(2);
    expect(links.map((link) => link.url)).toEqual([
      'https://www.sauze.com/',
      'https://www.ubaye.com/votre-sejour/offices-de-tourisme/',
    ]);
    for (const link of links) {
      expect(link.label.trim().length).toBeGreaterThan(0);
    }
  });
});

function seasonsCopy(service: SeasonsService): string {
  return service
    .seasons()
    .flatMap((season) => [
      season.marker,
      season.title,
      season.description,
      season.photoLabel,
      ...season.highlights.flatMap((highlight) => [highlight.title, highlight.text]),
      ...season.tags,
      season.link.label,
    ])
    .join(' ');
}
