// Feature flag definitions for the "体験機能管理 / Experience feature management" admin screen.
// Extensible: add a new entry to FEATURE_SEED and it shows up in the admin panel automatically.

/**
 * @typedef {"available"|"not_implemented"|"hardware_required"|"coming_soon"} FeatureStatus
 * @typedef {"MVP"|"Phase2"|"Future"} FeaturePriority
 * @typedef {(
 *   "初回体験・オンボーディング"|"遠隔操作・制御UX"|"探索UX・没入体験"|
 *   "ゲーム化・継続利用"|"ソーシャル・コミュニティ"|"世界観・コンテンツ演出"|
 *   "ハードウェア・デバイス連携"
 * )} FeatureCategory
 * @typedef {{
 *   id: string, key: string, name: string, category: FeatureCategory, description: string,
 *   status: FeatureStatus, priority: FeaturePriority, enabled: boolean, requiresHardware: boolean,
 *   adminNote?: string, userFacingLabel?: string, userFacingDescription?: string,
 *   dependencies?: string[], createdAt: string, updatedAt: string
 * }} FeatureFlag
 */

export const CATEGORIES = [
  "初回体験・オンボーディング",
  "遠隔操作・制御UX",
  "探索UX・没入体験",
  "ゲーム化・継続利用",
  "ソーシャル・コミュニティ",
  "世界観・コンテンツ演出",
  "ハードウェア・デバイス連携"
];

export const STATUS_META = {
  available: { label: "実装可能", labelEn: "Available", cls: "ok" },
  coming_soon: { label: "準備中", labelEn: "Coming soon", cls: "soon" },
  hardware_required: { label: "ハード連携必要", labelEn: "Hardware required", cls: "hw" },
  not_implemented: { label: "未実装", labelEn: "Not implemented", cls: "todo" }
};

export const PRIORITY_META = {
  MVP: { label: "MVP", cls: "mvp" },
  Phase2: { label: "Phase2", cls: "p2" },
  Future: { label: "将来検証", cls: "future" }
};

const SEED_AT = "2026-05-22T00:00:00.000Z";

