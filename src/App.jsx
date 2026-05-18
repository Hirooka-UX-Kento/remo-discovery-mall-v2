import React, { useState } from "react";
import "./style.css";

const L = {
  ja: {
    lang: "\u65e5\u672c\u8a9e",
    switch: "English",
    title: "Remo Discovery Mall",
    subtitle: "\u30ed\u30dc\u30c3\u30c8\u306b\u61d1\u4f9d\u3057\u3066\u3001\u65e5\u672c\u4e2d\u306e\u30a2\u30cb\u30e1\u30fb\u30db\u30d3\u30fc\u5e97\u3092\u9060\u9694\u63a2\u7d22\u3067\u304d\u308b\u30c7\u30e2\u30a2\u30d7\u30ea",
    mapTitle: "\u65e5\u672c\u30de\u30c3\u30d7\u304b\u3089\u5e97\u8217\u3092\u9078\u629e",
    mapLead: "\u5e97\u8217\u3092\u9078\u3093\u3067\u3001\u30ed\u30dc\u30c3\u30c8\u8996\u70b9\u3067\u5e97\u5185\u3092\u63a2\u7d22\u3057\u307e\u3059\u3002",
    stores: "\u6ce8\u76ee\u5e97\u8217",
    recommended: "\u304a\u3059\u3059\u3081",
    feature: "\u7279\u5fb4",
    campaign: "\u9650\u5b9a\u4f01\u753b",
    possess: "\u30ed\u30dc\u30c3\u30c8\u306b\u61d1\u4f9d\u3059\u308b",
    connecting: "\u30ed\u30dc\u30c3\u30c8\u306b\u61d1\u4f9d\u4e2d...",
    connectingLead: "\u6620\u50cf\u30fb\u64cd\u4f5c\u30fb\u30ab\u30fc\u30c8\u30fb\u5e97\u5185\u30c7\u30fc\u30bf\u3092\u540c\u671f\u3057\u3066\u3044\u307e\u3059\u3002",
    mission: "\u30df\u30c3\u30b7\u30e7\u30f3",
    missionText: "\u79fb\u52d5\u8ddd\u96e2\u306b\u5fdc\u3058\u3066\u7d4c\u9a13\u5024\u3092\u7372\u5f97",
    xp: "\u7d4c\u9a13\u5024",
    cart: "\u30ab\u30fc\u30c8",
    items: "\u70b9",
    distance: "\u79fb\u52d5\u8ddd\u96e2",
    add: "\u30ab\u30fc\u30c8\u306b\u8ffd\u52a0",
    leave: "\u30ed\u30dc\u30c3\u30c8\u304b\u3089\u96e2\u8131",
    move: "\u79fb\u52d5",
    scan: "\u30a2\u30a4\u30c6\u30e0\u30b9\u30ad\u30e3\u30f3",
    stock: "\u5728\u5eab",
    price: "\u4fa1\u683c",
    tone: "\u30c8\u30f3\u30de\u30ca",
    pop: "\u30dd\u30c3\u30d7",
    cyber: "\u30b5\u30a4\u30d0\u30fc",
    premium: "\u30d7\u30ec\u30df\u30a2\u30e0"
  },
  en: {
    lang: "English",
    switch: "\u65e5\u672c\u8a9e",
    title: "Remo Discovery Mall",
    subtitle: "A demo app where users possess remote robots and explore Japanese anime / hobby shops.",
    mapTitle: "Choose a store from Japan map",
    mapLead: "Select a store and explore it from a robot point of view.",
    stores: "Featured Stores",
    recommended: "Recommended",
    feature: "Feature",
    campaign: "Limited Campaign",
    possess: "Possess Robot",
    connecting: "Possessing Robot...",
    connectingLead: "Synchronizing video, controls, cart, and store data.",
    mission: "Mission",
    missionText: "Gain XP based on movement distance.",
    xp: "XP",
    cart: "Cart",
    items: "items",
    distance: "Distance",
    add: "Add to Cart",
    leave: "Leave Robot",
    move: "Move to",
    scan: "Item Scan",
    stock: "Stock",
    price: "Price",
    tone: "Tone",
    pop: "Pop",
    cyber: "Cyber",
    premium: "Premium"
  }
};

