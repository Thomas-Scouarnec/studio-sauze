import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeroComponent } from '../../components/hero/hero';
import { AboutComponent } from '../../components/about/about';
import { EquipmentComponent } from '../../components/equipment/equipment';
import { SeasonsComponent } from '../../components/seasons/seasons';
import { ContactComponent } from '../../components/contact/contact';

/** The public one-page site, shown at `/`. */
@Component({
  selector: 'app-home',
  imports: [HeroComponent, AboutComponent, EquipmentComponent, SeasonsComponent, ContactComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-hero />
    <main id="main-content" tabindex="-1">
      <app-about />
      <app-equipment />
      <app-seasons />
      <app-contact />
    </main>
  `,
  styles: [':host { display: block; } main:focus { outline: none; }']
})
export class HomeComponent {}
