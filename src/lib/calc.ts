import type { AppState, CategoryId, FacilitySettings, Product, Selection } from '../types';

/** 1か月の平均日数 */
export const DAYS_PER_MONTH = 30.4;

export interface Demand {
  /** 月の稼働日数 */
  occupiedNights: number;
  /** 月の宿泊組数 */
  staysPerMonth: number;
  /** 月の延べ宿泊人数 */
  guestsPerMonth: number;
}

export function calcDemand(s: FacilitySettings): Demand {
  const occupiedNights = DAYS_PER_MONTH * (s.occupancyRate / 100) * Math.max(1, s.rooms);
  const nights = Math.max(0.5, s.avgStayNights);
  const staysPerMonth = occupiedNights / nights;
  const guestsPerMonth = staysPerMonth * s.avgGuestsPerStay;
  return { occupiedNights, staysPerMonth, guestsPerMonth };
}

/** 1単位（1枚・1本など）あたりの価格 */
export function unitPrice(p: Product): number {
  return p.unitCount > 0 ? p.price / p.unitCount : p.price;
}

export interface LineResult {
  product: Product;
  selection: Selection;
  /** 消耗品: 月間の使用数（枚・本など） */
  monthlyUnits: number;
  /** 消耗品: 月間で必要な発注パック数 */
  monthlyPacks: number;
  /** 初期費用（設備のみ） */
  initialCost: number;
  /** 毎月かかる費用（消耗品の購入費） */
  monthlyCost: number;
  /** 買い替え積立の月額（設備のみ） */
  monthlyReserve: number;
}

export function calcLine(p: Product, sel: Selection, s: FacilitySettings, d: Demand): LineResult {
  const qty = Math.max(0, sel.quantity);

  if (p.costType === 'equipment') {
    const initialCost = p.price * qty;
    const life = p.lifespanMonths && p.lifespanMonths > 0 ? p.lifespanMonths : 60;
    return {
      product: p,
      selection: sel,
      monthlyUnits: 0,
      monthlyPacks: 0,
      initialCost,
      monthlyCost: 0,
      monthlyReserve: initialCost / life,
    };
  }

  let monthlyUnits: number;
  if (sel.manual) {
    monthlyUnits = Math.max(0, sel.manualMonthlyUnits);
  } else {
    const per = p.consumeQty ?? 1;
    switch (p.consumeBasis) {
      case 'perGuest':
        monthlyUnits = d.guestsPerMonth * per;
        break;
      case 'perStay':
        monthlyUnits = d.staysPerMonth * per;
        break;
      case 'perRoom':
        monthlyUnits = Math.max(1, s.rooms) * per;
        break;
      case 'perMonth':
      default:
        monthlyUnits = per;
        break;
    }
    monthlyUnits *= qty || 1;
  }

  const packs = p.unitCount > 0 ? monthlyUnits / p.unitCount : monthlyUnits;
  const monthlyPacks = s.roundToLot ? Math.ceil(packs) : packs;
  const monthlyCost = s.roundToLot ? monthlyPacks * p.price : monthlyUnits * unitPrice(p);

  return {
    product: p,
    selection: sel,
    monthlyUnits,
    monthlyPacks,
    initialCost: 0,
    monthlyCost,
    monthlyReserve: 0,
  };
}

export interface CategoryTotal {
  category: CategoryId;
  initial: number;
  monthly: number;
  reserve: number;
}

export interface Totals {
  lines: LineResult[];
  byCategory: CategoryTotal[];
  /** 開業時に一度だけかかる費用 */
  initialTotal: number;
  /** 毎月の消耗品費 */
  monthlyConsumable: number;
  /** 毎月の買い替え積立 */
  monthlyReserve: number;
  /** 毎月のその他固定費 */
  monthlyFixed: number;
  /** 毎月かかる費用の合計 */
  monthlyTotal: number;
  /** 年間かかる費用（毎月分 ×12） */
  yearlyTotal: number;
  /** 初年度に必要な現金（初期費用＋消耗品と固定費12か月分） */
  firstYearCash: number;
  /** 1泊1組あたりに乗ってくる消耗品費 */
  costPerStay: number;
  demand: Demand;
}

export function calcTotals(state: AppState): Totals {
  const d = calcDemand(state.settings);
  const byId = new Map(state.products.map((p) => [p.id, p]));

  const lines: LineResult[] = [];
  for (const sel of Object.values(state.selections)) {
    const p = byId.get(sel.productId);
    if (!p || sel.quantity <= 0) continue;
    lines.push(calcLine(p, sel, state.settings, d));
  }

  const catMap = new Map<CategoryId, CategoryTotal>();
  for (const l of lines) {
    const c = catMap.get(l.product.category) ?? {
      category: l.product.category,
      initial: 0,
      monthly: 0,
      reserve: 0,
    };
    c.initial += l.initialCost;
    c.monthly += l.monthlyCost;
    c.reserve += l.monthlyReserve;
    catMap.set(l.product.category, c);
  }

  const initialTotal = lines.reduce((a, l) => a + l.initialCost, 0);
  const monthlyConsumable = lines.reduce((a, l) => a + l.monthlyCost, 0);
  const monthlyReserve = lines.reduce((a, l) => a + l.monthlyReserve, 0);
  const monthlyFixed = state.fixedCosts.reduce((a, f) => a + (f.monthlyAmount || 0), 0);
  const monthlyTotal = monthlyConsumable + monthlyReserve + monthlyFixed;

  return {
    lines,
    byCategory: [...catMap.values()],
    initialTotal,
    monthlyConsumable,
    monthlyReserve,
    monthlyFixed,
    monthlyTotal,
    yearlyTotal: monthlyTotal * 12,
    firstYearCash: initialTotal + (monthlyConsumable + monthlyFixed) * 12,
    costPerStay: d.staysPerMonth > 0 ? monthlyConsumable / d.staysPerMonth : 0,
    demand: d,
  };
}

export const yen = (n: number): string =>
  '¥' + Math.round(n).toLocaleString('ja-JP');

export const yen1 = (n: number): string =>
  '¥' + (Math.round(n * 10) / 10).toLocaleString('ja-JP', { maximumFractionDigits: 1 });

export const num = (n: number, digits = 1): string =>
  n.toLocaleString('ja-JP', { maximumFractionDigits: digits });

export const BASIS_LABEL: Record<string, string> = {
  perGuest: '1人あたり',
  perStay: '1組あたり',
  perRoom: '1部屋あたり/月',
  perMonth: '施設全体/月',
};
