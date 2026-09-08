import type { Category, Product } from '../types';
import { ENRICHMENT } from './enrichment';

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
  image?: string;
  keyword?: string;
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
    imageUrl: o.image,
    searchKeyword: o.keyword,
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
  image?: string;
  keyword?: string;
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
    imageUrl: o.image,
    searchKeyword: o.keyword,
    costType: 'equipment',
    lifespanMonths: o.lifespanMonths,
    priceNote: o.priceNote ?? '参考値',
  };
}

const BASE_PRODUCTS: Product[] = [
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
  consumable({ id: 'am-03', category: 'amenity', group: 'タオル・リネン', name: 'バスタオル・フェイスタオル リース', feature: '洗濯不要・外注', unitCount: 100, unitLabel: 'セット', price: 22000, basis: 'perGuest', qty: 1 }),

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

  // ── アメニティ：タオル・リネン ──────────────────────
  equipment({ id: 'tw-01', category: 'amenity', group: 'タオル・リネン', name: 'バスタオル 業務用 10枚組', feature: '自前で洗う場合', unitLabel: '組', price: 8000, lifespanMonths: 24 }),
  equipment({ id: 'tw-02', category: 'amenity', group: 'タオル・リネン', name: 'フェイスタオル 業務用 20枚組', feature: '自前で洗う場合', unitLabel: '組', price: 5000, lifespanMonths: 24 }),
  equipment({ id: 'tw-03', category: 'amenity', group: 'タオル・リネン', name: 'シーツ・枕カバー 1名分', feature: '洗い替え込みで3枚必要', unitLabel: 'セット', price: 3500, lifespanMonths: 24 }),
  consumable({ id: 'tw-04', category: 'amenity', group: 'タオル・リネン', name: 'リネンリース（シーツ・枕カバー）', feature: '洗濯不要・外注', unitCount: 100, unitLabel: 'セット', price: 28000, basis: 'perGuest', qty: 1 }),
  consumable({ id: 'tw-05', category: 'amenity', group: 'タオル・リネン', name: '使い捨てバスマット', feature: '衛生的・毎回交換', unitCount: 200, unitLabel: '枚', price: 9000, basis: 'perStay', qty: 1 }),
  equipment({ id: 'tw-06', category: 'amenity', group: 'タオル・リネン', name: 'バスマット（洗える）', feature: '繰り返し使える', unitLabel: '枚', price: 1500, lifespanMonths: 12 }),

  // ── アメニティ：館内着 ──────────────────────────────
  equipment({ id: 'wr-01', category: 'amenity', group: 'パジャマ・館内着', name: '浴衣', feature: '和の演出・写真映え', unitLabel: '着', price: 3000, lifespanMonths: 24 }),
  equipment({ id: 'wr-02', category: 'amenity', group: 'パジャマ・館内着', name: '作務衣', feature: '男女とも着やすい', unitLabel: '着', price: 5500, lifespanMonths: 24 }),
  consumable({ id: 'wr-03', category: 'amenity', group: 'パジャマ・館内着', name: '使い捨てパジャマ', feature: '洗濯不要', unitCount: 50, unitLabel: '着', price: 12000, basis: 'perGuest', qty: 1 }),

  // ── アメニティ：基礎化粧品 ──────────────────────────
  consumable({ id: 'sk-01', category: 'amenity', group: '基礎化粧品', name: '化粧水・乳液 個包装', feature: '女性客の満足度に直結', unitCount: 200, unitLabel: 'セット', price: 9000, basis: 'perGuest', qty: 0.5 }),
  consumable({ id: 'sk-02', category: 'amenity', group: '基礎化粧品', name: 'クレンジング・洗顔 個包装', feature: '化粧を落とせるかは重要', unitCount: 200, unitLabel: 'セット', price: 8000, basis: 'perGuest', qty: 0.5 }),
  consumable({ id: 'sk-03', category: 'amenity', group: '基礎化粧品', name: 'ボディクリーム 個包装', feature: '乾燥する季節に', unitCount: 200, unitLabel: '個', price: 6000, basis: 'perGuest', qty: 0.3 }),

  // ── アメニティ：バス小物 ────────────────────────────
  consumable({ id: 'bh-01', category: 'amenity', group: 'バス小物', name: 'シャワーキャップ', feature: '低コストで用意できる', unitCount: 300, unitLabel: '枚', price: 4500, basis: 'perGuest', qty: 0.3 }),
  consumable({ id: 'bh-02', category: 'amenity', group: 'バス小物', name: 'ヘアゴム', feature: '女性客に地味に喜ばれる', unitCount: 200, unitLabel: '本', price: 2800, basis: 'perGuest', qty: 0.2 }),
  consumable({ id: 'bh-03', category: 'amenity', group: 'バス小物', name: 'ボディタオル（使い捨て）', feature: '衛生面の安心感', unitCount: 200, unitLabel: '枚', price: 6800, basis: 'perGuest', qty: 0.5 }),
  consumable({ id: 'bh-04', category: 'amenity', group: 'バス小物', name: '入浴剤', feature: '滞在の印象づけ', unitCount: 100, unitLabel: '包', price: 5800, basis: 'perStay', qty: 2 }),
  consumable({ id: 'bh-05', category: 'amenity', group: 'バス小物', name: 'バスソルト（高級ライン）', feature: '写真映え・口コミ対策', unitCount: 50, unitLabel: '包', price: 7500, basis: 'perStay', qty: 2 }),

  // ── アメニティ：衛生・エチケット ────────────────────
  consumable({ id: 'hy-01', category: 'amenity', group: '衛生・エチケット', name: 'ウェットティッシュ（除菌）', feature: '清掃にも使える', unitCount: 60, unitLabel: '個', price: 5400, basis: 'perStay', qty: 1 }),
  consumable({ id: 'hy-02', category: 'amenity', group: '衛生・エチケット', name: 'マスク 個包装', feature: '備えておくと安心', unitCount: 500, unitLabel: '枚', price: 6000, basis: 'perGuest', qty: 0.3 }),
  consumable({ id: 'hy-03', category: 'amenity', group: '衛生・エチケット', name: '生理用品（備え付け）', feature: '女性客の評価が上がる', unitCount: 100, unitLabel: '個', price: 3800, basis: 'perStay', qty: 0.5 }),
  consumable({ id: 'hy-04', category: 'amenity', group: '衛生・エチケット', name: '救急セット（絆創膏・消毒）', feature: 'トラブル対応に必須', unitCount: 20, unitLabel: 'セット', price: 6000, basis: 'perMonth', qty: 1 }),
  consumable({ id: 'hy-05', category: 'amenity', group: '衛生・エチケット', name: '消臭スプレー', feature: '前の客の匂い対策', unitCount: 12, unitLabel: '本', price: 6600, basis: 'perMonth', qty: 1 }),
  consumable({ id: 'hy-06', category: 'amenity', group: '衛生・エチケット', name: '虫よけ・殺虫剤', feature: '夏場と自然立地で必須', unitCount: 12, unitLabel: '本', price: 7200, basis: 'perMonth', qty: 1 }),

  // ── アメニティ：キッチン消耗品 ──────────────────────
  consumable({ id: 'kn-01', category: 'amenity', group: 'キッチン消耗品', name: 'キッチンペーパー', feature: '自炊する客が使う', unitCount: 48, unitLabel: 'ロール', price: 4800, basis: 'perStay', qty: 0.5 }),
  consumable({ id: 'kn-02', category: 'amenity', group: 'キッチン消耗品', name: 'ラップ・アルミホイル', feature: '基本の備え付け', unitCount: 30, unitLabel: '本', price: 6000, basis: 'perStay', qty: 0.3 }),
  consumable({ id: 'kn-03', category: 'amenity', group: 'キッチン消耗品', name: 'ジップ袋・保存袋', feature: '残った食材用', unitCount: 30, unitLabel: '箱', price: 5400, basis: 'perStay', qty: 0.2 }),
  consumable({ id: 'kn-04', category: 'amenity', group: 'キッチン消耗品', name: '紙コップ・割り箸セット', feature: 'BBQ時にも使う', unitCount: 500, unitLabel: 'セット', price: 4200, basis: 'perGuest', qty: 1 }),
  consumable({ id: 'kn-05', category: 'amenity', group: 'キッチン消耗品', name: '調味料セット（塩・こしょう・油）', feature: '自炊ニーズ対応', unitCount: 12, unitLabel: 'セット', price: 7200, basis: 'perMonth', qty: 1 }),
  consumable({ id: 'kn-06', category: 'amenity', group: 'キッチン消耗品', name: 'コーヒーフィルター', feature: 'コーヒーメーカーとセット', unitCount: 400, unitLabel: '枚', price: 1800, basis: 'perGuest', qty: 1 }),
  consumable({ id: 'kn-07', category: 'amenity', group: 'キッチン消耗品', name: 'ふきん・台ふき', feature: '毎回交換が理想', unitCount: 30, unitLabel: '枚', price: 3000, basis: 'perStay', qty: 0.3 }),

  // ── アメニティ：清掃消耗品 ──────────────────────────
  consumable({ id: 'cl-01', category: 'amenity', group: '清掃消耗品', name: 'トイレクリーナー（流せるシート）', feature: '清掃の時短', unitCount: 24, unitLabel: '個', price: 6000, basis: 'perStay', qty: 0.5 }),
  consumable({ id: 'cl-02', category: 'amenity', group: '清掃消耗品', name: '排水口ネット', feature: '詰まり防止', unitCount: 300, unitLabel: '枚', price: 2400, basis: 'perStay', qty: 1 }),
  consumable({ id: 'cl-03', category: 'amenity', group: '清掃消耗品', name: '掃除機用 紙パック', feature: '掃除機を使うなら必要', unitCount: 30, unitLabel: '枚', price: 4500, basis: 'perMonth', qty: 1 }),
  consumable({ id: 'cl-04', category: 'amenity', group: '清掃消耗品', name: '使い捨て手袋', feature: '清掃スタッフ用', unitCount: 500, unitLabel: '枚', price: 3600, basis: 'perStay', qty: 2 }),
  consumable({ id: 'cl-05', category: 'amenity', group: '清掃消耗品', name: '洗濯洗剤・柔軟剤', feature: '洗濯機を置く場合', unitCount: 20, unitLabel: '回分', price: 4400, basis: 'perStay', qty: 1 }),

  // ── アメニティ：客室小物 ────────────────────────────
  equipment({ id: 'rm-01', category: 'amenity', group: '客室小物', name: 'ハンガー 10本セット', feature: '意外と足りなくなる', unitLabel: 'セット', price: 1800, lifespanMonths: 36 }),
  equipment({ id: 'rm-02', category: 'amenity', group: '客室小物', name: '姿見（全身鏡）', feature: '出かける前の身支度に', price: 8000, lifespanMonths: 60 }),
  equipment({ id: 'rm-03', category: 'amenity', group: '客室小物', name: '掛け時計', feature: 'チェックアウト時間の目安', price: 3000, lifespanMonths: 60 }),
  equipment({ id: 'rm-04', category: 'amenity', group: '客室小物', name: 'ゴミ箱（1部屋分）', feature: '分別できる形が便利', price: 2500, lifespanMonths: 60 }),
  equipment({ id: 'rm-05', category: 'amenity', group: '客室小物', name: '傘立て・玄関マット', feature: '玄関まわりの印象', unitLabel: '式', price: 6000, lifespanMonths: 48 }),
  equipment({ id: 'rm-06', category: 'amenity', group: '客室小物', name: '靴べら・シューケア', feature: '細かいが効く配慮', price: 2500, lifespanMonths: 48 }),
  equipment({ id: 'rm-07', category: 'amenity', group: '客室小物', name: 'スマホ充電ケーブル 3種セット', feature: '忘れ物の定番', unitLabel: 'セット', price: 2800, lifespanMonths: 12 }),
  equipment({ id: 'rm-08', category: 'amenity', group: '客室小物', name: '延長コード・電源タップ', feature: 'コンセント不足の対策', price: 2200, lifespanMonths: 36 }),
  equipment({ id: 'rm-09', category: 'amenity', group: '客室小物', name: 'モバイルバッテリー（貸出用）', feature: '観光地では喜ばれる', price: 4500, lifespanMonths: 24 }),

  // ── アメニティ：ウェルカム・案内 ────────────────────
  consumable({ id: 'wc-01', category: 'amenity', group: 'ウェルカム・案内', name: 'ウェルカムカード（印刷）', feature: '口コミ依頼にも使える', unitCount: 100, unitLabel: '枚', price: 4000, basis: 'perStay', qty: 1 }),
  equipment({ id: 'wc-02', category: 'amenity', group: 'ウェルカム・案内', name: 'ハウスマニュアル（多言語ファイル）', feature: '問い合わせを減らせる', unitLabel: '式', price: 6000, lifespanMonths: 24 }),
  equipment({ id: 'wc-03', category: 'amenity', group: 'ウェルカム・案内', name: '館内サイン一式', feature: '使い方の説明を貼る', unitLabel: '式', price: 12000, lifespanMonths: 60 }),
  consumable({ id: 'wc-04', category: 'amenity', group: 'ウェルカム・案内', name: '地元銘菓（ウェルカムスイーツ）', feature: '地域らしさを出せる', unitCount: 30, unitLabel: '個', price: 5400, basis: 'perStay', qty: 1 }),

  // ── アメニティ：子ども・ペット ──────────────────────
  consumable({ id: 'kd-01', category: 'amenity', group: '子ども・ペット', name: '子ども用歯ブラシ', feature: 'ファミリー層向け', unitCount: 100, unitLabel: '本', price: 3800, basis: 'perGuest', qty: 0.2 }),
  consumable({ id: 'kd-02', category: 'amenity', group: '子ども・ペット', name: 'ベビーソープ・おしりふき', feature: '乳幼児連れに対応', unitCount: 24, unitLabel: 'セット', price: 5200, basis: 'perStay', qty: 0.2 }),
  equipment({ id: 'kd-03', category: 'amenity', group: '子ども・ペット', name: 'ベビーベッド', feature: '検索で選ばれやすくなる', price: 18000, lifespanMonths: 60 }),
  equipment({ id: 'kd-04', category: 'amenity', group: '子ども・ペット', name: 'ベビーチェア・子ども用食器', feature: 'ファミリー対応の定番', unitLabel: 'セット', price: 6000, lifespanMonths: 48 }),
  equipment({ id: 'kd-05', category: 'amenity', group: '子ども・ペット', name: 'ペット用食器・トイレ一式', feature: 'ペット可にするなら', unitLabel: '式', price: 8000, lifespanMonths: 36 }),
  consumable({ id: 'kd-06', category: 'amenity', group: '子ども・ペット', name: 'ペット用消臭・粘着ローラー', feature: '次の客への配慮', unitCount: 20, unitLabel: 'セット', price: 4800, basis: 'perStay', qty: 0.3 }),

  // ── 家電・設備 追加 ─────────────────────────────────
  equipment({ id: 'ap-10', category: 'appliance', group: 'エアコン・空調', name: '加湿器', feature: '冬場の乾燥対策', price: 12000, lifespanMonths: 48 }),
  equipment({ id: 'ap-11', category: 'appliance', group: 'エアコン・空調', name: '除湿機', feature: '梅雨・カビ対策', price: 26000, lifespanMonths: 60 }),
  equipment({ id: 'ap-12', category: 'appliance', group: 'エアコン・空調', name: 'サーキュレーター', feature: '冷暖房の効きを助ける', price: 6800, lifespanMonths: 48 }),
  equipment({ id: 'ap-13', category: 'appliance', group: 'エアコン・空調', name: '扇風機', feature: '安く涼しさを足せる', price: 5800, lifespanMonths: 48 }),
  equipment({ id: 'ap-14', category: 'appliance', group: 'エアコン・空調', name: 'セラミックヒーター', feature: '脱衣所や寝室の補助暖房', price: 8800, lifespanMonths: 48 }),
  equipment({ id: 'ap-15', category: 'appliance', group: 'その他家電', name: '電気毛布', feature: '寒冷地の満足度対策', price: 5000, lifespanMonths: 36 }),
  equipment({ id: 'ap-16', category: 'appliance', group: 'その他家電', name: 'アイロン・アイロン台', feature: '長期滞在・出張客向け', unitLabel: '式', price: 7000, lifespanMonths: 60 }),
  equipment({ id: 'ap-17', category: 'appliance', group: 'その他家電', name: '体重計', feature: '低コストで印象が良い', price: 3000, lifespanMonths: 60 }),
  equipment({ id: 'ap-18', category: 'appliance', group: 'その他家電', name: 'ヘアアイロン', feature: '女性客の口コミ対策', price: 5500, lifespanMonths: 24 }),
  equipment({ id: 'ap-19', category: 'appliance', group: 'その他家電', name: 'トースター', feature: '朝食まわりの充実', price: 5000, lifespanMonths: 60 }),
  equipment({ id: 'ap-20', category: 'appliance', group: 'その他家電', name: 'コーヒーメーカー', feature: '滞在の質を上げやすい', price: 9800, lifespanMonths: 48 }),
  equipment({ id: 'ap-21', category: 'appliance', group: 'その他家電', name: 'ウォーターサーバー（買取型）', feature: '水代は別途かかります', price: 18000, lifespanMonths: 60 }),
  equipment({ id: 'ap-22', category: 'appliance', group: 'その他家電', name: 'Bluetoothスピーカー', feature: 'リビングの雰囲気づくり', price: 8000, lifespanMonths: 36 }),
  equipment({ id: 'ap-23', category: 'appliance', group: 'その他家電', name: '電気圧力鍋', feature: '自炊ニーズ対応', price: 14000, lifespanMonths: 48 }),
  equipment({ id: 'ap-24', category: 'appliance', group: 'その他家電', name: 'ホットプレート', feature: 'グループ滞在で人気', price: 9000, lifespanMonths: 60 }),
  equipment({ id: 'ap-25', category: 'appliance', group: 'その他家電', name: '食器洗い乾燥機（据置）', feature: '清掃の負担を下げる', price: 58000, lifespanMonths: 84 }),
  equipment({ id: 'sf-01', category: 'appliance', group: '安全・防犯', name: '屋外防犯カメラ', feature: '近隣対策・トラブル防止', price: 22000, lifespanMonths: 60 }),
  equipment({ id: 'sf-02', category: 'appliance', group: '安全・防犯', name: '住宅用火災警報器（1台）', feature: '法令で設置が必要', price: 3500, lifespanMonths: 120 }),
  equipment({ id: 'sf-03', category: 'appliance', group: '安全・防犯', name: '消火器', feature: '消防の指導で求められる', price: 8000, lifespanMonths: 60 }),
  equipment({ id: 'sf-04', category: 'appliance', group: '安全・防犯', name: '宿泊者名簿用タブレット', feature: '本人確認と記録に', price: 32000, lifespanMonths: 48 }),
  equipment({ id: 'sf-05', category: 'appliance', group: '安全・防犯', name: '騒音センサー', feature: '近隣トラブルの予防', price: 26000, lifespanMonths: 48 }),

  // ── 特別設備 追加 ───────────────────────────────────
  equipment({ id: 'sp-10', category: 'special', group: 'サウナ', name: 'ととのい椅子 2脚', feature: '外気浴スペースに', unitLabel: '組', price: 36000, lifespanMonths: 48 }),
  equipment({ id: 'sp-11', category: 'special', group: 'サウナ', name: '水風呂用チラー（冷却装置）', feature: '夏でも冷たさを保てる', price: 320000, lifespanMonths: 84 }),
  equipment({ id: 'sp-12', category: 'special', group: 'サウナ', name: 'サウナハット・マット 6人分', feature: '貸出用', unitLabel: '式', price: 24000, lifespanMonths: 24 }),
  consumable({ id: 'sp-13', category: 'special', group: 'サウナ', name: 'ヴィヒタ（白樺の枝）', feature: '本格感の演出', unitCount: 10, unitLabel: '本', price: 12000, basis: 'perMonth', qty: 1 }),
  equipment({ id: 'sp-14', category: 'special', group: '水まわり・屋外', name: '屋外シャワー設備', feature: 'サウナ・BBQとセットで', price: 180000, lifespanMonths: 120 }),
  equipment({ id: 'sp-15', category: 'special', group: '水まわり・屋外', name: 'ジャグジー・ホットタブ', feature: '宿泊単価を上げやすい', price: 850000, lifespanMonths: 120 }),
  equipment({ id: 'sp-16', category: 'special', group: '水まわり・屋外', name: '露天風呂（後付けユニット）', feature: '大きな差別化になる', price: 1600000, lifespanMonths: 180 }),
  equipment({ id: 'sp-17', category: 'special', group: 'BBQ', name: 'ピザ窯（屋外設置型）', feature: '体験型の目玉になる', price: 240000, lifespanMonths: 120 }),
  consumable({ id: 'sp-18', category: 'special', group: 'BBQ', name: 'BBQ消耗品セット（ホイル・軍手ほか）', feature: '1回分の使い切り', unitCount: 30, unitLabel: '回分', price: 7500, basis: 'perStay', qty: 0.5 }),
  equipment({ id: 'sp-19', category: 'special', group: 'その他アウトドア', name: '屋外パラソル・タープ', feature: '日差しと雨をしのぐ', price: 38000, lifespanMonths: 48 }),
  equipment({ id: 'sp-20', category: 'special', group: 'その他アウトドア', name: '屋外用こたつ・ブランケット', feature: '冬の屋外滞在に', unitLabel: '式', price: 24000, lifespanMonths: 36 }),
  equipment({ id: 'sp-21', category: 'special', group: 'その他アウトドア', name: '防水スピーカー（屋外用）', feature: '庭の雰囲気づくり', price: 26000, lifespanMonths: 48 }),
  equipment({ id: 'sp-22', category: 'special', group: 'その他アウトドア', name: '屋外用ストーブ（灯油）', feature: '寒い時期の屋外対策', price: 18000, lifespanMonths: 60 }),
  equipment({ id: 'sp-23', category: 'special', group: 'その他アウトドア', name: 'テントサイト用品（タープ・ランタン）', feature: 'グランピング寄りの演出', unitLabel: '式', price: 45000, lifespanMonths: 48 }),
  equipment({ id: 'sp-24', category: 'special', group: 'その他アウトドア', name: '薪ラック・薪割り道具', feature: '焚き火・サウナとセット', unitLabel: '式', price: 12000, lifespanMonths: 60 }),

  // ── 寝具・家具・キッチン 追加 ───────────────────────
  equipment({ id: 'fr-10', category: 'furniture', group: 'ベッド・寝具', name: '折りたたみマットレス（増員用）', feature: '定員を柔軟に増やせる', price: 9800, lifespanMonths: 36 }),
  equipment({ id: 'fr-11', category: 'furniture', group: '家具', name: '座椅子・ローテーブル', feature: '和室・くつろぎスペース', unitLabel: '式', price: 22000, lifespanMonths: 72 }),
  equipment({ id: 'fr-12', category: 'furniture', group: '家具', name: 'ラグ・カーペット', feature: '部屋の印象が大きく変わる', price: 14000, lifespanMonths: 48 }),
  equipment({ id: 'fr-13', category: 'furniture', group: '家具', name: 'クッション・ブランケット', feature: '写真映えと居心地', unitLabel: '式', price: 8000, lifespanMonths: 24 }),
  equipment({ id: 'fr-14', category: 'furniture', group: '家具', name: '本棚・雑貨・観葉植物', feature: '生活感を整える', unitLabel: '式', price: 18000, lifespanMonths: 60 }),
  equipment({ id: 'fr-15', category: 'furniture', group: '家具', name: '間接照明・ダイニング照明', feature: '夜の写真の印象を左右する', unitLabel: '式', price: 16000, lifespanMonths: 72 }),
  equipment({ id: 'fr-16', category: 'furniture', group: 'キッチン', name: 'ワイングラス・ビールグラス', feature: 'グループ滞在向け', unitLabel: 'セット', price: 6000, lifespanMonths: 36 }),
  equipment({ id: 'fr-17', category: 'furniture', group: 'キッチン', name: 'まな板・包丁セット', feature: '自炊の最低限', unitLabel: 'セット', price: 6000, lifespanMonths: 36 }),
  equipment({ id: 'fr-18', category: 'furniture', group: 'キッチン', name: '水切りかご・キッチン小物', feature: '細かいが必ず要る', unitLabel: '式', price: 5000, lifespanMonths: 36 }),
  equipment({ id: 'fr-19', category: 'furniture', group: 'キッチン', name: 'IH対応 鍋・フライパン 追加分', feature: '人数が多い施設向け', unitLabel: 'セット', price: 12000, lifespanMonths: 36 }),
  equipment({ id: 'fr-20', category: 'furniture', group: '家具', name: '布団収納・押入れ整理用品', feature: '見た目を整える', unitLabel: '式', price: 6000, lifespanMonths: 60 }),
];

/**
 * 商品リストに、取得してきた実物の情報（URL・画像・価格）を重ねる。
 * enrichment.ts は scripts/enrich-rakuten.mjs が生成する。
 */
export const SAMPLE_PRODUCTS: Product[] = BASE_PRODUCTS.map((p) => ({
  ...p,
  ...(ENRICHMENT[p.id] ?? {}),
}));
