// Part 1 — 开场 · 人工智能起源 · 三大流派

// ===================== 开场 =====================
scene('intro', ({g, h, T, E, at}) => {
  const bg = BGS(g, 'brain');
  const title = H(`<div class="title-xl">人工智能发展史与基础概念</div>`, 960, 440, {}, h);
  const subt = H(`<div class="lead" style="text-align:center">人工智能通识课 · 第一讲　<span class="muted">主讲：王一博</span></div>`, 960, 570, {}, h);
  const abil = [['写文章', 'text', COL.a, 470, 470], ['画图', 'image', COL.c, 790, 560], ['做视频', 'video', COL.b, 1130, 560], ['写代码', 'code', COL.ok, 1450, 470]];
  const chips = abil.map(([s, ic, col, x, y]) => H(`<span style="display:flex;align-items:center;gap:14px">${ico(ic, 44, col)}${s}</span>`, x, y, {cls: 'chip lg'}, h));
  const q = H(`<div style="display:flex;align-items:center;gap:30px"><span class="big-q" style="font-size:150px">?</span><span class="lead">从哪里来？<br>怎样一步步走到今天？</span></div>`, 960, 770, {}, h);
  // roadmap
  const N = 120, pts = [];
  for (let i = 0; i <= N; i++) { const u = i / N; pts.push([220 + u * 1480, 640 + 70 * Math.sin(u * Math.PI * 2.2 + .4)]); }
  const road = stroke(pts, {stroke: 'rgba(255,224,102,.75)', 'stroke-width': 7, 'stroke-dasharray': '1 1'}, g);
  const stops = [['01', '人工智能起源', .05, COL.a], ['02', '三大流派', .28, COL.b], ['03', '机器学习', .5, COL.ok], ['04', '深度学习', .72, COL.c], ['05', '通用人工智能', .95, COL.purple]];
  const nodes = stops.map(([no, nm, u, col], k) => {
    const p = along(pts, u), gg = S('g', {}, g);
    S('circle', {cx: p[0], cy: p[1], r: 46, fill: '#0c1322', stroke: col, 'stroke-width': 6}, gg);
    const tx = S('text', {x: p[0], y: p[1] + 2, 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: col, 'font-size': 38, 'font-weight': 700}, gg); tx.textContent = no;
    gg._c = p;
    const lab = H(nm, p[0], p[1] + (k % 2 ? -100 : 100), {style: {fontSize: '38px', fontWeight: 700, color: col}}, h);
    return {gg, lab, u};
  });
  const trav = glow(g, 30);
  const mapTag = H('AI 全景地图', 960, 860, {cls: 'chip y lg'}, h);
  return t => {
    vis(bg, 1); bg.kb(lerp(1.05, 1.25, U(t, 0, 35)), 0, lerp(0, -30, U(t, 0, 35)));
    const up = P(t, T(1), 1);
    vis(title, P(t, .2, .9));
    title.style.transform = `${title._base} translateY(${lerp(0, -270, up) + (1 - P(t, .2, .9)) * 40}px) scale(${lerp(1, .62, up)})`;
    vis(subt, P(t, .8, .8) * (1 - P(t, T(1), .5)));
    chips.forEach((c, i) => pop(c, t, at(1, .05 + i * .07), T(2)));
    rise(q, t, at(1, .55), T(2));
    draw(road, P(t, T(2), 1.2));
    const tu = lerp(0, 1, U(t, at(2, .18), (E(2) - at(2, .18)) * .95));
    nodes.forEach((n, k) => {
      const on = tu >= n.u - .02;
      vis(n.gg, P(t, T(2) + .2 + k * .12, .4));
      setScale(n.gg, 1 + .25 * bump(t, at(2, .18) + (n.u) * (E(2) - at(2, .18)) * .95, .6));
      fade(n.lab, t, T(2) + .3 + k * .12);
      n.lab.style.filter = on ? 'none' : 'brightness(.55)';
    });
    vis(trav, t > at(2, .18) ? 1 : 0); move(trav, ...along(pts, tu));
    pop(mapTag, t, T(3));
  };
});

