// Procedural sound engine (Web Audio) — no audio files.
// Warmer "instrument-like" timbres (FM e-piano, detuned-saw strings/pad, plucks,
// slap bass, drums), a per-THEME musical style, and a cinematic DIVE cue.
// NB: true acoustic instruments need samples; this synthesizes close approximations.

let ctx = null, master = null, bus = null, reverb = null, wetG = null, dryG = null, noiseBuf = null;
let enabled = loadEnabled();
let schedTimer = null, currentArea = null, area = null, style = null, styleKey = null, toneKey = null, step16 = 0, nextTime = 0;
let dowseTimer = null, dowseLevel = 0;

function loadEnabled() { try { const v = localStorage.getItem("rdm_sound"); return v === null ? true : v === "1"; } catch { return true; } }

function makeIR(seconds = 2.4, decay = 2.8) {
  const rate = ctx.sampleRate, len = Math.max(1, Math.floor(rate * seconds));
  const buf = ctx.createBuffer(2, len, rate);
  for (let ch = 0; ch < 2; ch++) { const d = buf.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay); }
  return buf;
}
function makeNoise() { const len = ctx.sampleRate; const b = ctx.createBuffer(1, len, ctx.sampleRate); const d = b.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1; return b; }

function ensureCtx() {
  try {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = enabled ? 0.5 : 0; master.connect(ctx.destination);
      dryG = ctx.createGain(); dryG.gain.value = 0.9; dryG.connect(master);
      wetG = ctx.createGain(); wetG.gain.value = 0.3; wetG.connect(master);
      reverb = ctx.createConvolver(); reverb.buffer = makeIR(); reverb.connect(wetG);
      bus = ctx.createGain(); bus.connect(dryG); bus.connect(reverb);
      noiseBuf = makeNoise();
    }
    if (ctx.state === "suspended") ctx.resume();
  } catch { /* ignore */ }
  return ctx;
}
const semi = (hz, s) => hz * Math.pow(2, s / 12);

