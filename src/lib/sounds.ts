"use client";

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

async function ensureAudioContext() {
  const ctx = getAudioContext();
  if (ctx.state === "suspended") {
    await ctx.resume();
  }
  return ctx;
}

async function playTone(frequency: number, duration: number, type: OscillatorType = "sine", volume = 0.15) {
  try {
    const ctx = await ensureAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Audio not available
  }
}

export function playPopSound() {
  playTone(800, 0.08, "sine", 0.12);
  setTimeout(() => playTone(1200, 0.06, "sine", 0.08), 30);
}

export function playFlipSound() {
  playTone(400, 0.1, "triangle", 0.1);
  setTimeout(() => playTone(600, 0.12, "triangle", 0.08), 60);
}

export function playSuccessSound() {
  playTone(523, 0.15, "sine", 0.12);
  setTimeout(() => playTone(659, 0.15, "sine", 0.12), 120);
  setTimeout(() => playTone(784, 0.2, "sine", 0.15), 240);
}

export function playDeclineSound() {
  playTone(400, 0.2, "sine", 0.1);
  setTimeout(() => playTone(350, 0.3, "sine", 0.08), 180);
}

export function playPartyHornSound() {
  playTone(440, 0.3, "sawtooth", 0.06);
  setTimeout(() => playTone(554, 0.2, "sawtooth", 0.05), 100);
  setTimeout(() => playTone(659, 0.25, "sawtooth", 0.06), 200);
  setTimeout(() => playTone(880, 0.4, "sawtooth", 0.04), 300);
}

export function playChimeSound() {
  playTone(1047, 0.3, "sine", 0.1);
  setTimeout(() => playTone(1319, 0.3, "sine", 0.08), 150);
  setTimeout(() => playTone(1568, 0.4, "sine", 0.06), 300);
}
