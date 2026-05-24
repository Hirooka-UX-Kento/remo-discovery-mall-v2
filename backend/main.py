"""
Remolink Discovery Mall — read-only API scaffold (Python / FastAPI).

This mirrors the data currently embedded in the frontend's `src/data.js`
(PRODUCTS / STORES) so the React app can fetch it over HTTP instead of using
the bundled constants. It is intentionally read-only for now; cart / save /
auth writes are a later slice.

Run locally:
    cd backend
    python -m venv .venv
    .venv\\Scripts\\activate        # Windows  (mac/Linux: source .venv/bin/activate)
    pip install -r requirements.txt
    uvicorn main:app --reload --port 8000

Then point the frontend at it:
    remo-mall/.env.local  ->  VITE_API_BASE=http://localhost:8000
    (restart `vite`)

Docs:  http://localhost:8000/docs
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Remolink Discovery Mall API", version="0.1.0")

# Browsers enforce CORS — allow the dev server and the GitHub Pages origin.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://hirooka-ux-kento.github.io",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Image paths are returned RELATIVE; the frontend prefixes them with its
# BASE_URL via asset(). Keep these in sync with src/data.js.
ZONE_AISLE = "assets/generated/zones/robot-store-aisle.png"
ZONE_PANO = "assets/generated/zones/store-panorama-360.png"

# [id, name, price, rarity, shelf, stock, xp, group]
_PRODUCTS_RAW = [
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
    ["pin", "Player Discovery Pin", "1,100", "LIMITED", "Q-09", 5, 12, "limited"],
]

# [id, name, areaJa, areaEn, catJa, catEn, limJa, limEn, x, y]
_STORES_RAW = [
    ["akiba", "Akiba Hobby Terminal", "東京 / 秋葉原", "Tokyo / Akihabara", "模型・フィギュア・レアカード", "Model kits, figures, rare cards", "夜限定の補充棚", "Night limited restock", 62, 52],
    ["kyoto", "Kyoto Character Gallery", "京都 / 四条", "Kyoto / Shijo", "工芸グッズ・アクリルスタンド", "Craft goods, acrylic stands", "京都限定ホロバッジ", "Kyoto-only holo badge", 46, 60],
    ["osaka", "Nipponbashi Remote Arcade", "大阪 / 日本橋", "Osaka / Nipponbashi", "トレカ・コレクタブル", "Trading cards, collectibles", "スタッフ確認の限定品", "Staff-confirm showcase", 43, 63],
    ["sapporo", "Sapporo Snow Pop Base", "北海道 / 札幌", "Hokkaido / Sapporo", "雪まつりグッズ", "Snow festival goods", "北限定アクリルセット", "Northern limited acrylic", 75, 23],
    ["kanazawa", "Kanazawa Craft Toy Vault", "石川 / 金沢", "Ishikawa / Kanazawa", "工芸トイ・職人チャーム", "Craft toys, artisan charms", "金箔カプセルチャーム", "Gold-leaf capsule charm", 49, 48],
    ["fukuoka", "Hakata Pop Relay", "福岡 / 博多", "Fukuoka / Hakata", "ローカルコラボグッズ", "Local collab goods", "九州プレイヤー協力棚", "Kyushu co-op shelf", 21, 71],
    ["okinawa", "Naha Culture Station", "沖縄 / 那覇", "Okinawa / Naha", "島ポップ土産", "Island pop souvenirs", "南国カラーバッジ", "Tropical color badge", 85, 81],
    ["nagoya", "Nagoya Mecha Market", "愛知 / 名古屋", "Aichi / Nagoya", "ロボ・ガレキ", "Robots, garage kits", "メカ試作コーナー", "Mecha prototype corner", 53, 58],
    ["sendai", "Sendai Retro Capsule", "宮城 / 仙台", "Miyagi / Sendai", "レトロトイ・カプセル", "Retro toys, capsules", "アーカイブカプセル壁", "Archive capsule wall", 66, 41],
    ["hiroshima", "Hiroshima Peace Hobby Port", "広島 / 本通", "Hiroshima / Hondori", "ミニチュア・カード", "Miniatures, cards", "港限定ミニチュア", "Port-only miniature", 32, 65],
]


def _build_products():
    out = []
    for pid, name, price, rarity, shelf, stock, xp, group in _PRODUCTS_RAW:
        out.append({
            "id": pid,
            "name": name,
            "price": f"¥{price}",
            "priceValue": int(price.replace(",", "")),
            "rarity": rarity,
            "shelf": shelf,
            "stock": stock,
            "xp": xp,
            "group": group,
            "image": f"assets/generated/products/{pid}.png",
            "note": {
                "ja": f"{rarity} / {shelf}。棚QRをスキャンするとスタッフ確認型の購入リクエストを送れます。",
                "en": f"{rarity} / {shelf}. Scan the shelf QR to send a staff-confirmed purchase request.",
            },
        })
    return out


def _build_stores():
    out = []
    for i, (sid, name, area_ja, area_en, cat_ja, cat_en, lim_ja, lim_en, x, y) in enumerate(_STORES_RAW):
        out.append({
            "id": sid,
            "name": name,
            "area": {"ja": area_ja, "en": area_en},
            "category": {"ja": cat_ja, "en": cat_en},
            "limited": {"ja": lim_ja, "en": lim_en},
            "access": f"ROBOT {i + 1:02d} ONLINE",
            "pin": {"left": f"{x}%", "top": f"{y}%"},
            "image": ZONE_PANO if i % 3 == 0 else ZONE_AISLE,
            "pano": ZONE_PANO,
            "hot": i in (0, 3, 7),
            "players": 2 + (i % 5),
            "twinScan": 60 + ((i * 7) % 38),
        })
    return out


PRODUCTS = _build_products()
STORES = _build_stores()


@app.get("/")
def health():
    return {"ok": True, "service": "remolink-api", "products": len(PRODUCTS), "stores": len(STORES)}


@app.get("/products")
def list_products():
    return PRODUCTS


@app.get("/products/{product_id}")
def get_product(product_id: str):
    for p in PRODUCTS:
        if p["id"] == product_id:
            return p
    raise HTTPException(status_code=404, detail="product not found")


@app.get("/stores")
def list_stores():
    return STORES


@app.get("/stores/{store_id}")
def get_store(store_id: str):
    for s in STORES:
        if s["id"] == store_id:
            return s
    raise HTTPException(status_code=404, detail="store not found")
