import React, { useEffect, useMemo, useRef, useState } from "react";
import "./neo.css";
import { useGame } from "./game.jsx";
import { useFeatures } from "./features/FeatureContext.jsx";
import {
  STORES, STORE_LINKS, storeById, neighborsOf, PRODUCTS, NODES, nodeById, HEADINGS,
  LEADERBOARD, SUGOROKU, RARES, rareByStore, EXPLORE_URL, TRANSFER_IMAGE, TONES, local
} from "./data.js";

const T = {
  ja: {
    eyebrow: "新感覚リモートEC · ANIME GOODS", sub: "全国のアニメグッズ店舗を、自宅から自由に“回って”買える新感覚のEC。ロボットを遠隔操作して店内を探索しよう。",
    map: "MAP", sugoroku: "すごろく", collection: "図鑑", openStore: "店舗を見る", back: "← 地図へ", twin: "ツインスキャン",
    recommended: "おすすめ", limited: "限定", popular: "人気", request: "購入リクエスト", reqEmpty: "リクエストはまだありません",
    possessTitle: "ロボットに憑依（DIVE）", price: "¥1,500 / 10分", possess: "⚡ DIVEして探索（外部Grid）",
    trial: "お試しDIVE（無料・アプリ内）", merit1: "EC非掲載の限定棚に出会える", merit2: "他Hunterの探索ログ", merit3: "スタッフ確認の購入リクエスト",
    sync: "GRID 同期中", scan: "棚QRをスキャン", scanned: "スキャン済み", forward: "前進", left: "左45°", right: "右45°", exit: "DIVE終了",
    floor: "店内MAP", shelf: "棚", stock: "在庫", treasure: "レアをさがす", missions: "クエスト", leaderboard: "Hunterランキング", you: "YOU",
    claim: "受取", claimed: "受取済", cart: "カート", total: "合計", checkout: "購入を確定", empty: "カートは空です",
    roll: "サイコロを振る", warpTo: "隣接店舗へ移動", rank: "ランク", hp: "ENERGY",
    collTitle: "コレクション図鑑", complete: "コンプ率", undiscovered: "未発見", hintAt: "取扱店舗", getRare: "GET!",
    fwd: "前進", back: "後退", turnL: "左を向く", turnR: "右を向く", tiltUp: "上を見る", tiltDn: "下を見る",
    up: "上昇", down: "下降", move: "移動", look: "視点", lift: "昇降", toStore: "店舗へ移動"
  },
  en: {
    eyebrow: "A NEW KIND OF REMOTE EC · ANIME GOODS", sub: "A new kind of EC: remotely visit anime-goods stores across Japan and shop from home. Pilot a robot to explore each store.",
    map: "MAP", sugoroku: "Sugoroku", collection: "Collection", openStore: "View store", back: "← Map", twin: "Twin scan",
    recommended: "Recommended", limited: "Limited", popular: "Popular", request: "Purchase request", reqEmpty: "No requests yet",
    possessTitle: "DIVE into the robot", price: "¥1,500 / 10min", possess: "⚡ DIVE & explore (external Grid)",
    trial: "Free DIVE (in-app)", merit1: "Hidden shelves not on normal EC", merit2: "Other Hunters' traces", merit3: "Staff-confirmed requests",
    sync: "GRID SYNC", scan: "Scan shelf QR", scanned: "Scanned", forward: "Forward", left: "Turn L", right: "Turn R", exit: "End DIVE",
    floor: "Floor map", shelf: "Shelf", stock: "Stock", treasure: "Hunt rares", missions: "Quests", leaderboard: "Hunter ranking", you: "YOU",
    claim: "Claim", claimed: "Claimed", cart: "Cart", total: "Total", checkout: "Checkout", empty: "Your cart is empty",
    roll: "Roll dice", warpTo: "Move to store", rank: "Rank", hp: "ENERGY",
    collTitle: "Collection", complete: "Complete", undiscovered: "Undiscovered", hintAt: "Sold at", getRare: "GET!",
    fwd: "Fwd", back: "Back", turnL: "Look L", turnR: "Look R", tiltUp: "Tilt up", tiltDn: "Tilt down",
    up: "Up", down: "Down", move: "Move", look: "View", lift: "Lift", toStore: "Move to store"
  }
};