// ---- instrument voices ----
function simpleVoice(freq, t, dur, type, peak, cutoff, dest) {
  const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(freq, t);
  const g = ctx.createGain();
  if (cutoff) { const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.setValueAtTime(cutoff, t); o.connect(f); f.connect(g); } else o.connect(g);
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  g.connect(dest || master); o.start(t); o.stop(t + dur + 0.03);
}
// FM bell / electric-piano
function fmVoice(freq, t, dur, o = {}) {
  const { gain = 0.1, ratio = 2, index = 160, attack = 0.005, release = 0.4, dest = bus } = o;
  const car = ctx.createOscillator(); car.type = "sine"; car.frequency.setValueAtTime(freq, t);
  const mod = ctx.createOscillator(); mod.type = "sine"; mod.frequency.setValueAtTime(freq * ratio, t);
  const mg = ctx.createGain(); mg.gain.setValueAtTime(index, t); mg.gain.exponentialRampToValueAtTime(1, t + Math.max(0.05, dur * 0.6));
  mod.connect(mg); mg.connect(car.frequency);
  const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(gain, t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  car.connect(g); g.connect(dest || master);
  car.start(t); mod.start(t); car.stop(t + dur + 0.05); mod.stop(t + dur + 0.05);
}
// detuned-saw ensemble (strings / pad) with vibrato
function ensembleVoice(freq, t, dur, o = {}) {
  const { gain = 0.05, detune = 8, cutoff = 2300, attack = 0.4, release = 0.8, dest = bus, type = "sawtooth", voices = 3, vib = 4 } = o;
  const g = ctx.createGain();
  const hold = Math.max(attack + 0.02, dur - release);
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(gain, t + attack); g.gain.setValueAtTime(gain, t + hold); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.setValueAtTime(cutoff, t); f.connect(g); g.connect(dest || master);
  let lfo, lg; if (vib) { lfo = ctx.createOscillator(); lfo.type = "sine"; lfo.frequency.value = 5; lg = ctx.createGain(); lg.gain.value = vib; lfo.connect(lg); lfo.start(t); lfo.stop(t + dur + 0.05); }
  for (let i = 0; i < voices; i++) { const o2 = ctx.createOscillator(); o2.type = type; o2.frequency.setValueAtTime(freq, t); o2.detune.setValueAtTime((i - (voices - 1) / 2) * detune, t); if (lg) lg.connect(o2.detune); o2.connect(f); o2.start(t); o2.stop(t + dur + 0.05); }
}
function pluck(freq, t, dur, o = {}) {
  const { gain = 0.1, cutoff = 3000, dest = bus, type = "triangle" } = o;
  const osc = ctx.createOscillator(); osc.type = type; osc.frequency.setValueAtTime(freq, t);
  const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.setValueAtTime(cutoff, t); f.frequency.exponentialRampToValueAtTime(600, t + 0.16);
  const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(gain, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(f); f.connect(g); g.connect(dest || master); osc.start(t); osc.stop(t + dur + 0.03);
}
function slap(freq, t, dur, accent) {
  const o = ctx.createOscillator(); o.type = "sawtooth"; o.frequency.setValueAtTime(freq, t);
  const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.setValueAtTime(accent ? 3000 : 1500, t); f.frequency.exponentialRampToValueAtTime(380, t + 0.1);
  const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(accent ? 0.32 : 0.2, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(f); f.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.03);
}
// drums
function nz(t, dur, hp, lp, gain) {
  const src = ctx.createBufferSource(); src.buffer = noiseBuf; let head = src;
  if (hp) { const f = ctx.createBiquadFilter(); f.type = "highpass"; f.frequency.value = hp; src.connect(f); head = f; }
  if (lp) { const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = lp; head.connect(f); head = f; }
  const g = ctx.createGain(); g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); head.connect(g); g.connect(master); src.start(t); src.stop(t + dur + 0.02);
}
function kick(t, soft) { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = "sine"; o.frequency.setValueAtTime(soft ? 110 : 145, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.12); g.gain.setValueAtTime(soft ? 0.3 : 0.44, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.24); o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.26); }
function snare(t) { nz(t, 0.18, 1400, 0, 0.24); const o = ctx.createOscillator(), g = ctx.createGain(); o.type = "triangle"; o.frequency.setValueAtTime(210, t); g.gain.setValueAtTime(0.13, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12); o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.14); }
function clap(t) { for (let i = 0; i < 3; i++) nz(t + i * 0.012, 0.06, 1500, 0, 0.15); }
function hat(t, open) { nz(t, open ? 0.14 : 0.04, 7000, 0, open ? 0.08 : 0.1); }
function note(freq, t, dur, type = "triangle", peak = 0.18, dest) { simpleVoice(freq, t, dur, type, peak, 0, dest || master); }

