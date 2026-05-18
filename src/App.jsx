import React, { useMemo, useState } from "react";
import "./style.css";

const dict = {
  ja: {
    language: "譌･譛ｬ隱・,
    switchLang: "English",
    appSubtitle: "繝ｭ繝懊ャ繝医↓諞台ｾ昴＠縺ｦ縲∵律譛ｬ荳ｭ縺ｮ窶懷･ｽ縺坂昴ｒ謗｢縺励↓陦後￥驕髫斐す繝ｧ繝・ヴ繝ｳ繧ｰ繝｢繝ｼ繝ｫ",
    mapTitle: "譌･譛ｬ繝槭ャ繝励°繧牙ｺ苓・繧帝∈謚・,
    mapLead: "繧｢繝九Γ繝ｻ繝帙ン繝ｼ縺ｮ閨門慍繧帝∈縺ｳ縲√Ο繝懊ャ繝郁ｦ也せ縺ｧ蠎怜・謗｢邏｢縺ｧ縺阪∪縺吶・,
    storesTitle: "豕ｨ逶ｮ蠎苓・",
    selectStore: "蠎苓・繧定ｦ九ｋ",
    recommended: "縺翫☆縺吶ａ",
    feature: "迚ｹ蠕ｴ",
    campaign: "髯仙ｮ壻ｼ∫判",
    possess: "繝ｭ繝懊ャ繝医↓諞台ｾ昴☆繧・,
    connectingTitle: "繝ｭ繝懊ャ繝医↓諞台ｾ昜ｸｭ...",
    connectingLead: "譏蜒上・謫堺ｽ懊・繧ｫ繝ｼ繝医・蠎怜・繝・・繧ｿ繧貞酔譛溘＠縺ｦ縺・∪縺吶・,
    mission: "繝溘ャ繧ｷ繝ｧ繝ｳ",
    missionText: "蠎怜・繧呈爾邏｢縺励※XP繧堤佐蠕・,
    xp: "邨碁ｨ灘､",
    cart: "繧ｫ繝ｼ繝・,
    items: "轤ｹ",
    addToCart: "繧ｫ繝ｼ繝医↓霑ｽ蜉",
    leaveRobot: "繝ｭ繝懊ャ繝医°繧蛾屬閼ｱ",
    distance: "遘ｻ蜍戊ｷ晞屬",
    gained: "迯ｲ蠕郵P",
    moveTo: "遘ｻ蜍・,
    scanTitle: "繧｢繧､繝・Β繧ｹ繧ｭ繝｣繝ｳ",
    stock: "蝨ｨ蠎ｫ",
    price: "萓｡譬ｼ",
    mapNote: "蝨ｰ蝗ｳ縺ｯ螟夜Κ逕ｻ蜒上↓萓晏ｭ倥＠縺ｪ縺・・菴彜VG縺ｧ縺吶ょｾ後〒Natural Earth遲峨・public domain蝨ｰ蝗ｳ縺ｸ蟾ｮ譖ｿ蜿ｯ閭ｽ縲・,
    tone: "繝医Φ繝槭リ",
    tonePop: "繝昴ャ繝・,
    toneCyber: "繧ｵ繧､繝舌・",
    tonePremium: "繝励Ξ繝溘い繝",
  },
  en: {
    language: "English",
    switchLang: "譌･譛ｬ隱・,
    appSubtitle: "A telepresence shopping mall where users possess robots and explore Japanese hobby stores remotely.",
    mapTitle: "Choose a store from Japan map",
    mapLead: "Select an anime / hobby destination and explore the shop from a robot point of view.",
    storesTitle: "Featured Stores",
    selectStore: "View Store",
    recommended: "Recommended",
    feature: "Feature",
    campaign: "Limited Campaign",
    possess: "Possess Robot",
    connectingTitle: "Possessing Robot...",
    connectingLead: "Synchronizing video, controls, cart, and live store data.",
    mission: "Mission",
    missionText: "Explore the store and gain XP",
    xp: "XP",
    cart: "Cart",
    items: "items",
    addToCart: "Add to Cart",
    leaveRobot: "Leave Robot",
    distance: "Distance",
    gained: "XP gained",
    moveTo: "Move to",
    scanTitle: "Item Scan",
    stock: "Stock",
    price: "Price",
    mapNote: "The current map is an original inline SVG to avoid external dependency. It can be replaced later with public-domain Natural Earth data.",
    tone: "Tone",
    tonePop: "Pop",
    toneCyber: "Cyber",
    tonePremium: "Premium",
  },
};