// ===================== 人类的梦想 =====================
scene('dream', ({g, h, T, E, at}) => {
  const head = H('人类一直以来的梦想：让机器替人干活', 960, 190, {cls: 'title-m'}, h);
  const bulb = `<div class="ph" style="width:440px;height:330px;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at 50% 45%,#ffe9a0 0%,#7a5a10 35%,#141a2c 75%)">${ico('bulb', 200, '#fff6c8', 2.5)}</div><div class="cap">电力 · 点亮世界</div>`;
  const cards = [
    IMG('steam_sketch', 420, 520, 440, 330, {cls: 'white', fit: 'contain', cap: '蒸汽机 · 力气'}, h),
    IMG('train', 960, 520, 440, 330, {cap: '火车 · 远方'}, h),
    H(bulb, 1500, 520, {style: {textAlign: 'center'}}, h),
  ];
  const hand = H(`<span style="display:flex;align-items:center;gap:14px">${ico('hand', 44, COL.ok)}延伸了我们的手和脚</span>`, 960, 640, {cls: 'chip ok lg'}, h);
  const qcard = H(`<div style="display:flex;align-items:center;gap:36px">${ico('robot', 150, COL.y, 2.5)}<div class="title-l">机器，能不能<br>也拥有<span style="color:var(--y)">智能</span>？</div></div>`, 960, 800, {}, h);
  const std = H(`<div style="display:flex;align-items:center;gap:24px"><span class="lead">什么才算「有智能」？</span><span class="chip y xl">判断标准 = ？</span></div>`, 960, 850, {}, h);
  return t => {
    rise(head, t, T(0) - .3);
    const up = P(t, T(2), .9);
    cards.forEach((c, i) => {
      const t0 = i === 0 ? at(1, .0) : i === 1 ? at(1, .3) : at(1, .62);
      const u = U(t, t0, .55);
      vis(c, clamp(u * 1.8) * (1 - .55 * P(t, T(3), .6)));
      c.style.transform = `${c._base} translate(${(i - 1) * -40 * up}px,${lerp(0, -150, up)}px) scale(${(u <= 0 ? .5 : lerp(.5, 1, outBack(u))) * lerp(1, .66, up)})`;
    });
    fade(hand, t, at(2, .05), T(3));
    hand.style.top = lerp(640, 560, up) + 'px';
    pop(qcard, t, at(2, .42));
    qcard.style.top = lerp(800, 620, P(t, T(3), .7)) + 'px';
    vis(qcard, P(t, at(2, .42), .5) * (1 - .4 * P(t, T(3), .6)));
    rise(std, t, at(3, .3));
  };
});

// ===================== 图灵测试 =====================
scene('turing', ({g, h, T, E, at}) => {
  const photo = IMG('turing', 960, 470, 1120, 612, {cls: 'white', fit: 'contain'}, h);
  const tag = H('1950 · 艾伦·图灵 · 模仿游戏（Imitation Game）', 960, 850, {cls: 'chip y lg'}, h);
  // diagram
  const judge = H(`<div class="tile" style="width:260px">${ico('person', 130, COL.a, 2.5)}测试者<span class="s">只能打字聊天</span></div>`, 230, 520, {}, h);
  const think = H('?', 330, 290, {cls: 'big-q', style: {fontSize: '120px'}}, h);
  const chat = H(`<div class="chat" style="width:820px"><div class="bar"><i></i><i></i><i></i>&nbsp;对话窗口</div><div class="msgs" style="display:flex;flex-direction:column;gap:14px;height:520px"></div></div>`, 830, 530, {}, h);
  const msgsEl = chat.querySelector('.msgs');
  const conv = [['me', '你喜欢下雨天吗？'], ['A', '喜欢！听着雨声睡觉特别香。'], ['B', '下雨天适合窝在家里，喝杯热茶～'],
    ['me', '3847 × 29 等于多少？'], ['A', '呃……我得拿个计算器。'], ['B', '嗯……大概十一万多吧？']];
  const bubs = conv.map(([w, s]) => {
    const b = document.createElement('div'); b.className = 'bub ' + (w === 'me' ? 'me' : 'ai');
    b.innerHTML = w === 'me' ? '' : `<b style="color:${w === 'A' ? 'var(--b)' : 'var(--teal)'}">${w}：</b><span></span>`;
    msgsEl.appendChild(b); b.style.opacity = 0; return {b, s, span: w === 'me' ? b : b.querySelector('span')};
  });
  const wall = S('g', {}, g);
  for (let y = 150; y < 900; y += 34) S('rect', {x: 1290, y, width: 26, height: 22, rx: 4, fill: 'rgba(255,255,255,.18)'}, wall);
  const wallLab = H('看不见的墙', 1303, 128, {style: {fontSize: '26px', color: 'var(--muted)'}}, h);
  const rooms = [['A', COL.b, 'person', '人', 330], ['B', COL.teal, 'robot', '机器', 720]].map(([n, col, ic, nm, y]) => {
    const d = H(`<div class="tile" style="width:300px;height:300px;justify-content:center;border-color:${col}"><div class="hid" style="font:700 120px var(--math);color:${col}">${n}</div><div class="rev" style="display:none;flex-direction:column;align-items:center;gap:10px">${ico(ic, 140, col, 2.5)}<span style="color:${col}">${n} = ${nm}</span></div></div>`, 1620, y, {}, h);
    return {d, hid: d.querySelector('.hid'), rev: d.querySelector('.rev')};
  });
  const verdict = H(`<span style="display:flex;align-items:center;gap:20px">分辨不出 <span style="color:var(--y)">⟹</span> 机器表现出了智能</span>`, 830, 160, {cls: 'chip y xl'}, h);
  const idea = H(`<div class="card big glow dark" style="text-align:center;line-height:1.7">不纠结「智能到底是什么」<br><span style="color:var(--y)">⟹</span> 只看机器<b class="hl">表现</b>得像不像</div>`, 960, 520, {}, h);
  const gpt = IMG('chatgpt', 960, 400, 900, 336, {}, h);
  const ask = H(`<div style="text-align:center"><div class="title-l">图灵测试，还是判断<span style="color:var(--y)">「智能」</span>的好标准吗？</div><div class="lead muted" style="margin-top:20px">想一想：会聊天，就等于有智能吗？</div></div>`, 960, 760, {}, h);
  // message schedule across line 1 → line 2
  const t0 = at(1, .25), t1 = at(2, .15), step = (t1 - t0) / conv.length;
  return t => {
    vis(photo, win(t, T(0) - .2, T(1) + .2)); kb(photo, lerp(1, 1.12, U(t, T(0), E(0) - T(0) + 2)));
    fade(tag, t, at(0, .2), T(1) + .2);
    const dia = win(t, T(1) + .3, E(4) + 5) * (1 - .8 * P(t, T(3), .5)) * (1 - P(t, T(4), .4));
    [judge, chat].forEach(n => vis(n, dia)); vis(wall, dia);
    bubs.forEach((m, i) => {
      const s0 = t0 + i * step;
      vis(m.b, P(t, s0, .25)); typed(m.span, m.s, t, s0 + .1, 14, false);
    });
    vis(think, dia * P(t, at(2, .2), .4) * (1 - P(t, at(2, .55), .3))); setScale(think, 1 + .08 * Math.sin(t * 6));
    rooms.forEach((r, i) => {
      vis(r.d, dia);
      const flip = at(2, .52) + i * .35, u = U(t, flip, .5);
      r.d.style.transform = `${r.d._base} scaleX(${Math.abs(Math.cos(Math.PI * u))})`;
      const shown = u >= .5; r.hid.style.display = shown ? 'none' : ''; r.rev.style.display = shown ? 'flex' : 'none';
    });
    vis(verdict, dia * P(t, at(2, .78), .5)); vis(wallLab, dia * (1 - P(t, at(2, .7), .4)));
    pop(idea, t, T(3) + .2, T(4));
    vis(gpt, win(t, T(4) + .2)); kb(gpt, lerp(1, 1.06, U(t, T(4), 10)));
    rise(ask, t, at(4, .3));
  };
});

