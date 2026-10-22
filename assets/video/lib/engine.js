// Shared animation engine for the HTML lesson videos.
// A page loads timeline.js (window.TL) and this file, registers scenes with scene(id, build),
// then calls start(). Every visual is a pure function of t, so render.py can seek frame by frame.

const RENDER = new URLSearchParams(location.search).has('render');
const TL = window.TL, NS = 'http://www.w3.org/2000/svg';
const svg = document.getElementById('svg'), layer = document.getElementById('layer');
const COL = {a: '#4fb3ff', b: '#ffb347', c: '#ff6b9a', y: '#ffe066', ok: '#6ee7a8', warn: '#ff7a6b', teal: '#38bdb2', ink: '#e8eefc', muted: '#8f9cc0', purple: '#b18cff'};

// ---------- math / easing ----------
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ease = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const outBack = x => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const lerp = (a, b, u) => a + (b - a) * u;
const U = (t, t0, d) => clamp((t - t0) / d);
const P = (t, t0, d = .6) => ease(U(t, t0, d));
const bump = (t, t0, d = .9) => { const u = (t - t0) / d; return u <= 0 || u >= 1 ? 0 : Math.sin(Math.PI * u); };
const add = (p, q) => [p[0] + q[0], p[1] + q[1]], sub = (p, q) => [p[0] - q[0], p[1] - q[1]], mul = (p, k) => [p[0] * k, p[1] * k];
const norm = p => { const l = Math.hypot(p[0], p[1]); return [p[0] / l, p[1] / l]; };
const mid = (p, q) => mul(add(p, q), .5);
// point `d` px off the midpoint of pq, on the side away from `inside`
function outward(p, q, inside, d) {
  const m = mid(p, q); let n = norm([-(q[1] - p[1]), q[0] - p[0]]);
  if ((inside[0] - m[0]) * n[0] + (inside[1] - m[1]) * n[1] > 0) n = mul(n, -1);
  return add(m, mul(n, d));
}
// ∫ f from a to b (midpoint rule) — for quantities whose rate changes over time, e.g. a slowing clock hand
function integ(f, a, b, n = 240) { if (b <= a) return 0; const h = (b - a) / n; let s = 0; for (let i = 0; i < n; i++) s += f(a + (i + .5) * h); return s * h; }

// ---------- math markup ----------
// mathFmt({a:'va'}) -> F('a^2 - b') gives coloured italics for the listed letters, ^2 -> superscript, - -> minus, * -> times
function mathFmt(vars) {
  const re = new RegExp(`[${Object.keys(vars).join('')}]`, 'g');
  return s => s.replace(/-/g, '−').replace(/\*/g, '×').replace(re, m => `<i class="${vars[m]}">${m}</i>`).replace(/\^2/g, '<sup>2</sup>');
}
const fracH = (n, d) => `<span class="frac"><span>${n}</span><span>${d}</span></span>`;
const sqrtH = x => `<span class="rt">√<span class="rad">${x}</span></span>`;

