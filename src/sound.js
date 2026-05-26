// Procedural sound engine (Web Audio API) — no audio files.
// - Exploration BGM: rock groove — drums + slap ("chopper") bass in unison, per-area key/tempo.
// - DIVE sfx: a distant, descending shimmer cascade ("走馬灯" / life-flash).
// - Other SFX + rare "dowsing" pings. FF-ish worldview, all synthesized.

let ctx = null, master = null, bus = null, reverb = null, wetG = null, dryG = null, noiseBuf = null;
let enabled = loadEnabled();
let schedTimer = null, currentArea = null, profile = null, step16 = 0, nextTime = 0;
let dowseTimer = null, dowseLevel = 0;

function loadEnabled() {
  try { const v = localStorage.getItem("rdm_sound"); return v === null ? true : v === "1"; } catch { return true; }
}

function makeIR(seconds = 2.2, decay = 3.0) {
  const rate = ctx.sampleRate, len = Math.max(1, Math.floor(rate * seconds));
  const buf = ctx.createBuffer(2, len, rate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
  }
  return buf;
}
function makeNoise() {
  const len = ctx.sampleRate; const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

function ensureCtx() {
  try {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = enabled ? 0.5 : 0; master.connect(ctx.destination);
      dryG = ctx.createGain(); dryG.gain.value = 0.92; dryG.connect(master);
      wetG = ctx.createGain(); wetG.gain.value = 0.26; wetG.connect(master);
      reverb = ctx.createConvolver(); reverb.buffer = makeIR(); reverb.connect(wetG);
      bus = ctx.createGain(); bus.gain.value = 1; bus.connect(dryG); bus.connect(reverb);
      noiseBuf = makeNoise();
    }
    if (ctx.state === "suspended") ctx.resume();
  } catch { /* ignore */ }
  return ctx;
}

const semi = (hz, s) => hz * Math.pow(2, s / 12);

// tonal voice; dest = master (dry/punchy) or bus (reverb)
function voice(freq, t, dur, o = {}) {
  if (!ctx) return;
  const { type = "triangle", gain = 0.12, attack = 0.01, release = 0.3, cutoff = 0, sweepTo = 0, dest = bus } = o;
  const osc = ctx.createOscillator(); osc.type = type; osc.frequency.setValueAtTime(freq, t);
  const g = ctx.createGain();
  let head = osc;
  if (cutoff) {
    const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.setValueAtTime(cutoff, t);
    if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, t + Math.min(0.14, dur));
    osc.connect(f); f.connect(g); head = f;
  } else osc.connect(g);
  const hold = Math.max(attack + 0.02, dur - release);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(gain, t + attack);
  g.gain.setValueAtTime(gain, t + hold);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  g.connect(dest || master);
  osc.start(t); osc.stop(t + dur + 0.05);
}

function note(freq, t, dur, type = "triangle", peak = 0.18, dest) {
  if (!ctx) return;
  const o = ctx.createOscillator(); const g = ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(peak, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(dest || master); o.start(t); o.stop(t + dur + 0.03);
}

// ---- drums ----
function nz(t, dur, hp, lp, gain) {
  if (!ctx || !noiseBuf) return;
  const src = ctx.createBufferSource(); src.buffer = noiseBuf;
  let head = src;
  if (hp) { const f = ctx.createBiquadFilter(); f.type = "highpass"; f.frequency.value = hp; src.connect(f); head = f; }
  if (lp) { const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = lp; head.connect(f); head = f; }
  const g = ctx.createGain(); g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  head.connect(g); g.connect(master); src.start(t); src.stop(t + dur + 0.02);
}
function kick(t) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = "sine"; o.frequency.setValueAtTime(145, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
  g.gain.setValueAtTime(0.45, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.24);
  o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.26);
}
function snare(t) {
  nz(t, 0.18, 1400, 0, 0.26);
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = "triangle"; o.frequency.setValueAtTime(210, t);
  g.gain.setValueAtTime(0.14, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
  o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.14);
}
function hat(t, open) { nz(t, open ? 0.14 : 0.04, 7000, 0, open ? 0.08 : 0.11); }