// ---------- SFX ----------
export function sfx(name) {
  if (!enabled || !ensureCtx()) return;
  const t = ctx.currentTime + 0.01;
  switch (name) {
    case "dive": {
      // rushing through a tunnel — wind-cutting whoosh that lasts the possession sequence
      const dur = 8.0;
      // main wind: looping noise through a sweeping resonant bandpass + lowpass
      const src = ctx.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
      const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.Q.value = 1.5;
      bp.frequency.setValueAtTime(260, t);
      bp.frequency.linearRampToValueAtTime(1900, t + 2.2);
      bp.frequency.linearRampToValueAtTime(1100, t + 4.6);
      bp.frequency.linearRampToValueAtTime(2800, t + 7.0);
      const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 5400;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.32, t + 0.5);
      g.gain.setValueAtTime(0.32, t + dur - 1.3);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      src.connect(bp); bp.connect(lp); lp.connect(g); g.connect(master);
      // gusting tremolo (LFO speeds up = accelerating)
      const lfo = ctx.createOscillator(); lfo.type = "sine"; lfo.frequency.setValueAtTime(0.8, t); lfo.frequency.linearRampToValueAtTime(3.6, t + dur);
      const lfg = ctx.createGain(); lfg.gain.value = 0.12; lfo.connect(lfg); lfg.connect(g.gain);
      src.start(t); src.stop(t + dur + 0.1); lfo.start(t); lfo.stop(t + dur + 0.1);
      // deep tunnel rumble
      const sub = ctx.createOscillator(); sub.type = "sine";
      sub.frequency.setValueAtTime(40, t); sub.frequency.linearRampToValueAtTime(88, t + dur * 0.6); sub.frequency.linearRampToValueAtTime(54, t + dur);
      const sg = ctx.createGain(); sg.gain.setValueAtTime(0.0001, t); sg.gain.linearRampToValueAtTime(0.18, t + 1); sg.gain.setValueAtTime(0.18, t + dur - 1.5); sg.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      sub.connect(sg); sg.connect(master); sub.start(t); sub.stop(t + dur + 0.1);
      // "風を切る" cuts: short high swishes, panned alternately (doppler-ish)
      for (let i = 0; i < 7; i++) {
        const t0 = t + 0.9 + i * 0.95;
        const s2 = ctx.createBufferSource(); s2.buffer = noiseBuf;
        const f2 = ctx.createBiquadFilter(); f2.type = "bandpass"; f2.Q.value = 2.6;
        f2.frequency.setValueAtTime(1100, t0); f2.frequency.exponentialRampToValueAtTime(4600, t0 + 0.34);
        const g2 = ctx.createGain(); g2.gain.setValueAtTime(0.0001, t0); g2.gain.linearRampToValueAtTime(0.15, t0 + 0.05); g2.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.42);
        s2.connect(f2); f2.connect(g2);
        if (ctx.createStereoPanner) { const pan = ctx.createStereoPanner(); pan.pan.value = i % 2 ? 0.65 : -0.65; g2.connect(pan); pan.connect(master); }
        else g2.connect(master);
        s2.start(t0); s2.stop(t0 + 0.45);
      }
      break;
    }
    case "warp": {
      const o = ctx.createOscillator(), g = ctx.createGain(); o.type = "sawtooth"; o.frequency.setValueAtTime(220, t); o.frequency.exponentialRampToValueAtTime(1600, t + 0.5);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.22, t + 0.05); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.62); o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.66);
      [880, 1320, 1760].forEach((f, i) => fmVoice(f, t + 0.16 + i * 0.07, 0.5, { gain: 0.08, ratio: 3, index: 90, dest: bus }));
      break;
    }
    case "save": [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => fmVoice(f, t + i * 0.12, 0.7, { gain: 0.1, ratio: 2, index: 120, dest: bus })); break;
    case "scan": note(1318.5, t, 0.08, "square", 0.1); note(1760, t + 0.05, 0.08, "square", 0.09); break;
    case "treasure": [659.25, 830.6, 987.77, 1318.5].forEach((f, i) => fmVoice(f, t + i * 0.09, 0.5, { gain: 0.1, ratio: 3.5, index: 110, dest: bus })); break;
    case "rankup": [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => fmVoice(f, t + i * 0.1, 0.6, { gain: 0.1, ratio: 2, index: 140, dest: bus })); break;
    default: break;
  }
}

// ---------- per-THEME style ----------
const STYLES = {
  electro: { drums: true, kit: "electro", bass: "slap", chord: "pluck", arp: "pluck", lead: "saw", pad: true, reverb: 0.32 },
  rock: { drums: true, kit: "rock", bass: "slap", chord: "power", arp: "pluck", lead: "square", pad: false, reverb: 0.24 },
  soft: { drums: true, kit: "soft", bass: "round", chord: "epiano", arp: "epiano", lead: "epiano", pad: true, reverb: 0.42 },
  orchestral: { drums: false, kit: "none", bass: "round", chord: "strings", arp: "pluck", lead: "strings", pad: true, reverb: 0.55 },
  chip: { drums: true, kit: "chip", bass: "square", chord: "square", arp: "square", lead: "square", pad: false, reverb: 0.18 }
};
const TONE_STYLE = {
  cyber: "electro", night: "electro", game: "rock", festival: "rock",
  corporate: "soft", mint: "soft", pink: "soft", simple: "soft",
  premium: "orchestral", wonder: "orchestral", retro: "chip"
};

