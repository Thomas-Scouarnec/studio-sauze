import { TestBed } from '@angular/core/testing';
import { GalleryService } from './gallery.service';
import { FlatInfoService } from './flat-info.service';
import { SeasonsService } from './seasons.service';

describe('GalleryService', () => {
  let gallery: GalleryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    gallery = TestBed.inject(GalleryService);
  });

  it('should list the flat photos in walk-through order (FR-25)', () => {
    expect(gallery.photos().map((photo) => photo.src)).toEqual([
      'equipment/residence-entrance',
      'equipment/mountain-corner',
      'gallery/mountain-corner-closed',
      'equipment/kitchen-corner',
      'gallery/dining-table',
      'about/living-room-red-sofa',
      'gallery/living-room-window-side',
      'about/living-room-window',
    ]);
    expect(gallery.count()).toBe(8);
  });

  it('should leave the landscape photos out (FR-26)', () => {
    const sources = gallery.photos().map((photo) => photo.src);
    const flatInfo = TestBed.inject(FlatInfoService);
    const seasonPhotos = TestBed.inject(SeasonsService)
      .seasons()
      .map((season) => season.photo.src);

    expect(sources).not.toContain(flatInfo.aboutPhotos().mountain.src);
    for (const src of seasonPhotos) {
      expect(sources, src).not.toContain(src);
    }
  });

  it('should reuse the photo data the sections publish, never a copy (BR-8)', () => {
    const flatInfo = TestBed.inject(FlatInfoService);
    const kitchen = flatInfo.equipmentBlocks().find((block) => block.id === 'kitchen')!.photo;

    expect(gallery.photos()).toContain(kitchen);
    expect(gallery.photos()).toContain(flatInfo.aboutPhotos().livingRoom);
    expect(gallery.photos()).toContain(flatInfo.galleryPhotos().diningTable);
  });

  it('should start closed', () => {
    expect(gallery.isOpen()).toBe(false);
    expect(gallery.openIndex()).toBeNull();
    expect(gallery.currentPhoto()).toBeNull();
    expect(gallery.position()).toBeNull();
  });

  it('should open at the photo it is given (FR-27)', () => {
    gallery.openAt('equipment/kitchen-corner');

    expect(gallery.isOpen()).toBe(true);
    expect(gallery.currentPhoto()?.src).toBe('equipment/kitchen-corner');
    expect(gallery.position()).toBe(4);
  });

  it('should ignore a photo that is not in the gallery', () => {
    gallery.openAt('about/ubaye-peaks-autumn');

    expect(gallery.isOpen()).toBe(false);
  });

  it('should close', () => {
    gallery.openAt('equipment/residence-entrance');
    gallery.close();

    expect(gallery.isOpen()).toBe(false);
    expect(gallery.currentPhoto()).toBeNull();
  });

  it('should move to the next and previous photo', () => {
    gallery.openAt('equipment/mountain-corner');

    gallery.next();
    expect(gallery.currentPhoto()?.src).toBe('gallery/mountain-corner-closed');

    gallery.previous();
    expect(gallery.currentPhoto()?.src).toBe('equipment/mountain-corner');
  });

  it('should wrap around at the end', () => {
    gallery.openAt('about/living-room-window');
    gallery.next();

    expect(gallery.currentPhoto()?.src).toBe('equipment/residence-entrance');
    expect(gallery.position()).toBe(1);
  });

  it('should wrap around at the start', () => {
    gallery.openAt('equipment/residence-entrance');
    gallery.previous();

    expect(gallery.currentPhoto()?.src).toBe('about/living-room-window');
    expect(gallery.position()).toBe(8);
  });

  it('should do nothing when moving while closed', () => {
    gallery.next();
    expect(gallery.isOpen()).toBe(false);

    gallery.previous();
    expect(gallery.isOpen()).toBe(false);
  });
});
