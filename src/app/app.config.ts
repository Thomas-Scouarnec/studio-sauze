import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import {
  TitleStrategy,
  provideRouter,
  withInMemoryScrolling,
  withRouterConfig,
} from '@angular/router';

import { routes } from './app.routes';
import { hydrationProviders } from './hydration';
import { PageTagsStrategy } from './page-tags.strategy';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      // Scrolls to `fragment` after navigation (the navbar's section links),
      // to the top on a new page, and back to where it was on back/forward.
      withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }),
      // Without this, a second click on the same section link is ignored.
      withRouterConfig({ onSameUrlNavigation: 'reload' }),
    ),
    // The title, plus the description and link-preview tags (search-and-sharing.md).
    { provide: TitleStrategy, useClass: PageTagsStrategy },
    ...hydrationProviders,
  ],
};
