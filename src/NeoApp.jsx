import React, { useEffect, useMemo, useRef, useState } from "react";
import "./neo.css";
import { useGame } from "./game.jsx";
import { useFeatures } from "./features/FeatureContext.jsx";
import {
  STORES, STORE_LINKS, storeById, neighborsOf, PRODUCTS, NODES, nodeById, HEADINGS,
  LEADERBOARD, SUGOROKU, EXPLORE_URL, TRANSFER_IMAGE, TONES, local
} from "./data.js";

const T = {
  ja: {
    eyebrow: "Telepresence Shopping · Japan", sub: "地図から実店舗を選び、ロボットに憑依してデジタルツインの店内を探索する。",
    map: "MAP", sugoroku: "すごろく", openStore: "店舗を見る", back: "← 地図へ", twin: "ツインスキャン",
    recommended: "おすすめ", limited: "限定", popular: "人気", request: "購入リクエスト", reqEmpty: "リクエストはまだありません",
    possessTitle: "ロボット憑依", price: "¥1,500 / 10分", possess: "⚡ 憑依して探索（外部アプリ）",
    trial: "お試し探索（無料・アプリ内）", merit1: "EC非掲載の限定棚に出会える", merit2: "他プレイヤーの探索ログ", merit3: "スタッフ確認の購入リクエスト",
    sync: "意識転送中", scan: "棚QRをスキャン", scanned: "スキャン済み", forward: "前進", left: "左45°", right: "右45°", exit: "探索終了",
    floor: "店内MAP", shelf: "棚", stock: "在庫", treasure: "宝箱をさがす", missions: "ミッション", leaderboard: "ランキング", you: "YOU",
    claim: "受取", claimed: "受取済", cart: "カート", total: "合計", checkout: "購入を確定", empty: "カートは空です",
    roll: "サイコロを振る", warpTo: "隣接ツインへワープ", rank: "ランク", hp: "ENERGY"
  },
  en: {
    eyebrow: "Telepresence Shopping · Japan", sub: "Pick a real store, possess a robot and explore its digital-twin interior.",
    map: "MAP", sugoroku: "Sugoroku", openStore: "View store", back: "← Map", twin: "Twin scan",
    recommended: "Recommended", limited: "Limited", popular: "Popular", request: "Purchase request", reqEmpty: "No requests yet",
    possessTitle: "Robot possession", price: "¥1,500 / 10min", possess: "⚡ Possess & explore (external)",
    trial: "Free trial (in-app)", merit1: "Hidden shelves not on normal EC", merit2: "Other players' traces", merit3: "Staff-confirmed requests",
    sync: "Transferring", scan: "Scan shelf QR", scanned: "Scanned", forward: "Forward", left: "Turn L", right: "Turn R", exit: "Exit",
    floor: "Floor map", shelf: "Shelf", stock: "Stock", treasure: "Hunt treasure", missions: "Missions", leaderboard: "Leaderboard", you: "YOU",
    claim: "Claim", claimed: "Claimed", cart: "Cart", total: "Total", checkout: "Checkout", empty: "Your cart is empty",
    roll: "Roll dice", warpTo: "Warp to twin", rank: "Rank", hp: "ENERGY"
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
    sugoroku: isFunctional("sugoroku_warp_exploration") || isFunctional("sugoroku_world_theme")
  };

  const [screen, setScreen] = useState("home");
  const [store, setStore] = useState(STORES[0]);
  const [product, setProduct] = useState(PRODUCTS[0]);
  const [possessMode, setPossessMode] = useState("external");
  const [cartOpen, setCartOpen] = useState(false);
  const [reqlog, setReqlog] = useState([]);

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

  function openStore(s) { setStore(s); setProduct(PRODUCTS[0]); setScreen("shop"); }
  function startTrial() { setPossessMode("trial"); setHp(78); setNodeId("entrance"); setHeading(0); setScreen("sync"); }
  function startPossess() { setPossessMode("external"); setScreen("sync"); }
  function request(p) { g.requestPurchase(p); setReqlog((l) => [`${local(p.name, lang)} · ${t.request}`, ...l].slice(0, 4)); }
  function moveTo(id) { setNodeId(id); setHp((v) => Math.max(0, v - 13)); g.move(); const n = nodeById(id); const fp = n.products.map((x) => PRODUCTS.find((p) => p.id === x))[0]; if (fp) setProduct(fp); }
  function scan(p) { setProduct(p); g.scan(p); }
  function warpStore(id) { const s = storeById(id); if (!s) return; setStore(s); setNodeId("entrance"); setProduct(PRODUCTS[0]); setHp((v) => Math.max(20, v - 6)); g.warp(); g.toast(local({ ja: `${s.name} ツインへワープ`, en: `Warped to ${s.name}` }, lang), "ok"); }

  const tone = g.tone;
  const themeClass = `neo tone-${f.theme ? tone : "cyber"}`;

  const header = (
    <Header t={t} g={g} f={f} onCart={() => setCartOpen(true)} />
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
        <Explore t={t} lang={lang} g={g} f={f} store={store} node={node} heading={heading} hp={hp}
          product={product} onScan={scan} onMove={moveTo} onRotate={(d) => setHeading((h) => (h + d + 8) % 8)}
          onRequest={request} onExit={() => setScreen("shop")} onWarp={warpStore} />
        <Toasts toasts={g.toasts} />
      </div>
    );
  }
  if (screen === "sugoroku") {
    body = <Sugoroku t={t} lang={lang} g={g} onBack={() => setScreen("home")} />;
  } else if (screen === "shop") {
    body = <Shop t={t} lang={lang} g={g} f={f} store={store} product={product} reqlog={reqlog}
      onBack={() => setScreen("home")} onProduct={setProduct} onRequest={request} onPossess={startPossess} onTrial={startTrial} />;
  } else {
    body = <Home t={t} lang={lang} g={g} f={f} store={store} setStore={setStore} onOpenStore={openStore}
      onSugoroku={() => setScreen("sugoroku")} screenTab="home" />;
  }

  return (
    <div className={themeClass}>
      {header}
      {body}
      {cartOpen && <Cart t={t} lang={lang} g={g} onClose={() => setCartOpen(false)} />}
      <Toasts toasts={g.toasts} />
    </div>
  );
}

