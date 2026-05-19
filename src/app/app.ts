import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeroComponent } from './components/hero/hero';
import { AboutComponent } from './components/about/about';
import { FeaturesComponent } from './components/features/features';
import { SeasonsComponent } from './components/seasons/seasons';
import { ContactComponent } from './components/contact/contact';
import { FooterComponent } from './components/footer/footer';

@Component({
  selector: 'app-root',
  imports: [HeroComponent, AboutComponent, FeaturesComponent, SeasonsComponent, ContactComponent, FooterComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="skip-link" href="#main-content">Aller au contenu principal</a>
    <app-hero />
    <main id="main-content">
      <app-about />
      <app-features />
      <app-seasons />
      <app-contact />
    </main>
    <app-footer />
  `,
  styles: [':host { display: block; }']
})
export class App {}