const stores = [
  {
    id: "akihabara",
    name: { ja: "\u79cb\u8449\u539f\u30db\u30d3\u30fc\u30d9\u30fc\u30b9", en: "Akihabara Hobby Base" },
    area: { ja: "\u6771\u4eac / \u79cb\u8449\u539f", en: "Tokyo / Akihabara" },
    tag: { ja: "\u30a2\u30cb\u30e1\u8056\u5730", en: "Anime Holy Land" },
    x: 70,
    y: 55,
    robot: "Remo-01",
    feature: { ja: "\u30d5\u30a3\u30ae\u30e5\u30a2\u3001\u30d7\u30e9\u30e2\u30c7\u30eb\u3001\u30c8\u30ec\u30ab\u3001\u9650\u5b9a\u30b0\u30c3\u30ba\u304c\u5f37\u3044\u5e97\u8217\u3002", en: "A strong store for figures, model kits, trading cards, and limited goods." },
    campaign: { ja: "\u9031\u672b\u9650\u5b9a\u30ec\u30a2\u30a2\u30a4\u30c6\u30e0\u63a2\u7d22", en: "Weekend Rare Item Hunt" },
    picks: { ja: ["\u9650\u5b9a\u30d5\u30a3\u30ae\u30e5\u30a2", "\u65b0\u4f5c\u30d7\u30e9\u30e2\u30c7\u30eb", "\u30ec\u30a2\u30c8\u30ec\u30ab"], en: ["Limited Figure", "New Model Kit", "Rare Trading Card"] }
  },
  {
    id: "nakano",
    name: { ja: "\u4e2d\u91ce\u30ec\u30c8\u30ed\u30c8\u30a4\u30ba", en: "Nakano Retro Toys" },
    area: { ja: "\u6771\u4eac / \u4e2d\u91ce", en: "Tokyo / Nakano" },
    tag: { ja: "\u30ec\u30c8\u30ed\u73a9\u5177", en: "Retro & Collector" },
    x: 68,
    y: 56,
    robot: "Remo-02",
    feature: { ja: "\u4e2d\u53e4\u30a2\u30cb\u30e1\u30b0\u30c3\u30ba\u3001\u30f4\u30a3\u30f3\u30c6\u30fc\u30b8\u73a9\u5177\u3001\u30b3\u30ec\u30af\u30bf\u30fc\u5546\u54c1\u304c\u8c4a\u5bcc\u3002", en: "Vintage toys, used anime goods, and collector items." },
    campaign: { ja: "\u30ec\u30c8\u30ed\u304a\u5b9d\u767a\u6398\u30a6\u30a3\u30fc\u30af", en: "Retro Treasure Week" },
    picks: { ja: ["\u662d\u548c\u30ed\u30dc\u30c3\u30c8\u73a9\u5177", "\u65e7\u4f5c\u30a2\u30cb\u30e1\u30b0\u30c3\u30ba", "\u30b3\u30ec\u30af\u30bf\u30fc\u30ab\u30fc\u30c9"], en: ["Vintage Robot Toy", "Old Anime Goods", "Collector Card"] }
  },
  {
    id: "nipponbashi",
    name: { ja: "\u65e5\u672c\u6a4b\u30aa\u30bf\u30ed\u30fc\u30c9\u5e97", en: "Nipponbashi Otaku Street" },
    area: { ja: "\u5927\u962a / \u65e5\u672c\u6a4b", en: "Osaka / Nipponbashi" },
    tag: { ja: "\u95a2\u897f\u30a2\u30cb\u30e1\u8056\u5730", en: "Kansai Anime Area" },
    x: 48,
    y: 68,
    robot: "Remo-03",
    feature: { ja: "\u95a2\u897f\u306e\u30a2\u30cb\u30e1\u30b0\u30c3\u30ba\u3001\u30d5\u30a3\u30ae\u30e5\u30a2\u3001\u30d7\u30e9\u30e2\u30c7\u30eb\u306b\u5f37\u3044\u5e97\u8217\u3002", en: "Anime goods, figures, model kits, and Kansai limited items." },
    campaign: { ja: "\u5927\u962a\u9650\u5b9a\u30b0\u30c3\u30ba\u30d5\u30a7\u30a2", en: "Osaka Limited Goods Fair" },
    picks: { ja: ["\u5927\u962a\u9650\u5b9a\u30d5\u30a3\u30ae\u30e5\u30a2", "\u30ad\u30e3\u30e9\u30af\u30bf\u30fc\u96d1\u8ca8", "\u6a21\u578b\u30ad\u30c3\u30c8"], en: ["Osaka Limited Figure", "Character Goods", "Model Kit"] }
  },
  {
    id: "hakata",
    name: { ja: "\u535a\u591a\u30dd\u30c3\u30d7\u30ab\u30eb\u30c1\u30e3\u30fc\u5e97", en: "Hakata Pop Culture Shop" },
    area: { ja: "\u798f\u5ca1 / \u535a\u591a", en: "Fukuoka / Hakata" },
    tag: { ja: "\u4e5d\u5dde\u30a2\u30cb\u30e1\u30b9\u30dd\u30c3\u30c8", en: "Kyushu Anime Spot" },
    x: 24,
    y: 76,
    robot: "Remo-04",
    feature: { ja: "\u5730\u57df\u9650\u5b9a\u30b0\u30c3\u30ba\u3001\u30b3\u30e9\u30dc\u5546\u54c1\u3001\u304a\u571f\u7523\u578b\u30a2\u30cb\u30e1\u96d1\u8ca8\u304c\u5145\u5b9f\u3002", en: "Regional goods, collaboration items, and anime souvenirs." },
    campaign: { ja: "\u4e5d\u5dde\u30b9\u30da\u30b7\u30e3\u30eb\u30bb\u30ec\u30af\u30b7\u30e7\u30f3", en: "Kyushu Special Selection" },
    picks: { ja: ["\u5730\u57df\u9650\u5b9a\u30b0\u30c3\u30ba", "\u3054\u5f53\u5730\u30b3\u30e9\u30dc", "\u30ec\u30a2\u30ad\u30fc\u30db\u30eb\u30c0\u30fc"], en: ["Regional Goods", "Local Collaboration", "Rare Keychain"] }
  }
];

