import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { readSavedLanguage, resolveLanguageRedirect } from './app/language-redirect';

// Set by the build for each compiled language (`fr` or `en`, from angular.json).
const appLanguage = $localize.locale === 'en' ? 'en' : 'fr';

// Before anything renders, so a visitor who chose English never sees the
// French page flash first (FR-9).
const redirect = resolveLanguageRedirect(appLanguage, readSavedLanguage(), window.location);

if (redirect) {
  window.location.replace(redirect);
} else {
  bootstrapApplication(App, appConfig).catch((err) => console.error(err));
}