// ===================== 达特茅斯会议 =====================
scene('dartmouth', ({g, h, T, E, at}) => {
  const photo = IMG('dartmouth', 690, 500, 1000, 640, {}, h);
  photo.img.style.filter = 'sepia(.25) contrast(1.05)';
  const year = H('1950', 1520, 300, {cls: 'f', style: {fontSize: '170px', fontWeight: 700, color: 'var(--y)'}}, h);
  const info = ['达特茅斯学院', '夏季研讨会', '为期两个月'].map((s, i) => H(s, 1520, 470 + i * 84, {cls: 'chip lg'}, h));
  const names = [['约翰·麦卡锡', 'John McCarthy'], ['马文·明斯基', 'Marvin Minsky'], ['克劳德·香农', 'Claude Shannon']].map(([c, e], i) =>
    H(`<div class="card sm" style="width:420px;text-align:center"><b style="font-size:38px">${c}</b><br><span class="f muted" style="font-style:italic">${e}</span></div>`, 1520, 450 + i * 150, {}, h));
  const veil = H('', 960, 540, {style: {width: '1920px', height: '1080px', background: 'rgba(6,10,22,.82)'}}, h);
  const ai = H('', 960, 360, {cls: 'f', style: {fontSize: '130px', color: '#fff', fontStyle: 'italic', textShadow: '0 0 40px rgba(79,179,255,.7)'}}, h);
  const aicn = H('人工智能 · AI', 960, 510, {style: {fontSize: '72px', fontWeight: 900, letterSpacing: '.2em', color: 'var(--y)'}}, h);
  const goal = H('目标：让机器逐步具备人类的智能', 960, 840, {cls: 'chip y lg'}, h);
  const stamp = H('AI 元年 · 1956', 960, 680, {cls: 'stamp'}, h);
  return t => {
    vis(photo, P(t, T(0) - .4, .7)); kb(photo, lerp(1.0, 1.18, U(t, T(0), 30)), lerp(0, 30, U(t, T(0), 30)), 0);
    vis(year, P(t, T(0), .5)); countUp(year, t, T(0) + .2, 1.6, 1950, 1956, v => String(Math.round(v)));
    info.forEach((c, i) => fade(c, t, at(0, .4 + i * .12), T(1)));
    names.forEach((c, i) => rise(c, t, at(1, .1 + i * .18)));
    vis(veil, P(t, T(2) - .2, .6));
    vis(ai, P(t, T(2), .3)); typed(ai, 'Artificial Intelligence', t, T(2) + .1, 12, true);
    rise(aicn, t, at(2, .55));
    pop(goal, t, T(3) + .2);
    const su = U(t, at(3, .55), .45);
    vis(stamp, clamp(su * 2)); stamp.style.transform = `${stamp._base} rotate(-8deg) scale(${su <= 0 ? 2.4 : lerp(2.4, 1, ease(su))})`;
  };
});

