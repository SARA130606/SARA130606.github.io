/* Painted backdrop in a lo-fi anime style: a slate night sky with a warm horizon,
   a hazy skyline, utility poles with sagging wires, a glowing convenience store
   on the left, and wet asphalt that mirrors every light. Drawn once per resize. */
window.SCENE = (() => {
  const GROUND = 0.8;           // horizon of the pavement, as a fraction of height

  function rng(seed) { return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }

  function glow(c, x, y, r, color, alpha = 1) {
    const g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color); g.addColorStop(1, 'rgba(0,0,0,0)');
    c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = alpha;
    c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); c.restore();
  }

  // Anime cloud: lumpy top, flat bottom, dark above and lit pink from the city below.
  function cloud(c, x, y, w, r, top, lit) {
    const h = w * 0.22;
    const g = c.createLinearGradient(0, y - h, 0, y);
    g.addColorStop(0, top); g.addColorStop(0.6, top); g.addColorStop(1, lit);
    c.save();
    c.beginPath(); c.rect(x - w * 0.2, y - h * 2, w * 1.4, h * 2); c.clip();   // flat underside
    c.fillStyle = g;
    c.beginPath();
    const n = 14;
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      const lift = Math.sin(t * Math.PI);
      const pr = w * (0.035 + r() * 0.05) * (0.6 + lift * 0.8);
      const px = x + t * w + (r() - 0.5) * w * 0.04;
      const py = y - pr * 0.3 - lift * h * (0.35 + r() * 0.35);
      c.moveTo(px + pr, py); c.arc(px, py, pr, 0, Math.PI * 2);
    }
    c.fill();
    c.restore();
  }

  function pole(c, x, top, bottom, w, color) {
    c.fillStyle = color;
    c.fillRect(x - w / 2, top, w, bottom - top);
    c.fillRect(x - w * 5, top + w * 3, w * 10, w * 0.9);       // crossarms
    c.fillRect(x - w * 4, top + w * 6, w * 8, w * 0.8);
    c.fillRect(x - w * 1.8, top + (bottom - top) * 0.32, w * 3.6, w * 4.5); // transformer
    for (let i = -4; i <= 4; i += 2) c.fillRect(x + i * w - w * 0.25, top + w * 2.2, w * 0.5, w * 0.9);
  }

  function wire(c, x1, y1, x2, y2, sag, color, width) {
    c.strokeStyle = color; c.lineWidth = width;
    c.beginPath(); c.moveTo(x1, y1);
    c.quadraticCurveTo((x1 + x2) / 2, Math.max(y1, y2) + sag, x2, y2);
    c.stroke();
  }

  function paint(c, W, H) {
    const r = rng(11);
    const gy = H * GROUND;
    const u = Math.min(W, H) / 900;                  // unit scale

    /* --- Sky --- */
    const sky = c.createLinearGradient(0, 0, 0, gy);
    sky.addColorStop(0, '#080a1e'); sky.addColorStop(0.35, '#16184a');
    sky.addColorStop(0.62, '#2a3880'); sky.addColorStop(0.84, '#3d9fb8'); sky.addColorStop(1, '#ef7aa8');
    c.fillStyle = sky; c.fillRect(0, 0, W, gy);

    // stars, a few with a soft cross sparkle
    for (let i = 0; i < (W * H) / 3600; i++) {
      const x = r() * W, y = Math.pow(r(), 1.6) * gy * 0.7, s = r() * 1.3 + 0.3;
      c.globalAlpha = (0.3 + r() * 0.7) * (1 - y / (gy * 0.75));
      c.fillStyle = r() > 0.85 ? '#f3dcae' : '#e9e4d6';
      c.fillRect(x, y, s, s);
    }
    c.globalAlpha = 1;
    // moon with halo
    const mx = W * 0.8, my = H * 0.12, mr = Math.max(14, 30 * u);
    glow(c, mx, my, mr * 2.2, 'rgba(200,240,255,.18)');
    c.save();
    c.beginPath(); c.rect(mx - mr * 2, my - mr * 2, mr * 4, mr * 4);
    c.arc(mx + mr * 0.42, my - mr * 0.22, mr * 0.9, 0, Math.PI * 2, true);
    c.clip('evenodd');
    c.fillStyle = '#f6e27a';
    c.beginPath(); c.arc(mx, my, mr, 0, Math.PI * 2); c.fill();
    c.restore();

    // clouds: a high wisp and banks near the horizon lit from the city
    cloud(c, W * 0.04, H * 0.2, W * 0.26, r, '#15173c', '#2f3a7c');
    cloud(c, W * 0.55, H * 0.27, W * 0.3, r, '#171a42', '#34418a');
    cloud(c, -W * 0.05, gy * 0.72, W * 0.4, r, '#26306a', '#62c8d8');
    cloud(c, W * 0.38, gy * 0.76, W * 0.34, r, '#2a3270', '#ee86b4');
    cloud(c, W * 0.72, gy * 0.7, W * 0.4, r, '#26306a', '#6fd2e0');

    /* --- Skyline --- */
    const haze = c.createLinearGradient(0, gy * 0.7, 0, gy);
    haze.addColorStop(0, 'rgba(232,163,61,0)'); haze.addColorStop(1, 'rgba(232,163,61,.22)');
    for (let layer = 0; layer < 3; layer++) {
      const base = gy, col = ['#2f3874', '#1d2250', '#10122e'][layer];
      let x = -30;
      while (x < W + 30) {
        const bw = (24 + r() * 60) * (1 + layer * 0.3) * Math.max(0.7, u);
        const bh = ((60 + r() * 140) * (1 - layer * 0.18)) * (H / 900);
        const top = base - bh - layer * 4;
        c.fillStyle = col; c.fillRect(x, top, bw, base - top);
        if (r() > 0.7) { c.fillRect(x + bw * 0.4, top - 14 * u, 2, 14 * u); if (layer === 2) { c.fillStyle = '#ee4d8a'; c.fillRect(x + bw * 0.4 - 1.5, top - 15 * u, 3, 3); c.fillStyle = col; }; }
        if (layer > 0) {
          for (let wy = top + 6; wy < base - 6; wy += 7 + layer * 2) for (let wx = x + 4; wx < x + bw - 4; wx += 6 + layer * 2) {
            if (r() > 0.8) { c.fillStyle = r() > 0.25 ? 'rgba(130,225,240,.8)' : 'rgba(240,140,190,.6)'; c.fillRect(wx, wy, 2 + layer, 2 + layer); c.fillStyle = col; }
          }
        }
        x += bw + r() * 6;
      }
      if (layer === 0) { c.fillStyle = haze; c.fillRect(0, gy * 0.7, W, gy * 0.3); }
    }
    c.fillStyle = haze; c.fillRect(0, gy * 0.82, W, gy * 0.18);

    /* --- Railing in front of the city --- */
    const ry = gy - 34 * u;
    c.fillStyle = 'rgba(200,205,200,.4)';
    c.fillRect(0, ry, W, 4 * u); c.fillRect(0, ry + 14 * u, W, 2 * u);
    for (let x = 6; x < W; x += 26 * u) c.fillRect(x, ry, 3 * u, gy - ry);
    c.fillStyle = 'rgba(10,14,18,.6)'; c.fillRect(0, ry + 4 * u, W, 1.5 * u);

    /* --- Tree on the far left: dark foliage with a cool rim light --- */
    const tx = W * 0.03, ttop = H * 0.26;
    c.fillStyle = '#080920'; c.fillRect(tx - 6 * u, ttop + 60 * u, 12 * u, gy - ttop - 60 * u);
    const clumps = [];
    for (let i = 0; i < 26; i++) clumps.push([tx + (r() - 0.45) * 220 * u, ttop + r() * 260 * u, (22 + r() * 30) * u]);
    c.fillStyle = 'rgba(150,170,170,.22)';
    for (const [x, y, rr] of clumps) { c.beginPath(); c.arc(x + 2 * u, y - 3 * u, rr, 0, Math.PI * 2); c.fill(); }
    c.fillStyle = '#080920';
    for (const [x, y, rr] of clumps) { c.beginPath(); c.arc(x, y, rr, 0, Math.PI * 2); c.fill(); }

    /* --- Store --- */
    const sw = W * 0.4, sx = W * 1.02 - sw, st = H * 0.38, sb = gy;
    const wall = c.createLinearGradient(sx, 0, sx + sw, 0);
    wall.addColorStop(0, '#1a1c44'); wall.addColorStop(1, '#232659');
    c.fillStyle = '#0d0e26'; c.fillRect(sx, st - H * 0.05, sw + 10, H * 0.06); // roof slab
    c.fillStyle = wall; c.fillRect(sx, st, sw, sb - st);
    c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(sx, st, 8 * u, sb - st); // cel shadow edge

    // sign board
    const sgY = st + (sb - st) * 0.04, sgH = (sb - st) * 0.15;
    c.fillStyle = '#ee4d8a'; c.fillRect(sx + sw * 0.06, sgY, sw * 0.88, sgH);
    c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(sx + sw * 0.06, sgY + sgH * 0.86, sw * 0.88, sgH * 0.14);
    c.save();
    c.font = `700 ${Math.round(sgH * 0.55)}px "IBM Plex Sans KR", "Apple SD Gothic Neo", sans-serif`;
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = '#efe7d6';
    c.fillText('24 / 7  MART', sx + sw * 0.5, sgY + sgH * 0.54);
    c.restore();

    // awning stripe
    const awY = sgY + sgH + 4 * u, awH = (sb - st) * 0.06;
    for (let i = 0; i < 18; i++) {
      c.fillStyle = i % 2 ? '#e9fbff' : '#4fc4d4';
      c.fillRect(sx + sw * 0.04 + (sw * 0.92 / 18) * i, awY, sw * 0.92 / 18 + 1, awH);
    }
    c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(sx + sw * 0.04, awY + awH * 0.7, sw * 0.92, awH * 0.3);

    // glowing windows with blurred shelves
    const wy = awY + awH + 8 * u, wh = sb - wy - 6 * u;
    const panes = [[0.05, 0.36], [0.43, 0.2], [0.65, 0.3]];
    panes.forEach(([fx, fw], i) => {
      const px = sx + sw * fx, pw = sw * fw;
      const wg = c.createLinearGradient(0, wy, 0, wy + wh);
      wg.addColorStop(0, '#effdff'); wg.addColorStop(1, '#8fe0ec');
      c.fillStyle = wg; c.fillRect(px, wy, pw, wh);
      if (i !== 1) {
        c.save(); c.beginPath(); c.rect(px, wy, pw, wh); c.clip();
        c.filter = `blur(${Math.max(1, 1.6 * u)}px)`;
        for (let row = 0; row < 4; row++) {
          const ry = wy + wh * (0.18 + row * 0.22);
          c.fillStyle = 'rgba(120,90,70,.45)'; c.fillRect(px, ry + wh * 0.1, pw, 3 * u);
          for (let k = px + 3; k < px + pw - 3; k += 5 * u + r() * 5 * u) {
            const cols = ['rgba(214,69,47,.55)', 'rgba(70,120,160,.5)', 'rgba(232,163,61,.6)', 'rgba(80,140,100,.5)'];
            c.fillStyle = cols[Math.floor(r() * 4)];
            const ph = wh * (0.06 + r() * 0.05);
            c.fillRect(k, ry + wh * 0.1 - ph, 4 * u, ph);
          }
        }
        c.filter = 'none';
        c.restore();
        // poster
        c.fillStyle = i === 0 ? '#ee4d8a' : '#5a2fd1';
        c.fillRect(px + pw * 0.08, wy + wh * 0.62, pw * 0.22, wh * 0.26);
        c.fillStyle = '#fff'; c.font = `900 ${Math.round(wh * 0.09)}px "Unbounded", sans-serif`; c.textAlign = 'center';
        c.fillText(i === 0 ? '1+1' : '2+1', px + pw * 0.19, wy + wh * 0.8);
      } else {
        c.fillStyle = 'rgba(30,36,40,.5)'; c.fillRect(px + pw / 2 - 1, wy, 2, wh);  // door split
        c.fillStyle = 'rgba(255,255,255,.5)'; c.fillRect(px + pw * 0.08, wy + wh * 0.1, pw * 0.08, wh * 0.8);
      }
      c.strokeStyle = '#11181d'; c.lineWidth = 3 * u; c.strokeRect(px, wy, pw, wh);
      glow(c, px + pw / 2, wy + wh / 2, Math.max(pw, wh) * 0.9, 'rgba(120,220,235,.22)');
    });

    /* --- Utility poles and wires --- */
    const pw = Math.max(5, 9 * u);
    pole(c, W * 0.14, H * 0.08, gy + 4, pw, '#070818');
    pole(c, W * 0.42, H * 0.16, gy - H * 0.02, pw * 0.6, 'rgba(12,16,20,.85)');
    for (let k = 0; k < 3; k++) {
      const y1 = H * 0.08 + pw * (3 + k * 1.4), y2 = H * 0.16 + pw * 0.6 * (3 + k * 1.4);
      wire(c, W * 0.14, y1, W * 0.42, y2, 30 * u + k * 6 * u, 'rgba(6,9,12,.9)', 1.4);
      wire(c, W * 0.42, y2, W + 20, H * 0.24 + k * 10 * u, 40 * u, 'rgba(6,9,12,.8)', 1.2);
      wire(c, W * 0.14, y1, -20, H * 0.06 + k * 8 * u, 18 * u, 'rgba(6,9,12,.9)', 1.4);
    }

    /* --- Street lamp --- */
    const lx = W * 0.58, lt = H * 0.3;
    c.fillStyle = '#090d11'; c.fillRect(lx - 3 * u, lt, 6 * u, gy - lt);
    c.fillRect(lx - 34 * u, lt, 36 * u, 5 * u);
    c.fillStyle = '#ffe4a8'; c.fillRect(lx - 40 * u, lt + 4 * u, 16 * u, 6 * u);
    glow(c, lx - 32 * u, lt + 8 * u, 60 * u, 'rgba(130,225,240,.3)');
    const cone = c.createLinearGradient(0, lt, 0, gy);
    cone.addColorStop(0, 'rgba(255,210,140,.22)'); cone.addColorStop(1, 'rgba(255,210,140,0)');
    c.fillStyle = cone; c.beginPath();
    c.moveTo(lx - 38 * u, lt + 8 * u); c.lineTo(lx - 140 * u, gy); c.lineTo(lx + 70 * u, gy); c.lineTo(lx - 26 * u, lt + 8 * u); c.fill();

    /* --- Wet pavement --- */
    const road = c.createLinearGradient(0, gy, 0, H);
    road.addColorStop(0, '#1d2050'); road.addColorStop(1, '#0a0b1c');
    c.fillStyle = road; c.fillRect(0, gy, W, H - gy);
    c.fillStyle = '#4fc4d4'; c.fillRect(0, gy, W, 2);                 // curb highlight
    // paving tiles in perspective, converging on a point above the street
    c.strokeStyle = 'rgba(5,8,10,.55)'; c.lineWidth = 1.5;
    c.beginPath();
    for (let k = 0, y = gy + 6 * u; y < H; k++, y += (8 + k * 7) * u) { c.moveTo(0, y); c.lineTo(W, y); }
    const vx = W * 0.5, vy = gy - H * 0.35;
    for (let x = -W; x < W * 2; x += 90 * u) { const t = (gy - vy) / (H - vy); c.moveTo(vx + (x - vx) * t, gy); c.lineTo(x, H); }
    c.stroke();
    // reflections: vertical smears of each light source
    const refl = [
      [sx + sw * 0.23, sw * 0.34, 'rgba(255,220,170,.35)'], [sx + sw * 0.53, sw * 0.18, 'rgba(255,230,190,.4)'],
      [sx + sw * 0.8, sw * 0.28, 'rgba(255,220,170,.3)'], [sx + sw * 0.5, sw * 0.7, 'rgba(214,69,47,.08)'],
      [lx - 32 * u, 40 * u, 'rgba(255,200,120,.35)'], [mx, 30 * u, 'rgba(255,240,210,.12)'],
      [W * 0.5, W * 0.3, 'rgba(239,231,214,.08)']
    ];
    c.save(); c.globalCompositeOperation = 'lighter';
    for (const [x, w, col] of refl) {
      const g = c.createLinearGradient(0, gy, 0, H);
      g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = g;
      for (let i = 0; i < 7; i++) {
        const ox = (r() - 0.5) * w * 0.5;
        c.globalAlpha = 0.15 + r() * 0.25;
        c.fillRect(x - w / 2 + ox, gy + 2, w * (0.5 + r() * 0.5), (H - gy) * (0.6 + r() * 0.4));
      }
    }
    c.restore();
    // ripple streaks
    c.strokeStyle = 'rgba(220,215,200,.07)'; c.lineWidth = 1;
    for (let i = 0; i < 60; i++) {
      const y = gy + Math.pow(r(), 1.4) * (H - gy), x = r() * W, l = (20 + r() * 80) * u;
      c.beginPath(); c.moveTo(x, y); c.lineTo(x + l, y); c.stroke();
    }

    /* --- Foreground foliage silhouettes with a pink rim light --- */
    const bush = (bx, by, s) => {
      c.fillStyle = '#07060f';
      c.beginPath();
      for (let i = 0; i < 9; i++) { const a = r() * Math.PI, rr = s * (0.35 + r() * 0.4); c.moveTo(bx + Math.cos(a) * s * 0.8 + rr, by - Math.sin(a) * s * 0.5); c.arc(bx + Math.cos(a) * s * 0.8, by - Math.sin(a) * s * 0.5, rr, 0, Math.PI * 2); }
      c.fill();
    };

    // soft vignette
    const v = c.createLinearGradient(0, 0, 0, H);
    v.addColorStop(0, 'rgba(8,11,14,.35)'); v.addColorStop(.3, 'rgba(8,11,14,0)'); v.addColorStop(.85, 'rgba(8,11,14,0)'); v.addColorStop(1, 'rgba(8,11,14,.5)');
    c.fillStyle = v; c.fillRect(0, 0, W, H);
  }

  return { paint, GROUND };
})();
