// Part 3 — 统计机器学习 · 深度学习

// ===================== 统计机器学习 =====================
scene('statml', ({g, h, T, E, at}) => {
  const head = H(`<span style="display:flex;align-items:center;gap:24px"><span class="chip a xl">统计学</span><span style="font-size:60px">＋</span><span class="chip ok xl">机器学习</span><span style="font-size:60px;color:var(--y)">＝</span><span class="chip y xl">统计机器学习</span></span>`, 960, 440, {}, h);
  const sub3 = ['学习规律', '做出预测', '进行推断'].map((s, i) => H(s, 660 + i * 300, 600, {cls: 'chip lg'}, h));
  // SVM
  const sv = S('g', {}, g), C = [960, 540], th = -.55, nv = [Math.cos(th + Math.PI / 2), Math.sin(th + Math.PI / 2)], dv = [Math.cos(th), Math.sin(th)], M = 70;
  const R = rng(31), pts = [];
  const sd = p => (p[0] - C[0]) * nv[0] + (p[1] - C[1]) * nv[1];
  pts.push([add(C, add(mul(dv, -120), mul(nv, M))), 1], [add(C, add(mul(dv, 140), mul(nv, M))), 1], [add(C, add(mul(dv, 10), mul(nv, -M))), -1]);
  while (pts.length < 34) { const p = [520 + R() * 880, 220 + R() * 640], s = sd(p); if (Math.abs(s) > M + 25 && Math.abs(s) < 330) pts.push([p, Math.sign(s)]); }
  const band = S('path', {fill: 'rgba(255,224,102,.12)'}, sv);
  const mlA = S('line', {stroke: 'rgba(255,224,102,.6)', 'stroke-width': 3, 'stroke-dasharray': '10 8'}, sv), mlB = S('line', {stroke: 'rgba(255,224,102,.6)', 'stroke-width': 3, 'stroke-dasharray': '10 8'}, sv);
  const sep = S('line', {stroke: COL.y, 'stroke-width': 6, 'stroke-linecap': 'round'}, sv);
  const pEls = pts.map(([p, c]) => c > 0 ? dot(sv, p[0], p[1], 13, COL.b) : S('rect', {x: p[0] - 12, y: p[1] - 12, width: 24, height: 24, rx: 4, fill: COL.a}, sv));
  const rings = pts.slice(0, 3).map(([p]) => S('circle', {cx: p[0], cy: p[1], r: 24, fill: 'none', stroke: '#fff', 'stroke-width': 3}, sv));
  const road = H('找一条最宽的「马路」', 470, 200, {cls: 'chip y lg'}, h);
  const svl = H('支持向量', 960 - 120 * dv[0] + M * nv[0] + 90, 540 - 120 * dv[1] + M * nv[1] - 60, {cls: 'chip', style: {fontSize: '26px'}}, h);
  const algs = [['线性模型', 'a'], ['逻辑斯蒂回归', 'ok'], ['朴素贝叶斯', 'b'], ['支持向量机 SVM', 'y'], ['集成学习', 'p']].map(([s, c], i) => H(s, i < 3 ? 420 + i * 540 : 690 + (i - 3) * 540, 320 + (i / 3 | 0) * 140, {cls: `chip ${c} xl`}, h));
  const interp = H(`<span style="display:flex;align-items:center;gap:16px">${ico('book', 50, COL.ok)}数学理论扎实 · 可解释性好</span>`, 960, 640, {cls: 'chip ok xl'}, h);
  const era = S('g', {}, g);
  S('rect', {x: 260, y: 196, width: 1400, height: 36, rx: 18, fill: 'rgba(255,255,255,.08)'}, era);
  const eraFill = S('rect', {x: 260, y: 196, width: 0, height: 36, rx: 18, fill: 'url(#eraG)'}, era);
  linear('eraG', [['0%', COL.a], ['100%', COL.y]]);
  const eraL = [['1990', 260], ['2010', 1660]].map(([s, x]) => H(s, x, 260, {cls: 'year'}, h));
  const eraT = H('统计机器学习大放异彩', 960, 160, {cls: 'chip y lg'}, h);
  const fe = IMG('feateng', 960, 590, 1100, 500, {cls: 'white', fit: 'contain', cap: ''}, h);
  const feTag = H('特征工程：由专家精心设计特征', 1390, 345, {cls: 'chip b lg'}, h);
  return t => {
    const s0 = win(t, T(0) - .3, T(1));
    vis(head, s0); setScale(head, lerp(.8, 1, P(t, T(0) - .3, .6)));
    sub3.forEach((c, i) => vis(c, s0 * P(t, at(0, .5) + i * .12, .4)));
    const s1 = win(t, T(1), T(2));
    vis(sv, s1); pEls.forEach((e, i) => e.style.opacity = P(t, T(1) + i * .03, .3));
    const st = U(t, at(1, .15), 3.2), wob = (1 - ease(st));
    const a = th + .45 * Math.sin(st * 9) * wob, off = 60 * Math.sin(st * 7 + 1) * wob;
    const d2 = [Math.cos(a), Math.sin(a)], n2 = [-d2[1], d2[0]], c2 = add(C, mul(nv, off));
    const L = 620, p1 = add(c2, mul(d2, -L)), p2 = add(c2, mul(d2, L));
    sep.setAttribute('x1', p1[0]); sep.setAttribute('y1', p1[1]); sep.setAttribute('x2', p2[0]); sep.setAttribute('y2', p2[1]);
    sep.style.opacity = P(t, at(1, .1), .3);
    const m = M * P(t, at(1, .6), 1.2);
    const q = s => [add(add(c2, mul(n2, s)), mul(d2, -L)), add(add(c2, mul(n2, s)), mul(d2, L))];
    const [a1, a2] = q(m), [b1, b2] = q(-m);
    [[mlA, a1, a2], [mlB, b1, b2]].forEach(([l, u, v]) => { l.setAttribute('x1', u[0]); l.setAttribute('y1', u[1]); l.setAttribute('x2', v[0]); l.setAttribute('y2', v[1]); l.style.opacity = m > 2 ? 1 : 0; });
    band.setAttribute('d', D([a1, a2, b2, b1], true)); band.style.opacity = m > 2 ? 1 : 0;
    rings.forEach(r => r.style.opacity = P(t, at(1, .85), .4));
    vis(road, s1 * P(t, at(1, .3), .4)); vis(svl, s1 * P(t, at(1, .85), .4));
    algs.forEach((c, i) => pop(c, t, T(2) + .1 + i * .3, T(3)));
    rise(interp, t, at(2, .62), T(3));
    vis(era, P(t, T(3), .4)); eraFill.setAttribute('width', 1400 * P(t, T(3) + .3, 1.6));
    eraL.forEach(e => vis(e, P(t, T(3), .4))); rise(eraT, t, T(3) + .3);
    vis(fe, P(t, at(3, .4), .5)); kb(fe, lerp(1, 1.04, U(t, at(3, .4), 10)));
    pop(feTag, t, at(3, .65));
  };
});

