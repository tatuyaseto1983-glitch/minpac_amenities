import { useMemo, useRef, useState } from 'react';
import type { CategoryId, Product } from '../types';
import { CATEGORIES } from '../data/catalog';
import { csvToProducts, download, productsToCsv } from '../lib/csv';
import { unitPrice, yen1 } from '../lib/calc';

interface Props {
  products: Product[];
  onChange: (id: string, patch: Partial<Product>) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onReplaceAll: (products: Product[]) => void;
  onAppend: (products: Product[]) => void;
  onResetSample: () => void;
}

const BASIS_OPTIONS: { value: string; label: string }[] = [
  { value: 'perGuest', label: '1人あたり' },
  { value: 'perStay', label: '1組あたり' },
  { value: 'perRoom', label: '1部屋あたり/月' },
  { value: 'perMonth', label: '施設全体/月' },
];

export default function ProductAdmin({
  products,
  onChange,
  onAdd,
  onRemove,
  onReplaceAll,
  onAppend,
  onResetSample,
}: Props) {
  const [cat, setCat] = useState<CategoryId | 'all'>('all');
  const [message, setMessage] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');

  const list = useMemo(
    () => (cat === 'all' ? products : products.filter((p) => p.category === cat)),
    [products, cat],
  );

  const handleFile = async (file: File) => {
    const text = await file.text();
    const { products: parsed, errors } = csvToProducts(text);
    if (parsed.length === 0) {
      setMessage('読み込めませんでした。' + errors.join(' '));
      return;
    }
    if (importMode === 'replace') onReplaceAll(parsed);
    else onAppend(parsed);
    setMessage(
      `${parsed.length}件を読み込みました。${errors.length ? '（' + errors.length + '件は読み飛ばし）' : ''}`,
    );
  };

  return (
    <>
      <div className="hint">
        <strong>商品はここで自由に足せます。</strong>
        取引先からもらった見積りの金額に書き換えれば、シミュレーションもその金額で計算し直します。
        CSVで書き出して社内で共有し、直したものを読み込む使い方もできます。
      </div>

      <div className="card">
        <h2>商品リストの管理</h2>
        <p className="card__note">
          「区分」を消耗品にすると毎月の費用、設備にすると初期費用として計算されます。
        </p>
        <div className="btn-row" style={{ marginBottom: 12 }}>
          <button className="btn btn--primary" onClick={onAdd}>
            ＋ 商品を追加
          </button>
          <button className="btn" onClick={() => download('商品リスト.csv', productsToCsv(products))}>
            CSVで書き出す
          </button>
          <select
            className="btn"
            value={importMode}
            onChange={(e) => setImportMode(e.target.value as 'append' | 'replace')}
          >
            <option value="append">読み込み方法：今のリストに追加</option>
            <option value="replace">読み込み方法：今のリストを置き換え</option>
          </select>
          <button className="btn" onClick={() => fileRef.current?.click()}>
            CSVを読み込む
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            style={{ display: 'none' }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleFile(f);
              e.target.value = '';
            }}
          />
          <button
            className="btn btn--danger"
            onClick={() => {
              if (confirm('サンプルの商品リストに戻します。追加・編集した内容は消えます。よろしいですか？'))
                onResetSample();
            }}
          >
            サンプルに戻す
          </button>
        </div>
        {message && <p className="footer-note">{message}</p>}

        <div className="cat-tabs">
          <button className={cat === 'all' ? 'active' : ''} style={cat === 'all' ? { background: '#4A5A61' } : undefined} onClick={() => setCat('all')}>
            すべて（{products.length}）
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              className={cat === c.id ? 'active' : ''}
              style={cat === c.id ? { background: c.color } : undefined}
              onClick={() => setCat(c.id)}
            >
              {c.name}（{products.filter((p) => p.category === c.id).length}）
            </button>
          ))}
        </div>

        <div className="tbl-scroll">
          <table className="admin">
            <thead>
              <tr>
                <th style={{ minWidth: 120 }}>カテゴリ</th>
                <th style={{ minWidth: 110 }}>小分類</th>
                <th style={{ minWidth: 190 }}>商品名</th>
                <th style={{ minWidth: 120 }}>特徴</th>
                <th style={{ minWidth: 90 }}>区分</th>
                <th style={{ minWidth: 80 }}>入数</th>
                <th style={{ minWidth: 64 }}>単位</th>
                <th style={{ minWidth: 96 }}>価格(税込)</th>
                <th style={{ minWidth: 130 }}>使い方 / 耐用</th>
                <th style={{ minWidth: 80 }}>使用量</th>
                <th style={{ minWidth: 90 }}>単価</th>
                <th style={{ minWidth: 160 }}>URL</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {list.map((p) => (
                <tr key={p.id}>
                  <td>
                    <select
                      value={p.category}
                      onChange={(e) => onChange(p.id, { category: e.target.value as CategoryId })}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input value={p.group} onChange={(e) => onChange(p.id, { group: e.target.value })} />
                  </td>
                  <td>
                    <input value={p.name} onChange={(e) => onChange(p.id, { name: e.target.value })} />
                  </td>
                  <td>
                    <input value={p.feature} onChange={(e) => onChange(p.id, { feature: e.target.value })} />
                  </td>
                  <td>
                    <select
                      value={p.costType}
                      onChange={(e) =>
                        onChange(p.id, {
                          costType: e.target.value as Product['costType'],
                          consumeBasis: e.target.value === 'consumable' ? (p.consumeBasis ?? 'perStay') : undefined,
                          consumeQty: e.target.value === 'consumable' ? (p.consumeQty ?? 1) : undefined,
                          lifespanMonths: e.target.value === 'equipment' ? (p.lifespanMonths ?? 60) : undefined,
                        })
                      }
                    >
                      <option value="consumable">消耗品</option>
                      <option value="equipment">設備</option>
                    </select>
                  </td>
                  <td className="num">
                    <input
                      type="number"
                      min={1}
                      value={String(p.unitCount)}
                      onChange={(e) => onChange(p.id, { unitCount: Number(e.target.value) || 1 })}
                    />
                  </td>
                  <td>
                    <input value={p.unitLabel} onChange={(e) => onChange(p.id, { unitLabel: e.target.value })} />
                  </td>
                  <td className="num">
                    <input
                      type="number"
                      min={0}
                      value={String(p.price)}
                      onChange={(e) => onChange(p.id, { price: Number(e.target.value) || 0 })}
                    />
                  </td>
                  <td>
                    {p.costType === 'consumable' ? (
                      <select
                        value={p.consumeBasis ?? 'perStay'}
                        onChange={(e) =>
                          onChange(p.id, { consumeBasis: e.target.value as Product['consumeBasis'] })
                        }
                      >
                        {BASIS_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="number"
                        min={1}
                        value={String(p.lifespanMonths ?? 60)}
                        onChange={(e) => onChange(p.id, { lifespanMonths: Number(e.target.value) || 60 })}
                        title="何か月使えるか"
                      />
                    )}
                  </td>
                  <td className="num">
                    {p.costType === 'consumable' ? (
                      <input
                        type="number"
                        min={0}
                        step={0.1}
                        value={String(p.consumeQty ?? 1)}
                        onChange={(e) => onChange(p.id, { consumeQty: Number(e.target.value) })}
                      />
                    ) : (
                      '—'
                    )}
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>{yen1(unitPrice(p))}</td>
                  <td>
                    <input
                      value={p.productUrl ?? ''}
                      placeholder="https://"
                      onChange={(e) => onChange(p.id, { productUrl: e.target.value })}
                    />
                  </td>
                  <td>
                    <button className="btn btn--sm btn--danger" onClick={() => onRemove(p.id)}>
                      削除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="footer-note">
          「使用量」は、消耗品が1回（1人・1組など）でどれだけ減るかの数です。例：歯ブラシは1人1本なので「1」。
        </p>
      </div>
    </>
  );
}
