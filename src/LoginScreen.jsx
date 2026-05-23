import React, { useState } from "react";

// Demo credentials (as requested).
const DEMO_ID = "remolink discovery";
const DEMO_PASS = "remolink discovery";
export const AUTH_KEY = "rdm_auth_v1";

function savedTone() {
  try {
    const raw = localStorage.getItem("rdm_game_v2");
    const tone = raw ? JSON.parse(raw).tone : null;
    return tone || "cyber";
  } catch {
    return "cyber";
  }
}
function savedLang() {
  try {
    const raw = localStorage.getItem("rdm_game_v2");
    return (raw && JSON.parse(raw).lang) || "ja";
  } catch {
    return "ja";
  }
}

const TERMS = {
  ja: {
    title: "利用規約・プライバシーポリシー",
    body: [
      ["第1条（サービス内容）", "Remolink Discovery Mall（以下「本サービス」）は、遠隔地の店舗ロボットを操作してアニメグッズ店舗を探索・購入できるリモート体験型ECサービスです。"],
      ["第2条（アカウント）", "ユーザーはIDおよびパスワードを自己の責任で管理するものとします。本デモ環境では検証用の共通アカウントを使用します。"],
      ["第3条（禁止事項）", "法令違反、第三者への迷惑行為、ロボット・店舗設備への不正操作等を禁止します。"],
      ["第4条（課金・ポイント）", "無料体験で獲得したEXP／ポイントは、有料体験の割引や引き継ぎに充当される場合があります。"],
      ["第5条（プライバシー）", "取得した情報はサービス提供・改善の目的でのみ利用し、法令に基づく場合を除き第三者へ提供しません。"],
      ["第6条（免責）", "本デモは体験用であり、実在の在庫・価格・店舗運用を保証するものではありません。"]
    ],
    close: "閉じる"
  },
  en: {
    title: "Terms of Service & Privacy Policy",
    body: [
      ["1. Service", "Remolink Discovery Mall is a remote-experience EC service: pilot in-store robots to explore and shop at anime-goods stores from afar."],
      ["2. Account", "You are responsible for managing your ID and password. This demo uses a shared verification account."],
      ["3. Prohibited", "No illegal use, harassment, or unauthorized control of robots / store equipment."],
      ["4. Points", "EXP / points earned in the free trial may be applied to paid-experience discounts or carry-over."],
      ["5. Privacy", "Collected data is used only to provide and improve the service, and is not shared except as required by law."],
      ["6. Disclaimer", "This is a demo; stock, prices, and store operations are not guaranteed."]
    ],
    close: "Close"
  }
};

export default function LoginScreen({ onAuthed }) {
  const [lang, setLang] = useState(savedLang());
  const [id, setId] = useState("");
  const [pass, setPass] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const [showTerms, setShowTerms] = useState(false);
  const L = (ja, en) => (lang === "ja" ? ja : en);
  const tone = savedTone();
  const tm = TERMS[lang];

  function submit(e) {
    e.preventDefault();
    if (!agree) { setError(L("利用規約への同意が必要です。", "Please agree to the Terms first.")); return; }
    if (id.trim().toLowerCase() !== DEMO_ID || pass !== DEMO_PASS) {
      setError(L("IDまたはパスワードが正しくありません。", "Incorrect ID or password."));
      return;
    }
    try { sessionStorage.setItem(AUTH_KEY, "1"); } catch { /* ignore */ }
    onAuthed();
  }

  function fillDemo() { setId(DEMO_ID); setPass(DEMO_PASS); setError(""); }

  return (
    <div className={`neo tone-${tone} loginScreen`}>
      <button className="loginLang" onClick={() => setLang((l) => (l === "ja" ? "en" : "ja"))}>
        {lang === "ja" ? "EN" : "日本語"}
      </button>

      <div className="loginWrap">
        <div className="loginBrand">
          <p className="lead">REMOLINK</p>
          <h1 className="main">DISCOVERY<br />MALL</h1>
          <p className="loginTagline">
            {L(
              "自宅から全国のアニメグッズ店舗のロボットに“憑依”して探索・買い物できる、新感覚のリモートEC。",
              "A new kind of remote EC — DIVE into store robots nationwide and explore & shop from home."
            )}
            <br />
            {L(
              "全店舗が地続きにつながる“世界一でかい店”を巡り、レアを集めるハンター体験を。",
              "Roam one giant connected store, hunt rares, and level up as a discovery hunter."
            )}
          </p>
        </div>

        <form className="loginCard neoPanel" onSubmit={submit}>
          <p className="eyebrow">{L("ログイン", "Sign in")}</p>

          <label className="loginField">
            <span>{L("ID", "ID")}</span>
            <input
              type="text" autoComplete="username" value={id}
              onChange={(e) => { setId(e.target.value); setError(""); }}
              placeholder="remolink discovery"
            />
          </label>

          <label className="loginField">
            <span>{L("パスワード", "Password")}</span>
            <input
              type="password" autoComplete="current-password" value={pass}
              onChange={(e) => { setPass(e.target.value); setError(""); }}
              placeholder="••••••••"
            />
          </label>

          <label className="loginAgree">
            <input type="checkbox" checked={agree} onChange={(e) => { setAgree(e.target.checked); setError(""); }} />
            <span>
              <button type="button" className="loginLink" onClick={() => setShowTerms(true)}>
                {L("利用規約・プライバシーポリシー", "Terms & Privacy")}
              </button>
              {L(" に同意します", " — I agree")}
            </span>
          </label>

          {error && <p className="loginError">⚠ {error}</p>}

          <button type="submit" className="neoBtn solid block">
            ⚡ {L("ログインして体験を始める", "Sign in & start")}
          </button>

          <button type="button" className="loginDemo" onClick={fillDemo}>
            {L("デモ用ID/PASSを入力", "Fill demo ID / PASS")}
          </button>
          <p className="loginHint">
            {L("デモ: ID・PASS とも ", "Demo: ID & PASS are both ")}
            <code>remolink discovery</code>
          </p>
        </form>
      </div>

      {showTerms && (
        <div className="neoModalOv" onClick={() => setShowTerms(false)}>
          <div className="neoTut loginTerms" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setShowTerms(false)}>×</button>
            <h2>{tm.title}</h2>
            <div className="loginTermsBody">
              {tm.body.map(([h, b]) => (
                <div key={h} className="loginClause">
                  <b>{h}</b>
                  <p>{b}</p>
                </div>
              ))}
            </div>
            <button className="neoBtn solid block" onClick={() => { setAgree(true); setShowTerms(false); }}>
              {L("同意して閉じる", "Agree & close")}
            </button>
            <button className="neoBtn block" onClick={() => setShowTerms(false)}>{tm.close}</button>
          </div>
        </div>
      )}
    </div>
  );
}
