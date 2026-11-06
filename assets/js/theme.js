/*
 * jekyll-theme-krds: 화면 모드·글자 크기 저장, 표 감싸기, '이 페이지의 구성' 생성.
 * KRDS 키트 스크립트(vendor/krds-ui-script.js)보다 먼저 실행되어야 한다(키트가 DOMContentLoaded에서 초기화하므로
 * 이 파일이 만든 활성 상태와 목차를 키트가 그대로 이어받는다).
 */
(function () {
  'use strict';

  var root = document.documentElement;
  var MODES = ['light', 'high-contrast', 'theme']; // 기본(밝음) | 선명하게(어두움) | 시스템 설정
  var SCALES = { sm: 0.9, md: 1, lg: 1.1, xlg: 1.3, xxlg: 1.5 }; // KRDS 토큰 --krds-zoom-* 와 같은 값

  function store(key, value) { try { localStorage.setItem(key, value); } catch (e) { /* 저장소 사용 불가: 이번 방문에서만 유지 */ } }
  function load(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }

  // 화면 모드 ----------------------------------------------------------------
  function currentMode() {
    var m = root.getAttribute('data-krds-mode');
    return MODES.indexOf(m) >= 0 ? m : 'light';
  }
  function markMode() {
    var m = currentMode();
    document.querySelectorAll('[data-th-mode]').forEach(function (btn) {
      var on = btn.getAttribute('data-th-mode') === m;
      btn.classList.toggle('active', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }
  function setMode(m) {
    if (MODES.indexOf(m) < 0) m = 'light';
    root.setAttribute('data-krds-mode', m);
    store('krds-mode', m);
    markMode();
  }

  // 글자 크기 ----------------------------------------------------------------
  function markScale() {
    var z = parseFloat(document.body.style.zoom) || 1;
    var key = 'md';
    Object.keys(SCALES).forEach(function (k) { if (Math.abs(SCALES[k] - z) < 0.001) key = k; });
    document.querySelectorAll('.krds-resize .drop-list .item-link').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-adjust-scale') === key);
    });
  }

  function init() {
    // 모드 버튼
    document.querySelectorAll('[data-th-mode]').forEach(function (btn) {
      btn.addEventListener('click', function () { setMode(btn.getAttribute('data-th-mode')); });
    });
    markMode();

    // 시스템 설정(theme)일 때 OS 설정이 바뀌어도 CSS가 따라간다. 별도 처리는 필요 없다.

    // 글자 크기: 키트가 body.style.zoom 을 바꾼 뒤 그 값을 저장한다.
    markScale();
    document.addEventListener('click', function (e) {
      if (!e.target.closest('[data-adjust-scale]')) return;
      setTimeout(function () {
        var z = parseFloat(document.body.style.zoom);
        if (z) store('krds-scale', String(z));
        markScale();
      }, 0);
    });

    // 데스크톱 GNB 안에서 Escape로 메뉴를 닫으면 키트가 포커스를 body로 보낸다.
    // 키트는 keyup에서 닫으므로 keydown에서 trigger를 기억하고, keyup 처리 뒤 되돌린다.
    var escapeReturn = null;
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      var menu = document.activeElement && document.activeElement.closest('.gnb-toggle-wrap.is-open');
      if (!menu) return;
      escapeReturn = {
        menu: menu,
        trigger: menu.parentElement && menu.parentElement.querySelector('.gnb-main-trigger')
      };
    });
    document.addEventListener('keyup', function (e) {
      if (e.key !== 'Escape' || !escapeReturn) return;
      var pending = escapeReturn;
      escapeReturn = null;
      setTimeout(function () {
        if (pending.trigger && !pending.menu.classList.contains('is-open')) pending.trigger.focus();
      }, 0);
    }, true);

    // 모바일 전체메뉴의 글자 크기 단계 버튼(키트의 크기 조절은 드롭다운 안에서만 동작한다)
    var order = Object.keys(SCALES).map(function (k) { return SCALES[k]; });
    document.querySelectorAll('[data-th-scale-step]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var step = parseInt(btn.getAttribute('data-th-scale-step'), 10);
        var cur = parseFloat(document.body.style.zoom) || 1;
        var i = 0;
        order.forEach(function (v, n) { if (Math.abs(v - cur) < Math.abs(order[i] - cur)) i = n; });
        var next = step === 0 ? order[1] : order[Math.max(0, Math.min(order.length - 1, i + step))];
        document.body.style.zoom = next;
        store('krds-scale', String(next));
        markScale();
      });
    });

    // 마크다운 표: 좁은 화면에서 가로로 스크롤되게 감싼다.
    document.querySelectorAll('.th-prose table').forEach(function (table) {
      if (table.parentElement && table.parentElement.classList.contains('th-table-wrap')) return;
      var wrap = document.createElement('div');
      wrap.className = 'th-table-wrap';
      wrap.setAttribute('role', 'region');
      wrap.setAttribute('tabindex', '0');
      wrap.setAttribute('aria-label', '표 (가로로 스크롤할 수 있음)');
      table.parentNode.insertBefore(wrap, table);
      wrap.appendChild(table);
    });

    buildToc();
    watchScrollables();
  }

  // 가로로 넘치는 코드·수식 블록은 키보드로 스크롤할 수 있어야 한다(WCAG 2.1.1). 넘칠 때만 포커스를 받게 한다.
  var SCROLLABLES = [
    { selector: '.th-prose pre', label: '코드 (가로로 스크롤할 수 있음)' },
    { selector: '.th-prose .katex-display', label: '수식 (가로로 스크롤할 수 있음)' }
  ];
  function markScrollables() {
    SCROLLABLES.forEach(function (kind) {
      document.querySelectorAll(kind.selector).forEach(function (el) {
        if (el.scrollWidth > el.clientWidth + 1) {
          el.setAttribute('tabindex', '0');
          el.setAttribute('role', 'region');
          el.setAttribute('aria-label', kind.label);
        } else if (el.getAttribute('aria-label') === kind.label) {
          el.removeAttribute('tabindex'); el.removeAttribute('role'); el.removeAttribute('aria-label');
        }
      });
    });
  }
  function watchScrollables() {
    var t;
    var run = function () { clearTimeout(t); t = setTimeout(markScrollables, 100); };
    markScrollables();
    window.addEventListener('resize', run);
    document.addEventListener('toggle', run, true); // 접혀 있던 details 안의 코드가 펼쳐질 때
    window.addEventListener('load', run);
  }

  // 이 페이지의 구성 ----------------------------------------------------------
  function buildToc() {
    var box = document.querySelector('[data-th-toc]');
    var prose = document.querySelector('.th-prose');
    if (!box || !prose) return;
    var heads = Array.prototype.slice.call(prose.querySelectorAll('h2'));
    if (heads.length < 2) return; // 제목이 하나뿐이면 목차를 보여 주지 않는다
    var list = box.querySelector('ul');
    heads.forEach(function (h, i) {
      if (!h.id) h.id = 'section-' + (i + 1);
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = '#' + h.id;
      a.textContent = h.textContent;
      li.appendChild(a);
      list.appendChild(li);
    });
    box.hidden = false;

    if (!('IntersectionObserver' in window)) return;
    var links = list.querySelectorAll('a');
    var visible = {};
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { visible[en.target.id] = en.isIntersecting; });
      var first = heads.filter(function (h) { return visible[h.id]; })[0];
      if (!first) return;
      links.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + first.id); });
    }, { rootMargin: '0px 0px -70% 0px' });
    heads.forEach(function (h) { io.observe(h); });
    if (links[0]) links[0].classList.add('active');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
