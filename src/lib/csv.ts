import type { CategoryId, Product } from '../types';

const HEADERS = [
  'id',
  'category',
  'group',
  'name',
  'feature',
  'unitCount',
  'unitLabel',
  'price',
  'costType',
  'consumeBasis',
  'consumeQty',
  'lifespanMonths',
  'productUrl',
  'imageUrl',
  'searchKeyword',
  'matchedName',
  'priceNote',
] as const;

const esc = (v: unknown): string => {
  const s = v == null ? '' : String(v);
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};

export function productsToCsv(products: Product[]): string {
  const rows = products.map((p) =>
    [
      p.id,
      p.category,
      p.group,
      p.name,
      p.feature,
      p.unitCount,
      p.unitLabel,
      p.price,
      p.costType,
      p.consumeBasis ?? '',
      p.consumeQty ?? '',
      p.lifespanMonths ?? '',
      p.productUrl ?? '',
      p.imageUrl ?? '',
      p.searchKeyword ?? '',
      p.matchedName ?? '',
      p.priceNote ?? '',
    ]
      .map(esc)
      .join(','),
  );
  // Excel で文字化けしないよう BOM を付ける
  return '﻿' + [HEADERS.join(','), ...rows].join('\r\n');
}

function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  const src = text.replace(/^﻿/, '');

  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += c;
      continue;
    }
    if (c === '"') inQuotes = true;
    else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (c !== '\r') field += c;
  }
  if (field !== '' || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((v) => v.trim() !== ''));
}

const CATEGORIES: CategoryId[] = ['amenity', 'appliance', 'special', 'furniture'];

export function csvToProducts(text: string): { products: Product[]; errors: string[] } {
  const rows = parseCsvRows(text);
  const errors: string[] = [];
  if (rows.length < 2) return { products: [], errors: ['データ行が見つかりませんでした。'] };

  const header = rows[0].map((h) => h.trim());
  const idx = (k: string) => header.indexOf(k);
  const products: Product[] = [];

  rows.slice(1).forEach((r, i) => {
    const get = (k: string) => (idx(k) >= 0 ? (r[idx(k)] ?? '').trim() : '');
    const name = get('name');
    if (!name) {
      errors.push(`${i + 2}行目: 商品名が空のため読み飛ばしました。`);
      return;
    }
    const cat = get('category') as CategoryId;
    const costType = get('costType') === 'equipment' ? 'equipment' : 'consumable';
    products.push({
      id: get('id') || `csv-${Date.now()}-${i}`,
      category: CATEGORIES.includes(cat) ? cat : 'amenity',
      group: get('group') || 'その他',
      name,
      feature: get('feature'),
      unitCount: Number(get('unitCount')) || 1,
      unitLabel: get('unitLabel') || (costType === 'equipment' ? '台' : '個'),
      price: Number(get('price')) || 0,
      costType,
      consumeBasis:
        costType === 'consumable'
          ? ((get('consumeBasis') || 'perStay') as Product['consumeBasis'])
          : undefined,
      consumeQty: costType === 'consumable' ? Number(get('consumeQty')) || 1 : undefined,
      lifespanMonths: costType === 'equipment' ? Number(get('lifespanMonths')) || 60 : undefined,
      productUrl: get('productUrl') || undefined,
      imageUrl: get('imageUrl') || undefined,
      searchKeyword: get('searchKeyword') || undefined,
      matchedName: get('matchedName') || undefined,
      priceNote: get('priceNote') || undefined,
      custom: true,
    });
  });

  return { products, errors };
}

export function download(filename: string, text: string, mime = 'text/csv'): void {
  const blob = new Blob([text], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