// ===================== 神经网络 =====================
scene('neuron', ({g, h, T, E, at}) => {
  const chap = chapterCard(h, '04', '深度学习');
  // single neuron
  const ng = S('g', {}, g);
  const X = [[420, 380], [420, 560], [420, 740]], SIG = [930, 560], PHI = [1210, 560], Y = [1530, 560], Bn = [930, 330];
  const eIn = X.map(p => S('line', {x1: p[0] + 46, y1: p[1], x2: SIG[0] - 56, y2: SIG[1], stroke: COL.a, 'stroke-width': 6}, ng));
  S('line', {x1: Bn[0], y1: Bn[1] + 40, x2: SIG[0], y2: SIG[1] - 56, stroke: COL.b, 'stroke-width': 5}, ng);
  S('line', {x1: SIG[0] + 56, y1: SIG[1], x2: PHI[0] - 80, y2: PHI[1], stroke: '#cfd6ea', 'stroke-width': 5}, ng);
  S('line', {x1: PHI[0] + 80, y1: PHI[1], x2: Y[0] - 50, y2: Y[1], stroke: COL.ok, 'stroke-width': 5}, ng);
  X.forEach((p, i) => { S('circle', {cx: p[0], cy: p[1], r: 46, fill: '#14203d', stroke: COL.a, 'stroke-width': 5}, ng); });
  S('circle', {cx: SIG[0], cy: SIG[1], r: 56, fill: '#1d2240', stroke: '#fff', 'stroke-width': 5}, ng);
  S('circle', {cx: Bn[0], cy: Bn[1], r: 40, fill: '#2a2210', stroke: COL.b, 'stroke-width': 5}, ng);
  S('rect', {x: PHI[0] - 80, y: PHI[1] - 70, width: 160, height: 140, rx: 20, fill: '#1d2240', stroke: COL.purple, 'stroke-width': 5}, ng);
  S('path', {d: D([...Array(41)].map((_, i) => { const u = i / 40, z = (u - .5) * 12; return [PHI[0] - 60 + u * 120, PHI[1] + 40 - 80 / (1 + Math.exp(-z))]; })), fill: 'none', stroke: COL.purple, 'stroke-width': 5}, ng);
  S('circle', {cx: Y[0], cy: Y[1], r: 50, fill: '#103a2a', stroke: COL.ok, 'stroke-width': 5}, ng);
  const nl = [];
  X.forEach((p, i) => nl.push(H(`<span class="f" style="font-size:44px"><i>x</i><sub>${i + 1}</sub></span>`, p[0], p[1], {}, h)));
  const wl = X.map((p, i) => H(`<span class="f" style="font-size:38px;color:var(--a)"><i>w</i><sub>${i + 1}</sub></span>`, lerp(p[0], SIG[0], .5), lerp(p[1], SIG[1], .5) - 34, {}, h));
  nl.push(H('<span class="f" style="font-size:60px">Σ</span>', SIG[0], SIG[1], {}, h), H('<span class="f" style="font-size:40px;color:var(--b)"><i>b</i></span>', Bn[0], Bn[1], {}, h),
    H('<span class="f" style="font-size:44px;color:var(--ok)"><i>y</i></span>', Y[0], Y[1], {}, h));
  const capN = [['输入', 420, 840], ['加权求和', 930, 660], ['激活函数 φ', 1210, 680], ['输出', 1530, 650]].map(([s, x, y]) => H(s, x, y, {style: {fontSize: '30px', color: 'var(--muted)'}}, h));
  const fml = H(`<span class="f" style="font-size:60px"><i class="ok">y</i> = <span class="vp">φ</span>( <i class="va">w</i><sub>1</sub><i>x</i><sub>1</sub> + <i class="va">w</i><sub>2</sub><i>x</i><sub>2</sub> + <i class="va">w</i><sub>3</sub><i>x</i><sub>3</sub> + <i class="vb">b</i> )</span>`, 960, 190, {}, h);
  const par = H(`<span>参数 = 权重 <i class="f va">w</i> ＋ 偏置 <i class="f vb">b</i>：决定每个输入有多重要</span>`, 960, 860, {cls: 'chip y lg'}, h);
  const pul = [0, 1, 2].map(() => glow(g, 18, 'glowA'));
  const pulO = glow(g, 22, 'glowG');
  // networks
  function net(layers, x0, x1) {
    const gg = S('g', {}, g), pos = layers.map((n, l) => [...Array(n)].map((_, k) => [lerp(x0, x1, l / (layers.length - 1)), 540 + (k - (n - 1) / 2) * 92]));
    const es = [];
    for (let l = 0; l < layers.length - 1; l++) for (const a of pos[l]) for (const b of pos[l + 1]) es.push({e: S('line', {x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: COL.a, 'stroke-width': 2.5}, gg), l, r: Math.random()});
    const ns = pos.flatMap((col, l) => col.map(p => ({c: S('circle', {cx: p[0], cy: p[1], r: 24, fill: '#14203d', stroke: '#9fb4ff', 'stroke-width': 4}, gg), l})));
    return {gg, es, ns, L: layers.length};
  }
  const R = rng(13);
  const A = net([4, 6, 6, 3], 460, 1460), B = net([4, 6, 6, 6, 6, 6, 3], 260, 1660);
  [A, B].forEach(N => N.es.forEach(e => e.r = R()));
  const layerLab = ['输入层', '隐藏层', '输出层'].map((s, i) => H(s, [460, 960, 1460][i], 900 - 20, {style: {fontSize: '30px', color: 'var(--muted)'}}, h));
  const err = H('', 1640, 230, {cls: 'chip red lg f'}, h);
  const deep = H('层数越多 → 网络越「深」 → 深度学习', 960, 190, {cls: 'chip y xl'}, h);
  return t => {
    chap(t, T(0) - .3, E(0) + .5);
    const s1 = win(t, T(1), T(3));
    vis(ng, s1 * P(t, T(1), .6)); nl.forEach(n => vis(n, s1 * P(t, T(1) + .3, .4)));
    wl.forEach((w, i) => vis(w, s1 * P(t, at(1, .25) + i * .1, .4)));
    capN.forEach((c, i) => vis(c, s1 * P(t, at(1, .2) + i * .2, .4)));
    vis(fml, s1 * P(t, at(1, .55), .5));
    const w = [1.0, .45, .8];
    eIn.forEach((e, i) => e.setAttribute('stroke-width', 3 + 9 * w[i] * (1 + .5 * Math.sin(t * 3 + i * 2) * P(t, T(2), .5))));
    rise(par, t, T(2) + .2, T(3));
    const ph = ((t - at(1, .3)) / 2.2 % 1 + 1) % 1, on = s1 * (t > at(1, .3) ? 1 : 0);
    pul.forEach((p, i) => { vis(p, on * (ph < .5 ? 1 : 0)); move(p, ...along([[X[i][0] + 46, X[i][1]], [SIG[0] - 56, SIG[1]]], ph / .5)); });
    vis(pulO, on * (ph >= .5 ? 1 : 0)); move(pulO, ...along([SIG, PHI, Y], (ph - .5) / .5));
    const sA = win(t, T(3), at(4, .55)), sB = P(t, at(4, .55), .6);
    vis(A.gg, sA); vis(B.gg, sB);
    layerLab.forEach(l => vis(l, sA));
    const noise = 1 - P(t, at(4, .05), 3);
    [A, B].forEach(N => {
      const wave = ((t - T(3)) * .9) % 1.6;
      N.ns.forEach(n => { const a = Math.exp(-((wave * (N.L) - n.l) ** 2) * 2); n.c.setAttribute('fill', `rgba(110,231,168,${.15 + .85 * a})`); });
      N.es.forEach(e => {
        const flick = noise * Math.sin(t * 7 + e.r * 40);
        const v = clamp(.25 + .6 * (e.r - .5) + .4 * flick, .05, 1);
        e.e.setAttribute('stroke-opacity', v); e.e.setAttribute('stroke', e.r > .5 ? COL.a : COL.c);
      });
    });
    vis(err, P(t, T(4), .4) * (1 - P(t, at(4, .55), .4))); setText(err, `误差 ${(0.02 + .9 * noise).toFixed(2)}`);
    rise(deep, t, at(4, .6));
  };
});

