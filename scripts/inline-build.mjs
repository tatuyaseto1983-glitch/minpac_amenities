/**
 * vite build の成果物を1枚のHTMLにまとめる。
 *  - dist-single/minpaku-amenities.html … ダブルクリックで開ける完全版
 *  - dist-single/artifact-body.html     … Artifact 公開用（head/body タグなし）
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const TITLE = '民泊 備品・アメニティ 費用シミュレーター';
const css = readFileSync('dist/app.css', 'utf8');
// </script> がJS中に現れても壊れないようにする
const js = readFileSync('dist/app.js', 'utf8').replace(/<\/script>/gi, '<\\/script>');

const head = `<title>${TITLE}</title>\n<style>\n${css}\n</style>`;
const body = `<div id="root"></div>\n<script type="module">\n${js}\n</script>`;

mkdirSync('dist-single', { recursive: true });
writeFileSync('dist-single/artifact-body.html', `${head}\n${body}\n`);
writeFileSync(
  'dist-single/minpaku-amenities.html',
  [
    '<!doctype html>',
    '<html lang="ja">',
    '<head>',
    '<meta charset="UTF-8" />',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0" />',
    head,
    '</head>',
    '<body>',
    body,
    '</body>',
    '</html>',
    '',
  ].join('\n'),
);

console.log('dist-single/ に出力しました');
