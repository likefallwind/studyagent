// Part 2 — 机器学习 · 案例一 微博 · 模型/损失/优化 · 案例二 图像

// ===================== 什么是机器学习 =====================
scene('mlwhat', ({g, h, T, E, at}) => {
  const chap = chapterCard(h, '03', '机器学习');
  const pic = IMG('robot_read', 560, 520, 540, 540, {}, h);
  const def = H(`<div style="white-space:normal;width:820px"><div class="title-l" style="color:var(--y)">机器学习</div><div class="lead" style="font-size:56px;margin-top:24px;line-height:1.5">让计算机<b>自动</b>从<b>数据</b>中<br>学习<b>规律</b></div></div>`, 1280, 520, {}, h);
  const box = (ic, s, col) => `<span style="display:flex;align-items:center;gap:12px">${ico(ic, 46, col)}${s}</span>`;
  function row(y, items, name, col) {
    const xs = [430, 700, 1080, 1450];
    const lab = H(name, 180, y, {cls: `chip ${col} lg`}, h);
    const a = H(box(...items[0]), xs[0], y, {cls: 'chip lg'}, h);
    const plus = H('＋', 565, y, {style: {fontSize: '50px', color: 'var(--muted)'}}, h);
    const b = H(box(...items[1]), xs[1], y, {cls: 'chip lg'}, h);
    const cpu = H(`<div class="tile" style="padding:18px 30px;flex-direction:row;gap:14px">${ico('gear', 60, '#fff', 2.5)}计算机</div>`, xs[2], y, {}, h);
    const out = H(box(...items[2]), xs[3] + 120, y, {cls: `chip ${col} xl`}, h);
    const ar = [growArrow(g, 800, y, 950, y, 'rgba(255,255,255,.6)', 5), growArrow(g, 1210, y, 1400, y, 'rgba(255,255,255,.6)', 5)];
    return {els: [lab, a, plus, b, cpu], out, ar};
  }
  const r1 = row(380, [['doc', '规则', COL.b], ['db', '数据', COL.a], ['bulb', '答案', COL.ok]], '传统编程', 'a');
  const r2 = row(680, [['db', '数据', COL.a], ['bulb', '答案', COL.ok], ['doc', '规则', COL.b]], '机器学习', 'y');
  const flip = H('反过来！', 1580, 530, {cls: 'tag-y', style: {fontSize: '46px'}}, h);
  const sheets = [...Array(8)].map((_, i) => H(`<div class="card sm" style="width:170px;background:#f4f6ff;color:#1a2140;font-size:28px;line-height:1.4;text-align:center">例题 ${i + 1}<br><span style="color:#2bb673;font-size:40px">✓</span></div>`, 200 + i * 62, 520 + (i % 2) * 30, {}, h));
  const arr = growArrow(g, 760, 520, 1050, 520, COL.y, 7);
  const insight = H(`<div style="display:flex;align-items:center;gap:20px">${ico('bulb', 140, COL.y, 2.5)}<div class="title-l">摸出门道</div></div>`, 1400, 520, {}, h);
  const motto = H('从经验中学习 —— 机器学习的精髓', 960, 820, {cls: 'chip y xl'}, h);
  return t => {
    chap(t, T(0) - .3, E(0) + .5);
    vis(pic, win(t, T(1), T(2))); kb(pic, lerp(1, 1.08, U(t, T(1), 8)));
    rise(def, t, T(1) + .2, T(2));
    const rowsOn = 1 - P(t, T(4), .5);
    [r1, r2].forEach((r, k) => {
      const t0 = k ? T(3) : T(2);
      r.els.forEach((e, i) => { vis(e, rowsOn * P(t, t0 + .15 + i * .18, .4)); });
      r.ar[0].set(P(t, t0 + 1.0, .5)); r.ar[1].set(P(t, t0 + 1.5, .5));
      r.ar.forEach(a => a.style.opacity = rowsOn * (+a.style.opacity));
      pop(r.out, t, t0 + 1.9, T(4));
    });
    setScale(r2.out, (1 + .08 * Math.sin(t * 5) * P(t, T(3) + 2.4, .5)) * (U(t, T(3) + 1.9, .5) <= 0 ? .4 : lerp(.4, 1, outBack(U(t, T(3) + 1.9, .5)))));
    pop(flip, t, at(3, .25), T(4));
    sheets.forEach((s, i) => { const u = P(t, T(4) + .1 + i * .18, .4); vis(s, u); s.style.transform = `${s._base} translate(${(1 - u) * -300}px,0) rotate(${(i - 3.5) * 3}deg)`; });
    arr.set(P(t, at(4, .4), .6)); pop(insight, t, at(4, .5)); rise(motto, t, at(4, .7));
  };
});

// ===================== 三个概念 =====================
scene('concepts', ({g, h, T, E, at}) => {
  const head = H('三个常被混用的概念', 960, 170, {cls: 'title-m'}, h);
  const C = [600, 560];
  const rings = [[340, '#22a35a', '人工智能', COL.ok], [235, '#2f6bff', '机器学习', COL.a], [125, '#8a5cf6', '深度学习', COL.purple]].map(([r, f, s, col], i) => {
    const gg = S('g', {}, g);
    S('circle', {cx: C[0], cy: C[1] + (340 - r), r, fill: f, 'fill-opacity': .32, stroke: f, 'stroke-width': 5}, gg);
    gg._c = [C[0], C[1] + (340 - r)];
    const lab = H(s, C[0], C[1] + (340 - r) - r + (i === 2 ? r : 52), {style: {fontSize: i === 2 ? '44px' : '42px', fontWeight: 900, color: '#fff'}}, h);
    return {gg, lab};
  });
  const cards = [
    ['人工智能', COL.ok, '机器展现出的人类智能'],
    ['机器学习', COL.a, '利用已有数据（经验）得出模型，<br>再用模型预测未来'],
    ['深度学习', COL.purple, '实现机器学习的一种技术<br>也是当今的主流'],
  ].map(([n, col, s], i) => H(`<div class="card" style="width:820px;border-color:${col};font-size:36px"><b style="color:${col};font-size:42px">${n}</b><br>${s}</div>`, 1400, 330 + i * 210, {}, h));
  const nest = H('一层套一层', 600, 960 - 60, {cls: 'chip y lg'}, h);
  return t => {
    rise(head, t, T(0) - .2);
    rings.forEach((r, i) => { pop(r.gg, t, T(i + 1) - .1); fade(r.lab, t, T(i + 1) + .2); });
    cards.forEach((c, i) => rise(c, t, T(i + 1) + .3));
    pop(nest, t, at(3, .6));
  };
});

