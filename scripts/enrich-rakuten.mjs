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

/** TypeScript の商品リストと判定ロジックを読み込む */
async function loadTs() {
  const dir = mkdtempSync(join(tmpdir(), 'catalog-'));
  const entry = join(dir, 'entry.ts');
  const outfile = join(dir, 'bundle.mjs');
  writeFileSync(
    entry,
    `export { SAMPLE_PRODUCTS } from '${process.cwd()}/src/data/catalog.ts';\n` +
      `export * as lib from '${process.cwd()}/src/lib/rakuten.ts';\n`,
  );
  await build({
    entryPoints: [entry],
    bundle: true,
    format: 'esm',
    platform: 'node',
    outfile,
    logLevel: 'silent',
  });
  return import(pathToFileURL(outfile).href);
}

/** すでに取り込み済みの内容を読む */
function loadExisting() {
  if (!existsSync(OUT)) return {};
  const src = readFileSync(OUT, 'utf8');
  const m = src.match(/ENRICHMENT: Record<string, Partial<Product>> = (\{[\s\S]*\});\s*$/);
  if (!m) return {};
  try {
    return JSON.parse(m[1].replace(/,(\s*[}\]])/g, '$1'));
  } catch (e) {
    // 読めないまま上書きすると既存の取り込み結果を失うので、ここで止める
    console.error(`${OUT} を読み取れませんでした。中断します。`, e.message);
    process.exit(1);
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function search(p) {
  const res = await fetch(lib.buildSearchUrl(appId, lib.toKeyword(p)), { headers: { accessKey } });
  if (res.status === 429) {
    await sleep(5000);
    return search(p);
  }
  if (!res.ok) throw new Error(`HTTP ${res.status} ${await res.text()}`);
  return lib.parseItems(await res.json());
}

const { SAMPLE_PRODUCTS: products, lib } = await loadTs();
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
  process.stdout.write(`[${i + 1}/${targets.length}] ${p.name} … `);
  try {
    const candidates = await search(p);
    const found = candidates.find((c) => lib.isPlausible(p, c));
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
