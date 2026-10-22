// Part 4 — 通用人工智能 · 课程介绍 · 总结

// ===================== AGI =====================
scene('agi', ({g, h, T, E, at}) => {
  const chap = chapterCard(h, '05', '通用人工智能');
  const def = H(`<div class="card glow" style="width:1500px;text-align:center;font-size:40px"><b style="color:var(--y)">通用人工智能 AGI</b>（Artificial General Intelligence）<br>在各种任务和领域中，表现出与人类<b class="hl">相当</b>甚至<b class="hl">超越</b>人类智能水平的人工智能系统</div>`, 960, 250, {}, h);
  const gpt = IMG('chatgpt', 560, 600, 700, 278, {cap: 'ChatGPT'}, h), db = IMG('doubao', 1360, 600, 560, 303, {cap: '豆包'}, h);
  const stages = [['book', '早期', '从书本里学习', COL.b], ['search', '十年前', '用搜索引擎找答案', COL.a], ['chat', '现在', '直接向大模型提问', COL.ok]].map(([ic, a, b, col], i) =>
    H(`<div class="tile" style="width:380px;border-color:${col};flex-direction:row;gap:20px">${ico(ic, 80, col, 2.5)}<div style="text-align:left"><span style="color:${col}">${a}</span><br><span class="s">${b}</span></div></div>`, 400 + i * 560, 290, {}, h));
  const sar = [0, 1].map(i => growArrow(g, 600 + i * 560, 290, 750 + i * 560, 290, COL.y, 6));
  const ex = [IMG('xiaoshi', 400, 650, 290, 350, {cap: '借一本《校史的故事》', capCls: 'sm'}, h), IMG('baidu', 960, 650, 500, 234, {cls: 'white', fit: 'contain', cap: '翻网页、自己筛选', capCls: 'sm'}, h), IMG('llm_answer', 1520, 650, 520, 185, {cap: '问一句，直接得到整理好的回答', capCls: 'sm'}, h)];
  const q = H('想了解北京大学的历史？', 960, 470, {cls: 'chip y lg'}, h);
  return t => {
    chap(t, T(0) - .3, E(0) + .4);
    const s1 = win(t, T(1), T(2));
    vis(def, s1); vis(gpt, s1 * P(t, at(1, .55), .5)); vis(db, s1 * P(t, at(1, .62), .5));
    kb(gpt, lerp(1, 1.05, U(t, T(1), 12))); kb(db, lerp(1, 1.05, U(t, T(1), 12)));
    stages.forEach((s, i) => pop(s, t, at(2, .1 + i * .3)));
    sar.forEach((a, i) => a.set(P(t, at(2, .25 + i * .3), .5)));
    fade(q, t, T(3), E(3) + 5);
    ex.forEach((e, i) => { vis(e, P(t, at(3, .2 + i * .25), .5)); kb(e, lerp(1, 1.06, U(t, T(3), 12))); });
  };
});

// ===================== 提示词工程 =====================
scene('prompt', ({g, h, T, E, at}) => {
  const panel = (x, title, col) => H(`<div class="chat" style="width:820px;height:600px"><div class="bar"><i></i><i></i><i></i>&nbsp;<span style="color:${col}">${title}</span></div><div class="m" style="display:flex;flex-direction:column;gap:16px"></div></div>`, x, 520, {}, h);
  const L = panel(490, '随便问问', 'var(--muted)'), R = panel(1430, '把要求说清楚', 'var(--y)');
  const mk = (p, cls, html) => { const b = document.createElement('div'); b.className = 'bub ' + cls; b.innerHTML = html; p.querySelector('.m').appendChild(b); return b; };
  const lq = mk(L, 'me', ''), la = mk(L, 'ai', '');
  const rq = mk(R, 'me', `<mark class="m1">你是一位高中老师</mark>，请<mark class="m2">用三个生活中的例子</mark>，<mark class="m3">在200字以内</mark>，<mark class="m4">向高一学生</mark>解释什么是机器学习`);
  const ra = mk(R, 'ai', '');
  rq.style.fontSize = '30px';
  const marks = [...rq.querySelectorAll('mark')];
  const tagDefs = [['角色', '#ffe066'], ['格式', '#6ee7a8'], ['要求', '#ffb347'], ['对象', '#ff9ec0']];
  const tags = tagDefs.map(([s, c], i) => H(s, 1110 + i * 150, 870, {cls: 'chip', style: {color: c, borderColor: c}}, h));
  const LA = '机器学习是人工智能的一个分支，它使计算机能够从数据中学习并改进性能，而无需显式编程。机器学习包括监督学习、无监督学习和强化学习等类型，广泛应用于……';
  const RA = '同学们，机器学习就是让电脑“从经验里学本事”：① 相册自动认出你的猫——它看过成千上万张猫照片；② 购物App猜你喜欢——它记住了你点过什么；③ 垃圾短信被拦截——它见多了骗子的套路。不是人教它规则，而是它自己从例子里总结规律！';
  la.style.fontSize = ra.style.fontSize = '28px';
  const rateL = H(stars(2), 490, 870, {style: {fontSize: '48px'}}, h), rateR = H(stars(5), 1700, 870 - 0, {style: {fontSize: '48px'}}, h);
  const pe = H('提示词工程 Prompt Engineering', 960, 170, {cls: 'chip y xl'}, h);
  return t => {
    vis(L, P(t, T(0) + .2, .5)); vis(R, P(t, T(0) + .6, .5));
    vis(lq, P(t, T(1), .3)); typed(lq, '介绍一下机器学习', t, T(1) + .1, 10, false);
    vis(la, P(t, at(1, .45), .3)); typed(la, LA, t, at(1, .45), 30, true);
    vis(rq, P(t, T(2), .4));
    marks.forEach((m, i) => { const v = P(t, at(2, .1 + i * .13), .4); m.style.background = `${tagDefs[i][1]}${Math.round(v * 70).toString(16).padStart(2, '0')}`; m.style.color = v > .5 ? tagDefs[i][1] : ''; });
    tags.forEach((tg, i) => pop(tg, t, at(2, .1 + i * .13), T(3)));
    vis(ra, P(t, at(2, .7), .3)); typed(ra, RA, t, at(2, .7), 26, true);
    vis(rateL, P(t, at(1, .9), .4)); pop(rateR, t, T(3));
    rise(pe, t, T(3) + .2);
  };
});

