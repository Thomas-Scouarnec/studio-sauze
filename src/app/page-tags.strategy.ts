import { DOCUMENT, Injectable, LOCALE_ID, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { Language, languageOf, languageUrl } from './language-redirect';

/** What a route says about itself to search engines and link previews, in its `data.tags`. */
export interface PageTags {
  /** At most 160 characters, facts from flat-info.md only (search-and-sharing.md FR-1, FR-2). */
  description: string;
  /** `false` adds `noindex` and leaves out the canonical and language links (FR-9). */
  indexed: boolean;
}

/** Every URL in the tags is absolute (FR-5): a prerendered page cannot know its host. */
export const SITE_ORIGIN = 'https://refugedusauze.com';

const SITE_NAME = 'Notre Refuge au Sauze';

/** One preview image for the whole site (FR-6). */
const IMAGE = { path: '/images/share/preview-1200x630.jpg', width: 1200, height: 630 };

const OG_LOCALE: Record<Language, string> = { fr: 'fr_FR', en: 'en_GB' };

/**
 * Writes each page's `<head>` after every navigation: the title, as Angular's
 * default strategy does, then the description, link-preview and robots tags,
 * from the route's `data.tags`.
 *
 * It runs while prerendering too, so the tags are in the static HTML that
 * crawlers and messaging apps read without JavaScript (FR-13). Each call
 * rewrites every tag, so nothing from the previous page is left behind.
 */
@Injectable({ providedIn: 'root' })
export class PageTagsStrategy extends TitleStrategy {
  private readonly document = inject(DOCUMENT);
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  // From LOCALE_ID rather than LanguageService: the router creates this
  // strategy, and LanguageService needs the router.
  private readonly language = languageOf(inject(LOCALE_ID));

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const title = this.buildTitle(snapshot) ?? SITE_NAME;
    this.title.setTitle(title);

    const tags = deepestChild(snapshot.root).data['tags'] as PageTags | undefined;
    const path = snapshot.url.split(/[?#]/)[0];
    this.setMetaTags(title, path, tags);
    this.setLinks(path, tags?.indexed ?? false);
  }

  private setMetaTags(title: string, path: string, tags: PageTags | undefined): void {
    const other: Language = this.language === 'fr' ? 'en' : 'fr';
    const properties: Record<string, string> = {
      'og:type': 'website',
      'og:site_name': SITE_NAME,
      'og:title': title,
      'og:url': this.absoluteUrl(this.language, path),
      'og:image': SITE_ORIGIN + IMAGE.path,
      'og:image:width': String(IMAGE.width),
      'og:image:height': String(IMAGE.height),
      'og:image:alt': $localize`:@@seo.image.alt:La station du Sauze sous la neige, au pied des sommets enneigés de la vallée de l'Ubaye`,
      'og:locale': OG_LOCALE[this.language],
      'og:locale:alternate': OG_LOCALE[other],
    };
    for (const [property, content] of Object.entries(properties)) {
      this.meta.updateTag({ property, content });
    }
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });

    if (tags) {
      this.meta.updateTag({ name: 'description', content: tags.description });
      this.meta.updateTag({ property: 'og:description', content: tags.description });
    } else {
      this.meta.removeTag('name="description"');
      this.meta.removeTag('property="og:description"');
    }

    if (tags?.indexed) {
      this.meta.removeTag('name="robots"');
    } else {
      this.meta.updateTag({ name: 'robots', content: 'noindex' });
    }
  }

  /** The canonical link and the `hreflang` alternates (FR-7, FR-8), on indexed pages only. */
  private setLinks(path: string, indexed: boolean): void {
    const head = this.document.head;
    head
      .querySelectorAll('link[rel="canonical"], link[rel="alternate"][hreflang]')
      .forEach((link) => link.remove());
    if (!indexed) {
      return;
    }

    this.addLink({ rel: 'canonical', href: this.absoluteUrl(this.language, path) });
    // French is the default for everyone else (localization.md FR-13).
    for (const [hreflang, language] of [
      ['fr', 'fr'],
      ['en', 'en'],
      ['x-default', 'fr'],
    ] as const) {
      this.addLink({ rel: 'alternate', hreflang, href: this.absoluteUrl(language, path) });
    }
  }

  private addLink(attributes: Record<string, string>): void {
    const link = this.document.createElement('link');
    for (const [name, value] of Object.entries(attributes)) {
      link.setAttribute(name, value);
    }
    this.document.head.appendChild(link);
  }

  private absoluteUrl(language: Language, path: string): string {
    return SITE_ORIGIN + languageUrl(language, path);
  }
}

function deepestChild(route: ActivatedRouteSnapshot): ActivatedRouteSnapshot {
  return route.firstChild ? deepestChild(route.firstChild) : route;
}