// ===================== 有无标签 =====================
scene('types', ({g, h, T, E, at}) => {
  const head = H('机器学习怎么分类？看数据有没有「标签」', 960, 165, {cls: 'title-m', style: {fontSize: '52px'}}, h);
  // supervised
  const sTitle = H('监督学习 · 有标签（主流）', 500, 270, {cls: 'chip ok lg'}, h);
  const pets = [['cat', '猫'], ['dog', '狗'], ['cat', '猫'], ['dog', '狗'], ['dog', '狗'], ['cat', '猫']].map(([ic, nm], i) => {
    const col = ic === 'cat' ? COL.b : COL.a;
    const d = H(`<div class="tile" style="width:220px;padding:20px">${ico(ic, 100, col, 2.5)}<span class="tg" style="font-size:34px;color:${col}">标签：${nm}</span></div>`, 280 + (i % 3) * 230, 460 + (i / 3 | 0) * 250, {}, h);
    return {d, tg: d.querySelector('.tg')};
  });
  const teacher = H(`<span style="display:flex;align-items:center;gap:12px">${ico('check', 44, COL.ok, 4)}像老师批改作业</span>`, 500, 860, {cls: 'chip ok lg'}, h);
  // unsupervised
  const uTitle = H('无监督学习 · 无标签', 1420, 270, {cls: 'chip a lg'}, h);
  const R = rng(5), cents = [[1240, 470, COL.b], [1600, 500, COL.c], [1420, 740, COL.teal]];
  const ug = S('g', {}, g);
  const ups = [...Array(36)].map((_, i) => {
    const c = cents[i % 3], a = R() * 6.28, r = 20 + R() * 70;
    return {s: [1100 + R() * 640, 350 + R() * 500], e: [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r], col: c[2], el: dot(ug, 0, 0, 13, '#9aa6c8')};
  });
  const rings = cents.map(([x, y, col]) => S('circle', {cx: x, cy: y, r: 110, fill: 'none', stroke: col, 'stroke-width': 4, 'stroke-dasharray': '12 10'}, ug));
  const uCap = H('自动把相似的归成一堆', 1420, 860, {cls: 'chip a lg'}, h);
  // self-supervised
  const poem = H(`<div style="display:flex;gap:26px;font-family:var(--kai);font-size:130px">${'床前明'.split('').map(c => `<span>${c}</span>`).join('')}<span class="blank" style="width:150px;text-align:center;border-bottom:8px solid var(--y);color:var(--y)">？</span><span>光</span></div>`, 960, 380, {}, h);
  const blank = poem.querySelector('.blank');
  const cand = [['月', .93], ['日', .03], ['灯', .02], ['星', .01]];
  const bars = cand.map(([c, p], i) => {
    const d = H(`<div style="display:flex;align-items:center;gap:20px;font-size:44px"><span style="font-family:var(--kai);width:60px">${c}</span><span class="bb" style="display:inline-block;height:40px;border-radius:8px;background:${i ? '#5b6a92' : 'var(--ok)'};width:0"></span><span class="pv f" style="font-size:36px"></span></div>`, 720, 560 + i * 70, {anchor: 'l'}, h);
    return {d, bb: d.querySelector('.bb'), pv: d.querySelector('.pv'), p};
  });
  const ssTag = H('自监督学习：从数据本身出题 · 大语言模型就这样练成', 960, 870, {cls: 'chip y lg'}, h);
  return t => {
    rise(head, t, T(0) - .2, T(3));
    const sOn = 1 - P(t, T(3), .5);
    vis(sTitle, sOn * P(t, T(1), .4));
    pets.forEach((p, i) => { vis(p.d, sOn * P(t, T(1) + .2 + i * .12, .4)); vis(p.tg, P(t, at(1, .35) + i * .15, .3)); });
    vis(teacher, sOn * P(t, at(1, .55), .4));
    vis(uTitle, sOn * P(t, T(2), .4)); vis(ug, sOn * P(t, T(2), .4)); vis(uCap, sOn * P(t, at(2, .7), .4));
    const cu = P(t, at(2, .3), 2.2);
    ups.forEach(p => { const x = lerp(p.s[0], p.e[0], cu), y = lerp(p.s[1], p.e[1], cu); p.el.setAttribute('cx', x); p.el.setAttribute('cy', y); p.el.setAttribute('fill', cu > .6 ? p.col : '#9aa6c8'); });
    rings.forEach((r, i) => r.style.opacity = P(t, at(2, .62) + i * .1, .4));
    vis(poem, P(t, T(3) + .2, .5));
    const fill = P(t, at(3, .62), .4);
    setText(blank, fill > .5 ? '月' : '？'); blank.style.color = fill > .5 ? 'var(--ok)' : 'var(--y)';
    bars.forEach((b, i) => { vis(b.d, P(t, at(3, .25) + i * .08, .3)); const v = b.p * P(t, at(3, .3) + i * .08, .8); b.bb.style.width = (20 + 560 * v) + 'px'; setText(b.pv, v.toFixed(2)); });
    rise(ssTag, t, at(3, .7));
  };
});

