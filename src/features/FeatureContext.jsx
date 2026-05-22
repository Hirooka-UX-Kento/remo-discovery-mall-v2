import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { FEATURE_SEED } from "./featureData.js";

const STORAGE_KEY = "rdm_feature_flags_v1";

const FeatureContext = createContext(null);

function loadOverrides() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function mergeSeed(overrides) {
  return FEATURE_SEED.map((f) => {
    const o = overrides[f.key];
    if (!o) return f;
    return {
      ...f,
      enabled: typeof o.enabled === "boolean" ? o.enabled : f.enabled,
      updatedAt: o.updatedAt || f.updatedAt
    };
  });
}

export function FeatureProvider({ children }) {
  const [features, setFeatures] = useState(() => mergeSeed(loadOverrides()));

  // persist only the mutable bits (enabled + updatedAt) so new seed metadata always wins.
  useEffect(() => {
    const overrides = {};
    features.forEach((f) => {
      const seed = FEATURE_SEED.find((s) => s.key === f.key);
      if (seed && f.enabled !== seed.enabled) {
        overrides[f.key] = { enabled: f.enabled, updatedAt: f.updatedAt };
      }
    });
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
    } catch {
      /* ignore quota / privacy-mode errors */
    }
  }, [features]);

  const setEnabled = (key, enabled) => {
    setFeatures((list) =>
      list.map((f) => (f.key === key ? { ...f, enabled, updatedAt: new Date().toISOString() } : f))
    );
  };

  const toggle = (key) => {
    setFeatures((list) =>
      list.map((f) => (f.key === key ? { ...f, enabled: !f.enabled, updatedAt: new Date().toISOString() } : f))
    );
  };

  const resetAll = () => setFeatures(mergeSeed({}));

  const value = useMemo(() => {
    const byKey = Object.fromEntries(features.map((f) => [f.key, f]));
    const get = (key) => byKey[key];
    // Functional = actually runs in the user app (must be available + enabled).
    const isFunctional = (key) => {
      const f = byKey[key];
      return !!f && f.enabled && f.status === "available";
    };
    // Reflection rules for the user-facing app.
    const userFeatures = () => {
      const active = features.filter((f) => f.enabled && f.status === "available");
      const comingSoon = features.filter(
        (f) => f.enabled && (f.status === "hardware_required" || f.status === "coming_soon")
      );
      return { active, comingSoon };
    };
    return { features, get, isFunctional, userFeatures, setEnabled, toggle, resetAll };
  }, [features]);

  return <FeatureContext.Provider value={value}>{children}</FeatureContext.Provider>;
}

export function useFeatures() {
  const ctx = useContext(FeatureContext);
  if (!ctx) throw new Error("useFeatures must be used inside <FeatureProvider>");
  return ctx;
}