// ===================== 多模态 =====================
scene('multimodal', ({g, h, T, E, at}) => {
  const core = S('g', {}, g); S('circle', {cx: 960, cy: 540, r: 170, fill: 'url(#glowA)', opacity: .5}, core); S('circle', {cx: 960, cy: 540, r: 120, fill: '#16224a', stroke: COL.a, 'stroke-width': 6}, core);
  core._c = [960, 540];
  const coreL = H('<div style="text-align:center;font-size:40px;font-weight:900;line-height:1.3">多模态<br>大模型</div>', 960, 540, {}, h);
  const M = [['text', '文字', COL.a, 420, 320], ['image', '图像', COL.c, 420, 760], ['mic', '声音', COL.ok, 1500, 320], ['video', '视频', COL.b, 1500, 760], ['sensor', '传感器数据', COL.purple, 960, 190]];
  const tiles = M.map(([ic, s, col, x, y]) => H(`<div class="tile" style="width:240px;border-color:${col}">${ico(ic, 80, col, 2.5)}${s}</div>`, x, y, {}, h));
  const streams = M.map(([, , col, x, y]) => [...Array(4)].map(() => dot(g, 0, 0, 8, col)));
  const def = H('模态 = 信息的表达形式', 960, 860, {cls: 'chip y lg'}, h);
  const chat = H(`<div class="chat" style="width:900px"><div class="bar"><i></i><i></i><i></i></div><div class="bub me" style="padding:10px"><img src="img/mj.jpg" style="width:300px;border-radius:12px;display:block"><div style="margin-top:8px">描述一下这张图</div></div><div class="bub ai ans"></div></div>`, 760, 520, {}, h);
  const ans = chat.querySelector('.ans');
  const side = [['video', '给一段视频 → 总结内容', COL.b], ['mic', '直接语音对话', COL.ok]].map(([ic, s, col], i) => H(`<span style="display:flex;align-items:center;gap:12px">${ico(ic, 44, col)}${s}</span>`, 1520, 430 + i * 130, {cls: 'chip lg'}, h));
  const senses = [['eye', '用眼睛看', COL.a], ['ear', '用耳朵听', COL.ok], ['wave', '用嘴巴说', COL.b]].map(([ic, s, col], i) => H(`<div class="tile" style="width:340px;border-color:${col}">${ico(ic, 120, col, 2.5)}${s}</div>`, 520 + i * 440, 520, {}, h));
  return t => {
    const s0 = win(t, T(0) - .3, T(2));
    vis(core, s0); setScale(core, 1 + .04 * Math.sin(t * 3)); vis(coreL, s0);
    tiles.forEach((tl, i) => vis(tl, s0 * P(t, at(1, .25 + i * .12), .4)));
    streams.forEach((ss, i) => ss.forEach((d, k) => {
      const [, , , x, y] = M[i], u = ((t * .5 + k / 4) % 1);
      const p = [lerp(x, 960, u), lerp(y, 540, u)]; d.setAttribute('cx', p[0]); d.setAttribute('cy', p[1]);
      d.style.opacity = s0 * P(t, at(1, .4 + i * .1), .4) * Math.sin(Math.PI * u);
    }));
    vis(def, s0 * P(t, at(1, .1), .4));
    const s2 = win(t, T(2), T(3));
    vis(chat, s2); typed(ans, '画面里，一只狼、一头狮子和一只老虎穿着军装、戴着钢盔，神情严肃，像一张电影海报。', t, at(2, .2), 14, true);
    side.forEach((sd, i) => vis(sd, s2 * P(t, at(2, .5 + i * .2), .4)));
    senses.forEach((s, i) => pop(s, t, T(3) + .1 + i * .5));
  };
});