// ===================== 发展史（上） =====================
scene('history1', ({g, h, T, E, at}) => {
  const yx = y => 130 + (y - 1950) * 27.4, AX = 680, HH = 280;
  const heat = y => .08 + .62 * Math.exp(-(((y - 1963) / 5.2) ** 2)) * (y < 1957 ? Math.exp(-((1957 - y) ** 2) / 4) : 1)
    + .62 * Math.exp(-(((y - 1990) / 4.5) ** 2)) + 1.0 / (1 + Math.exp(-(y - 2010.5) / .9));
  const hy = y => AX - Math.min(heat(y), 1.15) * HH;
  const tl = S('g', {}, g);
  const winters = [[1970, 1985, '第一次低谷'], [1996, 2006, '第二次低谷']].map(([a, b, s]) => {
    const r = S('rect', {x: yx(a), y: AX - HH - 40, width: yx(b) - yx(a), height: HH + 40, fill: 'rgba(120,180,255,.10)'}, tl);
    const l = H(s, (yx(a) + yx(b)) / 2, AX - HH - 10, {style: {fontSize: '30px', color: '#9fd0ff'}}, h);
    return {r, l, a};
  });
  S('line', {x1: 110, y1: AX, x2: 1850, y2: AX, stroke: 'rgba(255,255,255,.5)', 'stroke-width': 3}, tl);
  for (let y = 1950; y <= 2010; y += 10) { S('line', {x1: yx(y), y1: AX - 8, x2: yx(y), y2: AX + 8, stroke: 'rgba(255,255,255,.5)', 'stroke-width': 3}, tl); }
  const decs = [1950, 1960, 1970, 1980, 1990, 2000, 2010].map(y => H(String(y), yx(y), AX - 24, {cls: 'f', style: {fontSize: '26px', color: 'var(--muted)'}}, h));
  const area = S('path', {fill: 'rgba(255,107,154,.14)'}, tl), crv = S('path', {fill: 'none', stroke: COL.c, 'stroke-width': 6, 'stroke-linecap': 'round'}, tl);
  const heatL = H('神经网络的热度', 230, 330, {style: {fontSize: '30px', color: 'var(--c)'}}, h);
  const cur = S('line', {stroke: COL.y, 'stroke-width': 3, 'stroke-dasharray': '6 6'}, tl);
  const curY = H('', 0, 0, {cls: 'year'}, h);
  const EV = [[1950, '图灵测试'], [1956, '达特茅斯会议'], [1957, '感知机'], [1969, '异或难题'], [1970, '反向传播公式'], [1975, '知识工程'], [1979, '卷积网络'], [1986, '反向传播算法'], [1989, 'LeNet'], [1995, 'SVM · AdaBoost'], [1997, '深蓝']];
  const evs = EV.map(([y, s], i) => {
    const d = dot(tl, yx(y), AX, 9, COL.y);
    const l = H(`<b>${y}</b>${s}`, yx(y), AX + 62 + (i % 2) * 92, {cls: 'ev', style: {width: 'auto', fontSize: '25px'}}, h);
    return {d, l, y};
  });
  // insets
  const ins1 = H(`<div class="card sm" style="text-align:center"><b style="color:var(--y)">1957 · 感知机</b><br><span style="display:flex;align-items:center;gap:10px;justify-content:center;margin-top:8px"><span class="f"><i>x</i><sub>1</sub>, <i>x</i><sub>2</sub></span> → <span class="f" style="font-size:44px">Σ</span> → <span class="f"><i>y</i></span></span><span class="muted" style="font-size:26px">罗森布拉特 · 最早能学习的神经网络</span></div>`, 470, 220, {}, h);
  const xor = S('g', {}, g), XC = [880, 200];
  const xp = [[0, 0, 1], [1, 1, 1], [0, 1, 0], [1, 0, 0]];
  S('rect', {x: XC[0] - 150, y: XC[1] - 120, width: 300, height: 240, rx: 18, fill: '#121a30', stroke: 'rgba(255,255,255,.2)', 'stroke-width': 2}, xor);
  xp.forEach(([a, b, c]) => { const x = XC[0] - 60 + a * 120, y = XC[1] + 60 - b * 120; c ? S('path', {d: `M${x - 13} ${y - 13}L${x + 13} ${y + 13}M${x + 13} ${y - 13}L${x - 13} ${y + 13}`, stroke: COL.c, 'stroke-width': 6, 'stroke-linecap': 'round'}, xor) : S('circle', {cx: x, cy: y, r: 14, fill: 'none', stroke: COL.ok, 'stroke-width': 6}, xor); });
  const xl = S('line', {stroke: COL.y, 'stroke-width': 5}, xor);
  const xorL = H('异或：一条直线分不开 ✗', XC[0], XC[1] + 150, {cls: 'chip red'}, h);
  const ins3 = H(`<div class="card sm" style="text-align:center"><b style="color:var(--y)">1989 · LeNet</b><br><span style="font-family:var(--kai);font-size:56px;letter-spacing:.2em">5 0 4 1 9</span><br><span class="muted" style="font-size:26px">杨立昆 · 卷积网络识别手写数字</span></div>`, 1150, 220, {}, h);
  const ins4 = H(`<div class="card sm" style="text-align:center;border-color:var(--a)"><b style="color:var(--a)">支持向量机等统计方法</b><br>表现更好 · 理论更漂亮</div>`, 1450, 380 - 150, {}, h);
  const ins5 = H(`<div class="card sm" style="display:flex;align-items:center;gap:18px"><span style="font-size:84px;line-height:1">♞</span><div><b style="color:var(--y)">1997 · 深蓝 Deep Blue</b><br><span style="font-size:28px">击败国际象棋世界冠军卡斯帕罗夫</span></div></div>`, 1450, 220, {}, h);
  const curAt = t => {
    const K = [[T(0), 1950], [E(0), 1956], [T(1) + .3, 1956], [at(1, .6), 1958], [T(2) + .2, 1958], [at(2, .55), 1972], [T(3), 1972], [at(3, .8), 1990], [T(4), 1990], [at(4, .9), 2003], [T(5), 2003], [E(5), 2006]];
    if (t <= K[0][0]) return 1950;
    for (let i = 1; i < K.length; i++) if (t <= K[i][0]) return lerp(K[i - 1][1], K[i][1], ease(clamp((t - K[i - 1][0]) / (K[i][0] - K[i - 1][0] || 1))));
    return 2006;
  };
  return t => {
    vis(tl, P(t, T(0) - .3, .5)); decs.forEach(d => vis(d, P(t, T(0) - .3, .5)));
    const c = curAt(t), pts = [];
    for (let y = 1950; y <= c; y += .25) pts.push([yx(y), hy(y)]); pts.push([yx(c), hy(c)]);
    crv.setAttribute('d', D(pts)); area.setAttribute('d', D([[yx(1950), AX], ...pts, [yx(c), AX]], true));
    vis(heatL, P(t, T(0) + .5, .5));
    cur.setAttribute('x1', yx(c)); cur.setAttribute('x2', yx(c)); cur.setAttribute('y1', AX); cur.setAttribute('y2', hy(c) - 30);
    vis(curY, P(t, T(0), .4)); at2(curY, yx(c), hy(c) - 60, null); setText(curY, String(Math.floor(c)));
    evs.forEach(e => { const v = P(t, -1e9, 0) * (c >= e.y ? 1 : 0); e.d.style.opacity = v; vis(e.l, v); });
    winters.forEach(w => { const v = c >= w.a + 2 ? 1 : 0; w.r.style.opacity = v; vis(w.l, v); });
    pop(ins1, t, at(1, .3), T(2) + .2);
    vis(xor, win(t, at(2, .25), T(3))); vis(xorL, win(t, at(2, .6), T(3)));
    const xa = Math.sin((t - at(2, .25)) * 2.2) * 1.2 + .6, xc = add(XC, [10 * Math.sin(t * 1.3), 0]);
    xl.setAttribute('x1', xc[0] - Math.cos(xa) * 140); xl.setAttribute('y1', xc[1] - Math.sin(xa) * 110); xl.setAttribute('x2', xc[0] + Math.cos(xa) * 140); xl.setAttribute('y2', xc[1] + Math.sin(xa) * 110);
    pop(ins3, t, at(3, .55), T(4) + .3);
    pop(ins4, t, at(4, .3), T(5));
    pop(ins5, t, at(5, .1));
  };
});