// ===================== 三大流派 =====================
scene('schools', ({g, h, T, E, at}) => {
  const head = H('怎样让机器拥有智能？', 960, 180, {cls: 'title-l'}, h);
  const nn = (() => {
    const L = [[30, [40, 100, 160]], [110, [20, 70, 120, 170]], [190, [60, 140]]];
    let s = '<svg width="220" height="190" viewBox="0 0 220 190">';
    for (let a = 0; a < 2; a++) for (const y1 of L[a][1]) for (const y2 of L[a + 1][1]) s += `<line x1="${L[a][0]}" y1="${y1}" x2="${L[a + 1][0]}" y2="${y2}" stroke="#b18cff" stroke-opacity=".55" stroke-width="2.5"/>`;
    for (const [x, ys] of L) for (const y of ys) s += `<circle cx="${x}" cy="${y}" r="13" fill="#1a1f3a" stroke="#b18cff" stroke-width="4"/>`;
    return s + '</svg>';
  })();
  const defsP = [
    ['符号主义', COL.a, `<div class="mono" style="font-size:44px;color:var(--a);line-height:1.5">IF … THEN …<br><span style="font-family:var(--math)">∀x ∃y → ∧</span></div>`, '智能 = 逻辑推理'],
    ['行为主义', COL.b, `<div style="display:flex;align-items:center;gap:14px">${ico('dog', 90, COL.b, 2.5)}<span style="font-size:60px;color:var(--b)">⇄</span>${ico('globe', 90, COL.b, 2.5)}</div>`, '智能 = 与环境互动'],
    ['连接主义', COL.purple, nn, '智能 = 神经网络'],
  ];
  const pillars = defsP.map(([nm, col, art, q], i) => H(`<div class="pillar" style="border-color:${col}"><div class="nm" style="color:${col}">${nm}</div><div style="height:200px;display:flex;align-items:center">${art}</div><div class="q">${q.replace('= ', '= <b style="color:#fff">') + '</b>'}</div></div>`, 420 + i * 540, 600, {}, h));
  return t => {
    rise(head, t, T(0) - .2);
    pillars.forEach((p, i) => { pop(p, t, i === 0 ? T(1) - .2 : T(i + 1) - .2); setScale(p, (1 + .04 * bump(t, T(i + 1), 1.2)) * (U(t, T(i + 1) - .2, .5) <= 0 ? .4 : lerp(.4, 1, outBack(U(t, T(i + 1) - .2, .5))))); });
  };
});

