import type { AppState } from '../types';
import { createSeedState } from './seed';

const STORAGE_KEY = 'cdc-vouchers-2027:v1';

export function loadState(): AppState | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<AppState> | null;
    if (!parsed || parsed.version !== 1 || typeof parsed.claimed !== 'boolean') {
      return null;
    }

    const seed = createSeedState();
    return {
      ...seed,
      ...parsed,
      allocations: { ...seed.allocations, ...parsed.allocations },
      used: { ...seed.used, ...parsed.used },
      redemptions: Array.isArray(parsed.redemptions) ? parsed.redemptions : seed.redemptions,
      today: { ...seed.today, ...parsed.today },
      soundOn: typeof parsed.soundOn === 'boolean' ? parsed.soundOn : seed.soundOn,
    };
  } catch {
    return null;
  }
}

export function saveState(state: AppState): void {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage can be unavailable in private modes; the demo still works in memory.
  }
}

export function clearState(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore.
  }
}