// ===================== AIGC =====================
scene('aigc', ({g, h, T, E, at}) => {
  const head = H(`<div style="text-align:center"><div class="title-l">AIGC · 人工智能生成内容</div><div class="lead muted" style="margin-top:10px">AI Generated Content</div></div>`, 960, 400, {}, h);
  const kinds = [['text', '文字', COL.a], ['image', '图像', COL.c], ['mic', '音频', COL.ok], ['video', '视频', COL.b]].map(([ic, s, col], i) => H(`<span style="display:flex;align-items:center;gap:10px">${ico(ic, 44, col)}${s}</span>`, 540 + i * 280, 620, {cls: 'chip lg'}, h));
  const prompt = H(`<div class="bub me" style="font-size:34px">提示词：</div>`, 960, 190, {}, h);
  const pics = [['mj', 'Midjourney', 480, 360, 470, -4], ['sd', 'Stable Diffusion', 300, 440, 960, 3], ['nano1', 'Nano Banana', 400, 430, 1440, -2]].map(([src, cap, w, hh, x, r]) => {
    const d = IMG(src, x, 560, w, hh, {cap: `<b>${cap}</b>`}, h); d._r = r; return d;
  });
  // film strip
  const strip = H(`<div class="film" style="display:flex;gap:26px;align-items:center;padding:34px 30px;background:#0a0a0a;border-top:14px dotted #333;border-bottom:14px dotted #333">${[['veo', 'Veo 3.1', 600, 338], ['ink1', 'SeeDance 2.0', 230, 409], ['ink2', 'SeeDance 2.0', 230, 409], ['sd_face', 'SeeDance 2.0', 230, 409], ['dance', 'SeeDance 2.0', 230, 409], ['veo', 'Veo 3.1', 600, 338]].map(([s, c, w, hh]) => `<div style="text-align:center"><div class="ph flat" style="width:${w}px;height:${hh}px"><img src="img/${s}.jpg" style="object-fit:cover"></div><div class="cap sm">${c}</div></div>`).join('')}</div>`, 960, 540, {anchor: 'l'}, h);
  const sora = H('Sora · Veo · SeeDance：以假乱真的视频生成', 960, 180, {cls: 'chip y lg'}, h);
  const warn = H(`<span style="display:flex;align-items:center;gap:20px">${ico('search', 70, COL.warn, 3)}眼见不一定为实</span>`, 960, 470, {cls: 'chip red xl', style: {fontSize: '72px', padding: '20px 60px'}}, h);
  const resp = H('学会辨别 · 负责任地使用', 960, 640, {cls: 'chip ok xl'}, h);
  return t => {
    const s0 = win(t, T(0) - .3, T(1));
    vis(head, s0); kinds.forEach((k, i) => vis(k, s0 * P(t, at(0, .35) + i * .4, .4)));
    const s1 = win(t, T(1), T(2));
    vis(prompt, s1); setHTML(prompt.firstChild, '提示词：' + Array.from('穿军装的动物，电影海报风格').slice(0, Math.floor(clamp((t - T(1) - .2) * 12, 0, 13))).join(''));
    pics.forEach((p, i) => { const u = U(t, at(1, .3) + i * .45, .6); vis(p, s1 * clamp(u * 2)); p.style.transform = `${p._base} rotate(${p._r}deg) scale(${u <= 0 ? .6 : lerp(.6, 1, outBack(u))})`; kb(p, lerp(1, 1.08, U(t, T(1), 12))); });
    const s2 = win(t, T(2), T(3));
    vis(strip, s2); strip.style.left = lerp(1400, -1600, U(t, T(2) - .3, E(2) - T(2) + 1.5)) + 'px';
    vis(sora, s2);
    pop(warn, t, T(3) + .1); rise(resp, t, at(3, .55));
  };
});

