import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

@Component({
  template: `<main id="main-content" tabindex="-1">Contenu</main>`,
})
class StubPageComponent {}

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([{ path: '**', component: StubPageComponent }])],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the skip link, the router outlet and the footer', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    expect(host.querySelector('a.skip-link')?.textContent?.trim()).toBe('Aller au contenu principal');
    expect(host.querySelector('router-outlet')).not.toBeNull();
    expect(host.querySelector('app-footer')).not.toBeNull();
  });

  it('should keep the skip link on the current page and focus its main', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;

    // Stands in for the routed page's main, which the outlet renders after navigation.
    const main = document.createElement('main');
    main.id = 'main-content';
    main.tabIndex = -1;
    document.body.appendChild(main);

    const click = new MouseEvent('click', { bubbles: true, cancelable: true });
    host.querySelector<HTMLAnchorElement>('a.skip-link')!.dispatchEvent(click);

    expect(click.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(main);
    main.remove();
  });
});
