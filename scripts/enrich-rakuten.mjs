/**
 * 楽天市場の商品検索APIを使って、商品リストに「実物の商品ページURL・画像・価格」を取り込む。
 *
 *   RAKUTEN_APP_ID=xxxxx npm run enrich -- --category amenity --price
 *
 * 結果は src/data/enrichment.ts に書き出され、アプリの商品リストに重ねて表示されます。
 * 元の商品リスト（catalog.ts）は書き換えません。気に入らない結果は
 * enrichment.ts の該当行を消せば元に戻ります。
 *
 * 主なオプション
 *   --category <id>   カテゴリを限定（amenity / appliance / special / furniture）
 *   --group <名前>    小分類を限定（例: --group おしぼり）
 *   --ids a,b,c       商品IDを直接指定
 *   --limit <数>      処理する件数の上限
 *   --price           価格も楽天の実売価格で置き換える（既定は URL と画像のみ）
 *   --overwrite       すでに取り込み済みの商品も取り直す
 *   --dry             書き込まずに結果を表示するだけ
 */
import { build } from 'esbuild';
import { mkdtempSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { pathToFileURL } from 'node:url';

const API = 'https://app.rakuten.co.jp/services/api/IchibaItem/Search/20220601';
const OUT = 'src/data/enrichment.ts';
/** 楽天APIは1秒1リクエストまで */
const INTERVAL_MS = 1100;

const { values } = parseArgs({
  options: {
    category: { type: 'string' },
    group: { type: 'string' },
    ids: { type: 'string' },
    limit: { type: 'string' },
    price: { type: 'boolean' },
    overwrite: { type: 'boolean' },
    dry: { type: 'boolean' },
  },
  allowPositionals: true,
});

const appId = process.env.RAKUTEN_APP_ID;
if (!appId) {
  console.error(
    [
      'RAKUTEN_APP_ID が設定されていません。',
      '',
      '1. https://webservice.rakuten.co.jp/ で無料のアプリIDを取得します（楽天会員IDでログイン、数分で終わります）',
      '2. 取得したIDを渡して実行します',
      '',
      '   RAKUTEN_APP_ID=取得したID npm run enrich -- --group おしぼり',
      '',
    ].join('\n'),
  );
  process.exit(1);
}

/** TypeScript の商品リストを読み込む */
async function loadProducts() {
  const dir = mkdtempSync(join(tmpdir(), 'catalog-'));
  const outfile = join(dir, 'catalog.mjs');
  await build({
    entryPoints: ['src/data/catalog.ts'],
    bundle: true,
    format: 'esm',
    platform: 'node',
    outfile,
    logLevel: 'silent',
  });
  const mod = await import(pathToFileURL(outfile).href);
  return mod.SAMPLE_PRODUCTS;
}

/** すでに取り込み済みの内容を読む */
function loadExisting() {
  if (!existsSync(OUT)) return {};
  const src = readFileSync(OUT, 'utf8');
  const m = src.match(/ENRICHMENT: Record<string, Partial<Product>> = (\{[\s\S]*\});\s*$/);
  if (!m) return {};
  try {
    return JSON.parse(m[1].replace(/'/g, '"').replace(/,(\s*[}\]])/g, '$1'));
  } catch {
    return {};
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** 画像URLをサムネイルから少し大きいサイズに差し替える */
const upscale = (url) => url.replace(/_ex=\d+x\d+/, '_ex=300x300');

async function search(keyword) {
  const url =
    `${API}?applicationId=${encodeURIComponent(appId)}` +
    `&keyword=${encodeURIComponent(keyword)}&hits=3&imageFlag=1&sort=standard&formatVersion=2`;
  const res = await fetch(url);
  if (res.status === 429) {
    await sleep(5000);
    return search(keyword);
  }
  if (!res.ok) throw new Error(`HTTP ${res.status} ${await res.text()}`);
  const json = await res.json();
  const item = json.Items?.[0];
  if (!item) return null;
  return {
    name: item.itemName,
    productUrl: item.itemUrl,
    imageUrl: item.mediumImageUrls?.[0] ? upscale(item.mediumImageUrls[0]) : undefined,
    price: item.itemPrice,
    shop: item.shopName,
  };
}

const products = await loadProducts();
const existing = loadExisting();
const idFilter = values.ids ? new Set(values.ids.split(',').map((s) => s.trim())) : null;

let targets = products.filter((p) => {
  if (idFilter) return idFilter.has(p.id);
  if (values.category && p.category !== values.category) return false;
  if (values.group && p.group !== values.group) return false;
  if (!values.overwrite && existing[p.id]?.productUrl) return false;
  return true;
});
if (values.limit) targets = targets.slice(0, Number(values.limit));

if (targets.length === 0) {
  console.log('対象の商品がありません。--overwrite で取り直せます。');
  process.exit(0);
}

console.log(`${targets.length}件を楽天市場で検索します（1件あたり約1秒）\n`);

const today = new Date().toISOString().slice(0, 10);
const result = { ...existing };
let hit = 0;
let miss = 0;

for (const [i, p] of targets.entries()) {
  const keyword = p.searchKeyword || `${p.name}`;
  process.stdout.write(`[${i + 1}/${targets.length}] ${p.name} … `);
  try {
    const found = await search(keyword);
    if (!found) {
      console.log('見つかりませんでした');
      miss++;
    } else {
      const patch = { productUrl: found.productUrl };
      if (found.imageUrl) patch.imageUrl = found.imageUrl;
      if (values.price && found.price > 0) {
        patch.price = found.price;
        patch.priceNote = `楽天市場 ${today}時点`;
      }
      result[p.id] = { ...(result[p.id] ?? {}), ...patch };
      console.log(`${found.name.slice(0, 30)}… ¥${found.price.toLocaleString()}`);
      hit++;
    }
  } catch (e) {
    console.log(`失敗: ${e.message}`);
    miss++;
  }
  if (i < targets.length - 1) await sleep(INTERVAL_MS);
}

const body = Object.entries(result)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([id, patch]) => `  ${JSON.stringify(id)}: ${JSON.stringify(patch, null, 2).replace(/\n/g, '\n  ')},`)
  .join('\n');

const file = `import type { Product } from '../types';

/**
 * 実物の商品情報（商品ページURL・画像・価格）。
 *
 * このファイルは \`npm run enrich\` で自動生成します。手で書き換えても構いません。
 * 商品リストのうち、ここに書かれた項目だけが上書きされます。
 * 最終更新: ${today}
 */
export const ENRICHMENT: Record<string, Partial<Product>> = {
${body}
};
`;

console.log(`\n見つかった: ${hit}件 / 見つからなかった: ${miss}件`);
if (values.dry) {
  console.log('--dry のため書き込みませんでした。');
} else {
  writeFileSync(OUT, file);
  console.log(`${OUT} を更新しました。`);
}
