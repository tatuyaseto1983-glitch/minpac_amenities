/**
 * すでに商品ページのURLが分かっている商品について、そのページから写真を取ってくる。
 * 楽天以外（Amazon・アスクル・メーカー直販など）のページに対応するための道具です。
 *
 *   node scripts/enrich-image-from-url.mjs [--ids a,b,c] [--overwrite] [--dry]
 *
 * 商品ページのURLは書き換えません。写真（imageUrl）だけを足します。
 */
import { build } from 'esbuild';
import { mkdtempSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { pathToFileURL } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const run = promisify(execFile);

const OUT = 'src/data/enrichment.ts';
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36';

const { values } = parseArgs({
  options: {
    ids: { type: 'string' },
    overwrite: { type: 'boolean' },
    dry: { type: 'boolean' },
  },
});

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
  return (await import(pathToFileURL(outfile).href)).SAMPLE_PRODUCTS;
}

function loadExisting() {
  if (!existsSync(OUT)) return {};
  const m = readFileSync(OUT, 'utf8').match(
    /ENRICHMENT: Record<string, Partial<Product>> = (\{[\s\S]*\});\s*$/,
  );
  if (!m) return {};
  try {
    // 末尾のカンマが残っていてもJSONとして読めるようにする
    return JSON.parse(m[1].replace(/,(\s*[}\]])/g, '$1'));
  } catch (e) {
    // 読めないまま上書きすると既存の取り込み結果を失うので、ここで止める
    console.error(`${OUT} を読み取れませんでした。中断します。`, e.message);
    process.exit(1);
  }
}

/** ページのHTMLから商品写真らしきものを1枚選ぶ */
function extractImage(html, pageUrl) {
  const patterns = [
    /<meta[^>]+(?:property|name)=["']og:image["'][^>]*content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']og:image["']/i,
    /<meta[^>]+(?:property|name)=["']twitter:image["'][^>]*content=["']([^"']+)["']/i,
    // Amazon は og:image を出さないので商品画像のデータから拾う
    /data-old-hires=["']([^"']+)["']/i,
    /"hiRes":"(https:\/\/m\.media-amazon[^"]+)"/i,
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) {
      try {
        return new URL(m[1].replace(/&amp;/g, '&'), pageUrl).href;
      } catch {
        /* URLとして読めないものは次の候補へ */
      }
    }
  }
  return null;
}

const products = await loadProducts();
const existing = loadExisting();
const idFilter = values.ids ? new Set(values.ids.split(',').map((s) => s.trim())) : null;

const targets = products.filter((p) => {
  if (idFilter) return idFilter.has(p.id) && !!p.productUrl;
  if (!p.productUrl) return false;
  if (!values.overwrite && (p.imageUrl || existing[p.id]?.imageUrl)) return false;
  return true;
});

if (targets.length === 0) {
  console.log('対象の商品がありません。');
  process.exit(0);
}

console.log(`${targets.length}件の商品ページから写真を探します\n`);

const result = { ...existing };
let hit = 0;

for (const [i, p] of targets.entries()) {
  process.stdout.write(`[${i + 1}/${targets.length}] ${p.name} … `);
  try {
    // 通常のfetchで簡易ページしか返さないサイトがあるため curl も試す
    let html = '';
    let finalUrl = p.productUrl;
    try {
      const res = await fetch(p.productUrl, {
        headers: { 'User-Agent': UA, 'Accept-Language': 'ja' },
        redirect: 'follow',
      });
      if (res.ok) {
        html = await res.text();
        finalUrl = res.url;
      }
    } catch {
      /* curl で取り直す */
    }
    if (html.length < 20000 || !extractImage(html, finalUrl)) {
      const { stdout } = await run(
        'curl',
        ['-sL', '--max-time', '40', '-A', UA, '-H', 'Accept-Language: ja', '-w', '\n%{url_effective}', p.productUrl],
        { maxBuffer: 40 * 1024 * 1024 },
      );
      const nl = stdout.lastIndexOf('\n');
      html = stdout.slice(0, nl);
      finalUrl = stdout.slice(nl + 1).trim() || finalUrl;
    }
    const image = extractImage(html, finalUrl);
    if (image) {
      result[p.id] = { ...(result[p.id] ?? {}), imageUrl: image };
      hit++;
      console.log(image.slice(0, 70));
    } else {
      console.log('写真が見つかりませんでした');
    }
  } catch (e) {
    console.log(`失敗: ${e.message}`);
  }
  if (i < targets.length - 1) await new Promise((r) => setTimeout(r, 1200));
}

const body = Object.entries(result)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([id, patch]) => `  ${JSON.stringify(id)}: ${JSON.stringify(patch, null, 2).replace(/\n/g, '\n  ')},`)
  .join('\n');

const file = `import type { Product } from '../types';

/**
 * 実物の商品情報（商品ページURL・画像・価格）。
 *
 * このファイルは \`npm run enrich\` などで自動生成します。手で書き換えても構いません。
 * 商品リストのうち、ここに書かれた項目だけが上書きされます。
 * 最終更新: ${new Date().toISOString().slice(0, 10)}
 */
export const ENRICHMENT: Record<string, Partial<Product>> = {
${body}
};
`;

console.log(`\n写真が入った: ${hit}件`);
if (values.dry) console.log('--dry のため書き込みませんでした。');
else {
  writeFileSync(OUT, file);
  console.log(`${OUT} を更新しました。`);
}
