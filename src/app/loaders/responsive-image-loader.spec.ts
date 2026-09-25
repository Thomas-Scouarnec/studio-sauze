import { FALLBACK_IMAGE_WIDTH, responsiveImageLoader } from './responsive-image-loader';

describe('responsiveImageLoader', () => {
  it('should build the file name from the source and the requested width', () => {
    expect(responsiveImageLoader({ src: 'seasons/sauze-winter', width: 1600 })).toBe(
      '/images/seasons/sauze-winter-1600w.webp',
    );
  });

  it('should fall back to the 800px file when no width is requested', () => {
    expect(FALLBACK_IMAGE_WIDTH).toBe(800);
    expect(responsiveImageLoader({ src: 'seasons/sauze-winter' })).toBe(
      '/images/seasons/sauze-winter-800w.webp',
    );
  });
});
