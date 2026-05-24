// Frontend data-access layer.
//
// When VITE_API_BASE is set (e.g. a Python/FastAPI backend), products & stores
// are fetched over HTTP. When it is empty (default — including GitHub Pages),
// the app falls back to the bundled constants in data.js, so the live site
// keeps working with no backend. This is the seam for the gradual "move data
// I/O to Python" migration.
import { PRODUCTS, STORES, asset } from "./data.js";

const BASE = import.meta.env.VITE_API_BASE || "";
export const apiEnabled = !!BASE;

// API returns RELATIVE image paths; prefix them the same way data.js does.
function withImages(o) {
  const next = { ...o };
  if (typeof o.image === "string") next.image = asset(o.image);
  if (typeof o.pano === "string") next.pano = asset(o.pano);
  return next;
}

async function fetchJSON(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`${path} -> ${res.status}`);
  return res.json();
}

export async function getProducts() {
  if (!BASE) return PRODUCTS;
  try {
    const list = await fetchJSON("/products");
    return Array.isArray(list) ? list.map(withImages) : PRODUCTS;
  } catch (e) {
    console.warn("[api] /products failed, using local data:", e);
    return PRODUCTS;
  }
}

export async function getStores() {
  if (!BASE) return STORES;
  try {
    const list = await fetchJSON("/stores");
    return Array.isArray(list) ? list.map(withImages) : STORES;
  } catch (e) {
    console.warn("[api] /stores failed, using local data:", e);
    return STORES;
  }
}