// slap / chopper bass — percussive attack + fast filter sweep
function slap(freq, t, dur, accent) {
  const o = ctx.createOscillator(); o.type = "sawtooth"; o.frequency.setValueAtTime(freq, t);
  const f = ctx.createBiquadFilter(); f.type = "lowpass";
  f.frequency.setValueAtTime(accent ? 3000 : 1500, t);
  f.frequency.exponentialRampToValueAtTime(380, t + 0.1);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(accent ? 0.34 : 0.22, t + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(f); f.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.03);
}

// ---------- SFX ----------
export function sfx(name) {
  if (!enabled) return;
  if (!ensureCtx()) return;
  const t = ctx.currentTime + 0.01;
  switch (name) {
    case "dive": {
      // 走馬灯: many shimmering tones descending from far away, swelling closer
      const steps = [0, 3, 5, 7, 10, 12, 15, 19, 22, 24];
      const top = 2093.0; // C7
      for (let i = 0; i < 16; i++) {
        const t0 = t + i * 0.1;
        const s = steps[(i * 3) % steps.length] + (i % 4) * 12;
        const f0 = semi(top, -s);
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = i % 2 ? "triangle" : "sine";
        o.frequency.setValueAtTime(f0, t0);
        o.frequency.exponentialRampToValueAtTime(Math.max(70, f0 * 0.55), t0 + 1.5);
        const peak = 0.03 + 0.1 * (i / 16);  // later notes louder = approaching
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.linearRampToValueAtTime(peak, t0 + 0.05);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.7);
        o.connect(g); g.connect(bus);  // heavy reverb = distance
        o.start(t0); o.stop(t0 + 1.8);
      }
      // rising sub swell underneath
      const lo = ctx.createOscillator(), lg = ctx.createGain();
      lo.type = "sine"; lo.frequency.setValueAtTime(48, t); lo.frequency.linearRampToValueAtTime(120, t + 1.9);
      lg.gain.setValueAtTime(0.0001, t); lg.gain.linearRampToValueAtTime(0.2, t + 1.7); lg.gain.exponentialRampToValueAtTime(0.0001, t + 2.3);
      lo.connect(lg); lg.connect(master); lo.start(t); lo.stop(t + 2.4);
      break;
    }
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
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => note(f, t + i * 0.12, 0.5, "triangle", 0.18, bus));
      break;
    case "scan":
      note(1318.5, t, 0.08, "square", 0.1); note(1760, t + 0.05, 0.08, "square", 0.09);
      break;
    case "treasure":
      [659.25, 830.6, 987.77, 1318.5].forEach((f, i) => note(f, t + i * 0.09, 0.3, "triangle", 0.18, bus));
      break;
    case "rankup":
      [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => note(f, t + i * 0.1, 0.45, "sawtooth", 0.16, bus));
      break;
    default: break;
  }
}

