import { useRef, useState } from 'react';
import type { CategoryId, Product } from '../types';
import { findProduct } from '../lib/rakuten';
import { CATEGORIES } from '../data/catalog';

const KEY = 'minpaku-amenities:rakuten';
/** 楽天APIは1秒1リクエストまで */
const INTERVAL_MS = 1100;

interface Credentials {
  appId: string;
  accessKey: string;
}

function loadCredentials(): Credentials {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { appId: '', accessKey: '', ...JSON.parse(raw) };
  } catch {
    /* 読めなくても空欄で始める */
  }
  return { appId: '', accessKey: '' };
}

type Scope = 'missing' | 'all';

interface Props {
  products: Product[];
  /** 今表示しているカテゴリ。'all' なら全部 */
  category: CategoryId | 'all';
  onChange: (id: string, patch: Partial<Product>) => void;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function RakutenImport({ products, category, onChange }: Props) {
  const [cred, setCred] = useState<Credentials>(loadCredentials);
  const [showKey, setShowKey] = useState(false);
  const [scope, setScope] = useState<Scope>('missing');
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(0);
  const [total, setTotal] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const stopRef = useRef(false);

  const save = (next: Credentials) => {
    setCred(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* 保存できなくてもその場では使える */
    }
  };

  const targets = products.filter((p) => {
    if (category !== 'all' && p.category !== category) return false;
    return scope === 'all' || !p.productUrl;
  });

  const run = async () => {
    stopRef.current = false;
    setRunning(true);
    setDone(0);
    setTotal(targets.length);
    setLog([]);
    let hit = 0;

    for (const [i, p] of targets.entries()) {
      if (stopRef.current) break;
      try {
        const found = await findProduct(p, cred.appId.trim(), cred.accessKey.trim());
        if (found) {
          onChange(p.id, {
            productUrl: found.productUrl,
            imageUrl: found.imageUrl,
            matchedName: found.name,
          });
          hit++;
          setLog((l) => [`${p.name} → ${found.name.slice(0, 26)}…`, ...l].slice(0, 8));
        } else {
          setLog((l) => [`${p.name} → 見つかりませんでした`, ...l].slice(0, 8));
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setLog((l) => [`${p.name} → 失敗（${msg}）`, ...l].slice(0, 8));
        if (msg.includes('403')) {
          setLog((l) => ['IPが許可されていません。楽天の管理画面で登録し直してください。', ...l]);
          break;
        }
        if (msg.includes('400') || msg.includes('401')) {
          setLog((l) => ['IDまたはAccess Keyが違うようです。', ...l]);
          break;
        }
      }
      setDone(i + 1);
      if (i < targets.length - 1) await sleep(INTERVAL_MS);
    }

    setRunning(false);
    setLog((l) => [`完了：${hit}件に商品ページと画像を設定しました。`, ...l]);
  };

  const ready = cred.appId.trim() !== '' && cred.accessKey.trim() !== '';

  return (
    <div className="card">
      <h2>楽天市場から商品ページと画像を取り込む</h2>
      <p className="card__note">
        商品名で楽天市場を検索して、商品ページのURLと写真を自動で入れます。
        1件あたり約1秒かかります。価格はこちらで設定した参考値のままにしています
        （入数がこちらの想定と違うことがあるためです）。
      </p>

      <div className="grid grid--3" style={{ marginBottom: 12 }}>
        <div className="field">
          <label htmlFor="rk-app">Application ID</label>
          <input
            id="rk-app"
            type="text"
            value={cred.appId}
            placeholder="楽天の管理画面からコピー"
            onChange={(e) => save({ ...cred, appId: e.target.value })}
          />
          <small>楽天ウェブサービスのアプリ詳細画面に出ています</small>
        </div>
        <div className="field">
          <label htmlFor="rk-key">Access Key</label>
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              id="rk-key"
              type={showKey ? 'text' : 'password'}
              value={cred.accessKey}
              placeholder="pk_…"
              onChange={(e) => save({ ...cred, accessKey: e.target.value })}
            />
            <button className="btn btn--sm" onClick={() => setShowKey((v) => !v)}>
              {showKey ? '隠す' : '表示'}
            </button>
          </div>
          <small>このパソコンにだけ保存されます</small>
        </div>
        <div className="field">
          <label htmlFor="rk-scope">取り込む範囲</label>
          <select
            id="rk-scope"
            value={scope}
            onChange={(e) => setScope(e.target.value as Scope)}
          >
            <option value="missing">商品ページがまだない商品だけ</option>
            <option value="all">すべて取り直す（今の内容を上書き）</option>
          </select>
          <small>
            対象 {targets.length}件（
            {category === 'all'
              ? 'すべてのカテゴリ'
              : (CATEGORIES.find((c) => c.id === category)?.name ?? '')}
            ）
          </small>
        </div>
      </div>

      <div className="btn-row">
        <button className="btn btn--amber" onClick={run} disabled={!ready || running || targets.length === 0}>
          {running ? `取り込み中… ${done} / ${total}` : `楽天から取り込む（${targets.length}件）`}
        </button>
        {running && (
          <button className="btn" onClick={() => (stopRef.current = true)}>
            中止する
          </button>
        )}
        {!ready && <span className="footer-note">IDとAccess Keyを入れると実行できます</span>}
      </div>

      {running && (
        <div className="bar-track" style={{ marginTop: 12 }}>
          <div
            className="bar-fill"
            style={{ width: `${total ? (done / total) * 100 : 0}%`, background: 'var(--amber)' }}
          />
        </div>
      )}

      {log.length > 0 && (
        <ul className="import-log">
          {log.map((line, i) => (
            <li key={`${i}-${line}`}>{line}</li>
          ))}
        </ul>
      )}

      <p className="footer-note">
        取り込んだ結果は「実物」として比較表に表示されます。想定と違う商品が当たった場合は、
        下の表で「検索語」を入れ直して取り直すか、URLと画像を直接書き換えてください。
      </p>
    </div>
  );
}
