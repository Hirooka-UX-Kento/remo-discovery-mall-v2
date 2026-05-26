// Procedural music engine (Web Audio API) — no audio files.
// Richer than a bare arpeggio: per-area chord progressions with pad + bass +
// arpeggio + sparse lead, run through a convolution reverb for space. Plus
// one-shot SFX and proximity "dowsing" pings. FF-ish worldview, all synthesized.

let ctx = null, master = null, bus = null, reverb = null, wetG = null, dryG = null;
let enabled = loadEnabled();
let schedTimer = null, currentArea = null, profile = null, step16 = 0, nextTime = 0;
let dowseTimer = null, dowseLevel = 0;

function loadEnabled() {
  try { const v = localStorage.getItem("rdm_sound"); return v === null ? true : v === "1"; } catch { return true; }
}

// simple exponential-decay noise impulse response for reverb
function makeIR(seconds = 2.6, decay = 2.8) {
  const rate = ctx.sampleRate, len = Math.max(1, Math.floor(rate * seconds));
  const buf = ctx.createBuffer(2, len, rate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
  }
  return buf;
}

function ensureCtx() {
  try {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = enabled ? 0.55 : 0; master.connect(ctx.destination);
      dryG = ctx.createGain(); dryG.gain.value = 0.9; dryG.connect(master);
      wetG = ctx.createGain(); wetG.gain.value = 0.34; wetG.connect(master);
      reverb = ctx.createConvolver(); reverb.buffer = makeIR(); reverb.connect(wetG);
      bus = ctx.createGain(); bus.gain.value = 1; bus.connect(dryG); bus.connect(reverb);
    }
    if (ctx.state === "suspended") ctx.resume();
  } catch { /* ignore */ }
  return ctx;
}

const semi = (hz, s) => hz * Math.pow(2, s / 12);

// musical voice (-> reverb bus), with ADSR + optional lowpass
function voice(freq, t, dur, o = {}) {
  if (!ctx) return;
  const { type = "triangle", gain = 0.12, attack = 0.01, release = 0.3, cutoff = 0 } = o;
  const osc = ctx.createOscillator(); osc.type = type; osc.frequency.setValueAtTime(freq, t);
  const g = ctx.createGain();
  if (cutoff) { const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.setValueAtTime(cutoff, t); osc.connect(f); f.connect(g); }
  else osc.connect(g);
  const hold = Math.max(attack + 0.02, dur - release);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(gain, t + attack);
  g.gain.setValueAtTime(gain, t + hold);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  g.connect(bus);
  osc.start(t); osc.stop(t + dur + 0.05);
}

// dry one-shot (SFX / dowsing) -> master
function note(freq, t, dur, type = "triangle", peak = 0.18) {
  if (!ctx) return;
  const o = ctx.createOscillator(); const g = ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(peak, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.03);
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
      o.frequency.setValueAtTime(220, t); o.frequency.exponentialRampToValueAtTime(1600, t + 0.5);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.22, t + 0.05); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.62);
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
      o.frequency.setValueAtTime(1200, t); o.frequency.exponentialRampToValueAtTime(180, t + 0.8);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.2, t + 0.05); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
      o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.95);
      break;
    }
    default: break;
  }
}

// ---------- BGM (per-area chord-progression engine) ----------
// prog entries: [chordRootSemitone, [chord tone intervals]]
const PROFILES = {
  entrance: { keyHz: 261.63, bpm: 72, scale: [0, 2, 4, 5, 7, 9, 11], lead: false,
    prog: [[0, [0, 4, 7]], [9, [0, 3, 7]], [5, [0, 4, 7]], [7, [0, 4, 7]]] },          // C  Am F  G  (calm)
  main: { keyHz: 261.63, bpm: 94, scale: [0, 2, 4, 5, 7, 9, 11], lead: true,
    prog: [[0, [0, 4, 7]], [7, [0, 4, 7]], [9, [0, 3, 7]], [5, [0, 4, 7]]] },           // C  G  Am F  (adventurous)
  showcase: { keyHz: 293.66, bpm: 80, scale: [0, 2, 3, 5, 7, 9, 10], lead: true,
    prog: [[0, [0, 3, 7]], [10, [0, 4, 7]], [8, [0, 4, 7]], [7, [0, 3, 7]]] },          // Dm ... (mysterious / dorian)
  limited: { keyHz: 220.0, bpm: 64, scale: [0, 2, 3, 5, 7, 8, 10], lead: true,
    prog: [[0, [0, 3, 7]], [8, [0, 4, 7]], [3, [0, 4, 7]], [10, [0, 4, 7]]] },          // Am F  C  G  (grand / rare)
  checkout: { keyHz: 329.63, bpm: 108, scale: [0, 2, 4, 7, 9], lead: true,
    prog: [[0, [0, 4, 7]], [5, [0, 4, 7]], [7, [0, 4, 7]], [0, [0, 4, 7]]] },           // bright
  _default: { keyHz: 261.63, bpm: 90, scale: [0, 2, 4, 5, 7, 9], lead: true,
    prog: [[0, [0, 4, 7]], [7, [0, 4, 7]], [9, [0, 3, 7]], [5, [0, 4, 7]]] }
};