// ---------- BGM: rock groove (drums + slap-bass unison) ----------
const PROFILES = {
  entrance: { keyHz: 261.63, bpm: 100, prog: [[0, [0, 4, 7]], [9, [0, 3, 7]], [5, [0, 4, 7]], [7, [0, 4, 7]]], lead: false },
  main: { keyHz: 261.63, bpm: 118, prog: [[0, [0, 4, 7]], [7, [0, 4, 7]], [9, [0, 3, 7]], [5, [0, 4, 7]]], lead: true },
  showcase: { keyHz: 293.66, bpm: 110, prog: [[0, [0, 3, 7]], [10, [0, 4, 7]], [8, [0, 4, 7]], [7, [0, 3, 7]]], lead: true },
  limited: { keyHz: 220.0, bpm: 96, prog: [[0, [0, 3, 7]], [8, [0, 4, 7]], [3, [0, 4, 7]], [10, [0, 4, 7]]], lead: true },
  checkout: { keyHz: 329.63, bpm: 126, prog: [[0, [0, 4, 7]], [5, [0, 4, 7]], [7, [0, 4, 7]], [0, [0, 4, 7]]], lead: true },
  _default: { keyHz: 261.63, bpm: 116, prog: [[0, [0, 4, 7]], [7, [0, 4, 7]], [9, [0, 3, 7]], [5, [0, 4, 7]]], lead: true }
};
const STEPS_PER_BAR = 16;
const KICK = [0, 6, 10];                    // syncopated rock kicks
const SNARE = [4, 12];
// [step, semitoneOffsetFromChordRoot, accent] — bass riff; accents land on kicks (unison)
const BASSPAT = [[0, 0, 1], [3, 0, 0], [6, 12, 1], [8, 7, 0], [10, 7, 1], [11, 10, 0], [14, 3, 0]];

function scheduleStep(s, t) {
  const bars = profile.prog.length;
  const bar = Math.floor(s / STEPS_PER_BAR) % bars;
  const inBar = s % STEPS_PER_BAR;
  const spb = 60 / profile.bpm;
  const stepDur = spb / 4;
  const [croot, ints] = profile.prog[bar];
  const root = profile.keyHz;

  // drums
  if (KICK.includes(inBar)) kick(t);
  if (SNARE.includes(inBar)) snare(t);
  if (inBar % 2 === 0) hat(t, inBar === 14);

  // slap bass riff (accents = unison with kick)
  const bp = BASSPAT.find((x) => x[0] === inBar);
  if (bp) {
    const bf = semi(root, croot + bp[1] - 12);
    slap(bf, t, stepDur * (bp[2] ? 1.9 : 1.4), bp[2]);
    if (bp[2]) slap(bf * 2, t, stepDur * 1.2, false); // octave doubling = thicker unison
  }

  // power-chord stab (electric-guitar chug) through reverb
  if (inBar === 0 || inBar === 8) {
    voice(semi(root, croot), t, stepDur * 2.4, { type: "sawtooth", gain: 0.06, attack: 0.005, release: 0.2, cutoff: 1800, dest: bus });
    voice(semi(root, croot + 7), t, stepDur * 2.4, { type: "sawtooth", gain: 0.05, attack: 0.005, release: 0.2, cutoff: 1800, dest: bus });
  }

  // sparse lead hook
  if (profile.lead && inBar === 14 && bar % 2 === 1) {
    const deg = ints[(bar) % ints.length];
    voice(semi(root, croot + deg + 12), t, spb * 0.8, { type: "square", gain: 0.06, attack: 0.005, release: 0.25, cutoff: 2600, dest: bus });
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
export function playArea(key) { if (currentArea === key && schedTimer) return; currentArea = key; startBgm(); }
export function stopBgm() { stopScheduler(); currentArea = null; profile = null; }

// ---------- Dowsing pings ----------
function scheduleDowse() {
  dowseTimer = null;
  if (!enabled || dowseLevel <= 0 || !ctx) return;
  const t = ctx.currentTime + 0.01;
  const freq = 620 + dowseLevel * 820;
  note(freq, t, 0.07, "square", 0.09);
  if (dowseLevel > 0.7) note(freq * 1.5, t + 0.05, 0.05, "square", 0.06);
  dowseTimer = setTimeout(scheduleDowse, Math.round(920 - dowseLevel * 780));
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
  if (ctx && master) master.gain.setTargetAtTime(enabled ? 0.5 : 0, ctx.currentTime, 0.05);
  if (enabled) { startBgm(); if (dowseLevel > 0 && !dowseTimer) scheduleDowse(); }
  else { stopScheduler(); if (dowseTimer) { clearTimeout(dowseTimer); dowseTimer = null; } }
}
export function isEnabled() { return enabled; }