export default function NeoApp() {
  const g = useGame();
  const { isFunctional, get } = useFeatures();
  const lang = g.lang;
  const t = T[lang];

  const f = {
    theme: isFunctional("custom_theme"),
    rank: isFunctional("user_rank_system"),
    missions: isFunctional("mission_system"),
    ranking: isFunctional("ranking_system"),
    treasure: isFunctional("treasure_random_event"),
    twin: isFunctional("digital_twin_overlay"),
    ar: isFunctional("ar_info_overlay"),
    trial: isFunctional("free_trial_area"),
    openWorld: isFunctional("anime_goods_open_world") || isFunctional("open_world_city_theme"),
    sugoroku: isFunctional("sugoroku_warp_exploration") || isFunctional("sugoroku_world_theme"),
    collection: isFunctional("collection_book"),
    loginBonus: isFunctional("login_bonus"),
    guild: isFunctional("guild"),
    paidUpgrade: isFunctional("paid_upgrade")
  };

  const [screen, setScreen] = useState("home");
  const [store, setStore] = useState(STORES[0]);
  const [product, setProduct] = useState(PRODUCTS[0]);
  const [possessMode, setPossessMode] = useState("external");
  const [cartOpen, setCartOpen] = useState(false);
  const [welcome, setWelcome] = useState(false);
  const [tutorial, setTutorial] = useState(false);
  const [reqlog, setReqlog] = useState([]);

  useEffect(() => {
    try { if (!localStorage.getItem("rdm_tut_done")) setTutorial(true); } catch { /* ignore */ }
  }, []);
  function closeTutorial() { setTutorial(false); try { localStorage.setItem("rdm_tut_done", "1"); } catch { /* ignore */ } }

  // explore state
  const [nodeId, setNodeId] = useState("entrance");
  const [heading, setHeading] = useState(0);
  const [hp, setHp] = useState(78);
  const node = nodeById(nodeId);

  useEffect(() => {
    if (screen !== "sync") return undefined;
    const id = setTimeout(() => {
      if (possessMode === "trial") setScreen("explore");
      else window.location.href = EXPLORE_URL;
    }, 2200);
    return () => clearTimeout(id);
  }, [screen, possessMode]);

  useEffect(() => {
    if (screen === "explore" && hp <= 0) setScreen("shop");
  }, [hp, screen]);

  function openStore(s) {
    setStore(s); setProduct(PRODUCTS[0]); setScreen("shop");
    try { if (!sessionStorage.getItem("rdm_welcomed")) { sessionStorage.setItem("rdm_welcomed", "1"); setWelcome(true); } } catch { /* ignore */ }
  }
  function startTrial() { setPossessMode("trial"); setHp(78); setNodeId("entrance"); setHeading(0); setScreen("sync"); }
  function startPossess() { setPossessMode("external"); setScreen("sync"); }
  function request(p) { g.requestPurchase(p); setReqlog((l) => [`${local(p.name, lang)} · ${t.request}`, ...l].slice(0, 4)); }
  function moveTo(id) { setNodeId(id); setHp((v) => Math.max(0, v - 13)); g.move(); const n = nodeById(id); const fp = n.products.map((x) => PRODUCTS.find((p) => p.id === x))[0]; if (fp) setProduct(fp); }
  function scan(p) { setProduct(p); g.scan(p); }
  function warpStore(id) { const s = storeById(id); if (!s) return; setStore(s); setNodeId("entrance"); setProduct(PRODUCTS[0]); setHp((v) => Math.max(20, v - 6)); g.warp(); g.toast(local({ ja: `${s.name} ツインへワープ`, en: `Warped to ${s.name}` }, lang), "ok"); }

  const tone = g.tone;
  const themeClass = `neo tone-${f.theme ? tone : "cyber"}`;

  const header = (
    <Header t={t} g={g} f={f} onCart={() => setCartOpen(true)} onTutorial={() => setTutorial(true)} />
  );

  let body;
  if (screen === "sync") {
    return (
      <div className={themeClass}>
        <Sync t={t} store={store} />
        <Toasts toasts={g.toasts} />
      </div>
    );
  }
  if (screen === "explore") {
    return (
      <div className={themeClass}>
        <Explore t={t} lang={lang} g={g} f={f} store={store} node={node} hp={hp}
          product={product} onScan={scan} onMove={moveTo}
          onRequest={request} onExit={() => setScreen("shop")} onWarp={warpStore}
          onUpgrade={() => { window.location.href = EXPLORE_URL; }} />
        <Toasts toasts={g.toasts} />
      </div>
    );
  }
  if (screen === "sugoroku") {
    body = <Sugoroku t={t} lang={lang} g={g} onBack={() => setScreen("home")} />;
  } else if (screen === "collection") {
    body = <Collection t={t} lang={lang} g={g} onBack={() => setScreen("home")} onGoStore={openStore} />;
  } else if (screen === "shop") {
    body = <Shop t={t} lang={lang} g={g} f={f} store={store} product={product} reqlog={reqlog}
      onBack={() => setScreen("home")} onProduct={setProduct} onRequest={request} onPossess={startPossess} onTrial={startTrial} />;
  } else {
    body = <Home t={t} lang={lang} g={g} f={f} store={store} setStore={setStore} onOpenStore={openStore}
      onSugoroku={() => setScreen("sugoroku")} onCollection={() => setScreen("collection")} />;
  }

  return (
    <div className={themeClass}>
      {header}
      {body}
      {cartOpen && <Cart t={t} lang={lang} g={g} onClose={() => setCartOpen(false)} />}
      {welcome && (
        <WelcomeModal t={t} lang={lang} g={g} f={f} store={store}
          onClose={() => setWelcome(false)}
          onPossess={() => { setWelcome(false); startPossess(); }}
          onTrial={() => { setWelcome(false); startTrial(); }} />
      )}
      {tutorial && <TutorialModal t={t} lang={lang} f={f} onClose={closeTutorial} />}
      <Toasts toasts={g.toasts} />
    </div>
  );
}