const STEPS_PER_BAR = 16;

function scheduleStep(s, t) {
  const bars = profile.prog.length;
  const bar = Math.floor(s / STEPS_PER_BAR) % bars;
  const inBar = s % STEPS_PER_BAR;
  const spb = 60 / profile.bpm;       // sec per quarter note
  const stepDur = spb / 4;            // 16th
  const [croot, ints] = profile.prog[bar];
  const root = profile.keyHz;
  // PAD — sustained chord across the whole bar (soft, filtered)
  if (inBar === 0) {
    ints.forEach((iv, k) => voice(semi(root, croot + iv), t, spb * 4 * 0.97,
      { type: "sine", gain: 0.05, attack: 0.5, release: 1.5, cutoff: 1500 + k * 220 }));
  }
  // BASS — beats 1 & 3
  if (inBar === 0 || inBar === 8) {
    voice(semi(root, croot - 12), t, spb * 1.6, { type: "triangle", gain: 0.14, attack: 0.01, release: 0.35, cutoff: 520 });
  }
  // ARPEGGIO — 8th notes, cycling chord tones up an octave
  if (inBar % 2 === 0) {
    const deg = ints[(inBar / 2) % ints.length];
    voice(semi(root, croot + deg + 12), t, stepDur * 1.7, { type: "triangle", gain: 0.08, attack: 0.005, release: 0.18, cutoff: 3200 });
  }
  // LEAD — sparse melody notes
  if (profile.lead && (inBar === 6 || inBar === 14)) {
    const sc = profile.scale;
    const deg = sc[(bar * 3 + (inBar === 14 ? 2 : 0)) % sc.length];
    voice(semi(root, deg + 12), t, spb * 0.95, { type: "square", gain: 0.05, attack: 0.01, release: 0.32, cutoff: 2400 });
  }
}

function scheduler() {
  if (!enabled || !ctx || !profile) return;
  const stepDur = (60 / profile.bpm) / 4;
  while (nextTime < ctx.currentTime + 0.25) { scheduleStep(step16, nextTime); step16++; nextTime += stepDur; }
}

function stopScheduler() { if (schedTimer) { clearInterval(schedTimer); schedTimer = null; } }

function startBgm() {
  stopScheduler();
  if (!enabled || !currentArea || !ensureCtx()) return;
  profile = PROFILES[currentArea] || PROFILES._default;
  step16 = 0; nextTime = ctx.currentTime + 0.12;
  schedTimer = setInterval(scheduler, 25);
}

export function playArea(key) {
  if (currentArea === key && schedTimer) return;
  currentArea = key;
  startBgm();
}

export function stopBgm() { stopScheduler(); currentArea = null; profile = null; }

// ---------- Dowsing pings (proximity to a hidden rare) ----------
function scheduleDowse() {
  dowseTimer = null;
  if (!enabled || dowseLevel <= 0 || !ctx) return;
  const t = ctx.currentTime + 0.01;
  const freq = 620 + dowseLevel * 820;
  note(freq, t, 0.07, "square", 0.09);
  if (dowseLevel > 0.7) note(freq * 1.5, t + 0.05, 0.05, "square", 0.06);
  const interval = Math.round(920 - dowseLevel * 780);
  dowseTimer = setTimeout(scheduleDowse, interval);
}
export function dowse(level) {
  const lv = Math.max(0, Math.min(1, level || 0));
  dowseLevel = lv;
  if (!enabled || lv <= 0) { if (dowseTimer) { clearTimeout(dowseTimer); dowseTimer = null; } return; }
  if (!ensureCtx()) return;
  if (!dowseTimer) scheduleDowse();
}

export function setEnabled(v) {
  enabled = !!v;
  try { localStorage.setItem("rdm_sound", enabled ? "1" : "0"); } catch { /* ignore */ }
  if (ctx && master) master.gain.setTargetAtTime(enabled ? 0.55 : 0, ctx.currentTime, 0.05);
  if (enabled) { startBgm(); if (dowseLevel > 0 && !dowseTimer) scheduleDowse(); }
  else { stopScheduler(); if (dowseTimer) { clearTimeout(dowseTimer); dowseTimer = null; } }
}

export function isEnabled() { return enabled; }
