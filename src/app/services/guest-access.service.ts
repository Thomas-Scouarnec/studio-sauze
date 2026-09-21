import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'refuge.guest';

/**
 * Remembers, in the visitor's own browser, that they have opened the stay
 * page (FR-4), so the navbar can offer « Mon séjour » (FR-5).
 *
 * Storage can be unavailable or throw — private browsing, blocked site data —
 * so every access is guarded. The flag then lasts for the current visit only
 * (BR-3).
 */
@Injectable({ providedIn: 'root' })
export class GuestAccessService {
  private readonly _isGuest = signal(readFlag());

  readonly isGuest = this._isGuest.asReadonly();

  markAsGuest(): void {
    this._isGuest.set(true);
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // Not remembered across visits; the current one still shows the link.
    }
  }
}

function readFlag(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}
