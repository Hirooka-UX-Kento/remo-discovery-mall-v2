// ---------------------------------------------------------------------------
// Remolink Discovery Mall — content data
// ---------------------------------------------------------------------------
const BASE = import.meta.env.BASE_URL;
export const asset = (p) => `${BASE}${p.replace(/^\//, "")}`;

const ZONE_AISLE = asset("assets/generated/zones/robot-store-aisle.png");
const ZONE_PANO = asset("assets/generated/zones/store-panorama-360.png");
export const TRANSFER_IMAGE = asset("assets/generated/possession-transfer.png");
const PRODUCT_FALLBACK = asset("assets/generated/product-premium-model-kit.png");
const PRODUCT_IMG = {
  "model-kit": "model-kit", acrylic: "acrylic", "card-pack": "card-pack", "holo-badge": "holo-badge",
  "soft-vinyl": "soft-vinyl", charm: "charm", poster: "poster", deck: "deck",
  plush: "plush", keyring: "keyring", book: "book", pin: "pin"
};
const productImage = (id) => (PRODUCT_IMG[id] ? asset(`assets/generated/products/${PRODUCT_IMG[id]}.png`) : PRODUCT_FALLBACK);

export const TONES = [
  { id: "cyber", ja: "サイバー", en: "Cyber", acc: "#19e0ff", acc2: "#ff48d0" },
  { id: "game", ja: "歓楽街ネオン", en: "Kamurocho", acc: "#ff2740", acc2: "#ffc23d" },
  { id: "night", ja: "夜市ネオン", en: "Night neon", acc: "#8b7bff", acc2: "#22d3ee" },
  { id: "pink", ja: "ピンク", en: "Pink", acc: "#ff5fb0", acc2: "#ff9ec7" },
  { id: "mint", ja: "ミント", en: "Mint", acc: "#2ff0c0", acc2: "#7df0ff" },
  { id: "premium", ja: "プレミアム", en: "Premium", acc: "#e6c061", acc2: "#b98a3a" },
  { id: "wonder", ja: "ワンダー", en: "Wonder", acc: "#ffb020", acc2: "#ff6ad5" },
  { id: "retro", ja: "レトロ", en: "Retro", acc: "#ff7a3c", acc2: "#ffd23c" },
  { id: "festival", ja: "祭り", en: "Festival", acc: "#ff3b5c", acc2: "#ffd23c" },
  { id: "simple", ja: "シンプル", en: "Simple", acc: "#cfe0f0", acc2: "#7f93ad" }
];

export const STORES = [
  ["akiba", "Akiba Hobby Terminal", "東京 / 秋葉原", "Tokyo / Akihabara", "模型・フィギュア・レアカード", "Model kits, figures, rare cards", "夜限定の補充棚", "Night limited restock", 62, 52],
  ["kyoto", "Kyoto Character Gallery", "京都 / 四条", "Kyoto / Shijo", "工芸グッズ・アクリルスタンド", "Craft goods, acrylic stands", "京都限定ホロバッジ", "Kyoto-only holo badge", 46, 60],
  ["osaka", "Nipponbashi Remote Arcade", "大阪 / 日本橋", "Osaka / Nipponbashi", "トレカ・コレクタブル", "Trading cards, collectibles", "スタッフ確認の限定品", "Staff-confirm showcase", 43, 63],
  ["sapporo", "Sapporo Snow Pop Base", "北海道 / 札幌", "Hokkaido / Sapporo", "雪まつりグッズ", "Snow festival goods", "北限定アクリルセット", "Northern limited acrylic", 75, 23],
  ["kanazawa", "Kanazawa Craft Toy Vault", "石川 / 金沢", "Ishikawa / Kanazawa", "工芸トイ・職人チャーム", "Craft toys, artisan charms", "金箔カプセルチャーム", "Gold-leaf capsule charm", 49, 48],
  ["fukuoka", "Hakata Pop Relay", "福岡 / 博多", "Fukuoka / Hakata", "ローカルコラボグッズ", "Local collab goods", "九州プレイヤー協力棚", "Kyushu co-op shelf", 21, 71],
  ["okinawa", "Naha Culture Station", "沖縄 / 那覇", "Okinawa / Naha", "島ポップ土産", "Island pop souvenirs", "南国カラーバッジ", "Tropical color badge", 85, 81],
  ["nagoya", "Nagoya Mecha Market", "愛知 / 名古屋", "Aichi / Nagoya", "ロボ・ガレキ", "Robots, garage kits", "メカ試作コーナー", "Mecha prototype corner", 53, 58],
  ["sendai", "Sendai Retro Capsule", "宮城 / 仙台", "Miyagi / Sendai", "レトロトイ・カプセル", "Retro toys, capsules", "アーカイブカプセル壁", "Archive capsule wall", 66, 41],
  ["hiroshima", "Hiroshima Peace Hobby Port", "広島 / 本通", "Hiroshima / Hondori", "ミニチュア・カード", "Miniatures, cards", "港限定ミニチュア", "Port-only miniature", 32, 65]
].map(([id, name, areaJa, areaEn, catJa, catEn, limJa, limEn, x, y], i) => ({
  id,
  name,
  area: { ja: areaJa, en: areaEn },
  category: { ja: catJa, en: catEn },
  limited: { ja: limJa, en: limEn },
  access: `ROBOT ${String(i + 1).padStart(2, "0")} ONLINE`,
  pin: { left: x + "%", top: y + "%" },
  image: i % 3 === 0 ? ZONE_PANO : ZONE_AISLE,
  pano: ZONE_PANO,
  hot: i === 0 || i === 3 || i === 7,
  players: 2 + (i % 5),
  twinScan: 60 + ((i * 7) % 38) // % completeness of the digital twin scan
}));

