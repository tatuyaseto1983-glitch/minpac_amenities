import type { Category, Product } from '../types';

export const CATEGORIES: Category[] = [
  {
    id: 'amenity',
    name: 'アメニティ・消耗品',
    note: 'お客様が使うたびに減るもの。毎月かかる費用です',
    color: '#2EA89E',
  },
  {
    id: 'appliance',
    name: '家電・設備',
    note: '一度買えば使い続けるもの。初期費用にあたります',
    color: '#3F7FB5',
  },
  {
    id: 'special',
    name: '特別設備（サウナ・BBQ）',
    note: '他と差がつく設備。単価は高めですが宿泊料金に反映しやすい部分です',
    color: '#E0A45C',
  },
  {
    id: 'furniture',
    name: '寝具・家具・キッチン',
    note: '部屋の基本装備。部屋数・定員に合わせて数を決めます',
    color: '#8A7BC8',
  },
];

/** 消耗品を1件つくる */
function consumable(o: {
  id: string;
  category: Product['category'];
  group: string;
  name: string;
  feature: string;
  unitCount: number;
  unitLabel: string;
  price: number;
  basis: NonNullable<Product['consumeBasis']>;
  qty: number;
  url?: string;
  priceNote?: string;
}): Product {
  return {
    id: o.id,
    category: o.category,
    group: o.group,
    name: o.name,
    feature: o.feature,
    unitCount: o.unitCount,
    unitLabel: o.unitLabel,
    price: o.price,
    productUrl: o.url,
    costType: 'consumable',
    consumeBasis: o.basis,
    consumeQty: o.qty,
    priceNote: o.priceNote ?? '参考値',
  };
}

/** 設備・備品を1件つくる */
function equipment(o: {
  id: string;
  category: Product['category'];
  group: string;
  name: string;
  feature: string;
  price: number;
  unitLabel?: string;
  lifespanMonths: number;
  url?: string;
  priceNote?: string;
}): Product {
  return {
    id: o.id,
    category: o.category,
    group: o.group,
    name: o.name,
    feature: o.feature,
    unitCount: 1,
    unitLabel: o.unitLabel ?? '台',
    price: o.price,
    productUrl: o.url,
    costType: 'equipment',
    lifespanMonths: o.lifespanMonths,
    priceNote: o.priceNote ?? '参考値',
  };
}