// [key, name, category, description, status, priority, enabled, extra?]
const RAW = [
  // 1. 初回体験・オンボーディング
  ["free_trial_area", "無料体験コーナー", 0, "初回ユーザーが無料で遠隔操作を体験できる機能", "available", "MVP", true],
  ["mascot_guide", "マスコット案内", 0, "マスコットキャラクターが操作説明、サービス紹介、ミッション案内を行う機能", "available", "Phase2", false, { dependencies: ["mascot_character"] }],

  // 2. 遠隔操作・制御UX
  ["save_point", "セーブポイント", 1, "探索中の地点を保存し、次回そこから再開できる機能", "available", "Phase2", false],
  ["remote_command", "遠隔指令", 1, "「あの棚に行く」「次のポイントへ移動」など大まかな指令で操作できる機能", "available", "MVP", true],
  ["multi_user_control", "複数人連携操作", 1, "移動、カメラ、マップ確認、ギミック操作などを複数人で分担する機能", "available", "Phase2", false],
  ["sugoroku_warp_exploration", "すごろく型ワープ探索", 1, "店舗ツインのネットワークをすごろく盤のように進み、マス（店舗ノード）ごとにイベントや報酬・ワープが発生するボードゲーム型探索機能", "available", "MVP", true, { dependencies: ["sugoroku_world_theme", "digital_twin_overlay"], adminNote: "No22。ボードゲーム型・ゲーム進行感。離散ノード移動。No25とは別機能として管理する" }],
  ["anime_goods_open_world", "世界一大きなアニメグッズ店・オープンワールド", 1, "複数店舗のデジタルツインを地続きの巨大なアニメグッズ都市として自由探索し、店舗の端（ポータル）を越えると隣接店舗のツインへ移動できるオープンワールド型機能", "available", "MVP", true, { dependencies: ["open_world_city_theme", "digital_twin_overlay"], adminNote: "No25。街歩き型・連続探索・巨大世界の没入感。No22とは別機能として管理する" }],

  // 3. 探索UX・没入体験
  ["contextual_bgm", "場面別BGM", 2, "エリア、状況、イベントに応じてBGMを切り替える機能", "available", "Phase2", false],
  ["digital_twin_overlay", "デジタルツイン（点群3D）", 2, "店舗内装をスキャンした3D点群（デジタルツイン）を重畳し、その空間内で自分（ロボット）の現在地を表示する機能。すごろく/オープンワールドの探索基盤になる", "available", "MVP", true],
  ["ar_info_overlay", "AR情報重畳", 2, "現地映像やデジタルツインに、在庫情報・商品情報・人気ポイントなどのAR情報を重ねて表示する機能", "available", "MVP", true],
  ["time_travel_view", "タイムトラベル演出", 2, "ライブ映像から過去の記録、未来演出、仮想空間表現へ切り替える機能", "available", "Phase2", false],

  // 4. ゲーム化・継続利用
  ["user_rank_system", "ランク制度", 3, "利用回数、探索時間、ミッション達成などに応じてユーザーランクが上がる機能", "available", "Phase2", false],
  ["custom_theme", "カスタムテーマ", 3, "ユーザーがUIテーマや見た目を変更できる機能。ランク報酬やイベント報酬と連動可能", "available", "Phase2", false],
  ["ranking_system", "ランキング要素", 3, "探索距離、発見数、ミッション達成数などをランキング表示する機能", "available", "Phase2", false],
  ["puzzle_quest", "謎解き要素", 3, "現地映像やAR情報と連動した謎解き・クイズ機能", "available", "Phase2", false],
  ["mission_system", "ミッション要素", 3, "デイリー、ウィークリー、イベントミッションを提示し、達成報酬を付与する機能", "available", "MVP", true],
  ["treasure_random_event", "宝探し・奇跡要素", 3, "探索中にランダムで宝箱、レアアイテム、隠し演出が発生する機能", "available", "Phase2", false, { dependencies: ["mission_system"] }],
  ["challenge_bubble_mode", "バブル要素", 3, "制約つき操作や条件付き探索によって、遠隔操作そのものをゲーム化する機能", "available", "Phase2", false, { dependencies: ["remote_command"] }],

  // 5. ソーシャル・コミュニティ
  ["player_interaction", "他プレイヤー干渉", 4, "他ユーザーの行動が自分の探索体験に間接的に影響する機能", "available", "Phase2", false],
  ["life_share", "ライフ共有", 4, "フレンドやチーム内でライフ、ポイント、探索チケット、応援アイテムを共有する機能", "available", "Phase2", false],

  // 6. 世界観・コンテンツ演出
  ["mascot_character", "マスコットキャラクター", 5, "サービス紹介、操作説明、おすすめスポット案内を行うキャラクター機能", "available", "Phase2", false],
  ["sugoroku_world_theme", "すごろく世界観", 5, "ツイン・ネットワークを離散的に見せる、マス目・サイコロ・イベントカード・ワープマスのボードゲーム風UI/世界観", "available", "MVP", true],
  ["open_world_city_theme", "オープンワールド都市世界観", 5, "複数店舗のツインを連続した巨大都市として見せる街マップ。店舗ノードをポータル（辺）でつなぎ、端を越えると隣接店舗ツインへ移動するワープゲート演出", "available", "MVP", true],

  // 7. ハードウェア・デバイス連携 (項目のみ・実機連携なし)
  ["immersive_display_hmd", "没入型ディスプレイ / HMD対応", 6, "HMDや大画面表示に対応し、現地にいるような没入型ビューを提供する機能", "hardware_required", "Future", false, { requiresHardware: true, adminNote: "現時点では項目のみ。HMD連携、表示遅延、酔い対策の検証が必要" }],
  ["camera_unit_modular", "カメラユニット式", 6, "カメラ機能を共通コア化し、複数の移動体や筐体に載せ替えられるようにする構想", "hardware_required", "Future", false, { requiresHardware: true, adminNote: "現時点では項目のみ。実機設計と機体管理APIの検討が必要" }],
  ["haptics_feedback", "ハプティクス", 6, "振動、接触感、環境フィードバックによって遠隔探索の臨場感を高める機能", "hardware_required", "Future", false, { requiresHardware: true, adminNote: "現時点では項目のみ。対応デバイスや振動APIの検証が必要" }],
  ["force_feedback_remote", "遠隔力覚フィードバック", 6, "握手、ハイタッチ、応援などを遠隔地と物理的に共有する機能", "hardware_required", "Future", false, { requiresHardware: true, adminNote: "現時点では項目のみ。専用デバイスや安全制御の検証が必要" }],
  ["hardware_key_auth", "ハードウェアキー", 6, "USB、NFC、物理キー、キーホルダー型アイテムによって特別体験やログインを解放する機能", "hardware_required", "Future", false, { requiresHardware: true, adminNote: "現時点では項目のみ。NFC、USB、物理グッズ運用の検討が必要" }],
  ["toio_mini_goods_hunt", "TOIOミニチュアグッズハント", 6, "待機時間中に小型ロボットやミニ盤面を使ってグッズ収集を楽しむ機能", "hardware_required", "Future", false, { requiresHardware: true, adminNote: "現時点では項目のみ。TOIO実機連携は未実装。まずは疑似ミニゲーム化も検討可能" }]
];

/** @type {FeatureFlag[]} */
export const FEATURE_SEED = RAW.map(([key, name, catIndex, description, status, priority, enabled, extra = {}]) => ({
  id: key,
  key,
  name,
  category: CATEGORIES[catIndex],
  description,
  status,
  priority,
  enabled,
  requiresHardware: extra.requiresHardware ?? status === "hardware_required",
  adminNote: extra.adminNote,
  userFacingLabel: extra.userFacingLabel ?? name,
  userFacingDescription: extra.userFacingDescription ?? description,
  dependencies: extra.dependencies ?? [],
  createdAt: SEED_AT,
  updatedAt: SEED_AT
}));
