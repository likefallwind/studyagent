/* 第 4 章互动组件 */
(function () {
  const SA = window.SA, W = SA.widgets, ic = SA.ic;
  const BLUE = '#2B3BB8', ORANGE = '#E07A1F', INK = '#14161C', MUTED = '#5A6070';

  function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
  function gauss(r) { let u = 0, v = 0; while (!u) u = r(); while (!v) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }

  /* ---------- 神经网络游乐场（浏览器内真实训练） ---------- */
  function makeData(kind, seed) {
    const r = rng(seed), pts = [];
    if (kind === 'xor') {
      [[-0.5, -0.5, 0], [0.5, 0.5, 0], [-0.5, 0.5, 1], [0.5, -0.5, 1]].forEach(([cx, cy, y]) => {
        for (let i = 0; i < 40; i++) pts.push({ x: [SA.clamp(cx + gauss(r) * 0.17, -0.98, 0.98), SA.clamp(cy + gauss(r) * 0.17, -0.98, 0.98)], y });
      });
    } else if (kind === 'circle') {
      for (let i = 0; i < 160; i++) {
        const inner = i % 2 === 0, a = r() * Math.PI * 2, rad = inner ? r() * 0.38 : 0.6 + r() * 0.3;
        pts.push({ x: [Math.cos(a) * rad, Math.sin(a) * rad], y: inner ? 1 : 0 });
      }
    } else {
      for (let i = 0; i < 160; i++) { const y = i % 2; pts.push({ x: [SA.clamp((y ? 0.45 : -0.45) + gauss(r) * 0.22, -0.98, 0.98), SA.clamp(gauss(r) * 0.45, -0.98, 0.98)], y }); }
    }
    return pts;
  }
  function Net(sizes, seed) {
    const r = rng(seed);
    this.sizes = sizes;
    this.W = []; this.b = [];
    for (let l = 1; l < sizes.length; l++) {
      const s = Math.sqrt(1 / sizes[l - 1]) * 1.6;
      this.W.push(Array.from({ length: sizes[l] }, () => Array.from({ length: sizes[l - 1] }, () => gauss(r) * s)));
      this.b.push(Array.from({ length: sizes[l] }, () => 0));
    }
  }
  Net.prototype.forward = function (x) {
    const acts = [x];
    let a = x;
    for (let l = 0; l < this.W.length; l++) {
      const last = l === this.W.length - 1;
      a = this.W[l].map((row, j) => { let z = this.b[l][j]; for (let i = 0; i < row.length; i++) z += row[i] * a[i]; return last ? 1 / (1 + Math.exp(-z)) : Math.tanh(z); });
      acts.push(a);
    }
    return acts;
  };
  Net.prototype.train = function (data, lr) {
    const L = this.W.length;
    const gW = this.W.map((m) => m.map((row) => row.map(() => 0)));
    const gb = this.b.map((v) => v.map(() => 0));
    let loss = 0, correct = 0;
    for (const d of data) {
      const acts = this.forward(d.x);
      const out = acts[L][0];
      loss += -(d.y * Math.log(out + 1e-9) + (1 - d.y) * Math.log(1 - out + 1e-9));
      if ((out >= 0.5 ? 1 : 0) === d.y) correct++;
      let delta = [out - d.y];
      for (let l = L - 1; l >= 0; l--) {
        const aPrev = acts[l];
        for (let j = 0; j < delta.length; j++) { gb[l][j] += delta[j]; for (let i = 0; i < aPrev.length; i++) gW[l][j][i] += delta[j] * aPrev[i]; }
        if (l > 0) {
          const nd = aPrev.map((a, i) => { let s = 0; for (let j = 0; j < delta.length; j++) s += this.W[l][j][i] * delta[j]; return s * (1 - a * a); });
          delta = nd;
        }
      }
    }
    const n = data.length;
    for (let l = 0; l < L; l++) for (let j = 0; j < this.W[l].length; j++) { this.b[l][j] -= lr * gb[l][j] / n; for (let i = 0; i < this.W[l][j].length; i++) this.W[l][j][i] -= lr * gW[l][j][i] / n; }
    return { loss: loss / n, acc: correct / n };
  };

  W.mlp = function (root, ctx) {
    let ds = 'xor', layers = 1, width = 4, net, data, epoch = 0, timer = null, last = { loss: 0, acc: 0 }, xorSaid = false, solveSaid = false;
    const S = 300;
    root.innerHTML = `
      <div class="w">
        <div class="w-row">
          <button type="button" class="btn sm dark nn-preset">1969 重现：感知机 vs XOR</button>
          <button type="button" class="btn sm nn-fix">${ic.spark(12)} 加一层隐藏层</button>
        </div>
        <div class="w-row">
          <span class="seg nn-ds" role="group" aria-label="数据集"><button type="button" data-d="xor" aria-pressed="true">异或 XOR</button><button type="button" data-d="circle" aria-pressed="false">圆环</button><button type="button" data-d="line" aria-pressed="false">线性可分</button></span>
          <span class="seg nn-l" role="group" aria-label="隐藏层数"><button type="button" data-l="0" aria-pressed="false">0 层隐藏</button><button type="button" data-l="1" aria-pressed="true">1 层</button><button type="button" data-l="2" aria-pressed="false">2 层</button></span>
          <div class="slider" style="max-width:170px"><label for="nnw"><span>每层神经元</span><span class="mono nnw-v">4</span></label><input id="nnw" type="range" min="2" max="8" step="1" value="4"></div>
        </div>
        <div class="pg">
          <div style="display:flex;flex-direction:column;gap:6px"><span class="w-note">数据与决策边界（背景色 = 网络的判断）</span><canvas class="nn-c" aria-label="决策边界"></canvas></div>
          <div style="display:flex;flex-direction:column;gap:6px"><span class="w-note">网络结构（线越粗权重越大；蓝正橙负）</span><svg class="pg-net nn-svg" viewBox="0 0 300 220" role="img" aria-label="网络结构图"></svg>
            <div class="w-row" style="gap:20px"><div class="w-stat"><span class="l">训练轮数</span><span class="v nn-ep">0</span></div><div class="w-stat"><span class="l">损失</span><span class="v nn-loss">–</span></div><div class="w-stat"><span class="l">准确率</span><span class="v nn-acc">–</span></div></div>
          </div>
        </div>
        <div class="w-row"><button type="button" class="btn primary sm nn-train">${ic.play(12)} 开始训练</button><button type="button" class="btn sm nn-reset">${ic.reset(12)} 重新初始化</button></div>
        <div class="w-panel nn-msg"><div class="d">这是一个在你浏览器里<b>真实训练</b>的神经网络（tanh 激活 + 反向传播 + 梯度下降）。</div></div>
      </div>`;
    const cv = SA.$('.nn-c', root), g = SA.setupCanvas(cv, S, S), svg = SA.$('.nn-svg', root);
    function build() {
      const sizes = [2].concat(Array(layers).fill(width), [1]);
      net = new Net(sizes, 42 + layers * 7 + width);
      data = makeData(ds, ds === 'xor' ? 9 : ds === 'circle' ? 4 : 2);
      epoch = 0; last = net.train(data, 0);
      draw(); drawNet(); stats();
    }
    function draw() {
      const step = 6;
      for (let px = 0; px < S; px += step) for (let py = 0; py < S; py += step) {
        const x = [(px + step / 2) / S * 2 - 1, 1 - (py + step / 2) / S * 2];
        const o = net.forward(x)[net.W.length][0];
        const t = Math.abs(o - 0.5) * 2;
        g.fillStyle = o >= 0.5 ? `rgba(224,122,31,${0.1 + t * 0.4})` : `rgba(43,59,184,${0.1 + t * 0.4})`;
        g.fillRect(px, py, step, step);
      }
      data.forEach((d) => { g.beginPath(); g.arc((d.x[0] + 1) / 2 * S, (1 - d.x[1]) / 2 * S, 3.6, 0, 7); g.fillStyle = d.y ? ORANGE : BLUE; g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 1.2; g.stroke(); });
    }
    function drawNet() {
      const sizes = net.sizes, cols = sizes.length;
      const pos = sizes.map((n, l) => Array.from({ length: n }, (_, i) => [20 + (l / (cols - 1)) * 260, 110 + (i - (n - 1) / 2) * Math.min(26, 190 / n)]));
      let s = '';
      for (let l = 0; l < net.W.length; l++) net.W[l].forEach((row, j) => row.forEach((w, i) => {
        const a = pos[l][i], bb = pos[l + 1][j];
        s += `<line x1="${a[0]}" y1="${a[1]}" x2="${bb[0]}" y2="${bb[1]}" stroke="${w >= 0 ? BLUE : ORANGE}" stroke-opacity="${Math.min(0.9, 0.15 + Math.abs(w) * 0.25)}" stroke-width="${Math.min(5, 0.5 + Math.abs(w) * 1.1).toFixed(2)}"></line>`;
      }));
      pos.forEach((col, l) => col.forEach((p) => { s += `<circle cx="${p[0]}" cy="${p[1]}" r="8" fill="${l === 0 ? '#fff' : l === cols - 1 ? INK : '#fff'}" stroke="${INK}" stroke-width="1.5"></circle>`; }));
      s += `<text x="20" y="214" font-size="10" fill="${MUTED}" text-anchor="middle">输入</text><text x="280" y="214" font-size="10" fill="${MUTED}" text-anchor="middle">输出</text>`;
      if (layers) s += `<text x="150" y="214" font-size="10" fill="${MUTED}" text-anchor="middle">隐藏层</text>`;
      svg.innerHTML = s;
    }
    function stats() {
      SA.$('.nn-ep', root).textContent = epoch;
      SA.$('.nn-loss', root).textContent = last.loss.toFixed(3);
      SA.$('.nn-acc', root).textContent = Math.round(last.acc * 100) + '%';
    }
    function msg(t) { SA.$('.nn-msg', root).innerHTML = `<div class="d fade-swap">${t}</div>`; }
    function stop() { clearInterval(timer); timer = null; SA.$('.nn-train', root).innerHTML = ic.play(12) + ' 开始训练'; }
    function sync() {
      SA.$$('.nn-ds button', root).forEach((b) => b.setAttribute('aria-pressed', b.dataset.d === ds));
      SA.$$('.nn-l button', root).forEach((b) => b.setAttribute('aria-pressed', +b.dataset.l === layers));
    }
    SA.$('.nn-train', root).addEventListener('click', (e) => {
      if (timer) return stop();
      e.currentTarget.innerHTML = ic.pause(12) + ' 暂停';
      const lr = layers ? 0.5 : 0.8;
      timer = setInterval(() => {
        for (let k = 0; k < 8; k++) { last = net.train(data, lr); epoch++; }
        draw(); stats();
        if (epoch % 64 === 0) drawNet();
        if (ds === 'xor' && layers === 0 && epoch >= 400 && !xorSaid) {
          xorSaid = true; stop(); drawNet();
          msg(`训练了 ${epoch} 轮，准确率还卡在 ${Math.round(last.acc * 100)}% 左右。不管训练多久，<b>一条直线</b>都分不开对角线上的两类点。这就是 1969 年让神经网络陷入低谷的 XOR 问题。点“加一层隐藏层”试试。`);
          ctx.say('看到了吗？没有隐藏层的感知机，在 XOR 上怎么训练都学不会——决策边界永远是一条直线。1969 年，明斯基正是指出了这一点。现在<b>加一层隐藏层</b>。');
        }
        if (last.acc >= 0.97 && epoch > 40) {
          stop(); drawNet();
          msg(`在第 ${epoch} 轮达到 ${Math.round(last.acc * 100)}% 准确率！看看背景的决策边界——它${layers ? '弯折' : '是一条直线'}了。${layers && ds === 'xor' ? '隐藏层让网络能把平面“折”起来，这就是多层网络的威力。' : ''}`);
          if (layers && ds === 'xor' && !solveSaid) { solveSaid = true; ctx.say('解决了！只加了一层隐藏层、几个神经元，XOR 就被攻克了。这背后靠的是<b>反向传播</b>——1986 年它被推广之后，多层网络才真正训练得动。'); }
        }
        if (epoch > 3000) stop();
      }, 30);
    });
    SA.$('.nn-reset', root).addEventListener('click', () => { stop(); build(); msg('网络权重已随机重置。'); });
    SA.$('.nn-preset', root).addEventListener('click', () => { stop(); ds = 'xor'; layers = 0; sync(); build(); msg('1969 年的场景：<b>单层感知机</b>（没有隐藏层）+ <b>XOR 数据</b>。点“开始训练”，看看会发生什么。'); });
    SA.$('.nn-fix', root).addEventListener('click', () => { stop(); layers = Math.max(1, layers); sync(); build(); msg('现在网络有了 1 层隐藏层。再点“开始训练”。'); });
    SA.$$('.nn-ds button', root).forEach((b) => b.addEventListener('click', () => { stop(); ds = b.dataset.d; sync(); build(); }));
    SA.$$('.nn-l button', root).forEach((b) => b.addEventListener('click', () => { stop(); layers = +b.dataset.l; sync(); build(); }));
    SA.$('#nnw', root).addEventListener('input', (e) => { stop(); width = +e.target.value; SA.$('.nnw-v', root).textContent = width; build(); });
    build();
    return stop;
  };

  /* ---------- 发展史曲线 ---------- */
  W.history = function (root, ctx) {
    const schools = { s: { n: '符号主义', c: '#1F8A5B' }, c: { n: '连接主义', c: '#2B3BB8' }, b: { n: '行为主义', c: '#7B4FC9' }, m: { n: '统计学习', c: '#E07A1F' }, x: { n: '里程碑 · 产业', c: '#14161C' } };
    const ev = [
      [1950, 'x', '图灵测试', '图灵发表《计算机器与智能》，提出模仿游戏。'],
      [1956, 'x', '达特茅斯会议', '“人工智能”被正式提出，AI 成为独立学科。'],
      [1957, 'c', '感知机', '罗森布拉特提出感知机，第一个能“学习”的神经网络模型，引发巨大期待。'],
      [1966, 's', 'ELIZA', '早期聊天程序，靠关键词规则改写句子。'],
      [1969, 'c', 'XOR 问题', '明斯基与派珀特出版《感知机》，指出单层感知机无法解决异或问题——神经网络第一次低谷。'],
      [1970, 'c', '反向传播的数学推导', '自动微分（反向模式）被提出，为后来的反向传播算法奠定了数学基础。'],
      [1976, 's', '知识工程 · 专家系统', '1970 年代，MYCIN 等专家系统兴起，符号主义迎来高峰。'],
      [1979, 'c', '卷积网络雏形', '福岛邦彦提出 Neocognitron，卷积神经网络（CNN）的前身。'],
      [1986, 'c', '反向传播算法', 'Rumelhart、Hinton、Williams 推广反向传播，多层网络终于训练得动了。'],
      [1989, 'c', 'LeNet', '杨立昆用卷积网络识别手写邮政编码，后被用于银行支票识别。'],
      [1995, 'm', 'SVM 与 AdaBoost', '支持向量机、AdaBoost 等统计学习方法兴起；神经网络相比之下没有明显优势——第二次低谷。'],
      [1997, 's', '深蓝击败卡斯帕罗夫', 'IBM 深蓝靠专用硬件 + 搜索 + 专家规则，在国际象棋比赛中战胜世界冠军。'],
      [2009, 'm', 'ImageNet 数据集', '李飞飞团队推出千万级标注图片数据集，为深度学习准备好了“燃料”。'],
      [2012, 'c', 'AlexNet', 'Hinton 团队的 AlexNet 在 ImageNet 比赛中把错误率大幅降低，深度学习时代开启。'],
      [2014, 'c', 'GAN · DeepMind 被收购', '生成对抗网络（GAN）提出；Google 收购 DeepMind。'],
      [2015, 'x', 'ResNet · TensorFlow · OpenAI', '残差网络让上百层的网络可训练；TensorFlow 开源；OpenAI 成立。'],
      [2016, 'b', 'AlphaGo', 'AlphaGo 击败李世石。深度网络 + 强化学习 + 蒙特卡洛树搜索。同年 PyTorch 发布、Hugging Face 成立。'],
      [2017, 'c', 'Transformer', '《Attention Is All You Need》提出 Transformer，成为今天几乎所有大模型的基础架构。'],
      [2022, 'x', 'ChatGPT', 'ChatGPT 发布，两个月用户破亿，大模型进入大众生活。'],
      [2025, 'x', 'DeepSeek R1', '开源推理模型发布：性能强、成本低、展示推理过程。']
    ];
    // 关注度曲线控制点（示意）
    const curve = [[1950, 12], [1956, 30], [1962, 46], [1968, 52], [1972, 28], [1976, 20], [1980, 34], [1985, 54], [1988, 40], [1993, 24], [1997, 34], [2003, 36], [2009, 44], [2012, 60], [2016, 76], [2020, 82], [2022, 96], [2025, 100]];
    const X0 = 1946, X1 = 2028, VW = 900, VH = 300, top = 20, bot = 250;
    const sx = (y) => 30 + ((y - X0) / (X1 - X0)) * (VW - 50);
    const sy = (v) => bot - (v / 100) * (bot - top);
    const valAt = (yr) => { for (let i = 1; i < curve.length; i++) if (yr <= curve[i][0]) { const [a, va] = curve[i - 1], [b, vb] = curve[i]; const t = (yr - a) / (b - a); return va + (vb - va) * (0.5 - Math.cos(t * Math.PI) / 2); } return 100; };
    let d = '';
    for (let yr = 1950; yr <= 2025; yr += 0.5) d += (yr === 1950 ? 'M' : 'L') + sx(yr).toFixed(1) + ' ' + sy(valAt(yr)).toFixed(1);
    let filter = null, cur = 13;
    root.innerHTML = `
      <div class="w">
        <div class="chips hi-filter" role="group" aria-label="按流派筛选" style="gap:6px">
          <button type="button" class="pill" data-f="" aria-pressed="true" style="cursor:pointer;min-height:32px">全部</button>
          ${Object.entries(schools).map(([k, s]) => `<button type="button" class="pill" data-f="${k}" aria-pressed="false" style="cursor:pointer;min-height:32px"><i style="width:8px;height:8px;border-radius:4px;background:${s.c};display:inline-block"></i>${s.n}</button>`).join('')}
        </div>
        <div class="hist">
          <svg viewBox="0 0 ${VW} ${VH}" aria-hidden="true">
            <rect x="${sx(1969)}" y="${top}" width="${sx(1980) - sx(1969)}" height="${bot - top}" fill="#FFF4EA"></rect>
            <rect x="${sx(1991)}" y="${top}" width="${sx(2006) - sx(1991)}" height="${bot - top}" fill="#FFF4EA"></rect>
            <text x="${(sx(1969) + sx(1980)) / 2}" y="${top + 16}" text-anchor="middle" font-size="12" fill="#A1460C">第一次低谷</text>
            <text x="${(sx(1991) + sx(2006)) / 2}" y="${top + 16}" text-anchor="middle" font-size="12" fill="#A1460C">第二次低谷（神经网络）</text>
            <path d="${d} L${sx(2025)} ${bot} L${sx(1950)} ${bot} Z" fill="rgba(43,59,184,.08)"></path>
            <path d="${d}" fill="none" stroke="#2B3BB8" stroke-width="2.5"></path>
            <line x1="30" y1="${bot}" x2="${VW - 20}" y2="${bot}" stroke="#C8CDD8"></line>
            ${[1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020].map((y) => `<text x="${sx(y)}" y="${bot + 20}" text-anchor="middle" font-size="12" fill="#5A6070" font-family="JetBrains Mono">${y}</text>`).join('')}
            <text x="30" y="${top - 4}" font-size="11" fill="#5A6070">关注度（示意）</text>
          </svg>
          <div class="hist-dots">${ev.map((e, i) => `<button type="button" class="hist-dot" data-i="${i}" aria-pressed="false" aria-label="${e[0]} ${e[2]}" style="left:${(sx(e[0]) / VW) * 100}%;top:${(sy(valAt(e[0])) / VH) * 100}%;background:${schools[e[1]].c}"></button>`).join('')}</div>
        </div>
        <div class="w-panel hi-detail"></div>
        <div class="w-row"><button type="button" class="btn sm hi-prev">${ic.back(14)} 上一个</button><button type="button" class="btn sm hi-next">下一个 ${ic.arrow(14)}</button><span class="w-note">也可以用键盘 Tab 逐个浏览圆点</span></div>
      </div>`;
    const dots = SA.$$('.hist-dot', root), det = SA.$('.hi-detail', root);
    function vis(i) { return !filter || ev[i][1] === filter; }
    function render() {
      dots.forEach((b, i) => { b.setAttribute('aria-pressed', i === cur); b.classList.toggle('dim', !vis(i)); b.tabIndex = vis(i) ? 0 : -1; });
      const e = ev[cur];
      det.innerHTML = `<div class="t fade-swap"><span class="mono" style="color:${schools[e[1]].c}">${e[0]}</span> · ${e[2]} <span class="pill" style="margin-left:6px">${schools[e[1]].n}</span></div><div class="d fade-swap">${e[3]}</div>`;
    }
    dots.forEach((b) => b.addEventListener('click', () => { cur = +b.dataset.i; render(); if (ev[cur][0] === 2012) ctx.say('2012 年就是转折点。注意曲线的形状：之前几十年起起伏伏，之后几乎一路向上。', 'h2012'); }));
    const move = (dir) => { let i = cur; do { i = (i + dir + ev.length) % ev.length; } while (!vis(i)); cur = i; render(); };
    SA.$('.hi-prev', root).addEventListener('click', () => move(-1));
    SA.$('.hi-next', root).addEventListener('click', () => move(1));
    SA.$$('.hi-filter button', root).forEach((b) => b.addEventListener('click', () => {
      filter = b.dataset.f || null;
      SA.$$('.hi-filter button', root).forEach((x) => { const on = x === b; x.setAttribute('aria-pressed', on); x.classList.toggle('dark', on); });
      if (!vis(cur)) move(1); else render();
    }));
    SA.$('.hi-filter button', root).classList.add('dark');
    render();
  };

  /* ---------- ImageNet 错误率 ---------- */
  W.imagenet = function (root) {
    const rows = [['2010', '冠军（传统方法）', 28.2, 0], ['2011', '冠军（传统方法）', 25.8, 0], ['2012', 'AlexNet（深度网络）', 15.3, 1], ['2013', 'ZFNet', 11.7, 1], ['2014', 'GoogLeNet', 6.7, 1], ['2015', 'ResNet', 3.6, 1]];
    root.innerHTML = `
      <div class="w">
        <div class="scale-rows">${rows.map((r) => `<div class="scale-row"><span class="nm"><b>${r[1]}</b><span>${r[0]}</span></span><div class="track"><i style="width:0;background:${r[3] ? 'var(--accent)' : 'var(--faint)'}" data-w="${(r[2] / 30) * 100}"></i></div><span class="num">${r[2]}%</span></div>`).join('')}
          <div class="scale-row"><span class="nm"><b>人类（参考）</b><span>估计值</span></span><div class="track" style="position:relative"><i style="width:${(5.1 / 30) * 100}%;background:var(--amber)"></i></div><span class="num">≈ 5.1%</span></div>
        </div>
        <div class="w-panel"><div class="d">2012 年 AlexNet 的错误率比第二名（26.2%）低了约 11 个百分点，在一个通常每年只进步一两个点的比赛里，这是断层式领先。三年后，ResNet 的成绩已经超过了人类的估计水平。</div></div>
      </div>`;
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { SA.$$('[data-w]', root).forEach((i) => (i.style.width = i.dataset.w + '%')); io.disconnect(); } }), { threshold: 0.3 });
    io.observe(root);
    return () => io.disconnect();
  };

  /* ---------- 参数量军备竞赛（对数刻度） ---------- */
  W.scaleRace = function (root) {
    const ms = [
      ['LeNet-5', 1998, 6e4], ['AlexNet', 2012, 6e7], ['VGG-16', 2014, 1.38e8], ['ResNet-50', 2015, 2.56e7], ['ELMo', 2018, 9.4e7],
      ['BERT-large', 2018, 3.4e8], ['GPT-2', 2019, 1.5e9], ['GPT-3', 2020, 1.75e11], ['DeepSeek-V3 / R1', 2025, 6.71e11]
    ];
    const fmt = (n) => n >= 1e8 ? (n / 1e8 >= 100 ? Math.round(n / 1e8) : (n / 1e8).toFixed(n / 1e8 >= 10 ? 0 : 1)) + ' 亿' : Math.round(n / 1e4) + ' 万';
    root.innerHTML = `
      <div class="w">
        <div class="scale-rows">${ms.map((m) => `<div class="scale-row"><span class="nm"><b>${m[0]}</b><span>${m[1]}</span></span><div class="track"><i style="width:0"></i></div><span class="num">${fmt(m[2])}</span></div>`).join('')}</div>
        <div class="w-panel"><div class="d">从 LeNet 到 DeepSeek-V3，参数量涨了一千多万倍。如果改用普通刻度，GPT-3 之前的模型都会细得<b>看不见</b>，这就是指数级增长。<br><span class="w-note">GPT-4 等闭源模型未公开参数量，这里不列出。DeepSeek-V3/R1 是“混合专家”结构，总参数 6710 亿，每次只激活约 370 亿。</span></div></div>
      </div>`;
    const lo = Math.log10(3e4), hi = Math.log10(6.71e11);
    function render() {
      SA.$$('.scale-row i', root).forEach((el, i) => {
        el.style.width = ((Math.log10(ms[i][2]) - lo) / (hi - lo)) * 100 + '%';
        el.style.background = i >= 6 ? 'var(--amber)' : 'var(--accent)';
      });
    }
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { render(); io.disconnect(); } }), { threshold: 0.3 });
    io.observe(root);
    return () => io.disconnect();
  };

  /* ---------- 预训练 + 微调 ---------- */
  W.pretrain = function (root) {
    const st = [
      { n: '大规模无标签数据', s: 'Large Unlabeled Data', d: '互联网上的海量文本或图片，不需要人工标注，几乎取之不尽。' },
      { a: '自监督任务' },
      { n: '预训练模型', s: '获得通用能力', d: '通过“遮住一部分让模型自己猜”这样的自监督任务，学会语言或视觉的通用规律。成本极高，但只需训练一次。' },
      { a: '+ 少量标注 · 监督学习' },
      { n: '微调模型', s: '获得预测能力', d: '在少量有标签的数据上继续训练，让模型适应具体任务：医学影像诊断、法律问答、客服……' }
    ];
    let cur = 0;
    root.innerHTML = `
      <div class="w">
        <div class="pipe">${st.map((s, i) => s.a ? `<div class="pipe-arrow"><small>${s.a}</small><span class="pk" style="animation-delay:${i * 0.3}s"></span></div>` : `<button type="button" class="pipe-node" data-i="${i}"><b>${s.n}</b><span>${s.s}</span></button>`).join('')}</div>
        <div class="w-panel pp-d"></div>
      </div>`;
    function render() {
      SA.$$('.pipe-node', root).forEach((b) => b.classList.toggle('on', +b.dataset.i === cur));
      SA.$('.pp-d', root).innerHTML = `<div class="t fade-swap">${st[cur].n}</div><div class="d fade-swap">${st[cur].d}</div>`;
    }
    SA.$$('.pipe-node', root).forEach((b) => b.addEventListener('click', () => { cur = +b.dataset.i; render(); }));
    render();
  };

  /* ---------- 中间层学到了什么 ---------- */
  W.layers = function (root, ctx) {
    const L = [
      { n: 'Conv 1', t: '边缘与颜色', d: '最浅的层只认识最简单的东西：各种方向的边缘、颜色块。', tiles: () => Array.from({ length: 9 }, (_, i) => `background:repeating-linear-gradient(${i * 20}deg, ${['#2B3BB8', '#E07A1F', '#1F8A5B', '#14161C', '#7B4FC9'][i % 5]} 0 4px, #F4F5F7 4px 9px)`) },
      { n: 'Conv 3', t: '纹理', d: '中间的层把边缘组合成纹理：网格、圆点、条纹、毛发质感。', tiles: () => ['radial-gradient(circle,#2B3BB8 30%,transparent 32%) 0 0/12px 12px,#EEF0FC', 'conic-gradient(#14161C 25%,#F4F5F7 0 50%,#14161C 0 75%,#F4F5F7 0) 0 0/14px 14px', 'repeating-radial-gradient(circle at 30% 30%,#E07A1F 0 3px,#FCEFD9 3px 7px)', 'repeating-linear-gradient(45deg,#1F8A5B 0 2px,#E6F4EE 2px 5px),repeating-linear-gradient(-45deg,#1F8A5B33 0 2px,transparent 2px 5px)', 'radial-gradient(circle at 50% 120%,#7B4FC9 20%,#F4F5F7 21% 30%,#7B4FC9 31% 40%,#F4F5F7 41%)', 'repeating-linear-gradient(90deg,#5A6070 0 1px,#E3E6EC 1px 3px)', 'radial-gradient(circle,#E9A23B 20%,transparent 22%) 0 0/10px 10px,#FFFBF3', 'linear-gradient(135deg,#2B3BB8 25%,transparent 25%) -6px 0/12px 12px,linear-gradient(225deg,#2B3BB8 25%,transparent 25%) -6px 0/12px 12px,#EEF0FC', 'repeating-conic-gradient(#14161C 0 10deg,#F4F5F7 10deg 20deg)'].map((b) => 'background:' + b) },
      { n: 'Conv 5', t: '物体部件', d: '更深的层开始认出“部件”：眼睛、鼻子、轮子、耳朵。', parts: ['眼睛', '鼻子', '耳朵', '轮子', '花瓣', '鸟喙', '爪子', '车窗', '羽毛'] },
      { n: 'FC 8', t: '物体类别', d: '最后一层综合所有线索，输出“这是什么”：猫 92%、狗 5%……', classes: [['猫', 92], ['狗', 5], ['狐狸', 2], ['汽车', 0.4], ['鸟', 0.3]] }
    ];
    let cur = 0;
    root.innerHTML = `
      <div class="w">
        <div class="seg ly-tabs" role="group" aria-label="网络层">${L.map((l, i) => `<button type="button" data-i="${i}" aria-pressed="${i === 0}">${l.n} · ${l.t}</button>`).join('')}</div>
        <div class="w-row" style="align-items:flex-start;gap:20px"><div class="ly-vis" style="flex:0 1 300px;min-width:220px"></div><div class="w-panel ly-d" style="flex:1 1 220px"></div></div>
      </div>`;
    function render() {
      const l = L[cur], v = SA.$('.ly-vis', root);
      SA.$$('.ly-tabs button', root).forEach((b) => b.setAttribute('aria-pressed', +b.dataset.i === cur));
      if (l.tiles) v.innerHTML = `<div class="layers">${l.tiles().map((s, i) => `<div style="${s};animation-delay:${i * 0.04}s"></div>`).join('')}</div>`;
      else if (l.parts) v.innerHTML = `<div class="layers">${l.parts.map((p, i) => `<div style="background:#F4F5F7;border:1px solid #E3E6EC;font-size:13px;font-weight:500;animation-delay:${i * 0.04}s">${p}</div>`).join('')}</div>`;
      else v.innerHTML = `<div class="hbars">${l.classes.map(([n, p]) => `<div class="hbar"><span>${n}</span><div class="track"><i style="width:${p}%;background:${p > 50 ? 'var(--accent)' : 'var(--faint)'}"></i></div><span class="num">${p}%</span></div>`).join('')}</div>`;
      SA.$('.ly-d', root).innerHTML = `<div class="t fade-swap">${l.n}：${l.t}</div><div class="d fade-swap">${l.d}${cur === 3 ? '<br><br>可解释性研究会追问：它真的是在看“猫”吗，还是在看背景里的沙发？' : ''}</div><div class="w-note">示意图：真实可视化来自对训练好的卷积网络逐层做特征可视化。</div>`;
    }
    SA.$$('.ly-tabs button', root).forEach((b) => b.addEventListener('click', () => { cur = +b.dataset.i; render(); if (cur === 3) ctx.say('从“边缘”到“猫”，每一层都在上一层的基础上组合出更抽象的概念。<b>没有人教它这样分层</b>——这是训练中自己形成的。', 'fc8'); }));
    render();
  };
})();
