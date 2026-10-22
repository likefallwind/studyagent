/* 第 3 章互动组件 */
(function () {
  const SA = window.SA, W = SA.widgets, ic = SA.ic;
  const BLUE = '#2B3BB8', ORANGE = '#E07A1F', GREEN = '#1F8A5B', INK = '#14161C', MUTED = '#5A6070', LINE = '#E3E6EC';

  /* 简单的可复现随机数 */
  function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
  function gauss(r) { let u = 0, v = 0; while (!u) u = r(); while (!v) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }

  /* ---------- 人类学习 vs 机器学习 ---------- */
  W.humanVsMachine = function (root, ctx) {
    const H = ['经验', '归纳', '规律', '预测', '未来'];
    const M = ['历史数据', '训练', '模型', '预测', '新数据的结果'];
    root.innerHTML = `
      <div class="w">
        <div class="flows">
          <div class="flow-row h"><span class="who">人类</span>${H.map((t, i) => i % 2 ? `<span class="flow-arrow" data-i="${i}">— ${t} →</span>` : `<span class="flow-node" data-i="${i}">${t}</span>`).join('')}</div>
          <div class="flow-row m"><span class="who">机器</span>${M.map((t, i) => i % 2 ? `<span class="flow-arrow" data-i="${i}">— ${t} →</span>` : `<span class="flow-node" data-i="${i}">${t}</span>`).join('')}</div>
        </div>
        <div class="w-row"><button type="button" class="btn primary sm hv-play">${ic.play(12)} 播放</button><span class="w-note hv-cap">例子：看过很多次乌云后下雨 → 下次看到乌云就带伞</span></div>
      </div>`;
    const caps = [
      ['人：见过很多次“乌云 → 下雨”', '机器：读入过去 10 年的气象数据'],
      ['人：在脑子里归纳', '机器：用算法训练'],
      ['人：得出规律“乌云多半会下雨”', '机器：得到一个模型 f(气压, 湿度, 云量…)'],
      ['人：用规律做预测', '机器：把今天的数据输入模型'],
      ['人：“今天要带伞”', '机器：“明天降雨概率 80%”']
    ];
    let timer = null;
    SA.$('.hv-play', root).addEventListener('click', () => {
      clearInterval(timer);
      let i = 0;
      const step = () => {
        SA.$$('[data-i]', root).forEach((el) => el.classList.toggle('on', +el.dataset.i === i));
        SA.$('.hv-cap', root).innerHTML = `<span class="fade-swap" style="display:inline-block">${caps[i][0]}　｜　${caps[i][1]}</span>`;
        i++;
        if (i >= 5) { clearInterval(timer); setTimeout(() => SA.$$('[data-i]', root).forEach((el) => el.classList.add('on')), 1100); }
      };
      step();
      timer = setInterval(step, 1300);
    });
    return () => clearInterval(timer);
  };

  /* ---------- AI ⊃ ML ⊃ DL ---------- */
  W.aiCircles = function (root, ctx) {
    const rings = [
      { k: 0, n: '人工智能', d: '机器展现的人类智能。包括规则、搜索、学习等所有方法。', col: '#1F8A5B' },
      { k: 1, n: '机器学习', d: '利用数据得出模型，再用模型预测未来。', col: '#2B3BB8' },
      { k: 2, n: '深度学习', d: '实现机器学习的一种技术：用多层神经网络。', col: '#7B4FC9' }
    ];
    const items = [
      { t: '专家系统 MYCIN', a: 0, why: '靠专家手写的规则推理，没有从数据中学习。' },
      { t: '深蓝国际象棋', a: 0, why: '规则 + 搜索，属于 AI，但不是机器学习。' },
      { t: '垃圾邮件过滤（朴素贝叶斯）', a: 1, why: '从标好的邮件中学规律，但没用神经网络。' },
      { t: '线性回归预测房价', a: 1, why: '从数据拟合出函数，是经典的机器学习。' },
      { t: 'AlexNet 图像识别', a: 2, why: '8 层深度卷积网络。' },
      { t: 'ChatGPT', a: 2, why: '基于 Transformer 的深度神经网络。' }
    ];
    let sel = null, done = 0;
    root.innerHTML = `
      <div class="w">
        <div class="circ-wrap">
          <svg class="circ-svg" viewBox="0 0 300 300" role="group" aria-label="人工智能、机器学习、深度学习三个同心圆">
            <circle class="ring" data-k="0" cx="150" cy="150" r="140" fill="#1F8A5B" stroke="#fff" stroke-width="2" tabindex="0" role="button" aria-label="人工智能"></circle>
            <circle class="ring" data-k="1" cx="150" cy="175" r="100" fill="#2B3BB8" stroke="#fff" stroke-width="2" tabindex="0" role="button" aria-label="机器学习"></circle>
            <circle class="ring" data-k="2" cx="150" cy="205" r="58" fill="#7B4FC9" stroke="#fff" stroke-width="2" tabindex="0" role="button" aria-label="深度学习"></circle>
            <text x="150" y="48" text-anchor="middle" fill="#fff" font-size="17" font-weight="700" pointer-events="none">人工智能</text>
            <text x="150" y="112" text-anchor="middle" fill="#fff" font-size="16" font-weight="700" pointer-events="none">机器学习</text>
            <text x="150" y="211" text-anchor="middle" fill="#fff" font-size="15" font-weight="700" pointer-events="none">深度学习</text>
          </svg>
          <div style="flex:1 1 260px;display:flex;flex-direction:column;gap:12px;min-width:0">
            <div class="circ-items">${items.map((it, i) => `<button type="button" class="circ-item" data-i="${i}" aria-pressed="false">${it.t}</button>`).join('')}</div>
            <div class="w-panel circ-info"><div class="d">先点一个例子，再点左边它所属的<b>最小</b>的圈。</div></div>
          </div>
        </div>
      </div>`;
    const info = SA.$('.circ-info', root);
    SA.$$('.circ-item', root).forEach((b) => b.addEventListener('click', () => {
      if (b.classList.contains('ok')) return;
      sel = +b.dataset.i;
      SA.$$('.circ-item', root).forEach((x) => x.setAttribute('aria-pressed', x === b));
      info.innerHTML = `<div class="d fade-swap">“${items[sel].t}” 属于哪个最小的圈？</div>`;
    }));
    function choose(k) {
      SA.$$('.ring', root).forEach((r) => r.classList.toggle('on', +r.dataset.k === k));
      if (sel === null) { info.innerHTML = `<div class="t fade-swap">${rings[k].n}</div><div class="d fade-swap">${rings[k].d}</div>`; return; }
      const it = items[sel], btn = SA.$(`.circ-item[data-i="${sel}"]`, root);
      if (it.a === k) {
        btn.classList.add('ok'); btn.setAttribute('aria-pressed', 'false'); btn.innerHTML = ic.check(12) + ' ' + it.t + ' · ' + rings[k].n;
        info.innerHTML = `<div class="t fade-swap" style="color:var(--green)">对！</div><div class="d fade-swap">${it.why}</div>`;
        sel = null; done++;
        if (done === items.length) ctx.say('6 个全部放对。记住这个结构：<b>深度学习 ⊂ 机器学习 ⊂ 人工智能</b>。ChatGPT 在最里面，深蓝和 MYCIN 只在最外圈。');
      } else {
        btn.classList.remove('no'); void btn.offsetWidth; btn.classList.add('no');
        info.innerHTML = `<div class="t fade-swap" style="color:var(--orange-ink)">再想想</div><div class="d fade-swap">${it.a < k ? '它没有用到“' + rings[k].n + '”的方法。往外圈试试？' : '它还能放进更小的圈里。'}</div>`;
      }
    }
    SA.$$('.ring', root).forEach((r) => {
      r.addEventListener('click', () => choose(+r.dataset.k));
      r.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(+r.dataset.k); } });
    });
  };

  /* ---------- 分类 / 回归 / 聚类 画板 ---------- */
  W.mlPlayground = function (root, ctx) {
    const CW = 560, CH = 340, PAD = 40;
    root.innerHTML = `
      <div class="w">
        <div class="w-row" style="justify-content:space-between">
          <span class="seg pg-tabs" role="group" aria-label="画板"><button type="button" data-t="cls" aria-pressed="true">分类</button><button type="button" data-t="reg" aria-pressed="false">回归</button><button type="button" data-t="clu" aria-pressed="false">无监督 · 聚类</button></span>
          <span class="pill pg-kind"></span>
        </div>
        <canvas class="pg-canvas" aria-label="数据画板"></canvas>
        <div class="pg-ctrl w-row"></div>
        <div class="w-panel pg-info"></div>
      </div>`;
    const cv = SA.$('.pg-canvas', root), g = SA.setupCanvas(cv, CW, CH);
    const ctrl = SA.$('.pg-ctrl', root), info = SA.$('.pg-info', root), kind = SA.$('.pg-kind', root);
    let tab = 'cls', cleanup = null;

    function axes(xl, yl, xr, yr, fmtx, fmty) {
      g.strokeStyle = LINE; g.lineWidth = 1; g.fillStyle = MUTED; g.font = '11px JetBrains Mono, monospace';
      for (let i = 0; i <= 4; i++) {
        const x = PAD + (i / 4) * (CW - PAD - 12), y = CH - PAD - (i / 4) * (CH - PAD - 12);
        g.beginPath(); g.moveTo(x, 12); g.lineTo(x, CH - PAD); g.stroke();
        g.beginPath(); g.moveTo(PAD, y); g.lineTo(CW - 12, y); g.stroke();
        g.textAlign = 'center'; g.fillText(fmtx(xr[0] + (i / 4) * (xr[1] - xr[0])), x, CH - PAD + 16);
        g.textAlign = 'right'; g.fillText(fmty(yr[0] + (i / 4) * (yr[1] - yr[0])), PAD - 6, y + 4);
      }
      g.textAlign = 'center'; g.font = '12px Noto Sans SC, sans-serif'; g.fillStyle = INK;
      g.fillText(xl, (CW + PAD) / 2, CH - 6);
      g.save(); g.translate(12, (CH - PAD) / 2); g.rotate(-Math.PI / 2); g.fillText(yl, 0, 0); g.restore();
    }
    const sx = (v, r) => PAD + ((v - r[0]) / (r[1] - r[0])) * (CW - PAD - 12);
    const sy = (v, r) => CH - PAD - ((v - r[0]) / (r[1] - r[0])) * (CH - PAD - 12);
    const ix = (px, r) => r[0] + ((px - PAD) / (CW - PAD - 12)) * (r[1] - r[0]);
    const iy = (py, r) => r[0] + ((CH - PAD - py) / (CH - PAD - 12)) * (r[1] - r[0]);

    /* 分类：KNN */
    function cls() {
      const XR = [1.45, 1.95], YR = [40, 120];
      const r = rng(7);
      let pts = [];
      for (let i = 0; i < 36; i++) { const h = 1.5 + r() * 0.4, w = 45 + r() * 70; pts.push({ x: h, y: w, c: w / (h * h) >= 28 ? 1 : 0 }); }
      let brush = 1, q = { x: 1.65, y: 100 }, drag = false, K = 5;
      kind.textContent = '监督学习 · 有标签';
      ctrl.innerHTML = `
        <span class="seg" role="group" aria-label="新数据的标签"><button type="button" data-b="0" aria-pressed="false">点击添加：正常</button><button type="button" data-b="1" aria-pressed="true">点击添加：肥胖</button></span>
        <div class="slider" style="max-width:200px"><label for="pgk"><span>K（看最近几个邻居）</span><span class="mono pgk-v">5</span></label><input id="pgk" type="range" min="1" max="9" step="2" value="5"></div>
        <button type="button" class="btn sm pg-clear">清空数据</button>`;
      function predict(x, y) {
        if (!pts.length) return null;
        const d = pts.map((p) => ({ p, d: Math.hypot((p.x - x) / 0.5, (p.y - y) / 80) })).sort((a, b) => a.d - b.d).slice(0, K);
        return d.filter((v) => v.p.c === 1).length / d.length;
      }
      function draw() {
        g.clearRect(0, 0, CW, CH);
        const step = 10;
        for (let px = PAD; px < CW - 12; px += step) for (let py = 12; py < CH - PAD; py += step) {
          const p = predict(ix(px + step / 2, XR), iy(py + step / 2, YR));
          if (p === null) continue;
          g.fillStyle = p >= 0.5 ? `rgba(224,122,31,${0.08 + (p - 0.5) * 0.3})` : `rgba(43,59,184,${0.08 + (0.5 - p) * 0.3})`;
          g.fillRect(px, py, step, step);
        }
        axes('身高（米）', '体重（千克）', XR, YR, (v) => v.toFixed(2), (v) => Math.round(v));
        pts.forEach((p) => { g.beginPath(); g.arc(sx(p.x, XR), sy(p.y, YR), 5.5, 0, 7); g.fillStyle = p.c ? ORANGE : BLUE; g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 1.5; g.stroke(); });
        // 查询点（五角星）
        const qx = sx(q.x, XR), qy = sy(q.y, YR);
        g.beginPath();
        for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? 5 : 12; g.lineTo(qx + Math.cos(a) * rr, qy + Math.sin(a) * rr); }
        g.closePath(); g.fillStyle = INK; g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 2; g.stroke();
        const p = predict(q.x, q.y);
        const lab = p === null ? '没有数据，无法判断' : p >= 0.5 ? '肥胖' : '正常';
        info.innerHTML = `<div class="t">★ 身高 ${q.x.toFixed(2)} m，体重 ${Math.round(q.y)} kg → 模型判断：<span style="color:${p >= 0.5 ? 'var(--orange-ink)' : 'var(--accent)'}">${lab}</span></div><div class="d">背景颜色就是模型对每个位置的判断（KNN：看最近的 ${K} 个邻居投票）。<b>拖动黑色星星</b>换个人试试；也可以点击空白处添加新数据，看边界怎么变。蓝 = 正常，橙 = 肥胖（BMI ≥ 28）。</div>`;
      }
      function down(e) {
        const pt = SA.canvasPoint(cv, e, CW, CH);
        if (Math.hypot(pt.x - sx(q.x, XR), pt.y - sy(q.y, YR)) < 18) { drag = true; cv.setPointerCapture(e.pointerId); return; }
        if (pt.x < PAD || pt.y > CH - PAD) return;
        pts.push({ x: ix(pt.x, XR), y: iy(pt.y, YR), c: brush }); draw();
      }
      function move(e) {
        const pt = SA.canvasPoint(cv, e, CW, CH);
        cv.style.cursor = Math.hypot(pt.x - sx(q.x, XR), pt.y - sy(q.y, YR)) < 18 || drag ? 'grab' : 'crosshair';
        if (!drag) return;
        q = { x: SA.clamp(ix(pt.x, XR), XR[0], XR[1]), y: SA.clamp(iy(pt.y, YR), YR[0], YR[1]) }; draw();
      }
      const up = () => { drag = false; };
      cv.addEventListener('pointerdown', down); cv.addEventListener('pointermove', move); cv.addEventListener('pointerup', up);
      SA.$$('[data-b]', ctrl).forEach((b) => b.addEventListener('click', () => { brush = +b.dataset.b; SA.$$('[data-b]', ctrl).forEach((x) => x.setAttribute('aria-pressed', x === b)); }));
      SA.$('#pgk', ctrl).addEventListener('input', (e) => { K = +e.target.value; SA.$('.pgk-v', ctrl).textContent = K; draw(); });
      SA.$('.pg-clear', ctrl).addEventListener('click', () => { pts = []; draw(); });
      draw();
      return () => { cv.removeEventListener('pointerdown', down); cv.removeEventListener('pointermove', move); cv.removeEventListener('pointerup', up); };
    }

    /* 回归：最小二乘 */
    function reg() {
      const XR = [30, 150], YR = [0, 1200];
      const r = rng(11);
      let pts = [];
      for (let i = 0; i < 14; i++) { const a = 40 + r() * 100; pts.push({ x: a, y: a * 6.6 + 40 + gauss(r) * 60 }); }
      let qa = 90;
      kind.textContent = '监督学习 · 有标签';
      ctrl.innerHTML = `
        <div class="slider" style="max-width:260px"><label for="pga"><span>想买的房子面积</span><span class="mono pga-v">90 m²</span></label><input id="pga" type="range" min="30" max="150" step="1" value="90"></div>
        <button type="button" class="btn sm pg-undo">撤销一个点</button><span class="w-note">点击画板添加一套“已成交”的房子</span>`;
      function fit() {
        const n = pts.length; if (n < 2) return null;
        const mx = pts.reduce((s, p) => s + p.x, 0) / n, my = pts.reduce((s, p) => s + p.y, 0) / n;
        let num = 0, den = 0; pts.forEach((p) => { num += (p.x - mx) * (p.y - my); den += (p.x - mx) ** 2; });
        const w = den ? num / den : 0; return { w, b: my - w * mx };
      }
      function draw() {
        g.clearRect(0, 0, CW, CH);
        axes('面积（平方米）', '总价（万元）', XR, YR, (v) => Math.round(v), (v) => Math.round(v));
        const f = fit();
        if (f) {
          pts.forEach((p) => { g.strokeStyle = 'rgba(224,122,31,.45)'; g.lineWidth = 1; g.beginPath(); g.moveTo(sx(p.x, XR), sy(p.y, YR)); g.lineTo(sx(p.x, XR), sy(f.w * p.x + f.b, YR)); g.stroke(); });
          g.strokeStyle = BLUE; g.lineWidth = 2.5; g.beginPath(); g.moveTo(sx(XR[0], XR), sy(f.w * XR[0] + f.b, YR)); g.lineTo(sx(XR[1], XR), sy(f.w * XR[1] + f.b, YR)); g.stroke();
        }
        pts.forEach((p) => { g.beginPath(); g.arc(sx(p.x, XR), sy(p.y, YR), 5.5, 0, 7); g.fillStyle = INK; g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 1.5; g.stroke(); });
        if (f) {
          const py = f.w * qa + f.b, X = sx(qa, XR), Y = sy(py, YR);
          g.setLineDash([4, 4]); g.strokeStyle = GREEN; g.lineWidth = 1.5;
          g.beginPath(); g.moveTo(X, CH - PAD); g.lineTo(X, Y); g.lineTo(PAD, Y); g.stroke(); g.setLineDash([]);
          g.beginPath(); g.arc(X, Y, 7, 0, 7); g.fillStyle = GREEN; g.fill();
          info.innerHTML = `<div class="t">模型：总价 ≈ ${f.w.toFixed(2)} × 面积 ${f.b >= 0 ? '+' : '−'} ${Math.abs(f.b).toFixed(0)}　→　${qa} m² 预测 <span style="color:var(--green)">${Math.round(py)} 万元</span></div><div class="d">蓝线是根据黑点“学”出来的模型（最小二乘拟合），橙色细线是每个样本的误差。预测的是一个<b>连续的数值</b>，所以这是回归。数据为虚构示例。</div>`;
        } else info.innerHTML = '<div class="d">至少需要 2 个点才能拟合一条直线。</div>';
      }
      const down = (e) => { const pt = SA.canvasPoint(cv, e, CW, CH); if (pt.x < PAD || pt.y > CH - PAD) return; pts.push({ x: ix(pt.x, XR), y: iy(pt.y, YR) }); draw(); };
      cv.style.cursor = 'crosshair';
      cv.addEventListener('pointerdown', down);
      SA.$('#pga', ctrl).addEventListener('input', (e) => { qa = +e.target.value; SA.$('.pga-v', ctrl).textContent = qa + ' m²'; draw(); });
      SA.$('.pg-undo', ctrl).addEventListener('click', () => { pts.pop(); draw(); });
      draw();
      return () => cv.removeEventListener('pointerdown', down);
    }

    /* 聚类：K-means */
    function clu() {
      const r = rng(23), cols = [BLUE, ORANGE, GREEN, '#7B4FC9'];
      const centers = [[0.25, 0.7], [0.7, 0.75], [0.55, 0.25]];
      const pts = [];
      centers.forEach((c) => { for (let i = 0; i < 26; i++) pts.push({ x: SA.clamp(c[0] + gauss(r) * 0.08, 0.02, 0.98), y: SA.clamp(c[1] + gauss(r) * 0.08, 0.02, 0.98), a: -1 }); });
      let K = 3, cen = [], it = 0, timer = null;
      kind.textContent = '无监督学习 · 没有标签';
      ctrl.innerHTML = `
        <div class="slider" style="max-width:180px"><label for="pgc"><span>分几群 K</span><span class="mono pgc-v">3</span></label><input id="pgc" type="range" min="2" max="4" step="1" value="3"></div>
        <button type="button" class="btn sm pg-init">① 随机放中心</button>
        <button type="button" class="btn sm pg-step">② 迭代一步</button>
        <button type="button" class="btn primary sm pg-run">${ic.play(12)} 自动运行</button>`;
      const X = (v) => PAD + v * (CW - PAD - 12), Y = (v) => CH - PAD - v * (CH - PAD - 12);
      function draw() {
        g.clearRect(0, 0, CW, CH);
        g.strokeStyle = LINE; g.strokeRect(PAD, 12, CW - PAD - 12, CH - PAD - 12);
        g.fillStyle = MUTED; g.font = '12px Noto Sans SC, sans-serif'; g.textAlign = 'center';
        g.fillText('特征 1（如：每周购物次数）', (CW + PAD) / 2, CH - 12);
        g.save(); g.translate(16, (CH - PAD) / 2); g.rotate(-Math.PI / 2); g.fillText('特征 2（如：客单价）', 0, 0); g.restore();
        pts.forEach((p) => { g.beginPath(); g.arc(X(p.x), Y(p.y), 5, 0, 7); g.fillStyle = p.a < 0 ? '#9AA0AE' : cols[p.a]; g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 1.2; g.stroke(); });
        cen.forEach((c, i) => {
          g.strokeStyle = '#fff'; g.lineWidth = 6; g.beginPath(); g.moveTo(X(c[0]) - 9, Y(c[1]) - 9); g.lineTo(X(c[0]) + 9, Y(c[1]) + 9); g.moveTo(X(c[0]) + 9, Y(c[1]) - 9); g.lineTo(X(c[0]) - 9, Y(c[1]) + 9); g.stroke();
          g.strokeStyle = cols[i]; g.lineWidth = 3.5; g.stroke();
        });
        info.innerHTML = cen.length ? `<div class="t">第 ${it} 步</div><div class="d">每一步做两件事：① 每个点归到<b>最近</b>的中心（×）；② 每个中心挪到它那群点的<b>平均位置</b>。重复，直到不再变化。没有任何人告诉机器“正确答案”——它自己发现了这几群。</div>` : '<div class="d">这些点<b>没有任何标签</b>（全是灰色）。机器能自己发现它们分成几群吗？先点“随机放中心”。</div>';
      }
      function init() { cen = Array.from({ length: K }, () => [0.1 + r() * 0.8, 0.1 + r() * 0.8]); pts.forEach((p) => (p.a = -1)); it = 0; draw(); }
      function step() {
        if (!cen.length) init();
        pts.forEach((p) => { let b = 0, bd = 9; cen.forEach((c, i) => { const d = (p.x - c[0]) ** 2 + (p.y - c[1]) ** 2; if (d < bd) { bd = d; b = i; } }); p.a = b; });
        let moved = 0;
        cen = cen.map((c, i) => { const m = pts.filter((p) => p.a === i); if (!m.length) return c; const n = [m.reduce((s, p) => s + p.x, 0) / m.length, m.reduce((s, p) => s + p.y, 0) / m.length]; moved += Math.hypot(n[0] - c[0], n[1] - c[1]); return n; });
        it++; draw();
        return moved;
      }
      function stopRun() { clearInterval(timer); timer = null; const b = SA.$('.pg-run', ctrl); if (b) b.innerHTML = ic.play(12) + ' 自动运行'; }
      SA.$('#pgc', ctrl).addEventListener('input', (e) => { K = +e.target.value; SA.$('.pgc-v', ctrl).textContent = K; stopRun(); cen = []; pts.forEach((p) => (p.a = -1)); it = 0; draw(); });
      SA.$('.pg-init', ctrl).addEventListener('click', () => { stopRun(); init(); });
      SA.$('.pg-step', ctrl).addEventListener('click', () => { stopRun(); step(); });
      SA.$('.pg-run', ctrl).addEventListener('click', (e) => {
        if (timer) return stopRun();
        if (!cen.length) init();
        e.currentTarget.innerHTML = ic.pause(12) + ' 暂停';
        timer = setInterval(() => { if (step() < 0.001) { stopRun(); info.insertAdjacentHTML('beforeend', '<div class="d" style="color:var(--green)">已收敛：中心不再移动。</div>'); } }, 650);
      });
      cv.style.cursor = 'default';
      draw();
      return () => clearInterval(timer);
    }

    const tabs = { cls, reg, clu };
    function show(t) {
      if (cleanup) cleanup();
      tab = t;
      SA.$$('.pg-tabs button', root).forEach((b) => b.setAttribute('aria-pressed', b.dataset.t === t));
      cleanup = tabs[t]();
    }
    SA.$$('.pg-tabs button', root).forEach((b) => b.addEventListener('click', () => {
      show(b.dataset.t);
      if (b.dataset.t === 'clu') ctx.say('注意看：聚类画板里的点<b>全是灰色</b>的——没有标签。这就是无监督学习和前两块画板最大的不同。', 'clu');
    }));
    show('cls');
    return () => cleanup && cleanup();
  };

  /* ---------- 损失函数与梯度下降 ---------- */
  W.lossLab = function (root, ctx) {
    const r = rng(5);
    const data = Array.from({ length: 16 }, (_, i) => { const x = 0.2 + (i / 15) * 4.6; return { x, y: 2 * x + 1 + gauss(r) * 0.9 }; });
    let w = 0.4, b = 4.5, lr = 0.06, timer = null, hist = [], said = false;
    const CW = 460, CH = 280, PAD = 32;
    const XR = [0, 5], YR = [-2, 14];
    root.innerHTML = `
      <div class="w">
        <div class="w-grid2" style="align-items:start">
          <div style="display:flex;flex-direction:column;gap:8px"><canvas class="ll-main" aria-label="数据与模型直线"></canvas></div>
          <div style="display:flex;flex-direction:column;gap:12px">
            <div class="w-row" style="gap:24px">
              <div class="w-stat"><span class="l">均方误差 MSE</span><span class="v ll-mse" style="font-size:30px">–</span></div>
              <div class="w-stat"><span class="l">平均绝对误差 MAE</span><span class="v ll-mae">–</span></div>
            </div>
            <div style="display:flex;flex-direction:column;gap:4px"><span class="w-note">损失随 w 变化的“山谷”（b 固定为当前值）</span><canvas class="ll-land"></canvas></div>
            <div style="display:flex;flex-direction:column;gap:4px"><span class="w-note">训练过程中的损失</span><canvas class="ll-curve"></canvas></div>
          </div>
        </div>
        <div class="w-row">
          <div class="slider"><label for="llw"><span>斜率 w</span><span class="mono ll-wv"></span></label><input id="llw" type="range" min="-1" max="5" step="0.01"></div>
          <div class="slider"><label for="llb"><span>截距 b</span><span class="mono ll-bv"></span></label><input id="llb" type="range" min="-4" max="8" step="0.01"></div>
          <div class="slider"><label for="lllr"><span>学习率（步子大小）</span><span class="mono ll-lrv"></span></label><input id="lllr" type="range" min="0.005" max="0.13" step="0.005"></div>
        </div>
        <div class="w-row"><button type="button" class="btn primary sm ll-train">${ic.play(12)} 梯度下降：自动训练</button><button type="button" class="btn sm ll-one">${ic.step(12)} 走一步</button><button type="button" class="btn sm ll-reset">${ic.reset(12)} 打乱参数</button></div>
        <div class="w-panel ll-msg"><div class="d">先试着<b>手动</b>拖动 w 和 b，让红色误差线尽量短、MSE 尽量小。</div></div>
      </div>`;
    const g1 = SA.setupCanvas(SA.$('.ll-main', root), CW, CH);
    const g2 = SA.setupCanvas(SA.$('.ll-land', root), 300, 110);
    const g3 = SA.setupCanvas(SA.$('.ll-curve', root), 300, 70);
    const iw = SA.$('#llw', root), ib = SA.$('#llb', root), ilr = SA.$('#lllr', root);
    const sx = (v) => PAD + ((v - XR[0]) / (XR[1] - XR[0])) * (CW - PAD - 10);
    const sy = (v) => CH - PAD - ((v - YR[0]) / (YR[1] - YR[0])) * (CH - PAD - 10);
    const mse = (W, B) => data.reduce((s, p) => s + (W * p.x + B - p.y) ** 2, 0) / data.length;
    const mae = (W, B) => data.reduce((s, p) => s + Math.abs(W * p.x + B - p.y), 0) / data.length;
    function msg(t) { SA.$('.ll-msg', root).innerHTML = `<div class="d fade-swap">${t}</div>`; }
    function draw() {
      g1.clearRect(0, 0, CW, CH);
      g1.strokeStyle = LINE; g1.lineWidth = 1; g1.fillStyle = MUTED; g1.font = '11px JetBrains Mono, monospace';
      for (let i = 0; i <= 5; i++) { const x = sx(i); g1.beginPath(); g1.moveTo(x, 10); g1.lineTo(x, CH - PAD); g1.stroke(); g1.textAlign = 'center'; g1.fillText(i, x, CH - PAD + 14); }
      for (let v = 0; v <= 12; v += 4) { const y = sy(v); g1.beginPath(); g1.moveTo(PAD, y); g1.lineTo(CW - 10, y); g1.stroke(); g1.textAlign = 'right'; g1.fillText(v, PAD - 6, y + 4); }
      g1.textAlign = 'center'; g1.fillText('x', CW - 16, CH - PAD + 14);
      data.forEach((p) => { g1.strokeStyle = 'rgba(224,122,31,.8)'; g1.lineWidth = 2; g1.beginPath(); g1.moveTo(sx(p.x), sy(p.y)); g1.lineTo(sx(p.x), sy(w * p.x + b)); g1.stroke(); });
      g1.strokeStyle = BLUE; g1.lineWidth = 3; g1.beginPath(); g1.moveTo(sx(0), sy(b)); g1.lineTo(sx(5), sy(w * 5 + b)); g1.stroke();
      data.forEach((p) => { g1.beginPath(); g1.arc(sx(p.x), sy(p.y), 5, 0, 7); g1.fillStyle = INK; g1.fill(); g1.strokeStyle = '#fff'; g1.lineWidth = 1.5; g1.stroke(); });
      g1.fillStyle = BLUE; g1.font = '13px JetBrains Mono, monospace'; g1.textAlign = 'left';
      g1.fillText(`f(x) = ${w.toFixed(2)}·x ${b >= 0 ? '+' : '−'} ${Math.abs(b).toFixed(2)}`, PAD + 8, 26);
      // 山谷
      g2.clearRect(0, 0, 300, 110); g2.fillStyle = '#F4F5F7'; g2.fillRect(0, 0, 300, 110);
      const ws = [], ls = [];
      for (let i = 0; i <= 60; i++) { const ww = -1 + (i / 60) * 6; ws.push(ww); ls.push(mse(ww, b)); }
      const lmax = Math.max(...ls), lmin = Math.min(...ls);
      const lx = (ww) => 8 + ((ww + 1) / 6) * 284, ly = (l) => 100 - ((l - lmin) / (lmax - lmin || 1)) * 88;
      g2.strokeStyle = '#9AA0AE'; g2.lineWidth = 2; g2.beginPath(); ws.forEach((ww, i) => (i ? g2.lineTo(lx(ww), ly(ls[i])) : g2.moveTo(lx(ww), ly(ls[i])))); g2.stroke();
      const cw = SA.clamp(w, -1, 5);
      g2.beginPath(); g2.arc(lx(cw), Math.max(6, ly(mse(cw, b))), 7, 0, 7); g2.fillStyle = BLUE; g2.fill(); g2.strokeStyle = '#fff'; g2.lineWidth = 2; g2.stroke();
      // 曲线
      g3.clearRect(0, 0, 300, 70); g3.fillStyle = '#F4F5F7'; g3.fillRect(0, 0, 300, 70);
      if (hist.length > 1) {
        const hm = Math.max(...hist.map((v) => Math.min(v, 1e3)));
        g3.strokeStyle = ORANGE; g3.lineWidth = 2; g3.beginPath();
        hist.forEach((v, i) => { const x = 6 + (i / (hist.length - 1)) * 288, y = 64 - (Math.min(v, 1e3) / hm) * 56; i ? g3.lineTo(x, y) : g3.moveTo(x, y); });
        g3.stroke();
      }
      const m = mse(w, b);
      SA.$('.ll-mse', root).textContent = m > 9999 ? '∞' : m.toFixed(2);
      SA.$('.ll-mae', root).textContent = m > 9999 ? '∞' : mae(w, b).toFixed(2);
      SA.$('.ll-wv', root).textContent = w.toFixed(2);
      SA.$('.ll-bv', root).textContent = b.toFixed(2);
      SA.$('.ll-lrv', root).textContent = lr.toFixed(3);
      iw.value = SA.clamp(w, -1, 5); ib.value = SA.clamp(b, -4, 8); ilr.value = lr;
    }
    function gd() {
      let gw = 0, gb = 0;
      data.forEach((p) => { const e = w * p.x + b - p.y; gw += 2 * e * p.x; gb += 2 * e; });
      w -= lr * gw / data.length; b -= lr * gb / data.length;
      const m = mse(w, b); hist.push(m);
      return m;
    }
    function stop() { clearInterval(timer); timer = null; SA.$('.ll-train', root).innerHTML = ic.play(12) + ' 梯度下降：自动训练'; }
    SA.$('.ll-train', root).addEventListener('click', (e) => {
      if (timer) return stop();
      e.currentTarget.innerHTML = ic.pause(12) + ' 暂停';
      hist = [mse(w, b)];
      let n = 0;
      timer = setInterval(() => {
        const prev = hist[hist.length - 1];
        const m = gd(); n++; draw();
        if (!isFinite(m) || m > 5000) {
          stop(); w = 0.4; b = 4.5; hist = []; draw();
          msg('<b style="color:var(--orange-ink)">发散了！</b>学习率太大，每一步都迈过了谷底，越走越高。参数已复位，把学习率调小再试。');
          ctx.say('你看到了“发散”：学习率太大，参数在山谷两边越跳越高。这是训练神经网络时真实会遇到的问题。', 'diverge');
          return;
        }
        if (Math.abs(prev - m) < 1e-4 || n > 400) {
          stop();
          msg(`训练完成！经过 ${n} 步，MSE 降到 <b>${m.toFixed(2)}</b>，模型学到了 w ≈ ${w.toFixed(2)}、b ≈ ${b.toFixed(2)}（数据其实是按 y = 2x + 1 加噪声生成的）。`);
          if (!said) { said = true; ctx.say(`梯度下降用了 ${n} 步就找到了 w ≈ ${w.toFixed(1)}、b ≈ ${b.toFixed(1)}。你手动调的时候用了多久？<b>这就是“训练”：让算法自动去找最好的参数。</b>`); }
        }
      }, 40);
    });
    SA.$('.ll-one', root).addEventListener('click', () => { stop(); if (!hist.length) hist = [mse(w, b)]; gd(); draw(); msg(`沿着坡度往下走了一步：MSE = ${mse(w, b).toFixed(2)}。看右上角的蓝球往谷底滚了一点。`); });
    SA.$('.ll-reset', root).addEventListener('click', () => { stop(); w = -0.5 + Math.random() * 5; b = -3 + Math.random() * 10; hist = []; draw(); msg('参数已随机打乱。'); });
    iw.addEventListener('input', () => { stop(); w = +iw.value; draw(); if (mse(w, b) < 1.2 && !said) msg('手动调得很好！MSE 已经很小了。现在点“自动训练”，看看算法会不会比你更快。'); });
    ib.addEventListener('input', () => { stop(); b = +ib.value; draw(); });
    ilr.addEventListener('input', () => { lr = +ilr.value; draw(); });
    draw();
    return stop;
  };

  /* ---------- 机器学习整体步骤 ---------- */
  W.mlSteps = function (root) {
    root.innerHTML = `
      <div class="w">
        <div style="display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px;align-items:center;font-size:13px;text-align:center">
          <div class="flow-node" data-s="0">${ic.data(18)}<div>历史数据</div></div>
          <div class="flow-arrow" data-s="1">训练 →</div>
          <div class="flow-node" data-s="2" style="grid-row:span 2">${ic.cpu(22)}<div><b>模型</b></div><div class="w-note">f(x)</div></div>
          <div class="flow-arrow" data-s="4">预测 →</div>
          <div class="flow-node" data-s="5">${ic.bulb(18)}<div>预测值</div></div>
          <div class="flow-node" data-s="3">${ic.image(18)}<div>新数据</div></div>
          <div class="flow-arrow" data-s="3">输入 →</div>
          <div></div><div></div>
        </div>
        <div class="w-row"><button type="button" class="btn sm ms-play">${ic.play(12)} 演示一遍</button><span class="w-note ms-cap">训练阶段只做一次（很贵），预测阶段可以做无数次（很快）。</span></div>
      </div>`;
    const caps = ['① 收集历史数据（带标签）', '② 用训练算法 + 损失函数 + 优化算法，找到模型参数', '③ 得到模型 f(x)', '④ 来了一条新数据', '⑤ 模型给出预测', '⑥ 预测值：可以拿去做决策了'];
    let t = null;
    SA.$('.ms-play', root).addEventListener('click', () => {
      clearInterval(t); let i = 0;
      const step = () => { SA.$$('[data-s]', root).forEach((el) => el.classList.toggle('on', +el.dataset.s <= i)); SA.$('.ms-cap', root).textContent = caps[i]; if (++i > 5) clearInterval(t); };
      step(); t = setInterval(step, 1100);
    });
    return () => clearInterval(t);
  };

  /* ---------- 微博数据处理流水线 ---------- */
  W.weibo = function (root, ctx) {
    // 预先分好词：前缀 a:@提及 e:表情 t:话题/特殊格式 p:标点 s:停用词，其他为普通词
    const posts = [
      { u: '用户_8812', raw: '@上海移动 @中国移动10086 @中国移动 天天给我发升级套餐的推送，我抱怨几句怎么还就预约成功了？厉害呀！果然人工智能', tk: 'a:@上海移动|a:@中国移动10086|a:@中国移动|天天|s:给|s:我|发|升级套餐|s:的|推送|p:，|s:我|抱怨|几句|s:怎么|s:还|s:就|预约|成功|s:了|p:？|厉害|s:呀|p:！|s:果然|人工智能', truth: -1 },
      { u: '咖啡续命', raw: '今天和朋友去了新开的咖啡馆，环境真心不错！不过有点贵哈哈[允悲] {%XX商场%}', tk: '今天|s:和|朋友|s:去|s:了|新开|s:的|咖啡馆|p:，|环境|s:真心|不错|p:！|s:不过|s:有点|贵|s:哈哈|e:[允悲]|t:{%XX商场%}', truth: 1 },
      { u: '影迷小周', raw: '我就说这个电影一定火！没想到评分都9.0了！@某某明星 {%微博电影%}', tk: 's:我|s:就|说|s:这个|电影|s:一定|火|p:！|没想到|评分|s:都|9.0|s:了|p:！|a:@某某明星|t:{%微博电影%}', truth: 1 },
      { u: '猫奴日记', raw: '我家猫咪今天特别乖，还主动来找我玩，心都要化了[心] {%小动物之家%}', tk: 's:我家|猫咪|今天|s:特别|乖|p:，|s:还|主动|s:来|找|s:我|玩|p:，|心|s:都|s:要|化了|e:[心]|t:{%小动物之家%}', truth: 1 },
      { u: '开学啦', raw: '人工智能写的作业被老师一眼看出来了[笑cry] 还是得自己学 #开学第一课#', tk: '人工智能|写|s:的|作业|s:被|老师|一眼|看出来|s:了|e:[笑cry]|s:还是|s:得|自己|学|t:#开学第一课#', truth: 0 },
      { u: '通勤人', raw: '地铁又晚点二十分钟，迟到扣钱，心累[泪] @上海地铁shmetro', tk: '地铁|s:又|晚点|二十分钟|p:，|迟到|扣钱|p:，|心累|e:[泪]|a:@上海地铁shmetro', truth: -1 }
    ];
    posts.forEach((p) => { p.tokens = p.tk.split('|').map((x) => { const m = /^([aetps]):(.*)$/.exec(x); return m ? { k: m[1], t: m[2] } : { k: 'w', t: x }; }); });
    const lex = { pos: ['不错', '火', '乖', '化了', '成功', '厉害', '主动', '[心]', '新开'], neg: ['贵', '抱怨', '晚点', '迟到', '扣钱', '心累', '[泪]', '[允悲]', '天天'] };
    const rules = [{ k: 'a', n: '去 @提及' }, { k: 'e', n: '去表情 [xx]' }, { k: 't', n: '去话题与特殊格式' }, { k: 'p', n: '去标点符号' }, { k: 's', n: '去停用词' }];
    const on = { a: true, e: true, t: true, p: true, s: true };
    let step = 0, crawled = false;
    root.innerHTML = `
      <div class="w">
        <div class="stepper" role="group" aria-label="四个步骤">
          ${['数据收集', '数据预处理', '基础统计分析', 'AI 模型：情感分析'].map((l, i) => `<button type="button" data-s="${i}" aria-pressed="${i === 0}"><span class="n">STEP ${i + 1}</span><span class="l">${l}</span></button>`).join('')}
        </div>
        <div class="wb-body"></div>
      </div>`;
    const body = SA.$('.wb-body', root);
    const kept = (p) => p.tokens.filter((t) => t.k === 'w' || !on[t.k]);
    function tokHtml(p, mode) {
      return p.tokens.map((t) => {
        let cls = 'tok';
        if (mode === 'clean') cls += t.k !== 'w' && on[t.k] ? ' gone' : ' kept';
        if (mode === 'senti' && !(t.k !== 'w' && on[t.k])) { if (lex.pos.includes(t.t)) cls += ' pos'; else if (lex.neg.includes(t.t)) cls += ' neg'; }
        if (mode === 'senti' && t.k !== 'w' && on[t.k]) return '';
        return `<span class="${cls}">${SA.esc(t.t)}</span>`;
      }).join(mode === 'clean' ? ' ' : '');
    }
    function render() {
      SA.$$('.stepper button', root).forEach((b) => b.setAttribute('aria-pressed', +b.dataset.s === step));
      if (step === 0) {
        body.innerHTML = `
          <div class="w">
            <div class="w-row"><button type="button" class="btn primary sm wb-crawl">${ic.play(12)} 启动爬虫</button><span class="w-note">网络爬虫像机器人一样“浏览”网页，把内容抓下来保存。</span></div>
            <div class="bar" style="max-width:none"><i class="wb-bar" style="width:${crawled ? 100 : 0}%"></i></div>
            <div class="posts wb-posts">${crawled ? posts.map((p) => `<div class="post"><b style="font-size:13px">${p.u}</b>：${SA.esc(p.raw)}</div>`).join('') : '<span class="w-note">还没有数据。</span>'}</div>
          </div>`;
        SA.$('.wb-crawl', body).addEventListener('click', async (e) => {
          e.currentTarget.disabled = true;
          const host = SA.$('.wb-posts', body); host.innerHTML = '';
          for (let i = 0; i < posts.length; i++) {
            await SA.sleep(SA.reducedMotion() ? 0 : 380);
            SA.$('.wb-bar', body).style.width = ((i + 1) / posts.length) * 100 + '%';
            host.appendChild(SA.h(`<div class="post in"><b style="font-size:13px">${posts[i].u}</b>：${SA.esc(posts[i].raw)}</div>`));
          }
          crawled = true;
          host.appendChild(SA.h(`<div class="w-panel fade-swap"><div class="d">抓到了 ${posts.length} 条微博（真实场景里通常是几十万条）。仔细看：里面混着 @、表情、话题标签、标点……直接拿来分析会很乱。<b>去第 2 步清洗一下。</b></div></div>`));
        });
      } else if (step === 1) {
        body.innerHTML = `
          <div class="w">
            <div class="toggles">${rules.map((r) => `<button type="button" class="tgl" data-k="${r.k}" aria-pressed="${on[r.k]}"><span class="sw"></span>${r.n}</button>`).join('')}</div>
            <div class="posts">${posts.map((p) => `<div class="post">${tokHtml(p, 'clean')}</div>`).join('')}</div>
            <div class="w-note">停用词：一些几乎不带信息的词，比如副词、语气词（的、了、呀、就……）。划线的部分会被去掉。</div>
          </div>`;
        SA.$$('.tgl', body).forEach((b) => b.addEventListener('click', () => { on[b.dataset.k] = !on[b.dataset.k]; render(); }));
      } else if (step === 2) {
        const freq = {};
        posts.forEach((p) => kept(p).forEach((t) => { if (t.k === 'p') return; freq[t.t] = (freq[t.t] || 0) + 1; }));
        const top = Object.entries(freq).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 8);
        const mx = top.length ? top[0][1] : 1;
        const cloud = SA.shuffle(Object.entries(freq).slice(0, 30));
        const colors = [BLUE, '#1C2884', ORANGE, GREEN, '#7B4FC9', INK];
        body.innerHTML = `
          <div class="w-grid2">
            <div style="display:flex;flex-direction:column;gap:8px"><b style="font-size:14px">词频统计 · 前 8</b><div class="hbars">${top.map(([w, c]) => `<div class="hbar"><span>${SA.esc(w)}</span><div class="track"><i style="width:0%" data-w="${(c / mx) * 100}"></i></div><span class="num">${c}</span></div>`).join('')}</div></div>
            <div style="display:flex;flex-direction:column;gap:8px"><b style="font-size:14px">词云</b><div class="cloud">${cloud.map(([w, c], i) => `<span style="font-size:${14 + (c / mx) * 22}px;color:${colors[i % colors.length]};animation-delay:${i * 0.03}s">${SA.esc(w)}</span>`).join('')}</div></div>
          </div>
          <div class="w-panel" style="margin-top:12px"><div class="d">${on.s ? '清洗后，“人工智能”“今天”这些有意义的词浮了上来。' : '<b>你关掉了“去停用词”</b>——看，“了”“我”“的”挤到了词频榜前面，真正的热点被淹没了。'}高频词可以帮我们发现热点话题；在真实项目里，还会进一步构建<b>词汇共现网络</b>，看哪些词经常一起出现。</div></div>`;
        requestAnimationFrame(() => SA.$$('.hbar i', body).forEach((i) => (i.style.width = i.dataset.w + '%')));
      } else {
        const res = posts.map((p) => {
          const toks = kept(p); let sc = 0;
          toks.forEach((t) => { if (lex.pos.includes(t.t)) sc++; if (lex.neg.includes(t.t)) sc--; });
          return { p, sc };
        });
        body.innerHTML = `
          <div class="w">
            <div class="w-note">最简单的情感分析：数一数正面词（绿）和负面词（橙）。${on.e ? '<b>注意：你在第 2 步去掉了表情</b>，而表情其实是很强的情绪信号。可以回去关掉“去表情”再来看。' : '表情被保留了，它们也参与了打分。'}</div>
            <div>${res.map(({ p, sc }) => {
              const lab = sc > 0 ? '正面' : sc < 0 ? '负面' : '中性';
              const col = sc > 0 ? 'var(--green)' : sc < 0 ? 'var(--orange-ink)' : 'var(--muted)';
              const left = 50 + SA.clamp(sc, -3, 3) * 15;
              return `<div class="senti"><span class="txt">${tokHtml(p, 'senti')}</span><span class="gauge"><i style="left:calc(${left}% - 2px)"></i></span><span class="lab" style="color:${col}">${lab}</span></div>`;
            }).join('')}</div>
            <div class="w-panel"><div class="t">发现问题了吗？</div><div class="d">第一条“厉害呀！果然人工智能”被判成了偏正面，可它其实是在<b>吐槽</b>。只数关键词的方法看不懂反讽——这正是需要更强的 AI 模型（比如大语言模型）结合上下文去理解的原因。</div></div>
          </div>`;
        ctx.say('看第一条微博的情感分数——“厉害呀！果然人工智能”。你觉得作者是在夸，还是在吐槽？<b>简单的关键词方法被反讽骗了</b>。', 'sarcasm');
      }
    }
    SA.$$('.stepper button', root).forEach((b) => b.addEventListener('click', () => {
      step = +b.dataset.s;
      if (step > 0 && !crawled) crawled = true;
      render();
    }));
    render();
  };

  /* ---------- 生成一张 64×64 的灰度“猫脸” ---------- */
  let catCache = null;
  function catImage() {
    if (catCache) return catCache.slice();
    const N = 64, c = document.createElement('canvas'); c.width = N; c.height = N;
    const g = c.getContext('2d');
    const grd = g.createLinearGradient(0, 0, 0, N); grd.addColorStop(0, '#d8d8d8'); grd.addColorStop(1, '#8a8a8a');
    g.fillStyle = grd; g.fillRect(0, 0, N, N);
    g.fillStyle = '#5a5a5a';
    g.beginPath(); g.moveTo(12, 26); g.lineTo(16, 4); g.lineTo(28, 18); g.fill();
    g.beginPath(); g.moveTo(52, 26); g.lineTo(48, 4); g.lineTo(36, 18); g.fill();
    g.fillStyle = '#c4c4c4';
    g.beginPath(); g.moveTo(16, 22); g.lineTo(17, 10); g.lineTo(24, 18); g.fill();
    g.beginPath(); g.moveTo(48, 22); g.lineTo(47, 10); g.lineTo(40, 18); g.fill();
    g.fillStyle = '#7a7a7a'; g.beginPath(); g.ellipse(32, 36, 22, 20, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#4a4a4a'; g.lineWidth = 2;
    [[26, 18, 28, 26], [32, 17, 32, 26], [38, 18, 36, 26]].forEach(([a, b, cc, d]) => { g.beginPath(); g.moveTo(a, b); g.lineTo(cc, d); g.stroke(); });
    g.fillStyle = '#f2f2f2'; g.beginPath(); g.ellipse(32, 46, 11, 8, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#e8e8e8'; g.beginPath(); g.ellipse(23, 33, 6, 5, 0, 0, Math.PI * 2); g.fill(); g.beginPath(); g.ellipse(41, 33, 6, 5, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#141414'; g.beginPath(); g.ellipse(23, 33, 2.4, 4.4, 0, 0, Math.PI * 2); g.fill(); g.beginPath(); g.ellipse(41, 33, 2.4, 4.4, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#ffffff'; g.fillRect(23, 31, 1, 1); g.fillRect(41, 31, 1, 1);
    g.fillStyle = '#3a3a3a'; g.beginPath(); g.moveTo(29, 41); g.lineTo(35, 41); g.lineTo(32, 45); g.fill();
    g.strokeStyle = '#3a3a3a'; g.lineWidth = 1;
    g.beginPath(); g.moveTo(32, 45); g.quadraticCurveTo(29, 49, 26, 47); g.moveTo(32, 45); g.quadraticCurveTo(35, 49, 38, 47); g.stroke();
    g.strokeStyle = '#fafafa';
    [[20, 44, 4, 41], [20, 46, 3, 47], [44, 44, 60, 41], [44, 46, 61, 47]].forEach(([a, b, cc, d]) => { g.beginPath(); g.moveTo(a, b); g.lineTo(cc, d); g.stroke(); });
    const im = g.getImageData(0, 0, N, N).data;
    const r = rng(3);
    const out = new Float64Array(N * N);
    for (let i = 0; i < N * N; i++) out[i] = SA.clamp(Math.round(im[i * 4] + (r() - 0.5) * 10), 0, 255);
    catCache = out;
    return out.slice();
  }
  function paintMatrix(canvas, m, N, scale) {
    canvas.width = N * scale; canvas.height = N * scale;
    canvas.style.width = '100%'; canvas.style.maxWidth = N * scale + 'px'; canvas.style.aspectRatio = '1';
    const g = canvas.getContext('2d');
    const id = g.createImageData(N, N);
    for (let i = 0; i < N * N; i++) { const v = SA.clamp(Math.round(m[i]), 0, 255); id.data[i * 4] = id.data[i * 4 + 1] = id.data[i * 4 + 2] = v; id.data[i * 4 + 3] = 255; }
    const tmp = document.createElement('canvas'); tmp.width = N; tmp.height = N; tmp.getContext('2d').putImageData(id, 0, 0);
    g.imageSmoothingEnabled = false; g.drawImage(tmp, 0, 0, N * scale, N * scale);
  }

  /* ---------- 图像就是矩阵 ---------- */
  W.imageMatrix = function (root, ctx) {
    const N = 64, base = catImage();
    const ops = [
      { k: 'orig', n: '原图', c: 'A', f: (m) => m },
      { k: 'T', n: '翻转（对角线）', c: 'Aᵀ 转置', f: (m) => { const o = new Float64Array(N * N); for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) o[c * N + r] = m[r * N + c]; return o; } },
      { k: 'flip', n: '水平翻转', c: '列倒序', f: (m) => { const o = new Float64Array(N * N); for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) o[r * N + c] = m[r * N + (N - 1 - c)]; return o; } },
      { k: 'bright', n: '亮度提高', c: 'A + 50', f: (m) => m.map((v) => Math.min(255, v + 50)) },
      { k: 'inv', n: '相反颜色', c: '255 − A', f: (m) => m.map((v) => 255 - v) }
    ];
    let cur = 'orig', mat = base, hover = [33, 23];
    root.innerHTML = `
      <div class="w">
        <div class="ops">${ops.map((o) => `<button type="button" data-k="${o.k}" aria-pressed="${o.k === cur}">${o.n}<small>${o.c}</small></button>`).join('')}</div>
        <div class="imgm">
          <div style="flex:0 1 288px;display:flex;flex-direction:column;gap:6px;min-width:0"><canvas class="im-c" aria-label="64×64 灰度图"></canvas><span class="w-note">Image Matrix Shape: (64, 64) · 共 4096 个数字</span></div>
          <div style="flex:1 1 260px;display:flex;flex-direction:column;gap:8px;min-width:0">
            <b style="font-size:14px">鼠标附近 6 × 6 的像素值</b>
            <div class="matrix im-m"></div>
            <span class="w-note im-pos"></span>
            <div class="w-panel"><div class="d">0 = 纯黑，255 = 纯白。图片上的每一种变化，都只是这些数字在变。</div></div>
          </div>
        </div>
      </div>`;
    const cv = SA.$('.im-c', root), mm = SA.$('.im-m', root);
    function renderMatrix() {
      const [r0, c0] = [SA.clamp(hover[0] - 3, 0, N - 6), SA.clamp(hover[1] - 3, 0, N - 6)];
      let s = '';
      for (let r = r0; r < r0 + 6; r++) for (let c = c0; c < c0 + 6; c++) {
        const v = Math.round(mat[r * N + c]);
        s += `<span style="background:rgb(${v},${v},${v});color:${v > 128 ? '#14161C' : '#fff'}">${v}</span>`;
      }
      mm.innerHTML = s;
      SA.$('.im-pos', root).textContent = `行 ${r0}–${r0 + 5}，列 ${c0}–${c0 + 5}`;
      // 高亮框
      paintMatrix(cv, mat, N, 4.5);
      const g = cv.getContext('2d');
      g.strokeStyle = '#E9A23B'; g.lineWidth = 2; g.strokeRect(c0 * 4.5, r0 * 4.5, 6 * 4.5, 6 * 4.5);
    }
    cv.addEventListener('pointermove', (e) => {
      const r = cv.getBoundingClientRect();
      hover = [Math.floor(((e.clientY - r.top) / r.height) * N), Math.floor(((e.clientX - r.left) / r.width) * N)];
      renderMatrix();
    });
    SA.$$('.ops button', root).forEach((b) => b.addEventListener('click', () => {
      cur = b.dataset.k; mat = ops.find((o) => o.k === cur).f(base);
      SA.$$('.ops button', root).forEach((x) => x.setAttribute('aria-pressed', x === b));
      renderMatrix();
    }));
    renderMatrix();
  };

  /* ---------- PCA / SVD 压缩 ---------- */
  function jacobiEigen(S, n) {
    const A = S.slice(), V = new Float64Array(n * n);
    for (let i = 0; i < n; i++) V[i * n + i] = 1;
    for (let sweep = 0; sweep < 12; sweep++) {
      let off = 0;
      for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) off += A[p * n + q] ** 2;
      if (off < 1e-6) break;
      for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) {
        const apq = A[p * n + q];
        if (Math.abs(apq) < 1e-12) continue;
        const theta = (A[q * n + q] - A[p * n + p]) / (2 * apq);
        const t = Math.sign(theta || 1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1));
        const c = 1 / Math.sqrt(t * t + 1), s = t * c;
        for (let k = 0; k < n; k++) {
          const akp = A[k * n + p], akq = A[k * n + q];
          A[k * n + p] = c * akp - s * akq; A[k * n + q] = s * akp + c * akq;
        }
        for (let k = 0; k < n; k++) {
          const apk = A[p * n + k], aqk = A[q * n + k];
          A[p * n + k] = c * apk - s * aqk; A[q * n + k] = s * apk + c * aqk;
        }
        for (let k = 0; k < n; k++) {
          const vkp = V[k * n + p], vkq = V[k * n + q];
          V[k * n + p] = c * vkp - s * vkq; V[k * n + q] = s * vkp + c * vkq;
        }
      }
    }
    const vals = Array.from({ length: n }, (_, i) => A[i * n + i]);
    const order = vals.map((v, i) => i).sort((a, b) => vals[b] - vals[a]);
    return { vals: order.map((i) => vals[i]), vecs: order.map((i) => Array.from({ length: n }, (_, k) => V[k * n + i])) };
  }
  W.pca = function (root, ctx) {
    const N = 64, A = catImage();
    root.innerHTML = `
      <div class="w">
        <div class="imgm" style="align-items:flex-start">
          <div style="flex:0 1 200px;display:flex;flex-direction:column;gap:6px;min-width:0"><span class="w-note">原图（64 × 64）</span><canvas class="pc-a"></canvas></div>
          <div style="flex:0 1 200px;display:flex;flex-direction:column;gap:6px;min-width:0"><span class="w-note pc-lab">只保留 8 个主成分</span><canvas class="pc-b"></canvas></div>
          <div style="flex:1 1 220px;display:flex;flex-direction:column;gap:12px;min-width:0">
            <div class="slider"><label for="pck"><span>保留的主成分个数 k</span><span class="mono pck-v">8</span></label><input id="pck" type="range" min="1" max="40" step="1" value="8"></div>
            <div class="w-row" style="gap:24px"><div class="w-stat"><span class="l">需要存的数字</span><span class="v pc-n">–</span></div><div class="w-stat"><span class="l">占原图</span><span class="v pc-r">–</span></div></div>
            <div class="w-panel"><div class="d pc-d">正在计算主成分……</div></div>
          </div>
        </div>
      </div>`;
    paintMatrix(SA.$('.pc-a', root), A, N, 3);
    let AV = null, V = null, vals = null;
    setTimeout(() => {
      const S = new Float64Array(N * N);
      for (let i = 0; i < N; i++) for (let j = i; j < N; j++) { let s = 0; for (let r = 0; r < N; r++) s += A[r * N + i] * A[r * N + j]; S[i * N + j] = S[j * N + i] = s; }
      const e = jacobiEigen(S, N); V = e.vecs; vals = e.vals;
      AV = V.map((v) => { const col = new Float64Array(N); for (let r = 0; r < N; r++) { let s = 0; for (let c = 0; c < N; c++) s += A[r * N + c] * v[c]; col[r] = s; } return col; });
      render(8);
    }, 30);
    function render(k) {
      if (!AV) return;
      const R = new Float64Array(N * N);
      for (let i = 0; i < k; i++) { const u = AV[i], v = V[i]; for (let r = 0; r < N; r++) { const ur = u[r]; if (!ur) continue; for (let c = 0; c < N; c++) R[r * N + c] += ur * v[c]; } }
      paintMatrix(SA.$('.pc-b', root), R, N, 3);
      const n = k * (N + N + 1), ratio = n / (N * N);
      const total = vals.reduce((s, v) => s + Math.max(v, 0), 0), kept = vals.slice(0, k).reduce((s, v) => s + Math.max(v, 0), 0);
      SA.$('.pck-v', root).textContent = k;
      SA.$('.pc-lab', root).textContent = `只保留 ${k} 个主成分`;
      SA.$('.pc-n', root).textContent = n;
      SA.$('.pc-r', root).textContent = Math.round(ratio * 100) + '%';
      SA.$('.pc-d', root).innerHTML = k <= 2 ? '只剩一团模糊的明暗——这是图片里“最主要”的结构。' : k <= 10 ? `已经能认出是一只猫了！保留了 ${(kept / total * 100).toFixed(1)}% 的“能量”，数据量却不到原来的 ${Math.ceil(ratio * 100)}%。` : '细节越来越清晰。但再往上加，增加的数据量换来的提升越来越小——这就是降维的取舍。';
    }
    SA.$('#pck', root).addEventListener('input', (e) => render(+e.target.value));
  };
})();
