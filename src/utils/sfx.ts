/**
 * Neo-Brutalist Zero-Latency Web Audio API Synthesizer
 * 100% self-contained. Zero external MP3 files.
 * Instantaneous click-synced audio playback.
 */

let audioCtx: AudioContext | null = null;
let isWarmedUp = false;

function getOrCreateContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) return null;

  if (!audioCtx) {
    try {
      audioCtx = new AudioContextClass({ latencyHint: 'interactive' });
    } catch {
      try {
        audioCtx = new AudioContextClass();
      } catch {
        return null;
      }
    }
  }

  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }

  return audioCtx;
}

/**
 * Global audio pipeline pre-warming on first user touch/pointerdown.
 * Eliminates browser audio stack wake-up latency.
 */
export function initAudioWarmup(): void {
  if (typeof window === 'undefined' || isWarmedUp) return;

  const warmup = () => {
    const ctx = getOrCreateContext();
    if (ctx) {
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      isWarmedUp = true;
    }
    window.removeEventListener('pointerdown', warmup, true);
    window.removeEventListener('touchstart', warmup, true);
    window.removeEventListener('keydown', warmup, true);
  };

  window.addEventListener('pointerdown', warmup, { capture: true, once: true });
  window.addEventListener('touchstart', warmup, { capture: true, once: true });
  window.addEventListener('keydown', warmup, { capture: true, once: true });
}

export function isSfxEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const val = localStorage.getItem('sneha_sfx_enabled');
    // Default to true for full interactive experience
    return val === null ? true : val === 'true';
  } catch {
    return true;
  }
}

export function setSfxEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('sneha_sfx_enabled', enabled ? 'true' : 'false');
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * Ultra-low-latency mechanical switch click
 * Scheduled strictly at ctx.currentTime for 0ms delay.
 */
export function playClickSound(): void {
  if (!isSfxEnabled()) return;
  const ctx = getOrCreateContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.025);

    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.028);
  } catch {
    // Silent fail
  }
}

/**
 * Ultra-low-latency bubble pop for tab switches & menu actions
 */
export function playPopSound(): void {
  if (!isSfxEnabled()) return;
  const ctx = getOrCreateContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(820, now + 0.04);

    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.042);
  } catch {
    // Silent fail
  }
}

/**
 * Resonant stamp thump for confirmations and admin actions
 */
export function playThumpSound(): void {
  if (!isSfxEnabled()) return;
  const ctx = getOrCreateContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.09);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.095);
  } catch {
    // Silent fail
  }
}

/**
 * Ascending retro fanfare chime for downloads & celebrations
 */
export function playChimeSound(): void {
  if (!isSfxEnabled()) return;
  const ctx = getOrCreateContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const noteTime = now + idx * 0.04;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.1, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.13);
    });
  } catch {
    // Silent fail
  }
}

