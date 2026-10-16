/* Package artwork, drawn in the style of illustrated CVS packaging: bold
   outlined wordmarks, small print (nutrition panels, volumes, stickers), cel
   shading and a moving gloss glint. Each call returns a fresh SVG string with
   unique ids so a package can appear on the shelf, in the tray and in the
   focus view at the same time. */
window.ASSETS = (() => {
  let n = 0;
  const uid = (p) => `${p}${++n}`;
  const LINE = '#1a1d24';

  // Zigzag edge for the chip bag's crimped seals (always an even tooth count).
  function zig(x0, x1, y, amp, step, dir) {
    const n = 2 * Math.round(Math.abs(x1 - x0) / (2 * step));
    let d = '';
    for (let i = 1; i <= n; i++) {
      const x = x0 + ((x1 - x0) * i) / n;
      d += ` L${x.toFixed(1)} ${i % 2 ? y - amp * dir : y}`;
    }
    return d;
  }

  // A tiny nutrition-facts panel: a heading bar and ruled lines.
  function facts(x, y, w, h, color) {
    let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#ffffff" opacity=".92" stroke="${color}" stroke-width=".4"/>`;
    s += `<rect x="${x + 1}" y="${y + 1}" width="${w - 2}" height="2.2" fill="${color}"/>`;
    for (let yy = y + 5; yy < y + h - 1; yy += 1.9) {
      s += `<rect x="${x + 1}" y="${yy}" width="${((w - 2) * (0.5 + ((yy * 7) % 5) / 10)).toFixed(2)}" height=".55" fill="${color}" opacity=".7"/>`;
    }
    return s;
  }

  // Moving gloss highlight, clipped to the package shape.
  const glint = (clip, h) =>
    `<g clip-path="url(#${clip})"><rect class="glint" x="-40" y="-10" width="9" height="${h + 20}" fill="#ffffff" opacity=".55" transform="skewX(-18)"/></g>`;

  /* A1 · Edu-Soda: white milk-soda can with a pink vertical wordmark panel. */
  function soda() {
    const g = uid('soda');
    const bubbles = [
      [36, 120, 1.2, 3.1, 0], [44, 112, .9, 2.6, .8], [52, 124, 1.5, 3.6, 1.6],
      [40, 104, 1, 2.9, .4], [56, 118, 1.2, 3.3, 2.1], [48, 128, .8, 2.4, 1.2]
    ].map(([x, y, r, d, dl]) =>
      `<circle cx="${x}" cy="${y}" r="${r}" fill="#ffffff" style="--d:${d}s;--dl:-${dl}s"/>`).join('');
    return `<svg class="pkg pkg-soda" viewBox="0 0 80 150" role="img" aria-label="Edu-Soda can">
  <defs>
    <linearGradient id="${g}b" x1="0" x2="1">
      <stop offset="0" stop-color="#d9dcf2"/><stop offset=".22" stop-color="#ffffff"/>
      <stop offset=".6" stop-color="#f3f2fb"/><stop offset="1" stop-color="#b8bbe0"/>
    </linearGradient>
    <linearGradient id="${g}m" x1="0" x2="1">
      <stop offset="0" stop-color="#6d7189"/><stop offset=".3" stop-color="#f4f5fa"/>
      <stop offset=".55" stop-color="#b9bccb"/><stop offset="1" stop-color="#5d6178"/>
    </linearGradient>
    <linearGradient id="${g}p" x1="0" x2="1">
      <stop offset="0" stop-color="#ff4d8f"/><stop offset=".6" stop-color="#f0206f"/><stop offset="1" stop-color="#c3105a"/>
    </linearGradient>
    <clipPath id="${g}c"><rect x="7" y="15" width="66" height="124" rx="4"/></clipPath>
  </defs>
  <path d="M9 17 Q11 8 19 6 H61 Q69 8 71 17 Z" fill="url(#${g}m)" stroke="${LINE}" stroke-width="1.2" stroke-linejoin="round"/>
  <ellipse cx="40" cy="6" rx="21.5" ry="3.4" fill="#e7e8f0" stroke="${LINE}" stroke-width="1.1"/>
  <ellipse cx="40" cy="6.2" rx="17" ry="2.3" fill="#c5c7d4"/>
  <g class="pull-tab">
    <path d="M38 5.2 Q44 3 50 5 Q49 7.6 43 7.6 Q39 7.4 38 5.2Z" fill="#a9acbc" stroke="${LINE}" stroke-width=".5"/>
    <ellipse cx="46" cy="5.6" rx="2" ry=".8" fill="#4a4e63"/>
  </g>
  <rect x="7" y="15" width="66" height="124" rx="4" fill="url(#${g}b)"/>
  <g clip-path="url(#${g}c)">
    <rect x="31" y="15" width="31" height="124" fill="url(#${g}p)"/>
    <g class="bubbles">${bubbles}</g>
    <text transform="rotate(-90 46.5 77)" x="46.5" y="84" text-anchor="middle" textLength="108" lengthAdjust="spacingAndGlyphs"
      font-family="Unbounded, Arial Black, sans-serif" font-weight="900" font-size="20" fill="#ffffff" stroke="${LINE}" stroke-width="1.6" paint-order="stroke">EDU SODA</text>
    <text transform="rotate(-90 25 77)" x="25" y="79" text-anchor="middle" textLength="92" lengthAdjust="spacingAndGlyphs"
      font-family="IBM Plex Sans KR, sans-serif" font-weight="700" font-size="6" fill="#e0186a">SWEETENED MILK SODA</text>
    <text transform="rotate(-90 18 77)" x="18" y="79" text-anchor="middle" font-family="IBM Plex Sans KR, sans-serif" font-weight="700" font-size="5" fill="#5b5f86">EDU SODA · MILK FLAVOR</text>
    ${facts(9, 22, 6, 22, '#5b5f86')}
    <text transform="rotate(-90 67 118)" x="67" y="119.5" text-anchor="middle" font-family="DotGothic16, monospace" font-size="4" fill="#ffffff">12 FL OZ (355mL)</text>
    <circle cx="20" cy="117" r="8.5" fill="#d6452f" stroke="${LINE}" stroke-width=".9"/>
    <circle cx="20" cy="117" r="6.6" fill="none" stroke="#ffd9c9" stroke-width=".4" stroke-dasharray="1 .8"/>
    <path d="M20 111.8 l1.2 2.5 2.7.3-2 1.8.6 2.7-2.5-1.4-2.5 1.4.6-2.7-2-1.8 2.7-.3z" fill="#ffd23a"/>
    <text x="20" y="122.3" text-anchor="middle" font-family="Unbounded, sans-serif" font-weight="700" font-size="2.6" fill="#ffffff">DEAN'S LIST</text>
    <rect x="55" y="15" width="18" height="124" fill="#1d2a3a" opacity=".2"/>
    <rect x="63" y="15" width="10" height="124" fill="#1d2a3a" opacity=".14"/>
    <rect x="69.5" y="15" width="1.6" height="124" fill="#ffd0ea" opacity=".9"/>
    <rect x="11" y="15" width="4" height="124" fill="#ffffff" opacity=".9"/>
    ${glint(`${g}c`, 150)}
  </g>
  <rect x="7" y="15" width="66" height="124" rx="4" fill="none" stroke="${LINE}" stroke-width="1.6"/>
  <path d="M7.5 137 H72.5 Q71 146 62 148 H18 Q9 146 7.5 137Z" fill="url(#${g}m)" stroke="${LINE}" stroke-width="1.2" stroke-linejoin="round"/>
</svg>`;
  }

  /* B2 · Experience Chips: blue foil bag, stacked comic wordmark, cheese-yellow letters. */
  function chips() {
    const g = uid('chip');
    const bag = `M6 13${zig(6, 104, 13, 5, 4, 1)} Q111 77 104 140${zig(104, 6, 140, 5, 4, -1)} Q-1 77 6 13Z`;
    let crimp = '';
    for (let x = 8; x <= 102; x += 2.6) crimp += `<line x1="${x.toFixed(1)}" y1="6" x2="${x.toFixed(1)}" y2="20"/><line x1="${x.toFixed(1)}" y1="133" x2="${x.toFixed(1)}" y2="146"/>`;
    const chip = (x, y, r, rot, f) =>
      `<g transform="rotate(${rot} ${x} ${y})"><path d="M${x - r} ${y} Q${x - r * .6} ${y - r * .75} ${x} ${y - r * .7} Q${x + r * .8} ${y - r * .6} ${x + r} ${y + r * .1} Q${x + r * .3} ${y + r * .7} ${x - r * .4} ${y + r * .55} Z" fill="${f}" stroke="#9a5a00" stroke-width=".7"/><path d="M${x - r * .5} ${y - r * .2} q${r * .3} ${-r * .15} ${r * .6} 0 M${x - r * .3} ${y + r * .2} q${r * .3} ${-r * .15} ${r * .6} 0" stroke="#d48a00" stroke-width=".5" fill="none"/></g>`;
    return `<svg class="pkg pkg-chips" viewBox="0 0 110 150" role="img" aria-label="Experience Chips bag">
  <defs>
    <linearGradient id="${g}f" x1="0" x2="1">
      <stop offset="0" stop-color="#0d3a9a"/><stop offset=".2" stop-color="#1f6be0"/>
      <stop offset=".42" stop-color="#5fb4ff"/><stop offset=".55" stop-color="#2f86f0"/>
      <stop offset=".85" stop-color="#1450c0"/><stop offset="1" stop-color="#0b2f86"/>
    </linearGradient>
    <radialGradient id="${g}r" cx=".5" cy=".42" r=".5"><stop offset="0" stop-color="#9ee0ff" stop-opacity=".9"/><stop offset="1" stop-color="#9ee0ff" stop-opacity="0"/></radialGradient>
    <clipPath id="${g}c"><path d="${bag}"/></clipPath>
  </defs>
  <path d="${bag}" fill="url(#${g}f)"/>
  <g clip-path="url(#${g}c)">
    <ellipse cx="55" cy="66" rx="48" ry="40" fill="url(#${g}r)"/>
    <rect x="0" y="0" width="110" height="21" fill="#061a52" opacity=".35"/>
    <rect x="0" y="132" width="110" height="18" fill="#061a52" opacity=".35"/>
    <g stroke="#bfe3ff" stroke-width=".45" opacity=".55">${crimp}</g>
    <text x="55" y="31" text-anchor="middle" font-family="DotGothic16, monospace" font-size="4.6" fill="#d8efff" letter-spacing="1">PREMIUM · CRISPS</text>
    <g transform="rotate(-7 55 60)">
      <text x="57" y="52" text-anchor="middle" textLength="82" lengthAdjust="spacingAndGlyphs" font-family="Unbounded, Arial Black, sans-serif" font-weight="900" font-size="13" fill="#0a1f5c">EXPERIENCE</text>
      <text x="55" y="50" text-anchor="middle" textLength="82" lengthAdjust="spacingAndGlyphs" font-family="Unbounded, Arial Black, sans-serif" font-weight="900" font-size="13" fill="#ffe14a" stroke="#c8102e" stroke-width="2" paint-order="stroke">EXPERIENCE</text>
      <text x="57.5" y="76" text-anchor="middle" textLength="74" lengthAdjust="spacingAndGlyphs" font-family="Unbounded, Arial Black, sans-serif" font-weight="900" font-size="25" fill="#0a1f5c">CHIPS</text>
      <text x="55" y="73.5" text-anchor="middle" textLength="74" lengthAdjust="spacingAndGlyphs" font-family="Unbounded, Arial Black, sans-serif" font-weight="900" font-size="25" fill="#ffe14a" stroke="#c8102e" stroke-width="2.6" paint-order="stroke">CHIPS</text>
      <text x="62" y="88" text-anchor="middle" font-family="Pacifico, Brush Script MT, cursive" font-size="10" fill="#ffffff" stroke="#0a1f5c" stroke-width="1.6" paint-order="stroke">Honey Butter</text>
    </g>
    ${chip(36, 112, 13, -16, '#ffd860')}${chip(70, 114, 14, 14, '#ffe58a')}${chip(53, 104, 12, 4, '#ffcc3d')}
    <path d="M86 92 l3.2 5 5.8-1.6-2.4 5.4 5 3.4-5.8 1.2.4 6-4.6-3.8-4.6 3.8.4-6-5.8-1.2 5-3.4-2.4-5.4 5.8 1.6z" fill="#ff2a3c" stroke="${LINE}" stroke-width=".7"/>
    <text x="86.6" y="106.4" text-anchor="middle" font-family="Unbounded, sans-serif" font-weight="900" font-size="4.4" fill="#ffffff">NEW!</text>
    <text x="55" y="128" text-anchor="middle" font-family="DotGothic16, monospace" font-size="4.4" fill="#d8efff" letter-spacing=".6">NET WT 60g · HONEY BUTTER</text>
    <path d="M76 0 L82 28 L74 58 L84 92 L76 120 L82 150 L112 150 L112 0Z" fill="#05124a" opacity=".28"/>
    <path d="M28 24 L36 38 L25 44Z M84 40 L93 52 L82 58Z M60 118 L70 128 L56 130Z" fill="#05124a" opacity=".3"/>
    <path d="M14 21 L26 21 L16 132 L6 132Z" fill="#ffffff" opacity=".35"/>
    <path d="M30 21 L33 21 L23 132 L20 132Z" fill="#ffffff" opacity=".28"/>
    <path d="M101 24 Q107 77 101 130" stroke="#bfe8ff" stroke-width="1.4" fill="none" opacity=".9"/>
    ${glint(`${g}c`, 150)}
  </g>
  <path d="${bag}" fill="none" stroke="${LINE}" stroke-width="1.6" stroke-linejoin="round"/>
  <g class="tear-guide">
    <line x1="8" y1="24" x2="102" y2="24" stroke="#ffffff" stroke-width="1.1" stroke-dasharray="3 2.2"/>
    <text x="96" y="21.5" text-anchor="end" font-family="DotGothic16, monospace" font-size="4.2" fill="#ffffff" letter-spacing=".6">TEAR HERE ▾</text>
  </g>
</svg>`;
  }

  /* C3 · Project Ice Cup: clear CVS ice cup beside a yellow juice pouch with a red banner. */
  function cup() {
    const g = uid('cup');
    const ice = [
      [16, 112, -12], [36, 116, 8], [24, 96, 18], [44, 98, -6], [18, 78, 4],
      [38, 80, 22], [28, 62, -16], [46, 60, 10], [22, 48, 6]
    ].map(([x, y, r]) =>
      `<g transform="rotate(${r} ${x + 8} ${y + 7})"><rect x="${x}" y="${y}" width="17" height="15" rx="3.5"/><path d="M${x + 3} ${y + 3} h7" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round"/></g>`).join('');
    const pouch = 'M80 26 L116 26 L122 33 L122 128 Q122 132 118 132 L84 132 Q80 132 80 128Z';
    return `<svg class="pkg pkg-cup" viewBox="0 0 130 140" role="img" aria-label="Project Ice Cup with juice pouch">
  <defs>
    <linearGradient id="${g}c" x1="0" x2="1">
      <stop offset="0" stop-color="#d2ebff" stop-opacity=".42"/>
      <stop offset=".45" stop-color="#ffffff" stop-opacity=".12"/>
      <stop offset="1" stop-color="#d2ebff" stop-opacity=".36"/>
    </linearGradient>
    <linearGradient id="${g}p" x1="0" x2="1">
      <stop offset="0" stop-color="#ffcf2a"/><stop offset=".45" stop-color="#ffe372"/><stop offset="1" stop-color="#f2ad00"/>
    </linearGradient>
    <linearGradient id="${g}l" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ff6a4d"/><stop offset=".55" stop-color="#e8a33d"/><stop offset="1" stop-color="#ffd27a"/>
    </linearGradient>
    <clipPath id="${g}i"><path d="M12 42 L68 42 L62 134 L18 134Z"/></clipPath>
    <clipPath id="${g}q"><path d="${pouch}"/></clipPath>
    <path id="${g}arc" d="M84 50 Q101 38 118 50"/>
  </defs>
  <path d="M10 40 L70 40 L63 136 L17 136Z" fill="url(#${g}c)"/>
  <g clip-path="url(#${g}i)">
    <rect class="cup-liquid" x="8" y="136" width="66" height="100" fill="url(#${g}l)" opacity=".85"/>
    <g fill="#e3f6ff" fill-opacity=".45" stroke="#ffffff" stroke-opacity=".85" stroke-width=".8">${ice}</g>
  </g>
  <path d="M10 40 L70 40 L63 136 L17 136Z" fill="none" stroke="${LINE}" stroke-width="1.5" stroke-linejoin="round"/>
  <rect x="7" y="35" width="66" height="7" rx="3.5" fill="#eef6ff" stroke="${LINE}" stroke-width="1.3"/>
  <path d="M17 48 L22 128" stroke="#ffffff" stroke-opacity=".75" stroke-width="2.4" stroke-linecap="round"/>
  <path d="M62 48 L58 128" stroke="#ffffff" stroke-opacity=".3" stroke-width="1.2" stroke-linecap="round"/>
  <rect x="25" y="98" width="30" height="18" rx="3" fill="#00c8e8" stroke="${LINE}" stroke-width=".9"/>
  <text x="40" y="106.5" text-anchor="middle" font-family="Unbounded, Arial Black, sans-serif" font-weight="900" font-size="5.2" fill="#ffffff" stroke="#03505e" stroke-width=".9" paint-order="stroke">ICE CUP</text>
  <text x="40" y="113" text-anchor="middle" font-family="IBM Plex Sans KR, sans-serif" font-weight="700" font-size="4.4" fill="#033a44">ICE CUP · 180g</text>
  <g class="pouch">
    <path d="${pouch}" fill="url(#${g}p)"/>
    <g clip-path="url(#${g}q)">
      <rect x="78" y="24" width="46" height="11" fill="#ffffff" opacity=".45"/>
      <path d="M80 44 Q101 30 122 44 L122 54 Q101 40 80 54Z" fill="#d81b2c" stroke="${LINE}" stroke-width=".6"/>
      <text font-family="IBM Plex Sans KR, sans-serif" font-weight="700" font-size="4.2" fill="#ffffff"><textPath href="#${g}arc" startOffset="50%" text-anchor="middle">Made with Fresh Ideas</textPath></text>
      <text x="101.5" y="70.5" text-anchor="middle" textLength="36" lengthAdjust="spacingAndGlyphs" font-family="Unbounded, Arial Black, sans-serif" font-weight="900" font-size="8.5" fill="#0d6b3a">PROJECT</text>
      <text x="101" y="69.5" text-anchor="middle" textLength="36" lengthAdjust="spacingAndGlyphs" font-family="Unbounded, Arial Black, sans-serif" font-weight="900" font-size="8.5" fill="#e0182c">PROJECT</text>
      <text x="101.5" y="89" text-anchor="middle" textLength="32" lengthAdjust="spacingAndGlyphs" font-family="Unbounded, Arial Black, sans-serif" font-weight="900" font-size="19" fill="#ffffff" stroke="#0d6b3a" stroke-width="2.4" paint-order="stroke">ADE</text>
      <text x="101" y="98" text-anchor="middle" font-family="Pacifico, Brush Script MT, cursive" font-size="6.4" fill="#e0182c">Lime &amp; Berry</text>
      <circle cx="91" cy="113" r="7" fill="#7fd44a" stroke="${LINE}" stroke-width=".6"/>
      <circle cx="91" cy="113" r="5.2" fill="#c8f08a"/>
      <path d="M91 108 V118 M86 113 H96 M87.5 109.5 L94.5 116.5 M94.5 109.5 L87.5 116.5" stroke="#7fd44a" stroke-width=".6"/>
      <circle cx="104" cy="115" r="5" fill="#d81b5c" stroke="${LINE}" stroke-width=".6"/>
      <circle cx="102.6" cy="113.6" r="1.2" fill="#ffffff" opacity=".7"/>
      <text x="114" y="126" text-anchor="middle" font-family="DotGothic16, monospace" font-size="3.8" fill="#6a4300">190mL</text>
      <path d="M109 36 L122 36 L122 132 L109 132Z" fill="#8a4a00" opacity=".22"/>
      <rect x="84" y="38" width="3" height="88" rx="1.5" fill="#ffffff" opacity=".7"/>
      <rect x="119" y="38" width="1.3" height="90" fill="#fff7cc" opacity=".9"/>
      ${glint(`${g}q`, 140)}
    </g>
    <path d="${pouch}" fill="none" stroke="${LINE}" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M114 26 L122 33" stroke="${LINE}" stroke-width=".7" stroke-dasharray="1.5 1"/>
  </g>
</svg>`;
  }

  /* A1 · Sara Milk: squat Korean banana-milk jug with ribbed shoulders and a wrap label. */
  function milk() {
    const g = uid('milk');
    const body = 'M31 25 Q31 33 19 39 Q7 47 8 64 L9 103 Q10 115 23 115 L57 115 Q70 115 71 103 L72 64 Q73 47 61 39 Q49 33 49 25Z';
    let ribs = '';
    for (let y = 44; y <= 58; y += 3.4) ribs += `<path d="M${14 + (58 - y) * .35} ${y} Q40 ${y + 2.2} ${66 - (58 - y) * .35} ${y}" />`;
    return `<svg class="pkg pkg-milk" viewBox="0 0 80 120" role="img" aria-label="Sara Milk jug">
  <defs>
    <linearGradient id="${g}b" x1="0" x2="1">
      <stop offset="0" stop-color="#e9d27a"/><stop offset=".25" stop-color="#fff2b8"/>
      <stop offset=".6" stop-color="#f7e08f"/><stop offset="1" stop-color="#c9ad52"/>
    </linearGradient>
    <linearGradient id="${g}c" x1="0" x2="1"><stop offset="0" stop-color="#b8322a"/><stop offset=".35" stop-color="#ef5a43"/><stop offset="1" stop-color="#9e2a22"/></linearGradient>
    <clipPath id="${g}k"><path d="${body}"/></clipPath>
  </defs>
  <g class="cap"><rect x="28" y="5" width="24" height="12" rx="2.5" fill="url(#${g}c)" stroke="${LINE}" stroke-width="1.2"/>
  <path d="M30 8 V15 M33.5 8 V15 M37 8 V15 M40.5 8 V15 M44 8 V15 M47.5 8 V15" stroke="#7a1d17" stroke-width=".6" opacity=".7"/></g>
  <rect x="27" y="16" width="26" height="4" rx="1" fill="#f3efe4" stroke="${LINE}" stroke-width="1"/>
  <path d="${body}" fill="url(#${g}b)"/>
  <g clip-path="url(#${g}k)">
    <g fill="none" stroke="#b8963a" stroke-width=".8" opacity=".75">${ribs}</g>
    <path d="M6 66 Q40 70 74 66 L74 98 Q40 102 6 98Z" fill="#fffaf0" stroke="${LINE}" stroke-width=".8"/>
    <path d="M6 69 Q40 73 74 69 L74 71.5 Q40 75.5 6 71.5Z" fill="#2f8a4e"/>
    <text x="40" y="87" text-anchor="middle" textLength="46" lengthAdjust="spacingAndGlyphs" font-family="Unbounded, Arial Black, sans-serif" font-weight="900" font-size="13" fill="#e2552f" stroke="${LINE}" stroke-width="1.2" paint-order="stroke">SARA</text>
    <text x="40" y="94.5" text-anchor="middle" font-family="IBM Plex Sans KR, sans-serif" font-weight="700" font-size="5.4" fill="#2f8a4e" letter-spacing=".4">SARA · FRESH MILK</text>
    <text x="40" y="108" text-anchor="middle" font-family="DotGothic16, monospace" font-size="4.2" fill="#7a5a12">ABOUT ME · 240mL</text>
    <path d="M52 30 Q68 40 70 62 L72 112 L62 112 L60 62 Q58 44 50 34Z" fill="#7a5a12" opacity=".18"/>
    <path d="M17 46 Q13 56 13.5 66" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round" fill="none" opacity=".85"/>
    <rect x="13" y="76" width="2.4" height="30" rx="1.2" fill="#ffffff" opacity=".7"/>
    ${glint(`${g}k`, 120)}
  </g>
  <path d="${body}" fill="none" stroke="${LINE}" stroke-width="1.6" stroke-linejoin="round"/>
</svg>`;
  }

  /* A3 · Skill 500: small brown-glass vitamin tonic bottle with a gold cap. */
  function tonic() {
    const g = uid('ton');
    const bottle = 'M20 22 L36 22 L37 34 Q50 38 50 52 L50 118 Q50 125 43 125 L13 125 Q6 125 6 118 L6 52 Q6 38 19 34Z';
    return `<svg class="pkg pkg-tonic" viewBox="0 0 56 130" role="img" aria-label="Skill 500 tonic bottle">
  <defs>
    <linearGradient id="${g}g" x1="0" x2="1">
      <stop offset="0" stop-color="#4a1c06"/><stop offset=".28" stop-color="#a5521a"/>
      <stop offset=".55" stop-color="#7a3a10"/><stop offset="1" stop-color="#3a1504"/>
    </linearGradient>
    <linearGradient id="${g}m" x1="0" x2="1">
      <stop offset="0" stop-color="#8a6a1c"/><stop offset=".35" stop-color="#ffe9a0"/><stop offset=".6" stop-color="#d9b04a"/><stop offset="1" stop-color="#7a5a12"/>
    </linearGradient>
    <clipPath id="${g}k"><path d="${bottle}"/></clipPath>
  </defs>
  <path d="${bottle}" fill="url(#${g}g)"/>
  <g clip-path="url(#${g}k)">
    <rect x="4" y="56" width="48" height="52" fill="#f6f1e4" stroke="${LINE}" stroke-width=".8"/>
    <rect x="4" y="56" width="48" height="7" fill="#1f5fae"/>
    <text x="28" y="61.6" text-anchor="middle" font-family="DotGothic16, monospace" font-size="4.2" fill="#f6f1e4" letter-spacing=".6">VITAMIN C</text>
    <text x="28" y="74" text-anchor="middle" textLength="34" lengthAdjust="spacingAndGlyphs" font-family="Unbounded, Arial Black, sans-serif" font-weight="900" font-size="9" fill="#1f5fae">SKILL</text>
    <text x="28" y="93" text-anchor="middle" textLength="38" lengthAdjust="spacingAndGlyphs" font-family="Unbounded, Arial Black, sans-serif" font-weight="900" font-size="20" fill="#f08a1c" stroke="${LINE}" stroke-width="1.3" paint-order="stroke">500</text>
    <text x="28" y="101" text-anchor="middle" font-family="IBM Plex Sans KR, sans-serif" font-weight="700" font-size="4.6" fill="#1f5fae">SKILL 500 · 100mL</text>
    <path d="M38 22 L40 34 Q52 40 52 54 L52 128 L40 128Z" fill="#000000" opacity=".22"/>
    <rect x="10" y="44" width="2.6" height="70" rx="1.3" fill="#ffd7a8" opacity=".6"/>
    ${glint(`${g}k`, 130)}
  </g>
  <path d="${bottle}" fill="none" stroke="${LINE}" stroke-width="1.5" stroke-linejoin="round"/>
  <g class="cap"><rect x="17" y="5" width="22" height="18" rx="2" fill="url(#${g}m)" stroke="${LINE}" stroke-width="1.2"/>
  <path d="M19.5 8 V20 M22.5 8 V20 M25.5 8 V20 M28.5 8 V20 M31.5 8 V20 M34.5 8 V20 M37 8 V20" stroke="#6a4a0c" stroke-width=".55" opacity=".7"/></g>
</svg>`;
  }

  /* B3 · Leader Ramyeon: red cup noodle with a peel-back foil lid. */
  function ramyeon() {
    const g = uid('ram');
    const cup = 'M7 24 L103 24 L92 96 Q91 99 87 99 L23 99 Q19 99 18 96Z';
    return `<svg class="pkg pkg-ramyeon" viewBox="0 0 110 104" role="img" aria-label="Leader Ramyeon cup noodle">
  <defs>
    <linearGradient id="${g}r" x1="0" x2="1">
      <stop offset="0" stop-color="#8f1a14"/><stop offset=".22" stop-color="#e2382a"/>
      <stop offset=".55" stop-color="#c92a1f"/><stop offset="1" stop-color="#7a140f"/>
    </linearGradient>
    <linearGradient id="${g}f" x1="0" x2="1"><stop offset="0" stop-color="#b9bcc4"/><stop offset=".4" stop-color="#f4f2ec"/><stop offset="1" stop-color="#a7aab3"/></linearGradient>
    <clipPath id="${g}k"><path d="${cup}"/></clipPath>
  </defs>
  <path d="${cup}" fill="url(#${g}r)"/>
  <g clip-path="url(#${g}k)">
    <rect x="0" y="31" width="110" height="9" fill="#1a1d24"/>
    <text x="55" y="37.6" text-anchor="middle" font-family="DotGothic16, monospace" font-size="5" fill="#f4f2ec" letter-spacing="1.2">HOT &amp; SPICY · NOODLE</text>
    <circle cx="34" cy="64" r="17" fill="#f4f2ec" stroke="${LINE}" stroke-width="1.2"/>
    <text x="34" y="69.5" text-anchor="middle" font-family="Unbounded, Arial Black, sans-serif" font-weight="900" font-size="7" fill="#1a1d24">RAMEN</text>
    <text x="74" y="59" text-anchor="middle" textLength="38" lengthAdjust="spacingAndGlyphs" font-family="Unbounded, Arial Black, sans-serif" font-weight="900" font-size="10" fill="#f4f2ec" stroke="${LINE}" stroke-width="1.4" paint-order="stroke">LEADER</text>
    <text x="74" y="69" text-anchor="middle" font-family="Pacifico, Brush Script MT, cursive" font-size="7.5" fill="#ffd27a">Ramyeon</text>
    <path d="M66 76 q3 -5 6 0 q-3 8 -6 0Z M76 77 q3 -5 6 0 q-3 8 -6 0Z" fill="#ffd27a" stroke="${LINE}" stroke-width=".6"/>
    <text x="55" y="92" text-anchor="middle" font-family="DotGothic16, monospace" font-size="4.2" fill="#ffd9c9">LEADERSHIP · 120g</text>
    <path d="M84 24 L103 24 L92 99 L74 99Z" fill="#000000" opacity=".18"/>
    <path d="M14 30 L22 94" stroke="#ffb3a0" stroke-width="2.4" stroke-linecap="round" opacity=".55"/>
    ${glint(`${g}k`, 104)}
  </g>
  <path d="${cup}" fill="none" stroke="${LINE}" stroke-width="1.6" stroke-linejoin="round"/>
  <g class="broth"><ellipse cx="55" cy="22" rx="49" ry="7" fill="#d9822b" stroke="${LINE}" stroke-width="1.2"/>
    <path d="M18 21 q5 -3 10 0 t10 0 t10 0 M50 23 q5 -3 10 0 t10 0 t10 0 M28 25 q4 -2 8 0 t8 0 M62 19 q4 -2 8 0 t8 0" stroke="#f6d77e" stroke-width="1.1" fill="none" stroke-linecap="round"/>
    <circle cx="40" cy="20" r="1.6" fill="#3a7a3a"/><circle cx="70" cy="24" r="1.4" fill="#3a7a3a"/><circle cx="83" cy="21" r="1.2" fill="#c92a1f"/></g>
  <g class="lid">
  <ellipse cx="55" cy="22" rx="51" ry="8" fill="url(#${g}f)" stroke="${LINE}" stroke-width="1.3"/>
  <ellipse cx="55" cy="22" rx="42" ry="5" fill="none" stroke="#c92a1f" stroke-width="1"/>
  <text x="55" y="24.4" text-anchor="middle" font-family="DotGothic16, monospace" font-size="4.4" fill="#c92a1f" letter-spacing=".8">PEEL TO 3 MIN</text>
  <path d="M96 18 Q106 12 108 18 Q106 22 100 22Z" fill="#f4f2ec" stroke="${LINE}" stroke-width="1"/>
  </g>
</svg>`;
  }

  /* C1 · Honor Stix: tall gold biscuit-stick box, sticks shown on the front. */
  function stix() {
    const g = uid('stx');
    let sticks = '';
    [[16, 0], [24, 3], [32, 1], [40, 4]].forEach(([x, d]) => {
      sticks += `<g transform="rotate(-14 ${x} 84)"><rect x="${x - 2.4}" y="${50 + d}" width="4.8" height="56" rx="2.4" fill="#e9c27a" stroke="${LINE}" stroke-width=".6"/><rect x="${x - 2.6}" y="${50 + d}" width="5.2" height="38" rx="2.6" fill="#5a2e17" stroke="${LINE}" stroke-width=".6"/><path d="M${x - 1} ${54 + d} v28" stroke="#9a5a33" stroke-width=".8" stroke-linecap="round"/></g>`;
    });
    return `<svg class="pkg pkg-stix" viewBox="0 0 64 140" role="img" aria-label="Honor Stix box">
  <defs>
    <linearGradient id="${g}b" x1="0" x2="1">
      <stop offset="0" stop-color="#c99a2e"/><stop offset=".3" stop-color="#f6d77e"/><stop offset=".75" stop-color="#e2b54a"/><stop offset="1" stop-color="#b8892a"/>
    </linearGradient>
    <clipPath id="${g}k"><rect x="5" y="8" width="46" height="127" rx="2"/></clipPath>
  </defs>
  <path d="M51 8 L59 3 L59 130 L51 135Z" fill="#8a6418" stroke="${LINE}" stroke-width="1.2" stroke-linejoin="round"/>
  <path d="M5 8 L13 3 L59 3 L51 8Z" fill="#f9e6a8" stroke="${LINE}" stroke-width="1.2" stroke-linejoin="round"/>
  <rect x="5" y="8" width="46" height="127" rx="2" fill="url(#${g}b)"/>
  <g clip-path="url(#${g}k)">
    <rect x="5" y="14" width="46" height="9" fill="#5a2e17"/>
    <text x="28" y="20.6" text-anchor="middle" font-family="DotGothic16, monospace" font-size="4.6" fill="#f9e6a8" letter-spacing=".8">HONORS · STIX</text>
    <text x="28" y="36" text-anchor="middle" textLength="38" lengthAdjust="spacingAndGlyphs" font-family="Unbounded, Arial Black, sans-serif" font-weight="900" font-size="10" fill="#5a2e17">HONOR</text>
    <text x="28" y="49" text-anchor="middle" textLength="34" lengthAdjust="spacingAndGlyphs" font-family="Unbounded, Arial Black, sans-serif" font-weight="900" font-size="13" fill="#fffaf0" stroke="#5a2e17" stroke-width="1.6" paint-order="stroke">STIX</text>
    ${sticks}
    <rect x="5" y="112" width="46" height="13" fill="#5a2e17"/>
    <path d="M10 118.5 l2 -3 2 3 -2 3Z M42 118.5 l2 -3 2 3 -2 3Z" fill="#f6d77e"/>
    <text x="28" y="120.6" text-anchor="middle" font-family="IBM Plex Sans KR, sans-serif" font-weight="700" font-size="4.6" fill="#f9e6a8">CHOCO · 47g</text>
    <rect x="9" y="10" width="2.4" height="122" fill="#fffaf0" opacity=".55"/>
    ${glint(`${g}k`, 140)}
  </g>
  <rect x="5" y="8" width="46" height="127" rx="2" fill="none" stroke="${LINE}" stroke-width="1.5"/>
</svg>`;
  }

  /* C2 · Hello Kimbap: triangle kimbap in its numbered pull-strip wrapper. */
  function kimbap() {
    const g = uid('kim');
    const tri = 'M49 7 Q55 2 61 7 L104 82 Q107 92 97 93 L13 93 Q3 92 6 82Z';
    return `<svg class="pkg pkg-kimbap" viewBox="0 0 110 100" role="img" aria-label="Hello Kimbap triangle kimbap">
  <defs>
    <linearGradient id="${g}w" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".9"/><stop offset="1" stop-color="#dfe6ea" stop-opacity=".85"/></linearGradient>
    <clipPath id="${g}k"><path d="${tri}"/></clipPath>
  </defs>
  <path d="${tri}" fill="#f7f4ec"/>
  <g clip-path="url(#${g}k)">
    <path d="M0 66 L110 66 L110 100 L0 100Z" fill="#1d3a2a"/>
    <path d="M0 66 L110 66" stroke="#2f5a40" stroke-width="2"/>
    <g fill="#ffffff" opacity=".9"><ellipse cx="40" cy="30" rx="2" ry="1"/><ellipse cx="62" cy="40" rx="2" ry="1"/><ellipse cx="50" cy="20" rx="1.6" ry=".9"/><ellipse cx="30" cy="54" rx="2" ry="1"/><ellipse cx="74" cy="56" rx="2" ry="1"/></g>
    <path class="strip" d="M53 6 L58 6 L58 93 L53 93Z" fill="#e8a33d" opacity=".95"/>
    <rect x="0" y="40" width="110" height="20" fill="#d6452f" stroke="#1a1d24" stroke-width=".6"/>
    <text x="55" y="49.4" text-anchor="middle" textLength="54" lengthAdjust="spacingAndGlyphs" font-family="Unbounded, Arial Black, sans-serif" font-weight="900" font-size="8" fill="#fffaf0">HELLO KIMBAP</text>
    <text x="55" y="56.6" text-anchor="middle" font-family="IBM Plex Sans KR, sans-serif" font-weight="700" font-size="5" fill="#ffe3b0">TUNA MAYO · 110g</text>
    <text x="55" y="82" text-anchor="middle" font-family="DotGothic16, monospace" font-size="5" fill="#cfe3d6" letter-spacing=".8">CONTACT · 100g</text>
    <path d="${tri}" fill="url(#${g}w)" opacity=".12"/>
    <text class="strip" x="55.5" y="16" text-anchor="middle" font-family="Unbounded, sans-serif" font-weight="900" font-size="4" fill="#1a1d24">1</text>
    <circle cx="20" cy="86" r="3.4" fill="#e8a33d" stroke="${LINE}" stroke-width=".5"/><text x="20" y="87.6" text-anchor="middle" font-family="Unbounded, sans-serif" font-weight="900" font-size="4" fill="#1a1d24">2</text>
    <circle cx="90" cy="86" r="3.4" fill="#e8a33d" stroke="${LINE}" stroke-width=".5"/><text x="90" y="87.6" text-anchor="middle" font-family="Unbounded, sans-serif" font-weight="900" font-size="4" fill="#1a1d24">3</text>
    <path d="M28 30 L38 14" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round" opacity=".9"/>
    <path d="M70 18 L104 80 L104 100 L86 100 L62 20Z" fill="#000000" opacity=".1"/>
    ${glint(`${g}k`, 100)}
  </g>
  <path d="${tri}" fill="none" stroke="${LINE}" stroke-width="1.6" stroke-linejoin="round"/>
</svg>`;
  }

  return { soda, chips, cup, milk, tonic, ramyeon, stix, kimbap };
})();