// ===================== ImageNet & AlexNet =====================
scene('imagenet', ({g, h, T, E, at}) => {
  const mos = IMG('imagenet', 760, 470, 1100, 560, {}, h);
  const book = IMG('feifei_book', 1580, 430, 300, 400, {cap: '李飞飞《我看见的世界》'}, h);
  const c1 = H('', 760, 820, {cls: 'chip y xl'}, h);
  // AlexNet
  const an = S('g', {}, g), blocks = [];
  const BL = [[60, 220, 200, '#4f8cff'], [50, 170, 160, '#4f8cff'], [40, 130, 130, '#5e7bff'], [40, 130, 130, '#5e7bff'], [40, 110, 110, '#6b6bff']];
  let x = 300;
  BL.forEach(([w, hh, dd, col], i) => {
    const gg = S('g', {}, an), y0 = 520 - hh / 2, k = dd * .35;
    S('path', {d: D([[x, y0], [x + k, y0 - k * .7], [x + k + w, y0 - k * .7], [x + w, y0]], true), fill: col, 'fill-opacity': .55, stroke: '#cfe0ff', 'stroke-width': 2}, gg);
    S('path', {d: D([[x + w, y0], [x + k + w, y0 - k * .7], [x + k + w, y0 + hh - k * .7], [x + w, y0 + hh]], true), fill: col, 'fill-opacity': .35, stroke: '#cfe0ff', 'stroke-width': 2}, gg);
    S('rect', {x, y: y0, width: w, height: hh, fill: col, 'fill-opacity': .8, stroke: '#cfe0ff', 'stroke-width': 2}, gg);
    blocks.push(gg); x += w + k + 50;
  });
  [0, 1, 2].forEach(i => { const gg = S('g', {}, an); S('rect', {x: x + i * 90, y: 360, width: 34, height: i < 2 ? 320 : 160, rx: 8, fill: COL.purple, 'fill-opacity': .8, transform: i === 2 ? 'translate(0 80)' : ''}, gg); blocks.push(gg); });
  const anL = [H('卷积层 × 5', 700, 760, {cls: 'chip a lg'}, h), H('全连接层 × 3', 1300, 760, {cls: 'chip p lg'}, h), H(`<span style="display:flex;align-items:center;gap:10px">${ico('bolt', 40, COL.y)}2 块 GPU 训练</span>`, 1640, 300, {cls: 'chip y lg'}, h)];
  const anT = H('AlexNet · 2012', 960, 210, {cls: 'title-m'}, h);
  // error chart
  const bars = [['2010 冠军', 28.2, '#5b6a92'], ['2011 冠军', 25.8, '#5b6a92'], ['2012 第二名', 26.2, '#5b6a92'], ['2012 AlexNet', 15.3, COL.y]].map(([s, v, col], i) => {
    const b = H('', 520 + i * 300, 800, {style: {width: '170px', background: col, borderRadius: '14px 14px 0 0', transformOrigin: 'bottom center'}}, h);
    b._base = 'translate(-50%,-100%)'; b.style.transform = b._base;
    const n = H('', 520 + i * 300, 760, {cls: 'f', style: {fontSize: '44px', fontWeight: 700, color: i === 3 ? 'var(--y)' : '#fff'}}, h);
    const l = H(s, 520 + i * 300, 840, {style: {fontSize: '30px', color: i === 3 ? 'var(--y)' : 'var(--muted)'}}, h);
    return {b, n, l, v};
  });
  const eT = H('ImageNet 图像识别大赛 · Top-5 错误率', 960, 210, {cls: 'title-m', style: {fontSize: '48px'}}, h);
  const drop = H('↓ 断崖式下降', 1600, 360, {cls: 'chip ok xl'}, h);
  // three forces
  const vz = [['大数据', COL.a, 820, 470], ['深度网络', COL.purple, 1100, 470], ['GPU 算力', COL.ok, 960, 700]].map(([s, col, x, y]) => {
    const c = S('circle', {cx: x, cy: y, r: 190, fill: col, 'fill-opacity': .25, stroke: col, 'stroke-width': 5}, g); c._c = [x, y];
    const l = H(s, x + (x - 960) * .6, y + (y - 550) * .7, {style: {fontSize: '46px', fontWeight: 900, color: col}}, h);
    return {c, l};
  });
  const era = H('深度学习时代', 960, 560, {style: {fontSize: '54px', fontWeight: 900, color: '#fff', textShadow: '0 0 30px #ffe066'}}, h);
  return t => {
    const s0 = win(t, T(0) - .3, T(1));
    vis(mos, s0); kb(mos, lerp(1.0, 1.15, U(t, T(0), 12)));
    vis(book, s0 * P(t, at(0, .3), .5)); vis(c1, s0 * P(t, at(0, .4), .4));
    countUp(c1, t, at(0, .4), 2.5, 0, 1400, v => `${Math.round(v)} 万+ 张标注图片 · 2 万+ 类别`);
    const s1 = win(t, T(1), T(2));
    vis(an, s1); blocks.forEach((b, i) => b.style.opacity = P(t, T(1) + .2 + i * .25, .3));
    anL.forEach((l, i) => vis(l, s1 * P(t, at(1, .45) + i * .15, .4))); vis(anT, s1);
    const s2 = win(t, T(2), T(3));
    vis(eT, s2);
    bars.forEach((b, i) => {
      const grow = P(t, T(2) + .2 + i * .25, .6), v = i < 3 ? b.v : lerp(26.2, 15.3, P(t, at(2, .45), 1.2));
      const hh = v * 18 * grow;
      vis(b.b, s2); b.b.style.height = hh + 'px';
      vis(b.n, s2 * grow); setText(b.n, v.toFixed(1) + '%'); at2(b.n, 520 + i * 300, 800 - hh - 36, null);
      vis(b.l, s2 * grow);
    });
    pop(drop, t, at(2, .65), T(3));
    vz.forEach((v, i) => { const u = P(t, T(3) + i * .3, .6); vis(v.c, u); setScale(v.c, lerp(.3, 1, u)); vis(v.l, u); });
    pop(era, t, at(3, .55));
  };
});

