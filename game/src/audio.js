// Twin Peeks — all sound is synthesised with WebAudio: short oscillator
// blips, no audio files, no network. The context is created lazily on the
// first user gesture, so the page never complains about autoplay.

// Creates the sound board. Every method is a no-op until the context exists
// (created on the first call after a user gesture) or while muted.
export function createAudio() {
  let ctx = null;
  let muted = false;

  function ac() {
    if (ctx) return ctx;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    } catch {
      return null;
    }
    return ctx;
  }

  // One short tone: a sine/triangle oscillator with a quick decay envelope.
  function tone(freq, start, dur, type, vol) {
    if (muted) return;
    const c = ac();
    if (!c) return;
    if (c.state === 'suspended') c.resume().catch(() => {});
    const t0 = c.currentTime + start;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g);
    g.connect(c.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.05);
  }

  return {
    get muted() {
      return muted;
    },
    toggleMute() {
      muted = !muted;
      return muted;
    },
    // A rising pop plus a bright chime when a difference is found.
    find() {
      tone(660, 0, 0.12, 'sine', 0.22);
      tone(990, 0.06, 0.18, 'sine', 0.18);
      tone(1320, 0.12, 0.22, 'triangle', 0.1);
    },
    // A low buzz for a wrong click.
    miss() {
      tone(140, 0, 0.18, 'sawtooth', 0.12);
      tone(110, 0.05, 0.2, 'sawtooth', 0.1);
    },
    // A gentle two-note chime for a hint.
    hint() {
      tone(520, 0, 0.2, 'sine', 0.16);
      tone(780, 0.12, 0.3, 'sine', 0.14);
    },
    // A four-note arpeggio when a level is cleared.
    win() {
      tone(523, 0, 0.16, 'triangle', 0.18);
      tone(659, 0.1, 0.16, 'triangle', 0.18);
      tone(784, 0.2, 0.16, 'triangle', 0.18);
      tone(1047, 0.3, 0.34, 'triangle', 0.2);
    },
    // A soft tick when the timer runs low.
    tick() {
      tone(880, 0, 0.06, 'square', 0.05);
    },
    // Falling notes when time runs out.
    timeout() {
      tone(392, 0, 0.22, 'triangle', 0.16);
      tone(311, 0.16, 0.22, 'triangle', 0.16);
      tone(233, 0.32, 0.4, 'triangle', 0.16);
    },
  };
}
