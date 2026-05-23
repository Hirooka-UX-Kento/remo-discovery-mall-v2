import React, { useMemo, useState } from "react";
import { useFeatures } from "../features/FeatureContext.jsx";
import { CATEGORIES, STATUS_META, PRIORITY_META } from "../features/featureData.js";

export default function AdminPanel() {
  const { features, toggle, setEnabled, resetAll } = useFeatures();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [detail, setDetail] = useState(null);
  const backRoute = (() => {
    try { const s = sessionStorage.getItem("rdm_last_app"); return s === null ? "neo" : s; } catch { return "neo"; }
  })();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return features.filter((f) => {
      if (category !== "all" && f.category !== category) return false;
      if (status !== "all" && f.status !== status) return false;
      if (priority !== "all" && f.priority !== priority) return false;
      if (q && !(`${f.name} ${f.key} ${f.description}`.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [features, query, category, status, priority]);

  const grouped = useMemo(() => {
    return CATEGORIES.map((cat) => ({
      category: cat,
      items: filtered.filter((f) => f.category === cat)
    })).filter((g) => g.items.length > 0);
  }, [filtered]);

  const enabledCount = features.filter((f) => f.enabled).length;
  const hwCount = features.filter((f) => f.requiresHardware).length;

  return (
    <div className="rdmAdmin">
      <header className="rdmAdminHead">
        <div>
          <p className="rdmAdminTag">ADMIN / 管理者専用</p>
          <h1>体験機能管理</h1>
          <p className="rdmAdminLede">遠隔探索アプリに表示する機能をON/OFFできます。ONの機能だけがユーザー画面に反映されます。</p>
        </div>
        <a className="rdmAdminBack" href={`#/${backRoute}`}>← アプリへ戻る</a>
      </header>

      <div className="rdmAdminStats">
        <span><b>{features.length}</b> 機能</span>
        <span><b>{enabledCount}</b> 有効</span>
        <span><b>{hwCount}</b> ハード連携(未提供)</span>
      </div>

      <div className="rdmAdminToolbar">
        <input
          className="rdmAdminSearch"
          type="search"
          placeholder="機能名・ID・概要で検索"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">カテゴリ: すべて</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">状態: すべて</option>
          {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="all">優先度: すべて</option>
          {Object.entries(PRIORITY_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <button className="rdmAdminReset" onClick={resetAll}>初期値に戻す</button>
      </div>

      {grouped.length === 0 && <p className="rdmAdminEmpty">該当する機能がありません。</p>}

      {grouped.map((group) => (
        <section className="rdmAdminGroup" key={group.category}>
          <h2>{group.category} <span>{group.items.length}</span></h2>
          <div className="rdmAdminGrid">
            {group.items.map((f) => (
              <article className={"rdmFeatureCard" + (f.enabled ? " on" : "")} key={f.key}>
                <div className="rdmFeatureTop">
                  <span className={"rdmBadge st-" + STATUS_META[f.status].cls}>{STATUS_META[f.status].label}</span>
                  <span className={"rdmBadge pr-" + PRIORITY_META[f.priority].cls}>{PRIORITY_META[f.priority].label}</span>
                </div>
                <h3>{f.name}</h3>
                <code className="rdmFeatureKey">{f.key}</code>
                <p className="rdmFeatureDesc">{f.description}</p>
                {f.requiresHardware && (
                  <p className="rdmFeatureHwNote">⚠ ハード連携が必要なため、ONでもユーザー画面では「準備中」表示になります。</p>
                )}
                <div className="rdmFeatureFoot">
                  <label className="rdmSwitch">
                    <input type="checkbox" checked={f.enabled} onChange={() => toggle(f.key)} />
                    <i />
                    <span>{f.enabled ? "ON" : "OFF"}</span>
                  </label>
                  <button className="rdmFeatureDetailBtn" onClick={() => setDetail(f)}>詳細を見る</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}

      {detail && (
        <DetailModal feature={detail} onClose={() => setDetail(null)} onToggle={() => toggle(detail.key)} onSet={setEnabled} />
      )}
    </div>
  );
}

function DetailModal({ feature: f, onClose, onToggle }) {
  const rows = [
    ["機能ID", f.key],
    ["機能名", f.name],
    ["カテゴリ", f.category],
    ["状態", STATUS_META[f.status].label],
    ["優先度", PRIORITY_META[f.priority].label],
    ["MVP対象", f.priority === "MVP" ? "はい" : "いいえ"],
    ["ハード連携", f.requiresHardware ? "必要" : "不要"],
    ["ユーザー向け表示名", f.userFacingLabel || "—"],
    ["ユーザー向け説明", f.userFacingDescription || "—"],
    ["依存機能", f.dependencies && f.dependencies.length ? f.dependencies.join(", ") : "なし"],
    ["管理者メモ", f.adminNote || "—"],
    ["更新日時", new Date(f.updatedAt).toLocaleString("ja-JP")]
  ];
  return (
    <div className="rdmAdminModalOverlay" onClick={onClose}>
      <div className="rdmAdminModal" onClick={(e) => e.stopPropagation()}>
        <header>
          <div>
            <span className={"rdmBadge st-" + STATUS_META[f.status].cls}>{STATUS_META[f.status].label}</span>
            <h2>{f.name}</h2>
          </div>
          <button onClick={onClose} aria-label="閉じる">×</button>
        </header>
        <p className="rdmAdminModalDesc">{f.description}</p>
        <dl className="rdmAdminModalRows">
          {rows.map(([label, val]) => (
            <div key={label}><dt>{label}</dt><dd>{val}</dd></div>
          ))}
        </dl>
        <footer>
          <label className="rdmSwitch big">
            <input type="checkbox" checked={f.enabled} onChange={onToggle} />
            <i />
            <span>表示 {f.enabled ? "ON" : "OFF"}</span>
          </label>
          <button className="rdmFeatureDetailBtn" onClick={onClose}>閉じる</button>
        </footer>
      </div>
    </div>
  );
}
