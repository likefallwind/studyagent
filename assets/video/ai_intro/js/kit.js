// Page-level helpers for the ai_intro lesson (on top of ../lib/engine.js). Everything stays a pure function of t.
const defs = S('defs', {}, svg);
function radial(id, stops) { const g = S('radialGradient', {id}, defs); stops.forEach(([o, c, a = 1]) => S('stop', {offset: o, 'stop-color': c, 'stop-opacity': a}, g)); }
function linear(id, stops, x2 = 1, y2 = 0) { const g = S('linearGradient', {id, x1: 0, y1: 0, x2, y2}, defs); stops.forEach(([o, c, a = 1]) => S('stop', {offset: o, 'stop-color': c, 'stop-opacity': a}, g)); }
radial('glowY', [['0%', '#fffbe6'], ['30%', COL.y, .9], ['100%', COL.y, 0]]);
radial('glowA', [['0%', '#e6f5ff'], ['35%', COL.a, .9], ['100%', COL.a, 0]]);
radial('glowC', [['0%', '#ffe6ee'], ['35%', COL.c, .9], ['100%', COL.c, 0]]);
radial('glowG', [['0%', '#eafff3'], ['35%', COL.ok, .9], ['100%', COL.ok, 0]]);

// ---------- small utils ----------
const iv = (x, c = '') => `<i class="${c}">${x}</i>`;
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
const smooth = (a, b, x) => { const u = clamp((x - a) / (b - a)); return u * u * (3 - 2 * u); };
// visible window: fades in at t0, out at t1
const win = (t, t0, t1 = 1e9, d = .5) => P(t, t0, d) * (1 - P(t, t1, d));
// point at fraction u along a polyline
function along(pts, u) {
  const seg = []; let L = 0;
  for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(l); L += l; }
  let d = clamp(u) * L;
  for (let i = 0; i < seg.length; i++) { if (d <= seg[i] || i === seg.length - 1) { const k = seg[i] ? d / seg[i] : 0; return [lerp(pts[i][0], pts[i + 1][0], k), lerp(pts[i][1], pts[i + 1][1], k)]; } d -= seg[i]; }
  return pts[pts.length - 1];
}
function typed(el, s, t, t0, cps = 16, cursor = true) {
  const chars = Array.from(s), n = clamp(Math.floor((t - t0) * cps), 0, chars.length);
  const txt = chars.slice(0, n).join('');
  if (el._typed !== txt) { el.textContent = txt; el._typed = txt; }
  el.classList.toggle('cursor', cursor && t >= t0 && n < chars.length);
  return n / chars.length;
}
function setText(el, s) { if (el._txt !== s) { el.textContent = s; el._txt = s; } }
function setHTML(el, s) { if (el._html !== s) { el.innerHTML = s; el._html = s; } }
function at2(el, x, y, extra = '') { el.style.left = x + 'px'; el.style.top = y + 'px'; if (extra !== null) el.style.transform = `${el._base} ${extra}`; }
function mv(el, dx, dy, s = 1) { el.style.transform = `${el._base} translate(${dx}px,${dy}px) scale(${s})`; }

// ---------- svg ----------
function arrow(parent, x1, y1, x2, y2, col, w = 5) {
  const g = S('g', {}, parent), d = norm([x2 - x1, y2 - y1]), n = [-d[1], d[0]], hl = 16 + w * 1.6;
  const ln = S('line', {x1, y1, x2: x2 - d[0] * hl * .7, y2: y2 - d[1] * hl * .7, stroke: col, 'stroke-width': w, 'stroke-linecap': 'round'}, g);
  S('path', {d: D([[x2, y2], add([x2, y2], add(mul(d, -hl), mul(n, hl * .5))), add([x2, y2], add(mul(d, -hl), mul(n, -hl * .5)))], true), fill: col}, g);
  g.style.opacity = 0; return g;
}
// arrow that grows from tail to head with v in [0,1]
function growArrow(parent, x1, y1, x2, y2, col, w = 5) {
  const g = S('g', {}, parent), d = norm([x2 - x1, y2 - y1]), n = [-d[1], d[0]], hl = 16 + w * 1.6;
  const ln = S('line', {x1, y1, x2: x1, y2: y1, stroke: col, 'stroke-width': w, 'stroke-linecap': 'round'}, g);
  const hd = S('path', {d: D([[0, 0], add(mul(d, -hl), mul(n, hl * .5)), add(mul(d, -hl), mul(n, -hl * .5))], true), fill: col}, g);
  g.set = v => {
    const e = [lerp(x1, x2, v), lerp(y1, y2, v)];
    ln.setAttribute('x2', e[0] - d[0] * hl * .7 * Math.min(1, v * 4)); ln.setAttribute('y2', e[1] - d[1] * hl * .7 * Math.min(1, v * 4));
    hd.setAttribute('transform', `translate(${e[0]} ${e[1]})`); g.style.opacity = v > .01 ? 1 : 0;
  };
  g.set(0); return g;
}
function dot(parent, x, y, r, fill, attrs = {}) { return S('circle', {cx: x, cy: y, r, fill, ...attrs}, parent); }
function glow(parent, r = 22, id = 'glowY', core = '#fffbe6') { const g = S('g', {}, parent); S('circle', {r, fill: `url(#${id})`}, g); S('circle', {r: r * .28, fill: core}, g); return g; }

