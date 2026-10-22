/* 第 5 章互动组件 */
(function () {
  const SA = window.SA, W = SA.widgets, ic = SA.ic;

  /* 把一段 HTML 逐字“打”出来（跳过标签） */
  function stream(el, html, speed, done) {
    if (SA.reducedMotion()) { el.innerHTML = html; done && done(); return () => {}; }
    let i = 0;
    const t = setInterval(() => {
      for (let k = 0; k < (speed || 2) && i < html.length; k++) {
        if (html[i] === '<') { const j = html.indexOf('>', i); i = j < 0 ? html.length : j + 1; } else i++;
      }
      el.innerHTML = html.slice(0, i);
      if (i >= html.length) { clearInterval(t); done && done(); }
    }, 18);
    return () => clearInterval(t);
  }
  SA.stream = stream;

  /* ---------- 三个时代 ---------- */
  W.learningShift = function (root, ctx) {
    const q = '北京大学是哪一年成立的？有什么特点？';
    const eras = [
      { n: '早期：读书', y: '从书籍里学习', html: `
        <div class="w-note">《中国高等教育史》· 目录</div>
        <div class="book-toc"><span>第一章 古代书院</span><span>1</span></div>
        <div class="book-toc"><span>第二章 近代大学的兴起</span><span>37</span></div>
        <div class="book-toc" style="background:var(--amber-soft)"><span>　2.3 京师大学堂</span><span>52</span></div>
        <div class="book-toc"><span>第三章 民国时期的大学</span><span>81</span></div>
        <div class="w-note" style="margin-top:6px">你需要：找到书 → 查目录 → 翻到第 52 页 → 自己读、自己总结。可靠，但慢。</div>` },
      { n: '10 年前：搜索引擎', y: '从搜索结果里学习', html: `
        <div class="composer" style="background:#fff;border-color:var(--line-2)"><span style="flex:1;color:var(--ink);font-size:14px">北京大学 成立时间</span></div>
        <div class="serp"><a href="#" tabindex="-1">北京大学 - 百科</a><span>北京大学创办于 1898 年，初名京师大学堂……</span></div>
        <div class="serp"><a href="#" tabindex="-1">北京大学官方网站 · 学校概况</a><span>北京大学创办于 1898 年，是中国近现代第一所国立综合性大学……</span></div>
        <div class="serp"><a href="#" tabindex="-1">北大的 120 年：从京师大学堂到……</a><span>……</span></div>
        <div class="w-note" style="margin-top:6px">你需要：在 10 条链接里挑选、点开、比对、总结。快多了，但仍要自己整合。</div>` },
      { n: '现在：提问大模型', y: '直接提问，得到组织好的回答', html: `
        <div class="bub-q" style="align-self:flex-end">${q}</div>
        <div class="bub-a lm-ans" style="max-width:100%;line-height:1.8"></div>
        <div class="w-note lm-note" style="margin-top:6px;display:none">直接得到一段组织好的回答，还能追问。但要记住：<b>它可能出错</b>，关键信息要核实。</div>` }
    ];
    let cur = 0, cancel = null;
    root.innerHTML = `
      <div class="w">
        <div class="slider"><label for="ls"><span>拖动时间轴</span><span class="mono ls-v"></span></label><input id="ls" type="range" min="0" max="2" step="1" value="0"></div>
        <div class="w-row" style="justify-content:space-between;font-size:12px;color:var(--muted);margin-top:-8px"><span>读书</span><span>搜索引擎</span><span>大语言模型</span></div>
        <div class="era-mock"></div>
      </div>`;
    const mock = SA.$('.era-mock', root);
    function render() {
      cancel && cancel();
      const e = eras[cur];
      SA.$('.ls-v', root).textContent = e.n;
      mock.innerHTML = `<div class="fade-swap" style="display:flex;flex-direction:column;gap:8px"><b style="font-size:13px;color:var(--muted)">问题：${q}</b>${e.html}</div>`;
      if (cur === 2) {
        cancel = stream(SA.$('.lm-ans', mock), '北京大学创办于 <b>1898 年</b>，最初名为“京师大学堂”，是中国近现代第一所国立综合性大学。它的特点包括：<br>① 历史悠久，是新文化运动的中心和五四运动的发祥地；<br>② 学科齐全，文理医工并重；<br>③ 校园位于燕园，未名湖、博雅塔是标志性景观。', 3, () => { const n = SA.$('.lm-note', mock); if (n) n.style.display = 'block'; });
        ctx.say('从“翻目录”到“点链接”再到“直接问”，获取知识的成本越来越低。这也是大模型被视为迈向通用人工智能的原因之一：<b>同一个系统能回答几乎任何领域的问题</b>。', 'era');
      }
    }
    SA.$('#ls', root).addEventListener('input', (e) => { cur = +e.target.value; render(); });
    render();
    return () => cancel && cancel();
  };

  /* ---------- 提示词实验室 ---------- */
  W.promptLab = function (root, ctx) {
    const parts = [
      { k: 'role', n: '角色', d: '让模型以谁的身份回答', t: '你是一位有十年教龄、很会讲故事的高中信息技术老师。', c: '#2B3BB8', bg: '#EEF0FC' },
      { k: 'aud', n: '背景 · 受众', d: '给谁看，他们是什么水平', t: '下周我要给高一新生做一场 AI 讲座，他们大多没接触过编程。', c: '#1F8A5B', bg: '#E6F4EE' },
      { k: 'task', n: '具体任务', d: '到底要做什么', t: '请帮我写讲座的开场白，目的是让他们对人工智能产生好奇。', c: '#7B4FC9', bg: '#F1EBFA' },
      { k: 'cons', n: '约束', d: '长度、语气、禁忌', t: '200 字以内，口语化，不要出现专业术语。', c: '#E07A1F', bg: '#FFF4EA' },
      { k: 'fmt', n: '输出格式', d: '希望拿到什么样子', t: '分成 3 小段，最后用一个能让全场举手的问题结尾。', c: '#A1460C', bg: '#FCEFD9' }
    ];
    const base = '介绍一下人工智能。';
    const answers = [
      '人工智能（Artificial Intelligence，简称 AI）是计算机科学的一个分支，旨在研究和开发能够模拟、延伸和扩展人类智能的理论、方法、技术及应用系统。人工智能的研究领域包括机器学习、自然语言处理、计算机视觉、专家系统、机器人学等。其发展经历了多个阶段，从 20 世纪 50 年代的符号主义，到 80 年代的专家系统，再到近年来以深度学习为代表的数据驱动方法……',
      '同学们好！今天我们来聊聊人工智能。人工智能就是让机器像人一样思考和学习的技术。它的核心是机器学习，也就是让计算机从大量数据中学习规律。比如你们手机里的人脸解锁、短视频推荐，背后都有人工智能。人工智能已经广泛应用于医疗、交通、教育等领域……',
      '同学们好！先问大家一个问题：你们今天有没有“和 AI 打过交道”？\n\n其实，从早上手机刷脸解锁，到刷短视频时“越刷越懂你”的推荐，AI 一直在你身边。它不是科幻电影里的机器人，而是一种会“从经验中学习”的程序。\n\n接下来这节课，我们就来揭开它的秘密。',
      '同学们好！先做个小实验：觉得自己今天<b>没有</b>用过 AI 的，请举手。\n\n嗯……先别急着举。你早上用脸解锁手机了吗？刷短视频时，有没有觉得它“越来越懂你”？这些背后，都是 AI 在悄悄工作。它不是电影里的机器人，更像一个特别会“从经验里总结规律”的学生。\n\n今天，我们就来看看这个学生是怎么学习的。最后问一句：<b>如果你能训练一个 AI，你最想让它帮你做什么？</b>想到的同学，请举手！'
    ];
    const on = new Set();
    root.innerHTML = `
      <div class="w">
        <div class="pl">
          <div style="display:flex;flex-direction:column;gap:10px">
            <span class="w-note">勾选要加入的部分</span>
            <div class="pl-parts">${parts.map((p) => `<button type="button" class="pl-part" data-k="${p.k}" aria-pressed="false" style="--c:${p.c}"><span class="cb">${ic.check(12)}</span><span class="tx"><b>${p.n}</b><span>${p.d}</span></span></button>`).join('')}</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:10px">
            <span class="w-note">你的提示词</span>
            <div class="pl-prompt"></div>
            <div class="w-row"><button type="button" class="btn primary sm pl-send">${ic.arrow(14)} 发送给模型（模拟）</button></div>
          </div>
        </div>
        <div class="w-grid2" style="align-items:start">
          <div style="display:flex;flex-direction:column;gap:6px"><span class="w-note">模型的回答</span><div class="pl-ans"><span class="w-note">还没有发送。</span></div></div>
          <div style="display:flex;flex-direction:column;gap:8px"><span class="w-note">这次回答对你有多大用？</span><div class="hbars pl-q"></div><div class="w-panel pl-tip"><div class="d">从最简单的一句话开始，每次多勾一项，对比回答的变化。</div></div></div>
        </div>
      </div>`;
    const prm = SA.$('.pl-prompt', root);
    function renderPrompt() {
      const sel = parts.filter((p) => on.has(p.k));
      prm.innerHTML = sel.length ? sel.map((p) => `<mark style="background:${p.bg};color:${p.c}">${p.t}</mark>`).join(' ') : base;
      SA.$$('.pl-part', root).forEach((b) => b.setAttribute('aria-pressed', on.has(b.dataset.k)));
    }
    let cancel = null, sends = 0;
    function send() {
      cancel && cancel();
      const n = on.size, tier = n === 0 ? 0 : n <= 2 ? 1 : n <= 4 ? 2 : 3;
      const ans = SA.$('.pl-ans', root);
      ans.innerHTML = '<span class="typing" style="background:var(--bg)"><i></i><i></i><i></i></span>';
      const scores = [
        ['贴合受众', [20, on.has('aud') ? 75 : 45, 85, 96][tier]],
        ['完成任务', [30, on.has('task') ? 70 : 40, 88, 97][tier]],
        ['符合格式与约束', [10, 20, on.has('cons') || on.has('fmt') ? 80 : 45, 95][tier]]
      ];
      setTimeout(() => {
        cancel = stream(ans, answers[tier].replace(/\n/g, '<br>'), 3);
        SA.$('.pl-q', root).innerHTML = scores.map(([k, v]) => `<div class="hbar"><span>${k}</span><div class="track"><i style="width:0;background:${v > 70 ? 'var(--green)' : v > 40 ? 'var(--amber)' : 'var(--orange)'}" data-w="${v}"></i></div><span class="num">${v}</span></div>`).join('');
        requestAnimationFrame(() => SA.$$('.pl-q i', root).forEach((i) => (i.style.width = i.dataset.w + '%')));
        const tips = ['一句话的提问，得到的是一段“百科全书式”的回答：正确，但对你没什么用。试着加上<b>受众</b>和<b>任务</b>。', '好一些了，但模型还在“猜”你要多长、什么语气。加上<b>约束</b>和<b>格式</b>试试。', '已经很接近能直接用了！把剩下的部分也加上，看看还有什么不同。', '五个部分全齐：角色、受众、任务、约束、格式。模型几乎不用猜，拿到就能用。'];
        SA.$('.pl-tip', root).innerHTML = `<div class="d fade-swap">${tips[tier]}</div>`;
        sends++;
        if (tier === 3) ctx.say('对比一下第一次和这一次的回答——<b>同一个模型</b>，只是问法不同，结果天差地别。这就是“提示词工程”。', 'pfull');
      }, SA.reducedMotion() ? 0 : 700);
    }
    SA.$$('.pl-part', root).forEach((b) => b.addEventListener('click', () => { on.has(b.dataset.k) ? on.delete(b.dataset.k) : on.add(b.dataset.k); renderPrompt(); }));
    SA.$('.pl-send', root).addEventListener('click', send);
    renderPrompt();
    return () => cancel && cancel();
  };

  /* ---------- 多模态矩阵 ---------- */
  W.modality = function (root, ctx) {
    const M = ['文本', '图像', '音频', '视频'];
    const cells = {
      '0-0': ['对话、写作、翻译、写代码', 'ChatGPT、豆包、DeepSeek'],
      '0-1': ['文生图：一句话画出一张图', 'Midjourney、Stable Diffusion、Nano Banana'],
      '0-2': ['语音合成、文字生成音乐', '各类 TTS 语音合成、AI 作曲工具'],
      '0-3': ['文生视频：一句话生成一段视频', 'Sora、Veo 3.1、SeeDance 2.0'],
      '1-0': ['看图说话、拍照解题、图表分析', '多模态大模型（如 GPT-4o、豆包）'],
      '1-1': ['图像编辑、风格迁移、换背景', 'Nano Banana、Stable Diffusion'],
      '1-3': ['图生视频：让一张照片动起来', 'Veo 3.1、SeeDance 2.0'],
      '2-0': ['语音识别、会议纪要', '语音转写工具、多模态大模型'],
      '2-2': ['实时语音对话、变声', '语音对话模式的大模型'],
      '3-0': ['视频理解：总结一段视频讲了什么', '多模态大模型'],
      '3-3': ['视频编辑、续写、配音', '视频生成与编辑模型']
    };
    let cur = '0-3';
    root.innerHTML = `
      <div class="w">
        <div class="mod" role="group" aria-label="输入模态（行）× 输出模态（列）">
          <span class="hd">输入 ↓ 输出 →</span>${M.map((m) => `<span class="hd">${m}</span>`).join('')}
          ${M.map((r, i) => `<span class="rh">${r}</span>${M.map((c, j) => { const k = i + '-' + j, v = cells[k]; return `<button type="button" data-k="${k}" class="${v ? '' : 'empty'}" aria-pressed="false">${v ? v[0].split('、')[0].split('：')[0] : '探索中'}</button>`; }).join('')}`).join('')}
        </div>
        <div class="w-panel mod-d"></div>
      </div>`;
    function render() {
      SA.$$('.mod button', root).forEach((b) => b.setAttribute('aria-pressed', b.dataset.k === cur));
      const [i, j] = cur.split('-').map(Number), v = cells[cur];
      SA.$('.mod-d', root).innerHTML = v ? `<div class="t fade-swap">${M[i]} → ${M[j]}</div><div class="d fade-swap">${v[0]}<br><span class="w-note">代表工具：${v[1]}</span></div>` : `<div class="t fade-swap">${M[i]} → ${M[j]}</div><div class="d fade-swap">这个方向还不常见，但随着多模态模型发展，很多“空格”正在被填上。</div>`;
    }
    SA.$$('.mod button', root).forEach((b) => b.addEventListener('click', () => { cur = b.dataset.k; render(); }));
    render();
  };

  /* ---------- 推理模型：先想再答 ---------- */
  W.reasoning = function (root, ctx) {
    const q = '一个笼子里有鸡和兔共 35 只，脚共 94 只。鸡和兔各有几只？';
    const think = `好，先理清条件：鸡和兔一共 35 只，脚一共 94 只。鸡 2 只脚，兔 4 只脚。

假设 35 只全是鸡，那么脚应该有 35 × 2 = 70 只。
可实际有 94 只，多出了 94 − 70 = 24 只脚。

每把一只鸡换成一只兔，脚就多 4 − 2 = 2 只。
所以兔有 24 ÷ 2 = 12 只，鸡有 35 − 12 = 23 只。

验算一下：23 × 2 + 12 × 4 = 46 + 48 = 94。对上了。`;
    let mode = 'fast', busy = false, cancel = null, tried = { fast: false, slow: false };
    root.innerHTML = `
      <div class="w">
        <div class="chatmock">
          <div class="chatmock-head"><span class="seg rs-mode" role="group" aria-label="模式"><button type="button" data-m="fast" aria-pressed="true">直接回答</button><button type="button" data-m="slow" aria-pressed="false">深度思考</button></span><button type="button" class="btn primary sm rs-send">${ic.arrow(14)} 提问</button></div>
          <div class="chatmock-body"><div class="bub-q" style="align-self:flex-end">${q}</div><div class="rs-out" style="display:flex;flex-direction:column;gap:10px"></div></div>
        </div>
      </div>`;
    const out = SA.$('.rs-out', root);
    SA.$$('.rs-mode button', root).forEach((b) => b.addEventListener('click', () => { if (busy) return; mode = b.dataset.m; SA.$$('.rs-mode button', root).forEach((x) => x.setAttribute('aria-pressed', x === b)); }));
    SA.$('.rs-send', root).addEventListener('click', async () => {
      if (busy) return; busy = true; cancel && cancel();
      out.innerHTML = '';
      tried[mode] = true;
      if (mode === 'fast') {
        const a = SA.h('<div class="answer-box"></div>'); out.appendChild(a);
        await new Promise((r) => (cancel = stream(a, '鸡有 20 只，兔有 15 只。', 2, r)));
        await SA.sleep(400);
        out.appendChild(SA.h('<div class="check-line bad fade-swap">验算：20 × 2 + 15 × 4 = 40 + 60 = 100 ≠ 94 ✗　脱口而出，答错了。</div>'));
      } else {
        const tg = SA.h(`<button type="button" class="think-toggle" aria-expanded="true">${ic.spark(12)} <span>思考中…</span></button>`);
        const th = SA.h('<div class="think"></div>');
        out.appendChild(tg); out.appendChild(th);
        const t0 = Date.now();
        await new Promise((r) => (cancel = stream(th, think.replace(/\n/g, '<br>'), 3, r)));
        SA.$('span', tg).textContent = `已深度思考（用时 ${Math.max(1, Math.round((Date.now() - t0) / 1000))} 秒）`;
        tg.addEventListener('click', () => { const o = tg.getAttribute('aria-expanded') === 'true'; tg.setAttribute('aria-expanded', !o); th.style.display = o ? 'none' : 'block'; });
        const a = SA.h('<div class="answer-box"></div>'); out.appendChild(a);
        await new Promise((r) => (cancel = stream(a, '<b>鸡 23 只，兔 12 只。</b>', 2, r)));
        out.appendChild(SA.h('<div class="check-line ok fade-swap">验算：23 × 2 + 12 × 4 = 94 ✓　先想再答，而且每一步你都能检查。</div>'));
      }
      busy = false;
      if (tried.fast && tried.slow) ctx.say('两种模式都试过了：“直接回答”快但会出错，“深度思考”慢一些，但答对了，<b>而且你能看到它每一步怎么想的</b>。这就是 DeepSeek R1 这类推理模型最打动人的地方。', 'rs');
    });
    return () => cancel && cancel();
  };

  /* ---------- 智能体循环 ---------- */
  W.agentLoop = function (root, ctx) {
    const nodes = ['感知', '决策', '行动', '学习'];
    const log = [
      [0, '读取任务', '目标：把本周 3 节课的笔记整理成复习卡片。'],
      [0, '读取文件', '找到 3 份笔记：第 1–3 章，共 4200 字。'],
      [1, '制定计划', '① 提取每章关键概念 ② 每个概念出 1 道问答 ③ 导出卡片。'],
      [2, '调用工具', '调用文本分析工具，提取出 18 个关键概念。'],
      [2, '生成内容', '生成 18 张“问题 / 答案”卡片。'],
      [0, '检查结果', '发现“图灵测试”与“模仿游戏”重复了。'],
      [3, '自我修正', '合并重复卡片，剩 17 张；记住“同义概念要合并”。'],
      [2, '交付', '已导出 17 张复习卡片。任务完成 ✓']
    ];
    let timer = null;
    root.innerHTML = `
      <div class="w">
        <div class="loop-wrap">
          <svg class="loop-svg" viewBox="0 0 260 260" role="img" aria-label="感知、决策、行动、学习四个环节组成的循环">
            <circle cx="130" cy="130" r="86" fill="none" stroke="#E3E6EC" stroke-width="10"></circle>
            <circle class="lp-arc" cx="130" cy="130" r="86" fill="none" stroke="#2B3BB8" stroke-width="10" stroke-linecap="round" stroke-dasharray="0 540" transform="rotate(-90 130 130)" style="transition:stroke-dasharray .6s"></circle>
            ${nodes.map((n, i) => { const a = -Math.PI / 2 + i * Math.PI / 2, x = 130 + Math.cos(a) * 86, y = 130 + Math.sin(a) * 86; return `<g><circle class="node lp-n" data-i="${i}" cx="${x}" cy="${y}" r="30" fill="#fff" stroke="#2B3BB8" stroke-width="2"></circle><text x="${x}" y="${y + 5}" text-anchor="middle" font-size="14" font-weight="700" class="lp-t" data-i="${i}" fill="#14161C">${n}</text></g>`; }).join('')}
            <text x="130" y="126" text-anchor="middle" font-size="12" fill="#5A6070">大模型</text><text x="130" y="144" text-anchor="middle" font-size="12" fill="#5A6070">作为“大脑”</text>
          </svg>
          <div class="loop-log"><div style="background:transparent;padding:0;color:var(--muted)">点“运行”，看智能体如何完成一个任务。</div></div>
        </div>
        <div class="w-row"><button type="button" class="btn primary sm lp-run">${ic.play(12)} 运行智能体</button></div>
      </div>`;
    const lg = SA.$('.loop-log', root);
    function hi(i) {
      SA.$$('.lp-n', root).forEach((c) => c.setAttribute('fill', +c.dataset.i === i ? '#2B3BB8' : '#fff'));
      SA.$$('.lp-t', root).forEach((t) => t.setAttribute('fill', +t.dataset.i === i ? '#fff' : '#14161C'));
      SA.$('.lp-arc', root).setAttribute('stroke-dasharray', `${((i + 1) / 4) * 540} 540`);
    }
    SA.$('.lp-run', root).addEventListener('click', (e) => {
      clearInterval(timer); lg.innerHTML = ''; let k = 0;
      e.currentTarget.disabled = true;
      const btn = e.currentTarget;
      const step = () => {
        const [n, s, d] = log[k];
        hi(n);
        lg.appendChild(SA.h(`<div><span class="s">${nodes[n]} · ${s}</span><span>${d}</span></div>`));
        if (++k >= log.length) { clearInterval(timer); btn.disabled = false; btn.innerHTML = ic.reset(12) + ' 再运行一次'; ctx.say('注意第 6、7 步：智能体<b>检查了自己的结果，发现问题并修正</b>。这就是它和一问一答的聊天机器人最大的区别。', 'loop'); }
      };
      step(); timer = setInterval(step, SA.reducedMotion() ? 50 : 900);
    });
    return () => clearInterval(timer);
  };

  /* ---------- Vibe Coding ---------- */
  W.vibe = function (root, ctx) {
    const reqs = [
      { n: '做一个计数器', code: `<button id="b">点我 +1</button>
<h1 id="n">0</h1>
<script>
  let n = 0;
  b.onclick = () => n.textContent = ++n;
</script>`, fixed: `<style>
  body { font-family: sans-serif; text-align: center; padding-top: 40px; }
  button { font-size: 18px; padding: 10px 20px; border-radius: 10px; border: none; background: #2B3BB8; color: #fff; }
  h1 { font-size: 64px; margin: 16px 0; }
</style>
<h1 id="num">0</h1>
<button id="btn">点我 +1</button>
<script>
  let count = 0;
  btn.onclick = () => { count++; num.textContent = count; };
</script>`, bug: '第一版里变量 n 和页面元素 n 重名了，点按钮数字不会变。AI 运行测试后发现并修复了它。' },
      { n: '做一个随机点名器', fixed: `<style>
  body { font-family: sans-serif; text-align: center; padding-top: 30px; }
  #who { font-size: 48px; font-weight: bold; color: #2B3BB8; height: 70px; }
  button { font-size: 16px; padding: 10px 20px; border-radius: 10px; border: none; background: #14161C; color: #fff; }
</style>
<div id="who">准备好了吗？</div>
<button id="go">开始点名</button>
<script>
  const names = ['林同学', '王同学', '张同学', '李同学', '陈同学', '赵同学'];
  go.onclick = () => {
    let i = 0;
    const t = setInterval(() => {
      who.textContent = names[Math.floor(Math.random() * names.length)];
      if (++i > 15) clearInterval(t);
    }, 80);
  };
</script>` },
      { n: '做一个番茄钟', fixed: `<style>
  body { font-family: sans-serif; text-align: center; padding-top: 30px; }
  #t { font-size: 64px; font-family: monospace; }
  button { font-size: 16px; padding: 10px 18px; margin: 4px; border-radius: 10px; border: 1px solid #ccc; background: #fff; }
</style>
<div id="t">25:00</div>
<button id="s">开始</button><button id="r">重置</button>
<script>
  let left = 25 * 60, timer = null;
  const show = () => t.textContent = String(Math.floor(left / 60)).padStart(2, '0') + ':' + String(left % 60).padStart(2, '0');
  s.onclick = () => { if (timer) return; timer = setInterval(() => { if (left > 0) { left--; show(); } }, 1000); };
  r.onclick = () => { clearInterval(timer); timer = null; left = 25 * 60; show(); };
</script>` }
    ];
    let cancel = null;
    root.innerHTML = `
      <div class="w">
        <div class="w-row vb-reqs">${reqs.map((r, i) => `<button type="button" class="btn sm" data-i="${i}">“${r.n}”</button>`).join('')}</div>
        <div class="w-grid2" style="align-items:start">
          <div style="display:flex;flex-direction:column;gap:6px"><span class="w-note vb-cap">AI 写的代码</span><div class="code-pane vb-code">// 选一个需求，看 AI 现场写代码</div></div>
          <div style="display:flex;flex-direction:column;gap:6px"><span class="w-note">运行效果（可以直接点）</span><iframe class="preview vb-prev" sandbox="allow-scripts" title="代码运行预览"></iframe></div>
        </div>
        <div class="w-panel vb-msg"><div class="d">你只说了一句话，AI 负责写代码、运行、检查。这就是 Vibe Coding。</div></div>
      </div>`;
    const code = SA.$('.vb-code', root), prev = SA.$('.vb-prev', root), msg = SA.$('.vb-msg', root);
    function type(text, cb) {
      cancel && cancel();
      if (SA.reducedMotion()) { code.textContent = text; cb && cb(); return; }
      let i = 0;
      const t = setInterval(() => { i = Math.min(text.length, i + 6); code.textContent = text.slice(0, i); code.insertAdjacentHTML('beforeend', '<span class="caret"></span>'); code.scrollTop = code.scrollHeight; if (i >= text.length) { clearInterval(t); code.textContent = text; cb && cb(); } }, 16);
      cancel = () => clearInterval(t);
    }
    SA.$$('.vb-reqs button', root).forEach((b) => b.addEventListener('click', () => {
      const r = reqs[+b.dataset.i];
      SA.$$('.vb-reqs button', root).forEach((x) => (x.className = 'btn sm' + (x === b ? ' primary' : '')));
      prev.srcdoc = '';
      if (r.code) {
        SA.$('.vb-cap', root).textContent = 'AI 写的代码 · 第 1 版';
        msg.innerHTML = '<div class="d fade-swap">AI 正在写第 1 版……</div>';
        type(r.code, () => {
          msg.innerHTML = '<div class="d fade-swap" style="color:var(--orange-ink)">运行测试：点击按钮，数字没有变化 ✗ —— AI 正在定位问题……</div>';
          setTimeout(() => {
            SA.$('.vb-cap', root).textContent = 'AI 写的代码 · 第 2 版（已修复）';
            type(r.fixed, () => { prev.srcdoc = r.fixed; msg.innerHTML = `<div class="d fade-swap"><b style="color:var(--green)">测试通过 ✓</b> ${r.bug} 这就是“自己完成设计、开发、测试”。</div>`; });
          }, SA.reducedMotion() ? 0 : 1300);
        });
      } else {
        SA.$('.vb-cap', root).textContent = 'AI 写的代码';
        msg.innerHTML = '<div class="d fade-swap">AI 正在写代码……</div>';
        type(r.fixed, () => { prev.srcdoc = r.fixed; msg.innerHTML = '<div class="d fade-swap"><b style="color:var(--green)">完成 ✓</b> 一句话需求 → 一个能运行的小程序。右边可以直接点。</div>'; });
      }
      ctx.say('代码是“可运行的知识”。你只描述了想要什么，AI 把它变成了真正能跑的程序——<b>这门课的后半程，你会亲手做到这一点</b>。', 'vibe');
    }));
    return () => cancel && cancel();
  };
})();