// ===================== 分类与回归 =====================
scene('taskkind', ({g, h, T, E, at}) => {
  const head = H('监督学习的两大任务', 960, 165, {cls: 'title-m'}, h);
  function axes(x0, y0, w, hh, xl, yl) {
    const gg = S('g', {}, g);
    S('rect', {x: x0 - 40, y: y0 - hh - 40, width: w + 80, height: hh + 110, rx: 24, fill: 'rgba(255,255,255,.04)', stroke: 'rgba(255,255,255,.12)', 'stroke-width': 2}, gg);
    arrow(gg, x0, y0, x0 + w, y0, 'rgba(255,255,255,.6)', 3).style.opacity = 1; arrow(gg, x0, y0, x0, y0 - hh, 'rgba(255,255,255,.6)', 3).style.opacity = 1;
    const a = H(xl, x0 + w - 60, y0 + 34, {style: {fontSize: '28px', color: 'var(--muted)'}}, h), b = H(yl, x0 + 20, y0 - hh - 10, {anchor: 'l', style: {fontSize: '28px', color: 'var(--muted)'}}, h);
    return {gg, labs: [a, b]};
  }
  const A = axes(170, 780, 700, 440, '肿瘤大小', '患者年龄'), B = axes(1060, 780, 700, 440, '面积（㎡）', '价格（万元）');
  const R = rng(9), cls = S('g', {}, g);
  const shade = shape([[210, 351], [861, 351], [861, 750]], {fill: 'rgba(255,107,154,.12)'}, cls);
  const cpts = [...Array(28)].map(() => { const x = R(), y = R(), m = x + y > 1.05 + (R() - .5) * .25; return {x: 210 + x * 620, y: 750 - y * 380, m}; });
  const cEls = cpts.map(p => p.m
    ? S('path', {d: `M${p.x - 12} ${p.y - 12}L${p.x + 12} ${p.y + 12}M${p.x + 12} ${p.y - 12}L${p.x - 12} ${p.y + 12}`, stroke: COL.c, 'stroke-width': 5, 'stroke-linecap': 'round'}, cls)
    : S('circle', {cx: p.x, cy: p.y, r: 12, fill: 'none', stroke: COL.ok, 'stroke-width': 5}, cls));
  const bnd = stroke([[210, 351], [861, 750]], {stroke: COL.y, 'stroke-width': 6}, cls);
  const leg = H(`<span style="color:var(--ok)">○ 良性</span>　<span style="color:var(--c)">✕ 恶性</span>`, 640, 330, {style: {fontSize: '30px'}}, h);
  const q = glow(cls, 30, 'glowY'); move(q, 700, 420);
  const qlab = H('新病例 → 恶性？', 700, 370, {cls: 'chip c'}, h);
  const reg = S('g', {}, g);
  const rpts = [...Array(18)].map((_, i) => { const a = 30 + i * 8 + R() * 6, pr = 60 + a * 5.8 + (R() - .5) * 140; return [1060 + (a - 20) * 4.4, 780 - pr * .42]; });
  const rEls = rpts.map(p => dot(reg, p[0], p[1], 11, COL.a));
  const fitL = stroke([[1060, 780 - (60 + 20 * 5.8) * .42], [1760, 780 - (60 + 179 * 5.8) * .42]], {stroke: COL.y, 'stroke-width': 6}, reg);
  const qx = 1060 + (100 - 20) * 4.4, qy = 780 - (60 + 100 * 5.8) * .42;
  const vq = stroke([[qx, 780], [qx, qy]], {stroke: COL.b, 'stroke-width': 4, 'stroke-dasharray': '1 1'}, reg), hq = stroke([[qx, qy], [1060, qy]], {stroke: COL.b, 'stroke-width': 4}, reg);
  const qv = H('100㎡ → 约 640 万', qx + 160, qy - 70, {cls: 'chip b lg'}, h);
  const tagA = H('分类：是哪一类？', 520, 860, {cls: 'chip c xl'}, h), tagB = H('回归：是多少？', 1410, 860, {cls: 'chip b xl'}, h);
  const outA = H('输出：类别', 520, 250, {cls: 'chip lg'}, h), outB = H('输出：数值', 1410, 250, {cls: 'chip lg'}, h);
  return t => {
    rise(head, t, T(0) - .2);
    const a = P(t, T(0) + .4, .5), b = P(t, T(0) + .7, .5);
    vis(A.gg, a); A.labs.forEach(l => vis(l, a)); vis(B.gg, b); B.labs.forEach(l => vis(l, b));
    vis(cls, 1); cEls.forEach((e, i) => e.style.opacity = P(t, T(1) + .1 + i * .05, .3)); vis(leg, P(t, T(1) + .5, .4));
    draw(bnd, P(t, at(1, .55), .9)); vis(shade, P(t, at(1, .7), .6));
    vis(q, P(t, at(1, .85), .3) * (.7 + .3 * Math.sin(t * 6))); pop(qlab, t, at(1, .88));
    rEls.forEach((e, i) => e.style.opacity = P(t, T(2) + .1 + i * .06, .3));
    draw(fitL, P(t, at(2, .5), .9)); draw(vq, P(t, at(2, .72), .4)); draw(hq, P(t, at(2, .8), .4)); pop(qv, t, at(2, .85));
    rise(tagA, t, at(1, .1)); rise(tagB, t, at(2, .1));
    pop(outA, t, T(3) + .1); pop(outB, t, T(3) + .4);
    vis(head, P(t, T(0) - .2, .5) * (1 - P(t, T(3), .3)));
  };
});

// ===================== 整体步骤 =====================
scene('steps', ({g, h, T, E, at}) => {
  const head = H('机器学习的整体步骤', 960, 165, {cls: 'title-m'}, h);
  const hist = H(`<div class="tile" style="width:300px">${ico('db', 110, COL.a, 2.5)}历史数据</div>`, 380, 360, {}, h);
  const newd = H(`<div class="tile" style="width:300px">${ico('doc', 110, COL.b, 2.5)}新数据</div>`, 380, 740, {}, h);
  const model = H(`<div class="tile" style="width:340px;height:300px;justify-content:center;border-color:var(--y);box-shadow:0 0 50px rgba(255,224,102,.2)"><span class="gear">${ico('gear', 130, COL.y, 2.5)}</span>模型</div>`, 960, 550, {}, h);
  const gear = model.querySelector('.gear');
  const outp = H(`<div class="tile" style="width:300px">${ico('bulb', 110, COL.ok, 2.5)}预测结果</div>`, 1560, 550, {}, h);
  const a1 = growArrow(g, 540, 380, 780, 480, COL.a, 7), a2 = growArrow(g, 540, 720, 780, 620, COL.b, 7), a3 = growArrow(g, 1140, 550, 1400, 550, COL.ok, 7);
  const l1 = H('① 训练', 650, 380, {cls: 'chip a lg'}, h), l2 = H('② 输入', 650, 730, {cls: 'chip b lg'}, h), l3 = H('预测', 1270, 490, {cls: 'chip ok lg'}, h);
  const flow1 = [...Array(6)].map(() => dot(g, 0, 0, 9, COL.a)), flow2 = [...Array(4)].map(() => dot(g, 0, 0, 9, COL.b));
  const learn = H('学', 650, 260, {style: {fontSize: '110px', fontWeight: 900, color: 'var(--a)', fontFamily: 'var(--kai)'}}, h);
  const use = H('用', 1270, 760, {style: {fontSize: '110px', fontWeight: 900, color: 'var(--ok)', fontFamily: 'var(--kai)'}}, h);
  return t => {
    rise(head, t, T(0) - .2);
    pop(hist, t, T(1) - .1); a1.set(P(t, T(1) + .4, .6)); fade(l1, t, T(1) + .6);
    pop(model, t, T(0) + .6);
    gear.style.display = 'inline-block'; gear.style.transform = `rotate(${(t - T(1)) * 60 * P(t, T(1) + .5, .5)}deg)`;
    flow1.forEach((d, i) => { const u = ((t - T(1) - .9) * .6 + i / 6) % 1; d.style.opacity = t > T(1) + .9 && t < T(2) + 1 ? Math.sin(Math.PI * u) : 0; const p = along([[540, 380], [780, 480]], u); d.setAttribute('cx', p[0]); d.setAttribute('cy', p[1]); });
    pop(newd, t, T(2) - .1); a2.set(P(t, T(2) + .4, .6)); fade(l2, t, T(2) + .6);
    flow2.forEach((d, i) => { const u = ((t - T(2) - .9) * .7 + i / 4) % 1; d.style.opacity = t > T(2) + .9 ? Math.sin(Math.PI * u) : 0; const p = along([[540, 720], [780, 620]], u); d.setAttribute('cx', p[0]); d.setAttribute('cy', p[1]); });
    a3.set(P(t, at(2, .5), .6)); fade(l3, t, at(2, .6)); pop(outp, t, at(2, .7));
    pop(learn, t, T(3) + .1); pop(use, t, at(3, .25));
  };
});

