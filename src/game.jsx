import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { MISSIONS, TREASURES, RARES, productById, rankFor, local } from "./data.js";

const KEY = "rdm_game_v2";
const GameCtx = createContext(null);

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function GameProvider({ children }) {
  const saved = load();
  const [lang, setLang] = useState(saved.lang || "ja");
  const [tone, setTone] = useState(saved.tone || "cyber");
  const [xp, setXp] = useState(saved.xp || 0);
  const [cart, setCart] = useState(saved.cart || []);
  const [treasures, setTreasures] = useState(saved.treasures || []);
  const [collection, setCollection] = useState(saved.collection || []);
  const [claimed, setClaimed] = useState(saved.claimed || []);
  const [counters, setCounters] = useState(saved.counters || { scan: 0, move: 0, treasure: 0, warp: 0, request: 0 });
  const [scannedIds, setScannedIds] = useState([]);
  const [toasts, setToasts] = useState([]);
  const toastId = useRef(0);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ lang, tone, xp, cart, treasures, collection, claimed, counters }));
    } catch { /* ignore */ }
  }, [lang, tone, xp, cart, treasures, collection, claimed, counters]);

  function toast(message, kind = "info") {
    const id = ++toastId.current;
    setToasts((t) => [{ id, message, kind }, ...t].slice(0, 5));
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }

  function gainXp(amount, why) {
    if (!amount) return;
    setXp((v) => v + amount);
    if (why) toast(`+${amount} XP · ${why}`, "xp");
  }

  function bump(track, n = 1) {
    setCounters((c) => ({ ...c, [track]: (c[track] || 0) + n }));
  }

  // ----- cart -----
  const addToCart = (product, qty = 1) =>
    setCart((lines) => {
      const ex = lines.find((l) => l.id === product.id);
      return ex ? lines.map((l) => (l.id === product.id ? { ...l, qty: l.qty + qty } : l)) : [...lines, { id: product.id, qty }];
    });
  const changeQty = (id, d) => setCart((ls) => ls.map((l) => (l.id === id ? { ...l, qty: l.qty + d } : l)).filter((l) => l.qty > 0));
  const removeFromCart = (id) => setCart((ls) => ls.filter((l) => l.id !== id));
  const checkout = () => { if (cart.length) { setCart([]); toast(local({ ja: "注文を送信しました", en: "Order sent" }, lang), "ok"); } };

  // ----- exploration actions -----
  function requestPurchase(product) {
    addToCart(product, 1);
    bump("request");
    gainXp(10, local({ ja: "購入リクエスト", en: "Purchase request" }, lang));
  }
  function scan(product) {
    if (!scannedIds.includes(product.id)) {
      setScannedIds((s) => [...s, product.id]);
      bump("scan");
      gainXp(product.xp || 20, local({ ja: "QRスキャン", en: "QR scan" }, lang));
    }
  }
  function move() { bump("move"); gainXp(5); }
  function warp() { bump("warp"); gainXp(15, local({ ja: "ツイン間ワープ", en: "Twin warp" }, lang)); }
  function tryTreasure(chance = 0.34) {
    if (Math.random() > chance) return null;
    const t = TREASURES[Math.floor(Math.random() * TREASURES.length)];
    if (!treasures.includes(t.id)) setTreasures((arr) => [...arr, t.id]);
    bump("treasure");
    gainXp(t.xp, local({ ja: "宝箱発見！", en: "Treasure!" }, lang));
    return t;
  }
  // Hunt the store's exclusive rare for the Collection / 図鑑.
  // Uses a ref so rapid clicks can't double-award or duplicate.
  const collectionRef = useRef(collection);
  useEffect(() => { collectionRef.current = collection; }, [collection]);
  function huntRare(storeId) {
    const rare = RARES.find((r) => r.storeId === storeId);
    bump("treasure");
    if (rare && !collectionRef.current.includes(rare.id)) {
      collectionRef.current = [...collectionRef.current, rare.id];
      setCollection(collectionRef.current);
      gainXp(rare.xp, local({ ja: "レア発見！", en: "Rare drop!" }, lang));
      return { item: rare, isNew: true };
    }
    const t = TREASURES[Math.floor(Math.random() * TREASURES.length)];
    gainXp(t.xp, local({ ja: "お宝発見", en: "Treasure" }, lang));
    return { item: t, isNew: false };
  }
  const collectionPct = Math.round((collection.length / RARES.length) * 100);

  // ----- missions -----
  const missions = useMemo(
    () => MISSIONS.map((m) => {
      const cur = Math.min(counters[m.track] || 0, m.goal);
      return { ...m, current: cur, done: cur >= m.goal, claimed: claimed.includes(m.id) };
    }),
    [counters, claimed]
  );
  function claimMission(id) {
    const m = missions.find((x) => x.id === id);
    if (!m || !m.done || m.claimed) return;
    setClaimed((c) => [...c, id]);
    gainXp(m.xp, local({ ja: "ミッション達成", en: "Mission cleared" }, lang));
  }

  const cartCount = useMemo(() => cart.reduce((s, l) => s + l.qty, 0), [cart]);
  const cartItems = useMemo(() => cart.map((l) => ({ ...l, product: productById(l.id) })).filter((l) => l.product), [cart]);
  const cartTotal = useMemo(() => cartItems.reduce((s, l) => s + l.product.priceValue * l.qty, 0), [cartItems]);
  const rank = useMemo(() => rankFor(xp), [xp]);

  const value = {
    lang, setLang, tone, setTone,
    xp, rank, gainXp,
    cart, cartItems, cartCount, cartTotal, addToCart, changeQty, removeFromCart, checkout, requestPurchase,
    treasures, scannedIds, scan, move, warp, tryTreasure, counters,
    collection, collectionPct, huntRare,
    missions, claimMission,
    toasts, toast
  };
  return <GameCtx.Provider value={value}>{children}</GameCtx.Provider>;
}

export function useGame() {
  const ctx = useContext(GameCtx);
  if (!ctx) throw new Error("useGame must be inside <GameProvider>");
  return ctx;
}
