import React, { useEffect, useMemo, useRef, useState } from "react";
import { useFeatures } from "../features/FeatureContext.jsx";

// Resolve public/ assets against Vite's base URL so they work both locally ("/")
// and on GitHub Pages ("/remo-discovery-mall/").
const BASE = import.meta.env.BASE_URL;
const asset = (path) => `${BASE}${path.replace(/^\//, "")}`;

const STORE_AISLE = asset("assets/generated/zones/robot-store-aisle.png");
const PANORAMA_360 = asset("assets/generated/zones/store-panorama-360.png");
const TRANSFER_IMAGE = asset("assets/generated/possession-transfer.png");
const PRODUCT_IMAGE = asset("assets/generated/product-premium-model-kit.png");
const PRODUCT_IMAGES = {
  "model-kit": asset("assets/generated/products/model-kit.png"),
  acrylic: asset("assets/generated/products/acrylic.png"),
  "card-pack": asset("assets/generated/products/card-pack.png"),
  "holo-badge": asset("assets/generated/products/holo-badge.png"),
  "soft-vinyl": asset("assets/generated/products/soft-vinyl.png"),
  charm: asset("assets/generated/products/charm.png"),
  poster: asset("assets/generated/products/poster.png"),
  deck: asset("assets/generated/products/deck.png"),
  plush: asset("assets/generated/products/plush.png"),
  keyring: asset("assets/generated/products/keyring.png"),
  book: asset("assets/generated/products/book.png"),
  pin: asset("assets/generated/products/pin.png")
};

// 憑依後に遷移する外部「探索アプリ」のURL。差し替えるならここを変更。
const EXPLORE_URL =
  "https://appbuilder.remolink.com/titles/01GE42X26S240JHM74R0Q3QE2S/apps/01KS7ZAPQM3H86D1C999A36WB0/builder?page=webUI&pageId=4686dc3a-6d9c-4ce7-9948-0351ce467a76&viewId=1738e0f5-d0a8-4886-9dca-5f9b7831abda&webUiTab=views";

const copy = {
  ja: {
    langToggle: "English",
    title: "Re Discovery Mall",
    subtitle: "地図から実店舗を選び、商品を見て、ロボットに憑依して棚まで歩く。",
    stores: "登録店舗",
    openStore: "店舗の商品を見る",
    backMap: "地図へ戻る",
    products: "商品",
    recommended: "おすすめ",
    limited: "限定",
    popular: "人気商品",
    request: "購入リクエスト",
    requestEmpty: "購入リクエストはまだありません。",
    possess: "憑依して入店",
    possessionTitle: "ロボット憑依",
    price: "1,500円 / 10分",
    freeTitle: "条件達成で無料",
    free1: "限定商品を2点スキャン",
    free2: "別プレイヤーと同じ棚を発見",
    free3: "店舗ミッションを1つ達成",
    merits: "憑依メリット",
    merit1: "ECには出ていない限定棚に出会える",
    merit2: "他プレイヤーの探索ログが見える",
    merit3: "スタッフ確認型の購入リクエストが送れる",
    sync: "意識転送中",
    hp: "HP",
    stable: "SYNC安定",
    danger: "帰還推奨",
    scan: "棚QRをスキャン",
    scanned: "AR情報表示中",
    move: "前進",
    back: "後退",
    turnLeft: "左へ45度",
    turnRight: "右へ45度",
    exit: "探索終了",
    floor: "店内MAP",
    shelf: "棚",
    stock: "在庫",
    hpGain: "HP回復",
    cart: "カート",
    players: "別プレイヤー",
    tone: "トンマナ",
    missionEnd: "HPがゼロになったため、店舗探索を終了しました。",
    freeAchieved: "無料条件に近づきました",
    popupA: "別プレイヤーが奥棚を探索中",
    popupB: "限定棚のQR反応あり",
    popupC: "10分以内の発見で憑依無料チャンス",
    popupD: "スタッフ確認リクエスト受付中",
    cartTitle: "カート",
    cartEmpty: "カートは空です。商品を追加してください。",
    cartTotal: "合計",
    cartCheckout: "購入を確定する",
    cartCheckoutDone: "ご注文ありがとうございます！スタッフが確認します。",
    cartRemove: "削除",
    cartItems: "点",
    cartClose: "閉じる",
    addToCart: "カートに追加",
    expFeatures: "体験機能",
    featActive: "提供中",
    comingSoon: "準備中",
    hwUnavailable: "ハード連携が必要なため現在未提供",
    warpTo: "ワープで隣接店舗ツインへ",
    openWorldOn: "オープンワールド接続中"
  },
  en: {
    langToggle: "日本語",
    title: "Re Discovery Mall",
    subtitle: "Pick a real store from the map, browse items, possess a robot, and walk to the shelf.",
    stores: "Registered stores",
    openStore: "Browse this store",
    backMap: "Back to map",
    products: "Products",
    recommended: "Recommended",
    limited: "Limited",
    popular: "Popular",
    request: "Purchase request",
    requestEmpty: "No purchase requests yet.",
    possess: "Possess and enter",
    possessionTitle: "Robot possession",
    price: "¥1,500 / 10 min",
    freeTitle: "Free when conditions are met",
    free1: "Scan two limited items",
    free2: "Find the same shelf as another player",
    free3: "Clear one store mission",
    merits: "Why possess?",
    merit1: "Find hidden shelves not shown in normal EC",
    merit2: "See exploration traces from other players",
    merit3: "Send staff-confirmed purchase requests",
    sync: "Transferring consciousness",
    hp: "HP",
    stable: "SYNC stable",
    danger: "Return recommended",
    scan: "Scan shelf QR",
    scanned: "AR overlay active",
    move: "Move forward",
    back: "Step back",
    turnLeft: "Turn 45 deg left",
    turnRight: "Turn 45 deg right",
    exit: "Exit",
    floor: "Floor map",
    shelf: "Shelf",
    stock: "Stock",
    hpGain: "HP gain",
    cart: "Cart",
    players: "Other players",
    tone: "Tone",
    missionEnd: "HP reached zero, so the store exploration ended.",
    freeAchieved: "You are closer to a free possession",
    popupA: "Another player is exploring the back shelf",
    popupB: "Limited shelf QR signal detected",
    popupC: "Find within 10 minutes for a free chance",
    popupD: "Staff-confirm request is open",
    cartTitle: "Cart",
    cartEmpty: "Your cart is empty. Add some items.",
    cartTotal: "Total",
    cartCheckout: "Confirm purchase",
    cartCheckoutDone: "Thanks for your order! Staff will confirm it.",
    cartRemove: "Remove",
    cartItems: "items",
    cartClose: "Close",
    addToCart: "Add to cart",
    expFeatures: "Experience features",
    featActive: "Active",
    comingSoon: "Coming Soon",
    hwUnavailable: "Not available yet — requires hardware integration",
    warpTo: "Warp to a connected store twin",
    openWorldOn: "Open-world linked"
  }
};