// Open-world: portals between store twins (cross the edge -> neighbour twin)
export const STORE_LINKS = [
  ["sapporo", "sendai"], ["sendai", "akiba"], ["akiba", "nagoya"], ["akiba", "kanazawa"],
  ["nagoya", "kyoto"], ["kanazawa", "kyoto"], ["kyoto", "osaka"], ["osaka", "hiroshima"],
  ["hiroshima", "fukuoka"], ["fukuoka", "okinawa"]
];
export const storeById = (id) => STORES.find((s) => s.id === id);
export const neighborsOf = (id) =>
  STORE_LINKS.filter((p) => p.includes(id)).map((p) => (p[0] === id ? p[1] : p[0]));

export const PRODUCTS = [
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
  id, name, price: `¥${price}`, priceValue: Number(price.replace(/,/g, "")),
  rarity, shelf, stock, xp: hpGain, group, image: productImage(id),
  note: {
    ja: `${rarity} / ${shelf}。棚QRをスキャンするとスタッフ確認型の購入リクエストを送れます。`,
    en: `${rarity} / ${shelf}. Scan the shelf QR to send a staff-confirmed purchase request.`
  }
}));
export const productById = (id) => PRODUCTS.find((p) => p.id === id);

// Collectible store-exclusive rares ("ご当地レア") — the Collection / 図鑑.
const RARE_DEFS = [
  ["akiba", "RX-Loop 試作ヘッド", "RX-Loop prototype head", "LEGEND", 200],
  ["sendai", "'88 アーカイブ缶バッジ", "'88 archive can-badge", "RARE", 90],
  ["sapporo", "雪結晶アクリル", "Snow-crystal acrylic", "LIMITED", 120],
  ["kanazawa", "金沢カプセル・金", "Kanazawa gold capsule", "LEGEND", 200],
  ["nagoya", "メカ試作コア", "Mecha prototype core", "LEGEND", 200],
  ["kyoto", "金箔ホロバッジ", "Gold-leaf holo badge", "RARE", 90],
  ["osaka", "難波ショーケース原型", "Namba showcase proto", "RARE", 90],
  ["hiroshima", "港限定ミニチュア", "Port-only miniature", "LIMITED", 120],
  ["fukuoka", "博多協力ピン", "Hakata co-op pin", "LIMITED", 120],
  ["okinawa", "南国ホロシーサー", "Tropical holo shisa", "RARE", 90]
];
export const RARES = RARE_DEFS.map(([storeId, ja, en, rarity, xp], i) => ({
  id: "rare_" + storeId, storeId, rarity, xp,
  name: { ja, en }, image: PRODUCTS[i % PRODUCTS.length].image
}));
export const rareByStore = (storeId) => RARES.find((r) => r.storeId === storeId);

// Each node = a "viewpoint" (street-view style). `view` = image + base crop + zoom,
// so stepping forward switches to a visibly different scene. Swap `img` for real
// per-viewpoint photos/generated images later — the structure is ready.
export const NODES = [
  { id: "entrance", label: { ja: "入口", en: "Entrance" }, pos: { left: "18%", top: "74%" }, products: ["model-kit", "card-pack", "charm"], next: ["main", "limited"], view: { img: ZONE_PANO, x: 8, z: 145 } },
  { id: "main", label: { ja: "メイン通路", en: "Main aisle" }, pos: { left: "42%", top: "54%" }, products: ["model-kit", "acrylic", "deck", "plush"], next: ["entrance", "showcase", "limited"], view: { img: ZONE_AISLE, x: 35, z: 160 } },
  { id: "showcase", label: { ja: "ショーケース", en: "Showcase" }, pos: { left: "66%", top: "38%" }, products: ["soft-vinyl", "card-pack", "book"], next: ["main", "limited"], view: { img: ZONE_PANO, x: 60, z: 175 } },
  { id: "limited", label: { ja: "限定棚", en: "Limited" }, pos: { left: "80%", top: "22%" }, products: ["holo-badge", "poster", "pin", "acrylic"], next: ["main", "showcase", "checkout"], view: { img: ZONE_AISLE, x: 80, z: 165 } },
  { id: "checkout", label: { ja: "レジ", en: "Checkout" }, pos: { left: "60%", top: "78%" }, products: ["keyring", "charm", "deck"], next: ["entrance", "limited"], view: { img: ZONE_PANO, x: 42, z: 150 } }
];
export const nodeById = (id) => NODES.find((n) => n.id === id) || NODES[0];
export const HEADINGS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];