export const SAMPLE_PRODUCTS: Product[] = [
  // ── アメニティ・消耗品 ───────────────────────────────
  // おしぼり（添付いただいた比較表の内容）
  consumable({ id: 'osh-01', category: 'amenity', group: 'おしぼり', name: '使い捨ておしぼり 平型', feature: 'シンプル', unitCount: 2400, unitLabel: '枚', price: 3740, basis: 'perGuest', qty: 1, url: 'https://x.gd/VLpFj', priceNote: '提供資料より' }),
  consumable({ id: 'osh-02', category: 'amenity', group: 'おしぼり', name: 'アロマプレミアム シトラル', feature: 'シトラスの香', unitCount: 100, unitLabel: '枚', price: 2861, basis: 'perGuest', qty: 1, url: 'https://x.gd/relOB', priceNote: '提供資料より' }),
  consumable({ id: 'osh-03', category: 'amenity', group: 'おしぼり', name: 'アロマプレミアム with yuica', feature: '自然の香', unitCount: 30, unitLabel: '枚', price: 2940, basis: 'perGuest', qty: 1, url: 'https://x.gd/pcy8B', priceNote: '提供資料より' }),
  consumable({ id: 'osh-04', category: 'amenity', group: 'おしぼり', name: 'hitohira おしぼり', feature: 'サボンの香り', unitCount: 500, unitLabel: '枚', price: 38500, basis: 'perGuest', qty: 1, url: 'https://hito-hira.jp/', priceNote: '提供資料より' }),
  consumable({ id: 'osh-05', category: 'amenity', group: 'おしぼり', name: 'ポケットおしぼり SILKY(L)', feature: 'シンプル・無香', unitCount: 900, unitLabel: '枚', price: 8184, basis: 'perGuest', qty: 1, url: 'https://x.gd/VLpFj', priceNote: '提供資料より' }),

  consumable({ id: 'tb-01', category: 'amenity', group: '歯ブラシ', name: '歯ブラシ 歯磨き粉付 個包装', feature: '低価格・大容量', unitCount: 1000, unitLabel: '本', price: 15000, basis: 'perGuest', qty: 1 }),
  consumable({ id: 'tb-02', category: 'amenity', group: '歯ブラシ', name: '歯ブラシ 白軸 スタンダード', feature: '標準的な品質', unitCount: 500, unitLabel: '本', price: 12500, basis: 'perGuest', qty: 1 }),
  consumable({ id: 'tb-03', category: 'amenity', group: '歯ブラシ', name: '歯ブラシ 木製ハンドル', feature: '環境配慮・高級感', unitCount: 100, unitLabel: '本', price: 7800, basis: 'perGuest', qty: 1 }),

  consumable({ id: 'sh-01', category: 'amenity', group: 'シャンプー類', name: 'シャンプー・リンス 個包装パウチ', feature: '衛生的・使い切り', unitCount: 500, unitLabel: 'セット', price: 11000, basis: 'perGuest', qty: 1 }),
  consumable({ id: 'sh-02', category: 'amenity', group: 'シャンプー類', name: '詰替用シャンプー 業務用10L', feature: 'コスト最安', unitCount: 40, unitLabel: '回分', price: 9800, basis: 'perStay', qty: 1 }),
  consumable({ id: 'sh-03', category: 'amenity', group: 'シャンプー類', name: 'ブランドアメニティ ボトルセット', feature: '高級感・写真映え', unitCount: 12, unitLabel: 'セット', price: 18000, basis: 'perStay', qty: 1 }),

  consumable({ id: 'bs-01', category: 'amenity', group: 'ボディソープ・ハンドソープ', name: 'ハンドソープ 詰替 業務用', feature: 'コスト重視', unitCount: 20, unitLabel: '回分', price: 4200, basis: 'perStay', qty: 1 }),
  consumable({ id: 'bs-02', category: 'amenity', group: 'ボディソープ・ハンドソープ', name: 'ボディソープ 詰替 業務用5L', feature: 'コスト重視', unitCount: 30, unitLabel: '回分', price: 6600, basis: 'perStay', qty: 1 }),

  consumable({ id: 'tp-01', category: 'amenity', group: 'トイレットペーパー', name: 'トイレットペーパー シングル 業務用', feature: 'コスト重視', unitCount: 100, unitLabel: 'ロール', price: 4300, basis: 'perStay', qty: 1.5 }),
  consumable({ id: 'tp-02', category: 'amenity', group: 'トイレットペーパー', name: 'トイレットペーパー ダブル 香り付', feature: '滞在満足度重視', unitCount: 48, unitLabel: 'ロール', price: 3800, basis: 'perStay', qty: 1.5 }),
  consumable({ id: 'ts-01', category: 'amenity', group: 'ティッシュ', name: 'ボックスティッシュ 業務用', feature: 'コスト重視', unitCount: 60, unitLabel: '箱', price: 4500, basis: 'perStay', qty: 0.5 }),

  consumable({ id: 'sl-01', category: 'amenity', group: 'スリッパ', name: '使い捨てスリッパ 不織布', feature: '衛生的・毎回交換', unitCount: 200, unitLabel: '足', price: 8000, basis: 'perGuest', qty: 1 }),
  consumable({ id: 'sl-02', category: 'amenity', group: 'スリッパ', name: 'パイル地スリッパ 洗える', feature: '繰り返し使える', unitCount: 20, unitLabel: '足', price: 6000, basis: 'perRoom', qty: 0.5 }),

  consumable({ id: 'gb-01', category: 'amenity', group: 'ゴミ袋・清掃', name: 'ゴミ袋 45L 半透明', feature: '基本の消耗品', unitCount: 500, unitLabel: '枚', price: 3600, basis: 'perStay', qty: 3 }),
  consumable({ id: 'gb-02', category: 'amenity', group: 'ゴミ袋・清掃', name: '住居用洗剤・除菌スプレー一式', feature: '清掃時に使用', unitCount: 12, unitLabel: '本', price: 7200, basis: 'perMonth', qty: 1 }),
  consumable({ id: 'gb-03', category: 'amenity', group: 'ゴミ袋・清掃', name: '食器用洗剤・スポンジ', feature: 'キッチン備え付け', unitCount: 24, unitLabel: 'セット', price: 5400, basis: 'perStay', qty: 0.3 }),

  consumable({ id: 'dr-01', category: 'amenity', group: 'ドリンク・お茶菓子', name: 'ドリップコーヒー 個包装', feature: 'ウェルカムドリンク', unitCount: 100, unitLabel: '袋', price: 4800, basis: 'perGuest', qty: 1 }),
  consumable({ id: 'dr-02', category: 'amenity', group: 'ドリンク・お茶菓子', name: 'ティーバッグ 緑茶・紅茶', feature: '定番・低コスト', unitCount: 200, unitLabel: '袋', price: 3200, basis: 'perGuest', qty: 1 }),
  consumable({ id: 'dr-03', category: 'amenity', group: 'ドリンク・お茶菓子', name: 'ミネラルウォーター 500ml', feature: '到着時に喜ばれる', unitCount: 24, unitLabel: '本', price: 1900, basis: 'perGuest', qty: 1 }),

  consumable({ id: 'am-01', category: 'amenity', group: 'その他アメニティ', name: 'カミソリ・ヘアブラシ セット', feature: '男女兼用', unitCount: 200, unitLabel: 'セット', price: 8600, basis: 'perGuest', qty: 0.5 }),
  consumable({ id: 'am-02', category: 'amenity', group: 'その他アメニティ', name: 'コットン・綿棒 個包装', feature: '女性客に好評', unitCount: 300, unitLabel: 'セット', price: 5400, basis: 'perGuest', qty: 0.5 }),
  consumable({ id: 'am-03', category: 'amenity', group: 'その他アメニティ', name: 'バスタオル・フェイスタオル リース', feature: '洗濯不要・外注', unitCount: 100, unitLabel: 'セット', price: 22000, basis: 'perGuest', qty: 1 }),

  // ── 家電・設備 ─────────────────────────────────────
  equipment({ id: 'dy-01', category: 'appliance', group: 'ドライヤー', name: 'ドライヤー エントリーモデル', feature: 'コスト重視', price: 3980, lifespanMonths: 24 }),
  equipment({ id: 'dy-02', category: 'appliance', group: 'ドライヤー', name: 'ドライヤー 大風量モデル', feature: '乾きが速く満足度高', price: 12800, lifespanMonths: 36 }),
  equipment({ id: 'dy-03', category: 'appliance', group: 'ドライヤー', name: 'ドライヤー 高級ブランド', feature: '写真映え・口コミ対策', price: 39800, lifespanMonths: 48 }),

  equipment({ id: 'kt-01', category: 'appliance', group: '電気ケトル', name: '電気ケトル 1.0L', feature: '定番', price: 3500, lifespanMonths: 36 }),
  equipment({ id: 'kt-02', category: 'appliance', group: '電気ケトル', name: '電気ケトル 温度調整付', feature: 'コーヒー・お茶向け', price: 9800, lifespanMonths: 36 }),

  equipment({ id: 'rf-01', category: 'appliance', group: '冷蔵庫', name: '冷蔵庫 90L 1ドア', feature: '少人数向け', price: 21000, lifespanMonths: 84 }),
  equipment({ id: 'rf-02', category: 'appliance', group: '冷蔵庫', name: '冷蔵庫 200L 2ドア', feature: 'ファミリー・一棟貸し向け', price: 52000, lifespanMonths: 96 }),

  equipment({ id: 'wm-01', category: 'appliance', group: '洗濯機', name: '洗濯機 5kg 全自動', feature: '長期滞在対応', price: 34000, lifespanMonths: 72 }),
  equipment({ id: 'wm-02', category: 'appliance', group: '洗濯機', name: '洗濯乾燥機 7kg', feature: '乾燥まで完結', price: 89000, lifespanMonths: 84 }),

  equipment({ id: 'mw-01', category: 'appliance', group: '電子レンジ', name: '電子レンジ 単機能', feature: '温めのみ', price: 12000, lifespanMonths: 72 }),
  equipment({ id: 'tv-01', category: 'appliance', group: 'テレビ', name: '43型 スマートテレビ', feature: '動画配信も見られる', price: 45000, lifespanMonths: 84 }),
  equipment({ id: 'tv-02', category: 'appliance', group: 'テレビ', name: '55型 スマートテレビ', feature: 'リビング向け', price: 78000, lifespanMonths: 84 }),

  equipment({ id: 'wf-01', category: 'appliance', group: 'Wi-Fi・通信', name: 'Wi-Fiルーター 据置型', feature: '光回線とセットで使う', price: 9800, lifespanMonths: 48 }),
  equipment({ id: 'wf-02', category: 'appliance', group: 'Wi-Fi・通信', name: 'メッシュWi-Fi 2台セット', feature: '広い一棟貸し向け', price: 24000, lifespanMonths: 48 }),

  equipment({ id: 'lk-01', category: 'appliance', group: 'スマートロック', name: 'スマートロック 後付けタイプ', feature: '無人チェックイン', price: 18000, lifespanMonths: 48 }),
  equipment({ id: 'lk-02', category: 'appliance', group: 'スマートロック', name: 'キーボックス 暗証番号式', feature: '最も安く始められる', price: 4500, lifespanMonths: 36 }),

  equipment({ id: 'ac-01', category: 'appliance', group: 'エアコン・空調', name: 'エアコン 6畳用（工事費込）', feature: '寝室向け', price: 78000, lifespanMonths: 120 }),
  equipment({ id: 'ac-02', category: 'appliance', group: 'エアコン・空調', name: '空気清浄機 加湿付', feature: '匂い・乾燥対策', price: 26000, lifespanMonths: 60 }),
  equipment({ id: 'vc-01', category: 'appliance', group: '掃除機', name: 'コードレス掃除機', feature: '清掃スタッフの負担軽減', price: 24000, lifespanMonths: 48 }),
  equipment({ id: 'rc-01', category: 'appliance', group: 'その他家電', name: '炊飯器 5合', feature: '自炊ニーズ対応', price: 14000, lifespanMonths: 60 }),
  equipment({ id: 'pj-01', category: 'appliance', group: 'その他家電', name: 'プロジェクター 天井投影', feature: '差別化・映画鑑賞', price: 32000, lifespanMonths: 48 }),

  // ── 特別設備（サウナ・BBQ） ──────────────────────────
  equipment({ id: 'sa-01', category: 'special', group: 'サウナ', name: 'テントサウナ 一式', feature: '移動可・初期費用を抑える', price: 220000, lifespanMonths: 36 }),
  equipment({ id: 'sa-02', category: 'special', group: 'サウナ', name: 'バレルサウナ 4人用（設置費込）', feature: '設置型・集客の目玉', price: 1200000, lifespanMonths: 120 }),
  equipment({ id: 'sa-03', category: 'special', group: 'サウナ', name: 'キューブ型サウナ小屋 6人用', feature: '大人数・写真映え', price: 1980000, lifespanMonths: 120 }),
  equipment({ id: 'sa-04', category: 'special', group: 'サウナ', name: '薪ストーブ・サウナストーン', feature: 'サウナ本体とセットで必要', price: 180000, lifespanMonths: 60 }),
  equipment({ id: 'sa-05', category: 'special', group: 'サウナ', name: '水風呂用タブ（バレル）', feature: '「ととのう」体験に必須', price: 280000, lifespanMonths: 84 }),
  consumable({ id: 'sa-06', category: 'special', group: 'サウナ', name: '薪（サウナ用・1回分）', feature: '使うたびにかかる', unitCount: 20, unitLabel: '回分', price: 24000, basis: 'perStay', qty: 1 }),

  equipment({ id: 'bq-01', category: 'special', group: 'BBQ', name: 'BBQコンロ 大型ステンレス', feature: '定番・6人程度', price: 28000, lifespanMonths: 48 }),
  equipment({ id: 'bq-02', category: 'special', group: 'BBQ', name: 'ガスグリル 屋外用', feature: '着火が簡単・煙が少ない', price: 68000, lifespanMonths: 60 }),
  equipment({ id: 'bq-03', category: 'special', group: 'BBQ', name: '焚き火台 セット', feature: '夜の滞在時間を伸ばす', price: 24000, lifespanMonths: 48 }),
  equipment({ id: 'bq-04', category: 'special', group: 'BBQ', name: '屋外テーブル・チェア 6人用', feature: 'BBQとセットで必要', price: 62000, lifespanMonths: 60 }),
  equipment({ id: 'bq-05', category: 'special', group: 'BBQ', name: 'BBQ調理器具・トング一式', feature: 'まとめて用意', price: 12000, lifespanMonths: 24 }),
  consumable({ id: 'bq-06', category: 'special', group: 'BBQ', name: '炭・着火剤（1回分）', feature: '使うたびにかかる', unitCount: 30, unitLabel: '回分', price: 12000, basis: 'perStay', qty: 0.5 }),

  equipment({ id: 'ot-01', category: 'special', group: 'その他アウトドア', name: 'ハンモック・チェア', feature: '庭の滞在価値を上げる', price: 16000, lifespanMonths: 36 }),
  equipment({ id: 'ot-02', category: 'special', group: 'その他アウトドア', name: '屋外照明・ストリングライト', feature: '夜の雰囲気づくり', price: 14000, lifespanMonths: 36 }),

  // ── 寝具・家具・キッチン ────────────────────────────
  equipment({ id: 'bd-01', category: 'furniture', group: 'ベッド・寝具', name: 'シングルベッド＋マットレス', feature: '基本構成', price: 32000, lifespanMonths: 84 }),
  equipment({ id: 'bd-02', category: 'furniture', group: 'ベッド・寝具', name: 'ダブルベッド＋マットレス', feature: 'カップル向け', price: 58000, lifespanMonths: 84 }),
  equipment({ id: 'bd-03', category: 'furniture', group: 'ベッド・寝具', name: '2段ベッド', feature: '定員を増やせる', price: 48000, lifespanMonths: 96 }),
  equipment({ id: 'bd-04', category: 'furniture', group: 'ベッド・寝具', name: '寝具セット（掛布団・枕・カバー）', feature: '1人分', unitLabel: 'セット', price: 12000, lifespanMonths: 36 }),
  equipment({ id: 'bd-05', category: 'furniture', group: 'ベッド・寝具', name: '布団一式（和室用）', feature: '和のしつらえ', unitLabel: 'セット', price: 18000, lifespanMonths: 48 }),

  equipment({ id: 'fn-01', category: 'furniture', group: '家具', name: 'ソファ 3人掛け', feature: 'リビングの主役', price: 68000, lifespanMonths: 84 }),
  equipment({ id: 'fn-02', category: 'furniture', group: '家具', name: 'ダイニングテーブル・椅子6脚', feature: 'グループ滞在向け', price: 78000, lifespanMonths: 96 }),
  equipment({ id: 'fn-03', category: 'furniture', group: '家具', name: 'カーテン（遮光）1部屋分', feature: '睡眠の質に直結', unitLabel: '式', price: 12000, lifespanMonths: 60 }),
  equipment({ id: 'fn-04', category: 'furniture', group: '家具', name: '収納・ハンガーラック', feature: '長期滞在対応', price: 9800, lifespanMonths: 60 }),

  equipment({ id: 'kc-01', category: 'furniture', group: 'キッチン', name: '食器セット 6人分', feature: '皿・茶碗・グラス', unitLabel: 'セット', price: 24000, lifespanMonths: 36 }),
  equipment({ id: 'kc-02', category: 'furniture', group: 'キッチン', name: '調理器具セット（鍋・フライパン）', feature: '自炊ニーズ対応', unitLabel: 'セット', price: 18000, lifespanMonths: 36 }),
  equipment({ id: 'kc-03', category: 'furniture', group: 'キッチン', name: 'カトラリー・調理小物一式', feature: '箸・スプーン・包丁など', unitLabel: 'セット', price: 12000, lifespanMonths: 36 }),
];
