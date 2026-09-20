import { Injectable, computed, inject, signal } from '@angular/core';
import { ResponsivePhoto } from '../loaders/responsive-image-loader';
import { FlatInfoService } from './flat-info.service';

/**
 * The one gallery of the flat's photos (FR-25).
 *
 * The list is derived from the photos the sections already publish, never
 * restated (BR-8): a photo added to an Équipements block reaches the gallery
 * with no second edit. Inclusion therefore follows from *where* a photo is
 * used — which is why the About photos are picked by name below, keeping the
 * `mountain` landscape out, and why `SeasonsService` is not read at all
 * (FR-26).
 */
@Injectable({ providedIn: 'root' })
export class GalleryService {
  private readonly flatInfo = inject(FlatInfoService);

  private readonly _openIndex = signal<number | null>(null);

  /** Walk-through order: arrive, sleep, cook, live, look out. */
  readonly photos = computed<ResponsivePhoto[]>(() => {
    const { livingRoom, forestView } = this.flatInfo.aboutPhotos();
    return [
      ...this.flatInfo
        .equipmentBlocks()
        .flatMap((block) => (block.photo ? [block.photo] : [])),
      livingRoom,
      forestView,
    ];
  });

  readonly count = computed(() => this.photos().length);

  readonly openIndex = this._openIndex.asReadonly();

  readonly isOpen = computed(() => this._openIndex() !== null);

  readonly currentPhoto = computed(() => {
    const index = this._openIndex();
    return index === null ? null : (this.photos()[index] ?? null);
  });

  /** The position shown to the visitor, 1-based (FR-29). */
  readonly position = computed(() => {
    const index = this._openIndex();
    return index === null ? null : index + 1;
  });

  /** Opens the gallery at that photo. A `src` outside the gallery is ignored. */
  openAt(src: string): void {
    const index = this.photos().findIndex((photo) => photo.src === src);
    if (index !== -1) {
      this._openIndex.set(index);
    }
  }

  close(): void {
    this._openIndex.set(null);
  }

  next(): void {
    this.step(1);
  }

  previous(): void {
    this.step(-1);
  }

  /** Moves by `offset`, wrapping around at both ends. */
  private step(offset: number): void {
    const total = this.count();
    this._openIndex.update((index) =>
      index === null ? null : (index + offset + total) % total
    );
  }
}
