import { existsSync } from 'node:fs';
import { TestBed } from '@angular/core/testing';
import { FALLBACK_IMAGE_WIDTH, ResponsivePhoto } from './responsive-image-loader';
import { FlatInfoService } from '../services/flat-info.service';
import { SeasonsService } from '../services/seasons.service';

/** Every photo declared anywhere on the site. Add new sources here. */
function allPhotos(): ResponsivePhoto[] {
  const { livingRoom, forestView, mountain } = TestBed.inject(FlatInfoService).aboutPhotos();
  return [
    livingRoom,
    forestView,
    mountain,
    ...TestBed.inject(SeasonsService)
      .seasons()
      .map((season) => season.photo),
  ];
}

function photoWidths(srcset: string): number[] {
  return srcset.split(',').map((descriptor) => parseInt(descriptor, 10));
}

describe('Photo files (BR-5)', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should offer every photo in the fallback width', () => {
    for (const photo of allPhotos()) {
      expect(photoWidths(photo.srcset), photo.src).toContain(FALLBACK_IMAGE_WIDTH);
    }
  });

  it('should have a file on disk for every declared photo width', () => {
    for (const photo of allPhotos()) {
      for (const width of photoWidths(photo.srcset)) {
        const file = `public/images/${photo.src}-${width}w.webp`;
        expect(existsSync(file), file).toBe(true);
      }
    }
  });

  it('should describe every photo without starting with "photo" or "image"', () => {
    for (const photo of allPhotos()) {
      expect(photo.alt.trim().length, photo.src).toBeGreaterThan(0);
      expect(photo.alt.toLowerCase(), photo.src).not.toMatch(/^(photo|image)/);
    }
  });
});