// ===================== 微博 1 =====================
scene('weibo1', ({g, h, T, E, at}) => {
  const post = IMG('weibo_post', 520, 470, 694, 364, {cls: 'white', fit: 'contain', cap: '微博：发帖 · 点赞 · 评论 · 转发'}, h);
  const net = S('g', {}, g), R = rng(21), NP = [[1350, 470]];
  for (let i = 0; i < 26; i++) { const a = R() * 6.28, r = 110 + R() * 260; NP.push([1350 + Math.cos(a) * r * 1.25, 470 + Math.sin(a) * r * .95]); }
  const par = NP.map((p, i) => i === 0 ? -1 : NP.slice(0, i).reduce((b, q, j) => Math.hypot(q[0] - p[0], q[1] - p[1]) < Math.hypot(NP[b][0] - p[0], NP[b][1] - p[1]) ? j : b, 0));
  const depth = NP.map((_, i) => { let d = 0, k = i; while (par[k] >= 0) { k = par[k]; d++; } return d; });
  const nE = NP.map((p, i) => i ? S('line', {x1: NP[par[i]][0], y1: NP[par[i]][1], x2: p[0], y2: p[1], stroke: COL.b, 'stroke-width': 3}, net) : null);
  const nN = NP.map((p, i) => dot(net, p[0], p[1], i ? 11 : 22, i ? '#ffd6a0' : COL.b));
  const ctr = [['heart', '点赞', COL.c, 18400], ['chat', '评论', COL.a, 3260], ['share', '转发', COL.ok, 5120]].map(([ic, s, col, v], i) => {
    const d = H(`<span style="display:flex;align-items:center;gap:10px">${ico(ic, 38, col)}${s} <b class="v f" style="color:${col}">0</b></span>`, 1150 + i * 220, 860, {cls: 'chip'}, h);
    return {d, v: d.querySelector('.v'), n: v};
  });
  const eye = IMG('human_eye', 560, 500, 600, 600, {cap: '人眼观察：根本看不过来 ✗'}, h);
  const pc = IMG('computer', 1360, 500, 600, 600, {cap: '计算机处理：又快又全 ✓'}, h);
  // crawler
  const spider = IMG('spider', 400, 500, 460, 460, {cap: '网络爬虫'}, h);
  const pages = [0, 1, 2].map(i => H(`<div style="width:300px;height:170px;border-radius:14px;background:#f4f6ff;padding:12px;white-space:normal"><div style="display:flex;gap:6px;margin-bottom:10px"><i style="width:12px;height:12px;border-radius:50%;background:#ff6b6b"></i><i style="width:12px;height:12px;border-radius:50%;background:#ffd166"></i><i style="width:12px;height:12px;border-radius:50%;background:#6ee7a8"></i></div><div style="height:14px;width:80%;background:#c9d2ea;border-radius:7px;margin:8px 0"></div><div style="height:14px;width:60%;background:#c9d2ea;border-radius:7px;margin:8px 0"></div><div style="display:flex;gap:10px;margin-top:12px"><div style="width:90px;height:50px;background:#9db8ff;border-radius:8px"></div><div style="width:90px;height:50px;background:#ffc2a8;border-radius:8px"></div></div></div>`, 900, 280 + i * 230, {}, h));
  const db = H(`<div class="tile" style="width:260px">${ico('db', 120, COL.a, 2.5)}数据库</div>`, 1580, 500, {}, h);
  const kinds = [['text', '文字', COL.a], ['image', '图片', COL.c], ['video', '视频', COL.b], ['mic', '音频', COL.ok]];
  const flyers = [...Array(12)].map((_, i) => { const k = kinds[i % 4]; return {k: i, d: H(`<span style="display:flex;align-items:center;gap:8px">${ico(k[0], 34, k[2])}${k[1]}</span>`, 0, 0, {cls: 'chip', style: {fontSize: '26px', padding: '6px 16px'}}, h)}; });
  const crawlBug = icoS(g, 'search', 0, 0, 50, COL.y, 4);
  // preprocessing
  const segs = [['j', '@'], ['k', '上海移动'], ['j', ' @'], ['k', '中国移动10086'], ['j', ' @'], ['k', '中国移动'], ['s', ' '], ['k', '天天'], ['s', '给我'], ['k', '发'], ['k', '升级套餐'], ['s', '的'], ['k', '推送'], ['j', '，'], ['s', '我'], ['k', '抱怨几句'], ['s', '怎么还就'], ['k', '预约成功'], ['s', '了'], ['j', '？'], ['k', '厉害'], ['s', '呀'], ['j', '！'], ['s', '果然'], ['k', '人工智能'], ['j', '[允悲]'], ['j', '&lt;br/&gt;']];
  const wt = H(`<div class="wtxt">${segs.map(([c, s]) => `<span class="${c === 'j' ? 'junk' : c === 's' ? 'stop' : ''}" data-c="${c}">${s}</span>`).join('')}</div>`, 960, 350, {}, h);
  const spans = [...wt.querySelectorAll('span')].map((e, i) => ({e, c: segs[i][0]}));
  const cats = [['标点符号', 'red'], ['HTML 等特殊格式', 'red'], ['表情 / 乱码', 'red'], ['停用词：的 了 呢 我……', 'b']].map(([s, c], i) => H(s, 330 + i * 410, 560, {cls: `chip ${c} lg`}, h));
  const toks = ['上海移动', '中国移动', '10086', '中国移动', '天天', '发', '升级套餐', '推送', '抱怨几句', '预约成功', '厉害', '人工智能'].map((s, i) => H(s, 300 + (i % 6) * 265, 700 + (i / 6 | 0) * 90, {cls: 'tok'}, h));
  const clean = H('清洗完成 ✓', 960, 880, {cls: 'chip ok lg'}, h);
  return t => {
    const s0 = win(t, T(0) - .3, T(1));
    vis(post, s0); kb(post, lerp(1, 1.05, U(t, T(0), 8)));
    vis(net, s0);
    NP.forEach((p, i) => { const tt = T(0) + .6 + depth[i] * .7 + (i % 5) * .08; nN[i].style.opacity = P(t, tt, .3); if (nE[i]) nE[i].style.opacity = P(t, tt - .2, .4) * .8; });
    ctr.forEach((c, i) => { vis(c.d, s0 * P(t, at(0, .45) + i * .1, .4)); countUp(c.v, t, at(0, .45), 5, 0, c.n); });
    const s1 = win(t, T(1), T(2));
    vis(eye, s1 * P(t, T(1), .5)); vis(pc, s1 * P(t, at(1, .45), .5)); kb(eye, lerp(1, 1.08, U(t, T(1), 10))); kb(pc, lerp(1.08, 1, U(t, T(1), 10)));
    const s2 = win(t, T(2), T(3));
    vis(spider, s2); kb(spider, 1 + .03 * Math.sin(t * 2));
    pages.forEach((p, i) => vis(p, s2 * P(t, T(2) + .3 + i * .2, .4)));
    vis(db, s2 * P(t, at(2, .3), .4));
    const cyc = 3.0;
    vis(crawlBug, s2 * (t > T(2) + .6 ? 1 : 0));
    { const u = ((t - T(2)) / cyc % 1 + 1) % 1, k = Math.floor(((t - T(2)) / cyc) % 3 + 3) % 3; const p = along([[760, 200], [1060, 200], [1060, 360], [760, 360], [760, 430], [1060, 430], [1060, 590], [760, 590], [760, 660], [1060, 660], [1060, 820], [760, 820]], u);
      crawlBug.firstChild.setAttribute('transform', `translate(${p[0] - 25} ${p[1] - 25}) scale(${50 / 48})`); }
    flyers.forEach((f, i) => {
      const st = at(2, .35) + i * .55, u = U(t, st, 1.6), py = 280 + (i % 3) * 230;
      vis(f.d, s2 * (u > 0 && u < 1 ? Math.min(1, Math.sin(Math.PI * u) * 2) : 0));
      at2(f.d, lerp(1060, 1480, ease(u)), lerp(py, 500, ease(u)), '');
    });
    const s3 = P(t, T(3), .5);
    vis(wt, s3);
    spans.forEach(({e, c}, i) => {
      if (c === 'k') return;
      const tt = at(3, c === 'j' ? .25 : .55) + (i % 9) * .1;
      e.style.setProperty('--k', P(t, tt, .3));
      e.style.opacity = 1 - .75 * P(t, at(4, .05), .5);
    });
    cats.forEach((c, i) => rise(c, t, at(3, i < 3 ? .2 + i * .08 : .52)));
    toks.forEach((k, i) => pop(k, t, at(4, .08) + i * .12));
    pop(clean, t, at(4, .75));
  };
});