// ===================== DeepSeek =====================
scene('deepseek', ({g, h, T, E, at}) => {
  const shot = IMG('deepseek', 960, 400, 900, 460, {}, h);
  const why = H('为什么如此轰动？', 960, 720, {cls: 'chip y xl'}, h);
  const B = [['rocket', '性能强', '推理比肩 OpenAI o1', COL.a], ['flag', '国产', '高端 GPU 受限下突围', COL.c], ['coin', '便宜', '训练、推理成本都低', COL.ok], ['lock', '开源', '全世界都能下载研究', COL.b]];
  const badges = B.map(([ic, a, b, col], i) => H(`<div class="tile" style="width:380px;border-color:${col}">${ico(ic, 100, col, 2.5)}<span style="font-size:46px;color:${col}">${a}</span><span class="s">${b}</span></div>`, 300 + i * 440, 560, {}, h));
  const chat = H(`<div class="chat" style="width:1040px;height:640px"><div class="bar"><i></i><i></i><i></i>&nbsp;DeepSeek R1 · 深度思考</div><div class="bub me">天空为什么是蓝色的？</div><div style="font-size:24px;color:var(--muted)">已深度思考</div><div class="bub think th"></div><div class="bub ai an"></div></div>`, 760, 540, {}, h);
  const th = chat.querySelector('.th'), an = chat.querySelector('.an');
  const TH = '嗯，用户问天空为什么是蓝色。先回忆：阳光里包含各种颜色的光……蓝光波长短，更容易被空气分子散射。等等，紫光波长更短，为什么天空不是紫色？因为阳光里紫光较少，人眼对紫光也不敏感。好，可以回答了。';
  const AN = '因为阳光中波长较短的蓝光更容易被大气散射，从四面八方进入我们的眼睛，所以天空看起来是蓝色的。';
  const steps = ['分析问题', '拆解思路', '检查漏洞', '给出答案'].map((s, i) => H(s, 1560, 330 + i * 120, {cls: 'chip lg'}, h));
  return t => {
    const s0 = win(t, T(0) - .3, T(1));
    vis(shot, s0); kb(shot, lerp(1, 1.06, U(t, T(0), 10))); rise(why, t, at(0, .5), T(1));
    badges.forEach((b, i) => pop(b, t, i < 2 ? at(1, .05 + i * .45) : at(2, .05 + (i - 2) * .45), T(3)));
    const s3 = P(t, T(3), .5);
    vis(chat, s3);
    const tu = typed(th, TH, t, at(3, .1), 22, true), au = typed(an, AN, t, at(3, .1) + Array.from(TH).length / 22 + .3, 22, true);
    an.style.opacity = au > 0 ? 1 : 0;
    const k = au > 0 ? 3 : tu > .78 ? 2 : tu > .3 ? 1 : 0;
    steps.forEach((s, i) => { vis(s, s3 * P(t, at(3, .1) + i * .2, .3)); s.className = 'abs chip lg' + (i === k ? ' y' : ''); s.style.transform = `${s._base} scale(${i === k ? 1.1 : 1})`; });
  };
});

// ===================== 技术革命 =====================
scene('revolution', ({g, h, T, E, at}) => {
  const q = H('ChatGPT 为何让整个行业如此兴奋？', 960, 170, {cls: 'title-m'}, h);
  const cols = [
    [IMG('steam', 400, 440, 420, 340, {cls: 'white', fit: 'contain'}, h), '动力问题', '蒸汽机 · 内燃机', '代替人的体力', COL.b],
    [IMG('switchboard', 960, 440, 420, 340, {}, h), '信息传输与控制问题', '电力 · 通信', '把世界连在一起', COL.a],
    [IMG('brain2', 1520, 440, 420, 340, {}, h), '决策问题', '大模型', '帮人思考和判断', COL.y],
  ].map(([im, a, b, c, col], i) => ({im, lab: H(`<div style="text-align:center"><div style="font-size:44px;font-weight:900;color:${col}">${a}</div><div style="font-size:30px;margin-top:6px">${b} <span class="muted">· ${c}</span></div></div>`, 400 + i * 560, 700, {}, h)}));
  const car = IMG('car', 520, 540, 220, 144, {}, h);
  const ax = growArrow(g, 160, 820, 1780, 820, 'rgba(255,224,102,.7)', 6);
  const eras = ['工业革命', '电气与信息时代', '智能时代'].map((s, i) => H(s, 400 + i * 560, 860, {style: {fontSize: '30px', color: 'var(--muted)'}}, h));
  const halo = H('', 1520, 440, {style: {width: '480px', height: '400px', borderRadius: '30px', boxShadow: '0 0 80px 20px rgba(255,224,102,.45)', border: '4px solid var(--y)'}}, h);
  return t => {
    rise(q, t, T(0) - .2);
    const sh = [T(1), T(2), T(3)];
    cols.forEach((c, i) => { vis(c.im, P(t, sh[i], .6)); kb(c.im, lerp(1, 1.08, U(t, sh[i], 10))); rise(c.lab, t, sh[i] + .4); vis(eras[i], P(t, sh[i] + .4, .4)); });
    vis(car, P(t, at(1, .5), .5));
    ax.set(P(t, T(1), 3 + (T(3) - T(1))));
    vis(halo, P(t, at(3, .5), .6) * (.7 + .3 * Math.sin(t * 4)));
  };
});

