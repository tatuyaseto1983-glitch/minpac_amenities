import type { FacilitySettings, FixedCost } from '../types';
import { calcDemand, num, yen } from '../lib/calc';

interface Props {
  settings: FacilitySettings;
  fixedCosts: FixedCost[];
  onChange: (patch: Partial<FacilitySettings>) => void;
  onFixedChange: (id: string, patch: Partial<FixedCost>) => void;
  onFixedAdd: () => void;
  onFixedRemove: (id: string) => void;
}

export default function SettingsPanel({
  settings,
  fixedCosts,
  onChange,
  onFixedChange,
  onFixedAdd,
  onFixedRemove,
}: Props) {
  const d = calcDemand(settings);
  const numberField = (
    label: string,
    key: keyof FacilitySettings,
    hint: string,
    step = 1,
    min = 0,
  ) => (
    <div className="field">
      <label htmlFor={key}>{label}</label>
      <input
        id={key}
        type="number"
        step={step}
        min={min}
        value={String(settings[key] as number)}
        onChange={(e) => onChange({ [key]: Number(e.target.value) } as Partial<FacilitySettings>)}
      />
      <small>{hint}</small>
    </div>
  );

  return (
    <>
      <div className="hint">
        <strong>まずここを埋めてください。</strong>
        ここで入れた条件をもとに、消耗品が毎月どれだけ減るかを自動で計算します。
        車でいえば「毎月どれくらい走るか」を決める部分で、走る距離が決まればガソリン代が見えるのと同じ考え方です。
      </div>

      <div className="card">
        <h2>施設の条件</h2>
        <p className="card__note">わからない項目は、まずは初期値のままで大丈夫です。あとから何度でも変えられます。</p>
        <div className="grid grid--4">
          <div className="field">
            <label htmlFor="facilityName">施設名</label>
            <input
              id="facilityName"
              type="text"
              value={settings.facilityName}
              onChange={(e) => onChange({ facilityName: e.target.value })}
            />
            <small>見積書の見出しに使います</small>
          </div>
          {numberField('部屋数', 'rooms', '一棟貸しなら「1」で構いません')}
          {numberField('最大定員（人）', 'capacity', '募集ページに載せる人数')}
          {numberField('想定稼働率（%）', 'occupancyRate', '1か月のうち何日埋まるかの割合')}
          {numberField('平均宿泊日数（泊）', 'avgStayNights', '1組がだいたい何泊するか', 0.5, 0.5)}
          {numberField('1組の平均人数（人）', 'avgGuestsPerStay', '歯ブラシなどの必要数に効きます', 0.5, 0.5)}
          <div className="field">
            <label>発注ロットの扱い</label>
            <label className="switch" style={{ marginTop: 4 }}>
              <input
                type="checkbox"
                checked={settings.roundToLot}
                onChange={(e) => onChange({ roundToLot: e.target.checked })}
              />
              箱単位で切り上げる
            </label>
            <small>実際の仕入れに近い金額になります</small>
          </div>
        </div>

        <div className="pill-row">
          <div className="pill">
            月の稼働日数 <b>{num(d.occupiedNights)}</b>泊
          </div>
          <div className="pill">
            月の宿泊組数 <b>{num(d.staysPerMonth)}</b>組
          </div>
          <div className="pill">
            月の延べ宿泊人数 <b>{num(d.guestsPerMonth)}</b>人
          </div>
        </div>
      </div>

      <div className="card">
        <h2>その他の毎月かかる費用</h2>
        <p className="card__note">
          清掃の外注費や水道光熱費など、備品以外で毎月出ていくお金があれば入れてください。空欄（0円）のままでも構いません。
        </p>
        <div className="grid grid--2">
          {fixedCosts.map((f) => (
            <div key={f.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <div className="field" style={{ flex: 2 }}>
                <label>項目名</label>
                <input
                  type="text"
                  value={f.name}
                  onChange={(e) => onFixedChange(f.id, { name: e.target.value })}
                />
              </div>
              <div className="field" style={{ flex: 1 }}>
                <label>月額（円）</label>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  value={String(f.monthlyAmount)}
                  onChange={(e) => onFixedChange(f.id, { monthlyAmount: Number(e.target.value) })}
                />
              </div>
              <button
                className="btn btn--sm btn--danger"
                onClick={() => onFixedRemove(f.id)}
                title="この行を削除"
              >
                削除
              </button>
            </div>
          ))}
        </div>
        <div className="btn-row" style={{ marginTop: 12 }}>
          <button className="btn" onClick={onFixedAdd}>
            ＋ 項目を追加
          </button>
          <span className="footer-note">
            合計 {yen(fixedCosts.reduce((a, f) => a + (f.monthlyAmount || 0), 0))} / 月
          </span>
        </div>
      </div>
    </>
  );
}