function Header({ t, g, f, onCart, onTutorial }) {
  return (
    <header className="neoTop">
      <div className="neoBrand">
        <div className="neoLogo">R</div>
        <div><b>Remolink Discovery Mall</b><span>Remote · Digital Twin · Japan</span></div>
        <span className="neoLivePill"><i />LIVE</span>
      </div>
      {f.rank && (
        <div className="neoXp">
          <div className="row"><span className="rank">{g.rank.rank.name}</span><span className="pts">{g.xp} XP{g.rank.next ? ` · 次まで ${g.rank.toNext}` : ""}</span></div>
          <div className="track"><div className="fill" style={{ width: g.rank.pct + "%" }} /></div>
        </div>
      )}
      <div className="neoActions">
        <button className="neoIcon" onClick={onTutorial} title={g.lang === "ja" ? "使い方" : "How to play"}>?</button>
        <a className="neoIcon" href="#/admin" title="体験機能管理">⚙</a>
        <button className="neoBtn" onClick={() => g.setLang(g.lang === "ja" ? "en" : "ja")}>{g.lang === "ja" ? "EN" : "日本語"}</button>
        {f.theme && (
          <select className="neoSel" value={g.tone} onChange={(e) => g.setTone(e.target.value)}>
            {TONES.map((x) => <option key={x.id} value={x.id}>{x[g.lang]}</option>)}
          </select>
        )}
        <button className="neoBtn solid neoCartBtn" onClick={onCart}>🛒 {t.cart}{g.cartCount > 0 && <i>{g.cartCount}</i>}</button>
      </div>
    </header>
  );
}
function Home({ t, lang, g, f, store, setStore, onOpenStore, onSugoroku, onCollection }) {
  const [hover, setHover] = useState(null);
  const [warp, setWarp] = useState(false);
  const linked = hover || store.id;
  const neighbors = f.openWorld ? neighborsOf(store.id) : [];

  function warpTo(s) { if (warp) return; setWarp(true); setHover(s.id); g.warp(); setTimeout(() => { setStore(s); setWarp(false); }, 750); }

  const players = useMemo(() => {
    const list = [...LEADERBOARD, { name: "YOU", xp: g.xp, you: true }].sort((a, b) => b.xp - a.xp);
    return list;
  }, [g.xp]);

  return (
    <main className="neoHome">
      <section className="neoHero">
        <p className="eyebrow">{t.eyebrow}</p>
        <h1 className="neoTitle"><span className="lead">Remolink</span><span className="main">Discovery Mall</span></h1>
        <p>{t.sub}</p>
      </section>

      {(f.sugoroku || f.collection) && (
        <div className="neoTabs">
          <button className="neoTab on">{t.map}</button>
          {f.collection && <button className="neoTab" onClick={onCollection}>📘 {t.collection} {g.collectionPct}%</button>}
          {f.sugoroku && <button className="neoTab" onClick={onSugoroku}>🎲 {t.sugoroku}</button>}
        </div>
      )}

      <div className="neoBoard">
        <div className="neoMap">
          <img src={store.pano} alt="" style={{ display: "none" }} />
          <img src={mapImg()} alt="Japan map" />
          {f.openWorld && (
            <svg className="neoEdges" viewBox="0 0 100 100" preserveAspectRatio="none">
              {STORE_LINKS.map(([a, b]) => {
                const sa = storeById(a), sb = storeById(b);
                const on = store.id === a || store.id === b;
                return <line key={a + b} className={on ? "on" : ""} x1={parseFloat(sa.pin.left)} y1={parseFloat(sa.pin.top)} x2={parseFloat(sb.pin.left)} y2={parseFloat(sb.pin.top)} />;
              })}
            </svg>
          )}
          {warp && <div className="neoWarp" />}
          {STORES.map((s) => (
            <button key={s.id} className={"neoPin" + (s.id === store.id ? " active" : "") + (s.id === linked ? " linked" : "") + (neighbors.includes(s.id) ? " portal" : "")}
              style={s.pin} onMouseEnter={() => setHover(s.id)} onMouseLeave={() => setHover(null)}
              onClick={() => (neighbors.includes(s.id) ? warpTo(s) : setStore(s))} aria-label={s.name}>
              <span /><b>{s.name}<br />{local(s.area, lang)}</b>
            </button>
          ))}
        </div>

        <div className="neoColR">
          <div className="neoPanel neoSelected">
            <img src={store.image} alt="" />
            <div>
              <p className="eyebrow">📍 {local(store.area, lang)}</p>
              <h2>{store.name}</h2>
              <p>{local(store.category, lang)}</p>
              <p className="twin">◈ {t.twin} {store.twinScan}%</p>
              <button className="neoBtn solid" style={{ marginTop: 8 }} onClick={() => onOpenStore(store)}>{t.openStore}</button>
            </div>
          </div>

          {f.openWorld && neighbors.length > 0 && (
            <div className="neoPanel" style={{ padding: 16 }}>
              <div className="neoPanelTitle">⟿ {t.warpTo}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
                {neighbors.map((id) => <button key={id} className="neoBtn" onClick={() => warpTo(storeById(id))}>{storeById(id).name}</button>)}
              </div>
            </div>
          )}

          {f.guild && (
            <div className="neoPanel" style={{ padding: 16 }}>
              <div className="neoPanelTitle">{lang === "ja" ? "ギルド" : "Guild"}</div>
              <div className="neoGuild"><b>REMOLINKers</b><span>28 / 30</span></div>
              <div className="neoGuildBar"><i style={{ width: "60%" }} /></div>
              <small style={{ color: "var(--muted)", fontSize: 11 }}>{lang === "ja" ? "ギルドミッション 3 / 5" : "Guild mission 3 / 5"}</small>
            </div>
          )}
          {f.missions && <MissionsPanel t={t} lang={lang} g={g} />}
          {f.ranking && (
            <div className="neoPanel neoLeader" style={{ padding: 16 }}>
              <div className="neoPanelTitle">{t.leaderboard}</div>
              <div style={{ marginTop: 8 }}>
                {players.slice(0, 6).map((p, i) => (
                  <div key={p.name + i} className={"row" + (p.you ? " you" : "")}>
                    <span className="n">{i + 1}</span><span>{p.you ? t.you : p.name}</span><span className="x">{p.xp} XP</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="neoPanel neoStores" style={{ marginTop: 18 }}>
        <div className="neoPanelTitle">REGISTERED STORES · {STORES.length}</div>
        <div className="neoStoresGrid">
          {STORES.map((s) => (
            <button key={s.id} className={"neoStore" + (s.hot ? " hot" : "") + (s.id === store.id ? " active" : "")}
              onClick={() => setStore(s)} onDoubleClick={() => onOpenStore(s)} onMouseEnter={() => setHover(s.id)} onMouseLeave={() => setHover(null)}>
              <img src={s.image} alt="" /><i>{s.hot ? "HOT" : "LIVE"}</i>
              <b>{s.name}</b><small>{local(s.area, lang)}</small>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}

function MissionsPanel({ t, lang, g }) {
  return (
    <div className="neoPanel" style={{ padding: 16 }}>
      <div className="neoPanelTitle">{t.missions}</div>
      {g.missions.map((m) => (
        <div key={m.id} className="neoMission">
          <div className="top"><span className="ttl">{local(m.title, lang)}</span><span className="tag">{m.type.toUpperCase()}</span></div>
          <div className="track"><i style={{ width: Math.round((m.current / m.goal) * 100) + "%" }} /></div>
          <div className="foot">
            <span>{m.current}/{m.goal} · +{m.xp} XP</span>
            <button className="claim" disabled={!m.done || m.claimed} onClick={() => g.claimMission(m.id)}>{m.claimed ? t.claimed : t.claim}</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function Shop({ t, lang, g, f, store, product, reqlog, onBack, onProduct, onRequest, onPossess, onTrial }) {
  const groups = [["recommended", t.recommended], ["limited", t.limited], ["popular", t.popular]];
  return (
    <main className="neoShop">
      <section className="neoShopHero">
        <button className="neoBtn neoBack" onClick={onBack}>{t.back}</button>
        <img src={store.image} alt="" />
        <div className="body">
          <p className="eyebrow">{local(store.area, lang)} · {store.access}</p>
          <h1>{store.name}</h1>
          <p style={{ color: "rgba(255,255,255,.8)", fontSize: 13 }}>{local(store.category, lang)}</p>
        </div>
      </section>

      <section className="neoProds">
        {groups.map(([gr, label]) => (
          <div className="neoProdSec" key={gr}>
            <h3>{label}</h3>
            <div className="neoProdGrid">
              {PRODUCTS.filter((p) => p.group === gr).map((p) => (
                <button key={p.id} className={"neoProd" + (p.id === product.id ? " active" : "")} onClick={() => onProduct(p)}>
                  <img src={p.image} alt="" /><span className="rar">{p.rarity}</span>
                  <b>{p.name}</b><small>{p.price} · {p.shelf}</small>
                </button>
              ))}
            </div>
          </div>
        ))}
      </section>

      <aside className="neoSide">
        <div className="neoPanel neoFocus">
          <img src={product.image} alt="" />
          <p className="eyebrow">{product.rarity} · {product.shelf}</p>
          <h2>{product.name}</h2>
          <p>{local(product.note, lang)}</p>
          <div className="price"><b>{product.price}</b><span>{t.stock} {product.stock}</span></div>
          <button className="neoBtn solid block" onClick={() => onRequest(product)}>{t.request}</button>
        </div>

        <div className="neoPanel neoPossess">
          <p className="eyebrow">{store.access}</p>
          <h2>{t.possessTitle}</h2>
          {f.paidUpgrade && g.xp > 0 ? (
            <>
              <div className="big"><s>¥1,500</s> ¥{(1500 - Math.min(1000, g.xp)).toLocaleString()} <em>/ 10{lang === "ja" ? "分" : "min"}</em></div>
              <p className="neoDiscount">{lang === "ja" ? `獲得${g.xp}Pで -¥${Math.min(1000, g.xp)} 割引・ポイントは有料体験に引き継ぎ` : `-¥${Math.min(1000, g.xp)} from your ${g.xp}P · carries over to paid`}</p>
            </>
          ) : (<div className="big">{t.price}</div>)}
          <ul><li>{t.merit1}</li><li>{t.merit2}</li><li>{t.merit3}</li></ul>
          <button className="neoBtn solid block" onClick={onPossess}>{t.possess}</button>
          {f.trial && <button className="neoBtn block" style={{ marginTop: 8 }} onClick={onTrial}>{t.trial}</button>}
        </div>

        <div className="neoPanel neoReqlog">
          <div className="neoPanelTitle">REQUEST LOG</div>
          {reqlog.length === 0 ? <p>{t.reqEmpty}</p> : reqlog.map((r, i) => <p key={i}>{r}</p>)}
        </div>
      </aside>
    </main>
  );
}

function Sync({ t, store }) {
  return (
    <div className="neoSync">
      <img src={TRANSFER_IMAGE} alt="" />
      <div className="neoTunnel">{Array.from({ length: 9 }).map((_, i) => <span key={i} style={{ "--i": i }} />)}</div>
      <div className="neoSpeed" />
      <div className="neoSyncCore"><span>ROBOT POSSESSION</span><h1>{t.sync}</h1><p>{store.name} · AUTH OK · 360 CAMERA · QR READY</p></div>
    </div>
  );
}

// Per-store floor layouts → each store's digital twin looks different.
const TWIN_LAYOUTS = [
  [ { l: 6, t: 5, w: 88, h: 7 }, { l: 4, t: 14, w: 7, h: 64 }, { l: 89, t: 14, w: 7, h: 64 }, { l: 18, t: 83, w: 32, h: 6 },
    { l: 18, t: 24, w: 12, h: 18 }, { l: 40, t: 24, w: 12, h: 18 }, { l: 62, t: 24, w: 12, h: 18 },
    { l: 18, t: 52, w: 12, h: 18 }, { l: 40, t: 52, w: 12, h: 18 }, { l: 62, t: 52, w: 12, h: 18 } ],
  [ { l: 6, t: 5, w: 88, h: 8 }, { l: 4, t: 16, w: 8, h: 70 }, { l: 88, t: 16, w: 8, h: 70 },
    { l: 24, t: 26, w: 24, h: 13 }, { l: 56, t: 26, w: 16, h: 13 },
    { l: 24, t: 54, w: 16, h: 16 }, { l: 50, t: 54, w: 24, h: 16 }, { l: 40, t: 82, w: 20, h: 6 } ],
  [ { l: 5, t: 6, w: 90, h: 6 }, { l: 5, t: 88, w: 90, h: 6 }, { l: 4, t: 18, w: 6, h: 64 },
    { l: 16, t: 22, w: 62, h: 9 }, { l: 16, t: 40, w: 62, h: 9 }, { l: 16, t: 58, w: 62, h: 9 }, { l: 82, t: 22, w: 9, h: 50 } ]
];
const shelvesForStore = (storeId) => TWIN_LAYOUTS[Math.max(0, STORES.findIndex((s) => s.id === storeId)) % TWIN_LAYOUTS.length];
const EXIT_POS = [{ l: "50%", t: "1%" }, { l: "1%", t: "50%" }, { l: "99%", t: "50%" }, { l: "50%", t: "99%" }];

function TwinFloor({ node, onMove, mini, shelves = TWIN_LAYOUTS[0], exits = 0 }) {
  return (
    <div className={"twinStage" + (mini ? " mini" : "")}>
      <div className="twinFloor" />
      {shelves.map((s, i) => (
        <div key={i} className="twinShelf" style={{ left: s.l + "%", top: s.t + "%", width: s.w + "%", height: s.h + "%" }} />
      ))}
      <svg className="twinPaths" viewBox="0 0 100 100" preserveAspectRatio="none">
        {NODES.flatMap((n) => n.next.map((nx) => {
          const m = nodeById(nx);
          return <line key={n.id + nx} x1={parseFloat(n.pos.left)} y1={parseFloat(n.pos.top)} x2={parseFloat(m.pos.left)} y2={parseFloat(m.pos.top)} />;
        }))}
      </svg>
      {NODES.map((n) => (
        <button key={n.id} className={"twinNode" + (n.id === node.id ? " here" : "")} style={{ left: n.pos.left, top: n.pos.top }} onClick={() => onMove && onMove(n.id)} />
      ))}
      {Array.from({ length: Math.min(exits, 4) }).map((_, i) => (
        <span key={"x" + i} className="twinExit" style={{ left: EXIT_POS[i].l, top: EXIT_POS[i].t }} />
      ))}
      <div className="twinSelf" style={{ left: node.pos.left, top: node.pos.top }} />
    </div>
  );
}

function Explore({ t, lang, g, f, store, node, hp, product, onScan, onMove, onRequest, onExit, onWarp, onUpgrade }) {
  const [warping, setWarping] = useState(false);
  const [warpTarget, setWarpTarget] = useState(null);
  const [yaw, setYaw] = useState(0);     // 0-7 turn
  const [pitch, setPitch] = useState(0); // -2..2 tilt
  const [elev, setElev] = useState(0);   // 0..2 elevation
  const [upsell, setUpsell] = useState(false);
  useEffect(() => { if (f.paidUpgrade && node.id === "limited") setUpsell(true); }, [node.id, f.paidUpgrade]);
  const shelf = node.products.map((id) => PRODUCTS.find((p) => p.id === id)).filter(Boolean);
  const scanned = g.scannedIds.includes(product.id);
  const neighbors = f.openWorld ? neighborsOf(store.id) : [];
  const leftStore = neighbors[0] ? storeById(neighbors[0]) : null;
  const rightStore = neighbors[1] ? storeById(neighbors[1]) : null;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const view = node.view || { img: store.pano, x: 30, z: 150 };
  const bgX = clamp(view.x + (yaw - 4) * 7, 0, 100); // turning pans within the viewpoint
  const bgY = clamp(50 + pitch * 9 - elev * 7, 0, 100);
  const feedStyle = { backgroundImage: `url(${view.img})`, backgroundPosition: `${bgX}% ${bgY}%`, backgroundSize: `${view.z}% auto` };
  function hunt() {
    if (Math.random() > 0.55) { g.toast(local({ ja: "何も無かった…", en: "Nothing here…" }, lang)); return; }
    const res = g.huntRare(store.id);
    g.toast(`${t.getRare} ${local(res.item.name, lang)} [${res.item.rarity}]`, res.isNew ? "ok" : "info");
  }
  function warp(id) { if (warping) return; setWarpTarget(storeById(id)); setWarping(true); setTimeout(() => { onWarp(id); setWarping(false); setWarpTarget(null); setYaw(0); setPitch(0); setElev(0); }, 1500); }
  const fwd = () => onMove(node.next[0]);
  const back = () => onMove(node.next[node.next.length > 1 ? 1 : 0]);

  if (warping) {
    return (
      <div className="neoSync">
        <div className="neoTunnel">{Array.from({ length: 9 }).map((_, i) => <span key={i} style={{ "--i": i }} />)}</div>
        <div className="neoSpeed" />
        <div className="neoSyncCore"><span>STORE TRANSFER</span><h1>{warpTarget?.name}</h1><p>SYNCING DIGITAL TWIN…</p></div>
      </div>
    );
  }

  return (
    <div className="neoEx">
      <div className="neoFeed" key={node.id} style={feedStyle} />
      <div className="neoExShade" />

      <header className="neoExTop neoGlass">
        <span className="rec">● LIVE 360</span><b>{store.name}</b><span>{local(node.label, lang)}</span>
        <span className="sp">⚡ {hp}</span>
        {f.rank && <span>{g.rank.rank.name} · {g.xp}XP</span>}
        <span>🛒 {g.cartCount}</span>
      </header>

      {/* store-to-store traversal導線: move sideways to neighbour stores */}
      {f.openWorld && (leftStore || rightStore) && (
        <div className="neoStoreNav">
          {leftStore && <button className="g l" onClick={() => warp(leftStore.id)}>◀<span>{leftStore.name}</span></button>}
          <span className="now">{store.name}</span>
          {rightStore && <button className="g r" onClick={() => warp(rightStore.id)}><span>{rightStore.name}</span>▶</button>}
        </div>
      )}

      {f.treasure && <button className="neoTreasureBtn" onClick={hunt}>🎁 {t.treasure}</button>}

      {/* street-view forward step */}
      <button className="neoFwd" onClick={fwd} title={t.fwd}>↑</button>

      {shelf.map((p, i) => (
        <button key={p.id} className={"neoShelf" + (p.id === product.id ? " active" : "")}
          style={{ "--x": `${24 + i * 18}%`, "--y": `${38 + ((i + yaw) % 3) * 12}%` }} onClick={() => onScan(p)}>
          <img src={p.image} alt="" /><span>QR</span>
        </button>
      ))}

      {f.twin ? (
        <aside className="neoTwinMini neoGlass">
          <div className="neoPanelTitle">{t.floor} · DIGITAL TWIN</div>
          <div className="holder"><TwinFloor node={node} onMove={onMove} mini shelves={shelvesForStore(store.id)} exits={neighbors.length} /></div>
          {f.openWorld && neighbors.length > 0 && (
            <div className="twinGates">
              <span className="lbl">⟿ {t.warpTo}</span>
              {neighbors.map((id) => <button key={id} className="gate" onClick={() => warp(id)}>◈ {storeById(id).name}</button>)}
            </div>
          )}
        </aside>
      ) : (f.openWorld && neighbors.length > 0 && (
        <aside className="twinWarp neoGlass">
          <div className="neoPanelTitle">⟿ {t.warpTo}</div>
          <div className="gates">{neighbors.map((id) => <button key={id} className="gate" onClick={() => warp(id)}>◈ {storeById(id).name}</button>)}</div>
        </aside>
      ))}

      <aside className="neoAr neoGlass">
        <p className="eyebrow">{scanned ? t.scanned : "QR TARGET"}</p>
        <h2>{product.name}</h2>
        {f.ar && (
          <dl>
            <div><dt>{t.shelf}</dt><dd>{product.shelf}</dd></div>
            <div><dt>RARITY</dt><dd>{product.rarity}</dd></div>
            <div><dt>XP</dt><dd>+{product.xp}</dd></div>
          </dl>
        )}
        {scanned ? <button className="neoBtn solid block" onClick={() => onRequest(product)}>{t.request}</button>
          : <button className="neoBtn solid block" onClick={() => onScan(product)}>{t.scan}</button>}
      </aside>

      {/* game-controller style controls */}
      <div className="neoCtl">
        <div className="neoPad" aria-label={t.move}>
          <button className="up" onClick={fwd} title={t.fwd}>▲</button>
          <button className="left" onClick={() => setYaw((v) => (v + 7) % 8)} title={t.turnL}>◀</button>
          <button className="ctr" disabled>{HEADINGS[yaw]}</button>
          <button className="right" onClick={() => setYaw((v) => (v + 1) % 8)} title={t.turnR}>▶</button>
          <button className="down" onClick={back} title={t.back}>▼</button>
        </div>
        <div className="neoDest">
          {node.next.map((id) => { const n = nodeById(id); return <button key={id} onClick={() => onMove(id)}>➜ {local(n.label, lang)}</button>; })}
          <button className="exit" onClick={() => setTimeout(onExit, 0)}>{t.exit}</button>
        </div>
        <div className="neoRpad">
          <div className="neoCluster">
            <button onClick={() => setPitch((v) => clamp(v + 1, -2, 2))} title={t.tiltUp}>▲</button>
            <span className="lbl">{t.look}</span>
            <button onClick={() => setPitch((v) => clamp(v - 1, -2, 2))} title={t.tiltDn}>▼</button>
          </div>
          <div className="neoCluster">
            <button onClick={() => setElev((v) => clamp(v + 1, 0, 2))} title={t.up}>⤒</button>
            <span className="lbl">{t.lift}</span>
            <button onClick={() => setElev((v) => clamp(v - 1, 0, 2))} title={t.down}>⤓</button>
          </div>
        </div>
      </div>

      {upsell && <UpsellModal lang={lang} g={g} discount={Math.min(1000, g.xp)} onUpgrade={onUpgrade} onClose={() => setUpsell(false)} />}
    </div>
  );
}

function UpsellModal({ lang, g, discount, onUpgrade, onClose }) {
  const L = (ja, en) => (lang === "ja" ? ja : en);
  const net = 1500 - discount;
  return (
    <div className="neoModalOv" onClick={onClose}>
      <div className="neoUpsell" onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={onClose}>×</button>
        <p className="eyebrow">{L("無料体験はここまで", "Free trial ends here")}</p>
        <h2>🔒 {L("ここから先は有料体験", "Unlock the full DIVE")}</h2>
        <ul className="upBenes">
          <li>{L("実機ロボットを自由に遠隔操作", "Pilot the real robot freely")}</li>
          <li>{L("限定棚の商品を購入・取り置き", "Buy & reserve limited-shelf items")}</li>
          <li>{L("発見したレアを確保（図鑑＆発送）", "Secure your rare finds (ship it)")}</li>
        </ul>
        <div className="upPrice">
          <span className="orig">¥1,500</span>
          <span className="net">¥{net.toLocaleString()}</span>
          <small>/ 10{L("分", "min")}</small>
        </div>
        <p className="upNote">{L(`無料体験で獲得した ${g.xp}P を割引に充当（-¥${discount}）。ポイントは有料体験に引き継がれます。`, `Your ${g.xp}P from the trial applies as -¥${discount}. Points carry over to the paid DIVE.`)}</p>
        <button className="neoBtn solid block" onClick={onUpgrade}>⚡ {L("有料体験に進む", "Continue to paid DIVE")}</button>
        <button className="skip" onClick={onClose}>{L("無料体験を続ける", "Keep exploring (free)")}</button>
      </div>
    </div>
  );
}

function Sugoroku({ t, lang, g, onBack }) {
  const [pos, setPos] = useState(0);
  const [dice, setDice] = useState("-");
  const [rolling, setRolling] = useState(false);
  function roll() {
    if (rolling) return;
    setRolling(true);
    const d = 1 + Math.floor(Math.random() * 6);
    setDice(d);
    const next = Math.min(SUGOROKU.length - 1, pos + d);
    setTimeout(() => {
      setPos(next);
      const tile = SUGOROKU[next];
      if (tile.kind === "xp") g.gainXp(tile.value, local({ ja: "すごろくマス", en: "Sugoroku tile" }, lang));
      else if (tile.kind === "item") g.tryTreasure(1);
      else if (tile.kind === "warp") g.warp();
      else if (tile.kind === "goal") g.gainXp(150, "GOAL");
      setRolling(false);
    }, 450);
  }
  return (
    <main className="neoSugo">
      <div className="neoSugoHead">
        <button className="neoBtn" onClick={onBack}>{t.back}</button>
        <h1 style={{ fontSize: 24 }}>🎲 {t.sugoroku}</h1>
        <button className="neoDice" onClick={roll} disabled={rolling || SUGOROKU[pos].kind === "goal"}>{dice}</button>
      </div>
      <div className="neoPanel neoBoardWrap">
        <div className="neoTiles">
          {SUGOROKU.map((tile, i) => (
            <div key={i} className={`neoTile k-${tile.kind}` + (i === pos ? " here" : "")}>
              {i === pos && <span className="tok" />}
              {local(tile.label, lang)}
              <small>{tile.kind.toUpperCase()}</small>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

function Collection({ t, lang, g, onBack, onGoStore }) {
  return (
    <main className="neoSugo">
      <div className="neoSugoHead">
        <button className="neoBtn" onClick={onBack}>{t.back}</button>
        <h1 style={{ fontSize: 24 }}>📘 {t.collTitle}</h1>
        <div className="neoChips"><span>{t.complete} {g.collectionPct}% · {g.collection.length}/{RARES.length}</span></div>
      </div>
      <div className="neoCollGrid">
        {RARES.map((r) => {
          const got = g.collection.includes(r.id);
          const s = storeById(r.storeId);
          return (
            <button key={r.id} className={"neoCollItem" + (got ? " got" : "")} onClick={() => onGoStore(s)} title={s.name}>
              <div className="thumb">{got ? <img src={r.image} alt="" /> : <span className="silh">?</span>}</div>
              <span className="rar">{r.rarity}</span>
              <b>{got ? local(r.name, lang) : t.undiscovered}</b>
              <small>◈ {s.name}</small>
            </button>
          );
        })}
      </div>
    </main>
  );
}

function Cart({ t, lang, g, onClose }) {
  return (
    <div className="neoCartOv" onClick={onClose}>
      <aside className="neoCart" onClick={(e) => e.stopPropagation()}>
        <header><b>{t.cart} · {g.cartCount}</b><button className="close" onClick={onClose}>×</button></header>
        {g.cartItems.length === 0 ? <div className="empty">{t.empty}</div> : (
          <div className="list">
            {g.cartItems.map(({ id, qty, product }) => (
              <div className="neoLine" key={id}>
                <img src={product.image} alt="" />
                <div className="info"><b>{product.name}</b><small>{product.rarity} · {product.shelf}</small><div className="pr">{product.price}</div></div>
                <div style={{ display: "grid", gap: 6, justifyItems: "end" }}>
                  <div className="neoQty"><button onClick={() => g.changeQty(id, -1)}>−</button><span>{qty}</span><button onClick={() => g.changeQty(id, 1)}>+</button></div>
                  <button className="rmlink" onClick={() => g.removeFromCart(id)}>{lang === "ja" ? "削除" : "Remove"}</button>
                </div>
              </div>
            ))}
          </div>
        )}
        <footer>
          <div className="total"><span>{t.total}</span><b>¥{g.cartTotal.toLocaleString()}</b></div>
          <button className="neoBtn solid block" disabled={g.cartItems.length === 0} onClick={g.checkout}>{t.checkout}</button>
        </footer>
      </aside>
    </div>
  );
}

function WelcomeModal({ t, lang, g, f, store, onClose, onPossess, onTrial }) {
  const [claimed, setClaimed] = useState(false);
  const rec = PRODUCTS.find((p) => p.group === "limited") || PRODUCTS[0];
  return (
    <div className="neoModalOv" onClick={onClose}>
      <div className="neoWelcome" onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={onClose}>×</button>
        <p className="eyebrow">{store.name}</p>
        <h2>{lang === "ja" ? "ようこそ、ダイバーさん！" : "Welcome, Diver!"}</h2>
        {f.loginBonus && (
          <div className="wlBlock">
            <div className="neoPanelTitle">{lang === "ja" ? "ログインボーナス" : "Login bonus"} · {lang === "ja" ? "連続3日目" : "Day 3"}</div>
            <div className="neoLoginRow">
              {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                <div key={d} className={"day" + (d < 3 ? " done" : "") + (d === 3 ? " today" : "") + (d === 7 ? " big" : "")}>
                  <b>{d === 7 ? "SSR" : d <= 3 ? "✓" : "◈"}</b><small>{d}{lang === "ja" ? "日" : "d"}</small>
                </div>
              ))}
            </div>
            <button className="neoBtn solid block" disabled={claimed} onClick={() => { setClaimed(true); g.gainXp(120, lang === "ja" ? "ログインボーナス" : "Login bonus"); }}>
              {claimed ? (lang === "ja" ? "受け取り済み ✓" : "Claimed ✓") : (lang === "ja" ? "今日の報酬を受け取る (+120XP)" : "Claim today's reward (+120XP)")}
            </button>
          </div>
        )}
        <div className="wlBlock">
          <div className="neoPanelTitle">{lang === "ja" ? "本日のおすすめ" : "Today's pick"}</div>
          <div className="wlRec">
            <img src={rec.image} alt="" />
            <div><b>{rec.name}</b><small>{rec.price} · {rec.rarity}</small></div>
          </div>
        </div>
        <div className="wlCta">
          <button className="neoBtn solid block" onClick={onPossess}>⚡ {lang === "ja" ? "憑依して店内を探索" : "DIVE & explore"}</button>
          {f.trial && <button className="neoBtn block" onClick={onTrial}>{t.trial}</button>}
        </div>
      </div>
    </div>
  );
}

function TutorialModal({ lang, f, onClose }) {
  const L = (ja, en) => (lang === "ja" ? ja : en);
  const steps = [
    { ic: "🛰️", t: L("Remolink へようこそ", "Welcome to Remolink"), b: L("全国のアニメグッズ店舗を、自宅から自由に“回って”買える新感覚のEC。", "A new EC where you remotely visit anime-goods stores across Japan from home.") },
    { ic: "🗺️", t: L("店舗を選ぶ", "Pick a store"), b: L("地図のピンや店舗カードから、行きたいお店を選びます。", "Choose a store from the map pins or store cards.") },
    { ic: "⚡", t: L("憑依(DIVE)して探索", "DIVE & explore"), b: L("店内のロボットに憑依し、コントローラーで前後左右・視点・昇降を操作して店内を探索。", "Possess a store robot and pilot it — move, turn, tilt and lift to explore the aisles.") },
    f.collection && { ic: "📘", t: L("レアを発見→図鑑", "Discover → Collection"), b: L("棚をスキャンしてレアを発見、図鑑に登録してコンプを目指そう。", "Scan shelves to find rares and complete your Collection.") },
    f.missions && { ic: "✅", t: L("クエストでXP→ランクUP", "Quests → Rank up"), b: L("デイリー等のクエストを達成してXPを稼ぎ、ランクを上げよう。", "Clear daily quests to earn XP and rank up.") },
    f.ranking && { ic: "👑", t: L("ランキング", "Ranking"), b: L("発見数やXPで他のダイバーとランキングを競えます。", "Compete with other divers on the leaderboard.") },
    f.guild && { ic: "🛡️", t: L("ギルド", "Guild"), b: L("仲間とギルドを組み、協力ミッションでさらに楽しく。", "Team up in a guild and take on co-op missions.") },
    f.openWorld && { ic: "🌀", t: L("ワープで世界一でかい店へ", "Warp the infinite store"), b: L("店舗の端からワープすると隣の店へ。全店が地続きの“世界一でかい店”。", "Warp from a store edge to the next — all stores connect into one giant store.") }
  ].filter(Boolean);
  const [i, setI] = useState(0);
  const step = steps[Math.min(i, steps.length - 1)];
  const last = i >= steps.length - 1;
  return (
    <div className="neoModalOv" onClick={onClose}>
      <div className="neoTut" onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={onClose}>×</button>
        <div className="ic">{step.ic}</div>
        <p className="eyebrow">{L("チュートリアル", "Tutorial")} {i + 1}/{steps.length}</p>
        <h2>{step.t}</h2>
        <p className="body">{step.b}</p>
        <div className="dots">{steps.map((_, k) => <span key={k} className={k === i ? "on" : ""} />)}</div>
        <div className="nav">
          {i > 0 ? <button className="neoBtn" onClick={() => setI(i - 1)}>{L("戻る", "Back")}</button> : <span />}
          {last
            ? <button className="neoBtn solid" onClick={onClose}>{L("はじめる", "Start")}</button>
            : <button className="neoBtn solid" onClick={() => setI(i + 1)}>{L("次へ", "Next")}</button>}
        </div>
        <button className="skip" onClick={onClose}>{L("スキップ", "Skip")}</button>
      </div>
    </div>
  );
}

function Toasts({ toasts }) {
  return <div className="neoToasts">{toasts.map((x) => <div key={x.id} className={"neoToast " + x.kind}>{x.message}</div>)}</div>;
}

function mapImg() { return `${import.meta.env.BASE_URL}japan-map.png`; }