const scenes = {
  entrance: {
    name: { ja: "\u5165\u53e3", en: "Entrance" },
    title: { ja: "\u5e97\u8217\u5165\u53e3", en: "Store Entrance" },
    image: "https://images.unsplash.com/photo-1607083206968-13611e3d76db?auto=format&fit=crop&w=1600&q=80",
    distance: 0,
    rarity: "NORMAL",
    description: { ja: "\u30ed\u30dc\u30c3\u30c8\u304c\u5e97\u8217\u5165\u53e3\u306b\u5165\u308a\u307e\u3057\u305f\u3002\u5404\u30a8\u30ea\u30a2\u3078\u79fb\u52d5\u3067\u304d\u307e\u3059\u3002", en: "The robot has entered the store. You can move to each area." },
    next: ["figure", "cards", "showcase"]
  },
  figure: {
    name: { ja: "\u30d5\u30a3\u30ae\u30e5\u30a2\u901a\u8def", en: "Figure Aisle" },
    title: { ja: "\u30d5\u30a3\u30ae\u30e5\u30a2\u30a8\u30ea\u30a2", en: "Figure Area" },
    image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=1600&q=80",
    distance: 12,
    rarity: "RARE",
    description: { ja: "\u68da\u306b\u591a\u6570\u306e\u30d5\u30a3\u30ae\u30e5\u30a2\u304c\u4e26\u3093\u3067\u3044\u307e\u3059\u3002\u304a\u3059\u3059\u3081\u5546\u54c1\u304c\u30b9\u30ad\u30e3\u30f3\u53ef\u80fd\u3067\u3059\u3002", en: "Many figures are displayed on shelves. Recommended items can be scanned." },
    next: ["entrance", "showcase", "limited"]
  },
  cards: {
    name: { ja: "\u30c8\u30ec\u30ab\u30a8\u30ea\u30a2", en: "Trading Cards" },
    title: { ja: "\u30c8\u30ec\u30fc\u30c7\u30a3\u30f3\u30b0\u30ab\u30fc\u30c9\u30a8\u30ea\u30a2", en: "Trading Card Area" },
    image: "https://images.unsplash.com/photo-1611996575749-79a3a250f948?auto=format&fit=crop&w=1600&q=80",
    distance: 9,
    rarity: "NORMAL",
    description: { ja: "\u30ab\u30fc\u30c9\u30d1\u30c3\u30af\u3068\u30b7\u30f3\u30b0\u30eb\u30ab\u30fc\u30c9\u304c\u4e26\u3093\u3067\u3044\u307e\u3059\u3002\u9650\u5b9a\u5728\u5eab\u3082\u3042\u308a\u307e\u3059\u3002", en: "Card packs and single cards are displayed. Some are limited stock." },
    next: ["entrance", "limited"]
  },
  showcase: {
    name: { ja: "\u30b7\u30e7\u30fc\u30b1\u30fc\u30b9", en: "Showcase" },
    title: { ja: "\u30d7\u30ec\u30df\u30a2\u30e0\u30b7\u30e7\u30fc\u30b1\u30fc\u30b9", en: "Premium Showcase" },
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=80",
    distance: 15,
    rarity: "LEGENDARY",
    description: { ja: "\u9ad8\u984d\u5546\u54c1\u304c\u30b7\u30e7\u30fc\u30b1\u30fc\u30b9\u306b\u5c55\u793a\u3055\u308c\u3066\u3044\u307e\u3059\u3002", en: "Premium items are displayed in the showcase." },
    next: ["entrance", "figure", "limited"]
  },
  limited: {
    name: { ja: "\u9650\u5b9a\u54c1\u30b3\u30fc\u30ca\u30fc", en: "Limited Goods" },
    title: { ja: "\u9650\u5b9a\u54c1\u30b3\u30fc\u30ca\u30fc", en: "Limited Goods Corner" },
    image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=1600&q=80",
    distance: 18,
    rarity: "LEGENDARY",
    description: { ja: "\u9650\u5b9a\u30fb\u30ad\u30e3\u30f3\u30da\u30fc\u30f3\u5546\u54c1\u304c\u96c6\u307e\u308b\u30a8\u30ea\u30a2\u3067\u3059\u3002", en: "Limited and campaign items are here." },
    next: ["figure", "cards", "showcase"]
  }
};

