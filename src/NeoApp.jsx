import React, { useEffect, useMemo, useRef, useState } from "react";
import "./neo.css";
import { useGame } from "./game.jsx";
import { useFeatures } from "./features/FeatureContext.jsx";
import * as Sound from "./sound.js";
import {
  STORES, STORE_LINKS, storeById, neighborsOf, PRODUCTS, NODES, nodeById, HEADINGS,
  LEADERBOARD, SUGOROKU, RARES, rareByStore, EXPLORE_URL, TOIO_APP_URL, TRANSFER_IMAGE, DIVE_VIDEO, HERO_IMAGE, TONES, EXPLORE_PROMOS, STREETVIEW, SAVE_NODES, RANKS, asset, local
} from "./data.js";

// User display preferences (show/hide explanatory UI). Default: everything ON.
const UIPREF_KEY = "rdm_ui_prefs_v1";
const UIPREF_DEFAULT = { hud: true, promos: true, onboarding: true, sound: true, storeTheme: false };
function loadUiPrefs() {
  try {
    const prefs = { ...UIPREF_DEFAULT, ...(JSON.parse(localStorage.getItem(UIPREF_KEY) || "{}")) };
    // one-time migration: store auto-theme is now opt-in (default off) — turn it off for existing users
    if (!localStorage.getItem("rdm_pref_mig1")) { prefs.storeTheme = false; localStorage.setItem(UIPREF_KEY, JSON.stringify(prefs)); localStorage.setItem("rdm_pref_mig1", "1"); }
    return prefs;
  } catch { return { ...UIPREF_DEFAULT }; }
}
function saveUiPrefs(p) { try { localStorage.setItem(UIPREF_KEY, JSON.stringify(p)); } catch { /* ignore */ } }

