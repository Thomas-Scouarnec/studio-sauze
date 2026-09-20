import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeroComponent } from './components/hero/hero';
import { AboutComponent } from './components/about/about';
import { EquipmentComponent } from './components/equipment/equipment';
import { SeasonsComponent } from './components/seasons/seasons';
import { ContactComponent } from './components/contact/contact';
import { FooterComponent } from './components/footer/footer';
import { PhotoGalleryComponent } from './components/photo-gallery/photo-gallery';

@Component({
  selector: 'app-root',
  imports: [HeroComponent, AboutComponent, EquipmentComponent, SeasonsComponent, ContactComponent, FooterComponent, PhotoGalleryComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="skip-link" href="#main-content">Aller au contenu principal</a>
    <app-hero />
    <main id="main-content">
      <app-about />
      <app-equipment />
      <app-seasons />
      <app-contact />
    </main>
    <app-footer />
    <!-- Mounted once for the whole page: one dialog, one focus trap. -->
    <app-photo-gallery />
  `,
  styles: [':host { display: block; }']
})
export class App {}
