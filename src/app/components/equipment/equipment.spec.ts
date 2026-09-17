import { TestBed } from '@angular/core/testing';
import { EquipmentComponent } from './equipment';

describe('EquipmentComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EquipmentComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(EquipmentComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the three equipment blocks with a title and a body', async () => {
    const fixture = TestBed.createComponent(EquipmentComponent);
    await fixture.whenStable();
    const blocks = fixture.nativeElement.querySelectorAll('.equipment-block');
    expect(blocks.length).toBe(3);
    const titles = fixture.nativeElement.querySelectorAll('.equipment-block-title');
    const bodies = fixture.nativeElement.querySelectorAll('.equipment-block-body');
    titles.forEach((el: HTMLElement) => expect(el.textContent?.trim().length).toBeGreaterThan(0));
    bodies.forEach((el: HTMLElement) => expect(el.textContent?.trim().length).toBeGreaterThan(0));
  });

  it('should render the eight secondary equipment items', async () => {
    const fixture = TestBed.createComponent(EquipmentComponent);
    await fixture.whenStable();
    const items = fixture.nativeElement.querySelectorAll('.equipment-item');
    expect(items.length).toBe(8);
  });

  it('should have the correct ARIA attributes on the host element', () => {
    const fixture = TestBed.createComponent(EquipmentComponent);
    const host: HTMLElement = fixture.nativeElement;
    expect(host.getAttribute('role')).toBe('region');
    expect(host.getAttribute('aria-labelledby')).toBe('equipment-heading');
  });

  it('should label the secondary list with its heading', async () => {
    const fixture = TestBed.createComponent(EquipmentComponent);
    await fixture.whenStable();
    const list = fixture.nativeElement.querySelector('.equipment-list');
    const heading = fixture.nativeElement.querySelector('.equipment-extras .section-label');
    expect(heading.id).toBe('equipment-extras-heading');
    expect(list.getAttribute('aria-labelledby')).toBe(heading.id);
  });

  it('should hide decorative elements from assistive technology', async () => {
    const fixture = TestBed.createComponent(EquipmentComponent);
    await fixture.whenStable();
    const decorative = fixture.nativeElement.querySelectorAll(
      '.equipment-photo, .equipment-item-icon'
    );
    expect(decorative.length).toBeGreaterThan(0);
    decorative.forEach((el: HTMLElement) => expect(el.getAttribute('aria-hidden')).toBe('true'));
  });
});