// ===================== 符号主义 =====================
scene('symbolic', ({g, h, T, E, at}) => {
  // knowledge graph
  const KN = {soc: ['苏格拉底', 560, 330, COL.y], man: ['人', 960, 330, COL.a], mortal: ['会死', 1360, 330, COL.c], phil: ['哲学家', 560, 620, COL.b], ani: ['动物', 960, 620, COL.ok], cat: ['猫', 1360, 620, COL.b]};
  const KE = [['soc', 'man', '是'], ['man', 'mortal', '会'], ['soc', 'phil', '是'], ['man', 'ani', '属于'], ['cat', 'ani', '属于'], ['ani', 'mortal', '会']];
  const kg = S('g', {}, g);
  const edges = KE.map(([a, b, r]) => {
    const A = KN[a], B = KN[b], d = norm([B[1] - A[1], B[2] - A[2]]);
    const p = [A[1] + d[0] * 110, A[2] + d[1] * 60], q = [B[1] - d[0] * 110, B[2] - d[1] * 60];
    const ar = growArrow(kg, p[0], p[1], q[0], q[1], 'rgba(220,230,255,.6)', 4);
    const lb = H(r, (p[0] + q[0]) / 2, (p[1] + q[1]) / 2 - 26, {style: {fontSize: '28px', color: 'var(--muted)'}}, h);
    return {ar, lb};
  });
  const nodes = Object.values(KN).map(([s, x, y, col]) => H(s, x, y, {cls: 'sym', style: {fontSize: '44px', color: col, background: '#121a30'}}, h));
  const kcap = H('符号：对世界中对象、概念与关系的抽象表示', 960, 820, {cls: 'chip a lg'}, h);
  // reasoning
  const rows = [
    H(`<div class="lrow"><span class="k">事实</span><span class="sym" style="color:var(--y)">苏格拉底</span> 是 <span class="sym" style="color:var(--a)">人</span></div>`, 960, 300, {}, h),
    H(`<div class="lrow"><span class="k">规则</span><b class="mono" style="color:var(--b)">IF</b> 是<span class="sym" style="color:var(--a)">人</span> <b class="mono" style="color:var(--b)">THEN</b> <span class="sym" style="color:var(--c)">会死</span></div>`, 960, 430, {}, h),
    H(`<div class="lrow"><span class="k" style="background:rgba(255,224,102,.2);color:var(--y)">结论</span><span class="sym" style="color:var(--y)">苏格拉底</span> <span class="sym" style="color:var(--c)">会死</span></div>`, 960, 700, {}, h),
  ];
  const line = S('line', {x1: 640, y1: 540, x2: 1280, y2: 540, stroke: 'rgba(255,255,255,.4)', 'stroke-width': 4}, g);
  const infer = H('逻辑推理 ⟹ 新结论', 960, 585, {style: {fontSize: '32px', color: 'var(--y)'}}, h);
  const concGlow = glow(g, 160); move(concGlow, 960, 700);
  // expert system
  const exp = IMG('expert', 470, 470, 720, 405, {cap: '专家系统：模仿人类专家决策'}, h);
  const rules = ['如果 体温 > 38.5℃ 且 白细胞升高，那么 可能是细菌感染', '如果 细菌呈杆状 且 革兰氏阴性，那么 可能是大肠杆菌', '如果 确认是大肠杆菌感染，那么 推荐某类抗生素', '……'];
  const rb = H(`<div class="card dark" style="width:880px;font-size:30px;line-height:1.6"><h3>规则库</h3>${rules.map(r => `<div class="r" style="opacity:0;margin:8px 0">${r.replace(/如果|那么|且/g, m => `<b style="color:var(--b)">${m}</b>`)}</div>`).join('')}</div>`, 1340, 470, {}, h);
  const rEls = [...rb.querySelectorAll('.r')];
  // MYCIN flow
  const myc = H(`<div class="card glow" style="text-align:center;width:500px"><div class="mono" style="font-size:66px;font-weight:700;color:var(--y)">MYCIN</div><div style="font-size:30px;color:var(--muted)">斯坦福大学 · 1970年代<br>数百条医学规则</div></div>`, 960, 500, {}, h);
  const ins = ['症状', '化验结果'].map((s, i) => H(s, 380, 420 + i * 160, {cls: 'chip a lg'}, h));
  const outs = ['诊断：细菌感染', '推荐：抗生素'].map((s, i) => H(s, 1550, 420 + i * 160, {cls: 'chip ok lg'}, h));
  const fl = S('g', {}, g);
  const fa = [[470, 420, 690, 470], [470, 580, 690, 530], [1230, 470, 1400, 420], [1230, 530, 1400, 580]].map(c => growArrow(fl, ...c, 'rgba(255,255,255,.6)', 5));
  // limitations
  const birdRule = H(`<div class="lrow"><b class="mono" style="color:var(--b)">IF</b> 是<span class="sym" style="color:var(--a)">鸟</span> <b class="mono" style="color:var(--b)">THEN</b> <span class="sym" style="color:var(--ok)">会飞</span></div>`, 960, 230, {}, h);
  const excs = ['企鹅？', '鸵鸟？', '受伤的鸟？', '玩具鸟？'].map((s, i) => H(s, 520 + i * 300, 380, {cls: 'chip red lg'}, h));
  const R = rng(7), pile = [];
  for (let i = 0; i < 26; i++) pile.push(H(`IF … THEN …`, 200 + R() * 1520, 560 + R() * 180, {cls: 'chip mono', style: {fontSize: '24px', opacity: 0}}, h));
  pile.forEach(p => { p._r = (R() - .5) * 40; p._d = R(); });
  const lims = ['规则必须非常明确', '知识要靠人一条条录入', '例外层出不穷，规则写不完'].map((s, i) => H(`<span style="display:flex;align-items:center">${'<span class="ex">✕</span>'}${s}</span>`, 960, 560 + i * 110, {cls: 'chip warn'}, h));
  return t => {
    const kgOn = win(t, T(0) - .3, T(1));
    vis(kg, 1);
    nodes.forEach((n, i) => { vis(n, kgOn * P(t, T(0) + i * .25, .4)); });
    edges.forEach((e, i) => { const v = P(t, at(0, .3) + i * .3, .5) * kgOn; e.ar.set(P(t, at(0, .3) + i * .3, .5)); e.ar.style.opacity = kgOn * (v > .01 ? 1 : 0); vis(e.lb, kgOn * v); });
    vis(kcap, kgOn * P(t, at(0, .5), .5));
    const r1 = win(t, T(1), T(2));
    rise(rows[0], t, at(1, .05), T(2)); rise(rows[1], t, at(1, .3), T(2));
    vis(line, r1 * P(t, at(1, .6), .4)); vis(infer, r1 * P(t, at(1, .62), .4));
    pop(rows[2], t, at(1, .75), T(2)); vis(concGlow, r1 * .35 * P(t, at(1, .75), .5) * (1 + .3 * Math.sin(t * 4)));
    const ex = win(t, T(2), T(3));
    vis(exp, ex); kb(exp, lerp(1, 1.1, U(t, T(2), 12)));
    vis(rb, ex); rEls.forEach((r, i) => vis(r, P(t, at(2, .25 + i * .15), .4)));
    const my = win(t, T(3), T(4));
    pop(myc, t, T(3), T(4));
    ins.forEach((c, i) => rise(c, t, at(3, .1 + i * .08), T(4)));
    fa.forEach((a, i) => { a.set(P(t, at(3, i < 2 ? .25 : .6), .6)); a.style.opacity = my * (a.style.opacity > 0 ? 1 : 0); });
    outs.forEach((c, i) => pop(c, t, at(3, .62 + i * .12), T(4)));
    pop(birdRule, t, T(4));
    excs.forEach((c, i) => pop(c, t, at(4, .12 + i * .06)));
    pile.forEach((p, i) => {
      const u = P(t, at(4, .3) + p._d * 2.2, .5);
      vis(p, u * .55); p.style.transform = `${p._base} rotate(${p._r}deg) translateY(${(1 - u) * -300}px)`;
    });
    lims.forEach((c, i) => rise(c, t, at(4, .45 + i * .14)));
  };
});