// ===================== 微博 2 =====================
scene('weibo2', ({g, h, T, E, at}) => {
  const words = [['人工智能', 98], ['毕业', 76], ['好莱坞', 64], ['美国', 58], ['特朗普', 51], ['喜欢', 44], ['未来', 39], ['中国', 35]];
  const bt = H('词频统计 Top 8', 470, 230, {cls: 'chip a lg'}, h);
  const bars = words.map(([w, v], i) => {
    const lab = H(w, 330, 310 + i * 66, {anchor: 'r', cls: 'blab'}, h);
    const b = H('', 350, 310 + i * 66, {anchor: 'l', style: {height: '44px', borderRadius: '0 10px 10px 0', background: `hsl(${250 - i * 22},80%,62%)`, width: '0px'}}, h);
    const n = H(String(v), 360, 310 + i * 66, {anchor: 'l', cls: 'f', style: {fontSize: '28px', color: '#fff'}}, h);
    return {lab, b, n, v};
  });
  const cloud = IMG('wordcloud', 1350, 520, 760, 500, {cls: 'white', fit: 'contain', cap: '词云图：越高频，字越大'}, h);
  // co-occurrence graph
  const CN = {ai: ['人工智能', 960, 520, 1.4], fu: ['未来', 700, 330, 1], by: ['毕业', 640, 640, 1], zg: ['中国', 980, 790, 1], xh: ['喜欢', 1220, 330, 1], hl: ['好莱坞', 1500, 560, 1], mg: ['美国', 1430, 790, 1], tl: ['特朗普', 1660, 380, 1], jb: ['就业', 380, 480, .85]};
  const CE = [['ai', 'fu', 8], ['ai', 'by', 6], ['ai', 'zg', 5], ['ai', 'xh', 4], ['by', 'jb', 6], ['by', 'fu', 3], ['hl', 'mg', 7], ['mg', 'tl', 8], ['hl', 'tl', 3], ['xh', 'hl', 3], ['zg', 'mg', 4]];
  const cg = S('g', {}, g);
  const cEdges = CE.map(([a, b, w]) => stroke([[CN[a][1], CN[a][2]], [CN[b][1], CN[b][2]]], {stroke: COL.teal, 'stroke-width': w * 1.6, 'stroke-opacity': .7}, cg));
  const cNodes = Object.values(CN).map(([s, x, y, k]) => H(s, x, y, {style: {fontSize: (38 * k) + 'px', fontWeight: 700, padding: '10px 24px', borderRadius: '40px', background: '#103a3a', border: '3px solid var(--teal)', color: '#dffcf8'}}, h));
  const cTitle = H('词语共现网络：经常一起出现的词连在一起', 960, 200, {cls: 'chip lg', style: {color: 'var(--teal)', borderColor: 'var(--teal)'}}, h);
  // sentiment
  const buckets = [['smile', '开心', COL.ok], ['angry', '愤怒', COL.warn], ['sad', '失望', COL.a]].map(([ic, s, col], i) => {
    const d = H(`<div class="tile" style="width:300px;border-color:${col}">${ico(ic, 110, col, 2.5)}${s}<span class="n f" style="font-size:44px;color:${col}">0</span></div>`, 560 + i * 400, 690, {}, h);
    return {d, n: d.querySelector('.n'), col};
  });
  const posts = [['今天的发布会太惊艳了！', 0], ['客服电话一直打不通，气死了', 1], ['期待了好久，结果就这？', 2], ['终于毕业啦，感谢遇见！', 0], ['又涨价了？太离谱！', 1], ['比赛输了，有点难过', 2], ['新功能真好用', 0], ['排队两小时没买到', 2]];
  const pEls = posts.map(([s]) => H(s, 960, 260, {cls: 'card sm', style: {background: '#f4f6ff', color: '#1a2140', fontSize: '32px'}}, h));
  const sTitle = H('情感分析', 960, 180, {cls: 'chip y lg'}, h);
  // applications
  const apps = [['chart', '热点趋势分析'], ['share', '传播路径分析'], ['users', '用户参与度分析'], ['layers', '文本分类与主题'], ['pin', '地域分析']].map(([ic, s], i) =>
    H(`<div class="tile" style="width:300px">${ico(ic, 90, [COL.a, COL.b, COL.ok, COL.purple, COL.c][i], 2.5)}${s}</div>`, 240 + i * 360, 540, {}, h));
  return t => {
    const s0 = win(t, T(0) - .3, T(1));
    vis(bt, s0);
    bars.forEach((b, i) => { const v = P(t, T(0) + .2 + i * .15, .8); [b.lab, b.n].forEach(e => vis(e, s0 * P(t, T(0) + .2 + i * .15, .3))); vis(b.b, s0); b.b.style.width = (b.v * 5.4 * v) + 'px'; b.n.style.left = (360 + b.v * 5.4 * v) + 'px'; });
    vis(cloud, s0 * P(t, at(0, .5), .5)); kb(cloud, lerp(1.25, 1, P(t, at(0, .5), 2.5)));
    const s1 = win(t, T(1), T(2));
    vis(cg, s1); vis(cTitle, s1);
    cNodes.forEach((n, i) => { vis(n, s1 * P(t, T(1) + i * .12, .3)); });
    cEdges.forEach((e, i) => draw(e, P(t, T(1) + .6 + i * .18, .5)));
    const s2 = win(t, T(2), T(3));
    vis(sTitle, s2);
    const cnt = [0, 0, 0];
    posts.forEach(([s, k], i) => {
      const st = at(2, .12) + i * ((E(2) - at(2, .12)) / posts.length), u = U(t, st, 1.0);
      if (u >= 1) cnt[k]++;
      vis(pEls[i], s2 * (u > 0 && u < 1 ? clamp(Math.min(u * 5, (1 - u) * 4)) : 0));
      at2(pEls[i], lerp(960, 560 + k * 400, ease(clamp(u * 1.3 - .2))), lerp(280, 640, ease(u)), `scale(${lerp(1, .5, ease(clamp(u * 1.3 - .3)))})`);
    });
    buckets.forEach((b, i) => { vis(b.d, s2 * P(t, T(2) + .2 + i * .1, .4)); setText(b.n, String(cnt[i])); });
    apps.forEach((a, i) => pop(a, t, T(3) + .2 + i * .45));
  };
});