function Header({ t, g, f, onCart }) {
  return (
    <header className="neoTop">
      <div className="neoBrand">
        <div className="neoLogo">R</div>
        <div><b>Remolink Discovery Mall</b><span>Remote · Digital Twin · Japan</span></div>
      </div>
      {f.rank && (
        <div className="neoXp">
          <div className="row"><span className="rank">{g.rank.rank.name}</span><span className="pts">{g.xp} XP{g.rank.next ? ` · 次まで ${g.rank.toNext}` : ""}</span></div>
          <div className="track"><div className="fill" style={{ width: g.rank.pct + "%" }} /></div>
        </div>
      )}
      <div className="neoActions">
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
function Home({ t, lang, g, f, store, setStore, onOpenStore, onSugoroku }) {
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
        <div className="neoChips"><span>360° ROBOT</span><span>DIGITAL TWIN</span><span>QR · AR</span>{f.openWorld && <span>OPEN WORLD</span>}</div>
      </section>

      {f.sugoroku && (
        <div className="neoTabs">
          <button className="neoTab on">{t.map}</button>
          <button className="neoTab" onClick={onSugoroku}>🎲 {t.sugoroku}</button>
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
          <div className="big">{t.price}</div>
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

const TWIN_SHELVES = [
  { l: 6, t: 5, w: 88, h: 7 }, { l: 4, t: 14, w: 7, h: 64 }, { l: 89, t: 14, w: 7, h: 64 }, { l: 18, t: 83, w: 32, h: 6 },
  { l: 18, t: 24, w: 12, h: 18 }, { l: 40, t: 24, w: 12, h: 18 }, { l: 62, t: 24, w: 12, h: 18 },
  { l: 18, t: 52, w: 12, h: 18 }, { l: 40, t: 52, w: 12, h: 18 }, { l: 62, t: 52, w: 12, h: 18 }
];
function offCalc(base, delta) { return `calc(${base} ${delta >= 0 ? "+" : "-"} ${Math.abs(delta)}%)`; }

function TwinFloor({ node, onMove, mini }) {
  return (
    <div className={"twinStage" + (mini ? " mini" : "")}>
      <div className="twinFloor" />
      {TWIN_SHELVES.map((s, i) => (
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
      <div className="twinSelf" style={{ left: node.pos.left, top: node.pos.top }} />
    </div>
  );
}

function Explore({ t, lang, g, f, store, node, heading, hp, product, onScan, onMove, onRotate, onRequest, onExit, onWarp }) {
  const [warping, setWarping] = useState(false);
  const [warpTarget, setWarpTarget] = useState(null);
  const shelf = node.products.map((id) => PRODUCTS.find((p) => p.id === id)).filter(Boolean);
  const scanned = g.scannedIds.includes(product.id);
  const neighbors = f.openWorld ? neighborsOf(store.id) : [];
  const bgPos = `${(heading / (HEADINGS.length - 1)) * 100}% center`;
  function hunt() { const found = g.tryTreasure(0.4); if (!found) g.toast(local({ ja: "何も無かった…", en: "Nothing here…" }, lang)); }
  function warp(id) { if (warping) return; setWarpTarget(storeById(id)); setWarping(true); setTimeout(() => { onWarp(id); setWarping(false); setWarpTarget(null); }, 1500); }

  if (warping) {
    return (
      <div className="neoSync">
        <div className="neoTunnel">{Array.from({ length: 9 }).map((_, i) => <span key={i} style={{ "--i": i }} />)}</div>
        <div className="neoSpeed" />
        <div className="neoSyncCore"><span>TWIN WARP</span><h1>{warpTarget?.name}</h1><p>SYNCING DIGITAL TWIN…</p></div>
      </div>
    );
  }

  return (
    <div className="neoEx">
      <div className="neoFeed" style={{ backgroundImage: `url(${store.pano})`, backgroundPosition: bgPos }} />
      <div className="neoExShade" />

      <header className="neoExTop neoGlass">
        <span className="rec">● REC 360</span><b>{store.name}</b><span>{local(node.label, lang)}</span><span>{HEADINGS[heading]}</span>
        <span className="sp">{t.cart} {g.cartCount}</span>
      </header>
      <section className="neoExStat neoGlass">
        <div className="b"><strong>{t.hp} {hp}</strong><span>{f.rank ? `${g.rank.rank.name} · ${g.xp}XP` : ""}</span></div>
        <div className="neoBar"><i style={{ width: hp + "%" }} /></div>
      </section>

      {f.treasure && <button className="neoTreasureBtn" onClick={hunt}>🎁 {t.treasure}</button>}

      {shelf.map((p, i) => (
        <button key={p.id} className={"neoShelf" + (p.id === product.id ? " active" : "")}
          style={{ "--x": `${24 + i * 18}%`, "--y": `${38 + ((i + heading) % 3) * 12}%` }} onClick={() => onScan(p)}>
          <img src={p.image} alt="" /><span>QR</span>
        </button>
      ))}

      {f.twin && (
        <aside className="neoTwinMini neoGlass">
          <div className="neoPanelTitle">{t.floor} · TWIN</div>
          <div className="holder"><TwinFloor node={node} onMove={onMove} mini /></div>
        </aside>
      )}

      {f.openWorld && neighbors.length > 0 && (
        <aside className="twinWarp neoGlass">
          <div className="neoPanelTitle">⟿ {t.warpTo}</div>
          <div className="gates">{neighbors.map((id) => <button key={id} className="gate" onClick={() => warp(id)}>◈ {storeById(id).name}</button>)}</div>
        </aside>
      )}

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

      <nav className="neoLook">
        <button onClick={() => onRotate(-1)}>{t.left}</button>
        <button className="on">{HEADINGS[heading]}</button>
        <button onClick={() => onRotate(1)}>{t.right}</button>
      </nav>
      <nav className="neoMove">
        {node.next.map((id) => { const n = nodeById(id); return <button key={id} onClick={() => onMove(id)}>{local(n.label, lang)}<small>ENERGY -13</small></button>; })}
        <button className="exit" onClick={() => setTimeout(onExit, 0)}>{t.exit}</button>
      </nav>
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

function Toasts({ toasts }) {
  return <div className="neoToasts">{toasts.map((x) => <div key={x.id} className={"neoToast " + x.kind}>{x.message}</div>)}</div>;
}

function mapImg() { return `${import.meta.env.BASE_URL}japan-map.png`; }
