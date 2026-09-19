import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { EquipmentComponent } from './equipment';
import { EquipmentBlock, FlatInfoService } from '../../services/flat-info.service';

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

  it('should hide the decorative list icons from assistive technology', async () => {
    const fixture = TestBed.createComponent(EquipmentComponent);
    await fixture.whenStable();
    const icons = fixture.nativeElement.querySelectorAll('.equipment-item-icon');
    expect(icons.length).toBe(8);
    icons.forEach((el: HTMLElement) => expect(el.getAttribute('aria-hidden')).toBe('true'));
  });

  it('should render a described, lazy-loaded photo in every block (FR-23, FR-24)', async () => {
    const fixture = TestBed.createComponent(EquipmentComponent);
    await fixture.whenStable();
    const expected: Record<string, string> = {
      arrival: 'images/equipment/arrival-800w.webp 800w',
      sleeping: 'images/equipment/sleeping-800w.webp 800w',
      kitchen: 'images/equipment/kitchen-800w.webp 800w',
    };
    for (const [id, srcset] of Object.entries(expected)) {
      const frame: HTMLElement = fixture.nativeElement.querySelector(`.equipment-block.${id} .equipment-photo`);
      const img = frame.querySelector('img')!;
      expect(frame.getAttribute('aria-hidden')).toBeNull();
      expect(img.getAttribute('alt')?.trim().length).toBeGreaterThan(0);
      expect(img.getAttribute('srcset')).toBe(srcset);
      expect(img.getAttribute('loading')).toBe('lazy');
    }
  });

  it('should give every block the same text-and-photo layout', async () => {
    const fixture = TestBed.createComponent(EquipmentComponent);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('.equipment-photo').length).toBe(3);
    expect(fixture.nativeElement.querySelector('.equipment-block.text-only')).toBeNull();
  });
});

describe('EquipmentComponent with a block that has no photo yet (FR-22)', () => {
  const blocks: EquipmentBlock[] = [
    { id: 'arrival', title: 'Titre', body: 'Texte' },
    {
      id: 'sleeping',
      title: 'Titre',
      body: 'Texte',
      photo: { src: 'equipment/sleeping', srcset: '800w', alt: 'Description' },
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EquipmentComponent],
      providers: [
        {
          provide: FlatInfoService,
          useValue: { equipmentBlocks: signal(blocks), equipmentItems: signal([]) },
        },
      ],
    }).compileComponents();
  });

  it('should render that block as text only, with no empty frame', async () => {
    const fixture = TestBed.createComponent(EquipmentComponent);
    await fixture.whenStable();
    const arrival: HTMLElement = fixture.nativeElement.querySelector('.equipment-block.arrival');
    expect(arrival.classList).toContain('text-only');
    expect(arrival.querySelector('.equipment-photo')).toBeNull();
    expect(fixture.nativeElement.querySelectorAll('.equipment-photo').length).toBe(1);
  });
});
