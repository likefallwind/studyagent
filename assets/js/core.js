/* 核心：状态、事件、DOM 工具、图标、动画小工具 */
(function () {
  const SA = (window.SA = window.SA || {});
  SA.widgets = {};

  /* ---------- DOM ---------- */
  SA.h = function (html) {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  };
  SA.esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  SA.$ = (sel, root) => (root || document).querySelector(sel);
  SA.$$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  SA.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  SA.shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  SA.sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  SA.reducedMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 让 canvas 在高分屏上清晰 */
  SA.setupCanvas = function (canvas, w, h) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = '100%';
    canvas.style.maxWidth = w + 'px';
    canvas.style.aspectRatio = w + ' / ' + h;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
  };
  /* 指针在 canvas 逻辑坐标中的位置 */
  SA.canvasPoint = function (canvas, e, w, h) {
    const r = canvas.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * w, y: ((e.clientY - r.top) / r.height) * h };
  };

  /* ---------- 事件总线 ---------- */
  const listeners = {};
  SA.bus = {
    on(name, fn) { (listeners[name] = listeners[name] || []).push(fn); return () => SA.bus.off(name, fn); },
    off(name, fn) { listeners[name] = (listeners[name] || []).filter((f) => f !== fn); },
    emit(name, data) { (listeners[name] || []).slice().forEach((f) => f(data)); }
  };

  /* ---------- 持久化状态 ---------- */
  const KEY = 'studyagent.v1';
  const VERSION = 2;     // 2：默认解锁全部内容，方便审阅；旧状态迁移时也打开（学习档案里可以关掉）
  const defaults = () => ({
    v: VERSION,
    plan: null,          // { why, bg, known:[], pace, plus:[], skip:[] }
    passed: {},          // sectionId -> { first: bool, at }
    checks: {},          // chapterId -> { passed, tries }
    mastery: {},         // kpId -> 0..1
    inserts: {},         // sectionId -> [insertId]
    notes: [],           // { q, a, sec, at }
    current: '1.1',
    unlockAll: true,
    streak: 4,
    lastDay: null
  });
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.v !== VERSION) { saved.unlockAll = true; saved.v = VERSION; }
        return Object.assign(defaults(), saved);
      }
    } catch (e) { /* 隐私模式等情况下忽略 */ }
    return defaults();
  }
  SA.store = {
    s: load(),
    save() {
      try { localStorage.setItem(KEY, JSON.stringify(this.s)); } catch (e) { /* ignore */ }
      SA.bus.emit('store');
    },
    reset() { this.s = defaults(); this.save(); }
  };

  /* ---------- 图标（描边 SVG） ---------- */
  const sv = (d, size, sw) => `<svg aria-hidden="true" width="${size || 16}" height="${size || 16}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw || 2}" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  SA.ic = {
    check: (s) => sv('<path d="M5 12l5 5L20 7"></path>', s || 14, 2.5),
    lock: (s) => sv('<rect x="5" y="11" width="14" height="10" rx="2"></rect><path d="M8 11V7a4 4 0 0 1 8 0v4"></path>', s || 14),
    arrow: (s) => sv('<path d="M5 12h14M13 6l6 6-6 6"></path>', s || 18),
    back: (s) => sv('<path d="M19 12H5M11 6l-6 6 6 6"></path>', s || 18),
    spark: (s) => sv('<path d="M12 3v4M12 17v4M3 12h4M17 12h4"></path>', s || 12, 2.2),
    agent: (s) => sv('<circle cx="12" cy="12" r="3"></circle><path d="M12 2v3M12 19v3M2 12h3M19 12h3"></path>', s || 18),
    book: (s) => sv('<path d="M4 19V5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2zM8 7h6"></path>', s || 18),
    play: (s) => sv('<path d="M7 5l12 7-12 7z"></path>', s || 14),
    pause: (s) => sv('<path d="M8 5v14M16 5v14"></path>', s || 14),
    reset: (s) => sv('<path d="M3 12a9 9 0 1 0 3-6.7L3 8"></path><path d="M3 3v5h5"></path>', s || 14),
    step: (s) => sv('<path d="M6 5l8 7-8 7M18 5v14"></path>', s || 14),
    up: (s) => sv('<path d="M12 19V5M6 11l6-6 6 6"></path>', s || 16),
    down: (s) => sv('<path d="M12 5v14M6 13l6 6 6-6"></path>', s || 16),
    grip: (s) => sv('<circle cx="9" cy="6" r="1"></circle><circle cx="15" cy="6" r="1"></circle><circle cx="9" cy="12" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="9" cy="18" r="1"></circle><circle cx="15" cy="18" r="1"></circle>', s || 14),
    flame: (s) => sv('<path d="M12 3c1 4 5 5.5 5 10a5 5 0 0 1-10 0c0-2.5 1.5-3.5 2-5 1 1.5 2 2 2 2s-.5-4 1-7z"></path>', s || 14),
    bulb: (s) => sv('<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3z"></path>', s || 20),
    target: (s) => sv('<circle cx="12" cy="12" r="9"></circle><circle cx="12" cy="12" r="5"></circle><circle cx="12" cy="12" r="1"></circle>', s || 20),
    warn: (s) => sv('<path d="M12 3l9 16H3z"></path><path d="M12 10v4M12 17v.5"></path>', s || 18),
    close: (s) => sv('<path d="M6 6l12 12M18 6L6 18"></path>', s || 18),
    menu: (s) => sv('<path d="M4 7h16M4 12h16M4 17h16"></path>', s || 18),
    chevron: (s) => sv('<path d="M6 9l6 6 6-6"></path>', s || 16),
    cpu: (s) => sv('<rect x="6" y="6" width="12" height="12" rx="2"></rect><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"></path>', s || 20),
    data: (s) => sv('<ellipse cx="12" cy="6" rx="7" ry="3"></ellipse><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"></path>', s || 20),
    chat: (s) => sv('<path d="M4 5h16v11H9l-5 4z"></path>', s || 20),
    eye: (s) => sv('<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"></path><circle cx="12" cy="12" r="3"></circle>', s || 20),
    gear: (s) => sv('<circle cx="12" cy="12" r="3"></circle><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"></path>', s || 20),
    bolt: (s) => sv('<path d="M13 2L4 14h7l-1 8 9-12h-7z"></path>', s || 20),
    brain: (s) => sv('<path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 3 3h0a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3z"></path><path d="M15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-3 3h0a3 3 0 0 1-3-3"></path>', s || 20),
    image: (s) => sv('<rect x="3" y="4" width="18" height="16" rx="2"></rect><circle cx="9" cy="10" r="2"></circle><path d="M21 16l-5-5-9 9"></path>', s || 20),
    code: (s) => sv('<path d="M8 6l-6 6 6 6M16 6l6 6-6 6"></path>', s || 20),
    user: (s) => sv('<circle cx="12" cy="8" r="4"></circle><path d="M4 21c1-4 4.5-6 8-6s7 2 8 6"></path>', s || 20)
  };

  /* ---------- Toast ---------- */
  SA.toast = function (text) {
    const host = document.getElementById('toast-host');
    if (!host) return;
    const t = SA.h(`<div class="toast">${text}</div>`);
    host.appendChild(t);
    setTimeout(() => t.remove(), 3300);
  };

  /* ---------- 彩纸 ---------- */
  SA.confetti = function (originEl) {
    if (SA.reducedMotion()) return;
    const r = originEl ? originEl.getBoundingClientRect() : { left: innerWidth / 2, top: innerHeight / 2, width: 0, height: 0 };
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const colors = ['#2B3BB8', '#9AA5FF', '#E9A23B', '#5FD19B', '#E07A1F', '#14161C'];
    for (let i = 0; i < 46; i++) {
      const p = document.createElement('i');
      p.className = 'confetti';
      p.style.background = colors[i % colors.length];
      p.style.left = cx + 'px';
      p.style.top = cy + 'px';
      document.body.appendChild(p);
      const ang = Math.random() * Math.PI * 2;
      const dist = 80 + Math.random() * 180;
      const dx = Math.cos(ang) * dist, dy = Math.sin(ang) * dist - 120;
      p.animate([
        { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
        { transform: `translate(${dx}px, ${dy + 260}px) rotate(${Math.random() * 720}deg)`, opacity: 0 }
      ], { duration: 1200 + Math.random() * 700, easing: 'cubic-bezier(.2,.7,.3,1)' }).onfinish = () => p.remove();
    }
  };

  /* ---------- 滚动进入动画 ---------- */
  let io = null;
  SA.observeReveal = function (root) {
    if (SA.reducedMotion() || !('IntersectionObserver' in window)) return;
    if (!io) {
      io = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
        });
      }, { rootMargin: '0px 0px -40px 0px', threshold: 0.05 });
    }
    SA.$$('.block', root).forEach((b) => {
      const rect = b.getBoundingClientRect();
      if (rect.top < innerHeight) return; // 首屏内的直接显示
      b.classList.add('reveal');
      io.observe(b);
    });
  };

  /* 平滑滚动到元素并闪烁 */
  SA.flashTo = function (el) {
    if (!el) return;
    el.scrollIntoView({ behavior: SA.reducedMotion() ? 'auto' : 'smooth', block: 'start' });
    el.classList.remove('flash');
    void el.offsetWidth;
    el.classList.add('flash', 'in');
  };

  /* 数字格式 */
  SA.fmt = (v, d) => (Math.round(v * Math.pow(10, d || 0)) / Math.pow(10, d || 0)).toFixed(d || 0);
})();