// ===================== 发展史（下） =====================
scene('history2', ({g, h, T, E, at}) => {
  const year = H('', 1700, 190, {cls: 'f', style: {fontSize: '110px', fontWeight: 700, color: 'var(--y)'}}, h);
  const items = [
    [2014, 'GAN', '生成对抗网络', 0, .15], [2014, 'DeepMind', '被谷歌收购', 0, .65],
    [2015, 'ResNet', '残差网络 · 上百层', 1, .12], [2015, 'TensorFlow', '开源框架', 1, .5], [2015, 'OpenAI', '成立', 1, .78],
    [2016, 'AlphaGo', '战胜李世石', 2, .12], [2016, 'PyTorch', '发布', 2, .42], [2016, 'Hugging Face', '创立', 2, .68],
  ];
  const row1 = items.map(([y, n, s, li, f], i) => ({el: H(`<div class="evcard" style="width:200px"><b>${y}</b>${n}<s>${s}</s></div>`, 190 + i * 220, 400, {}, h), li, f}));
  const row1line = S('line', {x1: 100, y1: 520, x2: 1820, y2: 520, stroke: 'rgba(255,255,255,.25)', 'stroke-width': 3}, g);
  const big = [[2017, 'Transformer', '几乎所有大模型的基础', 3, .15, COL.a], [2022, 'ChatGPT', '横空出世', 4, .05, COL.ok], [2025, 'DeepSeek R1', '惊艳全球', 4, .5, COL.c]].map(([y, n, s, li, f, col], i) =>
    ({el: H(`<div class="evcard" style="width:440px;padding:24px;border-color:${col};font-size:52px;box-shadow:0 0 40px ${col}33"><b style="font-size:40px">${y}</b>${n}<s style="font-size:30px">${s}</s></div>`, 420 + i * 540, 700, {}, h), li, f, y}));
  const ARR = growArrow(g, 160, 860 - 10, 1760, 860 - 10, 'rgba(255,224,102,.5)', 5);
  const allY = [...items.map(i => [i[0], i[3], i[4]]), ...big.map(b => [b.y, b.li, b.f])];
  return t => {
    row1.forEach(r => pop(r.el, t, at(r.li, r.f)));
    row1line.style.opacity = P(t, T(0), .5);
    big.forEach(b => pop(b.el, t, at(b.li, b.f)));
    let y = 2014; allY.forEach(([yy, li, f]) => { if (t >= at(li, f)) y = yy; });
    vis(year, P(t, T(0), .4)); setText(year, String(y));
    setScale(year, 1 + .15 * allY.reduce((s, [yy, li, f]) => s + bump(t, at(li, f), .4), 0));
    ARR.set(P(t, T(3), 2));
  };
});

