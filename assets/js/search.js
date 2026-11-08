/*
 * 검색 페이지(layout: search) 스크립트. 외부 라이브러리와 외부 요청 없이, 빌드 때 만든 /assets/search-index.json 한 파일만 읽는다.
 * - 공백으로 나눈 단어가 모두 들어 있는 글만 보여 준다(제목, 태그, 요약, 본문의 부분 문자열 일치 — 형태소 분석이 필요 없는 한국어에 맞다).
 * - 점수: 제목 > 태그 > 요약 > 본문. 같으면 최신 글 먼저.
 * - 태그 칩(KRDS 체크박스 칩)으로 좁히기(선택한 태그를 모두 가진 글).
 * - 주소(?q=…&tag=…)와 동기화해 결과를 링크로 공유할 수 있다.
 * 사용자 입력과 색인 내용은 모두 textContent·DOM 노드로만 넣는다(innerHTML 미사용).
 */
(function () {
  'use strict';

  var root = document.querySelector('[data-th-search]');
  if (!root) return;

  var PAGE = 20;
  var form = root.querySelector('.th-search-form');
  var input = root.querySelector('input[name="q"]');
  var tagBox = root.querySelector('.th-search-tags');
  var tagArea = tagBox.querySelector('.krds-check-area');
  var statusEl = root.querySelector('.th-search-status');
  var listEl = root.querySelector('.th-search-results');
  var moreWrap = root.querySelector('.th-search-more');
  var moreBtn = moreWrap.querySelector('button');
  var tagsUrl = root.getAttribute('data-tags-url');

  var docs = null;      // 색인 항목
  var selected = [];    // 선택한 태그
  var results = [];     // 현재 검색 결과
  var shown = 0;
  var timer = null;

  function norm(s) { return String(s || '').normalize('NFC').toLowerCase(); }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  // 색인에는 Liquid 가 렌더링되기 전의 페이지 원문이 섞일 수 있어 {% … %}, {{ … }} 를 지운다.
  function clean(s) {
    return String(s || '').normalize('NFC')
      .replace(/\{%[\s\S]*?%\}/g, ' ').replace(/\{\{[\s\S]*?\}\}/g, ' ')
      .replace(/\s+/g, ' ').trim();
  }

  function tokensOf(q) { return norm(q).split(/\s+/).filter(Boolean); }

  // 일치한 부분을 <mark> 로 감싸 parent 에 붙인다.
  function appendMarked(parent, text, tokens) {
    if (!tokens.length) { parent.appendChild(document.createTextNode(text)); return; }
    var re = new RegExp('(' + tokens.map(escapeRe).join('|') + ')', 'gi');
    var last = 0, m;
    while ((m = re.exec(text)) !== null) {
      if (m[0] === '') { re.lastIndex++; continue; }
      if (m.index > last) parent.appendChild(document.createTextNode(text.slice(last, m.index)));
      parent.appendChild(el('mark', null, m[0]));
      last = m.index + m[0].length;
    }
    if (last < text.length) parent.appendChild(document.createTextNode(text.slice(last)));
  }

  function snippet(d, tokens) {
    var text = d.c;
    if (!text) return d.l || '';
    var at = -1;
    for (var i = 0; i < tokens.length && at < 0; i++) at = d._c.indexOf(tokens[i]);
    if (at < 0) return text.length > 140 ? text.slice(0, 140) + '…' : text;
    var from = Math.max(0, at - 50), to = Math.min(text.length, at + 110);
    return (from > 0 ? '…' : '') + text.slice(from, to) + (to < text.length ? '…' : '');
  }

  function score(d, tokens) {
    var total = 0;
    for (var i = 0; i < tokens.length; i++) {
      var t = tokens[i], s = 0, p;
      p = d._t.indexOf(t);
      if (p >= 0) s += 10 + (p === 0 ? 5 : 0);
      for (var g = 0; g < d._g.length; g++) {
        if (d._g[g] === t) { s += 8; break; }
        if (d._g[g].indexOf(t) >= 0) { s += 4; break; }
      }
      if (d._l.indexOf(t) >= 0) s += 3;
      var c = d._c, n = 0, from = 0;
      while (n < 5 && (from = c.indexOf(t, from)) >= 0) { n++; from += t.length; }
      s += n;
      if (!s) return 0;           // 모든 단어가 어딘가에 있어야 한다
      total += s;
    }
    return total;
  }


  // ── 문장(질문) 검색 ────────────────────────────────────────────────
  // 색인의 s(소제목별 본문)를 600자 안팎으로 나누고, 글자 두 개(bigram)가 겹치는 정도에 희귀도(idf)를 곱해 점수를 낸다.
  // 모델이나 형태소 분석 없이 "…할 수 있나요?"처럼 조사·어미가 붙은 질문도 찾는다. 외부 요청은 없다.
  var ASK_WINDOW = 600, ASK_MAX_TOTAL = 3000000, ASK_SHOW = 5, ASK_PER_PAGE = 2;
  var ASK_MIN_REL = 0.17;   // ln(1+단위 수)에 대한 최소 점수 비율(범위 밖 질문을 거른다)
  var ASK_TITLE = 0.5;      // 글 제목·소제목에 겹친 조각에 주는 가점 비율
  var ASK_MIN_TOP = 0.4;    // 1위 점수에 대한 최소 비율
  var LETTER = /[\p{L}\p{N}]/u;
  var ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
  var askEl = root.querySelector('.th-search-ask');
  var askList = askEl && askEl.querySelector('.th-search-ask-list');
  var askResults = [];
  var units = null, unitDf = null;

  // 이름 있는 엔티티와 숫자 엔티티(&#34; &#x22;)를 풀어 쓴다. 색인 생성 단계에서 한 번 더 이스케이프된 경우를 위해 두 번까지 푼다.
  function decode(s) {
    var out = String(s || '');
    for (var pass = 0; pass < 2; pass++) {
      var next = out.replace(/&(#x[0-9a-f]+|#[0-9]+|amp|lt|gt|quot|apos|nbsp);/gi, function (m, e) {
        if (e.charAt(0) === '#') {
          var n = e.charAt(1).toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
          return n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : m;
        }
        return ENT[e.toLowerCase()];
      });
      if (next === out) break;
      out = next;
    }
    return out;
  }
  // 위키 문서의 [[문서|표시 글]] 표기는 표시 글(없으면 문서 이름)만 남긴다.
  function unwiki(s) { return s.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, function (m, a, b) { return b || a; }); }

  // 글자·숫자만 이어 붙인 문자열(t)과 각 글자의 원문 위치(pos)
  function letterGrams(text) {
    var t = '', pos = [];
    for (var i = 0; i < text.length; i++) {
      var ch = text.charAt(i);
      if (LETTER.test(ch)) { t += ch.toLowerCase(); pos.push(i); }
    }
    return { t: t, pos: pos };
  }

  function gramsOf(t) {
    var m = Object.create(null), n = 0;
    for (var i = 0; i < t.length - 1; i++) { var k = t.substr(i, 2); m[k] = (m[k] || 0) + 1; n++; }
    return { m: m, n: n };
  }

  function splitWindows(text) {
    var out = [], from = 0;
    while (from < text.length) {
      var to = Math.min(text.length, from + ASK_WINDOW);
      if (to < text.length) { var sp = text.lastIndexOf(' ', to); if (sp > from + ASK_WINDOW * 0.6) to = sp; }
      var piece = text.slice(from, to).trim();
      if (piece.length >= 15) out.push(piece);
      from = to;
    }
    return out;
  }

  // 처음 문장 검색을 할 때 한 번만 만든다. 본문이 너무 크면(약 3MB 초과) 끈다.
  function buildUnits() {
    var total = 0;
    docs.forEach(function (d) { (d.s || []).forEach(function (sec) { total += String(sec.c || '').length; }); });
    units = []; unitDf = Object.create(null);
    if (!total || total > ASK_MAX_TOTAL) return;
    docs.forEach(function (d) {
      (d.s || []).forEach(function (sec) {
        var head = clean(decode(sec.h));
        splitWindows(unwiki(clean(decode(sec.c)))).forEach(function (w) {
          var g = gramsOf(letterGrams(d.t + ' ' + head + ' ' + w).t);
          units.push({ d: d, h: head, a: sec.a || '', text: w, g: g.m, n: g.n, th: gramsOf(letterGrams(d.t + ' ' + head).t).m });
          for (var k in g.m) unitDf[k] = (unitDf[k] || 0) + 1;
        });
      });
    });
  }

  function ask(q, tokens) {
    if (!askEl || !docs || !tokens.length) return [];
    // 단어가 모두 일치하는 글이 있고 질문처럼 길지 않으면(3단어 이하) 따로 보태지 않는다.
    if (results.length && tokens.length < 4) return [];
    if (!units) buildUnits();
    if (!units.length) return [];
    var qg = gramsOf(letterGrams(q).t).m, keys = Object.keys(qg);
    if (keys.length < 2) return [];
    var N = units.length, scale = Math.log(1 + N), idf = Object.create(null), hl = Object.create(null);
    keys.forEach(function (k) {
      idf[k] = Math.log(1 + N / (unitDf[k] || 0.5));
      if ((unitDf[k] || 0) <= N * 0.3) hl[k] = true;     // 너무 흔한 조각은 강조하지 않는다
    });
    var scored = [];
    units.forEach(function (u) {
      for (var i = 0; i < selected.length; i++) if (u.d.g.indexOf(selected[i]) < 0) return;
      var s = 0;
      for (var j = 0; j < keys.length; j++) {
        if (u.g[keys[j]]) s += idf[keys[j]];
        if (u.th[keys[j]]) s += ASK_TITLE * idf[keys[j]];
      }
      if (s) scored.push({ u: u, s: s / Math.sqrt(1 + u.n), hl: hl });
    });
    if (!scored.length) return [];
    scored.sort(function (a, b) { return b.s - a.s; });
    var min = Math.max(ASK_MIN_REL * scale, ASK_MIN_TOP * scored[0].s);
    var out = [], per = Object.create(null), seen = Object.create(null);
    for (var r = 0; r < scored.length && out.length < ASK_SHOW; r++) {
      if (scored[r].s < min) break;
      var key = scored[r].u.d.u, sect = key + '#' + scored[r].u.a + '|' + scored[r].u.h;
      if (seen[sect] || (per[key] || 0) >= ASK_PER_PAGE) continue;   // 같은 소제목은 한 번만, 한 글에서는 최대 2개
      seen[sect] = true;
      per[key] = (per[key] || 0) + 1;
      out.push(scored[r]);
    }
    return out;
  }

  // 강조가 가장 몰린 구간을 잘라 보여 주고, 겹친 글자 조각을 <mark>로 감싼다.
  function fillAskSnippet(p, u, hl) {
    var L = letterGrams(u.text), flag = [], hits = [], i;
    for (i = 0; i < L.t.length - 1; i++) {
      if (hl[L.t.substr(i, 2)]) { flag[L.pos[i]] = true; flag[L.pos[i + 1]] = true; hits.push(L.pos[i]); }
    }
    var best = 0, bestN = -1;
    for (var h = 0; h < hits.length; h++) {
      var n = 0;
      for (var x = h; x < hits.length && hits[x] < hits[h] + 140; x++) n++;
      if (n > bestN) { bestN = n; best = hits[h]; }
    }
    var text = u.text, from = Math.max(0, best - 20), to = Math.min(text.length, from + 160);
    if (from > 0) { var sp = text.indexOf(' ', from); if (sp > 0 && sp < from + 20) from = sp + 1; }
    if (from > 0) p.appendChild(document.createTextNode('…'));
    var buf = '', marked = false;
    function flush() {
      if (!buf) return;
      if (marked) p.appendChild(el('mark', null, buf)); else p.appendChild(document.createTextNode(buf));
      buf = '';
    }
    for (i = from; i < to; i++) {
      var ch = text.charAt(i);
      var on = !!flag[i] || (/\s/.test(ch) && flag[i - 1] && flag[i + 1]);
      if (on !== marked) { flush(); marked = on; }
      buf += ch;
    }
    flush();
    if (to < text.length) p.appendChild(document.createTextNode('…'));
  }

  function askItem(r) {
    var u = r.u;
    var li = el('li', 'th-search-item');
    var h = el('h3', 'th-search-title');
    var a = el('a', null, u.d.t + (u.h && u.h !== u.d.t ? ' › ' + u.h : ''));
    a.href = u.d.u + (u.a ? '#' + u.a : '');
    h.appendChild(a);
    li.appendChild(h);
    var p = el('p', 'th-search-snippet');
    fillAskSnippet(p, u, r.hl);
    li.appendChild(p);
    return li;
  }

  function renderAsk() {
    if (!askEl) return;
    askList.textContent = '';
    askResults.forEach(function (r) { askList.appendChild(askItem(r)); });
    askEl.hidden = !askResults.length;
  }

  function search() {
    var q = input.value;
    var tokens = tokensOf(q);
    results = [];
    if (docs && (tokens.length || selected.length)) {
      docs.forEach(function (d) {
        for (var i = 0; i < selected.length; i++) if (d.g.indexOf(selected[i]) < 0) return;
        var s = tokens.length ? score(d, tokens) : 1;
        if (s) results.push({ d: d, s: s });
      });
      results.sort(function (a, b) { return b.s - a.s || (b.d.d > a.d.d ? 1 : b.d.d < a.d.d ? -1 : 0); });
    }
    askResults = ask(q, tokens);
    shown = 0;
    listEl.textContent = '';
    render(tokens);
    renderAsk();
    updateStatus(q, tokens);
    syncUrl(q);
  }

  function resultItem(r, tokens) {
    var d = r.d;
    var li = el('li', 'th-search-item');
    var h = el('h2', 'th-search-title');
    var a = el('a');
    a.href = d.u;
    appendMarked(a, d.t, tokens);
    h.appendChild(a);
    li.appendChild(h);

    var meta = el('div', 'th-meta');
    meta.appendChild(el('span', 'th-search-kind', d.k === 'post' ? '글' : '문서'));
    if (d.d) { var time = el('time', null, d.d); meta.appendChild(time); }
    if (d.g.length) {
      var wrap = el('div', 'krds-tag-wrap small');
      wrap.setAttribute('role', 'group');
      wrap.setAttribute('aria-label', '태그');
      d.g.forEach(function (g) {
        var tag = el('a', 'krds-btn-tag link', g);
        tag.href = '?tag=' + encodeURIComponent(g);
        wrap.appendChild(tag);
      });
      meta.appendChild(wrap);
    }
    li.appendChild(meta);

    var sn = snippet(d, tokens);
    if (sn) { var p = el('p', 'th-search-snippet'); appendMarked(p, sn, tokens); li.appendChild(p); }
    return li;
  }

  function render(tokens) {
    var end = Math.min(results.length, shown + PAGE);
    for (var i = shown; i < end; i++) listEl.appendChild(resultItem(results[i], tokens));
    shown = end;
    moreWrap.hidden = shown >= results.length;
  }

  function updateStatus(q, tokens) {
    var msg;
    if (!docs) msg = '검색 색인을 불러오는 중입니다.';
    else if (!tokens.length && !selected.length) msg = '검색어를 입력하거나 태그를 선택해 주세요. 전체 ' + docs.length + '건을 검색합니다.';
    else if (!results.length && askResults.length) msg = '입력한 모든 단어가 들어 있는 글은 없습니다. 질문과 가까운 내용 ' + askResults.length + '건을 아래에 보여 드립니다.';
    else if (!results.length) msg = '검색 결과가 없습니다. 다른 단어로 검색하거나 태그 선택을 줄여 보세요.';
    else {
      var what = [];
      if (q.trim()) what.push('‘' + q.trim() + '’');
      if (selected.length) what.push('태그 ' + selected.join(', '));
      msg = what.join(' · ') + ' 검색 결과 ' + results.length + '건';
      if (askResults.length) msg += ' · 질문과 가까운 내용 ' + askResults.length + '건';
    }
    statusEl.textContent = msg;
  }

  function syncUrl(q) {
    var p = new URLSearchParams();
    if (q.trim()) p.set('q', q.trim());
    selected.forEach(function (t) { p.append('tag', t); });
    var s = p.toString();
    try { history.replaceState(null, '', location.pathname + (s ? '?' + s : '')); } catch (e) { /* file:// 등 */ }
  }

  function buildTagChips() {
    var counts = {};
    docs.forEach(function (d) { d.g.forEach(function (t) { counts[t] = (counts[t] || 0) + 1; }); });
    var names = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a] || a.localeCompare(b, 'ko'); });
    if (!names.length) return;
    names.forEach(function (name, i) {
      var id = 'th-search-tag-' + i;
      var chip = el('div', 'krds-form-chip');
      var box = el('input', 'checkbox');
      box.type = 'checkbox'; box.id = id; box.value = name;
      box.checked = selected.indexOf(name) >= 0;
      box.addEventListener('change', function () {
        selected = [].slice.call(tagArea.querySelectorAll('input:checked')).map(function (b) { return b.value; });
        search();
      });
      var label = el('label', 'krds-form-chip-outline', name + ' (' + counts[name] + ')');
      label.setAttribute('for', id);
      chip.appendChild(box); chip.appendChild(label);
      tagArea.appendChild(chip);
    });
    if (tagsUrl) {
      var more = el('p', 'th-search-tags-link');
      var a = el('a', null, '태그 페이지에서 모두 보기');
      a.href = tagsUrl;
      more.appendChild(a);
      tagBox.appendChild(more);
    }
    tagBox.hidden = false;
  }

  function prepare(list) {
    docs = list.map(function (d) {
      d.t = clean(d.t); d.c = clean(d.c); d.l = clean(d.l); d.g = d.g || [];
      d._t = norm(d.t); d._c = norm(d.c); d._l = norm(d.l); d._g = d.g.map(norm);
      return d;
    });
  }

  // 시작: 주소에서 상태 복원
  var params = new URLSearchParams(location.search);
  input.value = params.get('q') || '';
  selected = params.getAll('tag');
  updateStatus(input.value, tokensOf(input.value));

  form.addEventListener('submit', function (e) { e.preventDefault(); clearTimeout(timer); search(); });
  input.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(search, 200); });
  moreBtn.addEventListener('click', function () {
    var first = shown;
    render(tokensOf(input.value));
    var items = listEl.children;
    var target = items[first] && items[first].querySelector('a');
    if (target) target.focus();
  });

  fetch(root.getAttribute('data-index'), { credentials: 'same-origin' })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (list) {
      prepare(list);
      buildTagChips();
      search();
      if (!input.value) input.focus();
    })
    .catch(function () {
      statusEl.textContent = '검색 색인을 불러오지 못했습니다. 잠시 뒤 다시 시도해 주세요.';
    });
}());
