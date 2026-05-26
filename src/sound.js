// Procedural sound engine (Web Audio API) — no audio files.
// Area-based BGM loops + one-shot SFX (warp / save / scan / treasure / rankup).
// FF-ish chiptune vibe, all synthesized. Respects browser autoplay: the
// AudioContext is created/resumed on a user gesture (exploration tap etc).

let ctx = null;
let master = null;
let enabled = loadEnabled();
let bgmTimer = null;
let currentArea = null;
let step = 0;

function loadEnabled() {
  try { const v = localStorage.getItem("rdm_sound"); return v === null ? true : v === "1"; } catch { return true; }
}

function ensureCtx() {
  try {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = enabled ? 0.6 : 0;
      master.connect(ctx.destination);
    }
    if (ctx.state === "suspended") ctx.resume();
  } catch { /* ignore */ }
  return ctx;
}

// one synthesized note with a soft attack / exponential decay
function note(freq, t0, dur, type = "triangle", peak = 0.18) {
  if (!ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.linearRampToValueAtTime(peak, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g); g.connect(master);
  o.start(t0); o.stop(t0 + dur + 0.03);
}

// ---------- SFX ----------
export function sfx(name) {
  if (!enabled) return;
  if (!ensureCtx()) return;
  const t = ctx.currentTime + 0.01;
  switch (name) {
    case "warp": {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "sawtooth";
      o.frequency.setValueAtTime(220, t);
      o.frequency.exponentialRampToValueAtTime(1600, t + 0.5);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.22, t + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.62);
      o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.66);
      [880, 1320, 1760].forEach((f, i) => note(f, t + 0.16 + i * 0.07, 0.18, "sine", 0.16));
      break;
    }
    case "save":
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => note(f, t + i * 0.12, 0.5, "triangle", 0.18));
      break;
    case "scan":
      note(1318.5, t, 0.08, "square", 0.1); note(1760, t + 0.05, 0.08, "square", 0.09);
      break;
    case "treasure":
      [659.25, 830.6, 987.77, 1318.5].forEach((f, i) => note(f, t + i * 0.09, 0.3, "triangle", 0.18));
      break;
    case "rankup":
      [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => note(f, t + i * 0.1, 0.45, "sawtooth", 0.16));
      break;
    case "dive": {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "sawtooth";
      o.frequency.setValueAtTime(1200, t);
      o.frequency.exponentialRampToValueAtTime(180, t + 0.8);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.2, t + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
      o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.95);
      break;
    }
    default: break;
  }
}

// ---------- BGM (per area, generated) ----------
const PROFILES = {
  entrance: { root: 261.63, scale: [0, 2, 4, 7, 9], wave: "triangle", beat: 460, bass: true },      // C major pentatonic — calm welcome
  main: { root: 261.63, scale: [0, 2, 4, 5, 7, 9, 11], wave: "triangle", beat: 400, bass: true },     // C major — adventurous
  showcase: { root: 293.66, scale: [0, 2, 3, 5, 7, 9, 10], wave: "sine", beat: 440 },                 // D dorian — mysterious
  limited: { root: 220.0, scale: [0, 2, 3, 5, 7, 8, 10], wave: "sawtooth", beat: 520, bass: true },   // A minor — grand / rare
  checkout: { root: 329.63, scale: [0, 2, 4, 7, 9], wave: "triangle", beat: 360, bass: true },        // E major pentatonic — bright
  _default: { root: 261.63, scale: [0, 2, 4, 5, 7, 9], wave: "triangle", beat: 430, bass: true }
};
const semi = (root, s) => root * Math.pow(2, s / 12);

function clearTimer() { if (bgmTimer) { clearInterval(bgmTimer); bgmTimer = null; } }

function startBgm() {
  clearTimer();
  if (!enabled || !currentArea || !ensureCtx()) return;
  const p = PROFILES[currentArea] || PROFILES._default;
  step = 0;
  bgmTimer = setInterval(() => {
    if (!enabled || !ctx) return;
    const t = ctx.currentTime + 0.03;
    const sc = p.scale;
    const deg = sc[step % sc.length];
    const oct = (Math.floor(step / sc.length) % 2) * 12;
    note(semi(p.root, deg + oct), t, (p.beat / 1000) * 0.9, p.wave, 0.1);   // arpeggio
    if (p.bass && step % 4 === 0) note(semi(p.root / 2, sc[0]), t, (p.beat / 1000) * 1.7, "sine", 0.14); // bass downbeat
    step++;
  }, p.beat);
}

// Switch the area BGM. Same area = no-op (keeps it playing seamlessly).
export function playArea(key) {
  if (currentArea === key && bgmTimer) return;
  currentArea = key;
  startBgm();
}

export function stopBgm() { clearTimer(); currentArea = null; }

export function setEnabled(v) {
  enabled = !!v;
  try { localStorage.setItem("rdm_sound", enabled ? "1" : "0"); } catch { /* ignore */ }
  if (ctx && master) master.gain.setTargetAtTime(enabled ? 0.6 : 0, ctx.currentTime, 0.05);
  if (enabled) startBgm(); else clearTimer();
}

export function isEnabled() { return enabled; }
