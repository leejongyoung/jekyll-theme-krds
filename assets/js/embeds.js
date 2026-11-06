/*
 * jekyll-theme-krds: 임베드(재생 버튼 뒤의 iframe), Mermaid 다이어그램, Chart.js 차트.
 * 필요한 페이지에서만 불러온다(_layouts/default.html). Mermaid·Chart.js 주소는 이 스크립트 태그의 data 속성으로 받는다.
 *
 * - 외부 서비스(YouTube 등)는 사용자가 버튼을 누르기 전에는 연결하지 않는다.
 * - ```mermaid 코드 블록 → 다이어그램(원문 보기 포함), ```chart 코드 블록(JSON) → 차트(데이터 표 포함)
 * - 화면 모드(기본/선명하게/시스템 설정)가 바뀌면 다이어그램과 차트를 현재 색으로 다시 그린다.
 * - JavaScript가 없으면 코드 블록이 그대로 보인다.
 */
(function () {
  'use strict';

  var script = document.currentScript;
  var cfg = (script && script.dataset) || {};
  var root = document.documentElement;

  function abs(path) {
    try { return new URL(path, location.href).href; } catch (e) { return null; }
  }
  function cssVar(name) {
    return getComputedStyle(root).getPropertyValue(name).trim();
  }
  function isDark() {
    var m = root.getAttribute('data-krds-mode');
    return m === 'high-contrast' || (m === 'theme' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  // 화면 모드가 바뀔 때 다시 그리는 함수를 모아 둔다(전환마다 한 번만 실행).
  var redraw = [];
  var queued = false;
  function scheduleRedraw() {
    if (queued) return;
    queued = true;
    setTimeout(function () { queued = false; redraw.forEach(function (fn) { fn(); }); }, 0);
  }
  new MutationObserver(scheduleRedraw).observe(root, { attributes: true, attributeFilter: ['data-krds-mode'] });
  if (window.matchMedia) {
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    if (mq.addEventListener) mq.addEventListener('change', scheduleRedraw);
  }

  // 1) 재생(불러오기) 버튼 ------------------------------------------------------
  function loadEmbed(fig) {
    var u;
    try { u = new URL(fig.getAttribute('data-embed-src')); } catch (e) { return; }
    if (u.protocol !== 'https:') return;
    var frame = fig.querySelector('.th-embed-frame');
    if (!frame) return;
    var iframe = document.createElement('iframe');
    iframe.src = u.href;
    iframe.title = fig.getAttribute('data-embed-title') || '임베드된 콘텐츠';
    iframe.setAttribute('allowfullscreen', '');
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    var allow = fig.getAttribute('data-embed-allow');
    if (allow) iframe.setAttribute('allow', allow);
    var sandbox = fig.getAttribute('data-embed-sandbox');
    if (sandbox) iframe.setAttribute('sandbox', sandbox);
    frame.textContent = '';
    frame.appendChild(iframe);
    fig.classList.add('is-loaded');
    iframe.focus(); // 버튼이 사라지므로 키보드 포커스를 옮긴다
  }
  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('.th-embed-play');
    if (!btn) return;
    var fig = btn.closest('[data-th-embed]');
    if (fig) loadEmbed(fig);
  });

  // 2) Mermaid ------------------------------------------------------------------
  var mermaidPromise = null;
  function loadMermaid() {
    if (!mermaidPromise) {
      var url = abs(cfg.mermaid);
      if (!url) return Promise.reject(new Error('Mermaid 주소가 없습니다'));
      mermaidPromise = import(url).then(function (m) { return m.default || m; });
    }
    return mermaidPromise;
  }

  function showBlockError(host, cls, message, openDetails) {
    host.textContent = '';
    var p = el('p', cls, message);
    p.setAttribute('role', 'alert');
    host.appendChild(p);
    if (openDetails) openDetails.open = true;
  }

  function initDiagrams() {
    var codes = document.querySelectorAll('pre > code.language-mermaid');
    if (!codes.length || !cfg.mermaid) return;
    var items = [];
    var counter = 0;
    Array.prototype.forEach.call(codes, function (code, i) {
      var pre = code.parentNode;
      var source = code.textContent;
      var fig = el('figure', 'th-diagram');
      var canvas = el('div', 'th-diagram-canvas');
      canvas.setAttribute('role', 'group');
      var details = el('details', 'th-diagram-source');
      details.appendChild(el('summary', null, '다이어그램 원문 보기'));
      details.appendChild(el('pre', null, source));
      fig.appendChild(canvas);
      fig.appendChild(details);
      pre.parentNode.replaceChild(fig, pre);
      items.push({ canvas: canvas, details: details, source: source, id: 'th-mermaid-' + i });
    });

    function draw() {
      loadMermaid().then(function (mermaid) {
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict', // 다이어그램 안의 HTML·스크립트를 정리한다
          layout: 'dagre', // 기본값이 elk를 요청하므로 명시한다(elk 조각은 용량 때문에 가져오지 않았다. script/vendor-mermaid 참고)
          theme: 'base', // 기본 dark/default 테마 대신 KRDS 토큰으로 색을 정해 두 화면 모드에서 대비를 보장한다
          themeVariables: mermaidVars()
        });
        return items.reduce(function (chain, it) {
          return chain.then(function () {
            return mermaid.render(it.id + '-' + (++counter), it.source).then(function (r) {
              it.canvas.innerHTML = r.svg; // mermaid가 strict 모드로 정리한 SVG
              if (r.bindFunctions) r.bindFunctions(it.canvas);
            }).catch(function (err) {
              showBlockError(it.canvas, 'th-diagram-error', '다이어그램을 그리지 못했습니다: ' + ((err && err.message) || err), it.details);
              var stray = document.getElementById('d' + it.id + '-' + counter);
              if (stray) stray.remove();
            });
          });
        }, Promise.resolve());
      }).catch(function (err) {
        items.forEach(function (it) {
          showBlockError(it.canvas, 'th-diagram-error', 'Mermaid를 불러오지 못했습니다: ' + ((err && err.message) || err), it.details);
        });
      });
    }
    draw();
    redraw.push(draw);
  }

  // 3) 차트 (Chart.js) ---------------------------------------------------------
  var CHART_TYPES = ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'scatter', 'bubble'];
  // KRDS 색 그룹. 밝은 모드는 50단계(흰 배경 대비 4.5:1 이상), 선명한 모드는 40단계(검정 배경 대비 6:1 이상)를 쓴다.
  var GROUPS = ['primary', 'point', 'success', 'warning', 'secondary', 'information', 'danger', 'graphic'];
  var POINTS = ['circle', 'rect', 'triangle', 'rectRot', 'star'];

  // Mermaid 색: 현재 화면 모드의 KRDS 토큰에서 가져온다.
  function mermaidVars() {
    var dark = isDark();
    var text = cssVar('--th-text');
    var bg = cssVar('--th-bg');
    var subtle = cssVar('--th-bg-subtle');
    var border = cssVar('--th-border-strong');
    var v = {
      fontFamily: cssVar('--krds-typo-font-type') || 'sans-serif',
      background: bg, textColor: text, titleColor: text, lineColor: text,
      primaryColor: subtle, primaryTextColor: text, primaryBorderColor: border,
      secondaryColor: subtle, secondaryTextColor: text, secondaryBorderColor: border,
      tertiaryColor: bg, tertiaryTextColor: text, tertiaryBorderColor: border,
      edgeLabelBackground: bg, clusterBkg: subtle, clusterBorder: border,
      noteBkgColor: subtle, noteTextColor: text, noteBorderColor: border,
      actorBkg: subtle, actorBorder: border, actorTextColor: text, actorLineColor: border,
      signalColor: text, signalTextColor: text,
      labelBoxBkgColor: subtle, labelBoxBorderColor: border, labelTextColor: text, loopTextColor: text,
      activationBkgColor: subtle, activationBorderColor: border,
      pieStrokeColor: bg, pieOuterStrokeColor: border, pieTitleTextColor: text, pieLegendTextColor: text,
      pieOpacity: '1', // 기본값 0.7이면 조각 색이 흐려져 글자 대비가 떨어진다
      // 조각 안의 글자색: 밝은 모드(50단계, 어두운 색)는 흰색, 선명한 모드(40단계, 밝은 색)는 검정이 4.5:1 이상이다.
      pieSectionTextColor: dark ? '#000000' : '#ffffff'
    };
    for (var i = 1; i <= 12; i++) v['pie' + i] = palette(i - 1);
    return v;
  }

  function palette(i) {
    var dark = isDark();
    var g = GROUPS[i % GROUPS.length];
    var level = (g === 'graphic') ? 50 : (dark ? 40 : 50);
    return cssVar('--krds-color-' + (dark ? 'high-contrast' : 'light') + '-' + g + '-' + level);
  }
  function merge(base, extra) {
    if (!extra || typeof extra !== 'object') return base;
    Object.keys(extra).forEach(function (k) {
      if (extra[k] && typeof extra[k] === 'object' && !Array.isArray(extra[k]) && base[k] && typeof base[k] === 'object') merge(base[k], extra[k]);
      else base[k] = extra[k];
    });
    return base;
  }

  function makeConfig(spec) {
    var cfgObj = JSON.parse(JSON.stringify(spec)); // 원본(spec)은 모드가 바뀔 때 다시 쓰므로 복사한다
    delete cfgObj.title; delete cfgObj.description; delete cfgObj.height;
    var type = cfgObj.type;
    var text = cssVar('--th-text');
    var grid = cssVar('--th-border');
    var surface = cssVar('--th-bg');
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var circular = type === 'pie' || type === 'doughnut' || type === 'polarArea';

    cfgObj.options = merge({
      responsive: true,
      maintainAspectRatio: false,
      animation: reduce ? false : undefined,
      color: text,
      font: { family: cssVar('--krds-typo-font-type') || 'sans-serif', size: 14 },
      plugins: { legend: { labels: { color: text } }, title: { color: text } },
      scales: circular ? undefined : {
        x: { ticks: { color: text }, grid: { color: grid }, border: { color: grid } },
        y: { ticks: { color: text }, grid: { color: grid }, border: { color: grid }, beginAtZero: true }
      }
    }, cfgObj.options);
    if (type === 'radar' || type === 'polarArea') {
      cfgObj.options.scales = cfgObj.options.scales || {};
      cfgObj.options.scales.r = merge({ ticks: { color: text, backdropColor: 'transparent' }, grid: { color: grid }, angleLines: { color: grid }, pointLabels: { color: text } }, cfgObj.options.scales.r);
    }

    (cfgObj.data.datasets || []).forEach(function (ds, i) {
      var c = palette(i);
      if (circular) {
        if (!ds.backgroundColor) ds.backgroundColor = (cfgObj.data.labels || ds.data || []).map(function (_, j) { return palette(j); });
        if (!ds.borderColor) ds.borderColor = surface;
        if (ds.borderWidth == null) ds.borderWidth = 2;
      } else {
        if (!ds.backgroundColor) ds.backgroundColor = c;
        if (!ds.borderColor) ds.borderColor = c;
        if (type === 'line' || type === 'radar' || type === 'scatter' || type === 'bubble') {
          if (!ds.pointStyle) ds.pointStyle = POINTS[i % POINTS.length]; // 색만으로 구분하지 않도록 점 모양도 다르게 한다
          if (ds.borderWidth == null) ds.borderWidth = 2;
          if (ds.pointRadius == null && type !== 'bubble') ds.pointRadius = 4;
        }
      }
    });
    return cfgObj;
  }

  // 접근 가능한 데이터 표: 차트의 값을 표로도 보여 준다.
  function buildTable(spec, title) {
    var table = el('table');
    table.appendChild(el('caption', null, title));
    var d = spec.data || {};
    var sets = d.datasets || [];
    var pointData = sets.length && sets[0].data && sets[0].data.length && typeof sets[0].data[0] === 'object' && sets[0].data[0] !== null;
    var thead = el('thead');
    var hr = el('tr');
    var tbody = el('tbody');
    if (pointData) {
      ['계열', 'x', 'y'].concat(spec.type === 'bubble' ? ['크기'] : []).forEach(function (h) { hr.appendChild(Object.assign(el('th', null, h), { scope: 'col' })); });
      sets.forEach(function (ds, i) {
        (ds.data || []).forEach(function (p) {
          var tr = el('tr');
          tr.appendChild(el('td', null, ds.label || ('계열 ' + (i + 1))));
          tr.appendChild(el('td', null, String(p.x)));
          tr.appendChild(el('td', null, String(p.y)));
          if (spec.type === 'bubble') tr.appendChild(el('td', null, String(p.r)));
          tbody.appendChild(tr);
        });
      });
    } else {
      hr.appendChild(Object.assign(el('th', null, ''), { scope: 'col' }));
      sets.forEach(function (ds, i) { hr.appendChild(Object.assign(el('th', null, ds.label || ('계열 ' + (i + 1))), { scope: 'col' })); });
      (d.labels || []).forEach(function (label, r) {
        var tr = el('tr');
        tr.appendChild(Object.assign(el('th', null, String(label)), { scope: 'row' }));
        sets.forEach(function (ds) { tr.appendChild(el('td', null, ds.data && ds.data[r] != null ? String(ds.data[r]) : '')); });
        tbody.appendChild(tr);
      });
    }
    thead.appendChild(hr);
    table.appendChild(thead);
    table.appendChild(tbody);
    return table;
  }

  function initCharts() {
    var codes = document.querySelectorAll('pre > code.language-chart');
    if (!codes.length) return;
    if (typeof window.Chart !== 'function') return; // Chart.js가 없으면 코드 블록을 그대로 둔다
    var items = [];
    Array.prototype.forEach.call(codes, function (code) {
      var pre = code.parentNode;
      var host = el('figure', 'th-chart');
      var spec;
      try {
        spec = JSON.parse(code.textContent);
        if (!spec || CHART_TYPES.indexOf(spec.type) < 0 || !spec.data || typeof spec.data !== 'object') throw new Error('type(' + CHART_TYPES.join(', ') + ')과 data가 필요합니다');
      } catch (err) {
        showBlockError(host, 'th-diagram-error', '차트 설정(JSON)을 읽지 못했습니다: ' + err.message, null);
        pre.parentNode.replaceChild(host, pre);
        return;
      }
      var optTitle = spec.options && spec.options.plugins && spec.options.plugins.title && spec.options.plugins.title.text;
      var title = spec.title || optTitle || '차트';
      var wrap = el('div', 'th-chart-canvas');
      if (spec.height) wrap.style.setProperty('--th-chart-height', String(spec.height).replace(/[^0-9a-z.%]/gi, ''));
      var canvas = el('canvas');
      canvas.setAttribute('role', 'img');
      canvas.setAttribute('aria-label', title + (spec.description ? ': ' + spec.description : ''));
      wrap.appendChild(canvas);
      host.appendChild(wrap);
      if (spec.title || spec.description) {
        var cap = el('figcaption', 'th-chart-caption');
        if (spec.title) cap.appendChild(el('strong', null, spec.title));
        if (spec.description) cap.appendChild(document.createTextNode((spec.title ? ' · ' : '') + spec.description));
        host.appendChild(cap);
      }
      var details = el('details', 'th-chart-data');
      details.appendChild(el('summary', null, '데이터 표로 보기'));
      var tableWrap = el('div', 'th-table-wrap');
      tableWrap.appendChild(buildTable(spec, title));
      details.appendChild(tableWrap);
      host.appendChild(details);
      pre.parentNode.replaceChild(host, pre);
      items.push({ spec: spec, canvas: canvas, chart: null });
    });

    function draw() {
      items.forEach(function (it) {
        if (it.chart) it.chart.destroy();
        try {
          it.chart = new window.Chart(it.canvas, makeConfig(it.spec));
        } catch (err) {
          showBlockError(it.canvas.parentNode, 'th-diagram-error', '차트를 그리지 못했습니다: ' + err.message, null);
        }
      });
    }
    draw();
    redraw.push(draw);
  }

  initDiagrams();
  initCharts();
})();