// --- node graph distance (for rare "dowsing" proximity) ---
const NODE_ADJ = (() => {
  const adj = {};
  NODES.forEach((n) => {
    adj[n.id] = adj[n.id] || new Set();
    n.next.forEach((m) => { adj[n.id].add(m); (adj[m] = adj[m] || new Set()).add(n.id); });
  });
  return adj;
})();
function nodeDistance(aId, bId) {
  if (aId === bId) return 0;
  const seen = new Set([aId]); let frontier = [aId], d = 0;
  while (frontier.length) {
    d++; const next = [];
    for (const x of frontier) for (const y of (NODE_ADJ[x] || [])) {
      if (y === bId) return d;
      if (!seen.has(y)) { seen.add(y); next.push(y); }
    }
    frontier = next;
  }
  return 99;
}
const NODE_MAX_DIST = 3;
// deterministic "hidden rare" node per store (varies by store)
function rareNodeFor(storeId) {
  let h = 0; for (const c of String(storeId)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return NODES[h % NODES.length].id;
}

// Player taste (local, on-device "learning"): each scan/capture/cart-add bumps the
// scores for that product's group + rarity. The concierge uses this to recommend.
const TASTE_KEY = "rdm_taste_v1";
function loadTaste() { try { return JSON.parse(localStorage.getItem(TASTE_KEY) || "{}") || {}; } catch { return {}; } }
function saveTaste(t) { try { localStorage.setItem(TASTE_KEY, JSON.stringify(t)); } catch { /* ignore */ } }
function tasteTrack(product, weight = 1) {
  if (!product) return;
  const t = loadTaste();
  t.group = t.group || {}; t.rarity = t.rarity || {}; t.products = t.products || {}; t.events = (t.events || 0) + 1;
  t.group[product.group] = (t.group[product.group] || 0) + weight;
  t.rarity[product.rarity] = (t.rarity[product.rarity] || 0) + weight;
  t.products[product.id] = (t.products[product.id] || 0) + weight;
  saveTaste(t);
}
function tastePick(excludeIds = []) {
  const t = loadTaste();
  const gs = t.group || {}, rs = t.rarity || {}, ps = t.products || {};
  const events = t.events || 0;
  const list = PRODUCTS.filter((p) => !excludeIds.includes(p.id))
    .map((p) => ({ p, s: (gs[p.group] || 0) * 2 + (rs[p.rarity] || 0) * 1 - (ps[p.id] || 0) * 0.5 + Math.random() * 0.4 }))
    .sort((a, b) => b.s - a.s);
  return { product: list[0]?.p || PRODUCTS[0], hasHistory: events >= 3 };
}

// FF-style save point persistence (per store).
const SAVE_KEY = "rdm_savept";
function loadSaveFor(storeId) { try { return (JSON.parse(localStorage.getItem(SAVE_KEY) || "{}"))[storeId] || null; } catch { return null; } }
function writeSaveFor(storeId, nodeId) {
  try { const all = JSON.parse(localStorage.getItem(SAVE_KEY) || "{}"); all[storeId] = { nodeId, ts: Date.now() }; localStorage.setItem(SAVE_KEY, JSON.stringify(all)); } catch { /* ignore */ }
}

const T = {
  ja: {
    eyebrow: "DIVE！店舗ロボに憑依する新感覚EC · ANIME GOODS", sub: "全国のアニメグッズ店舗のロボットに“憑依（DIVE）”して、自宅から店内を歩き回って買える新感覚EC。さあ、憑依しよう。DIVE！",
    map: "MAP", sugoroku: "すごろく", collection: "図鑑", openStore: "店舗を見る", back: "← トップ（地図）へ", twin: "ツインスキャン",
    recommended: "おすすめ", limited: "限定", popular: "人気", request: "購入リクエスト", reqEmpty: "リクエストはまだありません",
    possessTitle: "ロボットに憑依する！（DIVE）", price: "¥1,500 / 10分", possess: "⚡ 今すぐ憑依する！ DIVE（外部Grid）",
    trial: "お試し憑依DIVE（無料・アプリ内）", merit1: "EC非掲載の限定棚に出会える", merit2: "他Hunterの探索ログ", merit3: "スタッフ確認の購入リクエスト",
    sync: "GRID 同期中", scan: "棚QRをスキャン", scanned: "スキャン済み", forward: "前進", left: "左45°", right: "右45°", exit: "DIVE終了",
    floor: "店内MAP", shelf: "棚", stock: "在庫", treasure: "レアをさがす", missions: "クエスト", leaderboard: "Hunterランキング", you: "YOU",
    claim: "受取", claimed: "受取済", cart: "カート", total: "合計", checkout: "購入を確定", empty: "カートは空です",
    roll: "サイコロを振る", warpTo: "隣接店舗へ移動", rank: "ランク", hp: "ENERGY",
    collTitle: "コレクション図鑑", complete: "コンプ率", undiscovered: "未発見", hintAt: "取扱店舗", getRare: "GET!",
    fwd: "前進", bwd: "後退", turnL: "左を向く", turnR: "右を向く", tiltUp: "上を見る", tiltDn: "下を見る",
    up: "上昇", down: "下降", move: "移動", look: "視点", lift: "昇降", toStore: "店舗へ移動",
    heightLabel: "カメラの高さ", liftUp: "目線を上げる（高い棚を見る）", liftDown: "目線を下げる（低い棚を見る）", goLabel: "移動先", dowse: "レア反応",
    gateLead: "店舗に到着しました", gateTitle: "どちらを体験しますか？",
    gateList: "商品一覧を見る", gateListDesc: "棚の商品をすぐにチェックして購入リクエスト。",
    gateExplore: "憑依してDIVE！", gateExploreDesc: "今すぐ憑依（DIVE）！ ロボットに乗り移って360°店内を歩き、レアやお宝を発見。",
    gatePromo: "探索特典・イベント情報", gateGuide: "案内ロボ「レモ」", recommend: "おすすめ", gateListLink: "商品一覧はこちら（通常のEC購入）",
    svHint: "▲▼ で前後に進む・◀▶ で左右を向く", svFwd: "前へ", svBack: "戻る",
    itemsHere: "この場所の商品", noItems: "この付近に商品はありません", tapItem: "タップ＝キャプチャ／長押し＝情報", captured: "キャプチャ完了",
    addCart: "カートに入れる", addedCart: "カートに追加しました",
    faceFront: "正面", peekLeft: "左の棚を覗く", peekRight: "右の棚を覗く", backToFront: "◀▶で正面に戻る",
    save: "セーブ", savePoint: "セーブポイント", saveMsg: "ここで進行状況をセーブし、エナジーを全回復します。", saveDo: "セーブする", saveClose: "とじる", saved: "セーブしました（エナジー回復）", resumed: "セーブ地点から再開",
    display: "表示設定", displayDesc: "説明・ポップアップの表示/非表示を切り替えます",
    prefHud: "探索の補助HUD", prefHudDesc: "向き表示などの補助情報",
    prefPromos: "広告・イベントバナー", prefPromosDesc: "探索中のプロモ/クーポン告知",
    prefOnboard: "チュート・入店ポップアップ", prefOnboardDesc: "初回チュートリアル／ウェルカム・ログボ",
    prefSound: "サウンド（BGM・効果音）", prefSoundDesc: "エリア別BGMとワープ等の効果音",
    conciergeBtn: "コンシェルジェ", conciergeOn: "コンシェルジェ ON", conciergeOff: "コンシェルジェ OFF",
    prefStoreTheme: "店舗ごとにテーマ自動切替", prefStoreThemeDesc: "店舗を移動するとトンマナ・BGMが変化"
  },
  en: {
    eyebrow: "DIVE! POSSESS A STORE ROBOT · ANIME GOODS", sub: "A new kind of EC: DIVE — possess store robots across Japan and walk the aisles from home to shop. Go on, DIVE in!",
    map: "MAP", sugoroku: "Sugoroku", collection: "Collection", openStore: "View store", back: "← Top (map)", twin: "Twin scan",
    recommended: "Recommended", limited: "Limited", popular: "Popular", request: "Purchase request", reqEmpty: "No requests yet",
    possessTitle: "Possess the robot — DIVE!", price: "¥1,500 / 10min", possess: "⚡ DIVE in now! (external Grid)",
    trial: "Free trial DIVE (in-app)", merit1: "Hidden shelves not on normal EC", merit2: "Other Hunters' traces", merit3: "Staff-confirmed requests",
    sync: "GRID SYNC", scan: "Scan shelf QR", scanned: "Scanned", forward: "Forward", left: "Turn L", right: "Turn R", exit: "End DIVE",
    floor: "Floor map", shelf: "Shelf", stock: "Stock", treasure: "Hunt rares", missions: "Quests", leaderboard: "Hunter ranking", you: "YOU",
    claim: "Claim", claimed: "Claimed", cart: "Cart", total: "Total", checkout: "Checkout", empty: "Your cart is empty",
    roll: "Roll dice", warpTo: "Move to store", rank: "Rank", hp: "ENERGY",
    collTitle: "Collection", complete: "Complete", undiscovered: "Undiscovered", hintAt: "Sold at", getRare: "GET!",
    fwd: "Fwd", bwd: "Back", turnL: "Look L", turnR: "Look R", tiltUp: "Tilt up", tiltDn: "Tilt down",
    up: "Up", down: "Down", move: "Move", look: "View", lift: "Lift", toStore: "Move to store",
    heightLabel: "Camera height", liftUp: "Raise view (see high shelf)", liftDown: "Lower view (see low shelf)", goLabel: "Go to", dowse: "Rare signal",
    gateLead: "You've arrived", gateTitle: "How do you want to start?",
    gateList: "Browse products", gateListDesc: "Check shelf items right away and send purchase requests.",
    gateExplore: "DIVE in! Possess", gateExploreDesc: "DIVE now! Possess a robot, walk the 360° aisles and discover rares.",
    gatePromo: "Explore perks & events", gateGuide: "Guide bot \"Remo\"", recommend: "Pick", gateListLink: "Browse the product list (normal EC)",
    svHint: "▲▼ to move · ◀▶ to turn", svFwd: "Forward", svBack: "Back",
    itemsHere: "Items here", noItems: "No items nearby", tapItem: "Tap = capture / Hold = info", captured: "Captured",
    addCart: "Add to cart", addedCart: "Added to cart",
    faceFront: "Front", peekLeft: "Peek left shelf", peekRight: "Peek right shelf", backToFront: "◀▶ back to front",
    save: "Save", savePoint: "Save Point", saveMsg: "Save your progress here and fully restore energy.", saveDo: "Save", saveClose: "Close", saved: "Saved! Energy restored", resumed: "Resumed from save point",
    display: "Display", displayDesc: "Show or hide explanations & popups",
    prefHud: "Explore HUD", prefHudDesc: "Facing indicator & helpers",
    prefPromos: "Ads / event banners", prefPromosDesc: "Promo & coupon notices while exploring",
    prefOnboard: "Tutorial & entry popups", prefOnboardDesc: "First-run tutorial / welcome & login bonus",
    prefSound: "Sound (BGM & SFX)", prefSoundDesc: "Per-area BGM and effects like warp",
    conciergeBtn: "Concierge", conciergeOn: "Concierge ON", conciergeOff: "Concierge OFF",
    prefStoreTheme: "Auto theme per store", prefStoreThemeDesc: "Moving between stores changes theme & BGM"
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
    paidUpgrade: isFunctional("paid_upgrade"),
    toio: isFunctional("toio_corner"),
    save: isFunctional("save_point")
  };
  const TOIO_COST = 80;

  const [screen, setScreen] = useState("home");
  const [store, setStore] = useState(STORES[0]);
  const [product, setProduct] = useState(PRODUCTS[0]);
  const [possessMode, setPossessMode] = useState("external");
  const [cartOpen, setCartOpen] = useState(false);
  const [welcome, setWelcome] = useState(false);
  const [tutorial, setTutorial] = useState(false);
  const [themePicker, setThemePicker] = useState(false);
  const [dispOpen, setDispOpen] = useState(false);
  const [conciergeOn, setConciergeOn] = useState(() => { try { return localStorage.getItem("rdm_concierge") === "1"; } catch { return false; } });
  function toggleConcierge() { setConciergeOn((v) => { const n = !v; try { localStorage.setItem("rdm_concierge", n ? "1" : "0"); } catch { /* ignore */ } g.toast(n ? t.conciergeOn : t.conciergeOff, "ok"); return n; }); }
  const [uiPrefs, setUiPrefs] = useState(loadUiPrefs);
  const setPref = (k, v) => setUiPrefs((p) => { const n = { ...p, [k]: v }; saveUiPrefs(n); return n; });
  const [reqlog, setReqlog] = useState([]);

  // Show the tutorial once per login session, unless the user opted out ("次回から表示しない").
  useEffect(() => {
    try {
      if (uiPrefs.onboarding && !localStorage.getItem("rdm_tut_optout") && !sessionStorage.getItem("rdm_tut_seen")) {
        setTutorial(true);
        sessionStorage.setItem("rdm_tut_seen", "1");
      }
    } catch { /* ignore */ }
  }, []);
  function closeTutorial(dontShowAgain) {
    setTutorial(false);
    if (dontShowAgain) { try { localStorage.setItem("rdm_tut_optout", "1"); } catch { /* ignore */ } }
  }
  // keep the audio engine in sync with the sound display-pref
  useEffect(() => { Sound.setEnabled(uiPrefs.sound); }, [uiPrefs.sound]);

  // explore state
  const [nodeId, setNodeId] = useState("entrance");
  const [heading, setHeading] = useState(0);
  const [hp, setHp] = useState(78);
  const node = nodeById(nodeId);

  // possession sync completes when the DIVE video ends; a long fallback prevents hangs
  const syncDoneRef = useRef(false);
  function finishSync() {
    if (syncDoneRef.current) return;
    syncDoneRef.current = true;
    if (possessMode === "trial") setScreen("explore");
    else window.location.href = EXPLORE_URL;
  }
  useEffect(() => {
    if (screen !== "sync") return undefined;
    const id = setTimeout(finishSync, 12000); // fallback only
    return () => clearTimeout(id);
  }, [screen, possessMode]);

  useEffect(() => {
    if (screen === "explore" && hp <= 0) setScreen("shop");
  }, [hp, screen]);

  function openStore(s) {
    setStore(s); setProduct(PRODUCTS[0]); setScreen("storeGate");
    if (uiPrefs.storeTheme && s.theme) g.setTone(s.theme);
    try { if (uiPrefs.onboarding && !sessionStorage.getItem("rdm_welcomed")) { sessionStorage.setItem("rdm_welcomed", "1"); setWelcome(true); } } catch { /* ignore */ }
  }
  function startTrial() {
    setPossessMode("trial"); setHp(78);
    const sp = f.save ? loadSaveFor(store.id) : null;
    setNodeId(sp?.nodeId || "entrance"); setHeading(0); syncDoneRef.current = false; setScreen("sync"); Sound.sfx("dive");
    if (sp) g.toast(t.resumed, "ok");
  }
  function openToio() { if (g.spendXp(TOIO_COST, lang === "ja" ? "TOIOコーナー" : "TOIO corner")) setScreen("toio"); }
  function startPossess() { setPossessMode("external"); syncDoneRef.current = false; setScreen("sync"); Sound.sfx("dive"); }
  function request(p) { g.requestPurchase(p); tasteTrack(p, 3); setReqlog((l) => [`${local(p.name, lang)} · ${t.request}`, ...l].slice(0, 4)); }
  function moveTo(id) { setNodeId(id); setHp((v) => Math.max(0, v - 13)); g.move(); const n = nodeById(id); const fp = n.products.map((x) => PRODUCTS.find((p) => p.id === x))[0]; if (fp) setProduct(fp); }
  function scan(p) { setProduct(p); g.scan(p); tasteTrack(p, 1); Sound.sfx("scan"); }
  function saveAt() { setHp(100); writeSaveFor(store.id, nodeId); Sound.sfx("save"); g.toast(t.saved, "ok"); }
  function warpStore(id) { const s = storeById(id); if (!s) return; setStore(s); setNodeId("entrance"); setProduct(PRODUCTS[0]); setHp((v) => Math.max(20, v - 6)); if (uiPrefs.storeTheme && s.theme) g.setTone(s.theme); g.warp(); g.toast(local({ ja: `${s.name} ツインへワープ`, en: `Warped to ${s.name}` }, lang), "ok"); }

  const tone = g.tone;
  const themeClass = `neo tone-${tone || "cyber"}`;

  const header = (
    <Header t={t} g={g} f={f} onCart={() => setCartOpen(true)} onTutorial={() => setTutorial(true)} onTheme={() => setThemePicker(true)} onDisplay={() => setDispOpen(true)} onHome={() => setScreen("home")} conciergeOn={conciergeOn} onConcierge={toggleConcierge} />
  );

  let body;
  if (screen === "sync") {
    return (
      <div className={themeClass}>
        <Sync t={t} store={store} video={DIVE_VIDEO} onComplete={finishSync} />
        <Toasts toasts={g.toasts} />
      </div>
    );
  }
  if (screen === "explore") {
    return (
      <div className={themeClass}>
        <Explore t={t} lang={lang} g={g} f={f} prefs={uiPrefs} store={store} node={node} hp={hp}
          product={product} onScan={scan} onMove={moveTo}
          onRequest={request} onExit={() => setScreen("shop")} onWarp={warpStore}
          saveNode={f.save && SAVE_NODES.includes(node.id)} onSave={saveAt} onDisplay={() => setDispOpen(true)}
          conciergeOn={conciergeOn} onConcierge={toggleConcierge}
          onUpgrade={() => { window.location.href = EXPLORE_URL; }} />
        {dispOpen && <DisplaySettings t={t} prefs={uiPrefs} setPref={setPref} onClose={() => setDispOpen(false)} />}
        <Toasts toasts={g.toasts} />
      </div>
    );
  }
  if (screen === "sugoroku") {
    body = <Sugoroku t={t} lang={lang} g={g} onBack={() => setScreen("home")} />;
  } else if (screen === "collection") {
    body = <Collection t={t} lang={lang} g={g} onBack={() => setScreen("home")} onGoStore={openStore} />;
  } else if (screen === "toio") {
    body = <ToioCorner t={t} lang={lang} g={g} store={store} onBack={() => setScreen("shop")} />;
  } else if (screen === "storeGate") {
    body = <StoreGate t={t} lang={lang} g={g} f={f} store={store}
      onBack={() => setScreen("home")} onList={() => setScreen("shop")} onExplore={startTrial} />;
  } else if (screen === "shop") {
    body = <Shop t={t} lang={lang} g={g} f={f} store={store} product={product} reqlog={reqlog} toioCost={TOIO_COST}
      onBack={() => setScreen("home")} onProduct={setProduct} onRequest={request} onPossess={startPossess} onTrial={startTrial} onToio={openToio} />;
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
      {themePicker && <ThemePicker lang={lang} g={g} onClose={() => setThemePicker(false)} />}
      {dispOpen && <DisplaySettings t={t} prefs={uiPrefs} setPref={setPref} onClose={() => setDispOpen(false)} />}
      {conciergeOn && <Concierge t={t} lang={lang} g={g} onClose={toggleConcierge} onOpenStore={openStore} />}
      <Toasts toasts={g.toasts} />
    </div>
  );
}

function Header({ t, g, f, onCart, onTutorial, onTheme, onDisplay, onHome, conciergeOn, onConcierge }) {
  const homeHint = g.lang === "ja" ? "トップ（ホーム）へ" : "Back to top (home)";
  return (
    <header className="neoTop">
      <button className="neoBrand" onClick={onHome} title={homeHint} aria-label={homeHint}>
        <div className="neoLogo">R</div>
        <div><b>Remolink Discovery Mall</b><span>{g.lang === "ja" ? "クリックでトップへ" : "Click for top"}</span></div>
        <span className="neoLivePill"><i />LIVE</span>
      </button>
      {f.rank && (
        <div className="neoXp" title={g.lang === "ja" ? "あなたのランク（累計EXPで昇格）" : "Your rank (raised by lifetime EXP)"}>
          <div className="row"><span className="rank"><em className="tag">{g.lang === "ja" ? "ランク" : "RANK"}</em>{g.rank.rank.name}</span><span className="pts">{g.xp} XP{g.rank.next ? ` · 次まで ${g.rank.toNext}` : ""}</span></div>
          <div className="track"><div className="fill" style={{ width: g.rank.pct + "%" }} /></div>
        </div>
      )}
      <div className="neoActions">
        <button className="neoIcon home" onClick={onHome} title={homeHint}>🏠</button>
        <button className={"neoBtn neoConciergeBtn" + (conciergeOn ? " on" : "")} onClick={onConcierge} title={t.conciergeBtn}>
          💁 {t.conciergeBtn}{conciergeOn ? " ✓" : ""}
        </button>
        <button className="neoIcon" onClick={onDisplay} title={t.display}>🎛</button>
        <button className="neoIcon" onClick={onTutorial} title={g.lang === "ja" ? "使い方" : "How to play"}>?</button>
        <a className="neoIcon" href="#/admin" title="体験機能管理">⚙</a>
        <button className="neoBtn" onClick={() => g.setLang(g.lang === "ja" ? "en" : "ja")}>{g.lang === "ja" ? "EN" : "日本語"}</button>
        <button className="neoThemeBtn" onClick={onTheme} title={g.lang === "ja" ? "テーマを選ぶ" : "Choose theme"}>
          <span className="sw" />
          {g.lang === "ja" ? "テーマ" : "Theme"}
        </button>
        <button className="neoBtn solid neoCartBtn" onClick={onCart}>🛒 {t.cart}{g.cartCount > 0 && <i>{g.cartCount}</i>}</button>
      </div>
    </header>
  );
}

// Display-preferences popover: show/hide explanatory UI (defaults all ON).
function DisplaySettings({ t, prefs, setPref, onClose }) {
  const rows = [
    { k: "sound", label: t.prefSound, desc: t.prefSoundDesc },
    { k: "storeTheme", label: t.prefStoreTheme, desc: t.prefStoreThemeDesc },
    { k: "hud", label: t.prefHud, desc: t.prefHudDesc },
    { k: "promos", label: t.prefPromos, desc: t.prefPromosDesc },
    { k: "onboarding", label: t.prefOnboard, desc: t.prefOnboardDesc }
  ];
  return (
    <>
      <div className="thScrim" onClick={onClose} />
      <div className="thPop dispPop" role="dialog">
        <div className="thHead">
          <div><b>🎛 {t.display}</b><small>{t.displayDesc}</small></div>
          <button className="close" onClick={onClose}>×</button>
        </div>
        <div className="dispRows">
          {rows.map((r) => (
            <button key={r.k} className={"dispRow" + (prefs[r.k] ? " on" : "")} onClick={() => setPref(r.k, !prefs[r.k])} role="switch" aria-checked={!!prefs[r.k]}>
              <div className="txt"><b>{r.label}</b><small>{r.desc}</small></div>
              <span className="sw"><i /></span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
function Home({ t, lang, g, f, store, setStore, onOpenStore, onSugoroku, onCollection }) {
  const [hover, setHover] = useState(null);
  const linked = hover || store.id;

  const players = useMemo(() => {
    const list = [...LEADERBOARD, { name: "YOU", xp: g.xp, you: true }].sort((a, b) => b.xp - a.xp);
    return list;
  }, [g.xp]);

  return (
    <main className="neoHome">
      <section className="neoHero">
        <div className="neoHeroBg" style={{ backgroundImage: `url(${HERO_IMAGE})` }} aria-hidden="true" />
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
          {STORES.map((s) => (
            <button key={s.id} className={"neoPin" + (s.id === store.id ? " active" : "") + (s.id === linked ? " linked" : "")}
              style={s.pin} onMouseEnter={() => setHover(s.id)} onMouseLeave={() => setHover(null)}
              onClick={() => setStore(s)} aria-label={s.name}>
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

      <div className="neoPanel neoStores" style={{ marginTop: 22 }}>
        <div className="neoStoresHead">
          <div>
            <p className="eyebrow">REGISTERED STORES · {STORES.length}</p>
            <h2>{lang === "ja" ? "登録店舗一覧" : "All registered stores"}</h2>
          </div>
          <span className="saleTotal">🔥 {lang === "ja" ? `${STORES.filter((s) => s.hot).length}店舗でセール中！` : `${STORES.filter((s) => s.hot).length} stores ON SALE!`}</span>
        </div>
        <div className="neoStoresGrid">
          {STORES.map((s) => (
            <button key={s.id} className={"neoStore" + (s.hot ? " hot" : "") + (s.id === store.id ? " active" : "")}
              onClick={() => onOpenStore(s)} onMouseEnter={() => setHover(s.id)} onMouseLeave={() => setHover(null)}>
              <img src={s.image} alt="" />
              <i>{s.hot ? "🔥 SALE" : "LIVE"}</i>
              {s.hot && <span className="ribbon">{lang === "ja" ? "今だけ特価" : "LIMITED DEAL"}</span>}
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

// Floating concierge — global (home/list). Uses Remi (cute girl android) and
// taste-based recommendations. Script-based (not a chat LLM).
function Concierge({ t, lang, g, onClose, onOpenStore }) {
  const L = (ja, en) => (lang === "ja" ? ja : en);
  const saleStores = useMemo(() => STORES.filter((s) => s.hot), []);
  // taste-based pick (refreshes when scanned set changes — i.e. taste was updated)
  const [tick, setTick] = useState(0);
  const { product: pick, hasHistory } = useMemo(() => tastePick([]), [tick, g.scannedIds.length]);
  const greet = L("こんにちは、案内係の Remi だよ♪ お買い物、ナビゲートするね！", "Hi, I'm Remi, your guide ♪ Let me navigate your shopping!");
  const recoLine = hasHistory
    ? L(`今日のおすすめは、この「${pick.name}」よ！ ${pick.rarity} ✨`, `Today's pick for you: "${pick.name}"! ${pick.rarity} ✨`)
    : L(`まずは「${pick.name}」(${pick.price}) はどうかな？ ✨`, `How about "${pick.name}" (${pick.price})? ✨`);
  const lines = useMemo(() => [
    greet,
    recoLine,
    L(`今 🔥 ${saleStores.length} 店舗でセール中だよ！チェックしてね！`, `🔥 ${saleStores.length} stores ON SALE — check them out!`),
    L("店舗ロボに「憑依（DIVE）」して、店内を歩き回ってみよう！", "DIVE into a store robot and walk the aisles!"),
    L("商品をスキャンするほど、おすすめがあなた好みに育つよ♪", "The more you scan, the more I learn your taste ♪"),
    L("ランクは累計EXPで上がる称号。買い物しても下がらないから安心♪", "Rank is your lifetime-EXP title — it never drops."),
  ], [pick.id, saleStores.length, lang, hasHistory]);
  const [i, setI] = useState(0);
  useEffect(() => { const id = setInterval(() => setI((v) => (v + 1) % lines.length), 5400); return () => clearInterval(id); }, [lines.length]);
  function next() { setI((v) => (v + 1) % lines.length); setTick((x) => x + 1); }
  function gotoSale() { const s = saleStores[0]; if (s) onOpenStore(s); }
  function showPick() { g.toast(`✨ ${L("今日のおすすめ", "Today's pick")}: ${pick.name} (${pick.price})`, "ok"); }
  return (
    <div className="neoConcierge" role="dialog" aria-live="polite">
      <div className="ccBubble" onClick={next} title={L("次のメッセージへ", "Next message")}>
        <p>{lines[i]}</p>
        <div className="ccChips">
          <button onClick={(e) => { e.stopPropagation(); showPick(); }}>✨ {L("おすすめ", "Pick")}</button>
          <button onClick={(e) => { e.stopPropagation(); gotoSale(); }} disabled={!saleStores.length}>🔥 {L("セール店舗へ", "Sale store")}</button>
          <button onClick={(e) => { e.stopPropagation(); next(); }}>💬 {L("次へ", "Next")}</button>
        </div>
        <button className="ccClose" onClick={(e) => { e.stopPropagation(); onClose(); }} aria-label="close">×</button>
      </div>
      <div className="ccMascot"><ConciergeGirl size={108} /></div>
    </div>
  );
}

// Big in-explore concierge (Monster Farm-style portrait + bubble). Placed bottom-left,
// clear of the dock/pad/treasure. Toggleable on/off from the explore top bar.
function DiveConcierge({ lang, g, store, node, productHere, onScan, onClose }) {
  const L = (ja, en) => (lang === "ja" ? ja : en);
  // recommend an item the player will like — prefer something on THIS node
  const shelf = (node?.products || []).map((id) => PRODUCTS.find((p) => p.id === id)).filter(Boolean);
  const [tick, setTick] = useState(0);
  const reco = useMemo(() => {
    const t = loadTaste();
    const gs = t.group || {}, rs = t.rarity || {}, ps = t.products || {};
    const list = shelf.length ? shelf : PRODUCTS;
    const ranked = list
      .map((p) => ({ p, s: (gs[p.group] || 0) * 2 + (rs[p.rarity] || 0) - (ps[p.id] || 0) * 0.5 + Math.random() * 0.4 }))
      .sort((a, b) => b.s - a.s);
    return { product: ranked[0]?.p || list[0], hasHistory: (t.events || 0) >= 3, onShelf: shelf.length > 0 };
  }, [tick, node?.id, g.scannedIds.length, store?.id]);
  const r = reco.product;
  const onShelfNow = shelf.some((p) => p.id === r.id);

  const messages = useMemo(() => {
    const arr = [
      L(`ここは「${local(node?.label, lang)}」ね。気になるもの、見つけた？`,
        `We're at "${local(node?.label, lang)}". Found anything you like?`),
      onShelfNow
        ? L(`今日のおすすめは、この「${r.name}」よ！ ${r.rarity} ✨ 棚にあるよ♪`,
            `Today's pick: "${r.name}"! ${r.rarity} ✨ It's right on this shelf ♪`)
        : L(`「${r.name}」(${r.price})、あなたに似合いそう！ 探しに行こ♪`,
            `"${r.name}" (${r.price}) seems perfect for you — let's go find it ♪`),
      reco.hasHistory
        ? L("あなたの好みが分かってきたよ♪ もっとスキャンしてね！", "I'm learning your taste ♪ Keep scanning!")
        : L("商品をスキャンすればするほど、私はあなた専属になるよ♪", "The more you scan, the more personal I become ♪"),
      productHere && productHere.id !== r.id
        ? L(`今見てる「${productHere.name}」もイイ感じ！ ${productHere.rarity}`,
            `That "${productHere.name}" looks great too! ${productHere.rarity}`)
        : L("棚の前で長押し＝詳細、タップ＝キャプチャ♪", "Long-press shelf items for details, tap to capture ♪"),
    ];
    return arr;
  }, [r.id, node?.id, lang, onShelfNow, productHere?.id, reco.hasHistory]);

  const [i, setI] = useState(0);
  useEffect(() => { setI(0); }, [node?.id]);
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % messages.length), 6200);
    return () => clearInterval(id);
  }, [messages.length]);
  function next() { setI((v) => (v + 1) % messages.length); setTick((x) => x + 1); }
  function pickIt() {
    g.toast(`✨ Remi: ${L("これがおすすめ", "My pick")}: ${r.name} (${r.price})`, "ok");
    // count this as taste data too
    tasteTrack(r, 0.4);
  }
  function scanReco() {
    if (onShelfNow && onScan) { onScan(r); }
    else { g.toast(L(`「${r.name}」は別の棚にあるよ！`, `"${r.name}" is on another shelf!`), "info"); }
  }

  return (
    <aside className="neoDiveConcierge" role="dialog" aria-live="polite">
      <div className="dcFrame">
        <div className="dcBubble" onClick={next} title={L("次のメッセージへ", "Next")}>
          <p>{messages[i]}</p>
          <div className="dcReco">
            <img src={r.image} alt="" />
            <div>
              <span className="rar">{r.rarity}</span>
              <b>{r.name}</b>
              <small>{r.price}{onShelfNow ? L(" · ここの棚", " · on this shelf") : ""}</small>
            </div>
          </div>
          <div className="dcChips">
            <button onClick={(e) => { e.stopPropagation(); pickIt(); }}>✨ {L("おすすめ", "Pick")}</button>
            <button onClick={(e) => { e.stopPropagation(); scanReco(); }} disabled={!onShelfNow}>📸 {L("これスキャン", "Scan it")}</button>
            <button onClick={(e) => { e.stopPropagation(); next(); }}>💬 {L("次へ", "Next")}</button>
          </div>
          <button className="dcClose" onClick={(e) => { e.stopPropagation(); onClose(); }} aria-label="close">×</button>
        </div>
        <div className="dcPortrait">
          <ConciergeGirl size={150} className="dcGirl" />
          <span className="dcName">Remi <em>♪</em></span>
        </div>
      </div>
    </aside>
  );
}

// Brand guide character "Remo". Uses the provided render if present at
// public/assets/generated/mascot-robot.png, otherwise an on-brand inline SVG.
function MascotRobot({ size = 140, className = "" }) {
  const [useImg, setUseImg] = useState(true);
  const src = asset("assets/generated/mascot-robot.png");
  if (useImg) {
    return (
      <img className={"mascotImg " + className} src={src} alt="Remo"
        style={{ width: size, height: "auto" }} onError={() => setUseImg(false)} />
    );
  }
  return (
    <svg className={"mascotSvg " + className} width={size} height={size * 1.18} viewBox="0 0 120 142" role="img" aria-label="Remo">
      <defs>
        <linearGradient id="mbody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fdfefe" /><stop offset="1" stopColor="#d8e0ea" />
        </linearGradient>
        <radialGradient id="meye" cx="50%" cy="40%" r="60%">
          <stop offset="0" stopColor="#9fd6ff" /><stop offset="1" stopColor="#2f97ff" />
        </radialGradient>
      </defs>
      {/* shoulders / chest */}
      <ellipse cx="28" cy="120" rx="20" ry="17" fill="#171c27" />
      <ellipse cx="92" cy="120" rx="20" ry="17" fill="#171c27" />
      <path d="M60 88c20 0 33 12 33 30v18H27v-18c0-18 13-30 33-30z" fill="url(#mbody)" stroke="#c2cdda" strokeWidth="1.5" />
      <circle cx="60" cy="86" r="9" fill="#171c27" />
      {/* side ear bumps */}
      <circle cx="22" cy="44" r="11" fill="#171c27" />
      <circle cx="98" cy="44" r="11" fill="#171c27" />
      {/* head dome */}
      <rect x="20" y="10" width="80" height="72" rx="34" fill="url(#mbody)" stroke="#c2cdda" strokeWidth="1.6" />
      {/* face screen */}
      <rect x="31" y="22" width="58" height="48" rx="22" fill="#0a0d15" />
      {/* eyes */}
      <rect x="44" y="36" width="9" height="17" rx="4.5" fill="url(#meye)" />
      <rect x="67" y="36" width="9" height="17" rx="4.5" fill="url(#meye)" />
      {/* smile */}
      <path d="M48 58q12 9 24 0" stroke="url(#meye)" strokeWidth="3.4" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// "Lumina" (STELLA-07) — next-gen android idol concierge. Tries to use a provided
// poster render at public/assets/generated/concierge.png; falls back to inline SVG.
function ConciergeGirl({ size = 180, className = "" }) {
  const [useImg, setUseImg] = useState(true);
  const src = asset("assets/generated/concierge.png");
  if (useImg) {
    return (
      <img className={"conciergeImg " + className} src={src} alt="Remi"
        style={{ width: size, height: "auto" }} onError={() => setUseImg(false)} />
    );
  }
  // SVG fallback: full-body lavender idol android — star crown, long flowing hair,
  // big violet eyes, white/purple armor, crystalline holographic skirt, glowing joints.
  const w = size, h = size * 2.0;
  return (
    <svg className={"conciergeSvg " + className} width={w} height={h} viewBox="0 0 130 260" role="img" aria-label="Lumina">
      <defs>
        <linearGradient id="luHair" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#efe0ff" /><stop offset=".5" stopColor="#cba9ff" /><stop offset="1" stopColor="#a87bff" />
        </linearGradient>
        <linearGradient id="luSkin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff9ff" /><stop offset="1" stopColor="#f0e6ff" />
        </linearGradient>
        <linearGradient id="luArmor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#dccbff" />
        </linearGradient>
        <linearGradient id="luSkirt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e0ccff" stopOpacity=".95" /><stop offset="1" stopColor="#a9c9ff" stopOpacity=".5" />
        </linearGradient>
        <radialGradient id="luEye" cx="42%" cy="32%" r="72%">
          <stop offset="0" stopColor="#f6e6ff" /><stop offset=".5" stopColor="#b483ff" /><stop offset="1" stopColor="#7a3df0" />
        </radialGradient>
        <radialGradient id="luCore" cx="50%" cy="50%" r="60%">
          <stop offset="0" stopColor="#ffffff" /><stop offset=".5" stopColor="#d6a6ff" /><stop offset="1" stopColor="#7a3df0" />
        </radialGradient>
      </defs>

      {/* long flowing back hair */}
      <path d="M38 30 Q65 6 92 30 Q108 50 102 84 L28 84 Q22 50 38 30 Z" fill="url(#luHair)" />
      <path d="M30 60 Q6 116 18 196 Q24 156 35 120 Q30 92 42 72 Z" fill="url(#luHair)" />
      <path d="M100 60 Q124 116 112 196 Q106 156 95 120 Q100 92 88 72 Z" fill="url(#luHair)" />

      {/* star crown */}
      <path d="M65 2 l3.4 8 8.6 .8 -6.4 5.8 1.9 8.4 -7.5 -4.4 -7.5 4.4 1.9 -8.4 -6.4 -5.8 8.6 -.8 z" fill="#fff" stroke="#cba9ff" strokeWidth="1" />
      <circle cx="50" cy="16" r="1.4" fill="#fff" /><circle cx="82" cy="14" r="1.6" fill="#fff" />

      {/* headphone ear pods */}
      <circle cx="41" cy="50" r="8" fill="#fff" stroke="#b483ff" strokeWidth="1.6" />
      <circle cx="41" cy="50" r="3" fill="#b483ff" />
      <circle cx="89" cy="50" r="8" fill="#fff" stroke="#b483ff" strokeWidth="1.6" />
      <circle cx="89" cy="50" r="3" fill="#b483ff" />

      {/* face */}
      <ellipse cx="65" cy="46" rx="19" ry="21" fill="url(#luSkin)" stroke="#e7d2ff" strokeWidth="1" />
      {/* fringe */}
      <path d="M46 44 Q49 22 65 20 Q81 22 84 44 Q74 33 65 33 Q56 33 46 44 Z" fill="url(#luHair)" />
      {/* blush */}
      <ellipse cx="54" cy="54" rx="3.4" ry="1.8" fill="#ffb3e0" opacity=".7" />
      <ellipse cx="76" cy="54" rx="3.4" ry="1.8" fill="#ffb3e0" opacity=".7" />
      {/* eyes */}
      <ellipse cx="57" cy="48" rx="5" ry="7" fill="url(#luEye)" />
      <ellipse cx="73" cy="48" rx="5" ry="7" fill="url(#luEye)" />
      <circle cx="55.4" cy="45.4" r="1.6" fill="#fff" /><circle cx="71.4" cy="45.4" r="1.6" fill="#fff" />
      <path d="M51 43 q4-2.5 8-1.5" stroke="#5a2f8a" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <path d="M71 43 q4-2.5 8-1.5" stroke="#5a2f8a" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      {/* smile */}
      <path d="M59 58 q6 4 12 0" stroke="#b85ca8" strokeWidth="1.6" fill="none" strokeLinecap="round" />

      {/* neck */}
      <rect x="60" y="64" width="10" height="9" rx="3" fill="#e7d6ff" />

      {/* torso armor */}
      <path d="M44 78 Q44 72 56 72 L74 72 Q86 72 86 78 L88 118 Q65 128 42 118 Z" fill="url(#luArmor)" stroke="#c9b3ff" strokeWidth="1" />
      <circle cx="46" cy="84" r="3" fill="#d6a6ff" /><circle cx="84" cy="84" r="3" fill="#d6a6ff" />
      {/* star core on chest */}
      <g transform="translate(65 96)">
        <path d="M0 -7.5 l2.2 4.8 5.3 .4 -4 3.6 1.2 5.2 -4.7 -2.8 -4.7 2.8 1.2 -5.2 -4 -3.6 5.3 -.4 z" fill="url(#luCore)" stroke="#fff" strokeWidth=".6" />
      </g>

      {/* arms (mechanical, idol gesture) */}
      <path d="M44 80 Q30 92 25 120" stroke="#cdbaff" strokeWidth="5.5" fill="none" strokeLinecap="round" />
      <circle cx="25" cy="122" r="4" fill="#fff" stroke="#b483ff" strokeWidth="1.4" />
      <path d="M86 80 Q97 96 92 116" stroke="#cdbaff" strokeWidth="5.5" fill="none" strokeLinecap="round" />
      <circle cx="92" cy="118" r="4" fill="#fff" stroke="#b483ff" strokeWidth="1.4" />

      {/* waist gem */}
      <path d="M60 116 l5 0 -2.5 7 z" fill="url(#luCore)" />

      {/* crystalline holographic skirt */}
      <g>
        <path d="M42 118 L88 118 L104 170 L26 170 Z" fill="url(#luSkirt)" stroke="#c9b3ff" strokeWidth=".8" />
        <path d="M49 121 L81 121 L93 160 L37 160 Z" fill="#ece0ff" opacity=".45" />
        <path d="M65 120 L65 170 M53 122 L41 168 M77 122 L89 168" stroke="#fff" strokeWidth=".5" opacity=".6" />
      </g>

      {/* legs (mechanical, glowing knees) */}
      <path d="M56 168 q-3 40 -2 78 l9 0 q1 -38 2 -78 z" fill="url(#luArmor)" stroke="#c9b3ff" strokeWidth=".8" />
      <path d="M68 168 q1 40 2 78 l9 0 q-1 -38 2 -78 z" fill="url(#luArmor)" stroke="#c9b3ff" strokeWidth=".8" />
      <circle cx="58" cy="206" r="3.4" fill="#d6a6ff" /><circle cx="74" cy="206" r="3.4" fill="#d6a6ff" />

      {/* crystalline boots */}
      <path d="M51 244 l13 0 4 13 -21 0 z" fill="url(#luSkirt)" stroke="#c9b3ff" strokeWidth=".8" />
      <path d="M68 244 l13 0 4 13 -21 0 z" fill="url(#luSkirt)" stroke="#c9b3ff" strokeWidth=".8" />

      {/* sparkles */}
      <g fill="#fff">
        <circle cx="18" cy="40" r="1.4" /><circle cx="112" cy="64" r="1.6" /><circle cx="118" cy="34" r="1.2" />
        <path d="M20 150 l1.4 3 3 1.4 -3 1.4 -1.4 3 -1.4 -3 -3 -1.4 3 -1.4 z" />
        <path d="M106 138 l1.4 3 3 1.4 -3 1.4 -1.4 3 -1.4 -3 -3 -1.4 3 -1.4 z" />
      </g>
    </svg>
  );
}

// Rotating ad / event / discount banner shown during exploration.
function ExplorePromo({ lang }) {
  const [i, setI] = useState(0);
  const [show, setShow] = useState(true);
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % EXPLORE_PROMOS.length), 5200);
    return () => clearInterval(id);
  }, []);
  if (!show) return null;
  const p = EXPLORE_PROMOS[i];
  return (
    <div className="neoPromoBanner neoGlass" key={i}>
      <span className="ic">{p.icon}</span>
      <div className="txt"><span className="tag">{local(p.tag, lang)}</span><b>{local(p.title, lang)}</b></div>
      <button className="x" onClick={() => setShow(false)} aria-label="close">×</button>
    </div>
  );
}

// Store entry: choose between the product list and in-store exploration,
// with promo / event / discount info nudging toward exploration.
function StoreGate({ t, lang, g, f, store, onBack, onList, onExplore }) {
  return (
    <main className="neoGate">
      <button className="neoBtn neoBack" onClick={onBack}>{t.back}</button>

      <section className="gateHero neoPanel">
        <div className="gateMascot">
          <MascotRobot size={150} />
          <span className="gateBubble">{lang === "ja" ? "さあ、憑依しよう！" : "Let's DIVE in!"}</span>
        </div>
        <div className="gateIntro">
          <p className="eyebrow">{t.gateLead} · {local(store.area, lang)}</p>
          <h1>{store.name}</h1>
          <p className="gateQ">{lang === "ja" ? "店舗ロボに憑依して店内を探索しよう。" : "Possess a store robot and explore inside."}</p>
        </div>
      </section>

      {/* primary action: DIVE */}
      <button className="gateDiveCta" onClick={onExplore}>
        <span className="badge">{t.recommend}</span>
        <span className="ic">🤖⚡</span>
        <b>{t.gateExplore}</b>
        <small>{t.gateExploreDesc}</small>
        <span className="go">DIVE →</span>
      </button>

      <section className="gatePromos neoPanel">
        <div className="neoPanelTitle">{t.gatePromo}</div>
        <div className="promoGrid">
          {EXPLORE_PROMOS.map((p, i) => (
            <div className="promoCard" key={i}>
              <span className="ic">{p.icon}</span>
              <div className="pc">
                <span className="tag">{local(p.tag, lang)}</span>
                <b>{local(p.title, lang)}</b>
                <small>{local(p.body, lang)}</small>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* secondary, low-key: normal EC product list */}
      <button className="gateListLink" onClick={onList}>🛍 {t.gateListLink}</button>
    </main>
  );
}

function Shop({ t, lang, g, f, store, product, reqlog, toioCost, onBack, onProduct, onRequest, onPossess, onTrial, onToio }) {
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

        {f.toio && (
          <div className="neoPanel neoToioCard">
            <p className="eyebrow">MINIATURE CAMERA · TOIO</p>
            <h2>🛺 {lang === "ja" ? "TOIOミニチュアコーナー" : "TOIO miniature corner"}</h2>
            <p className="desc">{lang === "ja" ? "ミニチュア店内をTOIO走行カメラで巡り、キーホルダーや缶バッジを選んで景品 or 購入。" : "Drive the TOIO camera through a miniature store; pick keyrings or badges as a prize or buy."}</p>
            <button className="neoBtn block toio" onClick={onToio}>🎟 {lang === "ja" ? `EXP ${toioCost} で遊ぶ` : `Play for ${toioCost} EXP`}</button>
          </div>
        )}

        <div className="neoPanel neoReqlog">
          <div className="neoPanelTitle">REQUEST LOG</div>
          {reqlog.length === 0 ? <p>{t.reqEmpty}</p> : reqlog.map((r, i) => <p key={i}>{r}</p>)}
        </div>
      </aside>
    </main>
  );
}

function Sync({ t, store, video, onComplete }) {
  const vref = useRef(null);
  useEffect(() => {
    const v = vref.current;
    if (!v) { return undefined; }
    let metaTimer = null;
    const onEnd = () => onComplete && onComplete();
    const onErr = () => onComplete && onComplete(); // if the video fails, proceed anyway
    const onMeta = () => { if (v.duration && isFinite(v.duration)) { clearTimeout(metaTimer); metaTimer = setTimeout(onEnd, (v.duration + 0.6) * 1000); } }; // ends ~at clip length even if 'ended' is flaky
    v.addEventListener("ended", onEnd);
    v.addEventListener("error", onErr);
    v.addEventListener("loadedmetadata", onMeta);
    if (v.readyState >= 1) onMeta();
    const p = v.play(); if (p && p.catch) p.catch(() => { /* muted autoplay should be allowed; fallback timer covers edge cases */ });
    return () => { clearTimeout(metaTimer); v.removeEventListener("ended", onEnd); v.removeEventListener("error", onErr); v.removeEventListener("loadedmetadata", onMeta); };
  }, []);
  return (
    <div className="neoSync">
      {video
        ? <video ref={vref} className="neoSyncVideo" src={video} muted playsInline autoPlay preload="auto" />
        : (<>
            <img src={TRANSFER_IMAGE} alt="" />
            <div className="neoTunnel">{Array.from({ length: 9 }).map((_, i) => <span key={i} style={{ "--i": i }} />)}</div>
          </>)}
      <div className="neoSpeed" />
      <div className="neoSyncCore"><span>ROBOT POSSESSION · 憑依 · DIVE</span><h1>{t.sync}</h1><p>{store.name} · AUTH OK · 360 CAMERA · QR READY</p></div>
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

// Spinning circus-tent save-point icon (replaces the floppy disk).
function TentIcon({ size = 42, spin = true }) {
  const xs = [6, 15, 24, 32, 40, 49, 58];
  const wedges = xs.slice(0, -1).map((x, i) => ({ pts: `32,13 ${x},45 ${xs[i + 1]},45`, c: i % 2 ? "var(--acc-2)" : "#fff4e6" }));
  return (
    <svg className={"tentSvg" + (spin ? " spin" : "")} width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      {wedges.map((w, i) => <polygon key={i} points={w.pts} fill={w.c} stroke="rgba(0,0,0,.16)" strokeWidth="0.4" />)}
      <path d="M6 45 Q11 50 16 45 Q21 50 26 45 Q32 50 38 45 Q43 50 48 45 Q53 50 58 45" fill="none" stroke="var(--acc-2)" strokeWidth="2" strokeLinejoin="round" />
      <line x1="32" y1="13" x2="32" y2="5" stroke="var(--acc)" strokeWidth="1.6" />
      <polygon points="32,4 42,7 32,10" fill="var(--acc)" />
    </svg>
  );
}

function Explore({ t, lang, g, f, prefs = {}, store, node, hp, product, onScan, onMove, onRequest, onExit, onWarp, onUpgrade, saveNode, onSave, onDisplay, conciergeOn, onConcierge }) {
  const [warping, setWarping] = useState(false);
  const [warpTarget, setWarpTarget] = useState(null);
  const [pos, setPos] = useState(0);       // 0..steps-1 along the street-view sequence
  const [heading, setHeading] = useState("forward"); // forward | left | right
  const [elev, setElev] = useState(0);     // -2..2 camera elevation (up/down only)
  const [picked, setPicked] = useState(null); // product popup (only on tap)
  const [saving, setSaving] = useState(false); // save-point dialog
  const [capturing, setCapturing] = useState(null); // product being "captured" (camera flash)
  const lpRef = useRef(null); // long-press tracking for dock items
  const [upsell, setUpsell] = useState(false);
  useEffect(() => { if (f.paidUpgrade && node.id === "limited") setUpsell(true); }, [node.id, f.paidUpgrade]);
  // arriving at a new node (minimap / warp / corridor end) resets the walk + closes popup
  useEffect(() => { setPos(0); setHeading("forward"); setElev(0); setPicked(null); setCapturing(null); }, [node.id]);
  // per-area BGM whose musical STYLE follows the selected theme; stop when leaving
  useEffect(() => { Sound.playArea(node.id, g.tone); }, [node.id, g.tone]);
  useEffect(() => () => Sound.stopBgm(), []);
  const shelf = node.products.map((id) => PRODUCTS.find((p) => p.id === id)).filter(Boolean);
  const neighbors = f.openWorld ? neighborsOf(store.id) : [];
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const last = STREETVIEW.steps - 1;
  const svSrc = (STREETVIEW[heading] || STREETVIEW.forward)[clamp(pos, 0, last)];
  // camera elevation actually pans the view vertically: over-scale the still so there is
  // vertical headroom, then translate it (up = reveal higher shelves, down = reveal floor)
  const feedStyle = { transform: `scale(1.22) translateY(${clamp(elev * 4.5, -9, 9)}%)` };
  // neighbour stores shown on the minimap as directional exits (up/right/down/left)
  const DIRS = ["up", "right", "down", "left"];
  const DIR_ARROW = { up: "↑", right: "→", down: "↓", left: "←" };
  const gates = neighbors.slice(0, 4).map((id, i) => ({ id, name: storeById(id).name, dir: DIRS[i] }));
  // rare "dowsing": louder/faster pings the closer you are to the store's hidden rare
  const rare = f.collection ? rareByStore(store.id) : null;
  const rareGot = rare ? g.collection.includes(rare.id) : true;
  const dowseLvl = (rare && !rareGot)
    ? (() => { const d = nodeDistance(node.id, rareNodeFor(store.id)); return d === 0 ? 0.72 + 0.28 * (pos / Math.max(1, last)) : Math.max(0.08, 1 - d / (NODE_MAX_DIST + 1)) * 0.6; })()
    : 0;
  useEffect(() => { Sound.dowse(dowseLvl); }, [dowseLvl]);
  useEffect(() => () => Sound.dowse(0), []);
  function hunt() {
    if (Math.random() > 0.55) { g.toast(local({ ja: "何も無かった…", en: "Nothing here…" }, lang)); return; }
    const res = g.huntRare(store.id); Sound.sfx("treasure");
    g.toast(`${t.getRare} ${local(res.item.name, lang)} [${res.item.rarity}]`, res.isNew ? "ok" : "info");
  }
  function warp(id) { if (warping) return; Sound.sfx("warp"); setWarpTarget(storeById(id)); setWarping(true); setTimeout(() => { onWarp(id); setWarping(false); setWarpTarget(null); }, 2600); }
  // capture (= photograph/scan) a product: camera-flash animation + register the scan
  function capture(p) {
    setPicked(null); setCapturing(p); onScan(p);
    setTimeout(() => setCapturing((c) => (c && c.id === p.id ? null : c)), 850);
  }
  // touch: short tap = capture ; long-press = overlay product info
  function pressStart(p) {
    pressCancel();
    lpRef.current = { id: p.id, long: false, timer: setTimeout(() => { if (lpRef.current) { lpRef.current.long = true; setPicked(p); } }, 420) };
  }
  function pressEnd(p) {
    const s = lpRef.current; if (!s || s.id !== p.id) { pressCancel(); return; }
    clearTimeout(s.timer); if (!s.long) capture(p); lpRef.current = null;
  }
  function pressCancel() { if (lpRef.current) { clearTimeout(lpRef.current.timer); lpRef.current = null; } }
  // street-view movement: ▲ forward / ▼ back ; reaching the corridor end walks to the next area
  function fwd() {
    setHeading("forward");
    if (pos < last) { setPos((v) => v + 1); g.move(); }
    else if (node.next[0]) { onMove(node.next[0]); } // node change resets pos via effect
  }
  function back() {
    setHeading("forward");
    setPos((v) => Math.max(0, v - 1));
  }
  // ◀▶ peek into the side shelves; press again toward front to face forward
  const turnLeft = () => setHeading((h) => (h === "right" ? "forward" : "left"));
  const turnRight = () => setHeading((h) => (h === "left" ? "forward" : "right"));
  const facing = heading === "forward" ? t.faceFront : (heading === "left" ? t.peekLeft : t.peekRight);
  const headLabel = heading === "forward" ? `${pos + 1}/${STREETVIEW.steps}` : (heading === "left" ? "👁◀" : "▶👁");

  if (warping) {
    return (
      <div className="neoSync">
        <div className="neoTunnel">{Array.from({ length: 9 }).map((_, i) => <span key={i} style={{ "--i": i }} />)}</div>
        <div className="neoSpeed" />
        <div className="neoSyncCore"><span>STORE TRANSFER</span><h1>{warpTarget?.name}</h1><p>SYNCING DIGITAL TWIN…</p></div>
      </div>
    );
  }

  const pickedScanned = picked && g.scannedIds.includes(picked.id);

  return (
    <div className="neoEx">
      <img className={"neoFeedImg sv-" + heading} key={heading + pos} src={svSrc} alt="" style={feedStyle} draggable="false" />
      <div className="neoExShade" />

      <header className="neoExTop neoGlass">
        <span className="rec">● LIVE</span><b>{store.name}</b><span className="nd">{local(node.label, lang)}</span>
        <span className="sp">⚡ {hp}</span>
        {f.rank && <span className="rk">{lang === "ja" ? "ランク" : "RANK"} {g.rank.rank.name} · {g.xp}XP</span>}
        <span className="ct">🛒 {g.cartCount}</span>
        <button className={"ccX" + (conciergeOn ? " on" : "")} onClick={onConcierge}
          title={conciergeOn ? t.conciergeOff : t.conciergeOn}
          aria-label={conciergeOn ? t.conciergeOff : t.conciergeOn}>
          💁{conciergeOn ? " ✓" : ""}
        </button>
        <button className="dispX" onClick={onDisplay} title={t.display}>🎛</button>
        <button className="exitX" onClick={() => setTimeout(onExit, 0)} title={t.exit}>✕ {t.exit}</button>
      </header>

      {prefs.promos && <ExplorePromo lang={lang} />}

      {f.treasure && <button className="neoTreasureBtn" onClick={hunt}>🎁 {t.treasure}</button>}

      {/* FF-style save point — glowing marker you step on */}
      {saveNode && (
        <button className="neoSavePoint" onClick={() => setSaving(true)} title={t.savePoint} aria-label={t.savePoint}>
          <TentIcon size={26} spin={false} />
        </button>
      )}

      {f.twin && (
        <aside className="neoTwinMini neoGlass">
          <div className="neoPanelTitle">{t.floor} · DIGITAL TWIN</div>
          <div className="holder">
            <TwinFloor node={node} onMove={onMove} mini shelves={shelvesForStore(store.id)} exits={neighbors.length} />
            {f.openWorld && gates.map((gt) => (
              <button key={gt.id} className={"twinDir " + gt.dir} onClick={() => warp(gt.id)} title={`${t.goLabel}: ${gt.name}`}>
                <span className="ar">{DIR_ARROW[gt.dir]}</span><span className="nm">{gt.name}</span>
              </button>
            ))}
          </div>
        </aside>
      )}

      {/* product detail popup — ONLY shown when a specific item is tapped; sits above the dock, clear of the controller */}
      {picked && (
        <aside className="neoItemCard neoGlass">
          <button className="x" onClick={() => setPicked(null)} aria-label="close">×</button>
          <div className="head"><img src={picked.image} alt="" /><div><p className="eyebrow">{pickedScanned ? t.scanned : "QR · " + picked.shelf}</p><h2>{picked.name}</h2><span className="pr">{picked.price}</span></div></div>
          {f.ar && (
            <dl><div><dt>{t.shelf}</dt><dd>{picked.shelf}</dd></div><div><dt>RARITY</dt><dd>{picked.rarity}</dd></div><div><dt>XP</dt><dd>+{picked.xp}</dd></div></dl>
          )}
          {pickedScanned
            ? <button className="neoBtn solid block" onClick={() => onRequest(picked)}>{t.request}</button>
            : <button className="neoBtn solid block" onClick={() => onScan(picked)}>{t.scan}</button>}
          <button className="neoBtn block cart" onClick={() => { g.addToCart(picked, 1); tasteTrack(picked, 2); g.toast(`🛒 ${t.addedCart}: ${picked.name}`, "ok"); }}>🛒 {t.addCart}</button>
        </aside>
      )}

      {/* capturing animation (camera flash + scan reticle) */}
      {capturing && (
        <div className="neoCapture">
          <div className="reticle">
            <img src={capturing.image} alt="" />
            <span className="c tl" /><span className="c tr" /><span className="c bl" /><span className="c br" />
            <span className="scanline" />
            <b>📸 {t.captured} ✓</b>
            <small>{capturing.name}</small>
          </div>
          <div className="flash" />
        </div>
      )}

      {/* control zone: products dock (left) + movement pad (right) */}
      <div className="neoCtl">
        <div className="neoDock neoGlass">
          <span className="lbl">{shelf.length ? `${t.itemsHere} · ${t.tapItem}` : t.noItems}</span>
          {shelf.length > 0 && (
            <div className="row">
              {shelf.map((p) => (
                <button key={p.id} className={"dockItem" + (picked && picked.id === p.id ? " on" : "")} title={p.name}
                  onPointerDown={(e) => { e.preventDefault(); pressStart(p); }} onPointerUp={() => pressEnd(p)}
                  onPointerLeave={pressCancel} onPointerCancel={pressCancel}
                  onContextMenu={(e) => e.preventDefault()}>
                  <span className="qr">QR</span>
                  <img src={p.image} alt="" />
                  {g.scannedIds.includes(p.id) && <i className="ok">✓</i>}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="neoMovePad">
          {/* rare-dowsing signal meter (sound + visual) */}
          {prefs.hud && dowseLvl > 0 && (
            <div className={"neoDowse" + (dowseLvl > 0.7 ? " hot" : "")}>
              <span className="ic">📡</span>
              <span className="bars">{[0, 1, 2, 3, 4].map((b) => <i key={b} className={dowseLvl * 5 > b ? "on" : ""} />)}</span>
              <small>{t.dowse}</small>
            </div>
          )}
          {/* facing indicator: makes left/right shelf-peeking obvious */}
          {prefs.hud && (
            <div className={"neoFacing face-" + heading}>
              <b>👁 {facing}</b>
              {heading !== "forward" && <small>{t.backToFront}</small>}
            </div>
          )}
          {/* camera HEIGHT control (only this + the D-pad). Raise/lower the view for high/low shelves. */}
          <div className="neoRpad" aria-label={t.heightLabel}>
            <button className="up" onClick={() => setElev((v) => clamp(v + 1, -2, 2))} title={t.liftUp} disabled={elev >= 2}>▲</button>
            <div className="lvl" title={t.heightLabel}>{[2, 1, 0, -1, -2].map((l) => <i key={l} className={elev === l ? "on" : ""} />)}</div>
            <button className="down" onClick={() => setElev((v) => clamp(v - 1, -2, 2))} title={t.liftDown} disabled={elev <= -2}>▼</button>
            <span className="lbl">⇕ {t.heightLabel}</span>
          </div>
          <div className="neoPad" aria-label={t.move}>
            <button className="up" onClick={fwd} title={t.fwd}>▲</button>
            <button className="left" onClick={turnLeft} title={t.peekLeft}>◀</button>
            <button className="ctr" disabled>{headLabel}</button>
            <button className="right" onClick={turnRight} title={t.peekRight}>▶</button>
            <button className="down" onClick={back} title={t.bwd}>▼</button>
          </div>
        </div>
      </div>

      {saving && (
        <div className="neoModalOv" onClick={() => setSaving(false)}>
          <div className="neoSaveBox neoGlass" onClick={(e) => e.stopPropagation()}>
            <div className="ic"><TentIcon size={84} /></div>
            <p className="eyebrow">{t.savePoint}</p>
            <h2>{local(node.label, lang)} · {store.name}</h2>
            <p className="msg">{t.saveMsg}</p>
            <button className="neoBtn solid block" onClick={() => { onSave(); setSaving(false); }}>⛺ {t.saveDo}</button>
            <button className="neoBtn block" onClick={() => setSaving(false)}>{t.saveClose}</button>
          </div>
        </div>
      )}

      {conciergeOn && (
        <DiveConcierge lang={lang} g={g} store={store} node={node} productHere={picked || product}
          onScan={(p) => capture(p)} onClose={onConcierge} />
      )}

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

function ToioCorner({ t, lang, g, store, onBack }) {
  const goods = PRODUCTS.filter((p) => ["keyring", "pin", "charm", "holo-badge", "plush"].includes(p.id));
  const [picked, setPicked] = useState(null);
  function claim(p) { g.toast(`🎁 ${lang === "ja" ? "景品GET" : "Prize"}: ${p.name}`, "ok"); setPicked(null); }
  function buy(p) { g.addToCart(p, 1); g.toast(`🛒 ${lang === "ja" ? "カートに追加" : "Added"}: ${p.name}`, "ok"); setPicked(null); }
  return (
    <main className="neoToio">
      <div className="toioHead">
        <button className="neoBtn" onClick={onBack}>{t.back}</button>
        <h1>🛺 {lang === "ja" ? "TOIOミニチュアコーナー" : "TOIO Miniature Corner"}</h1>
        <span className="store">{store.name}</span>
      </div>
      <div className="toioStage" style={{ backgroundImage: `url(${store.pano})` }}>
        <div className="toioScan" />
        <p className="toioHint">{lang === "ja" ? "🚗 小型カメラがミニチュア店内を走行中…好きな商品を選ぼう" : "🚗 The mini camera is roaming the miniature store… pick a favourite"}</p>
      </div>
      <a className="neoBtn solid block toioConnect" href={TOIO_APP_URL} target="_blank" rel="noopener noreferrer">
        🛺 {lang === "ja" ? "ミニチュア走行カメラに接続（実機アプリ）" : "Connect to the live miniature camera app"}
      </a>
      <div className="toioGrid">
        {goods.map((p) => (
          <button key={p.id} className="toioItem" onClick={() => setPicked(p)}>
            <img src={p.image} alt="" />
            <b>{p.name}</b><small>{p.price}</small>
          </button>
        ))}
      </div>
      {picked && (
        <div className="neoModalOv" onClick={() => setPicked(null)}>
          <div className="toioPick" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setPicked(null)}>×</button>
            <img src={picked.image} alt="" />
            <h2>{picked.name}</h2>
            <p className="rar">{picked.rarity} · {picked.price}</p>
            <div className="acts">
              <button className="neoBtn solid block" onClick={() => claim(picked)}>🎁 {lang === "ja" ? "景品としてもらう" : "Take as prize"}</button>
              <button className="neoBtn block" onClick={() => buy(picked)}>🛒 {lang === "ja" ? "購入する" : "Buy"}</button>
            </div>
          </div>
        </div>
      )}
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
          <button className="neoBtn solid block" onClick={onPossess}>⚡ {lang === "ja" ? "今すぐ憑依する！ DIVE" : "DIVE in now!"}</button>
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
    { ic: "⚡", t: L("憑依する！＝DIVE", "DIVE = Possess!"), b: L("店舗ロボに“憑依（DIVE）”して乗り移り、コントローラーで前後左右・視点・昇降を操作して店内を探索。さあ、DIVE！", "DIVE = possess a store robot. Pilot it — move, turn, tilt and lift to explore the aisles. Go on, DIVE in!") },
    { ic: "⭐", t: L("EXPを貯めて使う", "Earn & spend EXP"), b: L("スキャン・クエスト達成・宝発見などの条件でEXPが増加。EXPはランクアップに加え、TOIOコーナーなどのサービスの対価として消費できます。", "Earn EXP by scanning, clearing quests and finding treasure. EXP raises your rank — and can be spent on services like the TOIO corner.") },
    f.toio && { ic: "🛺", t: L("TOIOミニチュアコーナー", "TOIO miniature corner"), b: L("EXPを消費して、ミニチュア店内をTOIO走行カメラで探索。キーホルダーや缶バッジを選んで景品でもらうか購入できます。", "Spend EXP to drive a TOIO camera through a miniature store — pick keychains or can badges to win as a prize or buy.") },
    f.collection && { ic: "📘", t: L("レアを発見→図鑑", "Discover → Collection"), b: L("棚をスキャンしてレアを発見、図鑑に登録してコンプを目指そう。", "Scan shelves to find rares and complete your Collection.") },
    f.missions && { ic: "✅", t: L("クエストでXP→ランクUP", "Quests → Rank up"), b: L("デイリー等のクエストを達成してXPを稼ぎ、ランクを上げよう。", "Clear daily quests to earn XP and rank up.") },
    f.rank && {
      ic: "🏅",
      t: L("ランクの仕組み", "Rank tiers"),
      b: L("累計EXPで「ランク（称号）」が昇格します。画面上部の表示はあなたの現在ランクです。", "Lifetime EXP raises your RANK (title). The badge at the top shows your current rank."),
      ranks: RANKS
    },
    f.ranking && { ic: "👑", t: L("ランキング", "Ranking"), b: L("発見数やXPで他のダイバーとランキングを競えます。", "Compete with other divers on the leaderboard.") },
    f.guild && { ic: "🛡️", t: L("ギルド", "Guild"), b: L("仲間とギルドを組み、協力ミッションでさらに楽しく。", "Team up in a guild and take on co-op missions.") },
    f.openWorld && { ic: "🌀", t: L("ワープで世界一でかい店へ", "Warp the infinite store"), b: L("店舗の端からワープすると隣の店へ。全店が地続きの“世界一でかい店”。", "Warp from a store edge to the next — all stores connect into one giant store.") }
  ].filter(Boolean);
  const [i, setI] = useState(0);
  const [dontShow, setDontShow] = useState(false);
  const close = () => onClose(dontShow);
  const step = steps[Math.min(i, steps.length - 1)];
  const last = i >= steps.length - 1;
  return (
    <div className="neoModalOv" onClick={close}>
      <div className="neoTut" onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={close}>×</button>
        <div className="ic">{step.ic}</div>
        <p className="eyebrow">{L("チュートリアル", "Tutorial")} {i + 1}/{steps.length}</p>
        <h2>{step.t}</h2>
        <p className="body">{step.b}</p>
        {step.ranks && (
          <ol className="tutRanks">
            {step.ranks.map((r, k) => (
              <li key={r.name}><span className="lv">{k + 1}</span><b>{r.name}</b><small>{r.min} XP{step.ranks[k + 1] ? "" : " +"}</small></li>
            ))}
          </ol>
        )}
        <div className="dots">{steps.map((_, k) => <span key={k} className={k === i ? "on" : ""} />)}</div>
        <div className="nav">
          {i > 0 ? <button className="neoBtn" onClick={() => setI(i - 1)}>{L("戻る", "Back")}</button> : <button className="neoBtn" onClick={close}>{L("スキップ", "Skip")}</button>}
          {last
            ? <button className="neoBtn solid" onClick={close}>{L("はじめる", "Start")}</button>
            : <button className="neoBtn solid" onClick={() => setI(i + 1)}>{L("次へ", "Next")}</button>}
        </div>
        <label className="tutOptout">
          <input type="checkbox" checked={dontShow} onChange={(e) => setDontShow(e.target.checked)} />
          {L("次回から表示しない", "Don't show again")}
        </label>
      </div>
    </div>
  );
}

function ThemePicker({ lang, g, onClose }) {
  return (
    <>
      <div className="thScrim" onClick={onClose} />
      <div className="thPop">
        <div className="thHead">
          <b>{lang === "ja" ? "世界観（トンマナ）" : "Theme"}</b>
          <button className="close" onClick={onClose}>×</button>
        </div>
        <p className="thHint">{lang === "ja" ? "選ぶと即座に全画面へ反映。見比べてどうぞ。" : "Switches live across the whole UI — compare freely."}</p>
        <div className="thGrid">
          {TONES.map((tn) => (
            <button key={tn.id} className={"thCard" + (g.tone === tn.id ? " on" : "")} onClick={() => g.setTone(tn.id)}>
              <span className="sw" style={{ background: `linear-gradient(120deg, ${tn.acc}, ${tn.acc2})` }} />
              <b>{tn[lang]}</b>
              {g.tone === tn.id && <i className="chk">✓</i>}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function Toasts({ toasts }) {
  return <div className="neoToasts">{toasts.map((x) => <div key={x.id} className={"neoToast " + x.kind}>{x.message}</div>)}</div>;
}

function mapImg() { return `${import.meta.env.BASE_URL}japan-map.png`; }