// ===================== 行为主义 =====================
scene('behavior', ({g, h, T, E, at}) => {
  const pic = IMG('agent_dog', 960, 470, 900, 479, {cls: 'white', fit: 'contain', cap: '智能体（agent）⇄ 环境（environment）'}, h);
  const train = [['坐下', true], ['乱扑人', false]].map(([act, ok], i) => H(`<div style="display:flex;align-items:center;gap:26px;font-size:46px">${ico('dog', 100, COL.b, 2.5)}<span class="chip lg">${act}</span><span style="font-size:56px;color:${ok ? 'var(--ok)' : 'var(--warn)'}">${ok ? '✓' : '✗'}</span><span style="color:var(--muted)">→</span>${ok ? ico('bone', 90, COL.y, 3) + '<b style="color:var(--y)">奖励零食</b>' : '<span style="color:var(--muted)">没有奖励</span>'}</div>`, 960, 400 + i * 220, {}, h));
  // RL loop
  const loop = S('g', {}, g);
  const ag = H(`<div class="tile" style="width:300px;border-color:var(--a)">${ico('robot', 120, COL.a, 2.5)}智能体<span class="s">Agent</span></div>`, 560, 540, {}, h);
  const env = H(`<div class="tile" style="width:300px;border-color:var(--ok)">${ico('globe', 120, COL.ok, 2.5)}环境<span class="s">Environment</span></div>`, 1360, 540, {}, h);
  const loopPts = [[710, 470], [960, 330], [1210, 470], [1210, 610], [960, 750], [710, 610], [710, 470]];
  const lp = stroke([[720, 450], [960, 330], [1200, 450]], {stroke: COL.y, 'stroke-width': 6}, loop);
  const lq = stroke([[1200, 630], [960, 750], [720, 630]], {stroke: COL.ok, 'stroke-width': 6}, loop);
  const ah1 = arrow(loop, 1170, 432, 1205, 455, COL.y, 6), ah2 = arrow(loop, 750, 648, 715, 625, COL.ok, 6);
  const lAct = H('动作 Action', 960, 290, {cls: 'chip y lg'}, h);
  const lSt = H('新状态 State ＋ 奖励 / 惩罚 Reward', 960, 800, {cls: 'chip ok lg'}, h);
  const pk = glow(loop, 26);
  // grid world
  const C = 8, Rr = 5, cs = 92, gx = 300, gy = 300;
  const walls = new Set(['4,1', '4,2', '1,2', '6,3']), traps = new Set(['3,0', '5,2', '2,4']), goal = [7, 0], startP = [0, 4];
  const grid = S('g', {}, g);
  for (let i = 0; i < C; i++) for (let j = 0; j < Rr; j++) {
    const k = `${i},${j}`, x = gx + i * cs, y = gy + j * cs;
    S('rect', {x: x + 3, y: y + 3, width: cs - 6, height: cs - 6, rx: 12, fill: walls.has(k) ? '#3a4466' : 'rgba(255,255,255,.06)', stroke: 'rgba(255,255,255,.12)', 'stroke-width': 2}, grid);
    if (traps.has(k)) icoS(grid, 'fire', x + cs / 2, y + cs / 2, 58, COL.warn, 3);
  }
  icoS(grid, 'star', gx + goal[0] * cs + cs / 2, gy + goal[1] * cs + cs / 2, 62, COL.y, 3.5);
  const trail = S('path', {fill: 'none', stroke: COL.a, 'stroke-width': 8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: .55}, grid);
  const bot = icoS(grid, 'robot', 0, 0, 70, '#fff', 3.5);
  const gLeg = H(`<span style="display:flex;gap:30px;align-items:center"><span style="display:flex;align-items:center;gap:8px">${ico('star', 40, COL.y)} 终点 +20</span><span style="display:flex;align-items:center;gap:8px">${ico('fire', 40, COL.warn)} 陷阱 −10</span><span class="muted">每走一步 −1</span></span>`, gx + C * cs / 2, gy - 50, {style: {fontSize: '32px'}}, h);
  // episodes: biased random walks; bias grows with experience
  const free = (i, j) => i >= 0 && j >= 0 && i < C && j < Rr && !walls.has(`${i},${j}`);
  const dist = {}; { const q = [goal]; dist[goal.join()] = 0; while (q.length) { const [i, j] = q.shift(); for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const a = i + di, b = j + dj, k = `${a},${b}`; if (free(a, b) && !traps.has(k) && dist[k] === undefined) { dist[k] = dist[`${i},${j}`] + 1; q.push([a, b]); } } } }
  const EPS = [[1, 0, 11], [2, .2, 5], [3, .35, 21], [20, .65, 3], [100, .85, 9], [500, 1, 1]].map(([no, bias, seed]) => {
    const R = rng(seed), path = [startP.slice()]; let [i, j] = startP, rew = 0, end = '';
    for (let s = 0; s < 26; s++) {
      const nb = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([di, dj]) => [i + di, j + dj]).filter(([a, b]) => free(a, b));
      let nx;
      if (R() < bias) nx = nb.reduce((b, c) => ((dist[c.join()] ?? 99) < (dist[b.join()] ?? 99) ? c : b));
      else nx = nb[Math.floor(R() * nb.length)];
      [i, j] = nx; path.push(nx.slice()); rew -= 1;
      if (traps.has(`${i},${j}`)) { rew -= 10; end = 'trap'; break; }
      if (i === goal[0] && j === goal[1]) { rew += 20; end = 'goal'; break; }
    }
    return {no, path, rew, end};
  });
  const g0 = at(3, .12), g1 = E(4) - .6, pauseE = .5;
  const tot = EPS.reduce((a, e) => a + e.path.length - 1, 0), spd = tot / (g1 - g0 - pauseE * EPS.length);
  let acc = g0; EPS.forEach(e => { e.t0 = acc; e.t1 = acc + (e.path.length - 1) / spd; acc = e.t1 + pauseE; });
  const epLab = H('', 1440, 330, {style: {fontSize: '44px', fontWeight: 700}}, h);
  const rwLab = H('', 1440, 400, {style: {fontSize: '34px'}}, h);
  const chart = S('g', {}, g);
  S('line', {x1: 1250, y1: 760, x2: 1700, y2: 760, stroke: 'rgba(255,255,255,.4)', 'stroke-width': 3}, chart);
  S('line', {x1: 1250, y1: 500, x2: 1250, y2: 760, stroke: 'rgba(255,255,255,.4)', 'stroke-width': 3}, chart);
  const chLab = H('每次尝试的总奖励', 1475, 800, {style: {fontSize: '28px', color: 'var(--muted)'}}, h);
  const pts = EPS.map((e, k) => dot(chart, 1290 + k * 78, 760 - clamp(e.rew + 40, 0, 52) * 5, 10, e.end === 'goal' ? COL.ok : COL.warn));
  const ago = H(`<div style="display:flex;align-items:center;gap:22px"><svg width="110" height="110" viewBox="0 0 110 110"><rect width="110" height="110" rx="10" fill="#d9a85b"/>${[...Array(7)].map((_, k) => `<path d="M${10 + k * 15} 10V100M10 ${10 + k * 15}H100" stroke="#5a3d12" stroke-width="2"/>`).join('')}${[[40, 40, 0], [55, 40, 1], [55, 55, 0], [70, 55, 1], [40, 70, 1], [70, 25, 0]].map(([x, y, w]) => `<circle cx="${x}" cy="${y}" r="7" fill="${w ? '#fff' : '#111'}"/>`).join('')}</svg><div><b style="font-size:46px">AlphaGo</b><br><span style="font-size:30px;color:var(--muted)">强化学习 · 击败围棋世界冠军</span></div></div>`, 1460, 200, {cls: 'card sm'}, h);
  return t => {
    vis(pic, win(t, T(0) - .3, T(1) + .1)); kb(pic, lerp(1, 1.06, U(t, T(0), 8)));
    train.forEach((r, i) => rise(r, t, at(1, .1 + i * .4), T(2)));
    const lo = win(t, T(2), at(3, .08));
    [ag, env].forEach(n => vis(n, lo)); vis(loop, lo);
    draw(lp, P(t, at(2, .3), .6)); draw(lq, P(t, at(2, .5), .6)); vis(ah1, P(t, at(2, .45), .3)); vis(ah2, P(t, at(2, .65), .3));
    vis(lAct, lo * P(t, at(2, .35), .4)); vis(lSt, lo * P(t, at(2, .6), .4));
    const ph = ((t - at(2, .7)) / 2.6 % 1 + 1) % 1; vis(pk, t > at(2, .7) ? 1 : 0); move(pk, ...along(loopPts, ph));
    const gw = P(t, at(3, .05), .5);
    vis(grid, gw); vis(gLeg, gw); vis(chart, gw); vis(chLab, gw);
    let cur = EPS[0]; for (const e of EPS) if (t >= e.t0 - pauseE) cur = e;
    const u = clamp((t - cur.t0) / (cur.t1 - cur.t0)), n = cur.path.length - 1, fpos = u * n, k = Math.floor(fpos);
    const pa = cur.path[Math.min(k, n)], pb = cur.path[Math.min(k + 1, n)], fr = fpos - k;
    const cx = gx + (lerp(pa[0], pb[0], fr) + .5) * cs, cy = gy + (lerp(pa[1], pb[1], fr) + .5) * cs;
    bot.firstChild.setAttribute('transform', `translate(${cx - 35} ${cy - 35}) scale(${70 / 48})`);
    const tp = cur.path.slice(0, k + 1).map(p => [gx + (p[0] + .5) * cs, gy + (p[1] + .5) * cs]); tp.push([cx, cy]);
    trail.setAttribute('d', D(tp));
    vis(epLab, gw); setHTML(epLab, `第 <span style="color:var(--y);font-family:var(--math)">${cur.no}</span> 次尝试`);
    const done = u >= 1;
    vis(rwLab, gw); setHTML(rwLab, done ? (cur.end === 'goal' ? `<span style="color:var(--ok)">到达终点！总奖励 ${cur.rew > 0 ? '+' : ''}${cur.rew}</span>` : `<span style="color:var(--warn)">掉进陷阱… 总奖励 ${cur.rew}</span>`) : '<span class="muted">探索中…</span>');
    EPS.forEach((e, i) => vis(pts[i], gw * (t >= e.t1 ? 1 : 0)));
    pop(ago, t, at(4, .1));
  };
});

