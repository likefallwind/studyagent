/* 第 1 章互动组件 */
(function () {
  const SA = window.SA, W = SA.widgets, ic = SA.ic;

  /* ---------- 三次“交接” ---------- */
  W.revolutions = function (root, ctx) {
    const stages = [
      { k: '动力问题', era: '18 世纪', who: '蒸汽机', icon: 'gear', body: '蒸汽机接过了人的<b>力气</b>：纺织机、火车、轮船。从此，搬运和生产不再受限于人和牲畜的体力。', hand: '力气' },
      { k: '信息传输与控制问题', era: '19–20 世纪', who: '电力 · 通信 · 计算机', icon: 'bolt', body: '电报、电话、计算机接过了<b>信息的传递、控制与计算</b>。消息瞬间跨越大洋，复杂的计算交给机器。', hand: '传递与计算' },
      { k: '决策问题', era: '今天', who: '人工智能', icon: 'brain', body: '人工智能开始接过<b>判断与决策</b>：看懂图片、听懂语言、给出建议、写出代码。这是最难、也最接近“智能”的一次交接。', hand: '判断与决策' }
    ];
    let cur = ctx.id === 'rev2' ? 2 : 0;
    root.innerHTML = `
      <div class="w">
        <div class="w-row" role="group" aria-label="三个阶段" style="align-items:stretch">
          ${stages.map((s, i) => `
            <button type="button" class="rev-btn" data-i="${i}" style="flex:1 1 180px;text-align:left;border-radius:12px;border:1.5px solid var(--line);background:#fff;padding:14px 16px;display:flex;flex-direction:column;gap:6px;transition:all .25s">
              <span style="display:flex;align-items:center;gap:8px"><span class="rev-ic" style="width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:var(--bg);color:var(--muted);transition:all .25s">${ic[s.icon](18)}</span><span class="mono" style="font-size:12px;color:var(--muted)">${s.era}</span></span>
              <b style="font-size:15px">${s.k}</b>
              <span style="font-size:13px;color:var(--muted)">${s.who}</span>
            </button>`).join('')}
        </div>
        <div class="rev-hand" style="display:flex;align-items:center;gap:10px;font-size:13px;color:var(--muted)">
          <span>人</span>
          <div style="flex:1 1 auto;display:flex;gap:4px">${stages.map((s, i) => `<div class="rev-seg" data-i="${i}" style="flex:1;height:8px;border-radius:4px;background:var(--line);transition:background .4s"></div>`).join('')}</div>
          <span>机器</span>
        </div>
        <div class="w-panel rev-detail"></div>
      </div>`;
    const btns = SA.$$('.rev-btn', root), segs = SA.$$('.rev-seg', root), det = SA.$('.rev-detail', root);
    function render() {
      btns.forEach((b, i) => {
        const on = i === cur;
        b.setAttribute('aria-pressed', on);
        b.style.borderColor = on ? 'var(--accent)' : 'var(--line)';
        b.style.boxShadow = on ? '0 0 0 4px var(--accent-soft)' : 'none';
        const icn = SA.$('.rev-ic', b);
        icn.style.background = i <= cur ? 'var(--accent)' : 'var(--bg)';
        icn.style.color = i <= cur ? '#fff' : 'var(--muted)';
      });
      segs.forEach((s, i) => { s.style.background = i <= cur ? (i === 2 ? 'var(--amber)' : 'var(--accent)') : 'var(--line)'; });
      const s = stages[cur];
      det.innerHTML = `<div class="t fade-swap">机器接过了：${s.hand}</div><div class="d fade-swap">${s.body}</div>`;
    }
    btns.forEach((b) => b.addEventListener('click', () => { cur = +b.dataset.i; render(); }));
    render();
  };

  /* ---------- 它们算“智能”吗？ ---------- */
  W.smartOrNot = function (root, ctx) {
    const items = [
      { t: '计算器', d: '1 秒算出 37 × 48', note: '算得又快又准，但每一步都是写死的。多数人觉得“不算”。' },
      { t: '自动门', d: '有人靠近就开门', note: '只有一条规则：感应到人 → 开门。它从不需要“判断”。' },
      { t: '导航软件', d: '避开拥堵规划路线', note: '要在很多可能中权衡、做选择。不少人觉得“有点像”。' },
      { t: '扫地机器人', d: '绕开桌腿和拖鞋', note: '感知环境、调整行动——这正是“行为主义”关心的智能。' },
      { t: '翻译软件', d: '翻译没见过的句子', note: '能处理从没见过的输入，说明它学到了某种规律。' },
      { t: '聊天机器人', d: '和你闲聊一下午', note: '很多人第一次觉得“它好像真的懂”——但它真的懂吗？' }
    ];
    const ans = {};
    root.innerHTML = `
      <div class="w">
        <div class="cards-grid" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr))">
          ${items.map((it, i) => `
            <div class="mini-card" data-i="${i}" style="transition:border-color .25s, background .25s">
              <h4>${it.t}</h4>
              <p style="color:var(--muted)">${it.d}</p>
              <div class="w-row" style="gap:6px;margin-top:4px">
                <button type="button" class="btn sm" data-v="y" aria-pressed="false">像智能</button>
                <button type="button" class="btn sm" data-v="n" aria-pressed="false">不像</button>
              </div>
              <p class="sn-note" style="display:none;font-size:13px !important;color:var(--ink-2)"></p>
            </div>`).join('')}
        </div>
        <div class="w-panel sn-sum" style="display:none"></div>
      </div>`;
    SA.$$('.mini-card', root).forEach((card) => {
      const i = +card.dataset.i;
      SA.$$('button', card).forEach((b) => b.addEventListener('click', () => {
        ans[i] = b.dataset.v;
        SA.$$('button', card).forEach((x) => {
          const on = x === b;
          x.setAttribute('aria-pressed', on);
          x.className = 'btn sm' + (on ? (x.dataset.v === 'y' ? ' primary' : ' dark') : '');
        });
        card.style.borderColor = 'var(--accent)';
        const n = SA.$('.sn-note', card);
        n.style.display = 'block';
        n.classList.add('fade-swap');
        n.textContent = items[i].note;
        if (Object.keys(ans).length === items.length) done();
      }));
    });
    let said = false;
    function done() {
      const yes = Object.values(ans).filter((v) => v === 'y').length;
      const sum = SA.$('.sn-sum', root);
      sum.style.display = 'flex';
      sum.innerHTML = `<div class="t fade-swap">你认为 ${yes} / ${items.length} 个“像智能”</div><div class="d fade-swap">没有对错。但请回想：你判断的依据是什么？是看它<b>做到了什么</b>，还是看它<b>怎么做到的</b>？同一个东西，不同的人会给出不同答案——这说明我们需要一个<b>标准</b>。</div>`;
      if (!said) {
        said = true;
        ctx.say(`你判断了 ${yes} 个“像智能”。我注意到大家最常犹豫的是<b>聊天机器人</b>：它看起来很像人，可它真的懂吗？下一节，图灵用一个游戏绕开了这个难题。`);
      }
    }
  };

  /* ---------- 模仿游戏 ---------- */
  W.imitation = function (root, ctx) {
    const rounds = [
      [
        { id: 'A', machine: false, lines: [['能帮我算一下 37 × 48 吗？', '呃……等我拿手机。1776？我也不太确定。'], ['今天早饭吃了什么？', '豆浆油条，楼下那家，排了好久的队。']] },
        { id: 'B', machine: true, lines: [['能帮我算一下 37 × 48 吗？', '37 × 48 = 1776。'], ['今天早饭吃了什么？', '一碗小馄饨，汤很鲜，还加了点紫菜。']] }
      ],
      [
        { id: 'A', machine: true, lines: [['用一个词形容你的童年？', '嗯……“夏天”吧。外婆家的西瓜和蝉鸣。'], ['刚才那句话你想了多久？', '哈哈没想多久，脱口而出的。你呢？']] },
        { id: 'B', machine: false, lines: [['用一个词形容你的童年？', '补习班。没开玩笑。'], ['刚才那句话你想了多久？', '两秒？你这问题好奇怪。']] }
      ]
    ];
    const expl = [
      'B 是机器。它算乘法又快又准，却也“编”了一顿早饭——它没有身体，也没有早晨。这类破绽越来越难发现：今天的大语言模型，已经能让多数人在日常闲聊里分辨不出来。',
      '这一轮 A 才是机器。它的回答温暖、自然，还会反问你——这正是现代大模型擅长的“像人”。第二轮比第一轮难多了，对吧？'
    ];
    let r = 0, guess = null, score = 0;
    root.innerHTML = `<div class="w"><div class="screens"></div><div class="verdict-host"></div></div>`;
    const host = SA.$('.screens', root), vh = SA.$('.verdict-host', root);
    function render(animate) {
      const data = rounds[r];
      host.innerHTML = data.map((sc) => `
        <div class="screen ${guess === sc.id ? 'picked' : ''}">
          <div class="screen-head"><b>屏幕 ${sc.id}</b>${guess ? `<span class="pill ${sc.machine ? 'dark' : ''}">${sc.machine ? '机器' : '人类'}</span>` : `<span class="w-note">第 ${r + 1} / ${rounds.length} 轮</span>`}</div>
          <div class="screen-body">${sc.lines.map((l, j) => `<div class="bub-q ${animate ? 'bub-in' : ''}" style="animation-delay:${j * 0.5}s">${l[0]}</div><div class="bub-a ${animate ? 'bub-in' : ''}" style="animation-delay:${j * 0.5 + 0.25}s">${l[1]}</div>`).join('')}</div>
          <div class="screen-foot"><button type="button" class="btn ${guess === sc.id ? 'primary' : ''}" data-id="${sc.id}" ${guess ? 'disabled' : ''}>${guess === sc.id ? '我选 ' + sc.id + ' 是机器' : sc.id + ' 是机器'}</button></div>
        </div>`).join('');
      SA.$$('[data-id]', host).forEach((b) => b.addEventListener('click', () => pick(b.dataset.id)));
      if (guess) {
        const right = data.find((s) => s.machine).id === guess;
        vh.innerHTML = `<div class="verdict fade-swap"><b style="color:${right ? 'var(--green)' : 'var(--orange-ink)'}">${right ? '猜对了' : '其实是 ' + data.find((s) => s.machine).id}</b><div>${expl[r]}${r < rounds.length - 1 ? '<div style="margin-top:10px"><button type="button" class="btn sm next-r">再来一轮（更难）</button></div>' : `<div style="margin-top:10px" class="w-note">两轮你猜对了 ${score} 轮。</div>`}</div></div>`;
        const nb = SA.$('.next-r', vh);
        if (nb) nb.addEventListener('click', () => { r++; guess = null; vh.innerHTML = ''; render(true); });
      }
    }
    function pick(id) {
      guess = id;
      const right = rounds[r].find((s) => s.machine).id === id;
      if (right) score++;
      render(false);
      if (r === 0) ctx.say(right ? '猜对了！你靠的是什么线索？我猜是那顿“早饭”——机器没有早晨。注意：你只看了<b>对话</b>，这正是图灵测试的规则。' : '没关系，这正说明分辨并不容易。你刚才只能看<b>对话</b>，看不到对面是谁——这就是图灵测试的设定。');
      if (r === 1) ctx.say(right ? '第二轮也猜对了，厉害。不过在 2025 年的真实实验里，大多数人已经分不出来了。' : '第二轮被骗过去了吧？别难过——2025 年的实验里，带人设的大模型被当成人类的比例约 73%，比真人还高。');
    }
    render(false);
  };

  /* ---------- 图灵测试时间线 ---------- */
  W.turingTimeline = function (root, ctx) {
    const ms = [
      { year: '1950', short: '提出', title: '图灵提出“模仿游戏”', body: '论文《计算机器与智能》发表，用一个可操作的测试代替“机器能否思考”的哲学争论。' },
      { year: '1956', short: '命名', title: '“人工智能”一词诞生', body: '达特茅斯会议上，麦卡锡等人正式提出 Artificial Intelligence——这是下一节的内容。' },
      { year: '1966', short: 'ELIZA', title: 'ELIZA：让人信以为真的聊天程序', body: '它只是按关键词把你的话改写成问句，却让不少使用者向它倾诉心事。“像人”并不难，难的是“懂”。' },
      { year: '2014', short: '争议', title: '“尤金·古斯特曼”号称通过测试', body: '程序扮成一个 13 岁、英语不太好的男孩，让约三分之一的评委信以为真。批评者认为它靠“装傻”回避问题，暴露了测试的漏洞。' },
      { year: '2025', short: '大模型', title: '大模型在实验中被更多人当成“人”', body: '在一项三方图灵测试研究中，带人设提示的 GPT-4.5 被判定为人类的比例约 73%，比真人还高。这让问题变成：测试本身还够用吗？' }
    ];
    let cur = 4;
    root.innerHTML = `
      <div class="w">
        <div class="tl" style="grid-template-columns:repeat(${ms.length},minmax(0,1fr))">
          <div class="tl-line" aria-hidden="true"><i></i></div>
          ${ms.map((m, i) => `<button type="button" class="tl-btn" data-i="${i}" aria-pressed="false"><span class="tl-dot">${m.short}</span><span class="tl-year">${m.year}</span></button>`).join('')}
        </div>
        <div class="w-panel tl-detail"></div>
      </div>`;
    const btns = SA.$$('.tl-btn', root), det = SA.$('.tl-detail', root), bar = SA.$('.tl-line i', root);
    function render() {
      btns.forEach((b, i) => b.setAttribute('aria-pressed', i === cur));
      bar.style.width = (cur / (ms.length - 1)) * 100 + '%';
      const m = ms[cur];
      det.innerHTML = `<div class="t fade-swap">${m.year} · ${m.title}</div><div class="d fade-swap">${m.body}</div>`;
    }
    btns.forEach((b) => b.addEventListener('click', () => { cur = +b.dataset.i; render(); }));
    render();
  };

  /* ---------- 达特茅斯提案 ---------- */
  W.dartmouth = function (root, ctx) {
    const lines = [
      ['We propose that a 2 month, 10 man study of artificial intelligence be carried out during the summer of 1956 at Dartmouth College in Hanover, New Hampshire.', '我们提议，1956 年夏天在新罕布什尔州汉诺威的达特茅斯学院，进行一项为期 2 个月、10 人参与的人工智能研究。'],
      ['The study is to proceed on the basis of the conjecture that every aspect of learning or any other feature of intelligence can in principle be so precisely described that a machine can be made to simulate it.', '这项研究基于这样一个猜想：学习的每个方面、或智能的任何其他特征，原则上都可以被精确地描述，以至于能够制造一台机器来模拟它。'],
      ['An attempt will be made to find how to make machines use language, form abstractions and concepts, solve kinds of problems now reserved for humans, and improve themselves.', '我们将尝试找到办法，让机器使用语言、形成抽象和概念、解决目前只有人类才能解决的问题，并且自我改进。']
    ];
    let shown = 0;
    root.innerHTML = `
      <div class="w">
        <div class="quote" style="display:flex;flex-direction:column;gap:14px">
          <div class="dm-lines" style="display:flex;flex-direction:column;gap:14px"></div>
          <span class="who">— J. McCarthy, M. Minsky, N. Rochester, C. Shannon，1955 年 8 月 31 日</span>
        </div>
        <div class="w-row"><button type="button" class="btn sm dm-next">${ic.play(12)} 读下一句</button><span class="w-note dm-count"></span></div>
        <div class="dm-poll" style="display:none;flex-direction:column;gap:10px">
          <b style="font-size:15px">投个票：“10 个人、2 个月”，你觉得能实现这些目标吗？</b>
          <div class="w-row" style="gap:8px">
            <button type="button" class="btn sm" data-v="0">能取得重大突破</button>
            <button type="button" class="btn sm" data-v="1">需要几十年</button>
            <button type="button" class="btn sm" data-v="2">永远做不到</button>
          </div>
          <div class="w-panel dm-res" style="display:none"></div>
        </div>
      </div>`;
    const host = SA.$('.dm-lines', root), nb = SA.$('.dm-next', root), cnt = SA.$('.dm-count', root), poll = SA.$('.dm-poll', root);
    function typeLine(el, text) {
      if (SA.reducedMotion()) { el.textContent = text; return; }
      let i = 0;
      const t = setInterval(() => { i += 3; el.textContent = text.slice(0, i); if (i >= text.length) clearInterval(t); }, 16);
    }
    function next() {
      if (shown >= lines.length) return;
      const [en, zh] = lines[shown];
      const row = SA.h(`<div class="fade-swap" style="display:flex;flex-direction:column;gap:4px"><span class="mono" style="font-size:13px;color:var(--ink-2);line-height:1.7"></span><span style="font-size:15px;line-height:1.8"></span></div>`);
      host.appendChild(row);
      typeLine(row.children[0], en);
      setTimeout(() => typeLine(row.children[1], zh), 400);
      shown++;
      cnt.textContent = shown + ' / ' + lines.length;
      if (shown >= lines.length) { nb.disabled = true; nb.textContent = '已读完'; poll.style.display = 'flex'; }
    }
    nb.addEventListener('click', next);
    next();
    SA.$$('[data-v]', poll).forEach((b) => b.addEventListener('click', () => {
      SA.$$('[data-v]', poll).forEach((x) => { x.className = 'btn sm' + (x === b ? ' primary' : ''); });
      const res = SA.$('.dm-res', root);
      res.style.display = 'flex';
      res.innerHTML = `<div class="t fade-swap">近 70 年后，这些目标仍在路上</div><div class="d fade-swap">“使用语言”直到 2022 年的 ChatGPT 才真正走进大众；“自我改进”至今仍是前沿难题。早期研究者的乐观，也为后来的“AI 低谷”埋下了伏笔（第 4 章会讲到）。</div>`;
      ctx.say(b.dataset.v === '0' ? '你和当年的提案人一样乐观！他们确实开创了一个学科，但“2 个月”这个估计……差了大约 70 年。' : '你的判断比 1956 年的科学家更准。乐观与失落交替，正是 AI 发展史的主旋律。');
    }));
  };

  /* ---------- 会议上的人（翻转卡） ---------- */
  W.people = function (root) {
    const ps = [
      { n: '约翰·麦卡锡', e: 'John McCarthy', ini: '麦', role: '会议发起人', back: '提出了“人工智能”这个名字。后来发明了 LISP 语言，被称为“人工智能之父”之一。' },
      { n: '马文·明斯基', e: 'Marvin Minsky', ini: '明', role: '提案人', back: '后来与派珀特合著《感知机》（1969），指出单层感知机的局限，影响了神经网络研究的走向。' },
      { n: '克劳德·香农', e: 'Claude Shannon', ini: '香', role: '提案人', back: '信息论之父。他用数学定义了“信息”，为通信和计算机奠定了基础。' },
      { n: '纳撒尼尔·罗切斯特', e: 'Nathaniel Rochester', ini: '罗', role: '提案人', back: 'IBM 701 计算机的主要设计者，曾在计算机上模拟神经网络。' },
      { n: '赫伯特·西蒙', e: 'Herbert Simon', ini: '西', role: '参会者', back: '与纽厄尔一起带来了“逻辑理论家”程序，能证明数学定理。后获诺贝尔经济学奖和图灵奖。' },
      { n: '艾伦·纽厄尔', e: 'Allen Newell', ini: '纽', role: '参会者', back: '符号主义的代表人物，与西蒙共同提出“物理符号系统假设”。' }
    ];
    root.innerHTML = `<div class="flip-grid">${ps.map((p) => `
      <button type="button" class="flip" aria-pressed="false" aria-label="${p.n}，点击翻面">
        <div class="flip-in">
          <div class="flip-f"><span class="ini">${p.ini}</span><b>${p.n}</b><span>${p.e} · ${p.role}</span></div>
          <div class="flip-b"><b>${p.n}</b>${p.back}</div>
        </div>
      </button>`).join('')}</div>`;
    SA.$$('.flip', root).forEach((f) => f.addEventListener('click', () => f.setAttribute('aria-pressed', f.getAttribute('aria-pressed') !== 'true')));
  };
})();
