import { useEffect, useMemo, useState } from 'react';
import type { AppState, FacilitySettings, FixedCost, Product, Selection } from './types';
import { SAMPLE_PRODUCTS } from './data/catalog';
import { calcTotals, yen } from './lib/calc';
import { initialState, loadState, saveState } from './lib/storage';
import SettingsPanel from './components/SettingsPanel';
import Catalog from './components/Catalog';
import Simulation from './components/Simulation';
import ProductAdmin from './components/ProductAdmin';

type TabId = 'settings' | 'catalog' | 'simulation' | 'admin';

const TABS: { id: TabId; label: string }[] = [
  { id: 'settings', label: '① 施設の条件' },
  { id: 'catalog', label: '② カタログで選ぶ' },
  { id: 'simulation', label: '③ 費用シミュレーション' },
  { id: 'admin', label: '④ 商品リストの管理' },
];

export default function App() {
  const [tab, setTab] = useState<TabId>('settings');
  const [state, setState] = useState<AppState>(() => loadState());

  useEffect(() => {
    saveState(state);
  }, [state]);

  const totals = useMemo(() => calcTotals(state), [state]);

  const patchSettings = (patch: Partial<FacilitySettings>) =>
    setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));

  const toggleSelection = (product: Product, on: boolean) =>
    setState((s) => {
      const next = { ...s.selections };
      if (on) {
        next[product.id] = {
          productId: product.id,
          quantity: 1,
          manual: false,
          manualMonthlyUnits: 0,
        };
      } else {
        delete next[product.id];
      }
      return { ...s, selections: next };
    });

  const patchSelection = (productId: string, patch: Partial<Selection>) =>
    setState((s) => {
      const cur = s.selections[productId];
      if (!cur) return s;
      return { ...s, selections: { ...s.selections, [productId]: { ...cur, ...patch } } };
    });

  const patchProduct = (id: string, patch: Partial<Product>) =>
    setState((s) => ({
      ...s,
      products: s.products.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));

  const addProduct = () =>
    setState((s) => ({
      ...s,
      products: [
        {
          id: `custom-${Date.now()}`,
          category: 'amenity',
          group: 'その他',
          name: '新しい商品',
          feature: '',
          unitCount: 1,
          unitLabel: '個',
          price: 0,
          costType: 'consumable',
          consumeBasis: 'perStay',
          consumeQty: 1,
          priceNote: '自社入力',
          custom: true,
        },
        ...s.products,
      ],
    }));

  const removeProduct = (id: string) =>
    setState((s) => {
      const selections = { ...s.selections };
      delete selections[id];
      return { ...s, products: s.products.filter((p) => p.id !== id), selections };
    });

  const replaceProducts = (products: Product[]) =>
    setState((s) => ({ ...s, products, selections: {} }));

  const appendProducts = (products: Product[]) =>
    setState((s) => {
      const ids = new Set(s.products.map((p) => p.id));
      const add = products.map((p) => (ids.has(p.id) ? { ...p, id: `${p.id}-dup${Date.now()}` } : p));
      return { ...s, products: [...add, ...s.products] };
    });

  const resetSample = () =>
    setState((s) => ({ ...s, products: SAMPLE_PRODUCTS.map((p) => ({ ...p })), selections: {} }));

  const patchFixed = (id: string, patch: Partial<FixedCost>) =>
    setState((s) => ({
      ...s,
      fixedCosts: s.fixedCosts.map((f) => (f.id === id ? { ...f, ...patch } : f)),
    }));

  const addFixed = () =>
    setState((s) => ({
      ...s,
      fixedCosts: [...s.fixedCosts, { id: `fc-${Date.now()}`, name: '新しい項目', monthlyAmount: 0 }],
    }));

  const removeFixed = (id: string) =>
    setState((s) => ({ ...s, fixedCosts: s.fixedCosts.filter((f) => f.id !== id) }));

  const resetAll = () => {
    if (confirm('入力内容をすべて初期状態に戻します。よろしいですか？')) setState(initialState());
  };

  return (
    <>
      <header className="app-header">
        <div className="app-header__row">
          <h1>民泊 備品・アメニティ 費用シミュレーター</h1>
          <span className="app-header__sub">選ぶだけで初期費用と毎月・年間の費用がわかります</span>
          <span className="app-header__facility">
            {state.settings.facilityName}／毎月 {yen(totals.monthlyTotal)}
          </span>
        </div>
        <nav className="tabs">
          {TABS.map((t) => (
            <button key={t.id} className={tab === t.id ? 'active' : ''} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main>
        {tab === 'settings' && (
          <SettingsPanel
            settings={state.settings}
            fixedCosts={state.fixedCosts}
            onChange={patchSettings}
            onFixedChange={patchFixed}
            onFixedAdd={addFixed}
            onFixedRemove={removeFixed}
          />
        )}
        {tab === 'catalog' && (
          <Catalog state={state} onToggle={toggleSelection} onSelectionChange={patchSelection} />
        )}
        {tab === 'simulation' && <Simulation state={state} />}
        {tab === 'admin' && (
          <ProductAdmin
            products={state.products}
            onChange={patchProduct}
            onAdd={addProduct}
            onRemove={removeProduct}
            onReplaceAll={replaceProducts}
            onAppend={appendProducts}
            onResetSample={resetSample}
          />
        )}

        <div className="btn-row no-print" style={{ marginTop: 24 }}>
          <button className="btn btn--ghost btn--sm btn--danger" onClick={resetAll}>
            すべて初期状態に戻す
          </button>
          <span className="footer-note">
            入力内容はこのブラウザに自動保存されます。別のパソコンには引き継がれません。
          </span>
        </div>
      </main>
    </>
  );
}
