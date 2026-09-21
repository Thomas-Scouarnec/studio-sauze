import { TestBed } from '@angular/core/testing';
import { GuestAccessService } from './guest-access.service';

describe('GuestAccessService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('should not treat a first-time visitor as a guest (FR-6)', () => {
    expect(TestBed.inject(GuestAccessService).isGuest()).toBe(false);
  });

  it('should recognise a guest remembered from an earlier visit', () => {
    localStorage.setItem('refuge.guest', '1');
    expect(TestBed.inject(GuestAccessService).isGuest()).toBe(true);
  });

  it('should flip and persist the flag on markAsGuest() (FR-4)', () => {
    const service = TestBed.inject(GuestAccessService);
    service.markAsGuest();
    expect(service.isGuest()).toBe(true);
    expect(localStorage.getItem('refuge.guest')).toBe('1');
  });

  it('should survive a storage that throws, keeping the flag for the visit (BR-3)', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    const service = TestBed.inject(GuestAccessService);
    expect(service.isGuest()).toBe(false);
    expect(() => service.markAsGuest()).not.toThrow();
    expect(service.isGuest()).toBe(true);
  });
});