// ---------- per-AREA key / tempo / progression ----------
const AREAS = {
  entrance: { keyHz: 261.63, bpm: 104, scale: [0, 2, 4, 5, 7, 9, 11], prog: [[0, [0, 4, 7]], [9, [0, 3, 7]], [5, [0, 4, 7]], [7, [0, 4, 7]]] },
  main: { keyHz: 261.63, bpm: 118, scale: [0, 2, 4, 5, 7, 9, 11], prog: [[0, [0, 4, 7]], [7, [0, 4, 7]], [9, [0, 3, 7]], [5, [0, 4, 7]]] },
  showcase: { keyHz: 293.66, bpm: 110, scale: [0, 2, 3, 5, 7, 9, 10], prog: [[0, [0, 3, 7]], [10, [0, 4, 7]], [8, [0, 4, 7]], [7, [0, 3, 7]]] },
  limited: { keyHz: 220.0, bpm: 96, scale: [0, 2, 3, 5, 7, 8, 10], prog: [[0, [0, 3, 7]], [8, [0, 4, 7]], [3, [0, 4, 7]], [10, [0, 4, 7]]] },
  checkout: { keyHz: 329.63, bpm: 124, scale: [0, 2, 4, 7, 9], prog: [[0, [0, 4, 7]], [5, [0, 4, 7]], [7, [0, 4, 7]], [0, [0, 4, 7]]] },
  _default: { keyHz: 261.63, bpm: 114, scale: [0, 2, 4, 5, 7, 9], prog: [[0, [0, 4, 7]], [7, [0, 4, 7]], [9, [0, 3, 7]], [5, [0, 4, 7]]] }
};

const BASSPAT = [[0, 0, 1], [3, 0, 0], [6, 12, 1], [8, 7, 0], [10, 7, 1], [11, 10, 0], [14, 3, 0]];

function playChord(kind, freqs, t, dur) {
  switch (kind) {
    case "epiano": freqs.forEach((f) => fmVoice(f, t, dur, { gain: 0.06, ratio: 2, index: 150, attack: 0.005, release: dur * 0.6 })); break;
    case "strings": freqs.forEach((f) => ensembleVoice(f, t, dur, { gain: 0.045, cutoff: 2200, attack: dur * 0.25, release: dur * 0.4, vib: 5 })); break;
    case "power": freqs.slice(0, 2).forEach((f) => pluck(f, t, dur, { gain: 0.06, cutoff: 1800, type: "sawtooth" })); break;
    case "pluck": freqs.forEach((f) => pluck(f, t, dur * 0.6, { gain: 0.05, cutoff: 3200 })); break;
    case "square": freqs.forEach((f) => simpleVoice(f, t, dur * 0.5, "square", 0.04, 2400, bus)); break;
    default: break;
  }
}
function playArp(kind, f, t, dur) {
  if (kind === "epiano") fmVoice(f, t, dur, { gain: 0.05, ratio: 4, index: 90, release: dur * 0.7 });
  else if (kind === "square") simpleVoice(f, t, dur, "square", 0.045, 2600, bus);
  else pluck(f, t, dur, { gain: 0.06, cutoff: 3400 });
}
function playBass(kind, f, t, dur, accent) {
  switch (kind) {
    case "slap": slap(f, t, dur, accent); if (accent) slap(f * 2, t, dur * 0.7, false); break;
    case "round": simpleVoice(f, t, dur * 1.3, "triangle", accent ? 0.2 : 0.15, 700); break;
    case "square": simpleVoice(f, t, dur, "square", accent ? 0.15 : 0.11, 900); break;
    default: simpleVoice(f, t, dur * 1.3, "sine", accent ? 0.22 : 0.16, 520); break;
  }
}
function playLead(kind, f, t, dur) {
  if (kind === "strings") ensembleVoice(f, t, dur, { gain: 0.05, cutoff: 2600, attack: 0.06, release: dur * 0.5, vib: 6 });
  else if (kind === "epiano") fmVoice(f, t, dur, { gain: 0.06, ratio: 2, index: 130, release: dur * 0.5 });
  else if (kind === "saw") simpleVoice(f, t, dur, "sawtooth", 0.05, 2600, bus);
  else simpleVoice(f, t, dur, "square", 0.05, 2600, bus);
}
function playDrums(kit, inBar, t) {
  if (kit === "none") return;
  const KICK = [0, 6, 10], SNARE = [4, 12];
  if (kit === "soft") {
    if (inBar === 0 || inBar === 8) kick(t, true);
    if (inBar === 4 || inBar === 12) nz(t, 0.05, 2200, 0, 0.11);
    if (inBar % 4 === 0) hat(t, false);
    return;
  }
  if (KICK.includes(inBar)) kick(t);
  if (SNARE.includes(inBar)) { if (kit === "electro") clap(t); else snare(t); }
  if (inBar % 2 === 0) hat(t, inBar === 14);
}

