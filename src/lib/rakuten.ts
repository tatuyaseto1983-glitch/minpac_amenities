import type { Product } from '../types';

/** 楽天市場 商品検索API（version 2026-07-01） */
export const RAKUTEN_API = 'https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260701';

export interface RakutenItem {
  name: string;
  productUrl: string;
  imageUrl?: string;
  price: number;
  shop: string;
}

/** 検索に邪魔な言葉を落とす */
export function toKeyword(p: Product): string {
  if (p.searchKeyword) return p.searchKeyword;
  return p.name
    .replace(/[（(][^）)]*[）)]/g, ' ')
    .replace(/追加分|\d+人分|\d+名分/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** サムネイルのサイズ指定を少し大きくする */
export function upscale(url: string): string {
  return url.replace(/_ex=\d+x\d+/, '_ex=300x300');
}

/** 明らかに用途の違う検索結果を弾く */
export function isPlausible(p: Product, item: RakutenItem): boolean {
  // ふるさと納税の返礼品は備品の仕入れには使えない
  if (/ふるさと納税/.test(item.name)) return false;
  if (/中古|ジャンク/.test(item.name)) return false;
  // 買い切りの設備は、想定価格とかけ離れていたら別物とみなす
  if (p.costType === 'equipment' && p.price > 0 && item.price > 0) {
    const ratio = item.price / p.price;
    if (ratio < 0.2 || ratio > 5) return false;
  }
  return true;
}

export function buildSearchUrl(appId: string, keyword: string): string {
  return (
    `${RAKUTEN_API}?applicationId=${encodeURIComponent(appId)}` +
    `&keyword=${encodeURIComponent(keyword)}&hits=10&imageFlag=1&sort=standard&formatVersion=2`
  );
}

interface RawItem {
  itemName: string;
  itemUrl: string;
  itemPrice: number;
  shopName: string;
  mediumImageUrls?: string[];
}

export function parseItems(json: unknown): RakutenItem[] {
  const items = (json as { Items?: RawItem[] })?.Items ?? [];
  return items.map((item) => ({
    name: item.itemName,
    productUrl: item.itemUrl,
    imageUrl: item.mediumImageUrls?.[0] ? upscale(item.mediumImageUrls[0]) : undefined,
    price: item.itemPrice,
    shop: item.shopName,
  }));
}

/** 商品1件を楽天市場で探す。見つからなければ null */
export async function findProduct(
  p: Product,
  appId: string,
  accessKey: string,
): Promise<RakutenItem | null> {
  const res = await fetch(buildSearchUrl(appId, toKeyword(p)), {
    headers: { accessKey },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const candidates = parseItems(await res.json());
  return candidates.find((c) => isPlausible(p, c)) ?? null;
}
