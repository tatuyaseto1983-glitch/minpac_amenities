import { useMemo } from 'react';
import type { AppState } from '../types';
import { CATEGORIES } from '../data/catalog';
import { calcTotals, num, unitPrice, yen, yen1 } from '../lib/calc';
import { download } from '../lib/csv';

interface Props {
  state: AppState;
}

export default function Simulation({ state }: Props) {
  const t = useMemo(() => calcTotals(state), [state]);
  const catName = (id: string) => CATEGORIES.find((c) => c.id === id)?.name ?? id;
  const catColor = (id: string) => CATEGORIES.find((c) => c.id === id)?.color ?? '#2EA89E';

  const breakdown = [
    { label: '消耗品の購入費', value: t.monthlyConsumable, color: '#2EA89E' },
    { label: '設備の買い替え積立', value: t.monthlyReserve, color: '#E0A45C' },
    { label: 'その他の固定費', value: t.monthlyFixed, color: '#8A7BC8' },
  ];
  const maxMonthly = Math.max(1, ...breakdown.map((b) => b.value));
  const maxInitial = Math.max(1, ...t.byCategory.map((c) => c.initial));

  const exportEstimate = () => {
    const head = [
      'カテゴリ',
      '商品名',
      '区分',
      '数量',
      '単価',
      '月間使用数',
      '初期費用',
      '毎月の費用',
      '買い替え積立(月)',
    ];
    const rows = t.lines.map((l) =>
      [
        catName(l.product.category),
        l.product.name,
        l.product.costType === 'consumable' ? '消耗品' : '設備',
        l.selection.quantity,
        Math.round(unitPrice(l.product) * 10) / 10,
        Math.round(l.monthlyUnits),
        Math.round(l.initialCost),
        Math.round(l.monthlyCost),
        Math.round(l.monthlyReserve),
      ].join(','),
    );
    const summary = [
      '',
      `施設名,${state.settings.facilityName}`,
      `想定稼働率,${state.settings.occupancyRate}%`,
      `月の宿泊組数,${Math.round(t.demand.staysPerMonth * 10) / 10}`,
      `初期費用合計,${Math.round(t.initialTotal)}`,
      `毎月かかる費用,${Math.round(t.monthlyTotal)}`,
      `年間かかる費用,${Math.round(t.yearlyTotal)}`,
      `初年度に必要な現金,${Math.round(t.firstYearCash)}`,
    ];
    download(
      `見積_${state.settings.facilityName || '民泊'}.csv`,
      '﻿' + [head.join(','), ...rows, ...summary].join('\r\n'),
    );
  };

  if (t.lines.length === 0) {
    return (
      <div className="card">
        <h2>費用シミュレーション</h2>
        <div className="empty">
          まだ何も選ばれていません。「カタログ」タブで使いたい商品にチェックを入れてください。
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="hint no-print">
        <strong>結論から見てください。</strong>
        上の4つの数字が答えです。「初年度に必要な現金」は、開業時の買い物と、1年分の消耗品・固定費を足したもの。
        家を買うときの「頭金＋1年分の生活費」にあたる金額です。
      </div>

      <div className="kpi-grid" style={{ marginBottom: 18 }}>
        <div className="kpi">
          <div className="kpi__label">初期費用（買い切り）</div>
          <div className="kpi__value">{yen(t.initialTotal)}</div>
          <div className="kpi__sub">開業時に一度だけ</div>
        </div>
        <div className="kpi">
          <div className="kpi__label">毎月かかる費用</div>
          <div className="kpi__value">{yen(t.monthlyTotal)}</div>
          <div className="kpi__sub">消耗品＋積立＋固定費</div>
        </div>
        <div className="kpi">
          <div className="kpi__label">年間かかる費用</div>
          <div className="kpi__value">{yen(t.yearlyTotal)}</div>
          <div className="kpi__sub">毎月分の12か月合計</div>
        </div>
        <div className="kpi kpi--amber">
          <div className="kpi__label">初年度に必要な現金</div>
          <div className="kpi__value">{yen(t.firstYearCash)}</div>
          <div className="kpi__sub">初期費用＋1年分の運営費</div>
        </div>
      </div>

      <div className="card">
        <h2>毎月かかる費用の内訳</h2>
        <p className="card__note">
          「買い替え積立」は、設備がいつか壊れる分を月々ためておく金額です。今すぐ出ていくお金ではありませんが、
          見込んでおくと数年後に慌てずに済みます。
        </p>
        {breakdown.map((b) => (
          <div className="bar-row" key={b.label}>
            <div>{b.label}</div>
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{ width: `${(b.value / maxMonthly) * 100}%`, background: b.color }}
              />
            </div>
            <div className="bar-val">{yen(b.value)}</div>
          </div>
        ))}
        <div className="pill-row">
          <div className="pill">
            1組あたりの消耗品費 <b>{yen(t.costPerStay)}</b>
          </div>
          <div className="pill">
            月の宿泊組数 <b>{num(t.demand.staysPerMonth)}</b>組
          </div>
          <div className="pill">
            月の延べ宿泊人数 <b>{num(t.demand.guestsPerMonth)}</b>人
          </div>
        </div>
      </div>

      <div className="card">
        <h2>カテゴリ別の初期費用</h2>
        <p className="card__note">どこにお金がかかっているかを確認できます。</p>
        {t.byCategory.filter((c) => c.initial > 0).length === 0 ? (
          <div className="empty">買い切りの設備はまだ選ばれていません。</div>
        ) : (
          t.byCategory
            .filter((c) => c.initial > 0)
            .sort((a, b) => b.initial - a.initial)
            .map((c) => (
              <div className="bar-row" key={c.category}>
                <div>{catName(c.category)}</div>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{ width: `${(c.initial / maxInitial) * 100}%`, background: catColor(c.category) }}
                  />
                </div>
                <div className="bar-val">{yen(c.initial)}</div>
              </div>
            ))
        )}
      </div>

      <div className="card">
        <h2>選んだ商品の明細</h2>
        <div className="btn-row no-print" style={{ marginBottom: 10 }}>
          <button className="btn" onClick={exportEstimate}>
            見積りをCSVで書き出す
          </button>
          <button className="btn" onClick={() => window.print()}>
            印刷 / PDF保存
          </button>
        </div>
        <div className="tbl-scroll">
          <table className="detail">
            <thead>
              <tr>
                <th>カテゴリ</th>
                <th>商品名</th>
                <th>区分</th>
                <th>数量</th>
                <th>単価</th>
                <th>月間使用数</th>
                <th>初期費用</th>
                <th>毎月の費用</th>
                <th>積立(月)</th>
              </tr>
            </thead>
            <tbody>
              {t.lines
                .slice()
                .sort((a, b) => a.product.category.localeCompare(b.product.category))
                .map((l) => (
                  <tr key={l.product.id}>
                    <td>
                      <span className="tag" style={{ background: catColor(l.product.category) }}>
                        {catName(l.product.category)}
                      </span>
                    </td>
                    <td>
                      {l.product.name}
                      {l.selection.manual && (
                        <span className="price-note">手入力で上書き中</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'left' }}>
                      {l.product.costType === 'consumable' ? '消耗品' : '設備'}
                    </td>
                    <td>{l.selection.quantity}</td>
                    <td>
                      {yen1(unitPrice(l.product))}
                      <span className="price-note">/{l.product.unitLabel}</span>
                    </td>
                    <td>
                      {l.product.costType === 'consumable'
                        ? `${num(l.monthlyUnits, 0)}${l.product.unitLabel}`
                        : '—'}
                    </td>
                    <td>{l.initialCost ? yen(l.initialCost) : '—'}</td>
                    <td>{l.monthlyCost ? yen(l.monthlyCost) : '—'}</td>
                    <td>{l.monthlyReserve ? yen(l.monthlyReserve) : '—'}</td>
                  </tr>
                ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={6} style={{ textAlign: 'right' }}>
                  合計
                </td>
                <td>{yen(t.initialTotal)}</td>
                <td>{yen(t.monthlyConsumable)}</td>
                <td>{yen(t.monthlyReserve)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <p className="footer-note">
          金額はサンプルの参考値を含みます。実際の発注前に、仕入先の見積りで必ず確認してください。
        </p>
      </div>
    </>
  );
}