// ===================== 规模竞赛 =====================
scene('scale', ({g, h, T, E, at}) => {
  const routes = [H(`<div class="card glow" style="width:640px;text-align:center"><h3>路线一：更大、更深</h3><div style="display:flex;gap:10px;justify-content:center;align-items:flex-end;height:150px">${[50, 80, 110, 140, 170].map((v, i) => `<span class="rb" style="display:inline-block;width:46px;height:${v}px;border-radius:8px;background:var(--a);opacity:.85"></span>`).join('')}</div></div>`, 560, 520, {}, h),
    H(`<div class="card" style="width:640px;text-align:center;border-color:var(--purple)"><h3 style="color:var(--purple)">路线二：更好的结构</h3><div style="display:flex;flex-wrap:wrap;gap:16px;justify-content:center;margin-top:20px"><span class="chip p">卷积</span><span class="chip p">残差连接</span><span class="chip p">注意力机制</span></div><div style="height:46px"></div></div>`, 1360, 520, {}, h)];
  const rbars = [...routes[0].querySelectorAll('.rb')];
  const head = H('自然语言处理的「军备竞赛」· 参数量', 960, 170, {cls: 'title-m', style: {fontSize: '50px'}}, h);
  const M = [['ELMo', 2018, .94, COL.teal], ['BERT', 2018, 3.4, COL.b], ['GPT-2', 2019, 15, COL.a], ['GPT-3', 2020, 1750, COL.c]];
  const BASE = 820, HMAX = 560;
  const bars = M.map(([n, y, v, col], i) => {
    const b = H('', 460 + i * 340, BASE, {style: {width: '200px', background: col, borderRadius: '14px 14px 0 0'}}, h);
    b._base = 'translate(-50%,-100%)'; b.style.transform = b._base;
    const val = H(`${v >= 1 ? v : v}亿`, 460 + i * 340, BASE - 40, {cls: 'f', style: {fontSize: '44px', fontWeight: 700}}, h);
    const lab = H(`<b>${n}</b> <span class="muted f">${y}</span>`, 460 + i * 340, BASE + 40, {style: {fontSize: '36px'}}, h);
    return {b, val, lab, v};
  });
  const bert = IMG('bert', 1500, 470, 220, 320, {cap: '《芝麻街》里的 Bert', capCls: 'sm'}, h);
  const axisL = H('', 230, 260, {cls: 'chip mono'}, h);
  const boom = H('一下子 ×100 以上！', 860, 420, {cls: 'chip red xl'}, h);
  const show = [at(2, .05), at(2, .3), T(3) + .1, at(4, .25)];
  const maxAt = t => { const k = [[T(2), 4], [at(3, .1), 4], [at(3, .1) + 1.2, 17], [at(4, .22), 17], [at(4, .22) + 1.6, 1900]]; let m = 4; for (let i = 1; i < k.length; i++) if (t > k[i - 1][0]) m = Math.exp(lerp(Math.log(k[i - 1][1]), Math.log(k[i][1]), ease(clamp((t - k[i - 1][0]) / (k[i][0] - k[i - 1][0]))))); return m; };
  return t => {
    const s0 = win(t, T(0) - .3, T(1) + .3);
    routes.forEach((r, i) => vis(r, s0 * P(t, T(0) + i * 1.2, .5)));
    rbars.forEach((b, i) => b.style.transform = `scaleY(${.6 + .4 * Math.sin(t * 2 + i)})`);
    rise(head, t, at(1, .3));
    const m = maxAt(t);
    bars.forEach((b, i) => {
      const u = P(t, show[i], .9), hh = Math.min(b.v / m, 1.25) * HMAX * u;
      vis(b.b, t > show[i] ? 1 : 0); b.b.style.height = Math.max(hh, u > 0 ? 3 : 0) + 'px';
      vis(b.val, P(t, show[i] + .3, .4)); at2(b.val, 460 + i * 340, BASE - Math.max(hh, 3) - 36, null);
      vis(b.lab, P(t, show[i], .4));
    });
    vis(bert, win(t, at(2, .5), T(3) + .2));
    vis(axisL, P(t, at(1, .5), .4)); setText(axisL, `纵轴最大：${m >= 100 ? Math.round(m) : m.toFixed(0)} 亿`);
    pop(boom, t, at(4, .55));
  };
});