const tones = [
  { id: "game", ja: "ゲーム", en: "Game" },
  { id: "pink", ja: "ピンクやわらか", en: "Soft pink" },
  { id: "mint", ja: "さわやか緑", en: "Fresh green" },
  { id: "cyber", ja: "サイバー", en: "Cyber" },
  { id: "simple", ja: "シンプル", en: "Simple" },
  { id: "wonder", ja: "わくわく", en: "Wonder" },
  { id: "premium", ja: "プレミアム", en: "Premium" },
  { id: "retro", ja: "レトロ", en: "Retro" },
  { id: "night", ja: "夜市", en: "Night" },
  { id: "festival", ja: "祭り", en: "Festival" }
];

const stores = [
  ["akiba", "Akiba Hobby Terminal", "Tokyo / Akihabara", "Model kits, figures, rare cards", "Night shelf limited restock", "70%", "55%"],
  ["kyoto", "Kyoto Character Gallery", "Kyoto / Shijo", "Craft goods, acrylic stands", "Kyoto-only hologram badge", "51%", "63%"],
  ["osaka", "Nipponbashi Remote Arcade", "Osaka / Nipponbashi", "Trading cards, collectibles", "Showcase staff-confirm item", "47%", "68%"],
  ["sapporo", "Sapporo Snow Pop Base", "Hokkaido / Sapporo", "Snow festival goods", "Northern limited acrylic set", "74%", "16%"],
  ["kanazawa", "Kanazawa Craft Toy Vault", "Ishikawa / Kanazawa", "Craft toys, artisan charms", "Gold leaf capsule charm", "58%", "47%"],
  ["fukuoka", "Hakata Pop Relay", "Fukuoka / Hakata", "Local collab goods", "Kyushu player co-op shelf", "25%", "76%"],
  ["okinawa", "Naha Culture Station", "Okinawa / Naha", "Island pop souvenirs", "Tropical color badge", "16%", "88%"],
  ["nagoya", "Nagoya Mecha Market", "Aichi / Nagoya", "Robots, garage kits", "Mecha prototype corner", "56%", "61%"],
  ["sendai", "Sendai Retro Capsule", "Miyagi / Sendai", "Retro toys, capsules", "Archive capsule wall", "67%", "42%"],
  ["hiroshima", "Hiroshima Peace Hobby Port", "Hiroshima / Hondori", "Miniatures, cards", "Port-only miniature set", "37%", "70%"]
].map(([id, name, area, category, limited, left, top], index) => ({
  id,
  name: { ja: name, en: name },
  area: { ja: area, en: area },
  category: { ja: category, en: category },
  limited: { ja: limited, en: limited },
  access: `Robot ${String(index + 1).padStart(2, "0")} online`,
  pin: { left, top },
  image: index % 3 === 0 ? PANORAMA_360 : STORE_AISLE,
  hot: index === 0 || index === 3 || index === 7,
  players: 2 + (index % 5)
}));

