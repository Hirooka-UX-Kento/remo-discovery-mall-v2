import React, { useEffect, useState } from "react";
import "./style.css"; // admin-panel (rdm*) styles
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
      ) : (
        <GameProvider><NeoApp /></GameProvider>
      )}
    </FeatureProvider>
  );
}