// ===================== 模型 =====================
scene('model', ({g, h, T, E, at}) => {
  const q = H(`<div class="title-xl">模型 = <span style="color:var(--y)">？</span></div>`, 960, 500, {}, h);
  const mach = H(`<div style="width:360px;height:240px;border-radius:30px;background:linear-gradient(135deg,#2f6bff,#8a5cf6);display:flex;align-items:center;justify-content:center;box-shadow:0 0 60px rgba(120,120,255,.45)"><span class="f" style="font-size:110px;color:#fff;font-style:italic">f(x)</span></div>`, 960, 470, {}, h);
  const ain = growArrow(g, 560, 470, 770, 470, 'rgba(255,255,255,.7)', 7), aout = growArrow(g, 1150, 470, 1360, 470, 'rgba(255,255,255,.7)', 7);
  const lin = H('输入 x', 640, 410, {cls: 'chip a'}, h), lout = H('输出 y', 1270, 410, {cls: 'chip ok'}, h);
  const eq = H(`<span class="f" style="font-size:64px">y = f(x)</span>　<span class="lead">把输入映射成输出</span>`, 960, 230, {}, h);
  const ex = [
    [`<div class="ph" style="width:220px;height:260px"><img src="img/teacher.jpg" style="object-fit:cover;object-position:50% 20%"></div>`, `<span class="chip ok xl">王一博</span>`],
    [`<div class="tile" style="padding:16px 24px">${ico('house', 90, COL.b, 2.5)}浦东 · 90㎡</div>`, `<span class="chip ok xl">约 600 万</span>`],
    [`<span class="chip a xl">你好，世界</span>`, `<span class="chip ok xl f">Hello, world</span>`],
  ].map(([a, b]) => [H(a, 330, 470, {}, h), H(b, 1600, 470, {}, h)]);
  // true function vs learned
  const X0 = 360, X1 = 1560, Y0 = 830, HH = 300;
  const fT = u => .45 + .25 * Math.sin(u * 5.2 + .4) + .2 * u;
  const px = u => X0 + u * (X1 - X0), py = v => Y0 - v * HH;
  const chart = S('g', {}, g);
  S('line', {x1: X0, y1: Y0, x2: X1, y2: Y0, stroke: 'rgba(255,255,255,.35)', 'stroke-width': 3}, chart);
  const truth = S('path', {d: D([...Array(101)].map((_, i) => [px(i / 100), py(fT(i / 100))])), fill: 'none', stroke: 'rgba(255,255,255,.35)', 'stroke-width': 4, 'stroke-dasharray': '10 12'}, chart);
  const R = rng(4), samp = [...Array(16)].map((_, i) => { const u = (i + .5) / 16 + (R() - .5) * .03; return [u, fT(u) + (R() - .5) * .07]; });
  const sEls = samp.map(([u, v]) => dot(chart, px(u), py(v), 10, COL.b));
  const learned = S('path', {fill: 'none', stroke: COL.y, 'stroke-width': 6, 'stroke-linecap': 'round'}, chart);
  const lt = H('真实函数（未知）', 1380, 480, {style: {fontSize: '28px', color: 'var(--muted)'}}, h);
  const ld = H('● 训练数据', 520, 480, {style: {fontSize: '30px', color: 'var(--b)'}}, h);
  const ll = H('训练 = 根据数据找出 f', 960, 480, {cls: 'chip y lg'}, h);
  return t => {
    vis(q, win(t, T(0) - .2, T(1))); setScale(q, 1 + .03 * Math.sin(t * 3));
    const up = P(t, T(3), .8), mOn = P(t, T(1), .5);
    vis(mach, mOn); mach.style.transform = `${mach._base} translateY(${-170 * up}px) scale(${lerp(1, .6, up)})`;
    [ain, aout].forEach((a, i) => { a.set(P(t, T(1) + .4 + i * .3, .5)); a.style.opacity = +a.style.opacity * (1 - up); });
    [lin, lout].forEach((l, i) => vis(l, P(t, T(1) + .6 + i * .3, .4) * (1 - up)));
    vis(eq, P(t, at(1, .3), .5) * (1 - P(t, T(3), .4)));
    ex.forEach(([a, b], i) => {
      const s = at(2, i / 3), e2 = at(2, (i + 1) / 3), u = P(t, s, .6);
      vis(a, u * (1 - P(t, e2 - .2, .3))); a.style.transform = `${a._base} translateX(${(1 - u) * -200}px)`;
      pop(b, t, s + .8, e2 - .2);
    });
    vis(chart, P(t, T(3) + .3, .5));
    sEls.forEach((s, i) => s.style.opacity = P(t, at(3, .15) + i * .05, .3));
    vis(lt, P(t, T(3) + .5, .5)); vis(ld, P(t, at(3, .2), .5));
    const k = P(t, at(3, .4), 4.5);
    learned.setAttribute('d', D([...Array(101)].map((_, i) => { const u = i / 100; return [px(u), py(lerp(.35 + .45 * u, fT(u), k))]; })));
    learned.style.opacity = P(t, at(3, .35), .4);
    rise(ll, t, at(3, .6));
  };
});

