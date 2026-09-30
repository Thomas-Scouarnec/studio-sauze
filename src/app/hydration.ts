import { EnvironmentProviders } from '@angular/core';
import {
  provideClientHydration,
  withEventReplay,
  withI18nSupport,
} from '@angular/platform-browser';

/**
 * Every page is prerendered at build time: the app adopts that HTML instead of
 * drawing it again. Event replay keeps a tap made before it has finished; i18n
 * support lets it adopt translated blocks too.
 *
 * The dev servers render in the browser only (`"server": false`), so they swap
 * this file for `hydration.development.ts` (`fileReplacements` in angular.json).
 */
export const hydrationProviders: EnvironmentProviders[] = [
  provideClientHydration(withEventReplay(), withI18nSupport()),
];