// ===================== 可解释性 =====================
scene('interpret', ({g, h, T, E, at}) => {
  const inp = H(`<div class="tile">${ico('cat', 110, COL.b, 2.5)}输入图片</div>`, 400, 520, {}, h);
  const box = H(`<div style="width:520px;height:360px;border-radius:30px;background:#05070d;border:3px solid #333a55;display:flex;align-items:center;justify-content:center;font-size:120px;color:#3a4466;font-weight:900">?</div>`, 960, 520, {}, h);
  const boxL = H('黑盒：中间层学到了什么？', 960, 270, {cls: 'chip lg'}, h);
  const outp = H('“猫”', 1520, 520, {cls: 'chip y xl'}, h);
  const ar = [growArrow(g, 520, 520, 690, 520, 'rgba(255,255,255,.6)', 6), growArrow(g, 1230, 520, 1420, 520, 'rgba(255,255,255,.6)', 6)];
  const viz = IMG('cnnviz', 960, 330, 860, 397, {cls: 'white', fit: 'contain'}, h);
  // hand-made stage icons
  const st = (inner, nm, col) => `<div class="tile" style="width:330px;border-color:${col}"><svg width="160" height="120" viewBox="0 0 160 120">${inner}</svg>${nm}</div>`;
  let edges = ''; for (let i = 0; i < 12; i++) { const x = 20 + (i % 4) * 38, y = 20 + (i / 4 | 0) * 38, a = (i * 47) % 180; edges += `<line x1="${x}" y1="${y}" x2="${x + 24 * Math.cos(a * Math.PI / 180)}" y2="${y + 24 * Math.sin(a * Math.PI / 180)}" stroke="#4fb3ff" stroke-width="5" stroke-linecap="round"/>`; }
  let tex = ''; for (let i = 0; i < 6; i++) tex += `<path d="M10 ${15 + i * 18} q20 -14 40 0 t40 0 t40 0 t40 0" stroke="#ffb347" stroke-width="4" fill="none"/>`;
  const parts = `<circle cx="45" cy="55" r="26" fill="none" stroke="#ff6b9a" stroke-width="5"/><circle cx="45" cy="55" r="9" fill="#ff6b9a"/><circle cx="118" cy="62" r="30" fill="none" stroke="#ff6b9a" stroke-width="5"/><path d="M118 32v60M88 62h60M97 41l42 42M139 41l-42 42" stroke="#ff6b9a" stroke-width="3"/>`;
  const obj = `<g transform="translate(32 6) scale(2)" fill="none" stroke="#6ee7a8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${ICONS.cat}</g>`;
  const stages = [[edges, '浅层：边缘 · 色块', COL.a], [tex, '中间层：纹理', COL.b], [parts, '深层：物体部件', COL.c], [obj, '最后：完整物体', COL.ok]].map(([a, b, c], i) => H(st(a, b, c), 300 + i * 440, 700, {}, h));
  const sar = [0, 1, 2].map(i => growArrow(g, 470 + i * 440, 700, 570 + i * 440, 700, COL.y, 6));
  const like = H(`<span style="display:flex;align-items:center;gap:16px">${ico('eye', 54, COL.y)}像人一样：从局部到整体，从简单到复杂</span>`, 960, 330, {cls: 'chip y xl'}, h);
  const qs = [['识别的真的是猫吗？', 470, 360], ['依据的是图像里哪些特征？', 1440, 360], ['每一层起到什么作用？', 960, 760]].map(([s, x, y]) => H(s, x, y, {cls: 'card', style: {fontSize: '40px', borderRadius: '40px'}}, h));
  const xai = H('机器学习可解释性', 960, 560, {cls: 'chip p xl', style: {fontSize: '64px'}}, h);
  return t => {
    const s0 = win(t, T(0) - .3, T(1));
    [inp, box, boxL, outp].forEach((e, i) => vis(e, s0 * P(t, T(0) + i * .3, .4)));
    ar.forEach((a, i) => { a.set(P(t, T(0) + .4 + i * .5, .5)); a.style.opacity = s0 * +a.style.opacity; });
    box.style.transform = `${box._base} scale(${1 + .03 * Math.sin(t * 4)})`;
    const s1 = win(t, T(1), T(3));
    vis(viz, s1 * (1 - P(t, T(2), .4)) * P(t, T(1), .5)); kb(viz, lerp(1, 1.05, U(t, T(1), 10)));
    stages.forEach((s, i) => { vis(s, s1 * P(t, at(1, .1) + i * .2, .4)); setScale(s, 1 + .07 * bump(t, at(1, .1) + i * .2, 1)); });
    sar.forEach((a, i) => { a.set(P(t, at(1, .2) + i * .2, .4)); a.style.opacity = s1 * +a.style.opacity; });
    vis(like, s1 * P(t, T(2), .5));
    qs.forEach((q, i) => pop(q, t, at(3, .05 + i * .22)));
    pop(xai, t, at(3, .75));
  };
});