// ===================== 损失与优化 =====================
scene('loss', ({g, h, T, E, at}) => {
  const R = rng(17), data = [...Array(14)].map((_, i) => { const x = .4 + i * .68; return [x, .8 * x + 1 + (R() - .5) * 2.2]; });
  const L = w => data.reduce((s, [x, y]) => s + (y - w * x - 1) ** 2, 0) / data.length;
  const dL = w => data.reduce((s, [x, y]) => s - 2 * x * (y - w * x - 1), 0) / data.length;
  // left: scatter
  const lx = x => 160 + x * 72, ly = y => 760 - y * 48;
  const left = S('g', {}, g);
  S('rect', {x: 110, y: 190, width: 820, height: 610, rx: 24, fill: 'rgba(255,255,255,.04)', stroke: 'rgba(255,255,255,.12)', 'stroke-width': 2}, left);
  S('line', {x1: 150, y1: 760, x2: 900, y2: 760, stroke: 'rgba(255,255,255,.4)', 'stroke-width': 3}, left);
  S('line', {x1: 150, y1: 760, x2: 150, y2: 210, stroke: 'rgba(255,255,255,.4)', 'stroke-width': 3}, left);
  const res = data.map(() => S('line', {stroke: COL.warn, 'stroke-width': 4}, left));
  const pts = data.map(([x, y]) => dot(left, lx(x), ly(y), 11, COL.a));
  const fit = S('line', {stroke: COL.y, 'stroke-width': 7, 'stroke-linecap': 'round'}, left);
  const lossLab = H('', 520, 240, {cls: 'chip red lg f'}, h);
  const formula = H(`<span class="f" style="font-size:44px">L = ${fracH('1', 'N')}Σ(<i>y</i> − <i class="vy">ŷ</i>)<sup>2</sup></span>`, 520, 860, {}, h);
  // right: loss curve
  const W0 = -.1, W1 = 1.7, rx = w => 1060 + (w - W0) / (W1 - W0) * 740, ry = v => 770 - Math.min(v, 25) * 20;
  const right = S('g', {}, g);
  S('rect', {x: 1010, y: 190, width: 840, height: 610, rx: 24, fill: 'rgba(255,255,255,.04)', stroke: 'rgba(255,255,255,.12)', 'stroke-width': 2}, right);
  const curve = stroke([...Array(121)].map((_, i) => { const w = W0 + (W1 - W0) * i / 120; return [rx(w), ry(L(w))]; }), {stroke: COL.c, 'stroke-width': 6}, right);
  const rT = H('损失函数的「山谷」', 1430, 230, {style: {fontSize: '32px', color: 'var(--c)'}}, h);
  const wLab = H('参数 w', 1790, 775, {style: {fontSize: '28px', color: 'var(--muted)'}}, h);
  const tan = S('line', {stroke: 'rgba(255,255,255,.7)', 'stroke-width': 3, 'stroke-dasharray': '8 8'}, right);
  const steps = [S('g', {}, right)][0];
  const ball = glow(right, 30, 'glowY');
  const hint = H('蒙眼下山：沿最陡的下坡方向，迈一小步', 1430, 860, {cls: 'chip y lg'}, h);
  // gradient-descent iterates
  const ws = [-.05]; for (let k = 0; k < 9; k++) ws.push(ws[k] - .006 * dL(ws[k]));
  const footprints = ws.map(w => dot(steps, rx(w), ry(L(w)), 7, COL.y, {opacity: 0}));
  const g0 = at(3, .35), g1 = at(4, .7), dt = (g1 - g0) / (ws.length - 1);
  const wAt = t => {
    if (t < T(0) + .5) return ws[0];
    const k = clamp((t - g0) / dt, 0, ws.length - 1), i = Math.floor(k), f = ease(clamp((k - i) / .55));
    return i >= ws.length - 1 ? ws[ws.length - 1] : lerp(ws[i], ws[i + 1], f);
  };
  return t => {
    vis(left, P(t, T(0) - .2, .5));
    const w = wAt(t);
    fit.setAttribute('x1', lx(0)); fit.setAttribute('y1', ly(1)); fit.setAttribute('x2', lx(10.4)); fit.setAttribute('y2', ly(w * 10.4 + 1));
    fit.style.opacity = P(t, T(0) + .6, .4);
    const rv = P(t, T(1), .6);
    data.forEach(([x, y], i) => { const yh = w * x + 1; res[i].setAttribute('x1', lx(x)); res[i].setAttribute('x2', lx(x)); res[i].setAttribute('y1', ly(y)); res[i].setAttribute('y2', ly(lerp(y, yh, P(t, T(1) + i * .08, .4)))); res[i].style.opacity = rv; });
    vis(lossLab, rv); setText(lossLab, `损失 L = ${L(w).toFixed(2)}`);
    vis(formula, P(t, at(1, .4), .5));
    vis(right, P(t, T(2), .5)); vis(rT, P(t, T(2) + .3, .5)); vis(wLab, P(t, T(2) + .3, .5));
    draw(curve, P(t, T(2) + .2, 1.2));
    const bOn = P(t, at(2, .5), .4);
    vis(ball, bOn); move(ball, rx(w), ry(L(w)) - 6);
    const n = norm([1, -dL(w) * 20 / (740 / (W1 - W0))]);
    tan.setAttribute('x1', rx(w) - n[0] * 120); tan.setAttribute('y1', ry(L(w)) - n[1] * 120); tan.setAttribute('x2', rx(w) + n[0] * 120); tan.setAttribute('y2', ry(L(w)) + n[1] * 120);
    tan.style.opacity = P(t, T(3), .5) * (1 - P(t, at(4, .8), .5));
    footprints.forEach((f, i) => f.style.opacity = t >= g0 + i * dt ? .8 : 0);
    rise(hint, t, at(3, .1));
  };
});

