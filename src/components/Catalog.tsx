import { useMemo, useState } from 'react';
import type { AppState, CategoryId, Product, Selection } from '../types';
import { CATEGORIES } from '../data/catalog';
import { BASIS_LABEL, calcDemand, calcLine, num, unitPrice, yen, yen1 } from '../lib/calc';

interface Props {
  state: AppState;
  onToggle: (product: Product, on: boolean) => void;
  onSelectionChange: (productId: string, patch: Partial<Selection>) => void;
}

function Thumb({ p }: { p: Product }) {
  if (p.imageUrl) {
    return (
      <div className="thumb">
        <img src={p.imageUrl} alt={p.name} />
      </div>
    );
  }
  return <div className="thumb">{p.group}</div>;
}

export default function Catalog({ state, onToggle, onSelectionChange }: Props) {
  const [cat, setCat] = useState<CategoryId>('amenity');
  const [keyword, setKeyword] = useState('');
  const [onlySelected, setOnlySelected] = useState(false);

  const demand = useMemo(() => calcDemand(state.settings), [state.settings]);

  const selectedCountByCat = useMemo(() => {
    const map: Record<string, number> = {};
    for (const sel of Object.values(state.selections)) {
      const p = state.products.find((x) => x.id === sel.productId);
      if (p && sel.quantity > 0) map[p.category] = (map[p.category] ?? 0) + 1;
    }
    return map;
  }, [state.selections, state.products]);

  const groups = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    const list = state.products.filter((p) => {
      if (p.category !== cat) return false;
      if (onlySelected && !state.selections[p.id]) return false;
      if (!kw) return true;
      return (p.name + p.feature + p.group).toLowerCase().includes(kw);
    });
    const map = new Map<string, Product[]>();
    for (const p of list) {
      const arr = map.get(p.group) ?? [];
      arr.push(p);
      map.set(p.group, arr);
    }
    return [...map.entries()];
  }, [state.products, state.selections, cat, keyword, onlySelected]);

  const activeCat = CATEGORIES.find((c) => c.id === cat)!;

  return (
    <>
      <div className="hint">
        <strong>使いたいものにチェックを入れてください。</strong>
        同じ役割の商品を横並びにしています。価格は入数で割った「1枚あたりいくら」も出しているので、
        まとめ買いのお得さが比べられます。チェックした分だけ、次の「費用シミュレーション」に反映されます。
      </div>

      <div className="cat-tabs">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            className={c.id === cat ? 'active' : ''}
            style={c.id === cat ? { background: c.color } : undefined}
            onClick={() => setCat(c.id)}
          >
            {c.name}
            {selectedCountByCat[c.id] ? <span className="count">{selectedCountByCat[c.id]}</span> : null}
          </button>
        ))}
      </div>

      <div className="card">
        <h2>{activeCat.name}</h2>
        <p className="card__note">{activeCat.note}</p>
        <div className="btn-row" style={{ marginBottom: 8 }}>
          <input
            className="qty-input"
            style={{ width: 220, textAlign: 'left', padding: '6px 10px' }}
            type="search"
            placeholder="商品名で絞り込み"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <label className="switch">
            <input
              type="checkbox"
              checked={onlySelected}
              onChange={(e) => setOnlySelected(e.target.checked)}
            />
            選んだものだけ表示
          </label>
        </div>

        {groups.length === 0 && <div className="empty">該当する商品がありません。</div>}

        {groups.map(([group, items]) => (
          <div className="group-block" key={group}>
            <h3 className="group-title">
              {group}
              <span>
                {items[0].costType === 'consumable'
                  ? `毎月かかる消耗品（${BASIS_LABEL[items[0].consumeBasis ?? 'perStay']}）`
                  : '買い切りの設備（初期費用）'}
              </span>
            </h3>
            <div className="compare-scroll">
              <table className="compare">
                <tbody>
                  <tr className="row-image">
                    <th className="rowhead" />
                    {items.map((p) => (
                      <td key={p.id} className={state.selections[p.id] ? 'selected-col' : ''}>
                        <Thumb p={p} />
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <th className="rowhead">商品名</th>
                    {items.map((p) => (
                      <td key={p.id} className={`name-cell ${state.selections[p.id] ? 'selected-col' : ''}`}>
                        {p.name}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <th className="rowhead">特徴</th>
                    {items.map((p) => (
                      <td key={p.id} className={state.selections[p.id] ? 'selected-col' : ''}>
                        {p.feature || '—'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <th className="rowhead">
                      {items[0].costType === 'consumable' ? '個数' : '耐用の目安'}
                    </th>
                    {items.map((p) => (
                      <td key={p.id} className={state.selections[p.id] ? 'selected-col' : ''}>
                        {p.costType === 'consumable'
                          ? `${num(p.unitCount, 0)}${p.unitLabel}`
                          : `約${Math.round((p.lifespanMonths ?? 60) / 12)}年`}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <th className="rowhead">金額（税込）</th>
                    {items.map((p) => (
                      <td key={p.id} className={state.selections[p.id] ? 'selected-col' : ''}>
                        {yen(p.price)}
                        {p.costType === 'consumable' && p.unitCount > 1 && (
                          <>
                            {' '}
                            <span className="unit-price">
                              （{yen1(unitPrice(p))} / {p.unitLabel}）
                            </span>
                          </>
                        )}
                        <span className="price-note">{p.priceNote ?? '参考値'}</span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <th className="rowhead">URL</th>
                    {items.map((p) => (
                      <td key={p.id} className={state.selections[p.id] ? 'selected-col' : ''}>
                        {p.productUrl ? (
                          <a className="ext" href={p.productUrl} target="_blank" rel="noreferrer">
                            {p.productUrl}
                          </a>
                        ) : (
                          '—'
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <th className="rowhead">選択</th>
                    {items.map((p) => {
                      const sel = state.selections[p.id];
                      return (
                        <td key={p.id} className={sel ? 'selected-col' : ''}>
                          <div className="select-cell">
                            <label className="chk">
                              <input
                                type="checkbox"
                                checked={!!sel}
                                onChange={(e) => onToggle(p, e.target.checked)}
                              />
                              使う
                            </label>
                            {sel && (
                              <>
                                <label className="manual-box">
                                  {p.costType === 'equipment' ? '台数' : 'セット数'}
                                  <input
                                    className="qty-input"
                                    type="number"
                                    min={0}
                                    step={1}
                                    value={String(sel.quantity)}
                                    onChange={(e) =>
                                      onSelectionChange(p.id, { quantity: Number(e.target.value) })
                                    }
                                  />
                                </label>
                                {p.costType === 'consumable' && (
                                  <label className="chk" title="自動計算ではなく自分で数を決める">
                                    <input
                                      type="checkbox"
                                      checked={sel.manual}
                                      onChange={(e) =>
                                        onSelectionChange(p.id, {
                                          manual: e.target.checked,
                                          manualMonthlyUnits: e.target.checked
                                            ? Math.round(
                                                calcLine(p, sel, state.settings, demand).monthlyUnits,
                                              )
                                            : sel.manualMonthlyUnits,
                                        })
                                      }
                                    />
                                    手入力
                                  </label>
                                )}
                                {p.costType === 'consumable' && sel.manual && (
                                  <label className="manual-box">
                                    月間{p.unitLabel}数
                                    <input
                                      className="qty-input"
                                      type="number"
                                      min={0}
                                      value={String(sel.manualMonthlyUnits)}
                                      onChange={(e) =>
                                        onSelectionChange(p.id, {
                                          manualMonthlyUnits: Number(e.target.value),
                                        })
                                      }
                                    />
                                  </label>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <th className="rowhead">
                      {items[0].costType === 'consumable' ? '毎月の費用' : '初期費用'}
                    </th>
                    {items.map((p) => {
                      const sel = state.selections[p.id];
                      if (!sel) {
                        return (
                          <td key={p.id} style={{ color: 'var(--ink-3)' }}>
                            —
                          </td>
                        );
                      }
                      const line = calcLine(p, sel, state.settings, demand);
                      return (
                        <td key={p.id} className="selected-col">
                          <b>
                            {p.costType === 'consumable' ? yen(line.monthlyCost) : yen(line.initialCost)}
                          </b>
                          <span className="price-note">
                            {p.costType === 'consumable'
                              ? `月 約${num(line.monthlyUnits, 0)}${p.unitLabel}`
                              : `積立 ${yen(line.monthlyReserve)}/月`}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
