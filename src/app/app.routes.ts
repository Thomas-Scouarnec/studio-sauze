import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { PageTags } from './page-tags.strategy';

/**
 * The « page not found » page (not-found.md), for two routes: `404` is the
 * one prerendered into 404.html, `**` the one that shows it at any unknown
 * address, which stays in the address bar. No `data.tags`: noindex.
 */
const notFound = {
  loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFoundComponent),
  title: $localize`:@@route.notFound.title:Page introuvable — Notre Refuge au Sauze`,
};

// `data.tags` is written into each page's <head> by PageTagsStrategy
// (search-and-sharing.md).
export const routes: Routes = [
  // The landing page stays eager; only guests download the stay page.
  {
    path: '',
    component: HomeComponent,
    title: $localize`:@@route.home.title:Notre Refuge au Sauze`,
    data: {
      tags: {
        description: $localize`:@@seo.home.description:Studio de montagne pour 5 personnes au Sauze, à 10 min de Barcelonnette : accès direct aux pistes l'hiver, aux sentiers de randonnée l'été.`,
        indexed: true,
      } satisfies PageTags,
    },
  },
  {
    path: 'stay',
    loadComponent: () => import('./pages/stay/stay').then((m) => m.StayComponent),
    title: $localize`:@@route.stay.title:Votre séjour — Notre Refuge au Sauze`,
    data: {
      tags: {
        // Unlisted (stay.md FR-3); no practical detail, since the link gets forwarded (FR-10).
        description: $localize`:@@seo.stay.description:Le guide de votre séjour à Notre Refuge au Sauze : avant d'arriver, à l'arrivée, sur place et aux alentours.`,
        indexed: false,
      } satisfies PageTags,
    },
  },
  { path: '404', ...notFound },
  { path: '**', ...notFound },
];
