/* 第 2 章互动组件 */
(function () {
  const SA = window.SA, W = SA.widgets, ic = SA.ic;

  /* ---------- 迷你专家系统 ---------- */
  W.ruleEngine = function (root, ctx) {
    const facts = ['发烧', '咳嗽', '流鼻涕', '喉咙痛', '呼吸急促', '胸痛'];
    const rules = [
      { id: 'R1', if: ['发烧', '咳嗽'], then: '疑似呼吸道感染' },
      { id: 'R2', if: ['疑似呼吸道感染', '呼吸急促'], then: '建议排查肺炎' },
      { id: 'R3', if: ['流鼻涕', '喉咙痛'], not: ['发烧'], then: '可能是普通感冒' },
      { id: 'R4', if: ['胸痛', '呼吸急促'], then: '尽快就医' },
      { id: 'R5', if: ['疑似呼吸道感染', '喉咙痛'], then: '建议检查咽喉' }
    ];
    const on = new Set(['发烧', '咳嗽']);
    let running = false;
    root.innerHTML = `
      <div class="w">
        <div style="display:flex;flex-direction:column;gap:8px">
          <span class="w-note">① 已知事实（点击切换）</span>
          <div class="facts">${facts.map((f) => `<button type="button" class="fact" data-f="${f}" aria-pressed="false">${f}</button>`).join('')}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px">
          <span class="w-note">② 知识库：专家写好的规则</span>
          <div class="rules">${rules.map((r) => `
            <div class="rule" data-r="${r.id}"><span class="rid">${r.id}</span><span class="kw">IF</span>
              ${r.if.map((c) => `<span class="cond" data-c="${c}">${c}</span>`).join('<span class="kw">AND</span>')}
              ${(r.not || []).map((c) => `<span class="kw">AND NOT</span><span class="cond" data-c="${c}">${c}</span>`).join('')}
              <span class="kw">THEN</span><span class="then">${r.then}</span><span class="st"></span></div>`).join('')}</div>
        </div>
        <div class="w-row"><button type="button" class="btn primary sm re-run">${ic.play(12)} 开始推理</button><button type="button" class="btn sm re-vague">试试：“我就是觉得浑身不对劲”</button></div>
        <div style="display:flex;flex-direction:column;gap:8px">
          <span class="w-note">③ 推理出的新结论</span>
          <div class="engine-out"><span class="w-note">还没开始推理</span></div>
        </div>
        <span class="w-note">教学示例，仅用于演示推理过程，不构成医疗建议。</span>
      </div>`;
    const out = SA.$('.engine-out', root);
    function syncFacts() {
      SA.$$('.fact', root).forEach((b) => b.setAttribute('aria-pressed', on.has(b.dataset.f)));
    }
    function resetRules() {
      SA.$$('.rule', root).forEach((r) => { r.classList.remove('firing', 'fired'); SA.$('.st', r).textContent = ''; SA.$$('.cond', r).forEach((c) => c.classList.remove('ok')); });
    }
    SA.$$('.fact', root).forEach((b) => b.addEventListener('click', () => {
      if (running) return;
      on.has(b.dataset.f) ? on.delete(b.dataset.f) : on.add(b.dataset.f);
      syncFacts(); resetRules(); out.innerHTML = '<span class="w-note">事实变了，重新推理吧</span>';
    }));
    async function run() {
      if (running) return;
      running = true; resetRules();
      out.innerHTML = '';
      const known = new Set(on);
      const fired = new Set();
      const gap = SA.reducedMotion() ? 0 : 650;
      let changed = true;
      while (changed) {
        changed = false;
        for (const r of rules) {
          if (fired.has(r.id)) continue;
          const el = SA.$(`[data-r="${r.id}"]`, root);
          el.classList.add('firing');
          SA.$$('.cond', el).forEach((c) => {
            const isNot = (r.not || []).includes(c.dataset.c);
            c.classList.toggle('ok', isNot ? !known.has(c.dataset.c) : known.has(c.dataset.c));
          });
          await SA.sleep(gap / 2);
          const ok = r.if.every((c) => known.has(c)) && (r.not || []).every((c) => !known.has(c));
          el.classList.remove('firing');
          if (ok) {
            fired.add(r.id); known.add(r.then); changed = true;
            el.classList.add('fired'); SA.$('.st', el).textContent = '✓ 触发';
            out.appendChild(SA.h(`<span class="fact derived">${ic.check(12)} ${r.then}</span>`));
            await SA.sleep(gap / 2);
          } else {
            SA.$$('.cond', el).forEach((c) => c.classList.remove('ok'));
          }
        }
      }
      if (!fired.size) out.innerHTML = '<span class="w-note">没有任何规则被触发：已知事实凑不齐任何一条规则的条件。</span>';
      running = false;
      if (fired.size >= 2) ctx.say(`推理完成：触发了 ${fired.size} 条规则。注意看 <b>R2</b>——它用的是 R1 推出来的结论，这叫<b>链式推理</b>：新结论又成了下一条规则的前提。`);
    }
    SA.$('.re-run', root).addEventListener('click', run);
    SA.$('.re-vague', root).addEventListener('click', () => {
      if (running) return;
      resetRules();
      on.clear(); syncFacts();
      out.innerHTML = `<span style="font-size:14px">系统输入：“我就是觉得浑身不对劲”<br><b style="color:var(--orange-ink)">无法匹配任何事实，推理无法开始。</b> 规则里没有“浑身不对劲”。</span>`;
      ctx.say('这就是专家系统的第一个局限：<b>规则必须非常明确</b>。人类医生会追问、会结合经验，规则系统却只能对已写好的条件做反应。');
    });
    syncFacts();
  };

  /* ---------- 强化学习网格世界 ---------- */
  W.gridRL = function (root, ctx) {
    const C = 7, R = 5;
    const map = [
      '......G',
      '.##.#..',
      '...#.T.',
      '.T.....',
      'S...#..'
    ];
    const cell = (r, c) => map[r][c];
    let start = null;
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (cell(r, c) === 'S') start = [r, c];
    const A = [[-1, 0], [0, 1], [1, 0], [0, -1]]; // 上 右 下 左
    let Q, ep, eps, pos, steps, epReward, history, timer = null, fast = false, learnedSaid = false;
    const alpha = 0.5, gamma = 0.92;
    function reset() {
      Q = Array.from({ length: R * C }, () => [0, 0, 0, 0]);
      ep = 0; eps = 1; pos = start.slice(); steps = 0; epReward = 0; history = []; learnedSaid = false;
    }
    reset();
    root.innerHTML = `
      <div class="w">
        <div class="rlloop"><span class="n">状态：蓝点所在格子</span>→<span class="n">动作：上下左右</span>→<span class="n r">奖励：绿 +10 · 橙 −10 · 每步 −0.1</span>→<span class="n">更新策略</span></div>
        <div class="gw-wrap">
          <div class="gw" style="grid-template-columns:repeat(${C},auto)" aria-label="网格世界"></div>
          <div class="gw-side">
            <div class="gw-stats">
              <div class="w-stat"><span class="l">回合</span><span class="v gs-ep">0</span></div>
              <div class="w-stat"><span class="l">本回合步数</span><span class="v gs-st">0</span></div>
              <div class="w-stat"><span class="l">探索率</span><span class="v gs-eps">100%</span></div>
            </div>
            <div style="display:flex;flex-direction:column;gap:4px"><span class="w-note">每回合到达终点所用步数（越低越好）</span><canvas class="gs-chart"></canvas></div>
            <div class="w-row" style="gap:8px">
              <button type="button" class="btn primary sm gs-auto">${ic.play(12)} 自动训练</button>
              <button type="button" class="btn sm gs-fast">快进 50 回合</button>
              <button type="button" class="btn sm gs-reset">${ic.reset(12)} 重置</button>
            </div>
            <label class="tgl gs-arrows" aria-pressed="true" role="button" tabindex="0"><span class="sw"></span>显示学到的策略（箭头）</label>
            <div class="w-panel gs-msg"><div class="d">蓝点还什么都不知道。点“自动训练”，看它乱走、掉坑、慢慢学会。</div></div>
          </div>
        </div>
      </div>`;
    const grid = SA.$('.gw', root);
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
      const t = cell(r, c);
      const d = document.createElement('div');
      d.className = 'gw-cell' + (t === '#' ? ' wall' : t === 'G' ? ' goal' : t === 'T' ? ' trap' : '');
      d.dataset.k = r * C + c;
      d.innerHTML = t === 'G' ? '<span class="lbl" style="color:var(--green)">+10</span>' : t === 'T' ? '<span class="lbl" style="color:var(--orange)">−10</span>' : t === 'S' ? '<span class="lbl" style="color:var(--muted)">起点</span>' : t === '#' ? '' : `<svg class="arr" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6"></path></svg>`;
      grid.appendChild(d);
    }
    const agent = SA.h(`<div class="gw-agent" aria-hidden="true"></div>`);
    grid.appendChild(agent);
    const chart = SA.$('.gs-chart', root);
    const cctx = SA.setupCanvas(chart, 320, 90);
    let showArrows = true;

    function placeAgent() {
      const el = grid.children[pos[0] * C + pos[1]];
      agent.style.transform = `translate(${el.offsetLeft + el.offsetWidth / 2 - agent.offsetWidth / 2}px, ${el.offsetTop + el.offsetHeight / 2 - agent.offsetHeight / 2}px)`;
    }
    function maxQ(k) { return Math.max(...Q[k]); }
    function paint() {
      let lo = Infinity, hi = -Infinity;
      for (let k = 0; k < R * C; k++) { const t = cell(Math.floor(k / C), k % C); if (t === '.' || t === 'S') { lo = Math.min(lo, maxQ(k)); hi = Math.max(hi, maxQ(k)); } }
      for (let k = 0; k < R * C; k++) {
        const r = Math.floor(k / C), c = k % C, t = cell(r, c);
        if (t !== '.' && t !== 'S') continue;
        const el = grid.children[k];
        const v = maxQ(k);
        const n = hi > lo ? (v - lo) / (hi - lo) : 0;
        el.style.background = ep === 0 ? '#fff' : `rgba(43,59,184,${0.04 + n * 0.32})`;
        const arr = SA.$('.arr', el);
        if (arr) {
          const best = Q[k].indexOf(v);
          arr.style.transform = `rotate(${best * 90}deg)`;
          arr.style.opacity = showArrows && ep > 0 && Q[k].some((q) => q !== 0) ? 0.85 : 0;
          arr.style.color = n > 0.6 ? '#fff' : 'var(--accent-ink)';
        }
      }
      SA.$('.gs-ep', root).textContent = ep;
      SA.$('.gs-st', root).textContent = steps;
      SA.$('.gs-eps', root).textContent = Math.round(eps * 100) + '%';
      drawChart();
    }
    function drawChart() {
      cctx.clearRect(0, 0, 320, 90);
      cctx.fillStyle = '#F4F5F7'; cctx.fillRect(0, 0, 320, 90);
      if (history.length < 2) return;
      const h = history.slice(-80), mx = Math.max(...h, 20);
      cctx.strokeStyle = '#2B3BB8'; cctx.lineWidth = 2; cctx.beginPath();
      h.forEach((v, i) => { const x = 6 + (i / Math.max(h.length - 1, 1)) * 308, y = 84 - (v / mx) * 76; i ? cctx.lineTo(x, y) : cctx.moveTo(x, y); });
      cctx.stroke();
      cctx.fillStyle = '#5A6070'; cctx.font = '11px JetBrains Mono, monospace';
      cctx.fillText(mx + ' 步', 6, 12);
    }
    function stepOnce() {
      const k = pos[0] * C + pos[1];
      let a;
      if (Math.random() < eps) a = Math.floor(Math.random() * 4);
      else { const m = maxQ(k); const best = [0, 1, 2, 3].filter((i) => Q[k][i] === m); a = best[Math.floor(Math.random() * best.length)]; }
      let nr = pos[0] + A[a][0], nc = pos[1] + A[a][1];
      if (nr < 0 || nr >= R || nc < 0 || nc >= C || cell(nr, nc) === '#') { nr = pos[0]; nc = pos[1]; }
      const t = cell(nr, nc);
      const rew = t === 'G' ? 10 : t === 'T' ? -10 : -0.1;
      const nk = nr * C + nc;
      const done = t === 'G' || t === 'T';
      const target = rew + (done ? 0 : gamma * maxQ(nk));
      Q[k][a] += alpha * (target - Q[k][a]);
      pos = [nr, nc]; steps++; epReward += rew;
      if (done || steps > 120) {
        history.push(t === 'G' ? steps : 120);
        ep++; eps = Math.max(0.05, eps * 0.93);
        const reached = t === 'G';
        pos = start.slice(); steps = 0; epReward = 0;
        return reached ? 'goal' : 'end';
      }
      return null;
    }
    function msg(t) { SA.$('.gs-msg', root).innerHTML = `<div class="d fade-swap">${t}</div>`; }
    function checkLearned() {
      const last = history.slice(-5);
      if (!learnedSaid && last.length === 5 && last.every((v) => v <= 14)) {
        learnedSaid = true;
        msg(`第 ${ep} 回合起，它几乎每次都走最短路线了！没人告诉过它路线，它是靠<b>奖励</b>自己找到的。`);
        ctx.say(`它学会了！大约 ${ep} 个回合后，蓝点就稳定地走最短路线、绕开陷阱。注意右边的箭头——那就是它学到的<b>策略</b>：在每个格子里该往哪走。`);
      }
    }
    function tick() {
      const res = stepOnce();
      placeAgent();
      if (res) {
        paint();
        if (res === 'goal' && ep < 6) msg(`第 ${ep} 回合：碰巧走到了终点！这次的经验会让附近格子的价值上升。`);
        else if (ep < 6) msg(`第 ${ep} 回合：掉进陷阱或走太久了。没关系，失败也是经验。`);
        checkLearned();
      } else {
        SA.$('.gs-st', root).textContent = steps;
      }
    }
    function stop() { clearInterval(timer); timer = null; SA.$('.gs-auto', root).innerHTML = ic.play(12) + ' 自动训练'; }
    SA.$('.gs-auto', root).addEventListener('click', (e) => {
      if (timer) return stop();
      e.currentTarget.innerHTML = ic.pause(12) + ' 暂停';
      timer = setInterval(tick, ep > 30 ? 60 : 90);
    });
    SA.$('.gs-fast', root).addEventListener('click', () => {
      stop();
      const target = ep + 50;
      while (ep < target) stepOnce();
      pos = start.slice(); placeAgent(); paint();
      msg(`快进到第 ${ep} 回合。现在的探索率只有 ${Math.round(eps * 100)}%：它主要按学到的策略走了。再点“自动训练”看看它怎么走。`);
      checkLearned();
    });
    SA.$('.gs-reset', root).addEventListener('click', () => { stop(); reset(); placeAgent(); paint(); msg('已重置：蓝点忘掉了一切。'); });
    const tg = SA.$('.gs-arrows', root);
    const toggleArrows = () => { showArrows = !showArrows; tg.setAttribute('aria-pressed', showArrows); paint(); };
    tg.addEventListener('click', toggleArrows);
    tg.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleArrows(); } });
    requestAnimationFrame(() => { placeAgent(); paint(); });
    window.addEventListener('resize', placeAgent);
    return () => { stop(); window.removeEventListener('resize', placeAgent); };
  };

  /* ---------- 人工神经元 ---------- */
  W.neuron = function (root, ctx) {
    const inputs = [
      { n: '天气好', x: 1, w: 1.5 },
      { n: '今天有空', x: 1, w: 2.0 },
      { n: '很累', x: 0, w: -2.5 }
    ];
    let b = -1.5, said = false;
    const sig = (z) => 1 / (1 + Math.exp(-z));
    root.innerHTML = `
      <div class="w">
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;font-size:12px;color:var(--muted);text-align:center">
          <div style="padding:6px;border-radius:8px;background:var(--bg)"><b style="color:var(--ink)">树突</b> · 接收信号 ↔ 输入 x</div>
          <div style="padding:6px;border-radius:8px;background:var(--bg)"><b style="color:var(--ink)">细胞核</b> · 处理信号 ↔ 加权求和 + 激活</div>
          <div style="padding:6px;border-radius:8px;background:var(--bg)"><b style="color:var(--ink)">轴突</b> · 发射信号 ↔ 输出 y</div>
        </div>
        <svg class="neuron-svg" viewBox="0 0 640 260" role="img" aria-label="人工神经元示意图"></svg>
        <div class="w-grid2">
          ${inputs.map((p, i) => `
            <div style="display:flex;flex-direction:column;gap:8px;padding:12px;border-radius:10px;background:var(--bg)">
              <div class="w-row" style="justify-content:space-between"><b style="font-size:14px">${p.n}</b>
                <span class="seg" role="group" aria-label="${p.n}"><button type="button" data-i="${i}" data-x="0" aria-pressed="${p.x === 0}">否 0</button><button type="button" data-i="${i}" data-x="1" aria-pressed="${p.x === 1}">是 1</button></span></div>
              <div class="slider"><label for="nw${i}"><span>权重 w${i + 1}</span><span class="mono nw-v${i}">${p.w.toFixed(1)}</span></label><input id="nw${i}" type="range" min="-3" max="3" step="0.1" value="${p.w}" data-w="${i}"></div>
            </div>`).join('')}
          <div style="display:flex;flex-direction:column;gap:8px;padding:12px;border-radius:10px;background:var(--bg)">
            <b style="font-size:14px">偏置 b（天生的倾向）</b>
            <div class="slider"><label for="nb"><span>b</span><span class="mono nb-v">${b.toFixed(1)}</span></label><input id="nb" type="range" min="-3" max="3" step="0.1" value="${b}"></div>
          </div>
        </div>
        <div class="formula nf"></div>
      </div>`;
    const svg = SA.$('.neuron-svg', root);
    function render() {
      const z = inputs.reduce((s, p) => s + p.x * p.w, 0) + b;
      const y = sig(z);
      const ys = [50, 130, 210];
      let s = '';
      inputs.forEach((p, i) => {
        const col = p.w >= 0 ? '#2B3BB8' : '#E07A1F';
        const width = 1 + Math.abs(p.w) * 2.2;
        s += `<line x1="120" y1="${ys[i]}" x2="300" y2="130" stroke="${col}" stroke-width="${width}" stroke-opacity="${p.x ? 0.9 : 0.2}" class="${p.x ? 'flow' : ''}"></line>`;
        s += `<text x="205" y="${(ys[i] + 130) / 2 - 8}" font-size="12" fill="${col}" font-family="JetBrains Mono" text-anchor="middle">w=${p.w.toFixed(1)}</text>`;
        s += `<circle cx="96" cy="${ys[i]}" r="24" fill="${p.x ? '#2B3BB8' : '#fff'}" stroke="#C8CDD8" stroke-width="2"></circle>`;
        s += `<text x="96" y="${ys[i] + 5}" text-anchor="middle" font-size="14" fill="${p.x ? '#fff' : '#5A6070'}" font-family="JetBrains Mono">${p.x}</text>`;
        s += `<text x="62" y="${ys[i] + 5}" text-anchor="end" font-size="13" fill="#3A3F4B">${p.n}</text>`;
      });
      s += `<line x1="356" y1="130" x2="450" y2="130" stroke="#14161C" stroke-width="2"></line>`;
      s += `<circle cx="328" cy="130" r="30" fill="#14161C"></circle><text x="328" y="137" text-anchor="middle" font-size="20" fill="#fff">Σ</text>`;
      s += `<text x="328" y="185" text-anchor="middle" font-size="12" fill="#5A6070" font-family="JetBrains Mono">z=${z.toFixed(2)}</text>`;
      // 激活函数小图
      s += `<rect x="372" y="88" width="64" height="44" rx="6" fill="#F4F5F7"></rect>`;
      let path = '';
      for (let i = 0; i <= 32; i++) { const zz = -6 + (i / 32) * 12; const xx = 374 + (i / 32) * 60; const yy = 128 - sig(zz) * 36; path += (i ? 'L' : 'M') + xx.toFixed(1) + ' ' + yy.toFixed(1); }
      s += `<path d="${path}" fill="none" stroke="#9AA0AE" stroke-width="1.5"></path>`;
      const pz = SA.clamp(z, -6, 6);
      s += `<circle cx="${374 + ((pz + 6) / 12) * 60}" cy="${128 - sig(pz) * 36}" r="4" fill="#2B3BB8"></circle>`;
      s += `<text x="404" y="150" text-anchor="middle" font-size="11" fill="#5A6070">φ 激活</text>`;
      const out = y >= 0.5;
      s += `<circle cx="490" cy="130" r="34" fill="rgba(43,59,184,${0.12 + y * 0.88})" stroke="#2B3BB8" stroke-width="2"></circle>`;
      s += `<text x="490" y="136" text-anchor="middle" font-size="16" fill="${y > 0.5 ? '#fff' : '#14161C'}" font-family="JetBrains Mono">${y.toFixed(2)}</text>`;
      s += `<text x="490" y="190" text-anchor="middle" font-size="15" font-weight="700" fill="${out ? '#1F8A5B' : '#A1460C'}">${out ? '去跑步！' : '不去了'}</text>`;
      s += `<text x="560" y="136" font-size="12" fill="#5A6070">y</text>`;
      svg.innerHTML = s;
      SA.$('.nf', root).innerHTML = `y = φ( ${inputs.map((p, i) => `${p.w.toFixed(1)}×${p.x}`).join(' + ')} + (${b.toFixed(1)}) ) = φ(${z.toFixed(2)}) = <b>${y.toFixed(2)}</b>`;
      if (!said && inputs[2].x === 1 && out) {
        said = true;
        ctx.say('有意思：你让它在“很累”的时候也去跑步了。说明你调高了其他权重，或者让“很累”的负权重变小了——<b>权重就是这个神经元的价值观</b>。');
      }
    }
    SA.$$('[data-x]', root).forEach((bt) => bt.addEventListener('click', () => {
      const i = +bt.dataset.i; inputs[i].x = +bt.dataset.x;
      SA.$$(`[data-i="${i}"]`, root).forEach((x) => x.setAttribute('aria-pressed', x === bt));
      render();
    }));
    SA.$$('[data-w]', root).forEach((inp) => inp.addEventListener('input', () => {
      const i = +inp.dataset.w; inputs[i].w = +inp.value; SA.$('.nw-v' + i, root).textContent = inputs[i].w.toFixed(1); render();
    }));
    SA.$('#nb', root).addEventListener('input', (e) => { b = +e.target.value; SA.$('.nb-v', root).textContent = b.toFixed(1); render(); });
    render();
  };
})();