const tones = {
  pop: {
    labelKey: "tonePop",
    bg: "theme-pop",
  },
  cyber: {
    labelKey: "toneCyber",
    bg: "theme-cyber",
  },
  premium: {
    labelKey: "tonePremium",
    bg: "theme-premium",
  },
};

const stores = [
  {
    id: "akihabara",
    name: { ja: "遘玖痩蜴溘・繝薙・繝吶・繧ｹ", en: "Akihabara Hobby Base" },
    area: { ja: "譚ｱ莠ｬ / 遘玖痩蜴・, en: "Tokyo / Akihabara" },
    tag: { ja: "繧｢繝九Γ閨門慍", en: "Anime Holy Land" },
    x: 70,
    y: 55,
    robot: "Remo-01",
    feature: {
      ja: "繝輔ぅ繧ｮ繝･繧｢縲√・繝ｩ繝｢繝・Ν縲√ヨ繝ｬ繧ｫ縲・剞螳壹げ繝・ぜ縺悟ｼｷ縺・覧濶ｦ蠎励・,
      en: "A flagship store for figures, model kits, trading cards, and limited goods.",
    },
    campaign: {
      ja: "騾ｱ譛ｫ髯仙ｮ・繝ｬ繧｢繧｢繧､繝・Β謗｢邏｢繧､繝吶Φ繝・,
      en: "Weekend Rare Item Hunt",
    },
    picks: {
      ja: ["髯仙ｮ壹ヵ繧｣繧ｮ繝･繧｢", "譁ｰ菴懊ぎ繝ｳ繝励Λ", "繝ｬ繧｢繝医Ξ繧ｫ"],
      en: ["Limited Figure", "New Model Kit", "Rare Trading Card"],
    },
  },
  {
    id: "nakano",
    name: { ja: "荳ｭ驥弱Ξ繝医Ο繝医う繧ｺ", en: "Nakano Retro Toys" },
    area: { ja: "譚ｱ莠ｬ / 荳ｭ驥・, en: "Tokyo / Nakano" },
    tag: { ja: "繝ｬ繝医Ο邇ｩ蜈ｷ", en: "Retro & Collector" },
    x: 68,
    y: 56,
    robot: "Remo-02",
    feature: {
      ja: "荳ｭ蜿､繧｢繝九Γ繧ｰ繝・ぜ縲√Χ繧｣繝ｳ繝・・繧ｸ邇ｩ蜈ｷ縲√さ繝ｬ繧ｯ繧ｿ繝ｼ蜷代￠蝠・刀縺瑚ｱ雁ｯ後・,
      en: "Vintage toys, used anime goods, and collector items.",
    },
    campaign: {
      ja: "繝ｬ繝医Ο縺雁ｮ晉匱謗倥え繧｣繝ｼ繧ｯ",
      en: "Retro Treasure Week",
    },
    picks: {
      ja: ["譏ｭ蜥後Ο繝懊ャ繝育自蜈ｷ", "譌ｧ菴懊い繝九Γ繧ｰ繝・ぜ", "繧ｳ繝ｬ繧ｯ繧ｿ繝ｼ繧ｫ繝ｼ繝・],
      en: ["Vintage Robot Toy", "Old Anime Goods", "Collector Card"],
    },
  },
  {
    id: "nipponbashi",
    name: { ja: "譌･譛ｬ讖九が繧ｿ繝ｭ繝ｼ繝牙ｺ・, en: "Nipponbashi Otaku Street" },
    area: { ja: "螟ｧ髦ｪ / 譌･譛ｬ讖・, en: "Osaka / Nipponbashi" },
    tag: { ja: "髢｢隘ｿ繧｢繝九Γ閨門慍", en: "Kansai Anime Area" },
    x: 48,
    y: 68,
    robot: "Remo-03",
    feature: {
      ja: "繧｢繝九Γ繧ｰ繝・ぜ縲√ヵ繧｣繧ｮ繝･繧｢縲√・繝ｩ繝｢繝・Ν縲・未隘ｿ髯仙ｮ壼刀縺ｫ蠑ｷ縺・ｺ苓・縲・,
      en: "Anime goods, figures, model kits, and Kansai limited items.",
    },
    campaign: {
      ja: "螟ｧ髦ｪ髯仙ｮ壹げ繝・ぜ繝輔ぉ繧｢",
      en: "Osaka Limited Goods Fair",
    },
    picks: {
      ja: ["螟ｧ髦ｪ髯仙ｮ壹ヵ繧｣繧ｮ繝･繧｢", "繧ｭ繝｣繝ｩ繧ｯ繧ｿ繝ｼ髮題ｲｨ", "讓｡蝙九く繝・ヨ"],
      en: ["Osaka Limited Figure", "Character Goods", "Model Kit"],
    },
  },
  {
    id: "hakata",
    name: { ja: "蜊壼､壹・繝・・繧ｫ繝ｫ繝√Ε繝ｼ蠎・, en: "Hakata Pop Culture Shop" },
    area: { ja: "遖丞ｲ｡ / 蜊壼､・, en: "Fukuoka / Hakata" },
    tag: { ja: "荵晏ｷ槭い繝九Γ繧ｹ繝昴ャ繝・, en: "Kyushu Anime Spot" },
    x: 24,
    y: 76,
    robot: "Remo-04",
    feature: {
      ja: "蝨ｰ蝓滄剞螳壹げ繝・ぜ縲√さ繝ｩ繝懷膚蜩√√♀蝨溽肇蝙九い繝九Γ髮題ｲｨ縺悟・螳溘・,
      en: "Regional goods, collaboration items, and anime souvenirs.",
    },
    campaign: {
      ja: "荵晏ｷ槭せ繝壹す繝｣繝ｫ繧ｻ繝ｬ繧ｯ繧ｷ繝ｧ繝ｳ",
      en: "Kyushu Special Selection",
    },
    picks: {
      ja: ["蝨ｰ蝓滄剞螳壹げ繝・ぜ", "縺泌ｽ灘慍繧ｳ繝ｩ繝・, "繝ｬ繧｢繧ｭ繝ｼ繝帙Ν繝繝ｼ"],
      en: ["Regional Goods", "Local Collaboration", "Rare Keychain"],
    },
  },
];

const scenes = {
  entrance: {
    name: { ja: "蜈･蜿｣", en: "Entrance" },
    title: { ja: "蠎苓・蜈･蜿｣", en: "Store Entrance" },
    image:
      "https://images.unsplash.com/photo-1607083206968-13611e3d76db?auto=format&fit=crop&w=1600&q=80",
    distance: 0,
    rarity: "NORMAL",
    description: {
      ja: "繝ｭ繝懊ャ繝医′蠎苓・蜈･蜿｣縺ｫ蜈･繧翫∪縺励◆縲ょ推繧ｨ繝ｪ繧｢縺ｸ遘ｻ蜍輔〒縺阪∪縺吶・,
      en: "The robot has entered the store. You can move to each area.",
    },
    next: ["figure", "cards", "showcase"],
  },
  figure: {
    name: { ja: "繝輔ぅ繧ｮ繝･繧｢騾夊ｷｯ", en: "Figure Aisle" },
    title: { ja: "繝輔ぅ繧ｮ繝･繧｢繧ｨ繝ｪ繧｢", en: "Figure Area" },
    image:
      "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=1600&q=80",
    distance: 12,
    rarity: "RARE",
    description: {
      ja: "譽壹↓螟壽焚縺ｮ繝輔ぅ繧ｮ繝･繧｢縺御ｸｦ繧薙〒縺・∪縺吶ゅ♀縺吶☆繧∝膚蜩√′繧ｹ繧ｭ繝｣繝ｳ蜿ｯ閭ｽ縺ｧ縺吶・,
      en: "Many figures are displayed on shelves. Recommended items can be scanned.",
    },
    next: ["entrance", "showcase", "limited"],
  },
  cards: {
    name: { ja: "繝医Ξ繧ｫ繧ｨ繝ｪ繧｢", en: "Trading Cards" },
    title: { ja: "繝医Ξ繝ｼ繝・ぅ繝ｳ繧ｰ繧ｫ繝ｼ繝峨お繝ｪ繧｢", en: "Trading Card Area" },
    image:
      "https://images.unsplash.com/photo-1611996575749-79a3a250f948?auto=format&fit=crop&w=1600&q=80",
    distance: 9,
    rarity: "NORMAL",
    description: {
      ja: "繧ｫ繝ｼ繝峨ヱ繝・け縺ｨ繧ｷ繝ｳ繧ｰ繝ｫ繧ｫ繝ｼ繝峨′荳ｦ繧薙〒縺・∪縺吶る剞螳壼惠蠎ｫ繧ゅ≠繧翫∪縺吶・,
      en: "Card packs and single cards are displayed. Some are limited stock.",
    },
    next: ["entrance", "limited"],
  },
  showcase: {
    name: { ja: "繧ｷ繝ｧ繝ｼ繧ｱ繝ｼ繧ｹ", en: "Showcase" },
    title: { ja: "繝励Ξ繝溘い繝繧ｷ繝ｧ繝ｼ繧ｱ繝ｼ繧ｹ", en: "Premium Showcase" },
    image:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=80",
    distance: 15,
    rarity: "LEGENDARY",
    description: {
      ja: "鬮倬｡榊膚蜩√′繧ｷ繝ｧ繝ｼ繧ｱ繝ｼ繧ｹ縺ｫ螻慕､ｺ縺輔ｌ縺ｦ縺・∪縺吶ゅせ繧ｿ繝・ヵ蜻ｼ縺ｳ蜃ｺ縺怜ｰ守ｷ壹ｒ諠ｳ螳壹＠縺ｦ縺・∪縺吶・,
      en: "Premium items are displayed in the showcase. Staff-call flow can be added here.",
    },
    next: ["entrance", "figure", "limited"],
  },
  limited: {
    name: { ja: "髯仙ｮ壼刀繧ｳ繝ｼ繝翫・", en: "Limited Goods" },
    title: { ja: "髯仙ｮ壼刀繧ｳ繝ｼ繝翫・", en: "Limited Goods Corner" },
    image:
      "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=1600&q=80",
    distance: 18,
    rarity: "LEGENDARY",
    description: {
      ja: "髯仙ｮ壹・繧ｭ繝｣繝ｳ繝壹・繝ｳ蝠・刀縺碁寔縺ｾ繧九お繝ｪ繧｢縺ｧ縺吶らｧｻ蜍戊ｷ晞屬縺碁聞縺・◆繧々P繧ょ､壹ａ縺ｫ蜈･繧翫∪縺吶・,
      en: "Limited and campaign items are here. Longer movement gives more XP.",
    },
    next: ["figure", "cards", "showcase"],
  },
};

function t(lang, key) {
  return dict[lang][key] || key;
}

function getLocalized(value, lang) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[lang] || value.en || value.ja || "";
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

  const scene = scenes[sceneId];

  const moveToScene = (nextId) => {
    const nextScene = scenes[nextId];
    const gain = Math.max(20, nextScene.distance * 12);
    setSceneId(nextId);
    setMeters((prev) => prev + nextScene.distance);
    setXp((prev) => prev + gain);
    setLastGain(gain);
  };

  const startPossession = () => {
    setMode("connecting");
    setTimeout(() => {
      setSceneId("entrance");
      setLastGain(0);
      setMode("robot");
    }, 1600);
  };

  const addToCart = (item) => {
    setCart((prev) => [...prev, item]);
    setXp((prev) => prev + 80);
    setLastGain(80);
  };

  if (mode === "connecting") {
    return (
      <div className={"connectScreen " + tones[tone].bg}>
        <div className="connectRing">
          <div className="robotEye">笳・笳・/div>
        </div>
        <h1>{t(lang, "connectingTitle")}</h1>
        <p>{t(lang, "connectingLead")}</p>
        <div className="loadingBar"><span /></div>
      </div>
    );
  }

  if (mode === "robot") {
    return (
      <div className={"robotScreen " + tones[tone].bg}>
        <img className="realStoreImage" src={scene.image} alt={getLocalized(scene.title, lang)} />
        <div className="imageShade" />

        <div className="hud topHud">
          <span className="rec">笳・REC</span>
          <span>LIVE FEED</span>
          <span>{selectedStore?.robot}</span>
          <span>BAT 78%</span>
          <span>LATENCY 32ms</span>
          <button type="button" className="miniBtn" onClick={() => setLang(lang === "ja" ? "en" : "ja")}>
            {t(lang, "switchLang")}
          </button>
        </div>

        <div className="sceneTitle">
          <span className={"rarity " + scene.rarity.toLowerCase()}>{scene.rarity}</span>
          <h1>{getLocalized(scene.title, lang)}</h1>
          <p>{getLocalized(scene.description, lang)}</p>
        </div>

        <div className="hud sideHud">
          <h3>{t(lang, "mission")}</h3>
          <p>{t(lang, "missionText")}</p>
          <div className="progress"><span style={{ width: Math.min(100, (meters / 60) * 100) + "%" }} /></div>
          <h3>{t(lang, "xp")}</h3>
          <p>Lv.7 / {xp} XP</p>
          <h3>{t(lang, "distance")}</h3>
          <p>{meters} m</p>
          <h3>{t(lang, "cart")}</h3>
          <p>{cart.length} {t(lang, "items")}</p>
          {lastGain > 0 && <p className="gain">+{lastGain} XP</p>}
        </div>

        <div className="scanCard">
          <div className={"rare " + scene.rarity.toLowerCase()}>{scene.rarity}</div>
          <h2>{t(lang, "scanTitle")}</h2>
          <p>{getLocalized(scene.name, lang)} Special Item</p>
          <p>{t(lang, "stock")}: 1 / {t(lang, "price")}: ﾂ･7,920</p>
          <button type="button" onClick={() => addToCart(getLocalized(scene.name, lang) + " Special Item")}>
            {t(lang, "addToCart")}
          </button>
        </div>

        <div className="controls">
          {scene.next.map((nextId) => (
            <button type="button" key={nextId} onClick={() => moveToScene(nextId)}>
              {t(lang, "moveTo")} {getLocalized(scenes[nextId].name, lang)}
              <span>+{Math.max(20, scenes[nextId].distance * 12)} XP</span>
            </button>
          ))}
          <button type="button" className="exit" onClick={() => setMode("map")}>
            {t(lang, "leaveRobot")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={"app " + tones[tone].bg}>
      <header className="hero">
        <div>
          <p className="eyebrow">Telepresence Shopping Prototype</p>
          <h1>Remo Discovery Mall</h1>
          <p className="lead">{t(lang, "appSubtitle")}</p>
        </div>
        <div className="toolbar">
          <button type="button" onClick={() => setLang(lang === "ja" ? "en" : "ja")}>
            {t(lang, "switchLang")}
          </button>
          <div className="toneButtons">
            {Object.entries(tones).map(([key, value]) => (
              <button
                type="button"
                key={key}
                className={tone === key ? "active" : ""}
                onClick={() => setTone(key)}
              >
                {t(lang, value.labelKey)}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="layout">
        <section className="mapPanel">
          <div className="mapHeader">
            <div>
              <h2>{t(lang, "mapTitle")}</h2>
              <p>{t(lang, "mapLead")}</p>
            </div>
            <small>{t(lang, "mapNote")}</small>
          </div>

          <div className="japanMap" aria-label="Japan map">
            <JapanMapSvg />
            {stores.map((store) => (
              <button
                type="button"
                key={store.id}
                className="pin"
                style={{ left: store.x + "%", top: store.y + "%" }}
                onClick={() => setSelectedStore(store)}
              >
                笘・                <span>{getLocalized(store.area, lang)}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="storeList">
          <h2>{t(lang, "storesTitle")}</h2>
          {stores.map((store) => (
            <button
              type="button"
              key={store.id}
              className="storeCard"
              onClick={() => setSelectedStore(store)}
            >
              <strong>{getLocalized(store.name, lang)}</strong>
              <span>{getLocalized(store.area, lang)}</span>
              <em>{getLocalized(store.tag, lang)}</em>
            </button>
          ))}
        </section>
      </main>

      {selectedStore && (
        <div className="modalBackdrop" onClick={() => setSelectedStore(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="close" onClick={() => setSelectedStore(null)}>
              ﾃ・            </button>
            <div className="modalHero">
              <div className="shopIcon">､・/div>
              <div>
                <p className="eyebrow">{getLocalized(selectedStore.tag, lang)}</p>
                <h2>{getLocalized(selectedStore.name, lang)}</h2>
                <p>{getLocalized(selectedStore.area, lang)}</p>
              </div>
            </div>

            <div className="modalGrid">
              <div>
                <h3>{t(lang, "recommended")}</h3>
                {getLocalized(selectedStore.picks, lang).map((pick) => (
                  <p className="pill" key={pick}>{pick}</p>
                ))}
              </div>
              <div>
                <h3>{t(lang, "feature")}</h3>
                <p>{getLocalized(selectedStore.feature, lang)}</p>
              </div>
              <div>
                <h3>{t(lang, "campaign")}</h3>
                <p>{getLocalized(selectedStore.campaign, lang)}</p>
              </div>
            </div>

            <button type="button" className="possess" onClick={startPossession}>
              {t(lang, "possess")}
            </button>
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
