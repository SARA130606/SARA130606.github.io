/* Opening scenes, played on the item in the focus view when the visitor presses "Open it".
   Each one animates the package's own SVG parts (caps, lids, the pouch) plus a few
   throwaway particles, then resolves so the page can wipe in.
   Coordinates are in each SVG's viewBox units; particles are placed in percentages of it. */
window.OPENERS = (() => {
  const NS = 'http://www.w3.org/2000/svg';
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const rand = (a, b) => a + Math.random() * (b - a);

  function vb(svg) { const [, , w, h] = svg.getAttribute('viewBox').split(/\s+/).map(Number); return { w, h }; }

  // Lets an SVG part be transformed around a point given in viewBox units.
  function pivot(node, x, y) {
    node.style.transformBox = 'view-box';
    node.style.transformOrigin = `${x}px ${y}px`;
    return node;
  }

  // An absolutely positioned layer over the item, for particles that leave the package.
  function layer(item) {
    const fx = document.createElement('div');
    fx.className = 'fx';
    item.appendChild(fx);
    return fx;
  }
  function particle(fx, box, x, y, html, size) {
    const n = document.createElement('span');
    n.className = 'fx-p';
    n.style.left = (x / box.w * 100) + '%';
    n.style.top = (y / box.h * 100) + '%';
    n.style.width = size;
    n.innerHTML = html;
    fx.appendChild(n);
    return n;
  }
  // A thrown particle: keyframes sampled along a parabola (px, px/s, px/s²).
  function arc(node, vx, vy, g, dur, spin, delay = 0) {
    const frames = [];
    for (let i = 0; i <= 8; i++) {
      const t = (i / 8) * dur / 1000;
      frames.push({
        transform: `translate(calc(-50% + ${(vx * t).toFixed(1)}px), calc(-50% + ${(vy * t + .5 * g * t * t).toFixed(1)}px)) rotate(${(spin * t).toFixed(0)}deg)`,
        opacity: i < 6 ? 1 : 1 - (i - 5) / 3
      });
    }
    return node.animate(frames, { duration: dur, delay, easing: 'linear', fill: 'both' });
  }
  function shake(item, dur = 380, amt = 3) {
    return item.animate([
      { translate: '0 0' }, { translate: `${-amt}px 0` }, { translate: `${amt}px 0` },
      { translate: `${-amt * .7}px 0` }, { translate: `${amt * .5}px 0` }, { translate: '0 0' }
    ], { duration: dur, easing: 'ease-in-out' });
  }
  // Two copies of the package cut along a polygon, so it can come apart.
  function split(item, clipA, clipB) {
    const svg = item.querySelector('svg');
    let k = 0;
    const make = (clip) => {
      // Each copy gets its own gradient and clip ids; shared ids would point back at the hidden original.
      const sfx = `_p${++k}${Date.now() % 1e5}`;
      const html = svg.outerHTML
        .replace(/id="([^"]+)"/g, `id="$1${sfx}"`)
        .replace(/url\(#([^)]+)\)/g, `url(#$1${sfx})`)
        .replace(/href="#([^"]+)"/g, `href="#$1${sfx}"`);
      const d = document.createElement('div');
      d.className = 'fx-piece';
      d.style.clipPath = clip;
      d.innerHTML = html;
      d.firstElementChild.style.visibility = 'visible';
      item.appendChild(d);
      return d;
    };
    const a = make(clipA), b = make(clipB);
    svg.style.visibility = 'hidden';
    return [a, b];
  }

  /* B2 · Project Ade: the pouch lifts, tips over the cup and pours; the cup fills. */
  async function cup(item, SND) {
    const svg = item.querySelector('svg');
    const pouch = pivot(svg.querySelector('.pouch'), 101, 79);
    const liquid = svg.querySelector('.cup-liquid');
    const stream = document.createElementNS(NS, 'rect');
    stream.setAttribute('x', '42'); stream.setAttribute('y', '20');
    stream.setAttribute('width', '3.2'); stream.setAttribute('height', '112'); stream.setAttribute('rx', '1.6');
    stream.setAttribute('fill', liquid.getAttribute('fill'));
    pivot(stream, 43.6, 20);
    stream.style.transform = 'scaleY(0)';
    svg.insertBefore(stream, pouch);
    svg.style.overflow = 'visible';

    pouch.animate([
      { transform: 'none' },
      { transform: 'translate(-2px, -40px) rotate(-30deg)', offset: .45 },
      { transform: 'translate(-5px, -68px) rotate(-120deg)' }
    ], { duration: 650, easing: 'cubic-bezier(.5,0,.3,1)', fill: 'forwards' });
    await wait(560);
    SND.play('pour');
    stream.animate([{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], { duration: 180, easing: 'ease-in', fill: 'forwards' });
    liquid.animate([{ transform: 'none' }, { transform: 'translateY(-86px)' }], { duration: 1100, delay: 120, easing: 'cubic-bezier(.3,0,.4,1)', fill: 'forwards' });
    await wait(1150);
    stream.animate([{ transform: 'scaleY(1) translateY(0)', opacity: 1 }, { transform: 'scaleY(.2) translateY(100px)', opacity: 0 }], { duration: 220, fill: 'forwards' });
    await wait(240);
  }

  /* A2 · Edu-Soda: shake, tab cracks open, a column of fizz and bubbles. */
  async function soda(item, SND) {
    const svg = item.querySelector('svg');
    const box = vb(svg);
    const tab = pivot(svg.querySelector('.pull-tab'), 38, 6);
    shake(item, 360, 3);
    await wait(320);
    tab.animate([{ transform: 'none' }, { transform: 'rotate(-55deg)' }], { duration: 160, easing: 'ease-out', fill: 'forwards' });
    SND.play('fizz');
    svg.classList.add('fizzing');
    const fx = layer(item);
    // spray: quick droplets out of the mouth
    for (let i = 0; i < 34; i++) {
      const s = rand(5, 12);
      const n = particle(fx, box, rand(30, 50), 5, `<i class="drop" style="width:${s}px;height:${s}px"></i>`, s + 'px');
      arc(n, rand(-160, 160), rand(-680, -360), 1100, rand(700, 1000), 0, rand(0, 420));
    }
    // bubbles: slower, drifting rings that pop near the top
    for (let i = 0; i < 34; i++) {
      const s = rand(8, 24);
      const n = particle(fx, box, rand(14, 66), rand(10, 60), `<i class="bubble" style="width:${s}px;height:${s}px"></i>`, s + 'px');
      const dx = rand(-50, 50), rise = rand(160, 320);
      n.animate([
        { transform: 'translate(-50%, -50%) scale(.3)', opacity: 0 },
        { transform: `translate(calc(-50% + ${dx * .4}px), calc(-50% - ${rise * .4}px)) scale(1)`, opacity: 1, offset: .35 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% - ${rise}px)) scale(1.25)`, opacity: 0 }
      ], { duration: rand(800, 1200), delay: rand(0, 500), easing: 'ease-out', fill: 'both' });
    }
    await wait(1250);
  }

  /* B1 · Experience Chips: the bag puffs up, the top rips off, chips burst everywhere. */
  async function chips(item, SND) {
    const svg = item.querySelector('svg');
    const box = vb(svg);
    svg.querySelector('.tear-guide')?.setAttribute('opacity', '1');
    item.animate([{ scale: '1 1' }, { scale: '1.06 .97' }, { scale: '.98 1.02' }, { scale: '1.07 .96' }],
      { duration: 420, easing: 'ease-in-out', fill: 'forwards' });
    await wait(420);
    SND.play('rip');
    // a ragged tear just under the top seal
    let edge = '';
    for (let i = 0; i <= 12; i++) edge += `${(i / 12 * 100).toFixed(1)}% ${(15.5 + (i % 2 ? 1.6 : -1.2)).toFixed(1)}%, `;
    const edgeBack = edge.split(', ').filter(Boolean).reverse().join(', ');
    const [top, body] = split(item, `polygon(0 -20%, 100% -20%, ${edgeBack}, 0 16%)`, `polygon(${edge.slice(0, -2)}, 100% 120%, 0 120%)`);
    top.animate([{ transform: 'none' }, { transform: 'translate(38%, -60%) rotate(32deg)', opacity: 0 }],
      { duration: 700, easing: 'cubic-bezier(.2,.7,.4,1)', fill: 'forwards' });
    body.animate([{ transform: 'none' }, { transform: 'translateY(3%)' }, { transform: 'none' }], { duration: 300 });
    const fx = layer(item);
    const chip = (c) => `<svg viewBox="0 0 20 16"><path d="M1 8 Q3 2 10 2 Q18 3 19 9 Q15 15 7 14 Q1 13 1 8Z" fill="${c}" stroke="#9a5a00" stroke-width="1"/><path d="M6 7 q3 -2 6 0 M7 10 q3 -2 6 0" stroke="#d48a00" stroke-width=".8" fill="none"/></svg>`;
    const cols = ['#ffd860', '#ffe58a', '#ffcc3d'];
    for (let i = 0; i < 42; i++) {
      const s = rand(16, 36);
      const n = particle(fx, box, rand(15, 95), 18, chip(cols[i % 3]), s + 'px');
      arc(n, rand(-380, 380), rand(-720, -260), 1300, rand(950, 1350), rand(-600, 600), rand(0, 220));
    }
    await wait(1100);
  }

  /* B3 · Leader Ramyeon: the lid peels back from the tab and steam rolls out. */
  async function ramyeon(item, SND) {
    const svg = item.querySelector('svg');
    const box = vb(svg);
    svg.style.overflow = 'visible';
    const lid = pivot(svg.querySelector('.lid'), 6, 22);
    SND.play('rip');
    lid.animate([
      { transform: 'none' },
      { transform: 'rotate(-12deg)', offset: .35 },
      { transform: 'translate(-6px, -14px) rotate(-62deg)' }
    ], { duration: 650, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' });
    await wait(380);
    SND.play('whoosh');
    const fx = layer(item);
    const wisp = '<svg viewBox="0 0 20 60"><path d="M10 58 C2 48 18 40 10 30 C2 20 18 12 10 2" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/></svg>';
    for (let i = 0; i < 9; i++) {
      const s = rand(14, 22);
      const n = particle(fx, box, rand(28, 82), 16, wisp, s + '%');
      n.classList.add('steam');
      n.animate([
        { transform: 'translate(-50%, -60%) scale(.6, .5)', opacity: 0 },
        { transform: `translate(calc(-50% + ${rand(-8, 8)}px), -110%) scale(1, 1)`, opacity: .75, offset: .4 },
        { transform: `translate(calc(-50% + ${rand(-20, 20)}px), -190%) scale(1.3, 1.2)`, opacity: 0 }
      ], { duration: rand(1100, 1500), delay: i * 110, easing: 'ease-out', fill: 'both' });
    }
    await wait(1450);
  }

  // Shared by the two bottles: the cap twists, then pops off.
  async function twistCap(svg, cx, cy) {
    svg.style.overflow = 'visible';
    const cap = pivot(svg.querySelector('.cap'), cx, cy);
    await cap.animate([
      { transform: 'none' }, { transform: 'scaleX(.7)' }, { transform: 'scaleX(1) translateY(-2px)' },
      { transform: 'scaleX(.7) translateY(-3px)' }, { transform: 'scaleX(1) translateY(-4px)' }
    ], { duration: 420, easing: 'linear', fill: 'forwards' }).finished;
    cap.animate([{ transform: 'translateY(-4px)' }, { transform: 'translate(14px, -70px) rotate(220deg)', opacity: 0 }],
      { duration: 650, easing: 'cubic-bezier(.2,.7,.4,1)', fill: 'forwards' });
  }

  /* A1 · Sara Milk: cap off, a splash of milk. */
  async function milk(item, SND) {
    const svg = item.querySelector('svg');
    const box = vb(svg);
    await twistCap(svg, 40, 11);
    SND.play('pour');
    const fx = layer(item);
    for (let i = 0; i < 18; i++) {
      const s = rand(8, 15);
      const n = particle(fx, box, rand(33, 47), 14, `<i class="drop milk" style="width:${s}px;height:${s}px"></i>`, s + 'px');
      arc(n, rand(-140, 140), rand(-420, -220), 1100, rand(700, 950), 0, rand(0, 120));
    }
    await wait(900);
  }

  /* A3 · Skill 500: cap off with a fizz. */
  async function tonic(item, SND) {
    const svg = item.querySelector('svg');
    const box = vb(svg);
    shake(item, 300, 2);
    await wait(260);
    await twistCap(svg, 28, 14);
    SND.play('fizz');
    const fx = layer(item);
    for (let i = 0; i < 24; i++) {
      const s = rand(9, 20);
      const n = particle(fx, box, rand(20, 36), 20, `<i class="bubble amber" style="width:${s}px;height:${s}px"></i>`, s + 'px');
      n.animate([
        { transform: 'translate(-50%, -50%) scale(.4)', opacity: 0 },
        { transform: `translate(calc(-50% + ${rand(-40, 40)}px), calc(-50% - ${rand(120, 220)}px)) scale(1.2)`, opacity: 0 }
      ], { duration: rand(700, 1000), delay: rand(0, 300), easing: 'ease-out', fill: 'both' });
    }
    await wait(950);
  }

  /* C1 · Honor Stix: a shake and the sticks slide up out of the box. */
  async function stix(item, SND) {
    const svg = item.querySelector('svg');
    svg.style.overflow = 'visible';
    const sticks = [16, 24, 32, 40].map((x, i) => {
      const g = document.createElementNS(NS, 'g');
      g.innerHTML = `<rect x="${x - 2.6}" y="12" width="5.2" height="52" rx="2.6" fill="#e9c27a" stroke="#1a1d24" stroke-width=".7"/><rect x="${x - 2.8}" y="12" width="5.6" height="34" rx="2.8" fill="#5a2e17" stroke="#1a1d24" stroke-width=".7"/>`;
      svg.insertBefore(g, svg.firstChild);
      return [g, i];
    });
    sticks.forEach(([g], i) => pivot(g, 16 + i * 8, 64));
    shake(item, 320, 2.5);
    await wait(260);
    SND.play('rip');
    sticks.forEach(([g, i]) => g.animate([{ transform: 'none' }, { transform: `translateY(${-30 - (i % 2) * 10}px) rotate(${(i - 1.5) * 4}deg)` }],
      { duration: 520, delay: i * 90, easing: 'cubic-bezier(.34,1.56,.64,1)', fill: 'forwards' }));
    await wait(1000);
  }

  /* C2 · Hello Kimbap: pull strip 1 down, the wrapper halves slide apart (2, 3). */
  async function kimbap(item, SND) {
    const svg = item.querySelector('svg');
    const box = vb(svg);
    SND.play('rip');
    svg.querySelectorAll('.strip').forEach((n) => n.animate([{ transform: 'none' }, { transform: 'translateY(90px)', opacity: 0 }],
      { duration: 480, easing: 'cubic-bezier(.5,0,.6,1)', fill: 'forwards' }));
    await wait(500);
    const reveal = document.createElement('div');
    reveal.className = 'fx-piece';
    reveal.innerHTML = `<svg viewBox="0 0 110 100"><path d="M49 9 Q55 4 61 9 L101 80 Q104 90 95 90 L15 90 Q6 90 9 80Z" fill="#fbf8f0" stroke="#1a1d24" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M22 62 L88 62 L101 80 Q104 90 95 90 L15 90 Q6 90 9 80Z" fill="#1d3a2a" stroke="#1a1d24" stroke-width="1.4" stroke-linejoin="round"/>
      <g fill="#e9e2d0"><ellipse cx="44" cy="30" rx="2.2" ry="1.2"/><ellipse cx="60" cy="42" rx="2.2" ry="1.2"/><ellipse cx="52" cy="22" rx="1.8" ry="1"/><ellipse cx="38" cy="50" rx="2.2" ry="1.2"/><ellipse cx="70" cy="54" rx="2.2" ry="1.2"/></g>
      <path d="M44 48 q11 -6 22 0 q-11 8 -22 0Z" fill="#e8a33d" opacity=".8"/></svg>`;
    item.insertBefore(reveal, item.firstChild.nextSibling);
    reveal.animate([{ opacity: 0, transform: 'scale(.92)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: 'ease-out', fill: 'both' });
    const [left, right] = split(item, 'polygon(-20% -20%, 50% -20%, 50% 120%, -20% 120%)', 'polygon(50% -20%, 120% -20%, 120% 120%, 50% 120%)');
    SND.play('rip');
    left.animate([{ transform: 'none' }, { transform: 'translate(-28%, 6%) rotate(-14deg)', opacity: .0 }], { duration: 700, easing: 'cubic-bezier(.3,.6,.4,1)', fill: 'forwards' });
    right.animate([{ transform: 'none' }, { transform: 'translate(28%, 6%) rotate(14deg)', opacity: .0 }], { duration: 700, easing: 'cubic-bezier(.3,.6,.4,1)', fill: 'forwards' });
    const fx = layer(item);
    for (let i = 0; i < 14; i++) {
      const n = particle(fx, box, rand(40, 70), rand(30, 60), '<i class="grain"></i>', '7px');
      arc(n, rand(-200, 200), rand(-360, -160), 1000, rand(650, 900), rand(-300, 300), rand(0, 100));
    }
    await wait(800);
  }

  const SCENES = { cup, soda, chips, ramyeon, milk, tonic, stix, kimbap };

  return {
    // Resolves when the scene has played far enough for the page to wipe in.
    play(key, item, SND, reduced) {
      if (reduced || !SCENES[key]) return Promise.resolve();
      return SCENES[key](item, SND).catch(() => {});
    },
    // Undo everything a scene added, so the item can be shown again later.
    reset(item) {
      item.querySelectorAll('.fx, .fx-piece').forEach((n) => n.remove());
      item.getAnimations({ subtree: true }).forEach((a) => a.cancel());
    }
  };
})();