function scheduleStep(s, t) {
  if (!area || !style) return;
  const bars = area.prog.length, bar = Math.floor(s / 16) % bars, inBar = s % 16;
  const spb = 60 / area.bpm, stepDur = spb / 4;
  const [croot, ints] = area.prog[bar]; const root = area.keyHz; const st = style;
  if (st.drums) playDrums(st.kit, inBar, t);
  if (st.pad && inBar === 0) playChord(st.chord, ints.map((iv) => semi(root, croot + iv)), t, spb * 4 * 0.96);
  if (!st.pad && inBar % 4 === 0) playChord(st.chord, ints.map((iv) => semi(root, croot + iv)), t, spb * 0.9);
  const bp = BASSPAT.find((x) => x[0] === inBar);
  if (bp) playBass(st.bass, semi(root, croot + bp[1] - 12), t, stepDur * (bp[2] ? 1.9 : 1.4), !!bp[2]);
  if (st.pad && inBar % 2 === 0) playArp(st.arp, semi(root, croot + ints[(inBar / 2) % ints.length] + 12), t, stepDur * 1.6);
  if (inBar === 14 && bar % 2 === 1) playLead(st.lead, semi(root, area.scale[bar % area.scale.length] + 12), t, spb * 0.85);
}
function scheduler() {
  if (!enabled || !ctx || !area) return;
  const stepDur = (60 / area.bpm) / 4;
  while (nextTime < ctx.currentTime + 0.25) { scheduleStep(step16, nextTime); step16++; nextTime += stepDur; }
}
function stopScheduler() { if (schedTimer) { clearInterval(schedTimer); schedTimer = null; } }
// procedural BGM (fallback when the real track can't load)
function startProcedural() {
  stopScheduler();
  if (!enabled || !currentArea || !ensureCtx()) return;
  area = AREAS[currentArea] || AREAS._default;
  style = STYLES[styleKey] || STYLES.electro;
  if (wetG) wetG.gain.setTargetAtTime(style.reverb, ctx.currentTime, 0.1);
  step16 = 0; nextTime = ctx.currentTime + 0.12;
  schedTimer = setInterval(scheduler, 25);
}

// ---- real BGM tracks (FreePD, public domain), one per theme style ----
const A_BASE = (import.meta.env && import.meta.env.BASE_URL) || "/";
const BGM_FILE = {
  electro: "assets/audio/electro.mp3",
  rock: "assets/audio/rock.mp3",
  soft: "assets/audio/soft.mp3",
  orchestral: "assets/audio/orchestral.mp3",
  chip: "assets/audio/chip.mp3"
};
// per-theme track override (takes precedence over the style track)
const TONE_FILE = { corporate: "assets/audio/corporate.mp3" };
const BGM_VOL = 0.55;
let bgmAudio = null, currentTrackFile = null;

