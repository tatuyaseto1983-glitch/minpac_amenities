# 民泊 備品・アメニティ 費用シミュレーター

民泊の備品・アメニティをカタログから選ぶと、初期費用と毎月・年間の費用が自動で出るアプリです。

- 商品を横並びで比較（画像・特徴・入数・金額・単価・URL）。サンプル商品は約180点
- 稼働率などの条件から、消耗品の使用量を自動計算（商品ごとに手入力での上書きも可能）
- 初期費用／毎月／年間／初年度に必要な現金 を同時に表示
- 商品リストは画面から追加・編集でき、CSV で書き出し・読み込みができます

要件と計算式は [docs/requirements.md](docs/requirements.md) にまとめています。

## 使い方（開発）

```bash
npm install
npm run dev        # 開発サーバーを起動
npm run build      # 型チェック＋本番ビルド（dist/）
npm run bundle:single  # 1枚のHTMLにまとめる（dist-single/）
```

`npm run bundle:single` を実行すると `dist-single/minpaku-amenities.html` ができます。
このファイル1つをそのまま渡せば、ブラウザで開くだけで動きます（サーバー不要）。

## 画面

| タブ | 内容 |
| --- | --- |
| ① 施設の条件 | 部屋数・稼働率・平均宿泊日数など、計算の前提を入力 |
| ② カタログで選ぶ | カテゴリ別に商品を比較して選択 |
| ③ 費用シミュレーション | 金額の集計、明細、CSV書き出し、印刷 |
| ④ 商品リストの管理 | 商品の追加・編集・削除、CSV入出力 |

## 実物の商品URL・画像を取り込む

商品ページのURLと写真は、楽天市場の商品検索API（無料）から自動で取り込めます。

1. https://webservice.rakuten.co.jp/ でアプリを登録します（楽天会員IDでログイン、無料）
   - Application type は「API/Backend Service」
   - API Access Scopes は「Rakuten Ichiba API」
   - Allowed IP addresses には、実行するパソコンのグローバルIPを入れます
2. アプリの詳細画面にある **Application ID** と **Access Key** を渡して実行します

```bash
# まずは1グループだけで試す
RAKUTEN_APP_ID=xxxx RAKUTEN_ACCESS_KEY=yyyy npm run enrich -- --group おしぼり

# アメニティ全体を、価格も楽天の実売価格に置き換えて取り込む
RAKUTEN_APP_ID=xxxx RAKUTEN_ACCESS_KEY=yyyy npm run enrich -- --category amenity --price
```

Access Key はパスワードにあたります。ファイルに書き込んだり、リポジトリに含めたりしないでください。

結果は `src/data/enrichment.ts` に書き出され、商品リストに重ねて表示されます。
元の商品リスト（`src/data/catalog.ts`）は書き換えないので、気に入らない結果は
`enrichment.ts` の該当行を消せば元に戻ります。

| オプション | 内容 |
| --- | --- |
| `--category <id>` | カテゴリを限定（amenity / appliance / special / furniture） |
| `--group <名前>` | 小分類を限定（例: `--group おしぼり`） |
| `--ids a,b,c` | 商品IDを直接指定 |
| `--limit <数>` | 件数の上限 |
| `--price` | 価格も楽天の実売価格に置き換える |
| `--overwrite` | 取り込み済みの商品も取り直す |
| `--dry` | 書き込まずに結果を表示するだけ |

商品名のままでは目当ての品が出ないときは、④の画面で「検索語」を入れてから実行し直してください。

画像は取り込まなくても、比較表のURL欄から楽天市場の検索ページへ飛べます。
自社で撮影した写真を使う場合は、④の画面の「画像URL」に画像のアドレスを入れてください。

## データの保存

入力内容はブラウザ（localStorage）に自動保存されます。サーバーには何も送信しません。
別のパソコンに引き継ぐときは、商品リストと見積りを CSV で書き出してください。

## 価格について

サンプルの価格は、おしぼり5点（ご提供資料の数値）を除き参考値です。
実際の提案に使う前に、仕入先の見積り金額へ差し替えてください。
