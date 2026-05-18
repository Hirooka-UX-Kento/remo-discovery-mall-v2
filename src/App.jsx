import React, { useState } from "react";
import "./style.css";

const text = {
  ja: {
    switchLang: "English",
    title: "Remo Discovery Mall",
    subtitle: "\u30ed\u30dc\u30c3\u30c8\u306b\u61d1\u4f9d\u3057\u3066\u3001\u65e5\u672c\u4e2d\u306e\u30a2\u30cb\u30e1\u30fb\u30db\u30d3\u30fc\u5e97\u3092\u9060\u9694\u63a2\u7d22\u3059\u308b\u30c7\u30e2\u30a2\u30d7\u30ea",
    mapTitle: "\u65e5\u672c\u30de\u30c3\u30d7\u304b\u3089\u5e97\u8217\u3092\u9078\u629e",
    stores: "\u6ce8\u76ee\u5e97\u8217",
    detail: "\u5e97\u8217\u8a73\u7d30",
    recommended: "\u304a\u3059\u3059\u3081",
    feature: "\u7279\u5fb4",
    campaign: "\u9650\u5b9a\u4f01\u753b",
    possess: "\u30ed\u30dc\u30c3\u30c8\u306b\u61d1\u4f9d\u3059\u308b",
    connecting: "\u30ed\u30dc\u30c3\u30c8\u306b\u61d1\u4f9d\u4e2d...",
    mission: "\u30df\u30c3\u30b7\u30e7\u30f3",
    xp: "\u7d4c\u9a13\u5024",
    distance: "\u79fb\u52d5\u8ddd\u96e2",
    cart: "\u30ab\u30fc\u30c8",
    scan: "\u30a2\u30a4\u30c6\u30e0\u30b9\u30ad\u30e3\u30f3",
    add: "\u30ab\u30fc\u30c8\u306b\u8ffd\u52a0",
    move: "\u79fb\u52d5",
    leave: "\u96e2\u8131",
    pop: "\u30dd\u30c3\u30d7",
    cyber: "\u30b5\u30a4\u30d0\u30fc",
    premium: "\u30d7\u30ec\u30df\u30a2\u30e0"
  },
  en: {
    switchLang: "Japanese",
    title: "Remo Discovery Mall",
    subtitle: "A demo app where users possess remote robots and explore Japanese anime / hobby shops.",
    mapTitle: "Choose a store from Japan map",
    stores: "Featured Stores",
    detail: "Store Detail",
    recommended: "Recommended",
    feature: "Feature",
    campaign: "Campaign",
    possess: "Possess Robot",
    connecting: "Possessing Robot...",
    mission: "Mission",
    xp: "XP",
    distance: "Distance",
    cart: "Cart",
    scan: "Item Scan",
    add: "Add to Cart",
    move: "Move to",
    leave: "Leave",
    pop: "Pop",
    cyber: "Cyber",
    premium: "Premium"
  }
};

const stores = [
  { id: "akihabara", x: 70, y: 55, robot: "Remo-01", name: { ja: "\u79cb\u8449\u539f\u30db\u30d3\u30fc\u30d9\u30fc\u30b9", en: "Akihabara Hobby Base" }, area: { ja: "\u6771\u4eac / \u79cb\u8449\u539f", en: "Tokyo / Akihabara" }, tag: { ja: "\u30a2\u30cb\u30e1\u8056\u5730", en: "Anime Holy Land" } },
  { id: "nakano", x: 68, y: 57, robot: "Remo-02", name: { ja: "\u4e2d\u91ce\u30ec\u30c8\u30ed\u30c8\u30a4\u30ba", en: "Nakano Retro Toys" }, area: { ja: "\u6771\u4eac / \u4e2d\u91ce", en: "Tokyo / Nakano" }, tag: { ja: "\u30ec\u30c8\u30ed\u73a9\u5177", en: "Retro Toys" } },
  { id: "osaka", x: 48, y: 68, robot: "Remo-03", name: { ja: "\u65e5\u672c\u6a4b\u30aa\u30bf\u30ed\u30fc\u30c9", en: "Nipponbashi Otaku Street" }, area: { ja: "\u5927\u962a / \u65e5\u672c\u6a4b", en: "Osaka / Nipponbashi" }, tag: { ja: "\u95a2\u897f\u30a2\u30cb\u30e1\u8056\u5730", en: "Kansai Anime Area" } },
  { id: "hakata", x: 24, y: 76, robot: "Remo-04", name: { ja: "\u535a\u591a\u30dd\u30c3\u30d7\u30ab\u30eb\u30c1\u30e3\u30fc\u5e97", en: "Hakata Pop Culture Shop" }, area: { ja: "\u798f\u5ca1 / \u535a\u591a", en: "Fukuoka / Hakata" }, tag: { ja: "\u4e5d\u5dde\u30a2\u30cb\u30e1\u30b9\u30dd\u30c3\u30c8", en: "Kyushu Anime Spot" } }
];

