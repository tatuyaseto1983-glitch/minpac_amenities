/**
 * 楽天市場の商品検索API（version 2026-07-01）を使って、
 * 商品リストに「実物の商品ページURL・画像・価格」を取り込む。
 *
 *   RAKUTEN_APP_ID=xxxx RAKUTEN_ACCESS_KEY=yyyy npm run enrich -- --category amenity --price
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
 *   --price           価格も楽天の実売価格で置き換える
 *                     ※ 検索で当たった商品の入数（何枚入りか）はこちらの想定と
 *                       違うことがあるため、既定では価格に触りません。
 *                       使うときは入数もあわせて確認してください。
 *   --overwrite       すでに取り込み済みの商品も取り直す
 *   --dry             書き込まずに結果を表示するだけ
 */
import { build } from 'esbuild';
import { mkdtempSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { pathToFileURL } from 'node:url';

const API = 'https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260701';
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
const accessKey = process.env.RAKUTEN_ACCESS_KEY;
if (!appId || !accessKey) {
  console.error(
    [
      'RAKUTEN_APP_ID と RAKUTEN_ACCESS_KEY の両方が必要です。',
      '',
      '1. https://webservice.rakuten.co.jp/ でアプリを登録します（無料）',
      '2. アプリの詳細画面にある Application ID と Access Key を渡して実行します',
      '',
      '   RAKUTEN_APP_ID=xxxx RAKUTEN_ACCESS_KEY=yyyy npm run enrich -- --group おしぼり',
      '',
      '※ Access Key はパスワードにあたります。ファイルに書いたり共有したりしないでください。',
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

/** 検索に邪魔な言葉を落とす */
function toKeyword(p) {
  if (p.searchKeyword) return p.searchKeyword;
  return p.name
    .replace(/[（(][^）)]*[）)]/g, ' ')
    .replace(/追加分|\d+人分|\d+名分/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** 明らかに用途の違う検索結果を弾く */
function isPlausible(p, item) {
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

/** 画像URLをサムネイルから少し大きいサイズに差し替える */
const upscale = (url) => url.replace(/_ex=\d+x\d+/, '_ex=300x300');

async function search(keyword) {
  const url =
    `${API}?applicationId=${encodeURIComponent(appId)}` +
    `&keyword=${encodeURIComponent(keyword)}&hits=10&imageFlag=1&sort=standard&formatVersion=2`;
  // アクセスキーはURLに残さないようヘッダーで送る
  const res = await fetch(url, { headers: { accessKey } });
  if (res.status === 429) {
    await sleep(5000);
    return search(keyword);
  }
  if (!res.ok) throw new Error(`HTTP ${res.status} ${await res.text()}`);
  const json = await res.json();
  return (json.Items ?? []).map((item) => ({
    name: item.itemName,
    productUrl: item.itemUrl,
    imageUrl: item.mediumImageUrls?.[0] ? upscale(item.mediumImageUrls[0]) : undefined,
    price: item.itemPrice,
    shop: item.shopName,
  }));
}

const products = await loadProducts();
const existing = loadExisting();
const idFilter = values.ids ? new Set(values.ids.split(',').map((s) => s.trim())) : null;

let targets = products.filter((p) => {
  if (idFilter) return idFilter.has(p.id);
  if (values.category && p.category !== values.category) return false;
  if (values.group && p.group !== values.group) return false;
  // 資料や手入力で実物のURLが入っている商品は、--overwrite でも上書きしない
  if (p.productUrl) return false;
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
  const keyword = toKeyword(p);
  process.stdout.write(`[${i + 1}/${targets.length}] ${p.name} … `);
  try {
    const candidates = await search(keyword);
    const found = candidates.find((c) => isPlausible(p, c));
    if (!found) {
      console.log(candidates.length ? '条件に合う商品がありませんでした' : '見つかりませんでした');
      miss++;
    } else {
      const patch = { productUrl: found.productUrl, matchedName: found.name };
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