// オープンワールド：店舗ツインをつなぐポータル（辺）のグラフ。
// 端を越えると隣接店舗のツインへワープする、という関係を表す。
const STORE_LINKS = [
  ["sapporo", "sendai"],
  ["sendai", "akiba"],
  ["akiba", "nagoya"],
  ["akiba", "kanazawa"],
  ["nagoya", "kyoto"],
  ["kanazawa", "kyoto"],
  ["kyoto", "osaka"],
  ["osaka", "hiroshima"],
  ["hiroshima", "fukuoka"],
  ["fukuoka", "okinawa"]
];
const storeById = (id) => stores.find((s) => s.id === id);
const neighborsOf = (id) =>
  STORE_LINKS.filter((pair) => pair.includes(id)).map((pair) => (pair[0] === id ? pair[1] : pair[0]));

const products = [
  ["model-kit", "Premium Model Kit RX-Loop", "7,920", "LIMITED", "A-03", 1, 28, "limited"],
  ["acrylic", "Local Acrylic Stand Set", "1,980", "RARE", "A-05", 4, 16, "recommended"],
  ["card-pack", "Archive Card Pack 1998", "4,400", "RARE", "B-02", 2, 18, "popular"],
  ["holo-badge", "Store Limited Holo Badge", "1,320", "NORMAL", "L-04", 7, 8, "limited"],
  ["soft-vinyl", "Retro Robot Soft Vinyl", "11,800", "LEGEND", "C-01", 1, 32, "popular"],
  ["charm", "Regional Capsule Charm", "880", "NORMAL", "D-08", 12, 6, "recommended"],
  ["poster", "Secret Event Poster", "2,200", "LIMITED", "P-02", 3, 20, "limited"],
  ["deck", "Starter Card Deck Neon", "3,300", "POPULAR", "B-06", 8, 10, "popular"],
  ["plush", "Tiny Mascot Plush", "1,650", "POPULAR", "K-03", 6, 10, "recommended"],
  ["keyring", "City Route Keyring", "990", "NORMAL", "S-07", 16, 5, "recommended"],
  ["book", "Design Archive Book", "5,500", "RARE", "M-01", 2, 14, "popular"],
  ["pin", "Player Discovery Pin", "1,100", "LIMITED", "Q-09", 5, 12, "limited"]
].map(([id, name, price, rarity, shelf, stock, hpGain, group]) => ({
  id,
  name: { ja: name, en: name },
  price: `¥${price}`,
  priceValue: Number(price.replace(/,/g, "")),
  rarity,
  shelf,
  stock,
  hpGain,
  group,
  image: PRODUCT_IMAGES[id] || PRODUCT_IMAGE,
  note: {
    ja: `${rarity} / ${shelf}。棚QRスキャン後、スタッフ確認型の購入リクエストを送信できます。`,
    en: `${rarity} / ${shelf}. Scan the shelf QR, then send a staff-confirmed purchase request.`
  }
}));

const nodes = [
  { id: "entrance", label: "Entrance", position: { left: "18%", top: "76%" }, products: ["model-kit", "card-pack", "charm"], next: ["main-aisle", "limited-shelf"] },
  { id: "main-aisle", label: "Main aisle", position: { left: "42%", top: "55%" }, products: ["model-kit", "acrylic", "deck", "plush"], next: ["entrance", "showcase", "limited-shelf"] },
  { id: "showcase", label: "Showcase", position: { left: "66%", top: "39%" }, products: ["soft-vinyl", "card-pack", "book"], next: ["main-aisle", "limited-shelf"] },
  { id: "limited-shelf", label: "Limited", position: { left: "80%", top: "24%" }, products: ["holo-badge", "poster", "pin", "acrylic"], next: ["main-aisle", "showcase", "checkout"] },
  { id: "checkout", label: "Checkout", position: { left: "60%", top: "78%" }, products: ["keyring", "charm", "deck"], next: ["entrance", "limited-shelf"] }
];

const headings = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];

function text(lang, key) {
  return copy[lang][key] || key;
}

function local(value, lang) {
  if (typeof value === "string") return value;
  return value?.[lang] || value?.en || value?.ja || "";
}

function productById(id) {
  return products.find((product) => product.id === id);
}