// ===================== AI 智能体 =====================
scene('agent', ({g, h, T, E, at}) => {
  const bot = H(ico('robot', 220, COL.a, 2.2), 960, 500, {}, h);
  const botT = H('AI 智能体 · Agent', 960, 660, {cls: 'title-m', style: {fontSize: '52px'}}, h);
  const loopG = S('g', {}, g), LC = [960, 540], LR = 290;
  S('circle', {cx: LC[0], cy: LC[1], r: LR, fill: 'none', stroke: 'rgba(255,255,255,.18)', 'stroke-width': 6}, loopG);
  const nodes = [['eye', '感知环境', COL.a], ['bulb', '做出决策', COL.y], ['hand', '采取行动', COL.ok], ['book', '学习改进', COL.purple]].map(([ic, s, col], i) => {
    const a = -Math.PI / 2 + i * Math.PI / 2, x = LC[0] + Math.cos(a) * LR, y = LC[1] + Math.sin(a) * LR;
    return H(`<div class="tile" style="padding:16px 22px;border-color:${col}">${ico(ic, 64, col, 2.5)}<span style="font-size:30px">${s}</span></div>`, x, y, {}, h);
  });
  const orb = glow(g, 26);
  const user = H(`<div class="bub me" style="font-size:36px">帮我规划周末去杭州的行程</div>`, 1250, 230, {}, h);
  const tasks = [['sun', '查天气：周六晴 24℃，周日小雨', COL.y], ['pin', '搜景点：西湖 · 灵隐寺 · 西溪湿地', COL.c], ['bed', '比价订酒店：西湖边 ¥468/晚 ✓', COL.a], ['doc', '生成完整行程方案 ✓', COL.ok]].map(([ic, s, col], i) =>
    H(`<span style="display:flex;align-items:center;gap:16px">${ico(ic, 50, col)}${s}</span>`, 900, 380 + i * 115, {cls: 'card sm', anchor: 'l', style: {fontSize: '34px'}}, h));
  const sci = ['查文献', '设计实验', '编写代码', '分析结果'].map((s, i) => H(`<span style="display:flex;align-items:center;gap:10px">${ico(['search', 'flask', 'code', 'chart'][i], 40, COL.ok)}${s}</span>`, 300 + i * 440, 820, {cls: 'chip ok lg'}, h));
  const sciA = [0, 1, 2].map(i => H('→', 520 + i * 440, 820, {style: {fontSize: '44px', color: 'var(--y)'}}, h));
  const doIt = H('不只是回答，而是真正动手完成任务', 960, 680, {cls: 'chip y xl'}, h);
  return t => {
    const sh = P(t, T(2), .8), k = lerp(1, .62, sh), dx = -540 * sh;
    vis(bot, P(t, T(0) - .2, .5) * (1 - P(t, T(3), .5)));
    bot.style.transform = `${bot._base} translate(${dx}px,${40 * sh}px) scale(${lerp(1, .5, sh)})`;
    vis(botT, P(t, T(0) - .2, .5) * (1 - P(t, T(2), .4)));
    const lo = P(t, T(1), .5) * (1 - P(t, T(3), .5));
    vis(loopG, lo); loopG.setAttribute('transform', `translate(${dx + LC[0] * (1 - k)} ${LC[1] * (1 - k)}) scale(${k})`);
    nodes.forEach((n, i) => { vis(n, lo * P(t, T(1) + .3 + i * .5, .4)); const a = -Math.PI / 2 + i * Math.PI / 2; at2(n, LC[0] + dx + Math.cos(a) * LR * k, LC[1] + Math.sin(a) * LR * k, `scale(${lerp(1, .72, sh)})`); });
    const oa = (t - T(1)) * 1.4 - Math.PI / 2; vis(orb, lo * (t > at(1, .5) ? 1 : 0)); move(orb, LC[0] + dx + Math.cos(oa) * LR * k, LC[1] + Math.sin(oa) * LR * k);
    vis(user, win(t, T(2) + .2, T(3)));
    tasks.forEach((tk, i) => { vis(tk, win(t, at(2, .2 + i * .17), T(3))); tk.style.transform = `${tk._base} translateX(${(1 - P(t, at(2, .2 + i * .17), .5)) * 60}px)`; });
    rise(doIt, t, T(3) + .1);
    sci.forEach((s, i) => pop(s, t, at(3, .4 + i * .12)));
    sciA.forEach((s, i) => vis(s, P(t, at(3, .46 + i * .12), .3)));
  };
});

