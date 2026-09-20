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
      'equipment/arrival',
      'equipment/sleeping',
      'equipment/kitchen',
      'about/living-room',
      'about/forest-view',
    ]);
    expect(gallery.count()).toBe(5);
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
  });

  it('should start closed', () => {
    expect(gallery.isOpen()).toBe(false);
    expect(gallery.openIndex()).toBeNull();
    expect(gallery.currentPhoto()).toBeNull();
    expect(gallery.position()).toBeNull();
  });

  it('should open at the photo it is given (FR-27)', () => {
    gallery.openAt('equipment/kitchen');

    expect(gallery.isOpen()).toBe(true);
    expect(gallery.currentPhoto()?.src).toBe('equipment/kitchen');
    expect(gallery.position()).toBe(3);
  });

  it('should ignore a photo that is not in the gallery', () => {
    gallery.openAt('about/mountain');

    expect(gallery.isOpen()).toBe(false);
  });

  it('should close', () => {
    gallery.openAt('equipment/arrival');
    gallery.close();

    expect(gallery.isOpen()).toBe(false);
    expect(gallery.currentPhoto()).toBeNull();
  });

  it('should move to the next and previous photo', () => {
    gallery.openAt('equipment/sleeping');

    gallery.next();
    expect(gallery.currentPhoto()?.src).toBe('equipment/kitchen');

    gallery.previous();
    expect(gallery.currentPhoto()?.src).toBe('equipment/sleeping');
  });

  it('should wrap around at the end', () => {
    gallery.openAt('about/forest-view');
    gallery.next();

    expect(gallery.currentPhoto()?.src).toBe('equipment/arrival');
    expect(gallery.position()).toBe(1);
  });

  it('should wrap around at the start', () => {
    gallery.openAt('equipment/arrival');
    gallery.previous();

    expect(gallery.currentPhoto()?.src).toBe('about/forest-view');
    expect(gallery.position()).toBe(5);
  });

  it('should do nothing when moving while closed', () => {
    gallery.next();
    expect(gallery.isOpen()).toBe(false);

    gallery.previous();
    expect(gallery.isOpen()).toBe(false);
  });
});
