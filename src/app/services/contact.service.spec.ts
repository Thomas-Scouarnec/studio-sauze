import { TestBed } from '@angular/core/testing';
import { ContactService } from './contact.service';
import { FlatInfoService } from './flat-info.service';

describe('ContactService', () => {
  let service: ContactService;
  let flatInfo: FlatInfoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContactService);
    flatInfo = TestBed.inject(FlatInfoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should expose a valid email that is not the old placeholder', () => {
    expect(service.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    expect(service.email).not.toBe('test@gmail.com');
  });

  it('should build a plain mailto URL with no pre-filled subject or body (FR-2)', () => {
    expect(service.mailtoUrl).toBe(`mailto:${service.email}`);
    expect(service.mailtoUrl).not.toContain('?');
  });

  it('should expose three checklist items, each with an icon and a label', () => {
    const items = service.requestChecklist();
    expect(items).toHaveLength(3);
    for (const item of items) {
      expect(item.icon.trim().length).toBeGreaterThan(0);
      expect(item.label.trim().length).toBeGreaterThan(0);
    }
  });

  it('should derive the maximum number of people from maxGuests (FR-6)', () => {
    const maxGuests = flatInfo.info().maxGuests;
    const labels = service.requestChecklist().map((item) => item.label);
    expect(labels).toContain(`Le nombre de personnes (${maxGuests} au maximum)`);
  });

  it('should not mention pets while the policy is undecided (BR-3)', () => {
    const copy = service.requestChecklist().map((item) => item.label).join(' ').toLowerCase();
    for (const word of ['animal', 'animaux', 'chien', 'chat']) {
      expect(copy).not.toContain(word);
    }
  });
});