// ===================== AI 写代码 =====================
scene('code', ({g, h, T, E, at}) => {
  const CODE = ['# 把知识写成代码，它就能运行', 'def bmi(weight, height):', '    return weight / height ** 2', '', 'def advice(b):', '    if b < 18.5: return "偏瘦，多吃点"', '    if b < 24:   return "正常，继续保持"', '    return "偏胖，多运动"', '', 'print(advice(bmi(65, 1.75)))', '>>> 正常，继续保持'];
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const hl = s => s.startsWith('#') ? `<span class="cm">${esc(s)}</span>` : s.startsWith('>>>') ? `<span class="tg">${esc(s)}</span>`
    : esc(s).replace(/"[^"]*"/g, m => `<span class="st">${m}</span>`).replace(/\b(def|return|if)\b/g, '<span class="kw">$1</span>').replace(/\b(bmi|advice|print)\b(?=\()/g, '<span class="fn">$1</span>');
  const ed = H(`<div class="editor"><div class="top"><i></i><i></i><i></i>&nbsp;knowledge.py</div><pre></pre></div>`, 560, 520, {}, h);
  const pre = ed.querySelector('pre');
  const motto = H(`<div style="text-align:center">${ico('code', 120, COL.y, 2.5)}<div class="title-l" style="margin-top:10px">代码 = <span style="color:var(--y)">可运行的知识</span></div></div>`, 1400, 520, {}, h);
  const br = [H(`<div class="card" style="width:720px"><h3>① 操作现有系统</h3><div style="display:flex;gap:18px;align-items:center">${['globe', 'db', 'doc', 'chart', 'phone'].map((n, i) => ico(n, 64, [COL.a, COL.ok, COL.b, COL.c, COL.purple][i], 2.5)).join('')}</div><div style="font-size:32px;margin-top:10px">自动调用、调动它们的能力</div></div>`, 1400, 360, {}, h),
    H(`<div class="card" style="width:720px"><h3>② 创作新程序</h3><div style="display:flex;gap:14px;align-items:center;font-size:36px"><span class="chip a">设计</span>→<span class="chip ok">开发</span>→<span class="chip b">测试</span></div><div style="font-size:32px;margin-top:10px">自己完成全流程</div></div>`, 1400, 640, {}, h)];
  const smart = H('智能体 → 真正意义上的智能化', 1400, 860, {cls: 'chip y xl'}, h);
  const ask = H(`<div class="bub me" style="font-size:38px">帮我做一个记录每天喝水量的网页</div>`, 520, 330, {}, h);
  const arr = growArrow(g, 520, 420, 520, 560, COL.y, 7);
  const vc = H(`<div style="text-align:center"><div class="title-l">Vibe Coding</div><div class="lead">不懂编程，也能用<b>自然语言</b>把想法做成应用</div></div>`, 520, 720, {}, h);
  const cups = [...Array(8)].map((_, i) => `<div class="cup" style="width:64px;height:84px;border:4px solid #2f6bff;border-top:none;border-radius:0 0 14px 14px;position:relative;overflow:hidden"><div class="w" style="position:absolute;left:0;right:0;bottom:0;height:0;background:#7cc4ff"></div></div>`).join('');
  const app = H(`<div style="width:760px;border-radius:24px;background:#f6f9ff;color:#1a2140;padding:30px 36px;box-shadow:0 20px 60px rgba(0,0,0,.45);white-space:normal"><div style="font-size:44px;font-weight:900">今日喝水</div><div style="display:flex;gap:16px;margin:26px 0">${cups}</div><div style="height:22px;border-radius:11px;background:#dde6fb"><div class="pb" style="height:100%;border-radius:11px;background:#2f6bff;width:0"></div></div><div style="display:flex;justify-content:space-between;align-items:center;margin-top:20px"><span class="ml" style="font-size:34px;font-weight:700">0 / 2000 ml</span><span style="font-size:32px;color:#fff;background:#2f6bff;border-radius:14px;padding:10px 24px">＋ 喝一杯</span></div></div>`, 1340, 520, {}, h);
  const ws = [...app.querySelectorAll('.w')], pb = app.querySelector('.pb'), ml = app.querySelector('.ml');
  return t => {
    const s0 = win(t, T(0) - .3, at(3, .05));
    vis(ed, s0);
    const total = CODE.join('\n').length, n = Math.floor(clamp((t - T(0)) * 26, 0, total));
    let left = n, out = [];
    for (const ln of CODE) { if (left >= ln.length) { out.push(hl(ln)); left -= ln.length + 1; } else { out.push(esc(ln.slice(0, Math.max(0, left))) + '<span style="color:var(--y)">▍</span>'); left = -1; break; } }
    setHTML(pre, out.join('\n'));
    vis(motto, win(t, at(0, .35), T(1)));
    br.forEach((b, i) => rise(b, t, at(1, .05 + i * .45), at(3, .05)));
    rise(smart, t, T(2), at(3, .05));
    vis(ask, P(t, at(3, .05), .4)); arr.set(P(t, at(3, .2), .5)); rise(vc, t, at(3, .6));
    const au = P(t, at(3, .25), .5); vis(app, au); app.style.transform = `${app._base} scale(${lerp(.85, 1, au)})`;
    const k = clamp((t - at(3, .35)) / .6, 0, 8);
    ws.forEach((w, i) => w.style.height = (clamp(k - i) * 100) + '%');
    const mlv = Math.round(Math.min(k, 8) * 250); pb.style.width = (mlv / 20) + '%'; setText(ml, `${mlv} / 2000 ml`);
  };
});