// ===================== 图像 = 矩阵 =====================
scene('image', ({g, h, T, E, at}) => {
  const big = IMG('tiger_sq', 960, 500, 560, 560, {}, h);
  const q = H('计算机眼里，图片是什么？', 960, 860, {cls: 'chip y xl'}, h);
  const TG = window.TIGER, sc = 560 / TG.n;
  const box = S('rect', {fill: 'none', stroke: COL.y, 'stroke-width': 4}, g);
  const cs = 40, GX = 1050, GY = 300;
  const grid = S('g', {}, g), cells = [];
  for (let j = 0; j < TG.h; j++) for (let i = 0; i < TG.w; i++) {
    const v = TG.v[j][i];
    const r = S('rect', {x: GX + i * cs, y: GY + j * cs, width: cs - 2, height: cs - 2, fill: `rgb(${v},${v},${v})`}, grid);
    const tx = S('text', {x: GX + i * cs + cs / 2 - 1, y: GY + j * cs + cs / 2, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': 15, 'font-family': 'DejaVu Sans Mono', fill: v > 128 ? '#111' : '#eee'}, grid);
    tx.textContent = v; cells.push({r, tx, i, j});
  }
  const links = [0, 1].map(() => S('line', {stroke: 'rgba(255,224,102,.6)', 'stroke-width': 2.5, 'stroke-dasharray': '8 6'}, g));
  const gl = H(`<span>每个小方格 = 一个像素 = 一个数字</span>`, GX + TG.w * cs / 2, GY - 50, {cls: 'chip y'}, h);
  const scale = H(`<span style="display:flex;align-items:center;gap:16px"><b class="f">0</b><span style="width:300px;height:26px;border-radius:6px;background:linear-gradient(90deg,#000,#fff)"></span><b class="f">255</b></span>`, GX + TG.w * cs / 2, GY + TG.h * cs + 50, {style: {fontSize: '34px'}}, h);
  const shapeL = H('矩阵大小：372 × 372', GX + TG.w * cs / 2, GY + TG.h * cs + 120, {cls: 'chip mono'}, h);
  const ops = [['矩阵转置 A<sup>T</sup>', '沿对角线翻转'], ['左右翻转', '镜像'], ['A + 50', '变亮'], ['255 − A', '反色（底片）']];
  const panels = ops.map(([a, b], i) => {
    const d = IMG('tiger_sq', 270 + i * 460, 470, 400, 400, {cap: `<b class="f" style="color:var(--y)">${a}</b>　<span class="muted">${b}</span>`}, h);
    const ov = document.createElement('div'); Object.assign(ov.style, {position: 'absolute', inset: 0, background: 'rgb(50,50,50)', mixBlendMode: 'plus-lighter', opacity: 0});
    d.querySelector('.ph').appendChild(ov); d.ov = ov; return d;
  });
  return t => {
    const toLeft = P(t, T(1), .8), bOn = 1 - P(t, T(2), .5);
    vis(big, P(t, T(0) - .3, .5) * bOn);
    big.style.transform = `${big._base} translateX(${-450 * toLeft}px)`;
    fade(q, t, at(0, .3), T(1));
    const bx = 960 - 450 * toLeft - 280 + TG.x0 * sc, by = 500 - 280 + TG.y0 * sc;
    box.setAttribute('x', bx); box.setAttribute('y', by); box.setAttribute('width', TG.w * sc); box.setAttribute('height', TG.h * sc);
    box.style.opacity = P(t, at(1, .1), .4) * bOn;
    const gOn = P(t, at(1, .2), .5) * bOn;
    vis(grid, gOn);
    cells.forEach(c => { const v = P(t, at(1, .2) + (c.i + c.j) * .04, .3); c.r.style.opacity = v; c.tx.style.opacity = P(t, at(1, .45) + (c.i + c.j) * .03, .3); });
    links.forEach((l, k) => { l.setAttribute('x1', bx + TG.w * sc); l.setAttribute('y1', by + k * TG.h * sc); l.setAttribute('x2', GX); l.setAttribute('y2', GY + k * TG.h * cs); l.style.opacity = gOn; });
    vis(gl, gOn); vis(scale, gOn * P(t, at(1, .6), .4)); vis(shapeL, gOn * P(t, at(1, .75), .4));
    panels.forEach((p, i) => vis(p, P(t, T(2) + .1 + i * .12, .5)));
    const u0 = P(t, at(2, .3), 1.2), u1 = P(t, at(2, .68), 1.0), u2 = P(t, at(3, .1), .8), u3 = P(t, at(3, .5), .8);
    panels[0].img.style.transform = `matrix(${1 - u0},${u0},${u0},${1 - u0},0,0)`;
    panels[1].img.style.transform = `scaleX(${1 - 2 * u1})`;
    panels[2].ov.style.opacity = u2;
    panels[3].img.style.filter = `invert(${u3})`;
    panels.forEach((p, i) => setScale(p, 1 + .05 * bump(t, [at(2, .3), at(2, .68), at(3, .1), at(3, .5)][i], 1.2)));
  };
});

// ===================== PCA 与人脸识别 =====================
scene('pca', ({g, h, T, E, at}) => {
  const head = H('主成分分析 PCA：用少量最重要的成分，近似表示高维图片', 960, 170, {cls: 'title-m', style: {fontSize: '46px'}}, h);
  const dims = H(`<span style="display:flex;align-items:center;gap:22px"><span class="chip lg f">4096 个数字</span><span style="font-size:50px;color:var(--y)">⟶</span><span class="chip y lg f">几个成分</span></span>`, 960, 270, {}, h);
  const srcs = ['pca3', 'pca10', 'pca100', 'pca_orig'], labs = ['3 个成分', '10 个成分', '100 个成分', '原图'];
  const ims = srcs.map(s => IMG(s, 960, 540, 1100, 400, {cls: 'white', fit: 'contain'}, h));
  const nLab = H('', 960, 800, {cls: 'chip y xl'}, h);
  const sl = H(`<div style="width:900px;height:16px;border-radius:8px;background:rgba(255,255,255,.12)"><div class="fl" style="height:100%;border-radius:8px;background:linear-gradient(90deg,var(--a),var(--y));width:0"></div></div>`, 960, 880, {}, h);
  const fl = sl.querySelector('.fl');
  const fr = IMG('facerec', 960, 480, 1500, 610, {cls: 'white', fit: 'contain'}, h);
  const chipsFR = [['PCA 降维：提取少量特征', 'a', 640], ['SVM 分类器：判断是谁', 'ok', 1280]].map(([s, c, x]) => H(s, x, 860, {cls: `chip ${c} lg`}, h));
  const apps = [['phone', '刷脸解锁'], ['door', '门禁考勤'], ['cctv', '安全监控']].map(([ic, s], i) => H(`<div class="tile" style="width:360px">${ico(ic, 110, [COL.a, COL.ok, COL.b][i], 2.5)}${s}</div>`, 520 + i * 440, 540, {}, h));
  const seq = [at(1, .05), at(1, .32), at(1, .6), at(1, .88)];
  return t => {
    const s0 = 1 - P(t, T(2), .5);
    vis(head, P(t, T(0) - .2, .5) * s0); vis(dims, P(t, at(0, .5), .5) * s0);
    let k = -1; seq.forEach((s, i) => { if (t >= s) k = i; });
    ims.forEach((im, i) => { const on = i === (k < 0 ? 3 : k); vis(im, s0 * P(t, T(0) + .3, .5) * (on ? 1 : 0)); });
    vis(nLab, s0 * P(t, seq[0], .3)); setText(nLab, k < 0 ? '' : `n = ${labs[k]}`);
    vis(sl, s0 * P(t, seq[0], .3)); fl.style.width = (k < 0 ? 0 : [12, 35, 75, 100][k]) + '%';
    const s2 = win(t, T(2), T(3));
    vis(fr, s2); kb(fr, lerp(1, 1.05, U(t, T(2), 10)));
    chipsFR.forEach((c, i) => vis(c, s2 * P(t, at(2, .3 + i * .3), .4)));
    apps.forEach((a, i) => pop(a, t, T(3) + .1 + i * .4));
  };
});
