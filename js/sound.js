/* Tiny synthesized sound effects (Web Audio, no files to download).
   Browsers only allow audio after the visitor's first click or key press,
   which is always the case here because every sound follows an action. */
window.SOUND = (() => {
  const KEY = 'cvs-sound';
  let on = true;
  try { const v = localStorage.getItem(KEY); if (v !== null) on = v === '1'; } catch (e) { /* storage blocked */ }

  let ctx = null, master = null;
  function ac() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.45;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function noise(c, dur) {
    const b = c.createBuffer(1, Math.ceil(c.sampleRate * dur), c.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const s = c.createBufferSource();
    s.buffer = b;
    return s;
  }
  function env(g, t, attack, peak, decay) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  }
  function tone(c, t, type, freq, peak, decay, endFreq) {
    const o = c.createOscillator(), g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (endFreq) o.frequency.exponentialRampToValueAtTime(endFreq, t + decay);
    env(g, t, 0.004, peak, decay);
    o.connect(g).connect(master);
    o.start(t);
    o.stop(t + decay + 0.05);
  }
  function burst(c, t, dur, type, freq, peak, q = 1) {
    const n = noise(c, dur + 0.05), f = c.createBiquadFilter(), g = c.createGain();
    f.type = type; f.frequency.value = freq; f.Q.value = q;
    env(g, t, 0.003, peak, dur);
    n.connect(f).connect(g).connect(master);
    n.start(t);
    return f;
  }

  const sounds = {
    beep(c, t) { tone(c, t, 'square', 1320, 0.06, 0.06); },
    select(c, t) { tone(c, t, 'square', 988, 0.06, 0.07); tone(c, t + 0.09, 'square', 1480, 0.06, 0.1); },
    error(c, t) { tone(c, t, 'sawtooth', 110, 0.12, 0.42); tone(c, t, 'square', 116, 0.06, 0.42); },
    whirr(c, t) {
      const o = c.createOscillator(), f = c.createBiquadFilter(), g = c.createGain();
      o.type = 'sawtooth'; o.frequency.setValueAtTime(55, t); o.frequency.linearRampToValueAtTime(95, t + 0.25); o.frequency.linearRampToValueAtTime(60, t + 0.5);
      f.type = 'lowpass'; f.frequency.value = 700;
      env(g, t, 0.05, 0.18, 0.5);
      o.connect(f).connect(g).connect(master); o.start(t); o.stop(t + 0.6);
      burst(c, t, 0.06, 'lowpass', 900, 0.3);
    },
    tick(c, t) { burst(c, t, 0.04, 'bandpass', 2600, 0.18, 2); },
    clunk(c, t) {
      tone(c, t, 'sine', 150, 0.9, 0.32, 38);
      burst(c, t, 0.14, 'lowpass', 650, 0.7);
      burst(c, t + 0.02, 0.05, 'bandpass', 1800, 0.12, 3);
    },
    fizz(c, t) {
      burst(c, t, 0.05, 'bandpass', 1400, 0.5, 2);
      burst(c, t + 0.03, 1.1, 'highpass', 3200, 0.28);
    },
    rip(c, t) {
      for (let i = 0; i < 10; i++) burst(c, t + i * 0.032, 0.028, 'bandpass', 1500 + Math.random() * 1500, 0.2 + Math.random() * 0.3, 1.5);
    },
    pour(c, t) { const f = burst(c, t, 1.0, 'bandpass', 500, 0.22, 0.8); f.frequency.linearRampToValueAtTime(1100, t + 1); },
    coin(c, t) {
      tone(c, t, 'sine', 2093, 0.22, 0.4); tone(c, t, 'sine', 2637, 0.12, 0.35);
      burst(c, t + 0.22, 0.03, 'bandpass', 3000, 0.15, 3); burst(c, t + 0.3, 0.03, 'bandpass', 2600, 0.1, 3);
    },
    whoosh(c, t) { const f = burst(c, t, 0.4, 'bandpass', 300, 0.16, 0.7); f.frequency.exponentialRampToValueAtTime(2200, t + 0.4); }
  };

  return {
    get on() { return on; },
    toggle() {
      on = !on;
      try { localStorage.setItem(KEY, on ? '1' : '0'); } catch (e) { /* storage blocked */ }
      if (on) ac();
      return on;
    },
    play(name) {
      if (!on) return;
      try { const c = ac(); if (c && sounds[name]) sounds[name](c, c.currentTime + 0.01); } catch (e) { /* audio unavailable */ }
    }
  };
})();