// XP / rank progression
export const RANKS = [
  { name: "ROOKIE", min: 0 },
  { name: "SCOUT", min: 150 },
  { name: "EXPLORER", min: 400 },
  { name: "HUNTER", min: 800 },
  { name: "MASTER", min: 1400 },
  { name: "LEGEND", min: 2400 }
];
export function rankFor(xp) {
  let r = RANKS[0], next = null;
  for (let i = 0; i < RANKS.length; i++) {
    if (xp >= RANKS[i].min) { r = RANKS[i]; next = RANKS[i + 1] || null; }
  }
  const floor = r.min;
  const ceil = next ? next.min : r.min + 600;
  const pct = Math.min(100, Math.round(((xp - floor) / (ceil - floor)) * 100));
  return { rank: r, next, pct, toNext: next ? next.min - xp : 0 };
}

// Missions (mission_system). track keys: scan / move / treasure / warp / request
export const MISSIONS = [
  { id: "m_scan3", type: "daily", track: "scan", goal: 3, xp: 60, title: { ja: "棚QRを3つスキャン", en: "Scan 3 shelf QRs" } },
  { id: "m_move5", type: "daily", track: "move", goal: 5, xp: 50, title: { ja: "店内を5回移動", en: "Move 5 times in store" } },
  { id: "m_treasure", type: "weekly", track: "treasure", goal: 1, xp: 120, title: { ja: "隠し宝箱を発見", en: "Find a hidden treasure" } },
  { id: "m_warp", type: "event", track: "warp", goal: 2, xp: 90, title: { ja: "別店舗ツインへ2回ワープ", en: "Warp to 2 store twins" } },
  { id: "m_request", type: "weekly", track: "request", goal: 1, xp: 70, title: { ja: "購入リクエストを送る", en: "Send a purchase request" } }
];

export const TREASURES = [
  { id: "t1", rarity: "RARE", xp: 80, name: { ja: "隠しホロカード", en: "Hidden holo card" } },
  { id: "t2", rarity: "LEGEND", xp: 200, name: { ja: "試作メカコア", en: "Prototype mecha core" } },
  { id: "t3", rarity: "NORMAL", xp: 40, name: { ja: "ご当地カプセル", en: "Local capsule" } },
  { id: "t4", rarity: "LIMITED", xp: 120, name: { ja: "夜市限定ピン", en: "Night-market pin" } }
];

// Mock leaderboard (ranking_system) — player is inserted by XP.
export const LEADERBOARD = [
  { name: "NOVA_77", xp: 2210 }, { name: "pixel_ria", xp: 1640 }, { name: "kuro.exe", xp: 1180 },
  { name: "AKIBA_DOLL", xp: 920 }, { name: "ginga", xp: 540 }, { name: "muu", xp: 300 }, { name: "tako8", xp: 120 }
];

// Sugoroku board tiles (sugoroku_warp_exploration). kind: start/item/event/xp/warp/goal
export const SUGOROKU = [
  { kind: "start", label: { ja: "スタート", en: "Start" } },
  { kind: "xp", value: 40, label: { ja: "XP +40", en: "XP +40" } },
  { kind: "item", label: { ja: "アイテム発見", en: "Item" } },
  { kind: "event", label: { ja: "イベント", en: "Event" } },
  { kind: "warp", label: { ja: "ワープ", en: "Warp" } },
  { kind: "xp", value: 60, label: { ja: "XP +60", en: "XP +60" } },
  { kind: "item", label: { ja: "宝箱", en: "Treasure" } },
  { kind: "event", label: { ja: "他プレイヤー", en: "Other player" } },
  { kind: "xp", value: 80, label: { ja: "XP +80", en: "XP +80" } },
  { kind: "goal", label: { ja: "ゴール", en: "Goal" } }
];

export const EXPLORE_URL =
  "https://appbuilder.remolink.com/titles/01GE42X26S240JHM74R0Q3QE2S/apps/01KS7ZAPQM3H86D1C999A36WB0/builder?page=webUI&pageId=4686dc3a-6d9c-4ce7-9948-0351ce467a76&viewId=1738e0f5-d0a8-4886-9dca-5f9b7831abda&webUiTab=views";

export function local(value, lang) {
  if (value == null) return "";
  if (typeof value === "string") return value;
  return value[lang] || value.en || value.ja || "";
}