// ===================== 课程介绍 =====================
scene('course', ({g, h, T, E, at}) => {
  const head = H('本课程介绍', 960, 170, {cls: 'title-l', style: {fontSize: '70px'}}, h);
  const goals = [['spark', '学习和使用最先进的人工智能工具', COL.y], ['code', '掌握基本的 Vibe Coding 技能', COL.ok]].map(([ic, s, col], i) => H(`<span style="display:flex;align-items:center;gap:18px">${ico(ic, 56, col)}${s}</span>`, 960, 360 + i * 120, {cls: 'card', style: {fontSize: '44px', width: '1100px'}}, h));
  const aud = H(`<span style="display:flex;align-items:center;gap:20px">${ico('users', 60, COL.a)}零基础 · 任何专业都欢迎</span>`, 960, 700, {cls: 'chip a xl'}, h);
  const hrs = [[18, '理论课', COL.a], [20, '实践', COL.ok], [4, '成果展示', COL.y]];
  const hb = hrs.map(([v, s, col], i) => {
    const x0 = 210 + hrs.slice(0, i).reduce((a, b) => a + b[0], 0) * 35.7;
    return H(`<div style="height:150px;background:${col};border-radius:16px;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#0c1322;font-weight:900;font-size:40px;line-height:1.2;width:${v * 35.7 - 10}px"><span class="f" style="font-size:56px">${v}h</span>${s}</div>`, x0, 500, {anchor: 'l'}, h);
  });
  const tot = H('共 42 小时', 960, 680, {cls: 'chip y lg'}, h);
  const hw = ['大语言模型工具 · 基础体验', '大语言模型工具 · 进阶体验', 'AIGC · 基础体验', 'Vibe Coding · 静态网页', 'Vibe Coding · 可交互网站'];
  const stairs = hw.map((s, i) => H(`<div class="card sm" style="width:330px;text-align:center;border-color:${[COL.a, COL.a, COL.c, COL.ok, COL.ok][i]}"><b class="f" style="color:var(--y)">${i + 1}</b><br>${s}</div>`, 250 + i * 355, 760 - i * 105, {}, h));
  const hwT = H('个人作业 · 共 10 小时 · 循序渐进', 520, 260, {cls: 'chip y lg'}, h);
  const team = H(`<div style="display:flex;align-items:center;gap:40px"><div style="display:flex">${[COL.a, COL.ok, COL.b].map(c => ico('person', 110, c, 2.5)).join('')}</div><div style="font-size:52px;font-weight:900">≤ 3 人一组</div></div>`, 960, 330, {}, h);
  const proj = H(`<div class="card glow" style="width:1300px;text-align:center;font-size:40px">用 AI 工具开发一个<b class="hl">能直接运行</b>的应用<br><span style="font-size:34px">解决生活或科研中的一个实际问题 · 网站 / App / 智能体……</span></div>`, 960, 560, {}, h);
  const okno = H(`<span style="display:flex;gap:40px"><span class="chip ok xl">✓ 能运行的应用</span><span class="chip red xl">✗ 只有原型图</span></span>`, 960, 760, {}, h);
  const rules = [['不签到', 'a'], ['作业必须完成', 'b'], ['考核：通过 / 不通过', 'p']].map(([s, c], i) => H(s, 460 + i * 500, 360, {cls: `chip ${c} xl`}, h));
  const motto = H('大胆尝试 · 动手实践！', 960, 600, {style: {fontFamily: 'var(--serif)', fontWeight: 900, fontSize: '110px', color: 'var(--y)', textShadow: '0 0 50px rgba(255,224,102,.45)'}}, h);
  return t => {
    vis(head, P(t, T(0) - .3, .5) * (1 - P(t, T(3), .4)));
    goals.forEach((g2, i) => rise(g2, t, at(0, .2 + i * .3), T(2)));
    pop(aud, t, T(1) + .1, T(2));
    hb.forEach((b, i) => { const u = P(t, T(2) + .2 + i * .9, .6); vis(b, u * (1 - P(t, T(3), .4))); b.style.transform = `${b._base} scaleX(${u})`; b.style.transformOrigin = 'left center'; });
    vis(tot, P(t, at(2, .8), .4) * (1 - P(t, T(3), .4)));
    vis(hwT, win(t, T(3), T(4)));
    stairs.forEach((s, i) => rise(s, t, at(3, .1 + i * .16), T(4)));
    pop(team, t, T(4) + .1, T(5)); rise(proj, t, at(4, .3), T(5)); rise(okno, t, at(4, .75), T(5));
    rules.forEach((r, i) => pop(r, t, T(5) + .1 + i * .7));
    const mu = U(t, at(5, .6), .6); vis(motto, clamp(mu * 2)); motto.style.transform = `${motto._base} scale(${mu <= 0 ? .5 : lerp(.5, 1, outBack(mu))})`;
  };
});

