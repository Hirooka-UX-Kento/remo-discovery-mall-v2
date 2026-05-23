import React, { useEffect, useMemo, useState } from "react";
import "./style.css";
import RemoDiscoveryMall from "./components/RemoDiscoveryMall.jsx";
import AdminPanel from "./components/AdminPanel.jsx";
import NeoApp from "./NeoApp.jsx";
import { FeatureProvider } from "./features/FeatureContext.jsx";
import { GameProvider } from "./game.jsx";

function useHashRoute() {
  const read = () => window.location.hash.replace(/^#\/?/, "").toLowerCase();
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const onHash = () => setRoute(read());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  return route;
}

export default function App() {
  const route = useHashRoute();
  useEffect(() => {
    if (route !== "admin") {
      try { sessionStorage.setItem("rdm_last_app", route); } catch { /* ignore */ }
    }
  }, [route]);
  return (
    <FeatureProvider>
      {route === "admin" ? (
        <AdminPanel />
      ) : route === "neo" ? (
        <GameProvider><NeoApp /></GameProvider>
      ) : (
        <RemoDiscoveryMall />
      )}
    </FeatureProvider>
  );
}

const I18N = {
  ja: {
    lang: "English",
    title: "Remo Discovery Mall",
    subtitle: "\u30ed\u30dc\u30c3\u30c8\u306b\u61d1\u4f9d\u3057\u3066\u3001\u30cb\u30c3\u30dd\u30f3\u306e\u201c\u597d\u304d\u201d\u3092\u898b\u3064\u3051\u306b\u884c\u3053\u3046\u3002",
    nav1: "\u30c6\u30ec\u30d7\u30ec\u30bc\u30f3\u30b9\u63a5\u7d9a",
    nav2: "\u305d\u306e\u5834\u3067\u304a\u8cb7\u3044\u7269",
    nav3: "\u9650\u5b9a\u30fb\u30ec\u30a2\u5546\u54c1",
    nav4: "\u30df\u30c3\u30b7\u30e7\u30f3\u3067XP\u7372\u5f97",
    step1: "\u65e5\u672c\u30de\u30c3\u30d7\u304b\u3089\u304a\u5e97\u3092\u9078\u3076",
    hero: "\u30cb\u30c3\u30dd\u30f3\u3001\u3069\u3053\u3078\u3067\u3082\u3002",
    heroSub: "\u5168\u56fd\u306e\u30a2\u30cb\u30e1\u30fb\u30db\u30d3\u30fc\u30b7\u30e7\u30c3\u30d7\u3078\u3001\u30ed\u30dc\u30c3\u30c8\u3067\u63a2\u7d22\uff01",
    tap: "\u884c\u304d\u305f\u3044\u304a\u5e97\u306e\u30d4\u30f3\u3092\u30bf\u30c3\u30d7\u3057\u3088\u3046",
    popular: "\u3044\u307e\u4eba\u6c17\u306e\u30a8\u30ea\u30a2",
    step2: "\u304a\u5e97\u306e\u8a73\u7d30\u3092\u30c1\u30a7\u30c3\u30af\u3057\u3066\u3001\u5165\u5e97\u3057\u3088\u3046\uff01",
    rec: "\u304a\u3059\u3059\u3081",
    feature: "\u7279\u5fb4",
    campaign: "\u9650\u5b9a\u4f01\u753b",
    possess: "\u30ed\u30dc\u30c3\u30c8\u306b\u61d1\u4f9d\u3059\u308b",
    possessSub: "\u3053\u306e\u304a\u5e97\u306e\u30ed\u30dc\u30c3\u30c8\u306b\u63a5\u7d9a\u3057\u3066\u63a2\u7d22\u3092\u958b\u59cb\u3057\u307e\u3059",
    step3: "\u30ed\u30dc\u30c3\u30c8\u306e\u8996\u70b9\u3067\u81ea\u7531\u306b\u63a2\u7d22\uff01",
    connecting: "\u30ed\u30dc\u30c3\u30c8\u306b\u61d1\u4f9d\u4e2d...",
    mission: "\u30df\u30c3\u30b7\u30e7\u30f3",
    cart: "\u30ab\u30fc\u30c8",
    itemScan: "\u30a2\u30a4\u30c6\u30e0\u30b9\u30ad\u30e3\u30f3",
    addCart: "\u30ab\u30fc\u30c8\u306b\u8ffd\u52a0",
    scanQr: "\u68da\u306eQR\u3092\u30b9\u30ad\u30e3\u30f3",
    requestPurchase: "\u8cfc\u5165\u30ea\u30af\u30a8\u30b9\u30c8",
    arInfo: "AR\u5546\u54c1\u60c5\u5831",
    shelf: "\u68da",
    stock: "\u5728\u5eab",
    zoom: "\u753b\u50cf\u30ba\u30fc\u30e0",
    close: "\u9589\u3058\u308b",
    forward: "\u524d\u9032",
    left: "\u5de6\u3092\u898b\u308b",
    right: "\u53f3\u3092\u898b\u308b",
    back: "\u632f\u308a\u8fd4\u308b",
    leave: "\u96e2\u8131",
    distance: "\u79fb\u52d5\u8ddd\u96e2",
    pop: "\u30dd\u30c3\u30d7",
    cyber: "\u30b5\u30a4\u30d0\u30fc",
    premium: "\u30d7\u30ec\u30df\u30a2\u30e0"
  },
  en: {
    lang: "Japanese",
    title: "Remo Discovery Mall",
    subtitle: "Possess a robot and discover what you love across Japan.",
    nav1: "Telepresence",
    nav2: "Live shopping",
    nav3: "Limited goods",
    nav4: "Earn XP",
    step1: "Choose a store from Japan map",
    hero: "Go anywhere in Japan.",
    heroSub: "Explore anime and hobby shops nationwide through a robot.",
    tap: "Tap a pin to choose your destination.",
    popular: "Popular areas",
    step2: "Check store details before entering!",
    rec: "Recommended",
    feature: "Features",
    campaign: "Limited event",
    possess: "Possess Robot",
    possessSub: "Connect to the store robot and start exploring.",
    step3: "Explore freely from the robot view!",
    connecting: "Possessing Robot...",
    mission: "Mission",
    cart: "Cart",
    itemScan: "Item Scan",
    addCart: "Add to cart",
    scanQr: "Scan shelf QR",
    requestPurchase: "Purchase request",
    arInfo: "AR item info",
    shelf: "Shelf",
    stock: "Stock",
    zoom: "Image zoom",
    close: "Close",
    forward: "Forward",
    left: "Look left",
    right: "Look right",
    back: "Turn back",
    leave: "Leave",
    distance: "Distance",
    pop: "Pop",
    cyber: "Cyber",
    premium: "Premium"
  }
};

const stores = [
  {
    id: "akihabara",
    rank: 1,
    name: { ja: "\u30dc\u30fc\u30af\u30b9 \u79cb\u8449\u539f\u30db\u30d3\u30fc\u5929\u56fd2", en: "Volks Akihabara Hobby Paradise 2" },
    short: { ja: "\u79cb\u8449\u539f\uff08\u6771\u4eac\uff09", en: "Akihabara" },
    area: { ja: "\u6771\u4eac\u90fd\u5343\u4ee3\u7530\u533a\u5916\u795e\u75304-2-10", en: "Akihabara, Tokyo" },
    tag: { ja: "\u30a2\u30cb\u30e1\u8056\u5730", en: "Anime Holy Land" },
    x: 70,
    y: 55,
    color: "pink",
    image: "https://images.unsplash.com/photo-1607083206968-13611e3d76db?auto=format&fit=crop&w=1200&q=80",
    robot: "RemoPro X7",
    likes: "12,345",
    campaign: { ja: "\u30ac\u30f3\u30c0\u30e0 WEEK", en: "GUNDAM WEEK" },
    picks: { ja: ["\u30d5\u30a3\u30ae\u30e5\u30a2", "\u30ac\u30f3\u30d7\u30e9", "\u30c8\u30ec\u30ab", "\u30ec\u30c8\u30ed\u73a9\u5177"], en: ["Figure", "Model Kit", "Card", "Retro Toy"] },
    features: { ja: ["\u5727\u5012\u7684\u306a\u54c1\u63c3\u3048", "\u9650\u5b9a\u5546\u54c1\u304c\u8c4a\u5bcc", "\u30b9\u30bf\u30c3\u30d5\u306e\u77e5\u8b58\u304c\u5145\u5b9f"], en: ["Huge selection", "Many limited items", "Expert staff"] }
  },
  {
    id: "osaka",
    rank: 2,
    name: { ja: "\u65e5\u672c\u6a4b\u30aa\u30bf\u30ed\u30fc\u30c9\u30b7\u30e7\u30c3\u30d7", en: "Nipponbashi Otaku Street" },
    short: { ja: "\u65e5\u672c\u6a4b\uff08\u5927\u962a\uff09", en: "Nipponbashi" },
    area: { ja: "\u5927\u962a\u5e9c\u5927\u962a\u5e02", en: "Osaka, Nipponbashi" },
    tag: { ja: "\u30a2\u30cb\u30e1\u8056\u5730", en: "Anime Holy Land" },
    x: 48,
    y: 68,
    color: "blue",
    image: "https://images.unsplash.com/photo-1611996575749-79a3a250f948?auto=format&fit=crop&w=1200&q=80",
    robot: "RemoPro O3",
    likes: "10,240",
    campaign: { ja: "\u5927\u962a\u9650\u5b9a\u30d5\u30a7\u30a2", en: "Osaka Limited Fair" },
    picks: { ja: ["\u9650\u5b9a\u30d5\u30a3\u30ae\u30e5\u30a2", "\u30ad\u30e3\u30e9\u96d1\u8ca8", "\u30d7\u30e9\u30e2"], en: ["Limited Figure", "Goods", "Model Kit"] },
    features: { ja: ["\u95a2\u897f\u30ab\u30eb\u30c1\u30e3\u30fc", "\u5730\u57df\u9650\u5b9a\u54c1", "\u63a2\u7d22\u611f\u304c\u697d\u3057\u3044"], en: ["Kansai culture", "Regional goods", "Fun exploration"] }
  },
  {
    id: "nakano",
    rank: 3,
    name: { ja: "\u4e2d\u91ce\u30ec\u30c8\u30ed\u30c8\u30a4\u30ba", en: "Nakano Retro Toys" },
    short: { ja: "\u4e2d\u91ce\uff08\u6771\u4eac\uff09", en: "Nakano" },
    area: { ja: "\u6771\u4eac\u90fd\u4e2d\u91ce\u533a", en: "Nakano, Tokyo" },
    tag: { ja: "\u4eba\u6c17\u30b9\u30dd\u30c3\u30c8", en: "Popular Spot" },
    x: 67,
    y: 57,
    color: "purple",
    image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=1200&q=80",
    robot: "RemoPro R2",
    likes: "8,910",
    campaign: { ja: "\u30ec\u30c8\u30ed\u304a\u5b9d\u63a2\u7d22", en: "Retro Treasure Hunt" },
    picks: { ja: ["\u662d\u548c\u73a9\u5177", "\u65e7\u4f5c\u30b0\u30c3\u30ba", "\u30ec\u30a2\u30ab\u30fc\u30c9"], en: ["Vintage Toy", "Old Goods", "Rare Card"] },
    features: { ja: ["\u4e2d\u53e4\u30db\u30d3\u30fc", "\u30ec\u30c8\u30ed\u73a9\u5177", "\u767a\u6398\u611f"], en: ["Used hobby goods", "Retro toys", "Treasure hunt"] }
  },
  {
    id: "sapporo",
    rank: 4,
    name: { ja: "\u672d\u5e4c\u30db\u30d3\u30fc\u30b2\u30fc\u30c8", en: "Sapporo Hobby Gate" },
    short: { ja: "\u672d\u5e4c\uff08\u5317\u6d77\u9053\uff09", en: "Sapporo" },
    area: { ja: "\u5317\u6d77\u9053\u672d\u5e4c\u5e02", en: "Sapporo, Hokkaido" },
    tag: { ja: "\u30a2\u30cb\u30e1\u8056\u5730", en: "Anime Spot" },
    x: 75,
    y: 16,
    color: "purple",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=1200&q=80",
    robot: "RemoPro S5",
    likes: "7,700",
    campaign: { ja: "\u5317\u6d77\u9053\u9650\u5b9a\u30d5\u30a7\u30a2", en: "Hokkaido Fair" },
    picks: { ja: ["\u9650\u5b9a\u30b0\u30c3\u30ba", "\u96ea\u307e\u3064\u308a", "\u30ec\u30a2\u30d0\u30c3\u30b8"], en: ["Limited Goods", "Snow Festival", "Rare Badge"] },
    features: { ja: ["\u5317\u6d77\u9053\u9650\u5b9a", "\u89b3\u5149\u9023\u52d5", "\u5b63\u7bc0\u4f01\u753b"], en: ["Hokkaido goods", "Tourism linked", "Seasonal events"] }
  },
  {
    id: "hakata",
    rank: 5,
    name: { ja: "\u535a\u591a\u30dd\u30c3\u30d7\u30ab\u30eb\u30c1\u30e3\u30fc\u5e97", en: "Hakata Pop Culture Shop" },
    short: { ja: "\u535a\u591a / \u798f\u5ca1", en: "Hakata / Fukuoka" },
    area: { ja: "\u798f\u5ca1\u770c\u798f\u5ca1\u5e02", en: "Fukuoka, Hakata" },
    tag: { ja: "\u30a2\u30cb\u30e1\u8056\u5730", en: "Anime Spot" },
    x: 25,
    y: 76,
    color: "pink",
    image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=1200&q=80",
    robot: "RemoPro H4",
    likes: "6,850",
    campaign: { ja: "\u4e5d\u5dde\u9650\u5b9a\u30bb\u30ec\u30af\u30b7\u30e7\u30f3", en: "Kyushu Selection" },
    picks: { ja: ["\u5730\u57df\u9650\u5b9a", "\u30b3\u30e9\u30dc\u54c1", "\u30ad\u30fc\u30db\u30eb\u30c0\u30fc"], en: ["Regional Goods", "Collab Item", "Keychain"] },
    features: { ja: ["\u4e5d\u5dde\u9650\u5b9a", "\u304a\u571f\u7523", "\u30b3\u30e9\u30dc\u5546\u54c1"], en: ["Kyushu goods", "Souvenirs", "Collaboration"] }
  },
  {
    id: "okinawa",
    rank: 6,
    name: { ja: "\u90a3\u8987\u30ab\u30eb\u30c1\u30e3\u30fc\u30b9\u30c6\u30fc\u30b7\u30e7\u30f3", en: "Naha Culture Station" },
    short: { ja: "\u90a3\u8987\uff08\u6c96\u7e04\uff09", en: "Naha" },
    area: { ja: "\u6c96\u7e04\u770c\u90a3\u8987\u5e02", en: "Naha, Okinawa" },
    tag: { ja: "\u4eba\u6c17\u30b9\u30dd\u30c3\u30c8", en: "Popular Spot" },
    x: 16,
    y: 88,
    color: "pink",
    image: "https://images.unsplash.com/photo-1542931287-023b922fa89b?auto=format&fit=crop&w=1200&q=80",
    robot: "RemoPro N6",
    likes: "5,200",
    campaign: { ja: "\u6c96\u7e04\u30ab\u30eb\u30c1\u30e3\u30fcWEEK", en: "Okinawa Culture Week" },
    picks: { ja: ["\u6c96\u7e04\u9650\u5b9a", "\u5357\u56fd\u96d1\u8ca8", "\u30b3\u30e9\u30dc\u54c1"], en: ["Okinawa Goods", "Island Item", "Collab Goods"] },
    features: { ja: ["\u5357\u56fd\u30ab\u30eb\u30c1\u30e3\u30fc", "\u9650\u5b9a\u96d1\u8ca8", "\u89b3\u5149\u4f53\u9a13"], en: ["Island culture", "Limited goods", "Tourism"] }
  }
];

const robotProducts = {
  exia: {
    id: "exia",
    name: { ja: "MG \u30ac\u30f3\u30c0\u30e0\u30a8\u30af\u30b7\u30a2", en: "MG Gundam Exia" },
    price: "\u00a57,920",
    stock: 1,
    rarity: "LEGENDARY",
    shelf: "A-03",
    qr: "RDM-A03-EXIA",
    side: "left",
    x: 33,
    y: 48,
    color: "#69e7ff",
    note: { ja: "\u9650\u5b9a\u518d\u5165\u8377\u3002\u5916\u7bb1\u72b6\u614bA\u3002", en: "Limited restock. Box grade A." }
  },
  miku: {
    id: "miku",
    name: { ja: "\u96ea\u30df\u30af \u30a2\u30af\u30ea\u30eb\u30b9\u30bf\u30f3\u30c9", en: "Snow Miku Acrylic Stand" },
    price: "\u00a51,980",
    stock: 4,
    rarity: "RARE",
    shelf: "A-05",
    qr: "RDM-A05-MIKU",
    side: "right",
    x: 68,
    y: 43,
    color: "#ff66c7",
    note: { ja: "\u68da\u4e0a\u6bb5\u306e\u5730\u57df\u9650\u5b9a\u30a2\u30a4\u30c6\u30e0\u3002", en: "Regional limited item on the upper shelf." }
  },
  cards: {
    id: "cards",
    name: { ja: "\u30ec\u30a2\u30ab\u30fc\u30c9\u30d1\u30c3\u30af 1998", en: "Rare Card Pack 1998" },
    price: "\u00a54,400",
    stock: 2,
    rarity: "RARE",
    shelf: "B-02",
    qr: "RDM-B02-CARD",
    side: "front",
    x: 50,
    y: 45,
    color: "#ffe16a",
    note: { ja: "\u30b1\u30fc\u30b9\u5185\u306e\u30b9\u30bf\u30c3\u30d5\u78ba\u8a8d\u5fc5\u8981\u5546\u54c1\u3002", en: "Staff confirmation required from the showcase." }
  },
  retro: {
    id: "retro",
    name: { ja: "\u662d\u548c\u30ed\u30dc\u30c3\u30c8\u30bd\u30d5\u30d3", en: "Showa Robot Sofubi" },
    price: "\u00a511,800",
    stock: 1,
    rarity: "LEGENDARY",
    shelf: "C-01",
    qr: "RDM-C01-ROBO",
    side: "left",
    x: 38,
    y: 39,
    color: "#9cff7a",
    note: { ja: "\u30b7\u30e7\u30fc\u30b1\u30fc\u30b9\u4e2d\u592e\u3002\u30ba\u30fc\u30e0\u63a8\u5968\u3002", en: "Centered in the showcase. Zoom recommended." }
  },
  limitedBadge: {
    id: "limitedBadge",
    name: { ja: "\u5e97\u8217\u9650\u5b9a\u30db\u30ed\u30d0\u30c3\u30b8", en: "Store Limited Holo Badge" },
    price: "\u00a51,320",
    stock: 7,
    rarity: "NORMAL",
    shelf: "L-04",
    qr: "RDM-L04-BADGE",
    side: "right",
    x: 64,
    y: 51,
    color: "#b48cff",
    note: { ja: "\u4eca\u65e5\u306e\u6765\u5e97\u8a18\u5ff5\u30e9\u30a4\u30f3\u3002", en: "Today-only visit commemorative line." }
  }
};

const floorNodes = [
  { id: "entrance", x: 18, y: 78, label: "IN" },
  { id: "figure", x: 38, y: 54, label: "A" },
  { id: "cards", x: 50, y: 72, label: "B" },
  { id: "showcase", x: 66, y: 42, label: "C" },
  { id: "limited", x: 78, y: 22, label: "L" }
];

const scenes = {
  entrance: { title: { ja: "\u5e97\u8217\u5165\u53e3", en: "Entrance" }, image: stores[0].image, rarity: "NORMAL", distance: 0, next: ["figure", "cards", "showcase"], aisle: "GATE-00", productIds: ["exia", "cards"] },
  figure: { title: { ja: "\u30d5\u30a3\u30ae\u30e5\u30a2\u901a\u8def", en: "Figure Aisle" }, image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=1800&q=80", rarity: "RARE", distance: 12, next: ["entrance", "showcase", "limited"], aisle: "AISLE-A", productIds: ["exia", "miku", "retro"] },
  cards: { title: { ja: "\u30c8\u30ec\u30ab\u30a8\u30ea\u30a2", en: "Trading Card Area" }, image: "https://images.unsplash.com/photo-1611996575749-79a3a250f948?auto=format&fit=crop&w=1800&q=80", rarity: "NORMAL", distance: 9, next: ["entrance", "limited"], aisle: "AISLE-B", productIds: ["cards", "limitedBadge"] },
  showcase: { title: { ja: "\u30b7\u30e7\u30fc\u30b1\u30fc\u30b9", en: "Showcase" }, image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1800&q=80", rarity: "LEGENDARY", distance: 15, next: ["entrance", "figure", "limited"], aisle: "CASE-C", productIds: ["retro", "exia"] },
  limited: { title: { ja: "\u9650\u5b9a\u54c1\u30b3\u30fc\u30ca\u30fc", en: "Limited Goods" }, image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=1800&q=80", rarity: "LEGENDARY", distance: 18, next: ["figure", "cards", "showcase"], aisle: "LIMITED-L", productIds: ["limitedBadge", "miku", "cards"] }
};

function tr(lang, key) {
  return I18N[lang][key] || key;
}

function local(value, lang) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[lang] || value.en || value.ja || "";
}

function LegacyApp() {
  const [lang, setLang] = useState("ja");
  const [theme, setTheme] = useState("pop");
  const [selected, setSelected] = useState(stores[0]);
  const [screen, setScreen] = useState("home");
  const [sceneId, setSceneId] = useState("entrance");
  const [xp, setXp] = useState(2350);
  const [meters, setMeters] = useState(0);
  const [cart, setCart] = useState(2);
  const ranked = useMemo(() => stores.slice().sort((a, b) => a.rank - b.rank), []);
  const scene = scenes[sceneId];

  function startRobot() {
    setScreen("sync");
    setTimeout(() => setScreen("robot"), 1300);
  }

  function move(id) {
    const gain = Math.max(30, scenes[id].distance * 12);
    setSceneId(id);
    setMeters((v) => v + scenes[id].distance);
    setXp((v) => v + gain);
  }

  if (screen === "sync") {
    return (
      <div className={"syncScreen " + theme}>
        <div className="syncOrb"><span>● ●</span></div>
        <h1>{tr(lang, "connecting")}</h1>
        <p>AUTH_OK / ROBOT_LINKED / LIVE_FEED_READY</p>
      </div>
    );
  }

  if (screen === "robot") {
    return (
      <RobotView
        lang={lang}
        theme={theme}
        setLang={setLang}
        selected={selected}
        sceneId={sceneId}
        scene={scene}
        xp={xp}
        meters={meters}
        cart={cart}
        move={move}
        scanItem={() => setXp((v) => v + 90)}
        addCart={() => { setCart((v) => v + 1); setXp((v) => v + 150); }}
        leave={() => setScreen("home")}
      />
    );
  }

  return (
    <div className={"appShell " + theme}>
      <Header lang={lang} theme={theme} setLang={setLang} setTheme={setTheme} />
      <main className="mainBoard">
        <section className="mapCard">
          <div className="step">1</div>
          <div className="sectionTitle">{tr(lang, "step1")}</div>
          <div className="heroCopy">
            <h2>{tr(lang, "hero")}</h2>
            <p>{tr(lang, "heroSub")}</p>
            <small>{tr(lang, "tap")}</small>
          </div>
          <button className="areaButton">☰ AREA</button>
          <div className="mapStage">
            <JapanMap />
            {stores.map((store) => (
              <button
                key={store.id}
                className={"mapPin " + store.color}
                style={{ left: store.x + "%", top: store.y + "%" }}
                onClick={() => setSelected(store)}
              >
                <span className="pinCore">🤖</span>
                <span className="pinLabel">
                  <b>{local(store.short, lang)}</b>
                  <em>{local(store.tag, lang)}</em>
                </span>
              </button>
            ))}
          </div>
          <div className="ranking">
            <strong>{tr(lang, "popular")}</strong>
            {ranked.slice(0, 5).map((store) => (
              <button key={store.id} onClick={() => setSelected(store)}>
                <span>{store.rank}</span>
                <img src={store.image} alt={local(store.short, lang)} />
                <small>{local(store.short, lang)}</small>
              </button>
            ))}
          </div>
        </section>
        <section className="sideColumn">
          <StoreDetail lang={lang} store={selected} startRobot={startRobot} />
          <RobotDemo lang={lang} />
        </section>
      </main>
      <footer className="benefits">
        {[tr(lang, "nav1"), tr(lang, "nav2"), tr(lang, "nav3"), tr(lang, "nav4")].map((label, i) => (
          <div className="benefit" key={label}><span>{["🤖","🛒","🎁","XP"][i]}</span><b>{label}</b></div>
        ))}
      </footer>
    </div>
  );
}

function Header({ lang, theme, setLang, setTheme }) {
  return (
    <>
      <header className="topHeader">
        <div className="brand">
          <div className="logo">●●</div>
          <div>
            <h1>{tr(lang, "title")}</h1>
            <p>{tr(lang, "subtitle")}</p>
          </div>
        </div>
        <nav>
          <span>🤖 {tr(lang, "nav1")}</span>
          <span>🛒 {tr(lang, "nav2")}</span>
          <span>🎁 {tr(lang, "nav3")}</span>
          <span>🏅 {tr(lang, "nav4")}</span>
        </nav>
      </header>
      <div className="switches">
        <button onClick={() => setLang(lang === "ja" ? "en" : "ja")}>{tr(lang, "lang")}</button>
        <button className={theme === "pop" ? "on" : ""} onClick={() => setTheme("pop")}>{tr(lang, "pop")}</button>
        <button className={theme === "cyber" ? "on" : ""} onClick={() => setTheme("cyber")}>{tr(lang, "cyber")}</button>
        <button className={theme === "premium" ? "on" : ""} onClick={() => setTheme("premium")}>{tr(lang, "premium")}</button>
      </div>
    </>
  );
}

function StoreDetail({ lang, store, startRobot }) {
  return (
    <div className="storeDetail">
      <div className="step">2</div>
      <div className="sectionTitle">{tr(lang, "step2")}</div>
      <div className="detailBody">
        <img src={store.image} alt={local(store.name, lang)} />
        <div>
          <h2>{local(store.name, lang)}</h2>
          <p>📍 {local(store.area, lang)}　♡ {store.likes}</p>
          <div className="detailGrid">
            <div>
              <h3>{tr(lang, "rec")}</h3>
              <div className="picks">
                {local(store.picks, lang).map((p, i) => <span key={p}>{["🎎","🤖","🃏","🧸"][i]}<small>{p}</small></span>)}
              </div>
            </div>
            <div>
              <h3>{tr(lang, "feature")}</h3>
              <ul>{local(store.features, lang).map((f) => <li key={f}>✓ {f}</li>)}</ul>
            </div>
            <div>
              <h3>{tr(lang, "campaign")}</h3>
              <div className="campaign">{local(store.campaign, lang)}</div>
            </div>
          </div>
        </div>
      </div>
      <button className="possess" onClick={startRobot}>
        <span>🤖</span>
        <b>{tr(lang, "possess")}</b>
        <small>{tr(lang, "possessSub")}</small>
      </button>
    </div>
  );
}

function RobotDemo({ lang }) {
  return (
    <div className="robotDemo">
      <div className="step">3</div>
      <div className="sectionTitle">{tr(lang, "step3")}</div>
      <div className="miniView">
        <img src={scenes.figure.image} alt="robot view" />
        <span className="hud h1">● REC<br />LIVE FEED</span>
        <span className="hud h2">BATTERY<br />78%</span>
        <span className="hud h3">{tr(lang, "mission")}<br />+150XP</span>
        <span className="marker m1">LEGENDARY</span>
        <span className="marker m2">RARE</span>
        <div className="miniPad">← {tr(lang, "left")}　▲ {tr(lang, "forward")}　{tr(lang, "right")} →</div>
      </div>
    </div>
  );
}

function LegacyRobotView({ lang, theme, setLang, selected, scene, xp, meters, cart, move, addCart, leave }) {
  return (
    <div className={"robotView " + theme}>
      <img className="robotPhoto" src={scene.image} alt={local(scene.title, lang)} />
      <div className="robotShade" />
      <div className="robotTop">
        <span className="rec">● REC</span><span>LIVE FEED</span><span>{selected.robot}</span><span>BATTERY 78%</span><span>28ms</span>
        <button onClick={() => setLang(lang === "ja" ? "en" : "ja")}>{tr(lang, "lang")}</button>
      </div>
      <div className="robotTitle">
        <span>{scene.rarity}</span>
        <h1>{local(scene.title, lang)}</h1>
        <p>{tr(lang, "distance")}: {meters}m / XP {xp}</p>
      </div>
      <aside className="leftHud"><b>FLOOR MAP</b><div className="floor">▲</div><p>{local(selected.name, lang)}</p></aside>
      <aside className="rightHud"><h3>{tr(lang, "cart")} {cart}</h3><h3>{tr(lang, "mission")}</h3><p>Rare item scan (0/1)</p><p>XP {xp}/3000</p></aside>
      <div className="scanBox"><b>{scene.rarity}</b><h2>{tr(lang, "itemScan")}</h2><p>MG Gundam Exia</p><p>¥7,920 / Stock 1</p><button onClick={addCart}>{tr(lang, "addCart")}</button></div>
      <span className="rMark legendary">LEGENDARY</span><span className="rMark rare">RARE</span><span className="rMark normal">NORMAL</span>
      <div className="movePad">
        {scene.next.map((id, i) => (
          <button key={id} onClick={() => move(id)}>{[tr(lang, "forward"), tr(lang, "left"), tr(lang, "right")][i] || tr(lang, "back")}<small>+{Math.max(30, scenes[id].distance * 12)}XP</small></button>
        ))}
        <button className="leave" onClick={leave}>{tr(lang, "leave")}</button>
      </div>
    </div>
  );
}

function RobotView({ lang, theme, setLang, selected, sceneId, scene, xp, meters, cart, move, scanItem, addCart, leave }) {
  const products = (scene.productIds || []).map((id) => robotProducts[id]).filter(Boolean);
  const [focusIndex, setFocusIndex] = useState(0);
  const [viewMode, setViewMode] = useState("front");
  const [scannedIds, setScannedIds] = useState([]);
  const [zoomItem, setZoomItem] = useState(null);
  const activeItem = products[focusIndex % Math.max(products.length, 1)];
  const scanned = activeItem ? scannedIds.includes(activeItem.id) : false;
  const sceneScannedCount = products.filter((item) => scannedIds.includes(item.id)).length;

  function focusProduct(item, index) {
    setFocusIndex(index);
    setViewMode(item.side || "front");
  }

  function handleScan() {
    if (!activeItem || scanned) return;
    setScannedIds((ids) => ids.includes(activeItem.id) ? ids : [...ids, activeItem.id]);
    scanItem(activeItem);
  }

  return (
    <div className={"robotView " + theme + " view-" + viewMode}>
      <img className="robotPhoto" src={scene.image} alt={local(scene.title, lang)} />
      <div className="robotShade" />
      <div className="robotTop">
        <span className="rec">REC</span>
        <span>LIVE FEED</span>
        <span>{selected.robot}</span>
        <span>BATTERY 78%</span>
        <span>{scene.aisle}</span>
        <span>28ms</span>
        <button onClick={() => setLang(lang === "ja" ? "en" : "ja")}>{tr(lang, "lang")}</button>
      </div>
      <div className="robotTitle">
        <span>{scene.rarity}</span>
        <h1>{local(scene.title, lang)}</h1>
        <p>{tr(lang, "distance")}: {meters}m / XP {xp}</p>
      </div>
      <div className="cameraReticle"><span /><i /></div>
      <div className="shelfLayer" aria-label="QR shelf targets">
        <div className="shelfDepth left" />
        <div className="shelfDepth right" />
        {products.map((item, index) => (
          <button
            className={"shelfProduct " + (activeItem?.id === item.id ? "active" : "")}
            key={item.id}
            style={{ left: item.x + "%", top: item.y + "%", "--itemColor": item.color }}
            onClick={() => focusProduct(item, index)}
          >
            <span className="productBox" />
            <span className="qrTag"><i />QR</span>
          </button>
        ))}
      </div>
      <aside className="leftHud">
        <b>FLOOR MAP</b>
        <div className="floor">
          {floorNodes.map((node) => (
            <span
              key={node.id}
              className={"floorNode " + (node.id === sceneId ? "active" : "")}
              style={{ left: node.x + "%", top: node.y + "%" }}
            >
              {node.label}
            </span>
          ))}
        </div>
        <p>{local(selected.name, lang)}</p>
      </aside>
      <aside className="rightHud">
        <h3>{tr(lang, "cart")} {cart}</h3>
        <h3>{tr(lang, "mission")}</h3>
        <p>QR scans {sceneScannedCount}/{products.length}</p>
        <p>XP {xp}/3000</p>
        {activeItem && <p>{tr(lang, "shelf")} {activeItem.shelf} / {activeItem.rarity}</p>}
      </aside>
      {activeItem && (
        <div className={"scanBox arPanel " + (scanned ? "scanned" : "")}>
          <b>{scanned ? tr(lang, "arInfo") : "QR TARGET LOCK"}</b>
          <h2>{scanned ? local(activeItem.name, lang) : tr(lang, "itemScan")}</h2>
          <p>{tr(lang, "shelf")} {activeItem.shelf} / {activeItem.qr}</p>
          {scanned ? (
            <>
              <div className="arItemRow">
                <button className="arThumb" style={{ "--itemColor": activeItem.color }} onClick={() => setZoomItem(activeItem)}>
                  <span />
                </button>
                <div>
                  <strong>{activeItem.price}</strong>
                  <small>{tr(lang, "stock")} {activeItem.stock}</small>
                  <small>{local(activeItem.note, lang)}</small>
                </div>
              </div>
              <div className="arActions">
                <button onClick={() => setZoomItem(activeItem)}>{tr(lang, "zoom")}</button>
                <button onClick={addCart}>{tr(lang, "requestPurchase")}</button>
              </div>
            </>
          ) : (
            <button onClick={handleScan}>{tr(lang, "scanQr")}</button>
          )}
        </div>
      )}
      <div className="lookControls">
        <button className={viewMode === "left" ? "active" : ""} onClick={() => setViewMode("left")}>{tr(lang, "left")}</button>
        <button className={viewMode === "front" ? "active" : ""} onClick={() => setViewMode("front")}>CENTER</button>
        <button className={viewMode === "right" ? "active" : ""} onClick={() => setViewMode("right")}>{tr(lang, "right")}</button>
      </div>
      <span className="rMark legendary">LEGENDARY</span><span className="rMark rare">RARE</span><span className="rMark normal">NORMAL</span>
      {zoomItem && (
        <div className="zoomOverlay" onClick={() => setZoomItem(null)}>
          <div className="zoomCard" onClick={(event) => event.stopPropagation()}>
            <button className="zoomClose" onClick={() => setZoomItem(null)}>{tr(lang, "close")}</button>
            <div className="zoomProduct" style={{ "--itemColor": zoomItem.color }}><span /></div>
            <h2>{local(zoomItem.name, lang)}</h2>
            <p>{zoomItem.price} / {tr(lang, "stock")} {zoomItem.stock} / {tr(lang, "shelf")} {zoomItem.shelf}</p>
          </div>
        </div>
      )}
      <div className="movePad">
        {scene.next.map((id, i) => (
          <button key={id} onClick={() => move(id)}>{[tr(lang, "forward"), tr(lang, "left"), tr(lang, "right")][i] || tr(lang, "back")}<small>+{Math.max(30, scenes[id].distance * 12)}XP</small></button>
        ))}
        <button className="leave" onClick={leave}>{tr(lang, "leave")}</button>
      </div>
    </div>
  );
}

function JapanMap() {
  return <img className="japanSvg japanMapImage" src="/japan-map.png" alt="Japan map" />;
}
