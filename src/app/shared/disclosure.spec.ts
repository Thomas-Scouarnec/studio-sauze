import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DisclosureDirective } from './disclosure';

@Component({
  selector: 'app-disclosure-host',
  imports: [DisclosureDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div appDisclosure #menu="disclosure">
      <button
        #disclosureToggle
        type="button"
        [attr.aria-expanded]="menu.open()"
        (click)="menu.toggle()"
      >
        Menu
      </button>
      <ul [hidden]="!menu.open()">
        <li><a href="#one" (click)="$event.preventDefault(); menu.close(false)">One</a></li>
        <li><a href="#two">Two</a></li>
      </ul>
    </div>
    <button type="button" class="outside">Outside</button>
  `,
})
class DisclosureHostComponent {}

describe('DisclosureDirective', () => {
  async function render() {
    const fixture = TestBed.createComponent(DisclosureHostComponent);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    const host: HTMLElement = fixture.nativeElement;
    const button = host.querySelector<HTMLButtonElement>('[aria-expanded]')!;
    const links = Array.from(host.querySelectorAll<HTMLAnchorElement>('a'));
    const outside = host.querySelector<HTMLButtonElement>('.outside')!;
    const expanded = () => button.getAttribute('aria-expanded');
    const settle = () => fixture.whenStable();
    return { fixture, host, button, links, outside, expanded, settle };
  }

  afterEach(() => {
    document.body.querySelectorAll('app-disclosure-host').forEach((element) => element.remove());
  });

  it('should start closed and toggle on each click of the button', async () => {
    const { button, expanded, settle } = await render();
    expect(expanded()).toBe('false');
    button.click();
    await settle();
    expect(expanded()).toBe('true');
    button.click();
    await settle();
    expect(expanded()).toBe('false');
  });

  it('should close when an entry is chosen', async () => {
    const { button, links, expanded, settle } = await render();
    button.click();
    await settle();
    links[0].click();
    await settle();
    expect(expanded()).toBe('false');
  });

  it('should close on Escape and put focus back on the button', async () => {
    const { button, links, expanded, settle } = await render();
    button.click();
    await settle();
    links[1].focus();
    links[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await settle();
    expect(expanded()).toBe('false');
    expect(document.activeElement).toBe(button);
  });

  it('should not move focus on Escape while closed', async () => {
    const { links } = await render();
    links[1].focus();
    links[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(document.activeElement).toBe(links[1]);
  });

  it('should close on a click outside, not on a click inside', async () => {
    const { host, button, outside, expanded, settle } = await render();
    button.click();
    await settle();
    host.querySelector('ul')!.click();
    await settle();
    expect(expanded()).toBe('true');
    outside.click();
    await settle();
    expect(expanded()).toBe('false');
  });

  it('should close when focus leaves, not when it moves within or is unknown (iOS tap)', async () => {
    const { button, links, outside, expanded, settle } = await render();
    button.click();
    await settle();

    links[0].dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: links[1] }));
    links[0].dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: null }));
    await settle();
    expect(expanded()).toBe('true');

    links[1].dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: outside }));
    await settle();
    expect(expanded()).toBe('false');
  });
});
