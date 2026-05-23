import React, { useEffect, useState } from "react";
import "./style.css"; // admin-panel (rdm*) styles
import AdminPanel from "./components/AdminPanel.jsx";
import NeoApp from "./NeoApp.jsx";
import LoginScreen, { AUTH_KEY } from "./LoginScreen.jsx";
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
  const [authed, setAuthed] = useState(() => {
    try { return sessionStorage.getItem(AUTH_KEY) === "1"; } catch { return false; }
  });
  useEffect(() => {
    if (route !== "admin") {
      try { sessionStorage.setItem("rdm_last_app", route); } catch { /* ignore */ }
    }
  }, [route]);

  // Admin panel stays reachable for internal management; the user app sits behind login.
  if (route === "admin") {
    return (
      <FeatureProvider>
        <AdminPanel />
      </FeatureProvider>
    );
  }

  if (!authed) {
    return <LoginScreen onAuthed={() => setAuthed(true)} />;
  }

  return (
    <FeatureProvider>
      <GameProvider><NeoApp /></GameProvider>
    </FeatureProvider>
  );
}