// ===================== 预训练与微调 =====================
scene('pretrain', ({g, h, T, E, at}) => {
  const gpus = [...Array(24)].map((_, i) => H(ico('bolt', 56, COL.y, 2.5), 480 + (i % 8) * 130, 330 + (i / 8 | 0) * 130, {cls: 'tile', style: {padding: '12px'}}, h));
  const cost = H('每个任务都从零训练？成本太高！', 960, 760, {cls: 'chip red xl'}, h);
  const pipe = S('g', {}, g);
  function cyl(cx, cy, rx, hh, col) {
    const gg = S('g', {}, pipe);
    S('path', {d: `M${cx - rx} ${cy - hh / 2} v${hh} a${rx} ${rx * .3} 0 0 0 ${rx * 2} 0 v${-hh}`, fill: col, 'fill-opacity': .25, stroke: col, 'stroke-width': 4}, gg);
    S('ellipse', {cx, cy: cy - hh / 2, rx, ry: rx * .3, fill: col, 'fill-opacity': .45, stroke: col, 'stroke-width': 4}, gg);
    gg._c = [cx, cy]; return gg;
  }
  const big = cyl(290, 560, 150, 220, COL.a), small = cyl(1180, 300, 70, 70, COL.ok);
  const bigL = H('海量无标签数据', 290, 760, {cls: 'chip a lg'}, h), smallL = H('少量有标签数据', 1180, 190, {cls: 'chip ok'}, h);
  const pre = H(`<div class="tile" style="width:330px;border-color:var(--a)">${ico('layers', 90, COL.a, 2.5)}预训练模型<span class="s">获得通用能力</span></div>`, 800, 560, {}, h);
  const fin = H(`<div class="tile" style="width:330px;border-color:var(--y)">${ico('spark', 90, COL.y, 2.5)}微调后的模型<span class="s">获得预测能力</span></div>`, 1560, 560, {}, h);
  const a1 = growArrow(pipe, 460, 560, 620, 560, COL.a, 7), a2 = growArrow(pipe, 980, 560, 1380, 560, COL.y, 7), a3 = growArrow(pipe, 1180, 360, 1180, 530, COL.ok, 6);
  const l1 = H('自监督任务', 540, 500, {style: {fontSize: '28px', color: 'var(--a)'}}, h), l2 = H('监督学习', 1290, 610, {style: {fontSize: '28px', color: 'var(--y)'}}, h);
  const an = [['cap', '通识教育（多年）', COL.a, 800], ['brief', '岗位培训（短期）', COL.y, 1560]].map(([ic, s, col, x]) => H(`<div class="tile" style="width:360px;border-color:${col}">${ico(ic, 90, col, 2.5)}${s}</div>`, x, 790, {}, h));
  const anOk = H(`<span style="display:flex;align-items:center;gap:10px">${ico('check', 40, COL.ok, 4)}胜任专门工作</span>`, 1180, 790, {cls: 'chip ok lg'}, h);
  const why = [['无标签数据：非常丰富', 'a'], ['有标签数据：比较稀少', 'ok'], ['语言（NLP）· 视觉（CV）都大获成功', 'y']].map(([s, c], i) => H(s, 960, 360 + i * 130, {cls: `chip ${c} xl`}, h));
  return t => {
    const s0 = win(t, T(0) - .3, T(1));
    gpus.forEach((gp, i) => vis(gp, s0 * P(t, T(0) + i * .08, .25)));
    pop(cost, t, at(0, .5), T(1));
    const pOn = win(t, T(1), T(4));
    vis(pipe, pOn);
    big.style.opacity = P(t, T(1) + .1, .4); vis(bigL, pOn * P(t, T(1) + .2, .4));
    a1.set(P(t, at(1, .4), .5)); vis(l1, pOn * P(t, at(1, .45), .4)); vis(pre, pOn * P(t, at(1, .55), .5));
    small.style.opacity = P(t, T(2), .4); vis(smallL, pOn * P(t, T(2) + .1, .4));
    a3.set(P(t, at(2, .2), .5)); a2.set(P(t, at(2, .35), .6)); vis(l2, pOn * P(t, at(2, .4), .4)); vis(fin, pOn * P(t, at(2, .55), .5));
    const up = P(t, T(3), .6);
    pipe.setAttribute('transform', `translate(0 ${-120 * up})`);
    [bigL, pre, fin, l1, l2].forEach(e => e.style.transform = `${e._base} translateY(${-120 * up}px)`);
    smallL.style.transform = `${smallL._base} translateY(${-120 * up}px)`;
    an.forEach((a, i) => vis(a, win(t, T(3) + .3 + i * .8, T(4))));
    vis(anOk, win(t, at(3, .7), T(4)));
    why.forEach((w, i) => rise(w, t, T(4) + .2 + i * .6));
  };
});
