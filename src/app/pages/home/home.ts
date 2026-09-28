import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, inject, viewChild } from '@angular/core';
import { ViewportScroller } from '@angular/common';
import { HeroComponent } from '../../components/hero/hero';
import { HomeNavComponent } from '../../components/home-nav/home-nav';
import { AboutComponent } from '../../components/about/about';
import { EquipmentComponent } from '../../components/equipment/equipment';
import { SeasonsComponent } from '../../components/seasons/seasons';
import { ContactComponent } from '../../components/contact/contact';
import { spyOnSections } from '../../shared/section-spy';

/** The public one-page site, shown at `/`. */
@Component({
  selector: 'app-home',
  imports: [HeroComponent, HomeNavComponent, AboutComponent, EquipmentComponent, SeasonsComponent, ContactComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-hero />
    <main id="main-content" tabindex="-1">
      <app-home-nav [activeId]="activeSectionId()" />
      <app-about />
      <app-equipment />
      <app-seasons />
      <app-contact />
    </main>
  `,
  styles: [':host { display: block; } main:focus { outline: none; }']
})
export class HomeComponent {
  private readonly bar = viewChild.required<HomeNavComponent, ElementRef<HTMLElement>>(HomeNavComponent, { read: ElementRef });
  private readonly about = viewChild.required<AboutComponent, ElementRef<HTMLElement>>(AboutComponent, { read: ElementRef });
  private readonly equipment = viewChild.required<EquipmentComponent, ElementRef<HTMLElement>>(EquipmentComponent, { read: ElementRef });
  private readonly seasons = viewChild.required<SeasonsComponent, ElementRef<HTMLElement>>(SeasonsComponent, { read: ElementRef });
  private readonly contact = viewChild.required<ContactComponent, ElementRef<HTMLElement>>(ContactComponent, { read: ElementRef });

  /** What the sticky bar hides: 0 on a desktop, where it is `display: none`. */
  private readonly barHeight = (): number => this.bar().nativeElement.offsetHeight;

  protected readonly activeSectionId = spyOnSections(
    () => [this.about(), this.equipment(), this.seasons(), this.contact()].map((ref) => ref.nativeElement),
    this.barHeight
  );

  constructor() {
    // FR-6 and FR-8: the router stops below the bar on phones, and exactly
    // where it did before on a desktop. Reset on leaving, like /stay does.
    const scroller = inject(ViewportScroller);
    // No extra gap, unlike /stay: the home sections are full-width blocks with
    // their own top padding and background, and a gap would show a strip of
    // the previous one. On a desktop the bar is hidden and measures 0.
    scroller.setOffset(() => [0, this.barHeight()]);
    inject(DestroyRef).onDestroy(() => scroller.setOffset([0, 0]));
  }
}
