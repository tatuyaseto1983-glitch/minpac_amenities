/** 商品の大分類 */
export type CategoryId = 'amenity' | 'appliance' | 'special' | 'furniture';

export interface Category {
  id: CategoryId;
  name: string;
  /** 画面に出す短い説明 */
  note: string;
  color: string;
}

/**
 * 費用のかかり方
 * - consumable: 消耗品。泊まる人が増えるほど減る（毎月かかる）
 * - equipment : 設備・備品。買い切り（初期費用。買い替え積立として月割りも出す）
 */
export type CostType = 'consumable' | 'equipment';

/**
 * 消耗品の減り方の基準
 * - perGuest : 宿泊者1人あたり（歯ブラシ、タオルなど）
 * - perStay  : 1組の宿泊あたり（食器用洗剤の補充、ゴミ袋など）
 * - perRoom  : 1部屋あたり毎月（消臭剤など）
 * - perMonth : 施設全体で毎月固定（洗剤のまとめ買いなど）
 */
export type ConsumeBasis = 'perGuest' | 'perStay' | 'perRoom' | 'perMonth';

export interface Product {
  id: string;
  category: CategoryId;
  /** 小分類。カタログの表を分ける単位（例: おしぼり、歯ブラシ） */
  group: string;
  name: string;
  /** 添付表の「特徴」にあたる一言 */
  feature: string;
  /** 入数（例: 2400枚）。設備は 1 */
  unitCount: number;
  /** 入数あたりの単位名（枚・本・個・台 など） */
  unitLabel: string;
  /** 税込価格（1パッケージ / 1台あたり） */
  price: number;
  productUrl?: string;
  imageUrl?: string;
  costType: CostType;
  /** 消耗品のとき: 減り方の基準 */
  consumeBasis?: ConsumeBasis;
  /** 消耗品のとき: 基準1回あたりに使う数量（枚・本など） */
  consumeQty?: number;
  /** 設備のとき: 何か月使えるか（買い替え積立の月割りに使う） */
  lifespanMonths?: number;
  /** 価格の出どころ。空なら「参考値」 */
  priceNote?: string;
  /** 標準搭載のサンプルか、ユーザーが追加したものか */
  custom?: boolean;
}

/** 選択中の1行 */
export interface Selection {
  productId: string;
  /** 設備: 購入台数 / 消耗品: 同時に持つセット数（基本は1） */
  quantity: number;
  /** 消耗品の使用数を手入力で上書きするか */
  manual: boolean;
  /** 手入力の月間使用数（unitLabel の単位） */
  manualMonthlyUnits: number;
}

/** 施設の前提条件 */
export interface FacilitySettings {
  facilityName: string;
  rooms: number;
  capacity: number;
  /** 想定稼働率（%） */
  occupancyRate: number;
  /** 平均宿泊日数 */
  avgStayNights: number;
  /** 1組あたりの平均人数 */
  avgGuestsPerStay: number;
  /** 発注ロット単位に切り上げるか */
  roundToLot: boolean;
}

/** ユーザーが自由に足せる毎月の固定費 */
export interface FixedCost {
  id: string;
  name: string;
  monthlyAmount: number;
}

export interface AppState {
  settings: FacilitySettings;
  products: Product[];
  selections: Record<string, Selection>;
  fixedCosts: FixedCost[];
}
