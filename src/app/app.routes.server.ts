import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * How each route is rendered on the server: all of them at build time, into
 * static files for GitHub Pages (`outputMode: "static"` in angular.json).
 */
export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
