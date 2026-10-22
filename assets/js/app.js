/* 启动与路由 */
(function () {
  const SA = window.SA;

  function route() {
    const main = document.getElementById('app-main');
    SA.runCleanups();
    const hash = location.hash || '';
    let m;
    window.scrollTo(0, 0);
    if ((m = hash.match(/^#\/learn\/([\d.]+)/)) && SA.course.sec(m[1])) SA.pages.learn(main, m[1]);
    else if ((m = hash.match(/^#\/check\/(\d)/)) && SA.course.chapter(m[1])) SA.pages.check(main, m[1]);
    else if (hash.startsWith('#/profile')) SA.pages.profile(main);
    else if (hash.startsWith('#/plan')) SA.pages.plan(main);
    else {
      location.replace(SA.store.s.plan ? '#/learn/' + (SA.store.s.current || '1.1') : '#/plan');
      return;
    }
    if (SA.assistant.isDrawer()) SA.assistant.close();
    const titles = { plan: '开课 · 学习方案', profile: '学习档案' };
    const sec = m && hash.includes('learn') ? SA.course.sec(m[1]) : null;
    document.title = (sec ? sec.id + ' ' + sec.title : hash.includes('check') ? '掌握检测' : titles[hash.slice(2)] || '学习') + ' · AI 学习智能体';
    main.focus({ preventScroll: true });
  }

  /* 连续学习天数（按自然日） */
  function touchStreak() {
    const s = SA.store.s, today = new Date().toDateString();
    if (s.lastDay === today) return;
    const y = new Date(); y.setDate(y.getDate() - 1);
    if (s.lastDay && s.lastDay !== y.toDateString()) s.streak = 1;
    else if (s.lastDay) s.streak += 1;
    s.lastDay = today;
    SA.store.save();
  }

  document.addEventListener('DOMContentLoaded', () => {
    SA.assistant.mount();
    SA.initSelectionAsk();
    touchStreak();
    window.addEventListener('hashchange', route);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && SA.assistant.isDrawer()) SA.assistant.close(); });
    route();
  });
})();
