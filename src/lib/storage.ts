import type { AppState, FacilitySettings } from '../types';
import { SAMPLE_PRODUCTS } from '../data/catalog';

const KEY = 'minpaku-amenities:v1';

export const DEFAULT_SETTINGS: FacilitySettings = {
  facilityName: '（施設名を入力）',
  rooms: 1,
  capacity: 6,
  occupancyRate: 60,
  avgStayNights: 2,
  avgGuestsPerStay: 4,
  roundToLot: false,
};

export function initialState(): AppState {
  return {
    settings: { ...DEFAULT_SETTINGS },
    products: SAMPLE_PRODUCTS.map((p) => ({ ...p })),
    selections: {},
    fixedCosts: [
      { id: 'fc-clean', name: '清掃費（外注）', monthlyAmount: 0 },
      { id: 'fc-utility', name: '水道光熱費', monthlyAmount: 0 },
      { id: 'fc-net', name: '通信費（Wi-Fi回線）', monthlyAmount: 0 },
    ],
  };
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initialState();
    const parsed = JSON.parse(raw) as Partial<AppState>;
    const base = initialState();
    return {
      settings: { ...base.settings, ...(parsed.settings ?? {}) },
      products: parsed.products?.length ? parsed.products : base.products,
      selections: parsed.selections ?? {},
      fixedCosts: parsed.fixedCosts ?? base.fixedCosts,
    };
  } catch {
    return initialState();
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* 保存できない環境でも動作は続ける */
  }
}

export function clearState(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
}