const scenes = {
  entrance: { title: { ja: "\u5e97\u8217\u5165\u53e3", en: "Store Entrance" }, distance: 0, image: "https://images.unsplash.com/photo-1607083206968-13611e3d76db?auto=format&fit=crop&w=1600&q=80", next: ["figure", "cards", "showcase"] },
  figure: { title: { ja: "\u30d5\u30a3\u30ae\u30e5\u30a2\u901a\u8def", en: "Figure Aisle" }, distance: 12, image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=1600&q=80", next: ["entrance", "showcase", "limited"] },
  cards: { title: { ja: "\u30c8\u30ec\u30ab\u30a8\u30ea\u30a2", en: "Trading Card Area" }, distance: 9, image: "https://images.unsplash.com/photo-1611996575749-79a3a250f948?auto=format&fit=crop&w=1600&q=80", next: ["entrance", "limited"] },
  showcase: { title: { ja: "\u30b7\u30e7\u30fc\u30b1\u30fc\u30b9", en: "Showcase" }, distance: 15, image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=80", next: ["entrance", "figure", "limited"] },
  limited: { title: { ja: "\u9650\u5b9a\u54c1\u30b3\u30fc\u30ca\u30fc", en: "Limited Goods Corner" }, distance: 18, image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=1600&q=80", next: ["figure", "cards", "showcase"] }
};

function pick(value, lang) {
  return value[lang] || value.en || value.ja;
}

export default function App() {
  const [lang, setLang] = useState("ja");
  const [tone, setTone] = useState("pop");
  const [selected, setSelected] = useState(null);
  const [mode, setMode] = useState("map");
  const [sceneKey, setSceneKey] = useState("entrance");
  const [xp, setXp] = useState(1000);
  const [meters, setMeters] = useState(0);
  const [cart, setCart] = useState(0);
  const T = text[lang];
  const scene = scenes[sceneKey];

  function startRobot() {
    setMode("connecting");
    setTimeout(() => setMode("robot"), 1200);
  }

  function move(nextKey) {
    const s = scenes[nextKey];
    const gain = Math.max(20, s.distance * 12);
    setSceneKey(nextKey);
    setMeters((v) => v + s.distance);
    setXp((v) => v + gain);
  }

  if (mode === "connecting") {
    return <div className={"screen connect " + tone}><div className="ring">● ●</div><h1>{T.connecting}</h1></div>;
  }

  if (mode === "robot") {
    return (
      <div className={"screen robot " + tone}>
        <img className="photo" src={scene.image} alt={pick(scene.title, lang)} />
        <div className="shade" />
        <div className="topbar"><span>● REC</span><span>{selected?.robot}</span><span>BAT 78%</span><button onClick={() => setLang(lang === "ja" ? "en" : "ja")}>{T.switchLang}</button></div>
        <div className="scene"><h1>{pick(scene.title, lang)}</h1><p>{T.distance}: {meters}m / {T.xp}: {xp}</p></div>
        <div className="side"><h3>{T.mission}</h3><p>{T.distance} + XP</p><h3>{T.cart}</h3><p>{cart}</p></div>
        <div className="scan"><h2>{T.scan}</h2><p>LEGENDARY ITEM</p><button onClick={() => { setCart(cart + 1); setXp(xp + 80); }}>{T.add}</button></div>
        <div className="controls">{scene.next.map((n) => <button key={n} onClick={() => move(n)}>{T.move} {pick(scenes[n].title, lang)}<small>+{Math.max(20, scenes[n].distance * 12)}XP</small></button>)}<button className="exit" onClick={() => setMode("map")}>{T.leave}</button></div>
      </div>
    );
  }

  return (
    <div className={"app " + tone}>
      <header><div><p>Telepresence Shopping Prototype</p><h1>{T.title}</h1><p>{T.subtitle}</p></div><div className="tools"><button onClick={() => setLang(lang === "ja" ? "en" : "ja")}>{T.switchLang}</button><button onClick={() => setTone("pop")}>{T.pop}</button><button onClick={() => setTone("cyber")}>{T.cyber}</button><button onClick={() => setTone("premium")}>{T.premium}</button></div></header>
      <main>
        <section className="map"><h2>{T.mapTitle}</h2><div className="japan"><JapanMap />{stores.map((s) => <button className="pin" style={{ left: s.x + "%", top: s.y + "%" }} key={s.id} onClick={() => setSelected(s)}>★<span>{pick(s.area, lang)}</span></button>)}</div></section>
        <aside><h2>{T.stores}</h2>{stores.map((s) => <button className="card" key={s.id} onClick={() => setSelected(s)}><b>{pick(s.name, lang)}</b><span>{pick(s.area, lang)}</span><em>{pick(s.tag, lang)}</em></button>)}</aside>
      </main>
      {selected && <div className="modalBg" onClick={() => setSelected(null)}><div className="modal" onClick={(e) => e.stopPropagation()}><button className="close" onClick={() => setSelected(null)}>×</button><h2>{pick(selected.name, lang)}</h2><p>{pick(selected.area, lang)} / {pick(selected.tag, lang)}</p><div className="grid"><div><h3>{T.recommended}</h3><p>Figure / Model Kit / Trading Card</p></div><div><h3>{T.feature}</h3><p>Remote robot shopping experience.</p></div><div><h3>{T.campaign}</h3><p>Limited item hunt.</p></div></div><button className="possess" onClick={startRobot}>{T.possess}</button></div></div>}
    </div>
  );
}

function JapanMap() {
  return <svg className="mapSvg" viewBox="0 0 100 100"><path d="M73 8 C82 6 88 12 88 20 C88 29 80 35 71 31 C65 28 63 20 66 14 C68 11 70 9 73 8Z"/><path d="M68 34 C78 38 84 47 79 56 C74 65 60 65 52 70 C43 76 32 78 26 71 C19 63 26 54 36 50 C47 46 53 35 68 34Z"/><path d="M42 71 C48 70 55 73 57 78 C51 82 42 81 36 77 C37 74 39 72 42 71Z"/><path d="M22 71 C30 70 36 78 34 87 C32 95 20 94 16 86 C13 79 16 73 22 71Z"/><rect x="68" y="75" width="24" height="16" rx="3"/><circle cx="80" cy="83" r="3"/></svg>;
}