// ---------- icons (48×48, stroked) ----------
const ICONS = {
  robot: '<rect x="10" y="14" width="28" height="22" rx="6"/><circle cx="19" cy="25" r="3"/><circle cx="29" cy="25" r="3"/><path d="M24 14V7M20 7h8M6 22v8M42 22v8M18 36v5M30 36v5"/>',
  person: '<circle cx="24" cy="15" r="8"/><path d="M8 42c2-10 9-15 16-15s14 5 16 15"/>',
  book: '<path d="M6 10c6-2 12-2 18 2v28c-6-4-12-4-18-2zM42 10c-6-2-12-2-18 2v28c6-4 12-4 18-2z"/>',
  search: '<circle cx="20" cy="20" r="12"/><path d="M29 29l12 12"/>',
  chat: '<path d="M8 10h32v22H22l-9 8v-8H8z"/><path d="M16 19h16M16 25h10"/>',
  image: '<rect x="6" y="9" width="36" height="30" rx="4"/><circle cx="17" cy="19" r="4"/><path d="M6 34l11-10 9 8 6-5 10 9"/>',
  video: '<rect x="5" y="12" width="28" height="24" rx="4"/><path d="M33 20l10-6v20l-10-6z"/>',
  mic: '<rect x="18" y="5" width="12" height="22" rx="6"/><path d="M11 22a13 13 0 0 0 26 0M24 35v7M17 42h14"/>',
  text: '<path d="M10 10h28M24 10v30M17 40h14"/>',
  sensor: '<path d="M4 24h7l4-12 6 24 6-18 4 10 4-4h9"/>',
  eye: '<path d="M3 24s8-13 21-13 21 13 21 13-8 13-21 13S3 24 3 24z"/><circle cx="24" cy="24" r="6"/>',
  ear: '<path d="M14 18a10 10 0 0 1 20 0c0 8-8 9-8 16a6 6 0 0 1-12 0"/><path d="M19 19a5 5 0 0 1 10 0c0 3-3 4-4 6"/>',
  wave: '<path d="M8 18v12M16 12v24M24 6v36M32 12v24M40 18v12"/>',
  code: '<path d="M17 14L7 24l10 10M31 14l10 10-10 10M27 9l-6 30"/>',
  bulb: '<path d="M17 30c-4-3-7-7-7-12a14 14 0 0 1 28 0c0 5-3 9-7 12v5H17z"/><path d="M18 41h12"/>',
  db: '<ellipse cx="24" cy="11" rx="15" ry="5"/><path d="M9 11v26c0 3 7 5 15 5s15-2 15-5V11M9 24c0 3 7 5 15 5s15-2 15-5"/>',
  gear: '<circle cx="24" cy="24" r="7"/><path d="M24 4v7M24 37v7M4 24h7M37 24h7M10 10l5 5M33 33l5 5M38 10l-5 5M15 33l-5 5"/>',
  globe: '<circle cx="24" cy="24" r="18"/><path d="M6 24h36M24 6c6 6 6 30 0 36M24 6c-6 6-6 30 0 36"/>',
  check: '<path d="M9 25l10 10 20-22"/>',
  cross: '<path d="M12 12l24 24M36 12L12 36"/>',
  sun: '<circle cx="24" cy="24" r="8"/><path d="M24 4v6M24 38v6M4 24h6M38 24h6M10 10l4 4M34 34l4 4M38 10l-4 4M14 34l-4 4"/>',
  pin: '<path d="M24 44s14-14 14-24a14 14 0 0 0-28 0c0 10 14 24 14 24z"/><circle cx="24" cy="20" r="5"/>',
  bed: '<path d="M5 38V12M5 30h38v8M43 30v-6a6 6 0 0 0-6-6H22v12"/><circle cx="13" cy="23" r="4"/>',
  doc: '<path d="M12 5h16l9 9v29H12z"/><path d="M28 5v9h9M17 24h15M17 31h15"/>',
  flask: '<path d="M19 5h10M21 5v13L9 40h30L27 18V5"/><path d="M14 31h20"/>',
  chart: '<path d="M6 42h36M12 36V24M22 36V12M32 36V28M40 36V18"/>',
  lock: '<rect x="9" y="22" width="30" height="20" rx="4"/><path d="M16 22v-7a8 8 0 0 1 15-4"/>',
  rocket: '<path d="M24 4c8 6 10 16 6 28H18C14 20 16 10 24 4z"/><circle cx="24" cy="18" r="3"/><path d="M18 32l-6 8 8-3M30 32l6 8-8-3"/>',
  coin: '<circle cx="24" cy="24" r="18"/><path d="M17 14l7 9 7-9M24 23v13M17 26h14M17 31h14"/>',
  flag: '<path d="M10 44V6M10 8h26l-5 8 5 8H10"/>',
  phone: '<rect x="14" y="4" width="20" height="40" rx="4"/><path d="M21 38h6"/>',
  door: '<rect x="12" y="5" width="24" height="38" rx="2"/><circle cx="30" cy="25" r="2"/>',
  cctv: '<path d="M6 12l28 6-3 10-28-6z"/><path d="M31 23l8 2M18 26l-2 9M8 36h12"/>',
  heart: '<path d="M24 41S6 30 6 17a9 9 0 0 1 18-3 9 9 0 0 1 18 3c0 13-18 24-18 24z"/>',
  share: '<path d="M8 18l8-8 8 8M16 10v20h14M40 30l-8 8-8-8M32 38V18H18"/>',
  house: '<path d="M6 22L24 7l18 15M11 19v22h26V19"/><path d="M20 41V29h8v12"/>',
  cap: '<path d="M4 18l20-9 20 9-20 9z"/><path d="M12 22v10c4 4 20 4 24 0V22M44 18v12"/>',
  brief: '<rect x="6" y="14" width="36" height="26" rx="4"/><path d="M18 14V9h12v5M6 25h36"/>',
  fire: '<path d="M24 44c-9 0-14-6-14-13 0-8 8-12 8-20 4 3 6 7 6 11 2-2 3-5 3-8 6 5 11 10 11 17 0 7-5 13-14 13z"/>',
  star: '<path d="M24 5l5.6 12 13 1.4-9.8 8.8 2.8 12.8L24 33.6 12.4 40l2.8-12.8L5.4 18.4l13-1.4z"/>',
  bone: '<path d="M14 18a5 5 0 1 1 5-6h10a5 5 0 1 1 5 6 5 5 0 1 1-5 6H19a5 5 0 1 1-5-6z"/>',
  dog: '<path d="M14 14c-6 0-9 10-6 16l6-4M34 14c6 0 9 10 6 16l-6-4"/><path d="M14 14h20v16c0 7-5 12-10 12s-10-5-10-12z"/><circle cx="19" cy="23" r="1.6" fill="currentColor"/><circle cx="29" cy="23" r="1.6" fill="currentColor"/><path d="M21 31h6l-3 3z"/>',
  cat: '<path d="M10 40V18l4-12 8 8h4l8-8 4 12v22z"/><circle cx="18" cy="25" r="1.8" fill="currentColor"/><circle cx="30" cy="25" r="1.8" fill="currentColor"/><path d="M22 31h4l-2 2zM6 30h9M6 35h9M33 30h9M33 35h9"/>',
  smile: '<circle cx="24" cy="24" r="18"/><path d="M15 27c3 6 15 6 18 0"/><circle cx="18" cy="19" r="2" fill="currentColor"/><circle cx="30" cy="19" r="2" fill="currentColor"/>',
  angry: '<circle cx="24" cy="24" r="18"/><path d="M16 34c3-4 13-4 16 0M13 15l8 4M35 15l-8 4"/><circle cx="18" cy="23" r="2" fill="currentColor"/><circle cx="30" cy="23" r="2" fill="currentColor"/>',
  sad: '<circle cx="24" cy="24" r="18"/><path d="M16 33c3-4 13-4 16 0"/><circle cx="18" cy="20" r="2" fill="currentColor"/><circle cx="30" cy="20" r="2" fill="currentColor"/><path d="M33 24v4"/>',
  bolt: '<path d="M27 4L10 27h12l-3 17 17-23H24z"/>',
  users: '<circle cx="17" cy="16" r="6"/><path d="M5 38c1-8 6-12 12-12s11 4 12 12"/><circle cx="33" cy="17" r="5"/><path d="M31 26c6 0 10 4 12 11"/>',
  clock: '<circle cx="24" cy="24" r="18"/><path d="M24 13v11l8 5"/>',
  hand: '<path d="M16 26V10a3 3 0 0 1 6 0v12M22 20V7a3 3 0 0 1 6 0v13M28 20V9a3 3 0 0 1 6 0v15M34 22v-6a3 3 0 0 1 6 0v12c0 9-6 16-15 16-6 0-9-3-13-8l-6-8a3 3 0 0 1 5-4l4 4"/>',
  layers: '<path d="M24 6L4 16l20 10 20-10z"/><path d="M4 24l20 10 20-10M4 32l20 10 20-10"/>',
  spark: '<path d="M24 4v12M24 32v12M4 24h12M32 24h12M10 10l7 7M31 31l7 7M38 10l-7 7M17 31l-7 7"/>',
};
function ico(name, s = 48, col = 'currentColor', sw = 3) {
  return `<svg class="ico" width="${s}" height="${s}" viewBox="0 0 48 48" fill="none" stroke="${col}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" style="color:${col}">${ICONS[name]}</svg>`;
}
function icoS(parent, name, x, y, s, col, sw = 3) {
  const g = S('g', {fill: 'none', stroke: col, 'stroke-width': sw, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', color: col}, parent);
  const inner = S('g', {transform: `translate(${x - s / 2} ${y - s / 2}) scale(${s / 48})`}, g); inner.innerHTML = ICONS[name];
  g._c = [x, y]; return g;
}

// ---------- html blocks ----------
function IMG(src, x, y, w, h, o = {}, parent = layer) {
  const fit = o.fit || 'cover', pos = o.pos || '50% 50%';
  const d = H(`<div class="ph ${o.cls || ''}" style="width:${w}px;height:${h}px"><img src="img/${src}.jpg" style="object-fit:${fit};object-position:${pos}"></div>${o.cap ? `<div class="cap ${o.capCls || ''}">${o.cap}</div>` : ''}`,
    x, y, {style: {textAlign: 'center', ...(o.style || {})}}, parent);
  d.img = d.querySelector('img'); return d;
}
const kb = (d, s, dx = 0, dy = 0) => { d.img.style.transform = `translate(${dx}px,${dy}px) scale(${s})`; };
function BG(src, parent, veil = 'linear-gradient(180deg,rgba(8,12,26,.55),rgba(8,12,26,.85))') {
  const d = document.createElement('div'); d.className = 'bgimg'; d.innerHTML = `<img src="img/${src}.jpg"><div class="veil" style="background:${veil}"></div>`;
  d.style.opacity = 0; parent.appendChild(d); d.img = d.querySelector('img'); return d;
}
// full-stage background photo drawn inside the scene's SVG group, so SVG drawings can sit on top of it
radial('veilR', [['0%', '#080c1a', .3], ['100%', '#080c1a', .93]]);
linear('veilV', [['0%', '#080c1a', .45], ['100%', '#080c1a', .88]], 0, 1);
function BGS(parent, src, veil = 'veilR') {
  const g = S('g', {}, parent);
  const im = S('image', {href: `img/${src}.jpg`, x: 0, y: 0, width: 1920, height: 1080, preserveAspectRatio: 'xMidYMid slice'}, g);
  S('rect', {x: 0, y: 0, width: 1920, height: 1080, fill: `url(#${veil})`}, g);
  const pre = new Image(); pre.src = `img/${src}.jpg`; pre.style.display = 'none'; document.body.appendChild(pre);  // so start() waits for it
  g.kb = (s, dx = 0, dy = 0) => im.setAttribute('transform', `translate(${960 + dx} ${540 + dy}) scale(${s}) translate(-960 -540)`);
  g.style.opacity = 0; return g;
}
// big chapter card: "03 机器学习"
function chapterCard(h, no, name) {
  const c = H(`<div class="chap"><span class="no">${no}</span><span class="nm">${name}</span><span class="bar"></span></div>`, 960, 500, {}, h);
  const bar = c.querySelector('.bar'), num = c.querySelector('.no'), nm = c.querySelector('.nm');
  return (t, t0, t1) => {
    vis(c, win(t, t0, t1, .45));
    const u = P(t, t0, .8);
    num.style.transform = `translateX(${(1 - u) * -80}px)`; nm.style.transform = `translateX(${(1 - u) * 80}px)`;
    bar.style.transform = `scaleX(${P(t, t0 + .3, .9)})`;
    c.style.transform = `${c._base} scale(${lerp(1, 1.06, U(t, t0, t1 - t0 + .5))})`;
  };
}
function countUp(el, t, t0, d, v0, v1, fmt = v => Math.round(v).toLocaleString('en-US')) { setText(el, fmt(lerp(v0, v1, P(t, t0, d)))); }
function stars(n, of = 5) { return `<span class="star">${'★'.repeat(n)}<span class="off">${'★'.repeat(of - n)}</span></span>`; }