export default function RemoDiscoveryMall() {
  const [screen, setScreen] = useState("home");
  const [lang, setLang] = useState("ja");
  const [tone, setTone] = useState("game");
  const [selectedStore, setSelectedStore] = useState(stores[0]);
  const [selectedProduct, setSelectedProduct] = useState(products[0]);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [requestLog, setRequestLog] = useState([]);
  const [nodeId, setNodeId] = useState("entrance");
  const [heading, setHeading] = useState(0);
  const [hp, setHp] = useState(78);
  const [scanned, setScanned] = useState([]);
  const [missionEnd, setMissionEnd] = useState("");
  const [popups, setPopups] = useState([]);

  const node = useMemo(() => nodes.find((item) => item.id === nodeId) || nodes[0], [nodeId]);
  const shelfProducts = useMemo(() => node.products.map(productById).filter(Boolean), [node]);
  const activeProduct = selectedProduct || shelfProducts[0] || products[0];
  const limitedScans = scanned.filter((id) => productById(id)?.group === "limited").length;
  const freeProgress = Math.min(100, Math.round((limitedScans / 2) * 100));
  const cartItems = useMemo(
    () => cart.map((line) => ({ ...line, product: productById(line.id) })).filter((line) => line.product),
    [cart]
  );
  const cartCount = useMemo(() => cart.reduce((sum, line) => sum + line.qty, 0), [cart]);
  const cartTotal = useMemo(
    () => cartItems.reduce((sum, line) => sum + line.product.priceValue * line.qty, 0),
    [cartItems]
  );

  useEffect(() => {
    if (screen !== "sync") return undefined;
    // トンネル演出を見せてから外部の探索アプリへ遷移する。
    const timer = window.setTimeout(() => {
      window.location.href = EXPLORE_URL;
    }, 2200);
    return () => window.clearTimeout(timer);
  }, [screen]);

  useEffect(() => {
    if (screen === "robot" && hp <= 0) {
      setMissionEnd(text(lang, "missionEnd"));
      setScreen("store");
    }
  }, [hp, lang, screen]);

  function pushPopup(message) {
    const id = Date.now() + Math.random();
    setPopups((items) => [{ id, message }, ...items].slice(0, 5));
    window.setTimeout(() => {
      setPopups((items) => items.filter((item) => item.id !== id));
    }, 3200);
  }

  function chooseTone(nextTone) {
    setTone(nextTone);
    pushPopup(`${text(lang, "tone")}: ${tones.find((item) => item.id === nextTone)?.[lang]}`);
  }

  function openStore(store) {
    setSelectedStore(store);
    setSelectedProduct(products[0]);
    setScreen("store");
    pushPopup(`${local(store.name, lang)} / ${text(lang, "players")} ${store.players}`);
  }

  function addToCart(product, quantity = 1) {
    setCart((lines) => {
      const existing = lines.find((line) => line.id === product.id);
      if (existing) {
        return lines.map((line) => (line.id === product.id ? { ...line, qty: line.qty + quantity } : line));
      }
      return [...lines, { id: product.id, qty: quantity }];
    });
  }

  function changeQty(id, delta) {
    setCart((lines) =>
      lines
        .map((line) => (line.id === id ? { ...line, qty: line.qty + delta } : line))
        .filter((line) => line.qty > 0)
    );
  }

  function removeFromCart(id) {
    setCart((lines) => lines.filter((line) => line.id !== id));
  }

  function checkout() {
    if (cart.length === 0) return;
    setCart([]);
    setCartOpen(false);
    pushPopup(text(lang, "cartCheckoutDone"));
  }

  function requestPurchase(product) {
    setSelectedProduct(product);
    addToCart(product, 1);
    setRequestLog((items) => [`${local(product.name, lang)}: ${text(lang, "request")}`, ...items].slice(0, 4));
    pushPopup(`${text(lang, "request")}: ${local(product.name, lang)}`);
  }

  function startPossession() {
    setMissionEnd("");
    setNodeId("entrance");
    setHeading(0);
    setHp(78);
    setScanned([]);
    setSelectedProduct(products[0]);
    setScreen("sync");
  }

  function moveTo(nextId) {
    setNodeId(nextId);
    setHp((value) => Math.max(0, value - 13));
    const nextNode = nodes.find((item) => item.id === nextId);
    const firstProduct = nextNode?.products.map(productById).filter(Boolean)[0];
    if (firstProduct) setSelectedProduct(firstProduct);
    pushPopup(`HP -13 / ${nextNode?.label}`);
  }

  function rotate(delta) {
    setHeading((value) => (value + delta + headings.length) % headings.length);
  }

  function scanProduct(product) {
    setSelectedProduct(product);
    if (scanned.includes(product.id)) {
      pushPopup(text(lang, "scanned"));
      return;
    }
    setScanned((ids) => [...ids, product.id]);
    setHp((value) => Math.min(100, value + product.hpGain));
    pushPopup(`${text(lang, "hpGain")} +${product.hpGain}: ${local(product.name, lang)}`);
    if (product.group === "limited") pushPopup(text(lang, "freeAchieved"));
  }

  const shellClass = `rdmShell rdmTone-${tone}`;

  if (screen === "sync") {
    return (
      <>
        <SyncScreen lang={lang} store={selectedStore} />
        <PopupStack popups={popups} />
      </>
    );
  }

  if (screen === "robot") {
    return (
      <>
        <RobotScreen
          lang={lang}
          store={selectedStore}
          node={node}
          nodes={nodes}
          heading={heading}
          hp={hp}
          cartCount={cartCount}
          shelfProducts={shelfProducts}
          activeProduct={activeProduct}
          scanned={scanned}
          freeProgress={freeProgress}
          onRotate={rotate}
          onMove={moveTo}
          onScan={scanProduct}
          onRequest={requestPurchase}
          onExit={() => setScreen("store")}
        />
        <PopupStack popups={popups} />
      </>
    );
  }

  if (screen === "store") {
    return (
      <div className={shellClass}>
        <AppHeader lang={lang} tone={tone} cartCount={cartCount} onLang={() => setLang(lang === "ja" ? "en" : "ja")} onTone={chooseTone} onOpenCart={() => setCartOpen(true)} />
        <StoreScreen
          lang={lang}
          store={selectedStore}
          cartCount={cartCount}
          products={products}
          selectedProduct={selectedProduct}
          requestLog={requestLog}
          missionEnd={missionEnd}
          freeProgress={freeProgress}
          onBack={() => setScreen("home")}
          onProduct={(product) => {
            setSelectedProduct(product);
            pushPopup(`${local(product.name, lang)} / ${product.rarity}`);
          }}
          onRequest={requestPurchase}
          onPossess={startPossession}
        />
        <CartDrawer
          lang={lang}
          open={cartOpen}
          items={cartItems}
          total={cartTotal}
          count={cartCount}
          onClose={() => setCartOpen(false)}
          onChangeQty={changeQty}
          onRemove={removeFromCart}
          onCheckout={checkout}
        />
        <PopupStack popups={popups} />
      </div>
    );
  }

  return (
    <div className={shellClass}>
      <AppHeader lang={lang} tone={tone} cartCount={cartCount} onLang={() => setLang(lang === "ja" ? "en" : "ja")} onTone={chooseTone} />
      <HomeScreen
        lang={lang}
        stores={stores}
        selectedStore={selectedStore}
        cartCount={cartCount}
        onSelect={(store) => {
          setSelectedStore(store);
        }}
        onOpenStore={openStore}
      />
      <CartDrawer
        lang={lang}
        open={cartOpen}
        items={cartItems}
        total={cartTotal}
        count={cartCount}
        onClose={() => setCartOpen(false)}
        onChangeQty={changeQty}
        onRemove={removeFromCart}
        onCheckout={checkout}
      />
      <PopupStack popups={popups} />
    </div>
  );
}

