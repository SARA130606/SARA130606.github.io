/* Sara's Vending: state machine, keypad, drop physics, focus view and pages.
   States: idle -> vending -> tray -> focus -> opening -> page -> closing -> idle
   (plus "guestbook", entered from idle, tray or a page). Every handler checks the
   state first, so mashing keys mid-animation can never jam the machine.
   Picking an item takes one click: it vends, drops, and rises into the focus view;
   one more click opens its page. */
(() => {
  'use strict';

  const C = window.SITE_CONTENT;
  const ART = window.ASSETS;
  const SND = window.SOUND;
  const $ = (id) => document.getElementById(id);
  const reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  const reduced = () => reduceMQ.matches;
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const isPlaceholder = (s) => /^\s*\[.*\]\s*$/.test(String(s || ''));
  const txt = (s) => isPlaceholder(s) ? `<span class="placeholder">${esc(s)}</span>` : esc(s);

  /* ---------- Products: slot code, artwork and the page each one opens ----------
     h = height on the shelf in container units; rest = angle it lies at in the tray;
     color = the package's own colour, used for the opening wipe. */
  const PRODUCTS = [
    { code: 'A1', key: 'milk', section: 'about',      art: ART.milk,    aspect: 80 / 120,  h: 22, rest: 84,  sound: 'pour',  color: '#F2DC86' },
    { code: 'A2', key: 'soda', section: 'education',  art: ART.soda,    aspect: 80 / 150,  h: 25, rest: 90,  sound: 'fizz',  color: '#EF3F7E' },
    { code: 'A3', key: 'chips', section: 'experience', art: ART.chips,   aspect: 110 / 150, h: 25, rest: -86, sound: 'rip',   color: '#2B78E4' },
    { code: 'B1', key: 'cup', section: 'projects',   art: ART.cup,     aspect: 130 / 140, h: 21, rest: 0,   sound: 'pour',  color: '#F5C232' },
    { code: 'B2', key: 'tonic', section: 'skills',     art: ART.tonic,   aspect: 56 / 130,  h: 24, rest: -90, sound: 'fizz',  color: '#8A4213' },
    { code: 'B3', key: 'ramyeon', section: 'leadership', art: ART.ramyeon, aspect: 110 / 104, h: 17, rest: 0,   sound: 'rip',   color: '#C92A1F' },
    { code: 'C1', key: 'stix', section: 'honors',     art: ART.stix,    aspect: 64 / 140,  h: 25, rest: 90,  sound: 'rip',   color: '#E2B54A' },
    { code: 'C2', key: 'kimbap', section: 'contact',    art: ART.kimbap,  aspect: 110 / 100, h: 17, rest: 0,   sound: 'rip',   color: '#2F5A40' }
  ];
  const IMG = C.images || {};
  PRODUCTS.forEach((p) => {
    p.label = C[p.section].label;
    // A dropped-in image replaces the drawn package everywhere (shelf, drop, tray, focus, page).
    const src = IMG[p.section];
    if (src) p.art = () => `<img class="pkg pkg-img" src="${esc(src)}" alt="${esc(p.label.name)}" draggable="false">`;
  });
  if (IMG.background) {
    const bd = document.querySelector('.backdrop');
    bd.classList.add('has-photo');
    bd.style.setProperty('--photo', `url("${String(IMG.background).replace(/"/g, '%22')}")`);
  }
  const byCode = Object.fromEntries(PRODUCTS.map((p) => [p.code, p]));
  const bySection = Object.fromEntries(PRODUCTS.map((p) => [p.section, p]));
  const WANT = C.wanted;

  const el = {
    machine: $('machine'), glass: $('glass'), shelves: $('shelves'),
    readout: $('readout'), rMain: $('readout-main'), rSub: $('readout-sub'),
    keypad: $('keypad'), tray: $('tray'), chamber: $('tray-chamber'), flap: $('tray-flap'),
    coin: $('coin-slot'), soundBtn: $('sound-toggle'), soundLabel: $('sound-label'),
    focus: $('focus'), focusBackdrop: $('focus-backdrop'), focusItem: $('focus-item'), focusTitle: $('focus-title'),
    focusCode: $('focus-code'), focusHint: $('focus-hint'), focusOpen: $('focus-open'), focusBack: $('focus-back'),
    wipe: $('wipe'), page: $('page'), pageInner: $('page-inner'), returnBtn: $('return-btn'),
    gb: $('guestbook'), gbForm: $('gb-form'), gbList: $('gb-list'), gbError: $('gb-error'),
    machineSection: $('machine-section')
  };

  /* ---------- State ---------- */
  let state = 'idle';
  let buffer = '';
  let landed = null;        // { p, facing, w, h }
  let current = null;       // product whose page is open
  let stateBeforeGuestbook = 'idle';
  let afterStateChange = null;   // set by the rain loop further down
  // While an overlay is up, everything behind it is inert: no tabbing out of the dialog.
  const behind = [$('hero'), $('resume')];
  function setState(s) {
    state = s;
    document.body.dataset.state = s;
    const covered = !['idle', 'vending', 'tray'].includes(s);
    behind.forEach((n) => { if (n) n.inert = covered; });
    el.page.inert = s === 'guestbook';
    if (afterStateChange) afterStateChange();
  }
  setState('idle');

  /* ---------- Intro ---------- */
  const full = C.owner.fullName || C.owner.name;
  // "Pick a flavor. / MEET SARA." (the Figma headline); the full name stays in the top bar
  $('intro-name').innerHTML = `<span class="t1">Pick a flavor.</span> <span class="t2">Meet ${esc(C.owner.name)}.</span>`;
  document.querySelector('.brand').firstChild.textContent = full + ' ';
  $('intro-tagline').innerHTML = txt(C.owner.headline);
  $('intro-facts').innerHTML = (C.owner.facts || []).map((f) => `<li>${txt(f)}</li>`).join('');
  $('topnav').innerHTML = C.owner.links.filter((l) => /^https?:\/\//.test(l.url))
    .map((l) => `<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a>`).join('');
  $('sign-en').textContent = C.machine.signEnglish;
  $('sign-ko').textContent = C.machine.signSide;
  // Shortcuts for visitors who want the résumé, not the ritual: they scroll to the résumé below the machine.
  $('quick-links').innerHTML = ['about', 'education', 'experience', 'projects', 'contact']
    .map((s) => `<a href="#${s}">${esc(C[s].title)}</a>`).join('');
  const clock = $('seoul-time');
  function tickClock() {
    try {
      clock.textContent = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Seoul', hour: '2-digit', minute: '2-digit' }).format(new Date());
    } catch (e) { clock.textContent = ''; }
  }
  tickClock(); setInterval(tickClock, 15000);
  // Centre the whole machine, roof sign included; if it can't fit, keep the sign at the top edge.
  function scrollToMachine(smooth) {
    const top = document.querySelector('.topsign').getBoundingClientRect().top;
    const total = el.machine.getBoundingClientRect().bottom - top;
    scrollTo({ top: scrollY + top - Math.max(8, (innerHeight - total) / 2), behavior: smooth && !reduced() ? 'smooth' : 'auto' });
  }
  const toMachine = () => scrollToMachine(true);
  // Wide screens already show the machine beside the intro, so the button heads for the résumé instead.
  const wideMQ = window.matchMedia('(min-width: 1200px) and (min-height: 640px)');
  $('enter-btn').addEventListener('click', () => {
    SND.play('whoosh');
    if (wideMQ.matches) $('resume').scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth' });
    else toMachine();
  });

  /* ---------- Shelves: three rows of three, each slot a different product ---------- */
  const rows = ['A', 'B', 'C'];
  const tagFor = {};
  rows.forEach((letter) => {
    const shelf = document.createElement('div');
    shelf.className = 'shelf';
    const row = document.createElement('div');
    row.className = 'row';
    const rail = document.createElement('div');
    rail.className = 'rail';
    [1, 2, 3].forEach((n) => {
      const code = letter + n;
      const p = byCode[code];
      const tag = document.createElement('span');
      tag.className = 'tag';
      if (p) {
        row.insertAdjacentHTML('beforeend',
          `<button class="product" type="button" data-code="${code}" aria-label="${code}, ${esc(p.label.name)}: opens ${esc(C[p.section].title)}">
             <span class="slot" style="--w:${(p.h * p.aspect).toFixed(2)}cqi">
               <span class="backstock" aria-hidden="true">${p.art()}</span>
               <span class="facing">${p.art()}</span>
               <span class="coil" aria-hidden="true"></span>
             </span>
           </button>`);
        p.button = row.lastElementChild;
        p.facing = p.button.querySelector('.facing');
        tag.innerHTML = `<span class="code">${code}</span><span class="name">${esc(p.label.short)}</span>`;
        p.tag = tag;
      } else if (code === WANT.code) {
        row.insertAdjacentHTML('beforeend',
          `<button class="product product-wanted" type="button" data-code="${code}" aria-label="${code}, ${esc(WANT.name)}: out of stock">
             <span class="wanted-sign"><span class="wanted-title">${esc(WANT.name)}</span><span class="wanted-stamp">SOLD OUT</span><span class="wanted-note">${esc(WANT.sign)}</span></span>
           </button>`);
        tag.innerHTML = `<span class="code">${code}</span><span class="name">Sold out</span>`;
      }
      tagFor[code] = tag;
      rail.appendChild(tag);
    });
    shelf.append(row, rail);
    el.shelves.appendChild(shelf);
  });
  const wantedBtn = el.shelves.querySelector('.product-wanted');

  el.shelves.addEventListener('click', (e) => {
    const b = e.target.closest('.product');
    if (!b) return;
    if (state !== 'idle') { nudgeBusy(); return; }
    buffer = '';
    const code = b.dataset.code;
    if (byCode[code]) { show(code, '', 'ok'); vend(code); }
    else outOfStock(code, true);
  });
  // Hovering a slot previews it on the readout and lights its price tag.
  function preview(code) {
    if (code) showPicked(code);
    Object.values(tagFor).forEach((t) => t.classList.toggle('is-hot', !!code && t === tagFor[code]));
    if (state !== 'idle' || buffer) return;
    if (!code) { idleReadout(); return; }
    const p = byCode[code];
    if (p) show(`${code} ${p.label.name.toUpperCase()}`, `${p.label.price} · ${C[p.section].title.toUpperCase()}`);
    else show(`${code} SUMMER '27 INTERN`, 'SOLD OUT');
  }
  // The card beside the machine (wide screens) shows the last slot you pointed at.
  let pickedCode = 'B1';
  function showPicked(code) {
    pickedCode = code;
    const p = byCode[code];
    $('picked-code').textContent = code;
    if (p) {
      $('picked-label').textContent = `${p.label.short} · ${p.label.name} · ${p.label.price}`;
      $('picked-title').textContent = C[p.section].title;
      $('picked-intro').innerHTML = txt(C[p.section].intro);
      $('picked-open').firstChild.textContent = 'Vend it ';
    } else {
      $('picked-label').textContent = 'Sold out';
      $('picked-title').textContent = WANT.name;
      $('picked-intro').textContent = WANT.sign;
      $('picked-open').firstChild.textContent = 'Try it ';
    }
  }
  showPicked(pickedCode);
  $('picked-open').addEventListener('click', () => {
    if (state !== 'idle') { nudgeBusy(); return; }
    buffer = '';
    if (byCode[pickedCode]) { SND.play('beep'); show(pickedCode, '', 'ok'); vend(pickedCode); }
    else outOfStock(pickedCode, true);
  });
  el.shelves.addEventListener('pointerover', (e) => { const b = e.target.closest('.product'); preview(b ? b.dataset.code : null); });
  el.shelves.addEventListener('pointerleave', () => preview(null));
  el.shelves.addEventListener('focusin', (e) => { const b = e.target.closest('.product'); if (b) preview(b.dataset.code); });
  el.shelves.addEventListener('focusout', () => preview(null));

  /* ---------- Readout ---------- */
  let flashTimer = 0;
  function show(main, sub = '', cls = '') {
    el.rMain.textContent = main;
    if (typeof sub === 'string') el.rSub.textContent = sub; else { el.rSub.textContent = ''; el.rSub.appendChild(sub); }
    el.readout.className = 'readout' + (cls ? ' ' + cls : '');
  }
  function idleReadout() { show('SELECT ITEM', 'A1 – C3 · OR TAP ONE'); }
  function flash(main, sub, cls, then) {
    clearTimeout(flashTimer);
    show(main, sub, cls);
    flashTimer = setTimeout(then || (() => { if (state === 'idle') idleReadout(); }), 1600);
  }
  function pixels() {
    const s = document.createElement('span');
    s.className = 'pixels';
    s.innerHTML = '<i></i>'.repeat(6);
    return s;
  }
  function nudgeBusy() {
    if (state === 'tray') openFocus();
  }
  idleReadout();

  /* ---------- Keypad ---------- */
  function press(key) {
    const btn = el.keypad.querySelector(`[data-key="${key}"]`);
    if (btn) { btn.classList.add('pressed'); setTimeout(() => btn.classList.remove('pressed'), 120); }
    if (state !== 'idle') { nudgeBusy(); return; }
    SND.play('beep');
    clearTimeout(flashTimer);
    if (key === 'CLR') { buffer = ''; idleReadout(); return; }
    if (/^[A-Z]$/.test(key)) { buffer = key; show(`${key} _`, 'NOW A NUMBER', 'input'); return; }
    if (!buffer) { SND.play('error'); flash('PICK A ROW', 'PRESS A, B OR C', 'err'); return; }
    const code = buffer + key;
    buffer = '';
    if (byCode[code]) { show(code, '', 'ok'); vend(code); }
    else outOfStock(code, code === WANT.code);
  }

  function outOfStock(code, isWanted) {
    SND.play('error');
    if (isWanted) {
      const shelf = wantedBtn;
      shelf.classList.remove('denied'); void shelf.offsetWidth; shelf.classList.add('denied');
      flash('ERROR: OUT OF STOCK', WANT.readout, 'err');
      // let the buzz and the red readout land, then offer the coin
      setTimeout(openReserve, reduced() ? 0 : 650);
    } else {
      flash('ERROR: OUT OF STOCK', `NO ITEM AT ${code}`, 'err');
    }
  }
  el.keypad.addEventListener('click', (e) => {
    const b = e.target.closest('[data-key]');
    if (b) press(b.dataset.key);
  });

  /* ---------- Vend + drop physics ---------- */
  function vend(code) {
    if (state !== 'idle') return;
    const p = byCode[code];
    setState('vending');
    preview(null);
    SND.play('select');
    const facing = p.facing;
    // On short screens, bring the tray into view so the landing is visible.
    const tr = el.tray.getBoundingClientRect();
    if (tr.bottom > innerHeight) scrollBy({ top: tr.bottom - innerHeight + 16, behavior: reduced() ? 'auto' : 'smooth' });
    show('PROCESSING', pixels(), 'ok');
    const coil = facing.parentElement.querySelector('.coil');
    setTimeout(() => {
      show('VENDING', pixels(), 'ok');
      SND.play('whirr');
      if (coil && !reduced()) { coil.classList.remove('spin'); void coil.offsetWidth; coil.classList.add('spin'); }
      drop(p, facing);
    }, reduced() ? 0 : 480);
  }

  function rel(r, base) {
    return { left: r.left - base.left, top: r.top - base.top, right: r.right - base.left,
      bottom: r.bottom - base.top, width: r.width, height: r.height };
  }

  function drop(p, facing) {
    const m = el.machine.getBoundingClientRect();
    const fr = rel(facing.getBoundingClientRect(), m);
    const gr = rel(el.glass.getBoundingClientRect(), m);
    const cr = rel(el.chamber.getBoundingClientRect(), m);
    const w = fr.width, h = fr.height;
    const inset = 6;

    const faller = document.createElement('div');
    faller.className = 'faller';
    faller.style.width = w + 'px';
    faller.innerHTML = p.art();
    el.machine.appendChild(faller);
    facing.classList.add('taken');

    let x = fr.left + w / 2, y = fr.top + h / 2, vx = 0, vy = 0, ang = 0, av = 0, scale = 1, sv = 0;
    const place = () => { faller.style.transform = `translate(${x - w / 2}px, ${y - h / 2}px) rotate(${ang}deg) scale(${scale})`; };
    const extents = (a) => {
      const r = a * Math.PI / 180, c = Math.abs(Math.cos(r)), s = Math.abs(Math.sin(r));
      return { hx: (w * c + h * s) / 2, hy: (w * s + h * c) / 2 };
    };
    const floor = cr.bottom - inset;
    const restSpot = () => {
      const e = extents(p.rest);
      return { x: Math.min(Math.max(x, cr.left + inset + e.hx), cr.right - inset - e.hx), y: floor - e.hy };
    };
    place();

    if (reduced()) {
      const r = restSpot(); x = r.x; y = r.y; ang = p.rest; place();
      impact(); finish();
      return;
    }

    const g = 2300 * Math.max(.6, m.height / 760);   // gravity in px/s², scaled to the machine
    let phase = 'push', tPush = 0, hits = 0, flapped = false, last = performance.now(), elapsed = 0;

    // Fixed-size substeps keep the fall identical on 30, 60 and 120 Hz screens.
    function step(now) {
      let frame = Math.min((now - last) / 1000, .1);
      last = now;
      while (frame > 0) {
        const dt = Math.min(frame, 1 / 120);
        frame -= dt;
        if (tick(dt)) return;
      }
      place();
      requestAnimationFrame(step);
    }

    function tick(dt) {
      elapsed += dt;

      if (phase === 'push') {
        // The coil turns and nudges the item forward: a quick spring on scale with a wobble.
        tPush += dt;
        sv += ((1.12 - scale) * 420 - sv * 14) * dt;
        scale += sv * dt;
        ang = Math.sin(tPush * 38) * 3 * (1 - tPush / .36);
        if (tPush >= .36) {
          phase = 'fall';
          const target = (cr.left + cr.right) / 2;
          vx = (target - x) * .9 + (Math.random() - .5) * 120;
          vy = -90;
          av = (Math.random() < .5 ? -1 : 1) * (160 + Math.random() * 160);
        }
      } else {
        // Gravity, a little air drag, and a soft pull toward the item's resting angle.
        vy += g * dt;
        vx *= 1 - .4 * dt;
        av += ((p.rest - ang) * 5 - av * 1.2) * dt;
        x += vx * dt; y += vy * dt; ang += av * dt;
        scale += (1 - scale) * Math.min(1, dt * 10);

        const e = extents(ang);
        const inGlass = y < gr.bottom;
        const L = (inGlass ? gr.left : cr.left) + inset, R = (inGlass ? gr.right : cr.right) - inset;
        if (x - e.hx < L) { x = L + e.hx; vx = Math.abs(vx) * .55 + 40; av += 220; SND.play('tick'); }
        if (x + e.hx > R) { x = R - e.hx; vx = -Math.abs(vx) * .55 - 40; av -= 220; SND.play('tick'); }
        if (!flapped && y + e.hy > cr.top) { flapped = true; el.flap.classList.remove('swing'); void el.flap.offsetWidth; el.flap.classList.add('swing'); }
        if (y + e.hy > floor) {
          y = floor - e.hy;
          if (hits === 0) impact();
          hits++;
          vy = -Math.abs(vy) * .34;
          vx *= .6; av *= .5;
          if (Math.abs(vy) < 110 || hits > 4) { settle(); return true; }
        }
        if (elapsed > 4) { settle(); return true; }   // safety net: never leave an item hanging
      }
      return false;
    }

    function settle() {
      const r = restSpot();
      const from = faller.style.transform;
      x = r.x; y = r.y; ang = p.rest; scale = 1; place();
      faller.animate([{ transform: from }, { transform: faller.style.transform }],
        { duration: 240, easing: 'cubic-bezier(.34,1.56,.64,1)' }).onfinish = finish;
    }

    function finish() {
      // Hand the item over to the tray chamber, positioned in percentages so it survives resizes.
      const c = rel(el.chamber.getBoundingClientRect(), el.machine.getBoundingClientRect());
      const item = document.createElement('span');
      item.className = 'tray-item';
      item.innerHTML = p.art();
      item.style.width = (w / c.width * 100) + '%';
      item.style.left = ((x - c.left) / c.width * 100) + '%';
      item.style.top = ((y - c.top) / c.height * 100) + '%';
      item.style.setProperty('--rot', p.rest + 'deg');
      el.chamber.appendChild(item);
      faller.remove();
      landed = { p, facing, w, h };
      el.tray.classList.add('has-item');
      el.chamber.disabled = false;
      el.chamber.setAttribute('aria-label', `Open the ${p.label.name} in the tray`);
      setState('tray');
      show('THANK YOU', 'TAKE YOUR ITEM', 'ok');
      // Take it out for them: the item rises straight into the focus view.
      setTimeout(openFocus, reduced() ? 0 : 380);
    }

    requestAnimationFrame((t) => { last = t; requestAnimationFrame(step); });
  }

  function impact() {
    SND.play('clunk');
    if (reduced()) return;
    el.machine.classList.remove('shake');
    void el.machine.offsetWidth;
    el.machine.classList.add('shake');
  }
  el.machine.addEventListener('animationend', (e) => { if (e.target === el.machine) el.machine.classList.remove('shake'); });

  /* ---------- Focus view: the item up close, with one clear action ---------- */
  function focusWidth(p) {
    // Size by height so a squat cup and a tall bottle look equally present.
    const hRem = 18, hVh = 52;
    return `min(80vw, calc(${hRem}rem * ${p.aspect.toFixed(3)}), calc(${hVh}svh * ${p.aspect.toFixed(3)}))`;
  }
  function openFocus() {
    if (state !== 'tray' || !landed) return;
    const p = landed.p;
    setState('focus');
    const trayItem = el.chamber.querySelector('.tray-item');
    const from = trayItem.getBoundingClientRect();
    el.focusItem.innerHTML = p.art();
    el.focusItem.style.width = focusWidth(p);
    el.focusCode.innerHTML = `<b>${p.code}</b>${esc(p.label.name)} · ${esc(p.label.price)}`;
    el.focusTitle.textContent = C[p.section].title;
    el.focusHint.innerHTML = txt(C[p.section].intro);
    el.focus.hidden = false;
    document.body.classList.add('locked');
    trayItem.style.visibility = 'hidden';
    SND.play('whoosh');

    const to = el.focusItem.getBoundingClientRect();
    const dx = (from.left + from.width / 2) - (to.left + to.width / 2);
    const dy = (from.top + from.height / 2) - (to.top + to.height / 2);
    const s = landed.w / to.width;
    const dur = reduced() ? 1 : 650;
    el.focusItem.animate(
      [{ transform: `translate(${dx}px, ${dy}px) rotate(${p.rest}deg) scale(${s})` }, { transform: 'rotate(-4deg)' }],
      { duration: dur, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'forwards' });
    el.focusBackdrop.animate([{ opacity: 0 }, { opacity: 1 }], { duration: dur * .6, easing: 'ease-out' });
    el.focus.querySelector('.focus-text').animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }],
      { duration: reduced() ? 1 : 420, delay: reduced() ? 0 : 260, fill: 'backwards', easing: 'cubic-bezier(.16,1,.3,1)' });
    setTimeout(() => el.focusOpen.focus({ preventScroll: true }), reduced() ? 0 : 420);
  }
  el.chamber.addEventListener('click', openFocus);

  function closeFocus() {
    if (state !== 'focus') return;
    setState('closing');
    const trayItem = el.chamber.querySelector('.tray-item');
    const to = trayItem.getBoundingClientRect();
    const from = el.focusItem.getBoundingClientRect();
    const dx = (to.left + to.width / 2) - (from.left + from.width / 2);
    const dy = (to.top + to.height / 2) - (from.top + from.height / 2);
    const s = landed.w / el.focusItem.offsetWidth;
    const dur = reduced() ? 1 : 420;
    el.focusBackdrop.animate([{ opacity: 1 }, { opacity: 0 }], { duration: dur, fill: 'forwards' });
    el.focus.querySelector('.focus-text').animate([{ opacity: 1 }, { opacity: 0 }], { duration: dur * .5, fill: 'forwards' });
    el.focusItem.animate([{ transform: 'rotate(-4deg)' }, { transform: `translate(${dx}px, ${dy}px) rotate(${landed.p.rest}deg) scale(${s})` }],
      { duration: dur, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'forwards' }).onfinish = () => {
      el.focus.hidden = true;
      el.focus.querySelectorAll('*').forEach((n) => n.getAnimations().forEach((a) => a.cancel()));
      el.focusBackdrop.getAnimations().forEach((a) => a.cancel());
      trayItem.style.visibility = '';
      document.body.classList.remove('locked');
      setState('tray');
      show('IN THE TRAY', 'TAP IT TO OPEN', 'ok');
      el.chamber.focus({ preventScroll: true });
    };
  }
  el.focusBack.addEventListener('click', closeFocus);
  el.focusBackdrop.addEventListener('click', closeFocus);
  // "Open it": the item plays its own opening scene (pour, fizz, rip, steam...), then the page wipes in.
  el.focusOpen.addEventListener('click', async () => {
    if (state !== 'focus' || !landed) return;
    const p = landed.p;
    setState('unwrapping');
    el.focus.querySelector('.focus-text').animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: 'forwards' });
    await window.OPENERS.play(p.key, el.focusItem, SND, reduced());
    const r = el.focusItem.getBoundingClientRect();
    openPage(p, r.left + r.width / 2, r.top + r.height / 2);
  });

  /* ---------- Opening: the package's own colour floods out from it, then the page ---------- */
  // Each open page gets a history entry, so the browser's Back button closes it instead of leaving the site.
  function remember(p, replace) {
    try {
      const entry = [{ cvsPage: p.code }, '', '#' + p.section];
      if (replace) history.replaceState(...entry); else history.pushState(...entry);
    } catch (e) { /* history blocked (sandboxed preview): Back just won't close pages */ }
  }
  function requestClose() {
    if (history.state && history.state.cvsPage) history.back();   // popstate closes it
    else returnToMachine();
  }
  addEventListener('popstate', () => {
    if (state === 'guestbook' && stateBeforeGuestbook === 'page') closeGuestbook();
    if (state === 'page') returnToMachine();
  });

  function openPage(p, cx, cy) {
    if (!['focus', 'idle', 'page', 'unwrapping'].includes(state)) return;
    const from = state;
    setState('opening');
    current = p;
    remember(p, from === 'page' && history.state && history.state.cvsPage);
    if (from !== 'unwrapping') SND.play(p.sound);
    const R = Math.hypot(Math.max(cx, innerWidth - cx), Math.max(cy, innerHeight - cy)) + 20;
    el.wipe.style.background = p.color;
    el.wipe.style.opacity = '1';
    const dur = reduced() ? 1 : 620;
    el.wipe.animate([{ clipPath: `circle(0px at ${cx}px ${cy}px)` }, { clipPath: `circle(${R}px at ${cx}px ${cy}px)` }],
      { duration: dur, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'forwards' }).onfinish = () => {
      renderPage(p);
      if (from === 'focus' || from === 'unwrapping') {
        el.focus.hidden = true;
        window.OPENERS.reset(el.focusItem);
        el.focus.querySelectorAll('*').forEach((n) => n.getAnimations().forEach((a) => a.cancel()));
        clearTray();
      }
      el.page.hidden = false;
      el.page.scrollTop = 0;
      document.body.classList.add('locked');
      setState('page');
      el.wipe.animate([{ opacity: 1 }, { opacity: 0 }], { duration: reduced() ? 1 : 420, easing: 'ease-out', fill: 'forwards' }).onfinish = () => {
        el.wipe.getAnimations().forEach((a) => a.cancel());
        el.wipe.style.opacity = '0';
      };
      el.page.focus({ preventScroll: true });
    };
  }

  function clearTray() {
    el.chamber.querySelectorAll('.tray-item').forEach((n) => n.remove());
    el.tray.classList.remove('has-item');
    el.chamber.disabled = true;
    el.chamber.setAttribute('aria-label', 'Dispenser tray is empty');
  }

  function restock() {
    if (!landed) return;
    const f = landed.facing;
    f.classList.remove('taken');
    if (!reduced()) { f.classList.add('restock'); f.addEventListener('animationend', () => f.classList.remove('restock'), { once: true }); }
    landed = null;
  }

  /* ---------- Back to the machine ---------- */
  function returnToMachine() {
    if (state !== 'page') return;
    setState('closing');
    SND.play('whoosh');
    const dur = reduced() ? 1 : 340;
    el.page.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(16px)' }],
      { duration: dur, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'forwards' }).onfinish = () => {
      el.page.hidden = true;
      el.page.getAnimations().forEach((a) => a.cancel());
      document.body.classList.remove('locked');
      scrollToMachine(false);
      restock();
      setState('idle');
      idleReadout();
      const btn = current && current.button;
      current = null;
      if (btn) btn.focus({ preventScroll: true });
    };
  }
  el.returnBtn.addEventListener('click', requestClose);

  /* ---------- Page renderers: type-led layouts, a meta column on the left ---------- */
  // Links still waiting for a real URL in content.js are left out rather than shown as "[link]".
  function link(l) {
    if (l && /^https?:\/\//.test(l.url)) return `<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a>`;
    return '';
  }
  const linkRow = (list) => { const h = (list || []).map(link).join(''); return h ? `<div class="links">${h}</div>` : ''; };
  const bullets = (items) => items && items.length ? `<ul>${items.map((b) => `<li>${txt(b)}</li>`).join('')}</ul>` : '';
  const inline = (items) => items && items.length ? `<p class="inline-list">${items.map(txt).join(' / ')}</p>` : '';

  function header(p) {
    const s = C[p.section];
    const wide = p.aspect > .9 ? ' wide' : '';
    return `<header class="page-head">
      <div class="head-text">
        <p class="section-label"><span class="code">${p.code}</span>${esc(p.label.name)} · ${esc(p.label.price)}</p>
        <h2>${esc(s.title)}</h2>
        <p class="lede">${txt(s.intro)}</p>
      </div>
      <div class="head-art${wide}" style="--a:${p.aspect.toFixed(3)}" aria-hidden="true">${p.art()}</div>
    </header>`;
  }

  const RENDER = {
    about(s) {
      return `<section class="about-grid" aria-label="About details">
        <dl class="fact-list">${s.facts.map((f) => `<div><dt>${esc(f.k)}</dt><dd>${txt(f.v)}</dd></div>`).join('')}</dl>
        <div class="about-prose">${s.paragraphs.map((t) => `<p>${txt(t)}</p>`).join('')}</div>
      </section>`;
    },
    education(s) {
      return `<section class="entries" aria-label="Schools">${s.entries.map((e) => `<article class="entry">
        <div class="meta-col"><span class="when">${txt(e.dates)}</span><span>${txt(e.location)}</span></div>
        <div class="entry-body">
          <h3>${txt(e.school)}</h3>
          <p class="org">${txt(e.degree)}</p>
          ${e.details ? `<p>${txt(e.details)}</p>` : ''}
          ${e.courses && e.courses.length ? bullets(e.courses) : ''}
        </div>
      </article>`).join('')}</section>`;
    },
    skills(s) {
      return `<section class="entries" aria-label="Skill groups">${s.groups.map((g) => `<div class="skill-row">
        <h3>${esc(g.group)}</h3>
        <ul class="skill-items">${g.items.map((i) => `<li>${txt(i)}</li>`).join('')}</ul>
      </div>`).join('')}</section>`;
    },
    experience(s) {
      return `<section class="entries" aria-label="Roles">${s.entries.map((e) => `<article class="entry">
        <div class="meta-col"><span class="when">${txt(e.dates)}</span><span>${txt(e.location)}</span></div>
        <div class="entry-body">
          <h3>${txt(e.role)}</h3>
          <p class="org">${txt(e.org)}</p>
          <p>${txt(e.summary)}</p>
          ${bullets(e.bullets)}
          ${inline(e.tags)}
        </div>
      </article>`).join('')}</section>`;
    },
    projects(s) {
      return `<section class="entries" aria-label="Project list">${s.entries.map((e, i) => `<article class="proj">
        <span class="proj-num">${String(i + 1).padStart(2, '0')}</span>
        <div class="entry-body">
          <h3>${txt(e.title)}</h3>
          <p class="org">${e.year ? txt(e.year) + ' · ' : ''}${txt(e.role)}</p>
          <p>${txt(e.summary)}</p>
          ${e.image ? `<figure class="proj-figure"><img src="${esc(e.image)}" alt="${esc(e.title)} screenshot" loading="lazy"></figure>` : ''}
          ${inline(e.stack)}
          ${linkRow(e.links)}
        </div>
      </article>`).join('')}</section>`;
    },
    leadership(s) {
      return `<section class="entries" aria-label="Leadership roles">${s.entries.map((e) => `<article class="entry">
        <div class="meta-col"><span class="when">${txt(e.dates)}</span></div>
        <div class="entry-body">
          <h3>${txt(e.role)}</h3>
          <p class="org">${txt(e.org)}</p>
          <p>${txt(e.summary)}</p>
        </div>
      </article>`).join('')}</section>`;
    },
    honors(s) {
      return `<ul class="honor-list" aria-label="Honors">${s.entries.map((e) =>
        `<li><strong>${txt(e.name)}</strong>${e.note ? `<span>${txt(e.note)}</span>` : ''}</li>`).join('')}</ul>`;
    },
    contact(s) {
      return `<section class="contact-block" aria-label="Contact details">
        <p class="email-big">${esc(C.owner.email)}</p>
        <div class="contact-actions">
          <button class="cta" type="button" data-copy-email>Copy email</button>
          <button class="text-btn" type="button" data-guestbook>Or leave a note in the machine</button>
        </div>
        ${linkRow(C.owner.links)}
        <p class="contact-note">${txt(s.note)}</p>
      </section>`;
    }
  };

  function nextOf(p) { return PRODUCTS[(PRODUCTS.indexOf(p) + 1) % PRODUCTS.length]; }
  function renderPage(p) {
    el.page.setAttribute('aria-label', C[p.section].title);
    const n = nextOf(p);
    el.pageInner.innerHTML = header(p) + RENDER[p.section](C[p.section]) +
      `<footer class="page-next">
        <button class="text-btn" type="button" data-back>Back to the machine</button>
        <button class="next-btn" type="button" data-next="${n.code}"><span class="mono">Next on the shelf · ${n.code}</span><span class="next-name">${esc(C[n.section].title)}</span></button>
      </footer>`;
  }
  el.pageInner.addEventListener('click', (e) => {
    const t = e.target.closest('button');
    if (!t || state !== 'page') return;
    if (t.hasAttribute('data-back')) requestClose();
    else if (t.dataset.next) {
      // Moving along the shelf: restock what was taken, then open the next item.
      restock();
      const r = t.getBoundingClientRect();
      openPage(byCode[t.dataset.next], r.left + r.width / 2, r.top + r.height / 2);
    } else if (t.hasAttribute('data-copy-email')) copyEmail(t, t.closest('.contact-block').querySelector('.email-big'));
    else if (t.hasAttribute('data-guestbook')) openGuestbook();
  });

  /* ---------- The résumé in one scroll, under the machine ---------- */
  // Strongest work first, the person last, then how to get in touch.
  const RESUME_ORDER = ['about', 'education', 'experience', 'projects', 'skills', 'leadership', 'honors', 'contact'];
  $('resume-nav').innerHTML = `<a class="rn-name" href="#resume">${esc(full)}</a><span class="rn-links">${RESUME_ORDER.map((sec) =>
    `<a href="#${sec}" data-sec="${sec}"><span class="code">${bySection[sec].code}</span>${esc(bySection[sec].label.short)}</a>`).join('')}</span>`;
  $('resume-body').innerHTML = RESUME_ORDER.map((sec) => {
    const p = bySection[sec], s = C[sec];
    return `<section class="r-sec" id="${sec}" aria-labelledby="h-${sec}">
      <header class="r-head">
        <p class="section-label"><span class="code">${p.code}</span>${esc(p.label.short)}</p>
        <h2 id="h-${sec}">${esc(s.title)}</h2>
        <p class="lede">${txt(s.intro)}</p>
      </header>
      ${RENDER[sec](s)}
    </section>`;
  }).join('');
  $('resume-body').addEventListener('click', (e) => {
    const t = e.target.closest('button');
    if (!t) return;
    if (t.hasAttribute('data-copy-email')) copyEmail(t, t.closest('.contact-block').querySelector('.email-big'));
    else if (t.hasAttribute('data-guestbook')) openGuestbook();
  });
  // The nav marks the section you're reading.
  const navLinks = Object.fromEntries([...$('resume-nav').querySelectorAll('[data-sec]')].map((a) => [a.dataset.sec, a]));
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((list) => list.forEach((en) => {
      if (!en.isIntersecting) return;
      Object.entries(navLinks).forEach(([k, a]) => a.classList.toggle('is-here', k === en.target.id));
      // on a phone the nav scrolls sideways: keep the current section's link in view
      const a = navLinks[en.target.id], bar = a.parentElement;
      if (bar.scrollWidth > bar.clientWidth) bar.scrollLeft = a.offsetLeft - bar.offsetLeft - 8;
    }), { rootMargin: '-45% 0px -50% 0px' });
    RESUME_ORDER.forEach((sec) => io.observe($(sec)));
  }
  // A shared link like …#projects lands on that section (it didn't exist yet when the browser looked).
  const landing = location.hash.slice(1);
  if (RESUME_ORDER.includes(landing)) {
    const land = () => $(landing).scrollIntoView();
    if (document.readyState === 'complete') requestAnimationFrame(land);   // loaded late (e.g. inside a React app)
    else addEventListener('load', land, { once: true });
  }

  /* ---------- C3: sold out, insert a coin to reserve it ---------- */
  const rs = { box: $('reserve'), coin: $('rs-coin') };
  $('rs-stub').textContent = `${WANT.code} · ${WANT.name.toUpperCase()}`;
  $('rs-title').textContent = WANT.popupTitle;
  $('rs-text').textContent = WANT.popupText;
  function openReserve() {
    if (state !== 'idle') return;
    setState('reserve');
    rs.box.hidden = false;
    document.body.classList.add('locked');
    rs.coin.focus();
  }
  function closeReserve() {
    if (state !== 'reserve') return;
    rs.box.hidden = true;
    document.body.classList.remove('locked');
    setState('idle');
    idleReadout();
    if (wantedBtn) wantedBtn.focus({ preventScroll: true });
  }
  rs.coin.addEventListener('click', () => {
    if (state !== 'reserve') return;
    rs.box.hidden = true;
    document.body.classList.remove('locked');
    setState('idle');
    openGuestbook(true);
  });
  $('rs-close').addEventListener('click', closeReserve);
  $('rs-backdrop').addEventListener('click', closeReserve);

  /* ---------- Guestbook (coin slot) ---------- */
  const GB_KEY = 'cvs-guestbook';
  $('gb-title').textContent = C.guestbook.title;
  $('gb-intro').textContent = C.guestbook.intro;
  $('gb-note').textContent = C.guestbook.storageNote;
  $('gb-contact').innerHTML =
    `<div class="copy-row"><code id="gb-email">${esc(C.owner.email)}</code>
      <button class="copy-btn" id="gb-copy" type="button">Copy</button></div>
     <div class="links">${C.owner.links.map(link).join('')}</div>`;
  function copyEmail(btn, node) {
    const label = btn.textContent;
    const done = (ok) => { btn.textContent = ok ? 'Copied' : 'Selected, press copy'; setTimeout(() => { btn.textContent = label; }, 1800); };
    const select = () => { const r = document.createRange(); r.selectNodeContents(node); const s = getSelection(); s.removeAllRanges(); s.addRange(r); };
    try {
      navigator.clipboard.writeText(C.owner.email).then(() => done(true), () => { select(); done(false); });
    } catch (err) { select(); done(false); }
  }
  $('gb-copy').addEventListener('click', (e) => copyEmail(e.currentTarget, $('gb-email')));

  function loadNotes() { try { return JSON.parse(localStorage.getItem(GB_KEY) || '[]'); } catch (e) { return []; } }
  function renderNotes() {
    const notes = loadNotes();
    el.gbList.innerHTML = notes.slice(-6).reverse().map((n) =>
      `<li><strong>${esc(n.name)}</strong>${esc(n.message)}</li>`).join('');
  }
  // reserving = arrived from the sold-out C3 slot, so the receipt is about the internship
  function openGuestbook(reserving) {
    if (!['idle', 'tray', 'page'].includes(state)) return;
    reserving = reserving === true;
    $('gb-stub').textContent = reserving ? `COIN ACCEPTED · ₩500 · ${WANT.code} RESERVED` : 'COIN ACCEPTED · ₩500';
    $('gb-intro').textContent = reserving ? WANT.noteIntro : C.guestbook.intro;
    stateBeforeGuestbook = state;
    setState('guestbook');
    SND.play('coin');
    const fromMachine = stateBeforeGuestbook !== 'page';
    if (fromMachine) {
      el.coin.classList.remove('inserting'); void el.coin.offsetWidth; el.coin.classList.add('inserting');
      show('COIN ACCEPTED', reserving ? `${WANT.code} RESERVED` : '₩500', 'ok');
    }
    setTimeout(() => {
      renderNotes();
      el.gb.hidden = false;
      document.body.classList.add('locked');
      $('gb-name').focus();
    }, reduced() || !fromMachine ? 0 : 420);
  }
  function closeGuestbook() {
    if (state !== 'guestbook') return;
    el.gb.hidden = true;
    el.coin.classList.remove('inserting');
    setState(stateBeforeGuestbook);
    if (state !== 'page') document.body.classList.remove('locked');
    if (state === 'idle') { idleReadout(); el.coin.focus({ preventScroll: true }); }
    else if (state === 'tray') show('IN THE TRAY', 'TAP IT TO OPEN', 'ok');
  }
  el.coin.addEventListener('click', () => openGuestbook());
  $('gb-close').addEventListener('click', closeGuestbook);
  $('gb-backdrop').addEventListener('click', closeGuestbook);
  el.gbForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('gb-name').value.trim(), message = $('gb-msg').value.trim();
    if (!name || !message) { el.gbError.textContent = 'Add your name and a message first.'; return; }
    el.gbError.textContent = '';
    const notes = loadNotes();
    notes.push({ name, message, at: Date.now() });
    try { localStorage.setItem(GB_KEY, JSON.stringify(notes.slice(-30))); } catch (err) { /* storage blocked: still show it below */ }
    el.gbForm.reset();
    renderNotes();
    if (!el.gbList.children.length) el.gbList.innerHTML = `<li><strong>${esc(name)}</strong>${esc(message)}</li>`;
    SND.play('select');
  });

  /* ---------- Sound toggle ---------- */
  function syncSound() {
    el.soundBtn.setAttribute('aria-pressed', String(SND.on));
    el.soundLabel.textContent = SND.on ? 'Sound on' : 'Sound off';
  }
  el.soundBtn.addEventListener('click', () => { SND.toggle(); syncSound(); SND.play('beep'); });
  syncSound();

  /* ---------- Keyboard ---------- */
  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === 'Escape') {
      if (state === 'guestbook') closeGuestbook();
      else if (state === 'reserve') closeReserve();
      else if (state === 'focus') closeFocus();
      else if (state === 'page') requestClose();
      return;
    }
    if (e.target.closest && e.target.closest('input, textarea, button')) {
      if (!(e.target.closest('.keypad'))) { if (/^[A-Za-z0-9]$/.test(e.key) && e.target.closest('input, textarea')) return; }
    }
    if (state === 'page' || state === 'focus' || state === 'guestbook') return;
    if (!machineInView) return;   // reading the résumé below: letters are just letters
    const k = e.key.toUpperCase();
    if (/^[A-Z0-9]$/.test(k) && (state === 'idle' || state === 'tray')) { press(k); }
    else if ((e.key === 'Backspace' || e.key === 'Delete') && state === 'idle') press('CLR');
  });

  let machineInView = true;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([en]) => { machineInView = en.isIntersecting; }, { threshold: .35 }).observe(el.machine);
  }

  /* ---------- Scroll camera: the street dollies in as you approach the machine ---------- */
  let scrollQueued = false;
  function onScroll() {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(() => {
      scrollQueued = false;
      const p = Math.min(1, Math.max(0, scrollY / Math.max(1, innerHeight * .8)));
      document.documentElement.style.setProperty('--p', p.toFixed(3));
    });
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Sky (stars, moon, skyline) and rain ---------- */
  const sky = $('sky'), rain = $('rain');
  const sctx = sky.getContext('2d'), rctx = rain.getContext('2d');
  let drops = [], W = 0, H = 0, dpr = 1;

  function drawSky() { window.SCENE.paint(sctx, W, H); }

  function resize() {
    W = innerWidth; H = innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, W * H > 2.5e6 ? 1 : 1.5);
    [sky, rain].forEach((c) => { c.width = W * dpr; c.height = H * dpr; });
    sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    rctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawSky();
    const count = Math.round(Math.min(220, (W * H) / 7000) * (reduced() ? .3 : 1));
    drops = Array.from({ length: count }, () => ({ x: Math.random() * W, y: Math.random() * H, l: 10 + Math.random() * 18, v: 600 + Math.random() * 500, a: .12 + Math.random() * .25 }));
  }

  let rainLast = performance.now();
  const ripples = [];
  function rainLoop(now) {
    const dt = Math.max(0, Math.min((now - rainLast) / 1000, .05)); rainLast = now;
    rctx.clearRect(0, 0, W, H);
    // splash rings on the wet pavement
    const gy = H * window.SCENE.GROUND;
    if (!reduced() && ripples.length < 40 && Math.random() < .6) ripples.push({ x: Math.random() * W, y: gy + Math.pow(Math.random(), 1.3) * (H - gy), t: 0 });
    for (let i = ripples.length - 1; i >= 0; i--) {
      const rp = ripples[i]; rp.t += dt;
      if (rp.t > .7) { ripples.splice(i, 1); continue; }
      const k = rp.t / .7, depth = (rp.y - gy) / (H - gy);
      rctx.strokeStyle = `rgba(200, 215, 255, ${(1 - k) * .35})`;
      rctx.beginPath(); rctx.ellipse(rp.x, rp.y, 2 + k * 14 * (.5 + depth), (2 + k * 14 * (.5 + depth)) * .28, 0, 0, Math.PI * 2); rctx.stroke();
    }
    rctx.lineWidth = 1;
    for (const d of drops) {
      if (!reduced()) { d.y += d.v * dt; d.x -= d.v * .12 * dt; }
      if (d.y > H) { d.y = -d.l; d.x = Math.random() * (W + 60); }
      rctx.strokeStyle = `rgba(170, 195, 255, ${d.a})`;
      rctx.beginPath(); rctx.moveTo(d.x, d.y); rctx.lineTo(d.x - d.l * .12, d.y + d.l); rctx.stroke();
    }
    if (!document.hidden && !reduced() && !covered()) requestAnimationFrame(rainLoop);
    else rainOn = false;
  }
  // Nothing animates behind a full-screen page or the guestbook.
  const covered = () => state === 'page' || state === 'guestbook';
  let rainOn = false;
  function startRain() {
    if (rainOn || document.hidden || covered()) return;
    rainOn = true; rainLast = performance.now(); requestAnimationFrame(rainLoop);
  }
  afterStateChange = startRain;
  let resizeTimer = 0;
  addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 120); });
  document.addEventListener('visibilitychange', () => { if (!reduced()) startRain(); });
  resize();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(drawSky);
  startRain();
})();