const tones = {
  pop: "theme-pop",
  cyber: "theme-cyber",
  premium: "theme-premium"
};

function localize(v, lang) {
  if (!v) return "";
  if (typeof v === "string") return v;
  return v[lang] || v.en || v.ja || "";
}

function App() {
  const [lang, setLang] = useState("ja");
  const [tone, setTone] = useState("pop");
  const [selectedStore, setSelectedStore] = useState(null);
  const [mode, setMode] = useState("map");
  const [sceneId, setSceneId] = useState("entrance");
  const [cart, setCart] = useState([]);
  const [xp, setXp] = useState(1200);
  const [meters, setMeters] = useState(0);
  const [lastGain, setLastGain] = useState(0);
  const T = L[lang];
  const scene = scenes[sceneId];

  const startPossession = () => {
    setMode("connecting");
    setTimeout(() => {
      setSceneId("entrance");
      setMode("robot");
    }, 1400);
  };

  const moveTo = (nextId) => {
    const next = scenes[nextId];
    const gain = Math.max(20, next.distance * 12);
    setSceneId(nextId);
    setMeters((m) => m + next.distance);
    setXp((x) => x + gain);
    setLastGain(gain);
  };

  const addToCart = () => {
    setCart((c) => [...c, localize(scene.name, lang)]);
    setXp((x) => x + 80);
    setLastGain(80);
  };

  if (mode === "connecting") {
    return (
      <div className={"connectScreen " + tones[tone]}>
        <div className="connectRing"><div className="robotEye">● ●</div></div>
        <h1>{T.connecting}</h1>
        <p>{T.connectingLead}</p>
        <div className="loadingBar"><span /></div>
      </div>
    );
  }

  if (mode === "robot") {
    return (
      <div className={"robotScreen " + tones[tone]}>
        <img className="realStoreImage" src={scene.image} alt={localize(scene.title, lang)} />
        <div className="imageShade" />
        <div className="hud topHud">
          <span className="rec">● REC</span>
          <span>LIVE FEED</span>
          <span>{selectedStore?.robot}</span>
          <span>BAT 78%</span>
          <span>LATENCY 32ms</span>
          <button type="button" className="miniBtn" onClick={() => setLang(lang === "ja" ? "en" : "ja")}>{T.switch}</button>
        </div>
        <div className="sceneTitle">
          <span className={"rarity " + scene.rarity.toLowerCase()}>{scene.rarity}</span>
          <h1>{localize(scene.title, lang)}</h1>
          <p>{localize(scene.description, lang)}</p>
        </div>
        <div className="hud sideHud">
          <h3>{T.mission}</h3>
          <p>{T.missionText}</p>
          <div className="progress"><span style={{ width: Math.min(100, (meters / 60) * 100) + "%" }} /></div>
          <h3>{T.xp}</h3>
          <p>Lv.7 / {xp} XP</p>
          <h3>{T.distance}</h3>
          <p>{meters} m</p>
          <h3>{T.cart}</h3>
          <p>{cart.length} {T.items}</p>
          {lastGain > 0 && <p className="gain">+{lastGain} XP</p>}
        </div>
        <div className="scanCard">
          <div className={"rare " + scene.rarity.toLowerCase()}>{scene.rarity}</div>
          <h2>{T.scan}</h2>
          <p>{localize(scene.name, lang)} Special Item</p>
          <p>{T.stock}: 1 / {T.price}: ¥7,920</p>
          <button type="button" onClick={addToCart}>{T.add}</button>
        </div>
        <div className="controls">
          {scene.next.map((nextId) => (
            <button type="button" key={nextId} onClick={() => moveTo(nextId)}>
              {T.move} {localize(scenes[nextId].name, lang)}
              <span>+{Math.max(20, scenes[nextId].distance * 12)} XP</span>
            </button>
          ))}
          <button type="button" className="exit" onClick={() => setMode("map")}>{T.leave}</button>
        </div>
      </div>
    );
  }

  return (
    <div className={"app " + tones[tone]}>
      <header className="hero">
        <div>
          <p className="eyebrow">Telepresence Shopping Prototype</p>
          <h1>{T.title}</h1>
          <p className="lead">{T.subtitle}</p>
        </div>
        <div className="toolbar">
          <button type="button" onClick={() => setLang(lang === "ja" ? "en" : "ja")}>{T.switch}</button>
          <div className="toneButtons">
            <button type="button" className={tone === "pop" ? "active" : ""} onClick={() => setTone("pop")}>{T.pop}</button>
            <button type="button" className={tone === "cyber" ? "active" : ""} onClick={() => setTone("cyber")}>{T.cyber}</button>
            <button type="button" className={tone === "premium" ? "active" : ""} onClick={() => setTone("premium")}>{T.premium}</button>
          </div>
        </div>
      </header>

      <main className="layout">
        <section className="mapPanel">
          <div className="mapHeader">
            <div>
              <h2>{T.mapTitle}</h2>
              <p>{T.mapLead}</p>
            </div>
          </div>
          <div className="japanMap">
            <JapanMapSvg />
            {stores.map((store) => (
              <button type="button" key={store.id} className="pin" style={{ left: store.x + "%", top: store.y + "%" }} onClick={() => setSelectedStore(store)}>
                ★<span>{localize(store.area, lang)}</span>
              </button>
            ))}
          </div>
        </section>
        <section className="storeList">
          <h2>{T.stores}</h2>
          {stores.map((store) => (
            <button type="button" key={store.id} className="storeCard" onClick={() => setSelectedStore(store)}>
              <strong>{localize(store.name, lang)}</strong>
              <span>{localize(store.area, lang)}</span>
              <em>{localize(store.tag, lang)}</em>
            </button>
          ))}
        </section>
      </main>

      {selectedStore && (
        <div className="modalBackdrop" onClick={() => setSelectedStore(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="close" onClick={() => setSelectedStore(null)}>×</button>
            <div className="modalHero">
              <div className="shopIcon">🤖</div>
              <div>
                <p className="eyebrow">{localize(selectedStore.tag, lang)}</p>
                <h2>{localize(selectedStore.name, lang)}</h2>
                <p>{localize(selectedStore.area, lang)}</p>
              </div>
            </div>
            <div className="modalGrid">
              <div>
                <h3>{T.recommended}</h3>
                {localize(selectedStore.picks, lang).map((pick) => <p className="pill" key={pick}>{pick}</p>)}
              </div>
              <div><h3>{T.feature}</h3><p>{localize(selectedStore.feature, lang)}</p></div>
              <div><h3>{T.campaign}</h3><p>{localize(selectedStore.campaign, lang)}</p></div>
            </div>
            <button type="button" className="possess" onClick={startPossession}>{T.possess}</button>
          </div>
        </div>
      )}
    </div>
  );
}

function JapanMapSvg() {
  return (
    <svg className="mapSvg" viewBox="0 0 100 100" role="img" aria-label="Original simplified map of Japan">
      <defs>
        <linearGradient id="landGrad" x1="0" x2="1">
          <stop offset="0%" stopColor="var(--landA)" />
          <stop offset="100%" stopColor="var(--landB)" />
        </linearGradient>
      </defs>
      <path className="land" d="M73 8 C82 6 88 12 88 20 C88 29 80 35 71 31 C65 28 63 20 66 14 C68 11 70 9 73 8Z" />
      <path className="land" d="M68 34 C78 38 84 47 79 56 C74 65 60 65 52 70 C43 76 32 78 26 71 C19 63 26 54 36 50 C47 46 53 35 68 34Z" />
      <path className="land" d="M42 71 C48 70 55 73 57 78 C51 82 42 81 36 77 C37 74 39 72 42 71Z" />
      <path className="land" d="M22 71 C30 70 36 78 34 87 C32 95 20 94 16 86 C13 79 16 73 22 71Z" />
      <rect className="okinawaFrame" x="68" y="75" width="24" height="16" rx="3" />
      <circle className="okinawaDot" cx="80" cy="83" r="3" />
    </svg>
  );
}

export default App;