// ---------- svg builders ----------
function S(tag, attrs = {}, parent) { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
const D = (pts, close) => 'M' + pts.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L') + (close ? ' Z' : '');
function stroke(pts, attrs, parent) { return S('path', {d: D(pts), pathLength: 1, 'stroke-dasharray': '1 1', 'stroke-dashoffset': 1, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', ...attrs}, parent); }
function shape(pts, attrs, parent) { return S('path', {d: D(pts, true), ...attrs}, parent); }
function txt(x, y, s, attrs, parent) { const e = S('text', {x, y, 'text-anchor': 'middle', 'dominant-baseline': 'central', ...attrs}, parent); e.textContent = s; e._c = [x, y]; e.style.opacity = 0; return e; }
function rmark(C, A, B, s, attrs, parent) {
  const u = mul(norm(sub(A, C)), s), w = mul(norm(sub(B, C)), s);
  const e = S('path', {d: D([add(C, u), add(add(C, u), w), add(C, w)]), fill: 'none', stroke: COL.ink, 'stroke-width': 3, ...attrs}, parent);
  e._c = C; e.style.opacity = 0; return e;
}
function tri(parent, C, A, B, o = {}) {
  const g = S('g', {}, parent), w = o.w || 5;
  return {g,
    fill: shape([C, A, B], {fill: o.fill || 'rgba(255,255,255,.07)'}, g),
    ca: stroke([C, A], {stroke: COL.ink, 'stroke-width': w}, g),
    cb: stroke([C, B], {stroke: COL.ink, 'stroke-width': w}, g),
    ab: stroke([A, B], {stroke: COL.ink, 'stroke-width': w}, g),
    rm: rmark(C, A, B, o.m || 30, {}, g)};
}
function showTri(T, t, t0) { vis(T.fill, P(t, t0, .6)); draw(T.ca, P(t, t0, .6)); draw(T.cb, P(t, t0 + .25, .6)); draw(T.ab, P(t, t0 + .55, .7)); vis(T.rm, P(t, t0 + .9, .4)); }

// ---------- html builders ----------
function H(html, x, y, o = {}, parent = layer) {
  const d = document.createElement('div'); d.className = 'abs ' + (o.cls || ''); d.innerHTML = html;
  d.style.left = x + 'px'; d.style.top = y + 'px';
  const ax = o.anchor === 'l' ? '0' : o.anchor === 'r' ? '-100%' : '-50%';
  d._base = `translate(${ax},-50%)`; d.style.transform = d._base; d.style.opacity = 0;
  if (o.style) Object.assign(d.style, o.style);
  parent.appendChild(d); return d;
}
function subLayer(h) { const d = document.createElement('div'); d.className = 'scene'; h.appendChild(d); return d; }

// ---------- animation setters (all pure functions of t) ----------
function vis(n, v) { n.style.opacity = v; }
function fade(n, t, t0, t1 = 1e9, d = .5) { vis(n, P(t, t0, d) * (1 - P(t, t1, d))); }
function rise(n, t, t0, t1 = 1e9, dy = 30, d = .6) { const v = P(t, t0, d); vis(n, v * (1 - P(t, t1, .5))); n.style.transform = `${n._base || ''} translateY(${(1 - v) * dy}px)`; }
function setScale(n, s) {
  if (n instanceof SVGElement) { const [x, y] = n._c; n.setAttribute('transform', `translate(${x} ${y}) scale(${s}) translate(${-x} ${-y})`); }
  else n.style.transform = `${n._base || ''} scale(${s})`;
}
function pop(n, t, t0, t1 = 1e9, d = .5) { const u = U(t, t0, d); vis(n, clamp(u * 1.8) * (1 - P(t, t1, .5))); setScale(n, u <= 0 ? .4 : lerp(.4, 1, outBack(u))); }
function draw(n, v) { n.setAttribute('stroke-dashoffset', (1 - v).toFixed(4)); n.style.opacity = v > .001 ? 1 : 0; }
function move(n, x, y, extra = '') { n.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)})${extra}`); }

// ---------- scene registry ----------
const scenes = [];
function scene(id, build) {
  const sc = TL.scenes.find(s => s.id === id);
  const g = S('g', {}, svg), h = subLayer(layer);
  const T = i => sc.lines[i].start, E = i => sc.lines[i].end, at = (i, f) => T(i) + f * (E(i) - T(i));
  scenes.push({sc, g, h, upd: build({g, h, T, E, at})});
}

// ---------- global timeline ----------
function start() {
  const hdr = document.getElementById('hdr'), hno = document.getElementById('hno'), hname = document.getElementById('hname');
  const subEl = document.getElementById('sub'), prog = document.getElementById('prog');
  const LINES = TL.scenes.flatMap(s => s.lines);
  let curSub = null;
  function seek(t) {
    for (const s of scenes) {
      const {start, end} = s.sc;
      const v = Math.min(P(t, start, .5), 1 - P(t, end - .5, .5));
      const on = t >= start && t <= end && v > 0;
      s.g.style.display = s.h.style.display = on ? '' : 'none';
      if (on) { s.g.style.opacity = s.h.style.opacity = v; s.upd(t); }
    }
    let si = TL.scenes.findIndex(s => t >= s.start && t < s.end);
    if (si < 0) si = TL.scenes.length - 1;
    const sc = TL.scenes[si];
    hno.textContent = String(si + 1).padStart(2, '0'); hname.textContent = sc.chapter;
    hdr.style.opacity = Math.min(P(t, sc.start, .5), 1 - P(t, sc.end - .5, .5));
    let cur = null;
    for (const l of LINES) { if (t >= l.start - .15) cur = l; else break; }
    if (cur !== curSub) { subEl.textContent = cur ? cur.sub : ''; curSub = cur; }
    subEl.style.opacity = cur ? P(t, cur.start - .15, .15) * (1 - P(t, cur.end + .3, .2)) : 0;
    prog.style.width = (100 * clamp(t / TL.total)) + '%';
  }
  window.seek = seek;

  if (RENDER) {
    document.body.classList.add('render');
  } else {
    const stage = document.getElementById('stage'), btn = document.getElementById('play'), rng = document.getElementById('rng'), clock = document.getElementById('clock');
    const audio = new Audio('build/narration.wav');
    rng.max = TL.total;
    const fit = () => { const k = Math.min(innerWidth / 1920, (innerHeight - 56) / 1080); stage.style.transform = `scale(${k})`; stage.style.left = (innerWidth - 1920 * k) / 2 + 'px'; };
    addEventListener('resize', fit); fit();
    btn.onclick = () => audio.paused ? audio.play() : audio.pause();
    rng.oninput = () => { audio.currentTime = +rng.value; seek(+rng.value); };
    addEventListener('keydown', e => { if (e.code === 'Space') { e.preventDefault(); btn.click(); } });
    const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
    (function loop() {
      if (!audio.paused) { seek(audio.currentTime); rng.value = audio.currentTime; }
      btn.textContent = audio.paused ? '▶ 播放' : '⏸ 暂停'; clock.textContent = `${fmt(+rng.value)} / ${fmt(TL.total)}`;
      requestAnimationFrame(loop);
    })();
  }
  document.fonts.ready.then(() => { seek(RENDER ? 0 : 2); window.__ready = true; });
}
