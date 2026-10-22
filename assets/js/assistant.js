/* 右侧学习助手：消息流、打字效果、快捷提问、随堂检测卡片 */
(function () {
  const SA = window.SA, ic = SA.ic;

  const A = (SA.assistant = {
    el: null,
    threads: {},       // key -> [{ role, html, links, node }]
    key: null,
    queue: Promise.resolve(),
    handlers: {},
    unread: false,

    mount() {
      this.el = document.getElementById('assistant');
      this.el.innerHTML = `
        <div class="as-head">
          <div class="as-avatar" aria-hidden="true">${ic.agent(18).replace('stroke="currentColor"', 'stroke="#FFFFFF"')}</div>
          <div class="as-title"><b>学习助手</b><span class="as-sub">准备中</span></div>
          <a class="icon-btn" href="#/profile" aria-label="学习档案" title="学习档案">${ic.book(18)}</a>
          <button type="button" class="icon-btn as-close" aria-label="关闭学习助手">${ic.close(18)}</button>
        </div>
        <div class="as-scroll">
          <div class="as-panel-host"></div>
          <div class="chat" aria-live="polite"></div>
        </div>
        <div class="as-foot">
          <div class="chips as-chips"></div>
          <form class="composer as-form">
            <label for="ask" class="sr-only">向学习助手提问</label>
            <input id="ask" autocomplete="off" placeholder="问问题，或选中左侧内容再提问…">
            <button type="submit" class="send-btn" aria-label="发送">${ic.arrow(18)}</button>
          </form>
        </div>`;
      this.chat = SA.$('.chat', this.el);
      this.scroller = SA.$('.as-scroll', this.el);
      SA.$('.as-close', this.el).addEventListener('click', () => this.close());
      SA.$('.as-form', this.el).addEventListener('submit', (e) => {
        e.preventDefault();
        const inp = SA.$('#ask', this.el), t = inp.value.trim();
        if (!t) return;
        inp.value = '';
        this.user(t);
        this.handlers.onSend && this.handlers.onSend(t);
      });
      const fab = document.getElementById('assistant-fab');
      fab.addEventListener('click', () => this.open());
    },

    open() { this.el.classList.add('open'); this.setUnread(false); setTimeout(() => SA.$('#ask', this.el).focus({ preventScroll: true }), 300); },
    close() { this.el.classList.remove('open'); },
    isDrawer() { return window.matchMedia('(max-width: 1000px)').matches; },
    setUnread(v) {
      this.unread = v;
      const fab = document.getElementById('assistant-fab');
      const b = SA.$('.badge', fab);
      if (v && !b) fab.insertAdjacentHTML('beforeend', '<span class="badge" aria-label="有新消息"></span>');
      if (!v && b) b.remove();
    },

    /* 切换上下文（每个页面/小节一条独立对话） */
    context(opts) {
      this.key = opts.key;
      this.handlers = { onSend: opts.onSend, onChip: opts.onChip };
      SA.$('.as-sub', this.el).textContent = opts.subtitle || '';
      this.setPanel(opts.panel || '');
      this.setChips(opts.chips || []);
      SA.$('#ask', this.el).placeholder = opts.placeholder || '问问题，或选中左侧内容再提问…';
      this.queue = Promise.resolve();
      this.chat.innerHTML = '';
      const fresh = !this.threads[this.key];
      if (fresh) this.threads[this.key] = [];
      else this.threads[this.key].forEach((m) => this.chat.appendChild(m.node));
      this.scrollEnd(true);
      return fresh;
    },
    setPanel(html) { SA.$('.as-panel-host', this.el).innerHTML = html; },
    setChips(chips) {
      const host = SA.$('.as-chips', this.el);
      host.innerHTML = chips.map((c, i) => `<button type="button" class="chip" data-i="${i}">${c}</button>`).join('');
      host.style.display = chips.length ? 'flex' : 'none';
      SA.$$('.chip', host).forEach((b) => b.addEventListener('click', () => { const c = chips[+b.dataset.i]; this.user(c); this.handlers.onChip && this.handlers.onChip(c); }));
    },
    scrollEnd(instant) {
      const s = this.scroller;
      requestAnimationFrame(() => s.scrollTo({ top: s.scrollHeight, behavior: instant || SA.reducedMotion() ? 'auto' : 'smooth' }));
    },
    push(node, data, key) {
      key = key || this.key;
      (this.threads[key] = this.threads[key] || []).push(Object.assign({ node }, data || {}));
      if (key === this.key) { this.chat.appendChild(node); this.scrollEnd(); }
      if (this.isDrawer() && !this.el.classList.contains('open')) this.setUnread(true);
    },

    /* 用户消息 */
    user(text) {
      const n = SA.h(`<div class="msg user"><div class="msg-body"></div></div>`);
      n.firstElementChild.textContent = text;
      this.push(n, { role: 'user' });
    },

    /* 助手消息：排队 → 打字中 → 逐字出现 */
    say(html, opts) {
      opts = opts || {};
      const key = this.key;
      this.queue = this.queue.then(async () => {
        if (key !== this.key) return;
        const typing = SA.h('<div class="typing" aria-label="助手正在输入"><i></i><i></i><i></i></div>');
        this.el.classList.add('thinking');
        this.chat.appendChild(typing); this.scrollEnd();
        await SA.sleep(SA.reducedMotion() ? 0 : opts.delay != null ? opts.delay : 450 + Math.min(900, html.length * 6));
        typing.remove();
        this.el.classList.remove('thinking');
        if (key !== this.key) return;
        const n = SA.h(`<div class="msg ${opts.wide ? 'wide' : ''} ${opts.note ? 'note' : ''}"><span class="msg-who">${opts.who || '助手'}</span><div class="msg-body"></div></div>`);
        const body = n.querySelector('.msg-body');
        this.push(n, { role: 'agent' }, key);
        await new Promise((res) => {
          if (SA.stream && !SA.reducedMotion()) SA.stream(body, html, 4, res);
          else { body.innerHTML = html; res(); }
          const tick = setInterval(() => this.scrollEnd(true), 120);
          setTimeout(() => clearInterval(tick), 4000);
        });
        if (opts.links && opts.links.length) {
          const l = SA.h(`<div class="msg-links"></div>`);
          opts.links.forEach((lk) => {
            const b = SA.h(`<button type="button" class="msg-link ${lk.blue ? 'blue' : ''}">${lk.label} ↗</button>`);
            b.addEventListener('click', () => { lk.go && lk.go(); if (this.isDrawer()) this.close(); });
            l.appendChild(b);
          });
          n.appendChild(l);
        }
        if (opts.after) opts.after(n);
        this.scrollEnd();
      });
      return this.queue;
    },

    /* 自定义卡片（如随堂检测） */
    card(build, opts) {
      opts = opts || {};
      const key = this.key;
      this.queue = this.queue.then(async () => {
        if (key !== this.key) return;
        await SA.sleep(SA.reducedMotion() ? 0 : 300);
        if (key !== this.key) return;
        const n = SA.h(`<div class="msg card ${opts.wide === false ? '' : 'wide'}"><span class="msg-who">${opts.who || '助手'}</span><div class="msg-body"></div></div>`);
        build(n.querySelector('.msg-body'), n);
        this.push(n, { role: 'card', tag: opts.tag }, key);
      });
      return this.queue;
    },

    /* 随堂检测卡片 */
    quiz(q, opts) {
      opts = opts || {};
      return this.card((body) => {
        body.innerHTML = `<div style="font-weight:500">${q.q}</div>`;
        let tries = 0, done = false;
        const fb = SA.h('<div class="quiz-fb" style="display:none"></div>');
        q.options.forEach((o) => {
          const b = SA.h(`<button type="button" class="opt">${o.t}</button>`);
          b.addEventListener('click', () => {
            if (done) return;
            tries++;
            SA.$$('.opt', body).forEach((x) => x.classList.remove('wrong'));
            if (o.ok) {
              done = true;
              b.classList.add('right'); b.innerHTML = o.t + '　' + ic.check(14);
              SA.$$('.opt', body).forEach((x) => (x.disabled = true));
              fb.innerHTML = q.right || q.explain || '';
              fb.style.display = 'block';
              opts.onRight && opts.onRight(tries === 1, b);
            } else {
              b.classList.add('wrong'); b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake');
              fb.innerHTML = q.wrong || '再想想。';
              fb.style.display = 'block';
              opts.onWrong && opts.onWrong(tries);
            }
            this.scrollEnd();
          });
          body.appendChild(b);
        });
        body.appendChild(fb);
      }, { who: opts.who || '助手 · 随堂检测', tag: 'quiz' });
    }
  });

  /* ---------- 选中文字 → 问助手 ---------- */
  SA.initSelectionAsk = function () {
    const box = document.getElementById('sel-ask'), btn = document.getElementById('sel-ask-btn');
    let text = '';
    document.addEventListener('mouseup', (e) => {
      if (box.contains(e.target)) return;
      setTimeout(() => {
        const sel = window.getSelection();
        const t = sel ? sel.toString().trim() : '';
        const main = document.getElementById('app-main');
        if (!t || t.length < 2 || t.length > 80 || !sel.rangeCount || !main.contains(sel.anchorNode)) { box.hidden = true; return; }
        const r = sel.getRangeAt(0).getBoundingClientRect();
        text = t;
        box.style.left = Math.max(8, r.left + window.scrollX + r.width / 2 - 40) + 'px';
        box.style.top = r.top + window.scrollY - 46 + 'px';
        box.hidden = false;
      }, 10);
    });
    document.addEventListener('scroll', () => { box.hidden = true; }, { passive: true });
    btn.addEventListener('click', () => {
      box.hidden = true;
      window.getSelection().removeAllRanges();
      if (A.isDrawer()) A.open();
      A.user(`“${text}”是什么意思？`);
      SA.bus.emit('ask-selection', text);
    });
  };
})();
