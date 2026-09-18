import { ImageLoaderConfig } from '@angular/common';

/**
 * Width used when Angular asks for an image without one (the plain `src`
 * attribute). Every photo must therefore exist in this width.
 */
export const FALLBACK_IMAGE_WIDTH = 800;

/** A photo stored as `public/images/<src>-<width>w.webp`, in each width listed in `srcset`. */
export interface ResponsivePhoto {
  src: string;
  srcset: string;
  alt: string;
}

/**
 * Maps an `NgOptimizedImage` request to a file under `public/images/`,
 * following the convention `<name>-<width>w.webp`.
 *
 * Example: `{ src: 'seasons/sauze-winter', width: 1600 }`
 * → `images/seasons/sauze-winter-1600w.webp`
 */
export function responsiveImageLoader(config: ImageLoaderConfig): string {
  return `images/${config.src}-${config.width ?? FALLBACK_IMAGE_WIDTH}w.webp`;
}
