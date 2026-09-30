import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// A saved « English » is handled earlier, by the inline script in index.html:
// the page is prerendered, so waiting for this file would show French first (FR-9).
bootstrapApplication(App, appConfig).catch((err) => console.error(err));