// ===================== 总结 =====================
scene('summary', ({g, h, T, E, at}) => {
  const head = H('今天的旅程', 960, 170, {cls: 'title-m'}, h);
  const N = 120, pts = [];
  for (let i = 0; i <= N; i++) { const u = i / N; pts.push([200 + u * 1520, 470 + 60 * Math.sin(u * Math.PI * 2.2 + .4)]); }
  const road = stroke(pts, {stroke: 'rgba(255,224,102,.75)', 'stroke-width': 7}, g);
  const stops = [['01', '起源', '图灵测试 · 达特茅斯', COL.a], ['02', '三大流派', '符号 · 行为 · 连接', COL.b], ['03', '机器学习', '数据 · 模型 · 损失 · 优化', COL.ok], ['04', '深度学习', '低谷 · ImageNet · 大模型', COL.c], ['05', '通用人工智能', '多模态 · 智能体 · Vibe Coding', COL.purple]];
  const nodes = stops.map(([no, nm, kw, col], k) => {
    const u = .05 + k * .225, p = along(pts, u), gg = S('g', {}, g);
    S('circle', {cx: p[0], cy: p[1], r: 46, fill: '#0c1322', stroke: col, 'stroke-width': 6}, gg);
    const tx = S('text', {x: p[0], y: p[1] + 2, 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: col, 'font-size': 38, 'font-weight': 700}, gg); tx.textContent = no;
    gg._c = p;
    const lab = H(`<div style="text-align:center"><div style="font-size:40px;font-weight:900;color:${col}">${nm}</div><div style="font-size:28px;color:#dfe6fb;margin-top:6px">${kw}</div></div>`, p[0], p[1] + (k % 2 ? -120 : 120), {}, h);
    return {gg, lab, u};
  });
  const trav = glow(g, 30);
  const curve = stroke([...Array(101)].map((_, i) => { const u = i / 100, y = .2 + .5 * Math.exp(-(((u - .2) / .09) ** 2)) + .5 * Math.exp(-(((u - .55) / .08) ** 2)) + 1.2 / (1 + Math.exp(-(u - .88) / .03)); return [360 + u * 1200, 760 - Math.min(y, 1.5) * 200]; }), {stroke: COL.c, 'stroke-width': 7}, g);
  const tip = arrow(g, 1540, 470, 1580, 420, COL.c, 7);
  const lesson = H('每一次低谷之后，都可能迎来新的飞跃', 960, 260, {cls: 'title-m'}, h);
  const now = H('现在，正是动手的最好时机！', 960, 860, {cls: 'chip y xl'}, h);
  const bye = H(`<div style="text-align:center"><div class="title-xl" style="font-size:150px">下节课见！</div><div class="lead muted" style="margin-top:24px">人工智能通识课 · 第一讲　人工智能发展史与基础概念</div></div>`, 960, 500, {}, h);
  const bg = BGS(g, 'brain', 'veilR');
  g.insertBefore(bg, g.firstChild);
  return t => {
    const r = win(t, T(0) - .3, T(2));
    rise(head, t, T(0) - .3, T(2));
    draw(road, P(t, T(0), 1.2)); road.style.opacity = r * (+road.style.opacity);
    const tu = clamp((t - T(1)) / ((E(1) - T(1)) * .9));
    nodes.forEach((n, k) => {
      vis(n.gg, r * P(t, T(0) + .2 + k * .12, .4)); setScale(n.gg, 1 + .25 * bump(t, T(1) + (n.u - .05) / .9 * (E(1) - T(1)) * .9, .7));
      vis(n.lab, r * P(t, T(1) + (n.u - .05) / .9 * (E(1) - T(1)) * .9, .5));
    });
    vis(trav, r * (t > T(1) ? 1 : 0)); move(trav, ...along(pts, .05 + tu * .9));
    const c = win(t, T(2), T(3));
    draw(curve, P(t, T(2) + .2, 2.5)); curve.style.opacity = c * (+curve.style.opacity); vis(tip, c * P(t, T(2) + 2.6, .3));
    vis(lesson, c * P(t, T(2), .5)); vis(now, c * P(t, at(2, .6), .5));
    vis(bg, P(t, T(3) - .2, .8)); bg.kb(lerp(1.05, 1.2, U(t, T(3), 12)));
    pop(bye, t, T(3));
  };
});