// ===================== 连接主义 =====================
scene('connection', ({g, h, T, E, at}) => {
  const bg = BGS(g, 'brain2', 'veilV');
  const lead = H('灵感，直接来自我们的大脑', 960, 540, {cls: 'title-l'}, h);
  // biological neuron
  const nz = S('g', {}, g), R = rng(3), soma = [760, 540], col = '#c9a6ff';
  const dend = [];
  function branch(p, ang, len, depth) {
    const q = [p[0] + Math.cos(ang) * len, p[1] + Math.sin(ang) * len];
    const e = S('path', {d: D([p, q]), stroke: col, 'stroke-width': 3 + depth * 2.4, 'stroke-linecap': 'round', fill: 'none'}, nz);
    dend.push({e, p, q, depth});
    if (depth > 0) for (const s of [-1, 1]) branch(q, ang + s * (.35 + R() * .3), len * (.62 + R() * .15), depth - 1);
    return q;
  }
  const tips = [];
  for (let k = 0; k < 5; k++) { const a = Math.PI * (.62 + k * .19); tips.push(branch([soma[0] + Math.cos(a) * 50, soma[1] + Math.sin(a) * 50], a, 120, 2)); }
  S('circle', {cx: soma[0], cy: soma[1], r: 62, fill: '#3b2a66', stroke: col, 'stroke-width': 6}, nz);
  S('circle', {cx: soma[0] + 6, cy: soma[1] - 4, r: 20, fill: '#7b5cc4'}, nz);
  S('path', {d: D([[822, 540], [1460, 540]]), stroke: col, 'stroke-width': 9, fill: 'none'}, nz);
  for (let x = 860; x < 1420; x += 95) S('rect', {x, y: 522, width: 74, height: 36, rx: 18, fill: '#e8d36a', stroke: '#8a7a2a', 'stroke-width': 2}, nz);
  for (const a of [-.6, -.2, .2, .6]) { const q = [1460 + Math.cos(a) * 80, 540 + Math.sin(a) * 80]; S('path', {d: D([[1460, 540], q]), stroke: col, 'stroke-width': 5, fill: 'none'}, nz); S('circle', {cx: q[0], cy: q[1], r: 11, fill: col}, nz); }
  const nlabs = [['树突 · 接收信号', 430, 300], ['细胞体 · 处理信号', 760, 680], ['轴突 · 传递信号', 1150, 450]].map(([s, x, y]) => H(s, x, y, {cls: 'chip p lg'}, h));
  const cnt = H('', 1500, 220, {cls: 'chip y xl'}, h);
  const sig = glow(g, 30, 'glowY');
  const sigPath = [tips[1], [soma[0] - 40, soma[1]], soma, [1460, 540], [1530, 540]];
  // network
  const net = S('g', {}, g), R2 = rng(11), NP = [];
  for (let i = 0; i < 80; i++) NP.push([120 + R2() * 1680, 150 + R2() * 760]);
  const NE = [];
  NP.forEach((p, i) => { const ds = NP.map((q, j) => [Math.hypot(q[0] - p[0], q[1] - p[1]), j]).sort((a, b) => a[0] - b[0]); for (let k = 1; k <= 3; k++) if (ds[k][1] > i) NE.push([i, ds[k][1]]); });
  const ne = NE.map(([a, b]) => S('line', {x1: NP[a][0], y1: NP[a][1], x2: NP[b][0], y2: NP[b][1], stroke: COL.purple, 'stroke-width': 2.5}, net));
  const nd = NP.map(p => S('circle', {cx: p[0], cy: p[1], r: 9, fill: '#d9c7ff'}, net));
  const srcs = [[300, 300, 0], [1500, 700, 1.3], [900, 450, 2.1]];
  const act = (p, t) => srcs.reduce((s, [x, y, o]) => { const d = Math.hypot(p[0] - x, p[1] - y), ph = ((t - o - d / 500) % 3 + 3) % 3; return s + Math.exp(-ph * ph * 6); }, 0);
  const words = [['思考', 520, 420], ['记忆', 1000, 760], ['语言', 1420, 380]].map(([s, x, y]) => H(s, x, y, {style: {fontSize: '96px', fontWeight: 900, color: '#fff', textShadow: '0 0 40px #b18cff,0 0 80px #b18cff'}}, h));
  const lineage = H(`<span style="display:flex;align-items:center;gap:24px"><span class="chip p xl">连接主义</span><span style="font-size:60px;color:var(--y)">⟶</span><span class="chip y xl">深度学习</span></span>`, 960, 860, {}, h);
  return t => {
    vis(bg, win(t, T(0) - .5, T(1) + .3)); bg.kb(lerp(1.05, 1.2, U(t, T(0) - 1, 12)));
    fade(lead, t, T(0), T(1));
    const n1 = win(t, T(1), T(2));
    vis(nz, n1);
    nlabs.forEach((l, i) => fade(l, t, at(1, .35 + i * .18), T(2)));
    vis(cnt, n1 * P(t, at(1, .05), .4)); countUp(cnt, t, at(1, .05), 2, 0, 860, v => `≈ ${Math.round(v)} 亿个神经元`);
    const su = ((t - at(1, .3)) / 2.4 % 1 + 1) % 1;
    vis(sig, n1 * (t > at(1, .3) ? 1 : 0)); move(sig, ...along(sigPath, su));
    const n2 = win(t, T(2), E(3) + 3);
    vis(net, n2 * (1 - .6 * P(t, T(3), .6)));
    NP.forEach((p, i) => { const a = clamp(act(p, t)); nd[i].setAttribute('r', 7 + 7 * a); nd[i].setAttribute('opacity', .45 + .55 * a); });
    NE.forEach(([a, b], k) => ne[k].setAttribute('stroke-opacity', .15 + .7 * clamp((act(NP[a], t) + act(NP[b], t)) / 2)));
    words.forEach((w, i) => fade(w, t, at(2, .45 + i * .12), T(3)));
    pop(lineage, t, at(3, .35));
  };
});
