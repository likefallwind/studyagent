/* 页面：开课诊断与方案 / 学习页 / 掌握检测 / 学习档案 */
(function () {
  const SA = window.SA, C = SA.course, ic = SA.ic, A = SA.assistant;
  SA.pages = SA.pages || {};
  const st = () => SA.store.s;
  const save = () => SA.store.save();

  /* ---------- 页面级清理 ---------- */
  let cleanups = [];
  const addCleanup = (f) => { if (typeof f === 'function') cleanups.push(f); };
  SA.runCleanups = () => { cleanups.forEach((f) => { try { f(); } catch (e) { /* ignore */ } }); cleanups = []; };

  /* ---------- 进度 ---------- */
  const P = (SA.progress = {
    passed: (id) => !!st().passed[id],
    chPassed: (chId) => !!(st().checks[chId] && st().checks[chId].passed),
    allSecPassed: (ch) => ch.sections.every((s) => P.passed(s.id)),
    unlocked(id) {
      if (st().unlockAll) return true;
      const s = C.sec(id), i = C.sections.indexOf(s);
      if (i <= 0) return true;
      const prev = C.sections[i - 1];
      return prev.ch !== s.ch ? P.passed(prev.id) && P.chPassed(prev.ch) : P.passed(prev.id);
    },
    checkUnlocked: (chId) => st().unlockAll || P.allSecPassed(C.chapter(chId)),
    pct: () => Math.round((C.sections.filter((s) => P.passed(s.id)).length / C.sections.length) * 100),
    kpTotal: () => Object.keys(C.kps).length,
    kpMastered: () => Object.keys(C.kps).filter((k) => (st().mastery[k] || 0) >= 0.7).length,
    frontier() {
      for (const ch of C.chapters) {
        for (const s of ch.sections) if (!P.passed(s.id)) return '#/learn/' + s.id;
        if (!P.chPassed(ch.id)) return '#/check/' + ch.id;
      }
      return '#/profile';
    },
    plusFor: (id) => { const p = st().plan; return p ? p.plus.filter((k) => C.supplements[k] && C.supplements[k].sec === id) : []; },
    isSkip: (id) => { const p = st().plan; return !!(p && p.skip.includes(id)); },
    master(kps, v) { kps.forEach((k) => { st().mastery[k] = Math.max(st().mastery[k] || 0, v); }); }
  });

  /* ---------- 方案计算 ---------- */
  const WHY = [
    { k: 'work', t: '工作里天天在用大模型，但说不清它到底是怎么回事' },
    { k: 'code', t: '想用 AI 写代码、做出自己的小应用' },
    { k: 'school', t: '课程要求，想系统地打好基础' },
    { k: 'curious', t: '单纯好奇，想知道 AI 是怎么来的' }
  ];
  const BG = [
    { k: 'none', t: '没写过代码，数学也忘得差不多了' },
    { k: 'some', t: '写过一点 Python，数学一般' },
    { k: 'strong', t: '会编程，数学基础还不错' }
  ];
  const KNOWN = [
    { k: 'ml', t: '机器学习是让机器从数据中学规律', skip: '3.1' },
    { k: 'clsreg', t: '分类和回归有什么区别', skip: '3.2' },
    { k: 'prompt', t: '怎样写出好的提示词', skip: '5.2' }
  ];
  const PACE = [15, 25, 40];
  SA.computePlan = function (ans) {
    const plus = new Set(), skip = new Set(), why = [];
    if (ans.why === 'work') { plus.add('plus-halluc'); plus.add('plus-work'); why.push(['加强', '第 5 章：加“大模型为什么会幻觉”，贴近你的工作。'], ['加强', '5.5：加“把智能体用进你的工作流”。']); }
    if (ans.why === 'code') { plus.add('plus-python'); plus.add('plus-work'); why.push(['加强', '3.2：加“5 行 Python 训练一个分类器”，让你尽早动手。']); }
    if (ans.why === 'curious') { plus.add('plus-nn'); why.push(['加强', '第 4 章：补“神经网络的直觉”，不讲公式，用比方。']); }
    if (ans.bg === 'none') { plus.add('plus-math'); plus.add('plus-nn'); why.push(['加强', '3.3：先补“函数就是输入 → 输出”的数学直觉。'], ['加强', '第 4 章：补“神经网络的直觉”，不讲公式，用可视化。']); }
    if (ans.bg === 'some' && !plus.has('plus-nn')) { plus.add('plus-nn'); why.push(['加强', '第 4 章：补“神经网络的直觉”，不讲公式，用可视化。']); }
    if (ans.bg === 'strong' && !plus.has('plus-python')) { plus.add('plus-python'); why.push(['加强', '3.2：加一段可以直接运行的 Python 代码。']); }
    (ans.known || []).forEach((k) => { const o = KNOWN.find((x) => x.k === k); if (o) { skip.add(o.skip); why.push(['快速通过', `${o.skip}：你已经理解“${o.t}”，做 1 道题确认即可。`]); } });
    const uniq = []; why.forEach((w) => { if (!uniq.some((u) => u[1] === w[1])) uniq.push(w); });
    return { why: ans.why, bg: ans.bg, known: ans.known || [], pace: ans.pace || 25, plus: Array.from(plus), skip: Array.from(skip), reasons: uniq, at: Date.now() };
  };
  function planMinutes(plan) {
    let m = 0;
    C.sections.forEach((s) => { m += plan && plan.skip.includes(s.id) ? 3 : s.minutes; });
    m += (plan ? plan.plus.length : 0) * 8 + C.chapters.length * 10;
    return m;
  }
  function finishDate(min, pace) {
    const d = new Date(); d.setDate(d.getDate() + Math.ceil(min / pace));
    return String(d.getMonth() + 1).padStart(2, '0') + '.' + String(d.getDate()).padStart(2, '0');
  }

  /* ---------- 顶栏 ---------- */
  SA.renderHeader = function (mode) {
    const h = document.getElementById('app-header');
    const brand = `<a class="brand" href="#/plan"><span class="brand-logo">AI</span><span class="brand-text"><b>${C.title}</b><span>${mode === 'plan' ? '开课前 · 定制你的学习方案' : C.subtitle}</span></span></a>`;
    if (mode === 'plan') {
      const p = st().plan;
      h.innerHTML = `${brand}<div class="steps"><span class="step-pill ${p ? 'done' : 'now'}">第 1 步 诊断</span><span aria-hidden="true">→</span><span class="step-pill ${p ? 'now' : ''}">第 2 步 确认方案</span><span aria-hidden="true">→</span><span class="step-pill">第 3 步 开始学习</span></div>`;
      return;
    }
    const pct = P.pct();
    h.innerHTML = `${brand}
      <div class="hdr-progress"><span style="white-space:nowrap">课程进度</span><div class="bar"><i style="width:${pct}%"></i></div><span class="pct">${pct}%</span><span style="white-space:nowrap">· 已掌握 ${P.kpMastered()} / ${P.kpTotal()} 个知识点</span></div>
      <div class="hdr-right"><span class="streak">${ic.flame(14)} 连续学习 ${st().streak} 天</span><a class="avatar" href="#/profile" aria-label="学习档案">林</a></div>`;
  };

  /* =========================================================
     开课：诊断 + 学习方案
     ========================================================= */
  SA.pages.plan = function (root) {
    SA.renderHeader('plan');
    let draft = st().plan ? Object.assign({}, st().plan) : { known: [] };
    let plan = st().plan || null;
    const tags = [];

    root.innerHTML = `<div class="plan-page"></div>`;
    const page = SA.$('.plan-page', root);

    function routeHtml(p) {
      return C.chapters.map((ch) => {
        const chips = [];
        ch.sections.forEach((s) => {
          const plusK = p ? p.plus.filter((k) => C.supplements[k].sec === s.id) : [];
          plusK.forEach((k) => chips.push(`<span class="ps plus">+ ${C.supplements[k].label}</span>`));
          chips.push(`<span class="ps ${p && p.skip.includes(s.id) ? 'skip' : 'std'}">${s.id} ${s.title}</span>`);
        });
        const mins = ch.sections.reduce((m, s) => m + (p && p.skip.includes(s.id) ? 3 : s.minutes), 0) + (p ? ch.sections.reduce((m, s) => m + p.plus.filter((k) => C.supplements[k].sec === s.id).length * 8, 0) : 0) + 10;
        const checkName = { order: '时间排序', buckets: '分类练习' }[ch.check.type];
        return `<section class="plan-ch" data-ch="${ch.id}"><div class="l"><span class="no">${ch.no}</span><div style="display:flex;flex-direction:column;gap:4px"><h2>${ch.name}</h2><span class="meta">${ch.meta}</span></div></div><div class="secs">${chips.join('')}</div><div class="r"><span class="mono" style="font-size:15px">${mins} 分钟</span><span class="w-note">掌握检测 · ${checkName}</span></div></section>`;
      }).join('');
    }
    function renderLeft(changed) {
      const p = plan;
      const min = planMinutes(p), pace = (p && p.pace) || draft.pace || 25;
      page.innerHTML = `
        ${p ? '' : `
        <div class="hero">
          <svg class="hero-net" viewBox="0 0 420 320" aria-hidden="true">${heroNet()}</svg>
          <span class="pill accent" style="align-self:flex-start">${C.teacher} · ${C.subtitle}</span>
          <h1>不是一套 PPT，而是一位陪你学完这门课的助手</h1>
          <p>左边是课程团队编写的课程，右边是学习助手。它会先了解你，为你排好路线；学习中按你的情况<b>插入补充讲解</b>；每节用小测确认你真的懂了，才解锁下一节。</p>
          <div class="chs">${C.chapters.map((c) => `<span class="pill">${c.no} ${c.name}</span>`).join('')}</div>
        </div>
        <div class="features">
          <div class="mini-card"><span class="ic">${ic.target(18)}</span><h4>先诊断，再排路线</h4><p>3 个问题，跳过你已掌握的，加强你需要的。</p></div>
          <div class="mini-card"><span class="ic">${ic.cpu(18)}</span><h4>能动手的课程</h4><p>训练神经网络、调参数、跑强化学习，全都在浏览器里。</p></div>
          <div class="mini-card"><span class="ic">${ic.chat(18)}</span><h4>助手改写课程</h4><p>没听懂？它会换个比方，直接插进课程里。</p></div>
          <div class="mini-card"><span class="ic">${ic.check(18)}</span><h4>掌握了才往下走</h4><p>答错不直接给答案，而是换种方式再讲。</p></div>
        </div>`}
        <div class="plan-top">
          <div style="display:flex;flex-direction:column;gap:6px">
            <div class="muted" style="font-size:13px">${p ? '为 林同学 生成 · 可随时调整' : '标准路线预览 · 回答右侧的问题后为你定制'}</div>
            <h1 style="font-size:${p ? 32 : 26}px">${p ? '你的学习路线' : '课程路线'}</h1>
          </div>
          <div class="plan-stats">
            <div class="w-stat"><span class="l">总时长</span><span class="v">${(min / 60).toFixed(1)} h</span></div>
            <div class="w-stat"><span class="l">节奏</span><span class="v" style="font-family:var(--font);font-weight:700">每天 ${pace} 分钟</span></div>
            <div class="w-stat"><span class="l">预计完成</span><span class="v">${finishDate(min, pace)}</span></div>
          </div>
        </div>
        <div class="legend"><span><i style="background:var(--accent)"></i>标准内容</span><span><i style="background:var(--amber)"></i>为你加强</span><span><i style="border:1.5px dashed var(--faint);box-sizing:border-box"></i>已掌握，可快速通过</span></div>
        <div style="display:flex;flex-direction:column;gap:12px">${routeHtml(p)}</div>
        <div class="w-row" style="padding-top:4px">
          ${p ? `<a class="btn lg primary" href="${P.frontier()}">${Object.keys(st().passed).length ? '继续学习' : '按这个方案开始学习'} ${ic.arrow(16)}</a><button type="button" class="btn lg pl-adjust">让助手再调整</button>`
              : `<button type="button" class="btn lg primary pl-focus">回答右侧 3 个问题，定制路线</button><button type="button" class="btn lg pl-skip">跳过诊断，按标准路线学</button>`}
        </div>`;
      if (changed) changed.forEach((id) => { const el = SA.$(`.plan-ch[data-ch="${id}"]`, page); if (el) el.classList.add('changed'); });
      const f = SA.$('.pl-focus', page); if (f) f.addEventListener('click', () => { if (A.isDrawer()) A.open(); else SA.$('#ask').focus(); });
      const sk = SA.$('.pl-skip', page); if (sk) sk.addEventListener('click', () => { plan = SA.computePlan({ pace: 25, known: [] }); st().plan = plan; save(); location.hash = '#/learn/1.1'; });
      const ad = SA.$('.pl-adjust', page); if (ad) ad.addEventListener('click', () => { if (A.isDrawer()) A.open(); A.say('好，想怎么调？比如：“<b>我每天只有 15 分钟</b>”“<b>我已经会写提示词了</b>”，或者点下面的按钮重新诊断。', { after: (n) => addBtns(n, [['重新诊断', () => restart()]]) }); });
      SA.observeReveal(page);
    }
    function heroNet() {
      const pts = [[60, 60], [60, 160], [60, 260], [180, 40], [180, 120], [180, 200], [180, 280], [300, 100], [300, 220], [390, 160]];
      const links = [[0, 3], [0, 4], [1, 4], [1, 5], [2, 5], [2, 6], [0, 5], [1, 3], [2, 4], [3, 7], [4, 7], [5, 8], [6, 8], [4, 8], [5, 7], [7, 9], [8, 9]];
      return links.map(([a, b], i) => `<line x1="${pts[a][0]}" y1="${pts[a][1]}" x2="${pts[b][0]}" y2="${pts[b][1]}" stroke="${i % 3 ? '#C5CAFF' : '#2B3BB8'}" stroke-width="${1 + (i % 3)}" class="flow" style="stroke-dasharray:6 8;animation:dash ${1 + (i % 4) * 0.4}s linear infinite"></line>`).join('') +
        pts.map((p, i) => `<circle cx="${p[0]}" cy="${p[1]}" r="${i === 9 ? 14 : 9}" fill="${i === 9 ? '#E9A23B' : '#fff'}" stroke="#2B3BB8" stroke-width="2"></circle>`).join('');
    }
    function addBtns(n, list) {
      const row = SA.h('<div class="msg-links" style="margin-top:4px"></div>');
      list.forEach(([t, f]) => { const b = SA.h(`<button type="button" class="msg-link blue">${t}</button>`); b.addEventListener('click', f); row.appendChild(b); });
      n.appendChild(row);
    }

    /* 诊断对话 */
    function ask(step) {
      if (step === 1) {
        A.say('你为什么想学这门课？', { who: '助手 · 1 / 3' });
        A.card((body) => single(body, WHY, (o) => { draft.why = o.k; A.user(o.t); ask(2); }), { who: '选一个最接近的' });
      } else if (step === 2) {
        A.say('你接触过编程或高中以上的数学吗？', { who: '助手 · 2 / 3' });
        A.card((body) => single(body, BG, (o) => { draft.bg = o.k; A.user(o.t); ask(3); }), { who: '选一个最接近的' });
      } else if (step === 3) {
        A.say('最后一个小诊断：下面哪些说法你<b>有把握讲清楚</b>？（可多选，都没有也没关系）', { who: '助手 · 3 / 3 · 小诊断' });
        A.card((body) => {
          const sel = new Set();
          KNOWN.forEach((o) => {
            const b = SA.h(`<button type="button" class="opt" aria-pressed="false"><span class="box">□</span>${o.t}</button>`);
            b.addEventListener('click', () => { sel.has(o.k) ? sel.delete(o.k) : sel.add(o.k); const on = sel.has(o.k); b.classList.toggle('sel', on); b.setAttribute('aria-pressed', on); SA.$('.box', b).textContent = on ? '■' : '□'; });
            body.appendChild(b);
          });
          const ok = SA.h(`<button type="button" class="btn sm primary" style="align-self:flex-start;margin-top:4px">确定</button>`);
          ok.addEventListener('click', () => {
            SA.$$('button', body).forEach((x) => (x.disabled = true));
            draft.known = Array.from(sel);
            A.user(sel.size ? KNOWN.filter((o) => sel.has(o.k)).map((o) => o.t).join('；') : '都没把握');
            ask(4);
          });
          body.appendChild(ok);
        }, { who: '可多选' });
      } else if (step === 4) {
        A.say('每天大概能拿出多少时间？', { who: '助手 · 节奏' });
        A.card((body) => single(body, PACE.map((m) => ({ k: m, t: `每天 ${m} 分钟` })), (o) => { draft.pace = o.k; A.user(o.t); finish(); }), { who: '选一个' });
      }
    }
    function single(body, opts, cb) {
      opts.forEach((o) => {
        const b = SA.h(`<button type="button" class="opt">${o.t}</button>`);
        b.addEventListener('click', () => { SA.$$('.opt', body).forEach((x) => { x.disabled = true; }); b.classList.add('sel'); cb(o); });
        body.appendChild(b);
      });
    }
    function finish() {
      const before = plan;
      plan = SA.computePlan(draft);
      st().plan = plan; save();
      SA.renderHeader('plan');
      const changed = C.chapters.filter((ch) => ch.sections.some((s) => plan.skip.includes(s.id) || plan.plus.some((k) => C.supplements[k].sec === s.id))).map((c) => c.id);
      renderLeft(changed);
      const lines = plan.reasons.map(([k, t]) => `<span><b style="color:${k === '加强' ? 'var(--d-amber)' : 'var(--d-ink)'}">${k}</b> ${t}</span>`).join('');
      A.say(`<div style="display:flex;flex-direction:column;gap:8px"><span>明白了。左边是我为你排的路线${plan.reasons.length ? `，${plan.reasons.length} 处调整：` : '：标准路线就很适合你。'}</span>${lines}<span style="color:var(--d-muted)">每一章最后都有掌握检测，没过我会换种方式再讲，不会让你带着疑问往下走。</span></div>`, {
        who: before ? '助手 · 已更新方案' : '助手',
        after: (n) => addBtns(n, [['按这个方案开始学习', () => { location.hash = P.frontier(); }], ['重新诊断', () => restart()]])
      });
    }
    function restart() { draft = { known: [] }; A.say('好，我们重新来一遍。'); ask(1); }

    const fresh = A.context({
      key: 'plan', subtitle: '开课诊断 · 3 个问题', placeholder: '比如：“我每天只有 15 分钟”',
      onSend(t) {
        const m = t.match(/(\d+)\s*分钟/);
        if (m && plan) { draft = Object.assign({}, plan); draft.pace = SA.clamp(+m[1], 5, 120); finish(); return; }
        if (/提示词|prompt/i.test(t) && /会|懂|熟/.test(t) && plan) { draft = Object.assign({}, plan); draft.known = Array.from(new Set((plan.known || []).concat('prompt'))); finish(); return; }
        if (/零基础|不会编程|没学过/.test(t) && plan) { draft = Object.assign({}, plan); draft.bg = 'none'; finish(); return; }
        if (/重新|重来/.test(t)) return restart();
        A.say(plan ? '收到。我能根据<b>每天的时间</b>、<b>编程基础</b>和<b>已经掌握的内容</b>调整路线。你可以直接说“每天 15 分钟”或“我零基础”。' : '先回答上面的问题吧，3 个问题就好，我会根据你的回答来排路线。');
      }
    });
    if (fresh) {
      if (plan) {
        A.say('这是你之前定好的学习方案。想调整的话，直接告诉我，比如“<b>我每天只有 15 分钟</b>”。', { after: (n) => addBtns(n, [['继续学习', () => { location.hash = P.frontier(); }], ['重新诊断', () => restart()]]) });
      } else {
        A.say('你好，我是这门课的学习助手。在开始之前，我想先了解你，好把这 6 个多小时用在你真正需要的地方。');
        ask(1);
      }
    }
    renderLeft();
  };

  /* =========================================================
     学习页
     ========================================================= */
  const DISCUSS_REPLY = {
    '1.1': '我记下了。你希望机器帮你“判断”，而不只是“执行”——这正是 AI 和普通程序的分界。往后你会看到，机器做判断有三种不同的思路。',
    '1.2': '很好的观点，已经记进学习档案。补充一个角度：哲学家塞尔的“中文屋”认为，照规则回话的人并不懂中文——<b>表现得像 ≠ 真的理解</b>。但也有人反驳：我们判断别人是否理解，不也只能看表现吗？你更认同哪一边？',
    '5.1': '记下了。一个常见的看法：今天的大模型在<b>广度</b>上已经很像通才，但在<b>可靠性</b>（会幻觉）、<b>长期规划</b>和<b>在真实世界中行动</b>上还差得远。学完 5.5 再回来看看自己的答案。',
    '5.5': '好想法，已经记进学习档案！这门课的团队项目正是“用 AI 工具开发一个能解决生活或科研中小问题的应用”——你现在就有了第一个选题。'
  };
  const saidOnce = {};

  function insertBlock(id, data, opts) {
    opts = opts || {};
    const el = SA.h(`<section class="block insert" id="ins-${id}"></section>`);
    el.innerHTML = `
      <div class="w-row" style="gap:10px"><span class="ins-tag">${ic.spark(12)} ${opts.tag || '学习助手为你补充'}</span><span class="ins-why">${opts.why || ''}</span></div>
      <h3>${data.title.replace(/^为你加强：/, '')}</h3>
      ${data.cards ? `<div class="ins-grid">${data.cards.map(([h, p]) => `<div class="ins-card"><b>${h}</b>${p}</div>`).join('')}</div>` : ''}
      ${data.code ? `<div class="code-pane" style="min-height:0">${SA.esc(data.code)}</div><span class="w-note">${data.note || ''}</span>` : ''}
      <div class="ins-actions"></div>`;
    const act = SA.$('.ins-actions', el);
    if (data.more) {
      const b = SA.h(`<button type="button" class="btn sm amber">${data.more}</button>`);
      b.addEventListener('click', () => { if (A.isDrawer()) A.open(); A.user(data.more); A.say('你发现了关键：咖啡好不好喝，喝的人说了算；可“智能”是不是只看表现？哲学家塞尔的“中文屋”就在反驳这一点。你先想想，一个只会照规则回话的人，算不算懂中文？'); });
      act.appendChild(b);
    }
    if (opts.removable) {
      const b = SA.h(`<button type="button" class="btn sm ghost" style="color:var(--insert-ink)">收起补充</button>`);
      b.addEventListener('click', () => { el.remove(); opts.onRemove && opts.onRemove(); });
      act.appendChild(b);
    }
    if (!act.children.length) act.remove();
    return el;
  }

  /* 组件和视频片段用来跟助手说话的上下文 */
  function blockCtx(b, s) {
    return {
      id: b.id, sec: s.id,
      say(html, once) {
        const k = s.id + ':' + (once || html.slice(0, 40));
        if (saidOnce[k]) return; saidOnce[k] = true;
        A.say(html);
      }
    };
  }
  const mmss = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;

  function renderBlock(b, s, idx) {
    const id = 'blk-' + (b.id || idx);
    if (b.t === 'text') return { el: SA.h(`<section class="block" id="${id}">${b.html}</section>`) };
    if (b.t === 'figure') return { el: SA.h(`<figure class="block fig ${b.dark ? 'dark' : ''}" id="${id}"><div class="fig-img"><img src="${b.src}" alt="${b.alt}" loading="lazy">${(b.labels || []).map(([x, t]) => `<span style="left:${x}%">${t}</span>`).join('')}</div><figcaption>${b.caption}</figcaption></figure>`) };
    if (b.t === 'events') return { el: SA.h(`<section class="block" id="${id}"><h3 class="blk-h">${b.title}</h3><ol class="events">${b.items.map(([y, h, p]) => `<li><span class="y">${y}</span><div><b>${h}</b><p>${p}</p></div></li>`).join('')}</ol></section>`) };
    if (b.t === 'stages') return { el: SA.h(`<section class="block" id="${id}"><div class="stages">${b.items.map((x) => x.a ? `<div class="arr"><span>${x.a}</span>${ic.arrow(16)}</div>` : `<div class="node"><b>${x.n}</b><span class="s">${x.s}</span><p>${x.d}</p></div>`).join('')}</div></section>`) };
    if (b.t === 'video') {
      const clip = SA.clips[b.clip];
      const el = SA.h(`<section class="block" id="${id}">
        <div class="block-head"><div class="block-title"><span class="badge-k">视频</span><h2>${b.title}</h2></div><span class="block-lead">${Math.round(clip.dur)} 秒 · 有字幕</span></div>
        <div class="vid"><iframe src="assets/video/${clip.page}?render&clip=${b.clip}" title="${b.title}" loading="lazy" allow="autoplay; fullscreen"></iframe></div>
        <details class="vid-script"><summary>文字稿（不方便听声音时，直接读也行）</summary><ol>${clip.lines.map((l, i) => `<li data-i="${i}"><button type="button" data-t="${l.start}" aria-label="从这一句开始播放">${mmss(l.start)}</button><span>${l.text}</span></li>`).join('')}</ol></details>
      </section>`);
      return {
        el,
        mount: () => {
          const frame = SA.$('iframe', el), ctx = blockCtx(b, s);
          const onMsg = (e) => {
            const m = e.data || {};
            if (e.source !== frame.contentWindow || m.sa !== 'video') return;
            if (m.ev === 'play') SA.$$('.vid iframe').forEach((f) => f !== frame && f.contentWindow.postMessage({ cmd: 'pause' }, '*'));
            if (m.ev === 'line') SA.$$('.vid-script li', el).forEach((li) => li.classList.toggle('on', +li.dataset.i === m.line));
            if (m.ev === 'ended') { if (b.after) ctx.say(b.after, 'ended:' + b.clip); SA.bus.emit('video-ended', { sec: s.id, clip: b.clip }); }
          };
          addEventListener('message', onMsg);
          addCleanup(() => removeEventListener('message', onMsg));
          SA.$$('.vid-script button', el).forEach((x) => x.addEventListener('click', () => frame.contentWindow.postMessage({ cmd: 'seek', t: +x.dataset.t, play: true }, '*')));
        }
      };
    }
    if (b.t === 'key') return { el: SA.h(`<section class="block key" id="${id}"><span class="key-mark">${ic.bulb(22)}</span><div class="key-body"><span class="k-label">${b.label}</span><h3>${b.title}</h3>${b.html}</div></section>`) };
    if (b.t === 'cards') return { el: SA.h(`<section class="block" id="${id}" style="padding:20px"><div class="cards-grid">${b.items.map((c) => `<div class="mini-card ${c.cls || ''}"><span class="ic">${ic[c.ic](18)}</span><h4>${c.h}</h4><p>${c.p}</p></div>`).join('')}</div></section>`) };
    if (b.t === 'discuss') {
      const el = SA.h(`<section class="block discuss" id="${id}"><div class="discuss-row"><div style="display:flex;flex-direction:column;gap:6px;flex:1 1 320px"><span class="lbl">讨论 · 没有标准答案</span><div class="q">${b.q}</div><div class="sub">${b.sub}</div></div></div><label class="sr-only" for="d-${id}">你的观点</label><textarea id="d-${id}" placeholder="写下你的想法……"></textarea><div class="w-row"><button type="button" class="btn">和助手讨论</button><span class="saved" hidden>${ic.check(12)} 已记入学习档案</span></div></section>`);
      const prev = st().notes.find((n) => n.sec === s.id && n.q === b.q);
      const ta = SA.$('textarea', el);
      if (prev) { ta.value = prev.a; SA.$('.saved', el).hidden = false; }
      SA.$('.btn', el).addEventListener('click', () => {
        const a = ta.value.trim();
        if (A.isDrawer()) A.open();
        if (!a) { A.user(b.q); A.say('我先不给答案。说说你的想法，哪怕只有一句——写在左边的框里，再点“和助手讨论”。'); return; }
        const notes = st().notes.filter((n) => !(n.sec === s.id && n.q === b.q));
        notes.push({ sec: s.id, q: b.q, a, at: Date.now() });
        st().notes = notes; save();
        SA.$('.saved', el).hidden = false;
        A.user(a);
        A.say(DISCUSS_REPLY[s.id] || '已记进学习档案。');
      });
      return { el };
    }
    if (b.t === 'widget') {
      const el = SA.h(`<section class="block" id="${id}"><div class="block-head"><div class="block-title"><span class="badge-k">${b.badge}</span><h2>${b.title}</h2></div><span class="block-lead">${b.lead || ''}</span></div><div class="block-body"></div></section>`);
      return {
        el,
        mount: () => {
          const fn = SA.widgets[b.w];
          if (!fn) return;
          addCleanup(fn(SA.$('.block-body', el), blockCtx(b, s)));
        }
      };
    }
    return { el: document.createElement('div') };
  }

  SA.pages.learn = function (root, id) {
    const s = C.sec(id) || C.sections[0];
    const ch = C.chapter(s.ch);
    st().current = s.id; save();
    SA.renderHeader('learn');

    if (!P.unlocked(s.id) && !SA.peek) {
      root.innerHTML = `<div class="plan-page"><div class="plan-empty">${ic.lock(28)}<h2 style="color:var(--ink)">${s.id} ${s.title} 还没有解锁</h2><p>学习助手会用随堂检测确认你掌握了前面的内容，再带你往下走。</p><div class="w-row" style="justify-content:center"><a class="btn primary" href="${P.frontier()}">回到当前进度</a><button type="button" class="btn peek">先预览一下</button></div></div></div>`;
      SA.$('.peek', root).addEventListener('click', () => { SA.peek = true; SA.pages.learn(root, id); SA.peek = false; });
      A.context({ key: 'locked', subtitle: '学习助手', panel: '' });
      A.say('这一节还锁着。不过如果你只是想先看看，可以点“先预览一下”。');
      return;
    }

    root.innerHTML = `
      <div class="learn">
        <nav class="rail" aria-label="课程目录"></nav>
        <article class="article" id="top"></article>
      </div>`;
    const rail = SA.$('.rail', root), art = SA.$('.article', root);

    function renderRail() {
      const secIcon = (x) => {
        if (P.passed(x.id)) return `<span class="ic" style="color:var(--green)">${ic.check(14)}</span>`;
        if (x.id === s.id) return `<span class="ic"><span class="dot-acc"></span></span>`;
        if (!P.unlocked(x.id)) return `<span class="ic" style="color:var(--faint)">${ic.lock(13)}</span>`;
        return `<span class="ic"><span class="dot-hol"></span></span>`;
      };
      rail.innerHTML = `
        <button type="button" class="rail-toggle" aria-expanded="false">${ic.menu(16)} <span style="flex:1;text-align:left;margin-left:8px">课程目录 · ${s.id} ${s.title}</span>${ic.chevron(16)}</button>
        <div class="rail-body">
          <div class="rail-label">COURSE MAP</div>
          ${C.chapters.map((c) => {
            const open = c.id === s.ch;
            const done = P.chPassed(c.id);
            return `<div class="rail-ch ${open ? 'open' : ''}" data-ch="${c.id}">
              <button type="button" class="rail-ch-head" aria-expanded="${open}"><span class="no">${c.no}</span><span class="nm">${c.name}</span>${done ? `<span style="color:var(--green)">${ic.check(14)}</span>` : !P.unlocked(c.sections[0].id) ? `<span style="color:var(--faint)">${ic.lock(13)}</span>` : ''}</button>
              <div class="rail-secs">
                ${c.sections.map((x) => {
                  const plus = P.plusFor(x.id).length, skip = P.isSkip(x.id);
                  return `<a class="rail-sec ${x.id === s.id ? 'cur' : ''} ${!P.unlocked(x.id) ? 'locked' : ''}" href="#/learn/${x.id}" ${x.id === s.id ? 'aria-current="page"' : ''}>${secIcon(x)}<span>${x.id} ${x.title}</span>${plus ? '<span class="tagp">加强</span>' : skip && !P.passed(x.id) ? '<span class="tagk">快速</span>' : ''}</a>`;
                }).join('')}
                <a class="rail-sec ${!P.checkUnlocked(c.id) ? 'locked' : ''}" href="#/check/${c.id}">${P.chPassed(c.id) ? `<span class="ic" style="color:var(--green)">${ic.check(14)}</span>` : P.checkUnlocked(c.id) ? '<span class="ic"><span class="dot-hol"></span></span>' : `<span class="ic" style="color:var(--faint)">${ic.lock(13)}</span>`}<span>掌握检测 · ${c.check.type === 'order' ? '排序' : '分类'}</span></a>
              </div>
            </div>`;
          }).join('')}
          <div class="rail-note">课程内容由课程团队编写，学习助手会按你的情况<b>插入补充讲解</b>，并用小测确认掌握后才解锁下一节。</div>
        </div>`;
      SA.$$('.rail-ch-head', rail).forEach((b) => b.addEventListener('click', () => {
        const box = b.parentElement, open = !box.classList.contains('open');
        box.classList.toggle('open', open); b.setAttribute('aria-expanded', open);
      }));
      const tg = SA.$('.rail-toggle', rail);
      tg.addEventListener('click', () => { const o = !rail.classList.contains('open'); rail.classList.toggle('open', o); tg.setAttribute('aria-expanded', o); });
    }

    function footerHtml() {
      const prev = C.prevOf(s.id), next = C.nextOf(s.id);
      const lastOfCh = !next || next.ch !== s.ch;
      const nextHref = lastOfCh ? '#/check/' + s.ch : '#/learn/' + next.id;
      const nextLabel = lastOfCh ? `第 ${s.ch} 章掌握检测` : `${next.id} ${next.title}`;
      return `
        ${prev ? `<a class="prev" href="#/learn/${prev.id}">← ${prev.id} ${prev.title}</a>` : '<span></span>'}
        <div class="next-wrap">
          ${P.passed(s.id) || st().unlockAll
            ? `<a class="btn primary" href="${nextHref}">${nextLabel} ${ic.arrow(16)}</a>`
            : `<span class="hint">答对随堂检测即可解锁</span><button type="button" class="btn dark do-quiz">做随堂检测</button><span class="btn locked" aria-disabled="true">${ic.lock(14)} ${nextLabel}</span>`}
        </div>`;
    }
    function renderFooter() {
      const f = SA.$('.art-foot', art);
      f.innerHTML = footerHtml();
      const q = SA.$('.do-quiz', f);
      if (q) q.addEventListener('click', () => { if (A.isDrawer()) A.open(); askQuiz(); });
    }

    /* 正文 */
    const plusKeys = P.plusFor(s.id);
    const skip = P.isSkip(s.id);
    art.innerHTML = `
      <div class="art-head">
        <div class="crumb">第 ${s.ch} 章 · ${ch.name} / ${s.id}</div>
        <h1>${s.h1}</h1>
        <div class="metas">${s.level ? `<span class="pill ${{ 难点: 'amber', 中等: 'accent' }[s.level] || 'green'}">${s.level}</span>` : ''}<span class="pill">约 ${s.minutes} 分钟</span><span class="pill">${s.kps.length} 个知识点</span><span class="pill">${s.tags}</span>${P.passed(s.id) ? `<span class="pill green">${ic.check(12)} 已掌握</span>` : ''}</div>
      </div>
      <div class="goal-strip"><b>学完你能：</b>${s.goals.map((g, i) => `<span>${i + 1}. ${g}</span>`).join('')}</div>
      ${skip && !P.passed(s.id) ? `<div class="banner skip">${ic.spark(14)}<span>开课诊断时你说已经掌握了这部分。可以直接在右侧做 1 道题<b>快速通过</b>，也可以照常学习。</span></div>` : ''}
      <div class="blocks" style="display:flex;flex-direction:column;gap:20px"></div>
      <div class="art-foot"></div>`;
    const blocksHost = SA.$('.blocks', art);
    const mounts = [];
    s.blocks.forEach((b, i) => {
      const r = renderBlock(b, s, i);
      blocksHost.appendChild(r.el);
      if (r.mount) mounts.push(r.mount);
      if (i === 0) plusKeys.forEach((k) => {
        const sup = C.supplements[k];
        blocksHost.appendChild(insertBlock(k, sup, { tag: '为你加强 · ' + sup.label, why: '根据你的开课诊断加入' }));
      });
    });
    // 之前插入过的补充块
    (st().inserts[s.id] || []).forEach((k) => placeInsert(k, false));
    mounts.forEach((m) => m());
    renderRail();
    renderFooter();
    SA.observeReveal(art);

    function anchorAfter() {
      const firstWidget = s.blocks.findIndex((b) => b.t === 'widget');
      const b = s.blocks[firstWidget >= 0 ? firstWidget : 0];
      return SA.$('#blk-' + (b.id || (firstWidget >= 0 ? firstWidget : 0)), art);
    }
    function placeInsert(k, animate) {
      if (SA.$('#ins-' + k, art)) return SA.$('#ins-' + k, art);
      const data = C.inserts[k];
      if (!data) return null;
      const el = insertBlock(k, data, {
        why: '因为你想换个角度理解', removable: true,
        onRemove: () => { st().inserts[s.id] = (st().inserts[s.id] || []).filter((x) => x !== k); save(); }
      });
      if (animate) el.classList.add('new');
      const after = anchorAfter();
      after ? after.after(el) : blocksHost.appendChild(el);
      return el;
    }
    function doInsert(k) {
      const list = st().inserts[s.id] = st().inserts[s.id] || [];
      if (!list.includes(k)) { list.push(k); save(); }
      const el = placeInsert(k, true);
      return el;
    }

    /* 助手 */
    function goalsPanel() {
      const passed = P.passed(s.id);
      const items = s.goals.map((g, i) => ({ t: g, done: passed, now: !passed && i === 0 })).concat([{ t: '通过随堂检测', done: passed, now: false }]);
      const n = items.filter((x) => x.done).length;
      return `<div class="as-panel">
        <div class="as-panel-head"><b>本节学习目标</b><span class="mono">${n} / ${items.length}</span></div>
        <div class="dbar"><i style="width:${(n / items.length) * 100}%"></i></div>
        ${items.map((x) => `<div class="goal ${x.done ? 'done' : x.now ? 'now' : ''}"><span class="goal-ic">${x.done ? `<span style="color:var(--d-green)">${ic.check(14)}</span>` : x.now ? '<span class="dot fill"></span>' : '<span class="dot hollow"></span>'}</span><span class="goal-t">${x.t}</span>${x.now ? '<span class="tag">进行中</span>' : ''}</div>`).join('')}
      </div>`;
    }
    let quizPending = false;
    const quizInThread = () => (A.threads['sec:' + s.id] || []).some((m) => m.tag === 'quiz');
    function askQuiz() {
      const has = quizInThread();
      if (P.passed(s.id) && !has) { A.say('这一节的检测你已经通过了。想再巩固一下的话，可以试试左边的互动，或者问我任何问题。'); return; }
      if (has || quizPending) { A.say(P.passed(s.id) ? '这一节的检测你已经通过了。' : '检测题就在上面，选一个答案吧。'); return; }
      quizPending = true;
      A.quiz(s.quiz, {
        who: `助手 · 随堂检测 · ${s.id}`,
        onRight(first, el) {
          const already = P.passed(s.id);
          st().passed[s.id] = { first, at: Date.now() };
          P.master(s.kps, first ? 0.9 : 0.75);
          save();
          SA.confetti(el);
          A.setPanel(goalsPanel());
          renderRail(); renderFooter(); SA.renderHeader('learn');
          const next = C.nextOf(s.id), lastOfCh = !next || next.ch !== s.ch;
          const href = lastOfCh ? '#/check/' + s.ch : '#/learn/' + next.id;
          A.say(`${first ? '一次就答对了！' : '答对了，而且是你自己想出来的。'}${already ? '' : lastOfCh ? `第 ${s.ch} 章的内容都学完了，<b>掌握检测</b>已解锁——通过它就能进入下一章。` : `<b>${next.id} ${next.title}</b> 已解锁。`}`, {
            links: [{ label: lastOfCh ? `去做第 ${s.ch} 章掌握检测` : `进入 ${next.id}`, go: () => { location.hash = href; } }]
          });
        },
        onWrong(tries) { if (tries === 2) A.say(`没关系，这正是检测的意义。要不要我<b>换个讲法</b>再讲一遍？`, { links: [{ label: '换个讲法', blue: true, go: () => { A.user('换个讲法'); rephrase(); } }] }); }
      }).then(() => { quizPending = false; });
    }
    function rephrase() {
      const r = s.agent.rephrase;
      const el = doInsert(r.insert);
      A.say(r.text, { links: [{ label: '已插入课程 · ' + C.inserts[r.insert].title, go: () => SA.flashTo(SA.$('#ins-' + r.insert, art)) }] });
      if (el && !A.isDrawer()) setTimeout(() => SA.flashTo(el), 400);
    }
    function respond(text, fromSelection) {
      const t = text.toLowerCase();
      if (!fromSelection) {
        if (/懂了|继续|下一|会了/.test(t)) return onChip('我懂了，继续');
        if (/考|测验|测试|出题|检测/.test(t)) return askQuiz();
        if (/没懂|不懂|太难|看不懂|换个|再讲/.test(t)) return rephrase();
        if (/例子|举例|比如/.test(t)) return A.say(s.agent.example);
      }
      const qa = (s.agent.qa || []).find((q) => q.k.some((k) => t.includes(k.toLowerCase())));
      if (qa) {
        const links = [];
        if (qa.insert) { doInsert(qa.insert); links.push({ label: '已插入课程 · ' + C.inserts[qa.insert].title, go: () => SA.flashTo(SA.$('#ins-' + qa.insert, art)) }); }
        if (qa.locate) links.push({ label: '已定位 · 课程中的相关内容', blue: true, go: () => SA.flashTo(SA.$('#blk-' + qa.locate, art)) });
        return A.say(qa.a, { links });
      }
      const g = C.glossary.find((x) => x.k.some((k) => t.includes(k.toLowerCase())));
      if (g) return A.say(g.a);
      if (fromSelection) return A.say(`“${SA.esc(text)}”出现在“${s.title}”这一节。用一句话说：它是理解本节核心问题的一个线索。如果还不清楚，点下面的“换个讲法”，我会在课程里插入一段更直观的讲解。<br><span style="color:var(--d-muted);font-size:12px">（原型演示：接入真实大模型后，这里会结合上下文给出针对性解释。）</span>`, { links: [{ label: '换个讲法', blue: true, go: () => { A.user('换个讲法'); rephrase(); } }] });
      A.say(`好问题。我结合正在学的“${s.title}”来回答：${s.blocks.find((b) => b.t === 'key') ? '这一节最关键的一点是<b>' + s.blocks.find((b) => b.t === 'key').title + '</b>。' : ''}你的问题我先记下了。<br><span style="color:var(--d-muted);font-size:12px">（原型演示：此处接入真实模型，回答会引用左侧课程内容，必要时直接在课程里插入讲解块。）</span>`);
    }
    function onChip(c) {
      if (c === '换个讲法') return rephrase();
      if (c === '举个例子') return A.say(s.agent.example);
      if (c === '考考我') return askQuiz();
      if (c === '我懂了，继续') {
        if (P.passed(s.id)) {
          const next = C.nextOf(s.id), lastOfCh = !next || next.ch !== s.ch;
          return A.say('好，我们继续。', { links: [{ label: lastOfCh ? `去做第 ${s.ch} 章掌握检测` : `进入 ${next.id} ${next.title}`, go: () => { location.hash = lastOfCh ? '#/check/' + s.ch : '#/learn/' + next.id; } }] });
        }
        A.say('好！还差 1 道随堂检测，答对就解锁下一节。');
        return askQuiz();
      }
    }

    const fresh = A.context({
      key: 'sec:' + s.id, subtitle: `正在陪你学 · ${s.id} ${s.title}`,
      panel: goalsPanel(), chips: ['换个讲法', '举个例子', '考考我', '我懂了，继续'],
      onChip, onSend: (t) => respond(t)
    });
    if (fresh) {
      const prev = C.prevOf(s.id);
      let hello = '';
      if (prev && P.passed(prev.id) && !P.passed(s.id)) hello = `欢迎回来，上一节的检测你${st().passed[prev.id].first ? '一次就答对了' : '也通过了'}。`;
      if (P.passed(s.id)) {
        A.say('这一节你已经掌握了，随时可以回来复习。左边的互动都还能玩，有问题直接问我。');
      } else if (skip) {
        A.say(`开课诊断时你说已经理解了这部分内容。我们直接做 1 道题确认一下，答对就<b>快速通过</b>。`);
        askQuiz();
      } else {
        A.say(hello + s.agent.greet);
        if (plusKeys.length) {
          const sup = C.supplements[plusKeys[0]];
          A.say(`另外，根据你的开课诊断，我在课程里加了一段<b>“${sup.title.replace('为你加强：', '')}”</b>。`, { links: [{ label: '查看 · 为你加强', go: () => SA.flashTo(SA.$('#ins-' + plusKeys[0], art)) }] });
        }
      }
    }
    // 读到最后一个内容块时，主动出随堂检测；有视频的小节，要等视频都看完（页面短时最后一块一打开就在眼前）
    const lastBlock = blocksHost.lastElementChild;
    if (lastBlock && 'IntersectionObserver' in window && !P.passed(s.id)) {
      const unwatched = new Set(s.blocks.filter((b) => b.t === 'video').map((b) => b.clip));
      let atEnd = false;
      const maybeQuiz = () => {
        if (!atEnd || unwatched.size || quizInThread() || quizPending) return;
        io.disconnect(); A.say('读到这里，差不多可以检验一下了。'); askQuiz();
      };
      const io = new IntersectionObserver((es) => es.forEach((e) => { atEnd = e.isIntersecting; maybeQuiz(); }), { threshold: 0.4 });
      io.observe(lastBlock);
      addCleanup(() => io.disconnect());
      addCleanup(SA.bus.on('video-ended', (e) => { if (e.sec === s.id) { unwatched.delete(e.clip); maybeQuiz(); } }));
    }
    addCleanup(SA.bus.on('ask-selection', (t) => respond(t, true)));
  };

  /* =========================================================
     掌握检测
     ========================================================= */
  const EXPLAIN = {
    chess: { title: '用同一件事——“下棋”——对比两派', cards: [
      { h: '规则 + 搜索（深蓝 · 1997）', chain: ['专家写下评估规则', '每秒评估上亿个局面', '选分数最高的'], foot: '知识是人写进去的', g: false },
      { h: '从数据里学（AlphaGo · 2016）', chain: ['看海量对局', '神经网络调整权重', '“感觉”哪步好'], foot: '知识是学出来的', g: true }
    ] },
    bmi: { title: '同一个人，两种问法', cards: [
      { h: '分类：“他肥胖吗？”', chain: ['身高 1.65 m、体重 100 kg', '模型', '肥胖 / 正常'], foot: '输出是一个类别', g: false },
      { h: '回归：“他的 BMI 是多少？”', chain: ['身高 1.65 m、体重 100 kg', '模型', '36.7'], foot: '输出是一个数值', g: true }
    ] },
    'xor-year': { title: '把三件事排一排', cards: [
      { h: '起步', chain: ['1956 达特茅斯', '1957 感知机', '1969 XOR 问题'], foot: 'XOR 问题是起步期的终点', g: false },
      { h: '随后', chain: ['1970s 第一次低谷', '1986 反向传播', '2012 爆发'], foot: '低谷是 XOR 问题“导致”的结果', g: true }
    ] }
  };
  const BUCKET_SEC = { 2: ['2.1', '2.3', '2.2'], 3: ['3.2', '3.2', '3.2'], 4: ['1.3', '4.2', '4.3'], 5: ['5.1', '5.3', '5.3'] };

  SA.pages.check = function (root, chId) {
    const ch = C.chapter(chId) || C.chapters[0], ck = ch.check;
    SA.renderHeader('learn');
    if (!P.checkUnlocked(ch.id) && !SA.peek) {
      root.innerHTML = `<div class="plan-page"><div class="plan-empty">${ic.lock(28)}<h2 style="color:var(--ink)">第 ${ch.id} 章掌握检测还没有解锁</h2><p>先学完本章所有小节吧。</p><div class="w-row" style="justify-content:center"><a class="btn primary" href="${P.frontier()}">回到当前进度</a><button type="button" class="btn peek">先预览一下</button></div></div></div>`;
      SA.$('.peek', root).addEventListener('click', () => { SA.peek = true; SA.pages.check(root, chId); SA.peek = false; });
      A.context({ key: 'locked', subtitle: '学习助手', panel: '' });
      A.say('掌握检测要等本章小节都学完才开放。');
      return;
    }
    const rec = st().checks[ch.id] = st().checks[ch.id] || { passed: false, tries: 0 };
    const passed = rec.passed;
    root.innerHTML = `
      <div class="check-page">
        <div style="display:flex;flex-direction:column;gap:6px">
          <div class="w-row" style="gap:10px"><span class="badge-k">检测</span><span class="muted" style="font-size:13px">第 ${ch.id} 章 · ${ch.name} · ${ck.lead}</span></div>
          <h1 style="font-size:30px">${ck.title}</h1>
        </div>
        <div class="score-bar" hidden></div>
        <div class="ck-body"></div>
        <div class="w-row ck-actions"><button type="button" class="btn primary ck-submit">提交检查</button><button type="button" class="btn ck-reset">${ic.reset(14)} 重新开始</button><span class="w-note ck-hint"></span></div>
        <div class="ck-explain"></div>
        <div class="ck-pass"></div>
      </div>`;
    const body = SA.$('.ck-body', root), score = SA.$('.score-bar', root), hint = SA.$('.ck-hint', root);
    let wrongIdx = [], state, sel = null;

    function masteryPanel() {
      const kpsOf = Object.entries(C.kps).filter(([, v]) => v.ch === ch.id);
      return `<div class="as-panel"><b>第 ${ch.id} 章 知识点掌握</b>${kpsOf.map(([k, v]) => { const m = st().mastery[k] || 0; return `<div class="mastery-row"><span class="k">${v.n}</span><div class="dbar"><i style="width:${m * 100}%;background:${m >= 0.8 ? 'var(--d-green)' : 'var(--amber)'}"></i></div><span class="v">${Math.round(m * 100)}%</span></div>`; }).join('')}</div>`;
    }

    /* ---- 分类型 ---- */
    function initBuckets() {
      state = ck.cards.map(() => -1);
      if (passed) state = ck.cards.map((c) => c.b);
      order = SA.shuffle(ck.cards.map((_, i) => i));
      renderBuckets();
    }
    let order = [];
    function cardHtml(i) {
      const c = ck.cards[i], bad = wrongIdx.includes(i), ok = score.dataset.done && state[i] === c.b && !bad;
      return `<button type="button" class="dcard ${bad ? 'bad' : ''} ${ok ? 'ok' : ''} ${sel === i ? 'sel' : ''}" data-i="${i}">${bad ? '<span aria-hidden="true" style="width:16px;height:16px;border-radius:8px;background:var(--orange);color:#fff;font-size:11px;display:flex;align-items:center;justify-content:center;flex:0 0 16px">?</span>' : ok ? `<span style="color:var(--green)">${ic.check(14)}</span>` : `<span class="grip">${ic.grip(14)}</span>`}<span>${c.t}</span>${bad ? '<span class="st">再想想</span>' : ''}</button>`;
    }
    function renderBuckets() {
      const pool = order.filter((i) => state[i] === -1);
      body.innerHTML = `
        <div class="pool" data-b="-1" aria-label="待分类的卡片">${pool.length ? pool.map(cardHtml).join('') : '<span class="pool-empty">卡片都放好了。检查一下，然后点“提交检查”。</span>'}</div>
        <div class="buckets" style="margin-top:16px">${ck.buckets.map((b, bi) => `
          <section class="bucket ${sel !== null ? 'target' : ''}" data-b="${bi}" tabindex="${sel !== null ? 0 : -1}" aria-label="${b.name}">
            <div class="bucket-head"><h2>${b.name}</h2><span>${b.idea}</span></div>
            <div class="bucket-cards">${order.filter((i) => state[i] === bi).map(cardHtml).join('')}</div>
          </section>`).join('')}</div>`;
      bindDnD();
      hint.textContent = sel !== null ? '已选中一张卡片：点击要放入的区域' : '拖动卡片，或先点卡片再点区域';
    }
    function placeCard(i, b) {
      state[i] = b;
      wrongIdx = wrongIdx.filter((x) => x !== i);
      sel = null;
      renderBuckets();
    }
    function bindDnD() {
      SA.$$('.dcard', body).forEach((card) => {
        const i = +card.dataset.i;
        card.addEventListener('pointerdown', (e) => {
          if (e.button !== 0) return;
          const sx = e.clientX, sy = e.clientY;
          let ghost = null, over = null;
          const move = (ev) => {
            if (!ghost && Math.hypot(ev.clientX - sx, ev.clientY - sy) > 6) {
              ghost = card.cloneNode(true); ghost.classList.add('ghost'); ghost.classList.remove('sel');
              ghost.style.width = card.offsetWidth + 'px';
              document.body.appendChild(ghost); card.classList.add('placeholder');
            }
            if (!ghost) return;
            ghost.style.left = ev.clientX - card.offsetWidth / 2 + 'px';
            ghost.style.top = ev.clientY - 20 + 'px';
            const el = document.elementFromPoint(ev.clientX, ev.clientY);
            const tgt = el && el.closest('[data-b]');
            if (over !== tgt) { over && over.classList.remove('over'); over = tgt; over && over.classList.add('over'); }
          };
          const up = () => {
            document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up);
            if (ghost) {
              ghost.remove(); card.classList.remove('placeholder');
              over && over.classList.remove('over');
              if (over) placeCard(i, +over.dataset.b);
            } else {
              sel = sel === i ? null : i; renderBuckets();
              const again = SA.$(`.dcard[data-i="${i}"]`, body); again && again.focus();
            }
          };
          document.addEventListener('pointermove', move); document.addEventListener('pointerup', up);
        });
        card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); sel = sel === i ? null : i; renderBuckets(); const f = SA.$('.bucket', body); f && f.focus(); } });
      });
      SA.$$('[data-b]', body).forEach((zone) => {
        const go = (e) => { if (sel === null || e.target.closest('.dcard')) return; placeCard(sel, +zone.dataset.b); };
        zone.addEventListener('click', go);
        zone.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && sel !== null && !e.target.closest('.dcard')) { e.preventDefault(); placeCard(sel, +zone.dataset.b); } });
      });
    }

    /* ---- 排序型 ---- */
    function initOrder() {
      state = passed ? ck.items.map((_, i) => i) : SA.shuffle(ck.items.map((_, i) => i));
      if (!passed && state.every((v, i) => v === i)) state.reverse();
      renderOrder();
    }
    function renderOrder() {
      body.innerHTML = `<div class="order-list">${state.map((it, pos) => {
        const bad = wrongIdx.includes(pos), ok = score.dataset.done && !bad;
        return `<div class="order-item ${bad ? 'bad' : ok ? 'ok' : ''}" data-p="${pos}"><span class="idx">${pos + 1}</span><span class="txt">${ck.items[it].t}</span>${ok ? `<span class="yr">${ck.items[it].y}</span>` : ''}<span class="mv"><button type="button" aria-label="上移" data-d="-1" ${pos === 0 ? 'disabled' : ''}>${ic.up(16)}</button><button type="button" aria-label="下移" data-d="1" ${pos === state.length - 1 ? 'disabled' : ''}>${ic.down(16)}</button></span></div>`;
      }).join('')}</div>`;
      SA.$$('.order-item', body).forEach((row) => SA.$$('[data-d]', row).forEach((b) => b.addEventListener('click', () => {
        const p = +row.dataset.p, q = p + +b.dataset.d;
        [state[p], state[q]] = [state[q], state[p]];
        wrongIdx = []; delete score.dataset.done; score.hidden = true;
        renderOrder();
        const nb = SA.$(`.order-item[data-p="${q}"] [data-d="${b.dataset.d}"]`, body) || SA.$(`.order-item[data-p="${q}"] button`, body);
        nb && nb.focus();
      })));
      hint.textContent = '用上下按钮调整顺序';
    }

    function renderExplain(card) {
      const host = SA.$('.ck-explain', root);
      const ex = card && EXPLAIN[card.explain];
      if (!ex) { host.innerHTML = ''; return null; }
      host.innerHTML = `<section class="explain" id="ck-ex"><div class="w-row" style="gap:10px"><span class="ins-tag">${ic.spark(12)} 学习助手为你生成 · 对比图</span><span class="ins-why">${ex.title}</span></div><div class="explain-grid">${ex.cards.map((c) => `<div class="explain-card"><b>${c.h}</b><div class="chain ${c.g ? 'g' : ''}">${c.chain.map((x) => `<span class="n">${x}</span>`).join('<span aria-hidden="true">→</span>')}</div><span class="w-note">${c.foot}</span></div>`).join('')}</div></section>`;
      return SA.$('#ck-ex', host);
    }

    function submit() {
      const host = score;
      if (ck.type === 'buckets') {
        if (state.some((v) => v === -1)) { SA.toast('还有卡片没放好'); return; }
        wrongIdx = ck.cards.map((c, i) => (state[i] === c.b ? -1 : i)).filter((i) => i >= 0);
      } else {
        wrongIdx = state.map((it, pos) => (it === pos ? -1 : pos)).filter((p) => p >= 0);
      }
      rec.tries++; save();
      const total = ck.type === 'buckets' ? ck.cards.length : ck.items.length, right = total - wrongIdx.length;
      host.hidden = false; host.dataset.done = '1';
      host.innerHTML = `<span class="mono">${right} / ${total}</span><span class="msg-t">${wrongIdx.length ? (wrongIdx.length === 1 ? '只差一张。错的那张我先不告诉你答案，右边一起想想。' : `还有 ${wrongIdx.length} 处需要调整。答案我先不说，右边一起想想。`) : '全部正确！还有最后一步：换个说法再确认一次。'}</span><span class="pill ${wrongIdx.length ? 'amber' : 'green'}">${wrongIdx.length ? `未通过 · 需再确认 ${wrongIdx.length} 个概念` : '分类全对'}</span>`;
      ck.type === 'buckets' ? renderBuckets() : renderOrder();
      if (wrongIdx.length) {
        if (ck.type === 'buckets') {
          const c = ck.cards[wrongIdx[0]];
          const okN = total - wrongIdx.length;
          const ex = renderExplain(c);
          A.say(`${okN} 张都对，很好。我们只看“<b>${c.t}</b>”这一张。${c.hint || '它真正的特点是什么？再想想它属于哪一类。'}`);
          if (ex) A.say('这是很常见的混淆。我在左边画了一张对比图，看完你再把这张卡片挪一次。', { links: [{ label: '已插入 · 对比图', go: () => SA.flashTo(ex) }] });
          A.say(`接下来：你重新放对后，我会再出 1 道<b>换了说法</b>的题，确认你不是记住了答案，而是真的分得清。`, { note: true });
        } else {
          A.say(`有 ${wrongIdx.length} 个位置不对（标成了橙色）。提示：${ck.hint}`);
        }
      } else {
        SA.$('.ck-actions', root).hidden = true;
        SA.$('.ck-explain', root).innerHTML = '';
        A.say('全部正确！最后一步：我换一种说法再问一次。');
        A.quiz(ck.follow, {
          who: '助手 · 换个说法再确认',
          onRight(first, el) { pass(el); },
          onWrong() { A.say('差一点。回想刚才排好的结果，再选一次。'); }
        });
      }
    }
    function pass(el) {
      rec.passed = true;
      const kpsOf = Object.keys(C.kps).filter((k) => C.kps[k].ch === ch.id);
      P.master(kpsOf, rec.tries <= 1 ? 0.95 : 0.85);
      save();
      SA.confetti(el);
      A.setPanel(masteryPanel());
      SA.renderHeader('learn');
      const nextCh = C.chapter(ch.id + 1);
      const href = nextCh ? '#/learn/' + nextCh.sections[0].id : '#/profile';
      SA.$('.ck-pass', root).innerHTML = `<div class="pass-card"><span class="pill green">${ic.check(12)} 第 ${ch.id} 章已掌握</span><h2>${nextCh ? `解锁第 ${nextCh.id} 章：${nextCh.name}` : '恭喜你学完了整门课！'}</h2><p style="color:var(--d-muted)">${nextCh ? nextCh.meta : '你的学习档案里记录了每一个知识点的掌握情况和你的思考。'}</p><a class="btn" style="background:#fff;border-color:#fff" href="${href}">${nextCh ? '开始第 ' + nextCh.id + ' 章' : '查看学习档案'} ${ic.arrow(16)}</a></div>`;
      SA.flashTo(SA.$('.pass-card', root));
      A.say(`${nextCh ? `第 ${ch.id} 章通过！你不只是记住了答案，换了说法也分得清。第 ${nextCh.id} 章已解锁。` : '整门课全部通过！从图灵测试到 AI 智能体，你走完了 AI 的 75 年。'}`, { links: [{ label: nextCh ? `进入第 ${nextCh.id} 章` : '查看学习档案', go: () => { location.hash = href; } }] });
    }

    SA.$('.ck-submit', root).addEventListener('click', submit);
    SA.$('.ck-reset', root).addEventListener('click', () => { wrongIdx = []; sel = null; delete score.dataset.done; score.hidden = true; SA.$('.ck-explain', root).innerHTML = ''; ck.type === 'buckets' ? initBuckets() : initOrder(); });
    ck.type === 'buckets' ? initBuckets() : initOrder();

    const firstWrongSec = () => {
      if (ck.type !== 'buckets' || !wrongIdx.length) return ch.sections[0].id;
      const c = ck.cards[wrongIdx[0]];
      return (BUCKET_SEC[ch.id] || [])[c.b] || ch.sections[0].id;
    };
    const fresh = A.context({
      key: 'check:' + ch.id, subtitle: `掌握检测 · 第 ${ch.id} 章`, panel: masteryPanel(),
      chips: ['给我一点提示', '回到本章再看一遍', '我想通了'],
      onChip(c) {
        if (c === '给我一点提示') {
          if (!wrongIdx.length) return A.say(score.dataset.done ? '这一步已经全对了！' : ck.type === 'buckets' ? '先按你的理解把卡片都放好，提交之后我再针对错的地方给提示。' : ck.hint);
          if (ck.type === 'buckets') { const c2 = ck.cards[wrongIdx[0]]; return A.say(`再给一点提示：“${c2.t}”<b>不属于</b>你现在放的“${ck.buckets[state[wrongIdx[0]]].name}”。它的核心思想更接近：<b>${ck.buckets[c2.b].idea.replace(/^.*= /, '')}</b>。`); }
          const p = wrongIdx[0]; return A.say(`看第 ${p + 1} 个位置：“${ck.items[state[p]].t}”。它发生在 ${ck.items[state[p]].y} 年。`);
        }
        if (c === '回到本章再看一遍') { const sid = firstWrongSec(); return A.say(`好，建议重点看 <b>${sid} ${C.sec(sid).title}</b>。看完回来，你的进度会保留。`, { links: [{ label: `回到 ${sid}`, go: () => { location.hash = '#/learn/' + sid; } }] }); }
        if (c === '我想通了') return A.say(wrongIdx.length ? '好，把它挪到你认为对的地方，再点“提交检查”。' : '那就提交吧！');
      },
      onSend(t) {
        const g = C.glossary.find((x) => x.k.some((k) => t.toLowerCase().includes(k.toLowerCase())));
        if (g) return A.say(g.a);
        A.say('我们先专注在检测上。如果卡住了，点“给我一点提示”，我会用问题引导你，而不是直接给答案。');
      }
    });
    if (fresh) {
      if (passed) A.say(`第 ${ch.id} 章你已经通过了。可以点“重新开始”再练一次。`);
      else A.say(`第 ${ch.id} 章学完了！最后做个<b>掌握检测</b>：${ck.lead}。${ck.type === 'buckets' ? '拖动卡片（或先点卡片、再点区域），' : '用上下按钮排序，'}放好后点“提交检查”。<br><br>答错不要紧，我不会直接给答案，而是换个方式陪你想明白。`);
    }
  };

  /* =========================================================
     学习档案
     ========================================================= */
  SA.pages.profile = function (root) {
    SA.renderHeader('learn');
    const s = st();
    const passedN = Object.keys(s.passed).length, chN = Object.values(s.checks).filter((c) => c.passed).length;
    const mins = C.sections.filter((x) => s.passed[x.id]).reduce((m, x) => m + (P.isSkip(x.id) ? 3 : x.minutes), 0);
    const plan = s.plan;
    root.innerHTML = `
      <div class="profile">
        <div class="plan-top">
          <div style="display:flex;flex-direction:column;gap:6px"><div class="muted" style="font-size:13px">林同学 · ${C.title}</div><h1 style="font-size:32px">学习档案</h1></div>
          <div class="plan-stats">
            <div class="w-stat"><span class="l">已通过小节</span><span class="v">${passedN} / ${C.sections.length}</span></div>
            <div class="w-stat"><span class="l">章节检测</span><span class="v">${chN} / ${C.chapters.length}</span></div>
            <div class="w-stat"><span class="l">已掌握知识点</span><span class="v">${P.kpMastered()} / ${P.kpTotal()}</span></div>
            <div class="w-stat"><span class="l">有效学习</span><span class="v">${mins} 分钟</span></div>
          </div>
        </div>
        <section class="block" style="gap:16px"><div class="block-title"><span class="badge-k">知识地图</span><h2>每个知识点的掌握程度</h2></div>
          <div class="kmap">${C.chapters.map((ch) => `<div class="kmap-ch"><h3><span class="mono" style="color:var(--accent)">${ch.no}</span>${ch.name}${P.chPassed(ch.id) ? `<span style="color:var(--green);margin-left:auto">${ic.check(14)}</span>` : ''}</h3>${Object.entries(C.kps).filter(([, v]) => v.ch === ch.id).map(([k, v]) => { const m = s.mastery[k] || 0; return `<div class="kp"><div class="row"><span>${v.n}</span><span class="mono">${Math.round(m * 100)}%</span></div><div class="bar" style="height:5px"><i style="width:${m * 100}%;background:${m >= 0.8 ? 'var(--green)' : m > 0 ? 'var(--amber)' : 'var(--line)'}"></i></div></div>`; }).join('')}</div>`).join('')}</div>
          <div class="legend"><span><i style="background:var(--green)"></i>已掌握（≥ 80%）</span><span><i style="background:var(--amber)"></i>学习中</span><span><i style="background:var(--line)"></i>未开始</span></div>
        </section>
        <section class="block"><div class="block-title"><span class="badge-k">我的思考</span><h2>讨论题里你写下的观点</h2></div>
          <div class="notes">${s.notes.length ? s.notes.map((n) => `<div class="note-item"><span class="q">${n.sec} · ${SA.esc(n.q)}</span><span>${SA.esc(n.a)}</span></div>`).join('') : '<span class="w-note">还没有。学习页里的“讨论”区块写下的观点会出现在这里。</span>'}</div>
        </section>
        <section class="block"><div class="block-title"><span class="badge-k">学习方案</span><h2>${plan ? '你的个性化设置' : '还没有做开课诊断'}</h2></div>
          ${plan ? `<div class="w-row" style="gap:8px">${(plan.reasons.length ? plan.reasons : [['标准', '按标准路线学习']]).map(([k, t]) => `<span class="pill ${k === '加强' ? 'amber' : ''}">${k} · ${t}</span>`).join('')}<span class="pill accent">每天 ${plan.pace} 分钟</span></div>` : ''}
          <div class="w-row"><a class="btn" href="#/plan">${plan ? '查看 / 调整方案' : '去做开课诊断'}</a><a class="btn primary" href="${P.frontier()}">继续学习 ${ic.arrow(16)}</a></div>
        </section>
        <section class="block"><div class="block-title"><span class="badge-k">设置</span><h2>演示与重置</h2></div>
          <div class="w-row">
            <button type="button" class="tgl pf-unlock" aria-pressed="${!!s.unlockAll}"><span class="sw"></span>演示模式：解锁全部小节和检测</button>
            <button type="button" class="btn sm pf-reset" style="color:var(--orange-ink)">清空学习进度</button>
          </div>
          <span class="w-note">进度保存在本浏览器中。</span>
        </section>
      </div>`;
    SA.$('.pf-unlock', root).addEventListener('click', (e) => { s.unlockAll = !s.unlockAll; save(); e.currentTarget.setAttribute('aria-pressed', s.unlockAll); SA.toast(s.unlockAll ? '已解锁全部内容' : '已恢复按进度解锁'); });
    SA.$('.pf-reset', root).addEventListener('click', () => {
      if (!confirm('确定清空所有学习进度和开课方案吗？此操作无法撤销。')) return;
      SA.store.reset(); A.threads = {}; location.hash = '#/plan'; SA.toast('已清空');
    });
    const fresh = A.context({
      key: 'profile', subtitle: '学习档案', panel: '',
      chips: ['我学得怎么样？', '接下来学什么？'],
      onChip(c) { reply(c); }, onSend(t) { reply(t); }
    });
    function reply(t) {
      const weak = Object.entries(C.kps).filter(([k]) => (s.mastery[k] || 0) > 0 && (s.mastery[k] || 0) < 0.8).map(([, v]) => v.n);
      if (/接下来|下一|学什么/.test(t)) return A.say('按你的进度，下一步是这里：', { links: [{ label: '继续学习', go: () => { location.hash = P.frontier(); } }] });
      A.say(passedN ? `你已经通过了 ${passedN} 个小节、${chN} 个章节检测，掌握了 ${P.kpMastered()} 个知识点。${weak.length ? `“${weak.slice(0, 2).join('”“')}”还不太牢固，做一下章节检测能巩固它们。` : '目前学过的知识点都掌握得不错。'}` : '你还没开始呢！从 1.1 开始吧，第一节只要 12 分钟。');
    }
    if (fresh) A.say('这里记录了你的学习轨迹：每个知识点的掌握程度、你在讨论题里写下的观点，以及开课时定制的方案。');
  };
})();