function AppHeader({ lang, tone, cartCount, onLang, onTone, onOpenCart }) {
  return (
    <header className="rdmHeader">
      <div className="rdmBrandBlock">
        <strong>{text(lang, "title")}</strong>
        <span>Remote Japanese Store Exploration</span>
      </div>
      <div className="rdmHeaderActions">
        <a className="rdmAdminLink" href="#/admin" title="体験機能管理 (管理者)" aria-label="Admin">⚙</a>
        <button onClick={onLang}>{text(lang, "langToggle")}</button>
        <button className="rdmCartButton" onClick={onOpenCart} aria-label={text(lang, "cartTitle")}>
          <span aria-hidden="true">🛒</span>
          {text(lang, "cart")}
          {cartCount > 0 && <i className="rdmCartBadge">{cartCount}</i>}
        </button>
      </div>
      <div className="rdmToneRail" aria-label="tone selector">
        <label className="rdmToneSelect">
          <span>{text(lang, "tone")}</span>
          <select value={tone} onChange={(event) => onTone(event.target.value)}>
            {tones.map((item) => (
              <option key={item.id} value={item.id}>
                {item[lang]}
              </option>
            ))}
          </select>
        </label>
      </div>
    </header>
  );
}

function HomeScreen({ lang, stores, selectedStore, onSelect, onOpenStore }) {
  const { isFunctional } = useFeatures();
  const openWorld = isFunctional("open_world_city_theme");
  const [hoveredId, setHoveredId] = useState(null);
  const [warping, setWarping] = useState(false);
  const cardRefs = useRef({});
  const linkedId = hoveredId || selectedStore.id;
  const neighborIds = openWorld ? neighborsOf(selectedStore.id) : [];

  useEffect(() => {
    const el = cardRefs.current[selectedStore.id];
    if (el) el.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [selectedStore]);

  function warpTo(store) {
    if (warping || !store) return;
    setWarping(true);
    setHoveredId(store.id);
    window.setTimeout(() => {
      onSelect(store);
      setWarping(false);
    }, 750);
  }

  return (
    <main className="rdmHome">
      <section className="rdmHero">
        <div className="rdmHeroCopy">
          <p className="rdmEyebrow">REMOTE STORE DISCOVERY</p>
          <h1 className="rdmMegaTitle">{text(lang, "title")}</h1>
          <p>{text(lang, "subtitle")}</p>
          <div className="rdmHeroBadges">
            <span>360° ROBOT</span>
            <span>QR AR</span>
            <span>LIVE SHELF</span>
          </div>
        </div>
        <div className={"rdmMapPanel" + (openWorld ? " openWorld" : "")}>
          <img src={asset("japan-map.png")} alt="Japan map" />
          {openWorld && (
            <svg className="rdmMapEdges" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              {STORE_LINKS.map(([a, b]) => {
                const sa = storeById(a);
                const sb = storeById(b);
                if (!sa || !sb) return null;
                const active = selectedStore.id === a || selectedStore.id === b;
                return (
                  <line
                    key={a + "-" + b}
                    className={active ? "active" : ""}
                    x1={parseFloat(sa.pin.left)} y1={parseFloat(sa.pin.top)}
                    x2={parseFloat(sb.pin.left)} y2={parseFloat(sb.pin.top)}
                  />
                );
              })}
            </svg>
          )}
          {warping && <div className="rdmMapWarp" aria-hidden="true" />}
          {stores.map((store) => (
            <button
              className={
                "rdmMapPin" +
                (store.id === selectedStore.id ? " active" : "") +
                (store.id === linkedId ? " linked" : "") +
                (neighborIds.includes(store.id) ? " portal" : "")
              }
              key={store.id}
              style={store.pin}
              onClick={() => (neighborIds.includes(store.id) ? warpTo(store) : onSelect(store))}
              onMouseEnter={() => setHoveredId(store.id)}
              onMouseLeave={() => setHoveredId(null)}
              onFocus={() => setHoveredId(store.id)}
              onBlur={() => setHoveredId(null)}
              aria-label={local(store.name, lang)}
            >
              <span />
              <b className="rdmPinTip">
                {local(store.name, lang)}
                <em>{local(store.area, lang)}</em>
              </b>
            </button>
          ))}
        </div>
      </section>
      <section className="rdmStoreDock">
        <div className="rdmSelectedStore">
          <img src={selectedStore.image} alt={local(selectedStore.name, lang)} />
          <div>
            <p className="rdmEyebrow">📍 {local(selectedStore.area, lang)}</p>
            <h2>{local(selectedStore.name, lang)}</h2>
            <p>{local(selectedStore.category, lang)}</p>
            <button onClick={() => onOpenStore(selectedStore)}>{text(lang, "openStore")}</button>
          </div>
        </div>
        {openWorld && neighborIds.length > 0 && (
          <div className="rdmPortals">
            <span className="rdmEyebrow">⟿ {text(lang, "warpTo")}</span>
            <div className="rdmPortalChips">
              {neighborIds.map((nid) => {
                const s = storeById(nid);
                if (!s) return null;
                return (
                  <button key={nid} className="rdmPortalChip" onClick={() => warpTo(s)}>
                    {local(s.name, lang)}
                  </button>
                );
              })}
            </div>
          </div>
        )}
        <h3>{text(lang, "stores")} {stores.length}</h3>
        <div className="rdmStoreList">
          {stores.map((store) => (
            <button
              className={
                (store.hot ? "hot" : "") +
                (store.id === selectedStore.id ? " active" : "") +
                (store.id === linkedId ? " linked" : "")
              }
              key={store.id}
              ref={(el) => { cardRefs.current[store.id] = el; }}
              onClick={() => onSelect(store)}
              onDoubleClick={() => onOpenStore(store)}
              onMouseEnter={() => setHoveredId(store.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <img src={store.image} alt={local(store.name, lang)} />
              <i>{store.hot ? "HOT EVENT" : "LIVE"}</i>
              <strong>{local(store.name, lang)}</strong>
              <span>{local(store.area, lang)}</span>
              <small>{local(store.limited, lang)} / {text(lang, "players")} {store.players}</small>
            </button>
          ))}
        </div>
        <ExperienceFeatures lang={lang} />
      </section>
    </main>
  );
}

function ExperienceFeatures({ lang }) {
  const { userFeatures } = useFeatures();
  const { active, comingSoon } = userFeatures();
  if (active.length === 0 && comingSoon.length === 0) return null;
  return (
    <section className="rdmExpFeatures">
      <h3>{text(lang, "expFeatures")}</h3>
      <div className="rdmExpGrid">
        {active.map((f) => (
          <div className="rdmExpChip" key={f.key}>
            <strong>{local(f.userFacingLabel || f.name, lang)}</strong>
            <span>{local(f.userFacingDescription || f.description, lang)}</span>
            <i className="rdmExpState on">{text(lang, "featActive")}</i>
          </div>
        ))}
        {comingSoon.map((f) => (
          <div className="rdmExpChip soon" key={f.key}>
            <strong>{local(f.userFacingLabel || f.name, lang)}</strong>
            <span>{text(lang, "hwUnavailable")}</span>
            <i className="rdmExpState soon">{text(lang, "comingSoon")}</i>
          </div>
        ))}
      </div>
    </section>
  );
}

function StoreScreen({ lang, store, products, selectedProduct, requestLog, missionEnd, freeProgress, onBack, onProduct, onRequest, onPossess }) {
  const groups = [
    ["recommended", text(lang, "recommended")],
    ["limited", text(lang, "limited")],
    ["popular", text(lang, "popular")]
  ];

  return (
    <main className="rdmStorePage">
      <section className="rdmStoreHero">
        <button className="rdmGhostButton" onClick={onBack}>{text(lang, "backMap")}</button>
        <img src={store.image} alt={local(store.name, lang)} />
        <div>
          <p className="rdmEyebrow">{local(store.area, lang)} / {store.access}</p>
          <h1>{local(store.name, lang)}</h1>
          <p>{local(store.category, lang)}</p>
        </div>
      </section>

      <section className="rdmProductSections" aria-label={text(lang, "products")}>
        {groups.map(([group, label]) => (
          <div className="rdmProductSection" key={group}>
            <h2>{label}</h2>
            <div className="rdmProductGrid">
              {products.filter((product) => product.group === group).map((product) => (
                <button
                  className={"rdmProductCard " + (selectedProduct.id === product.id ? "active" : "")}
                  key={product.id}
                  onClick={() => onProduct(product)}
                >
                  <img src={product.image} alt={local(product.name, lang)} />
                  <span>{product.rarity}</span>
                  <strong>{local(product.name, lang)}</strong>
                  <small>{product.price} / {product.shelf}</small>
                </button>
              ))}
            </div>
          </div>
        ))}
      </section>

      <aside className="rdmStoreSide">
        {missionEnd && <p className="rdmAlert">{missionEnd}</p>}
        <div className="rdmProductFocus">
          <img src={selectedProduct.image} alt={local(selectedProduct.name, lang)} />
          <p className="rdmEyebrow">{selectedProduct.rarity} / {selectedProduct.shelf}</p>
          <h2>{local(selectedProduct.name, lang)}</h2>
          <p>{local(selectedProduct.note, lang)}</p>
          <div className="rdmPriceRow">
            <strong>{selectedProduct.price}</strong>
            <span>{text(lang, "stock")} {selectedProduct.stock}</span>
          </div>
          <button onClick={() => onRequest(selectedProduct)}>{text(lang, "request")}</button>
        </div>
        <PossessionOffer lang={lang} store={store} freeProgress={freeProgress} onPossess={onPossess} />
        <div className="rdmRequestLog">
          <strong>Request log</strong>
          {requestLog.length === 0 ? <p>{text(lang, "requestEmpty")}</p> : requestLog.map((item) => <p key={item}>{item}</p>)}
        </div>
      </aside>
    </main>
  );
}

function PossessionOffer({ lang, store, freeProgress, onPossess }) {
  const { isFunctional } = useFeatures();
  const showMission = isFunctional("mission_system");
  return (
    <div className="rdmPossessMenu">
      <p className="rdmEyebrow">{store.access}</p>
      <h2>{text(lang, "possessionTitle")}</h2>
      <div className="rdmPriceBig">{text(lang, "price")}</div>
      {showMission && (
        <>
          <div className="rdmFreeMeter">
            <span>{text(lang, "freeTitle")}</span>
            <i><b style={{ width: `${freeProgress}%` }} /></i>
          </div>
          <ul>
            <li>{text(lang, "free1")}</li>
            <li>{text(lang, "free2")}</li>
            <li>{text(lang, "free3")}</li>
          </ul>
        </>
      )}
      <h3>{text(lang, "merits")}</h3>
      <ul>
        <li>{text(lang, "merit1")}</li>
        <li>{text(lang, "merit2")}</li>
        <li>{text(lang, "merit3")}</li>
      </ul>
      <button onClick={onPossess}>{text(lang, "possess")}</button>
    </div>
  );
}

function SyncScreen({ lang, store }) {
  return (
    <div className="rdmSync">
      <img src={TRANSFER_IMAGE} alt="" />
      <div className="rdmTunnel" aria-hidden="true">
        {Array.from({ length: 9 }).map((_, i) => (
          <span key={i} style={{ "--i": i }} />
        ))}
      </div>
      <div className="rdmSpeedField" aria-hidden="true" />
      <div className="rdmWindStreaks" aria-hidden="true">
        {Array.from({ length: 22 }).map((_, i) => (
          <i key={i} style={{ "--a": `${(360 / 22) * i}deg`, "--d": `${((i % 7) * 0.09).toFixed(2)}s` }} />
        ))}
      </div>
      <div className="rdmSyncCore">
        <span>ROBOT POSSESSION</span>
        <h1>{text(lang, "sync")}</h1>
        <p>{local(store.name, lang)} / AUTH OK / 360 CAMERA / QR READY</p>
      </div>
      <div className="rdmSyncPopup">HP LINK +78</div>
      <div className="rdmSyncPopup two">OTHER PLAYERS FOUND</div>
    </div>
  );
}

function RobotScreen({ lang, store, node, nodes, heading, hp, cartCount, shelfProducts, activeProduct, scanned, freeProgress, onRotate, onMove, onScan, onRequest, onExit }) {
  const { isFunctional } = useFeatures();
  const showTwin = isFunctional("digital_twin_overlay"); // 点群ツイン＝自己位置/フロアマップ
  const showAr = isFunctional("ar_info_overlay"); // 商品AR情報の重畳
  const showMission = isFunctional("mission_system");
  const isScanned = scanned.includes(activeProduct.id);
  const backgroundPosition = `${(heading / (headings.length - 1)) * 100}% center`;

  return (
    <div className="rdmRobot">
      <div className="rdmRobotFeed360" style={{ backgroundImage: `url(${PANORAMA_360})`, backgroundPosition }} />
      <div className="rdmRobotOverlay" />
      <header className="rdmRobotTop">
        <span>REC 360</span>
        <strong>{local(store.name, lang)}</strong>
        <span>{node.label}</span>
        <span>{headings[heading]}</span>
        <span>{text(lang, "cart")} {cartCount}</span>
      </header>
      <section className="rdmHpPanel">
        <div>
          <strong>{text(lang, "hp")} {hp}</strong>
          <span>{hp <= 25 ? text(lang, "danger") : text(lang, "stable")}</span>
        </div>
        <i className="rdmHpTrack"><b style={{ width: `${hp}%` }} /></i>
      </section>
      <section className="rdmStreetView">
        <div className="rdmPanoramaHint">360° / {headings[heading]}</div>
        <div className="rdmReticle" />
        {shelfProducts.map((product, index) => (
          <button
            className={"rdmShelfItem " + (product.id === activeProduct.id ? "active" : "")}
            key={product.id}
            style={{ "--x": `${24 + index * 18}%`, "--y": `${36 + ((index + heading) % 3) * 12}%` }}
            onClick={() => onScan(product)}
          >
            <img src={product.image} alt={local(product.name, lang)} />
            <span>QR</span>
          </button>
        ))}
      </section>
      {showTwin && (
        <aside className="rdmMiniMap">
          <strong>{text(lang, "floor")}</strong>
          <div>
            {nodes.map((floorNode) => (
              <span className={floorNode.id === node.id ? "active" : ""} key={floorNode.id} style={floorNode.position}>
                {floorNode.label.slice(0, 1)}
              </span>
            ))}
          </div>
        </aside>
      )}
      <aside className="rdmArPanel">
        <p className="rdmEyebrow">{isScanned ? text(lang, "scanned") : "QR TARGET"}</p>
        <h2>{local(activeProduct.name, lang)}</h2>
        {showAr && (
          <dl>
            <div><dt>{text(lang, "shelf")}</dt><dd>{activeProduct.shelf}</dd></div>
            <div><dt>Rarity</dt><dd>{activeProduct.rarity}</dd></div>
            <div><dt>{text(lang, "hpGain")}</dt><dd>+{activeProduct.hpGain}</dd></div>
          </dl>
        )}
        {showMission && (
          <div className="rdmFreeMeter compact">
            <span>{text(lang, "freeTitle")}</span>
            <i><b style={{ width: `${freeProgress}%` }} /></i>
          </div>
        )}
        {isScanned ? (
          <button onClick={() => onRequest(activeProduct)}>{text(lang, "request")}</button>
        ) : (
          <button onClick={() => onScan(activeProduct)}>{text(lang, "scan")}</button>
        )}
      </aside>
      <nav className="rdmLookPad" aria-label="360 controls">
        <button onClick={() => onRotate(-1)}>{text(lang, "turnLeft")}</button>
        <button className="active">{headings[heading]}</button>
        <button onClick={() => onRotate(1)}>{text(lang, "turnRight")}</button>
      </nav>
      <nav className="rdmMovePad" aria-label="Move controls">
        {node.next.map((nextId) => {
          const nextNode = nodes.find((item) => item.id === nextId);
          return <button key={nextId} onClick={() => onMove(nextId)}>{nextNode?.label || nextId}<small>HP -13</small></button>;
        })}
        <button onClick={() => setTimeout(onExit, 0)}>{text(lang, "exit")}</button>
      </nav>
    </div>
  );
}

function FloatingPopups({ lang }) {
  return (
    <div className="rdmFloatingPopups">
      <span>{text(lang, "popupA")}</span>
      <span>{text(lang, "popupB")}</span>
      <span>{text(lang, "popupC")}</span>
      <span>{text(lang, "popupD")}</span>
    </div>
  );
}

function PopupStack({ popups }) {
  return (
    <div className="rdmPopupStack">
      {popups.map((item) => <div key={item.id}>{item.message}</div>)}
    </div>
  );
}

function CartDrawer({ lang, open, items, total, count, onClose, onChangeQty, onRemove, onCheckout }) {
  if (!open) return null;
  return (
    <div className="rdmCartOverlay" onClick={onClose}>
      <aside className="rdmCartDrawer" onClick={(event) => event.stopPropagation()} aria-label={text(lang, "cartTitle")}>
        <header className="rdmCartHead">
          <strong>{text(lang, "cartTitle")} <span>{count} {text(lang, "cartItems")}</span></strong>
          <button className="rdmCartClose" onClick={onClose} aria-label={text(lang, "cartClose")}>×</button>
        </header>
        {items.length === 0 ? (
          <p className="rdmCartEmpty">{text(lang, "cartEmpty")}</p>
        ) : (
          <div className="rdmCartList">
            {items.map(({ id, qty, product }) => (
              <div className="rdmCartLine" key={id}>
                <img src={product.image} alt={local(product.name, lang)} />
                <div className="rdmCartInfo">
                  <strong>{local(product.name, lang)}</strong>
                  <small>{product.rarity} / {product.shelf}</small>
                  <span className="rdmCartPrice">{product.price}</span>
                </div>
                <div className="rdmCartControls">
                  <div className="rdmQtyStepper">
                    <button onClick={() => onChangeQty(id, -1)} aria-label="-">−</button>
                    <span>{qty}</span>
                    <button onClick={() => onChangeQty(id, 1)} aria-label="+">+</button>
                  </div>
                  <button className="rdmCartRemove" onClick={() => onRemove(id)}>{text(lang, "cartRemove")}</button>
                </div>
              </div>
            ))}
          </div>
        )}
        <footer className="rdmCartFoot">
          <div className="rdmCartTotal">
            <span>{text(lang, "cartTotal")}</span>
            <strong>¥{total.toLocaleString()}</strong>
          </div>
          <button className="rdmCartCheckout" onClick={onCheckout} disabled={items.length === 0}>
            {text(lang, "cartCheckout")}
          </button>
        </footer>
      </aside>
    </div>
  );
}
