/*
 * 홈 화면 위젯: 슬라이드 배너, 탭, 카드뉴스 스크롤러.
 * 자바스크립트가 없으면 슬라이드는 세로 목록, 탭은 제목이 붙은 구역으로 그대로 보인다(is-ready 클래스가 붙어야 위젯 모양이 된다).
 * 슬라이드는 멈춤·재생 버튼을 제공하고, 움직임 줄이기 설정이면 자동 재생하지 않는다. 외부로 보내는 데이터는 없다.
 */
(function () {
  'use strict';

  var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }
  function icon(name) {
    var i = el('i', 'th-fa th-fa-' + name);
    i.setAttribute('aria-hidden', 'true');
    return i;
  }
  function roundButton(label, iconName) {
    var b = el('button', 'th-round-btn');
    b.type = 'button';
    b.setAttribute('aria-label', label);
    b.appendChild(icon(iconName));
    return b;
  }

  // ── 슬라이드 배너 ──
  function initCarousel(root) {
    var track = root.querySelector('.th-carousel-track');
    if (!track) return;
    var slides = [].slice.call(track.children);
    var total = slides.length;
    if (total < 2) { root.classList.add('is-ready'); return; }

    var interval = Math.max(3000, parseInt(root.getAttribute('data-interval') || '6000', 10) || 6000);
    var playing = root.getAttribute('data-autoplay') !== 'false' && !reduceMotion;
    var index = 0;
    var timer = null;
    var paused = false; // 마우스·초점이 있는 동안의 임시 멈춤

    var controls = el('div', 'th-carousel-controls');
    var toggle = roundButton('', 'pause');
    var dotsWrap = el('div', 'th-carousel-dots');
    var counter = el('span', 'th-carousel-count');
    counter.setAttribute('aria-hidden', 'true');
    var prev = roundButton('이전 슬라이드', 'chevron-left');
    var next = roundButton('다음 슬라이드', 'chevron-right');
    var dots = slides.map(function (_, i) {
      var d = el('button', 'th-carousel-dot');
      d.type = 'button';
      d.setAttribute('aria-label', (i + 1) + '번 슬라이드로 이동');
      d.addEventListener('click', function () { show(i); });
      dotsWrap.appendChild(d);
      return d;
    });
    controls.appendChild(toggle);
    controls.appendChild(dotsWrap);
    controls.appendChild(counter);
    controls.appendChild(prev);
    controls.appendChild(next);
    root.appendChild(controls);

    function show(i) {
      index = (i + total) % total;
      track.style.transform = 'translateX(' + (-100 * index) + '%)';
      slides.forEach(function (slide, k) {
        var on = k === index;
        slide.setAttribute('aria-hidden', on ? 'false' : 'true');
        if (on) slide.removeAttribute('inert'); else slide.setAttribute('inert', '');
      });
      dots.forEach(function (d, k) {
        if (k === index) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current');
      });
      counter.textContent = (index + 1) + ' / ' + total;
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function start() {
      stop();
      if (playing && !paused && !document.hidden) timer = setInterval(function () { show(index + 1); }, interval);
    }
    function renderToggle() {
      var label = playing ? '자동 재생 멈춤' : '자동 재생 시작';
      toggle.setAttribute('aria-label', label);
      toggle.firstChild.className = 'th-fa th-fa-' + (playing ? 'pause' : 'play');
      // 자동 재생 중에는 화면 읽기 프로그램이 슬라이드를 계속 읽지 않도록 하고, 직접 넘길 때만 알린다.
      track.setAttribute('aria-live', playing ? 'off' : 'polite');
    }

    toggle.addEventListener('click', function () { playing = !playing; renderToggle(); start(); });
    prev.addEventListener('click', function () { show(index - 1); start(); });
    next.addEventListener('click', function () { show(index + 1); start(); });
    root.addEventListener('mouseenter', function () { paused = true; stop(); });
    root.addEventListener('mouseleave', function () { paused = false; start(); });
    root.addEventListener('focusin', function () { paused = true; stop(); });
    root.addEventListener('focusout', function (event) {
      if (!root.contains(event.relatedTarget)) { paused = false; start(); }
    });
    root.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowLeft') { show(index - 1); start(); }
      else if (event.key === 'ArrowRight') { show(index + 1); start(); }
    });
    document.addEventListener('visibilitychange', start);

    // 터치로 밀어서 넘기기
    var startX = null;
    root.addEventListener('pointerdown', function (event) { if (event.pointerType === 'touch') startX = event.clientX; });
    root.addEventListener('pointerup', function (event) {
      if (startX === null) return;
      var dx = event.clientX - startX;
      startX = null;
      if (Math.abs(dx) > 40) { show(index + (dx < 0 ? 1 : -1)); start(); }
    });

    root.classList.add('is-ready');
    renderToggle();
    show(0);
    start();
  }

  // ── 탭 ──
  function initTabs(root) {
    var panels = [].slice.call(root.querySelectorAll(':scope > .th-tabpanel'));
    if (panels.length < 2) return;
    var uid = 'th-tabs-' + Math.random().toString(36).slice(2, 7);
    var list = el('div', 'th-tabs-list');
    list.setAttribute('role', 'tablist');
    var tabs = panels.map(function (panel, i) {
      var tab = el('button', 'th-tab', panel.getAttribute('data-tab-title') || ('탭 ' + (i + 1)));
      tab.type = 'button';
      tab.id = uid + '-tab-' + i;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', uid + '-panel-' + i);
      panel.id = uid + '-panel-' + i;
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', tab.id);
      var title = panel.querySelector('.th-tabpanel-title');
      if (title) title.classList.add('th-sr-only');
      list.appendChild(tab);
      return tab;
    });
    function select(i, focus) {
      tabs.forEach(function (tab, k) {
        var on = k === i;
        tab.setAttribute('aria-selected', String(on));
        tab.tabIndex = on ? 0 : -1;
        panels[k].hidden = !on;
      });
      if (focus) tabs[i].focus();
    }
    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { select(i, false); });
      tab.addEventListener('keydown', function (event) {
        var to = -1;
        if (event.key === 'ArrowRight') to = (i + 1) % tabs.length;
        else if (event.key === 'ArrowLeft') to = (i - 1 + tabs.length) % tabs.length;
        else if (event.key === 'Home') to = 0;
        else if (event.key === 'End') to = tabs.length - 1;
        if (to < 0) return;
        event.preventDefault();
        select(to, true);
      });
    });
    root.insertBefore(list, panels[0]);
    root.classList.add('is-ready');
    select(0, false);
  }

  // ── 카드뉴스 ──
  function initCardNews(root) {
    var track = root.querySelector('.th-cardnews-track');
    if (!track) return;
    var items = [].slice.call(track.children);
    if (!items.length) return;
    var head = root.querySelector('.th-cardnews-head');
    var nav = el('div', 'th-cardnews-nav');
    var counter = el('span', 'th-carousel-count');
    counter.setAttribute('role', 'status');
    var prev = roundButton('이전 카드', 'chevron-left');
    var next = roundButton('다음 카드', 'chevron-right');
    nav.appendChild(counter);
    nav.appendChild(prev);
    nav.appendChild(next);
    if (head) head.appendChild(nav); else root.insertBefore(nav, track);
    track.tabIndex = 0;
    track.setAttribute('role', 'region');
    if (!track.getAttribute('aria-label')) track.setAttribute('aria-label', '카드뉴스(좌우로 넘겨 보기)');

    function step() {
      var a = items[0].getBoundingClientRect();
      var b = items[1] ? items[1].getBoundingClientRect() : null;
      return b ? b.left - a.left : a.width;
    }
    function current() { return Math.max(0, Math.min(items.length - 1, Math.round(track.scrollLeft / (step() || 1)))); }
    function update() {
      var i = current();
      var atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
      if (atEnd) i = items.length - 1;
      counter.textContent = (i + 1) + ' / ' + items.length;
      prev.setAttribute('aria-disabled', String(track.scrollLeft <= 2));
      next.setAttribute('aria-disabled', String(atEnd));
    }
    function go(direction) {
      track.scrollBy({ left: direction * step(), behavior: reduceMotion ? 'auto' : 'smooth' });
    }
    prev.addEventListener('click', function () { go(-1); });
    next.addEventListener('click', function () { go(1); });
    var ticking = false;
    track.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { ticking = false; update(); });
    });
    window.addEventListener('resize', update);
    root.classList.add('is-ready');
    update();
  }

  [].forEach.call(document.querySelectorAll('[data-th-carousel]'), initCarousel);
  [].forEach.call(document.querySelectorAll('[data-th-tabs]'), initTabs);
  [].forEach.call(document.querySelectorAll('[data-th-cardnews]'), initCardNews);
})();