function trackFor(tone, sk) { return TONE_FILE[tone] || BGM_FILE[sk] || null; }

function onBgmError() {
  if (bgmAudio) bgmAudio.removeEventListener("error", onBgmError);
  bgmAudio = null;
  startProcedural();
}
function startFileBgm(file) {
  stopScheduler(); // never run procedural + file at once
  if (!file) { startProcedural(); return; }
  if (!bgmAudio) { bgmAudio = new Audio(); bgmAudio.loop = true; bgmAudio.preload = "auto"; bgmAudio.addEventListener("error", onBgmError); }
  if (bgmAudio.getAttribute("data-file") !== file) { bgmAudio.src = A_BASE + file; bgmAudio.setAttribute("data-file", file); }
  currentTrackFile = file;
  bgmAudio.volume = enabled ? BGM_VOL : 0;
  if (enabled) { const p = bgmAudio.play(); if (p && p.catch) p.catch(() => { /* autoplay blocked; resumes on next gesture */ }); }
}

// area = node id, tone = current theme id (selects the track/style)
export function playArea(areaId, tone) {
  const sk = TONE_STYLE[tone] || "electro";
  const file = trackFor(tone, sk);
  currentArea = areaId; toneKey = tone; styleKey = sk;
  const playing = bgmAudio && !bgmAudio.paused && currentTrackFile === file;
  if (playing) return; // same track already going
  startFileBgm(file);
}
export function stopBgm() { stopScheduler(); if (bgmAudio) bgmAudio.pause(); currentArea = null; area = null; }

// ---------- Dowsing ----------
function scheduleDowse() {
  dowseTimer = null;
  if (!enabled || dowseLevel <= 0 || !ctx) return;
  const t = ctx.currentTime + 0.01;
  // mechanical scanner click (Geiger/metal-detector-like): short resonant noise burst + metallic tick
  const src = ctx.createBufferSource(); src.buffer = noiseBuf;
  const bpf = ctx.createBiquadFilter(); bpf.type = "bandpass"; bpf.Q.value = 9; bpf.frequency.setValueAtTime(1700 + dowseLevel * 2600, t);
  const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.13 + dowseLevel * 0.1, t + 0.002); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);
  src.connect(bpf); bpf.connect(g); g.connect(master); src.start(t); src.stop(t + 0.06);
  // short metallic ring on top (resonant), brighter when close
  const o = ctx.createOscillator(); o.type = "square"; o.frequency.setValueAtTime(1500 + dowseLevel * 1500, t);
  const og = ctx.createGain(); og.gain.setValueAtTime(0.0001, t); og.gain.linearRampToValueAtTime(0.05 + dowseLevel * 0.05, t + 0.002); og.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
  o.connect(og); og.connect(master); o.start(t); o.stop(t + 0.04);
  dowseTimer = setTimeout(scheduleDowse, Math.round(900 - dowseLevel * 760));
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
  if (ctx && master) master.gain.setTargetAtTime(enabled ? 0.5 : 0, ctx.currentTime, 0.05); // SFX / dowsing / procedural
  if (bgmAudio) {                                  // real BGM track
    bgmAudio.volume = enabled ? BGM_VOL : 0;
    if (enabled) { const p = bgmAudio.play(); if (p && p.catch) p.catch(() => {}); } else bgmAudio.pause();
  }
  if (enabled) {
    if (!bgmAudio && currentArea) startFileBgm(trackFor(toneKey, styleKey || "electro"));
    if (dowseLevel > 0 && !dowseTimer) scheduleDowse();
  } else {
    stopScheduler();
    if (dowseTimer) { clearTimeout(dowseTimer); dowseTimer = null; }
  }
}
export function isEnabled() { return enabled; }
