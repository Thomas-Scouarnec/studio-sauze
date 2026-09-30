import { EnvironmentProviders } from '@angular/core';

/**
 * For the dev servers, which render in the browser only: nothing to hydrate,
 * and asking for it would log NG0505 on every reload. See `hydration.ts`.
 */
export const hydrationProviders: EnvironmentProviders[] = [];
