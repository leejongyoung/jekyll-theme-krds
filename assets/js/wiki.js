/*
 * 위키: [[문서 링크]] 해석, 역링크·관련 문서, 목록 검색·분류 필터, 작성이 필요한 문서·고아 문서.
 * 같은 사이트의 정적 인덱스(wiki-index.json)만 읽고, 어디에도 데이터를 보내지 않는다.
 * 문서 링크: [[제목]], [[제목|표시할 글]], [[제목#섹션]]. 제목·별칭·파일 이름(슬러그)으로 찾는다.
 */
(function () {
  'use strict';

  var root = document.querySelector('[data-wiki]');
  if (!root) return;
  var mode = root.getAttribute('data-wiki');

  function norm(s) {
    return String(s || '').normalize('NFC').replace(/\s+/g, ' ').trim().toLowerCase();
  }
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
  function slugOf(url) {
    var last = String(url || '').replace(/[?#].*$/, '').replace(/\/+$/, '').split('/').pop();
    try { return decodeURIComponent(last); } catch (e) { return last; }
  }
  function safeHref(value) {
    try {
      var url = new URL(value, location.href);
      return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null;
    } catch (e) { return null; }
  }

  // ── 인덱스 ──
  function loadIndex() {
    var url = root.getAttribute('data-index');
    if (!url) return Promise.reject(new Error('인덱스 주소가 없습니다.'));
    return fetch(url, { credentials: 'same-origin' }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    });
  }
  // 제목이 별칭·슬러그보다 먼저 자리를 잡는다.
  function buildLookup(items) {
    var map = Object.create(null);
    function put(key, item) {
      var n = norm(key);
      if (n && !map[n]) map[n] = item;
    }
    items.forEach(function (it) { put(it.t, it); });
    items.forEach(function (it) { put(slugOf(it.u), it); });
    items.forEach(function (it) { (it.a || []).forEach(function (alias) { put(alias, it); }); });
    return map;
  }
  function inbound(items, lookup) {
    var from = Object.create(null);
    items.forEach(function (it) {
      (it.l || []).forEach(function (target) {
        var hit = lookup[norm(target)];
        if (!hit || hit.u === it.u) return;
        (from[hit.u] = from[hit.u] || []).push(it);
      });
    });
    return from;
  }

  // ── 새 문서 만들기 주소(저장소 설정이 있을 때만) ──
  function newURL(title) {
    var base = root.getAttribute('data-new-base');
    if (!base) return null;
    var template = (root.getAttribute('data-new-template') || '').replace(/\\n/g, '\n');
    var name = title.replace(/[\\/:*?"<>|#%]/g, '').trim().replace(/\s+/g, '-');
    if (!name) return null;
    var now = new Date();
    var today = now.getFullYear() + '-' + ('0' + (now.getMonth() + 1)).slice(-2) + '-' + ('0' + now.getDate()).slice(-2);
    var value = template.replace(/\{title\}/g, title.replace(/"/g, "'")).replace(/\{date\}/g, today);
    return safeHref(base + encodeURIComponent(name) + '.md' + (value ? '&value=' + encodeURIComponent(value) : ''));
  }

  function linkList(parent, items, withSummary) {
    var ul = el('ul', 'th-wiki-link-list');
    items.forEach(function (it) {
      var li = el('li');
      var a = el('a', null, it.t);
      a.href = it.u;
      li.appendChild(a);
      if (withSummary && it.s) li.appendChild(el('span', 'th-wiki-link-summary', it.s));
      ul.appendChild(li);
    });
    parent.appendChild(ul);
  }

  // ───────────── 문서 페이지 ─────────────
  var WIKILINK = /\[\[([^\[\]\n|#]+?)(#[^\[\]\n|]*)?(?:\|([^\[\]\n]+?))?\]\]/g;
  var SKIP = /^(A|CODE|PRE|SCRIPT|STYLE|KBD|SAMP|TEXTAREA|BUTTON)$/;

  function makeLink(target, hash, label, lookup) {
    var text = (label || target).trim();
    if (!lookup) return el('span', 'th-wikilink', text);
    var hit = lookup[norm(target)];
    if (hit) {
      var a = el('a', 'th-wikilink', text);
      a.href = hit.u + hash;
      if (hit.s) a.title = hit.s;
      return a;
    }
    var create = newURL(target.trim());
    var missing = create ? el('a', 'th-wikilink is-missing', text) : el('span', 'th-wikilink is-missing', text);
    if (create) {
      missing.href = create;
      missing.target = '_blank';
      missing.rel = 'noopener';
    }
    missing.title = '아직 없는 문서입니다' + (create ? '. 눌러서 새로 만들 수 있습니다.' : '.');
    missing.appendChild(el('span', 'th-sr-only', ' (없는 문서)'));
    return missing;
  }

  function linkify(container, lookup) {
    var walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        if (node.nodeValue.indexOf('[[') === -1) return NodeFilter.FILTER_SKIP;
        for (var p = node.parentNode; p && p !== container; p = p.parentNode) {
          if (SKIP.test(p.nodeName)) return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (node) {
      var text = node.nodeValue;
      var frag = document.createDocumentFragment();
      var last = 0;
      var m;
      WIKILINK.lastIndex = 0;
      while ((m = WIKILINK.exec(text))) {
        if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
        frag.appendChild(makeLink(m[1], m[2] || '', m[3], lookup));
        last = m.index + m[0].length;
      }
      if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
      node.parentNode.replaceChild(frag, node);
    });
  }

  function section(host, titleText, iconName) {
    if (!host) return null;
    host.textContent = '';
    var h2 = el('h2');
    h2.appendChild(icon(iconName));
    h2.appendChild(document.createTextNode(titleText));
    host.appendChild(h2);
    host.hidden = false;
    return host;
  }

  function initArticle() {
    var content = root.querySelector('[data-wiki-content]');
    var self = root.getAttribute('data-page-url');
    var copyButton = root.querySelector('[data-wiki-copy]');
    var printButton = root.querySelector('[data-wiki-print]');
    var status = root.querySelector('[data-wiki-copy-status]');

    if (copyButton) {
      copyButton.addEventListener('click', function () {
        var url = location.href.split('#')[0];
        var done = function (ok) { if (status) status.textContent = ok ? '문서 주소를 복사했습니다.' : '복사하지 못했습니다. 주소창의 주소를 복사해 주세요.'; };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(function () { done(true); }, function () { done(false); });
        else done(false);
      });
    }
    if (printButton) printButton.addEventListener('click', function () { window.print(); });

    loadIndex().then(function (items) {
      var lookup = buildLookup(items);
      if (content) linkify(content, lookup);
      var from = inbound(items, lookup);

      var back = section(root.querySelector('[data-wiki-backlinks]'), '이 문서를 가리키는 문서', 'diagram-project');
      if (back) {
        var refs = (from[self] || []).slice().sort(function (a, b) { return a.t.localeCompare(b.t, 'ko'); });
        if (refs.length) linkList(back, refs, true);
        else back.appendChild(el('p', 'th-wiki-empty', '이 문서를 가리키는 다른 문서가 아직 없습니다.'));
      }

      var related = section(root.querySelector('[data-wiki-related]'), '관련 문서', 'book-open');
      if (related) {
        var current = items.filter(function (it) { return it.u === self; })[0] || { c: '', g: [] };
        var scored = items.filter(function (it) { return it.u !== self; }).map(function (it) {
          var score = current.c && it.c === current.c ? 2 : 0;
          (it.g || []).forEach(function (tag) { if ((current.g || []).indexOf(tag) > -1) score += 1; });
          return { item: it, score: score };
        }).filter(function (x) { return x.score > 0; }).sort(function (a, b) {
          return b.score - a.score || a.item.t.localeCompare(b.item.t, 'ko');
        }).slice(0, 5).map(function (x) { return x.item; });
        if (scored.length) linkList(related, scored, false);
        else related.hidden = true;
      }
    }).catch(function () {
      // 인덱스를 읽지 못하면 [[링크]]를 글자로만 보여 준다.
      if (content) linkify(content, null);
      ['[data-wiki-backlinks]', '[data-wiki-related]'].forEach(function (sel) {
        var host = root.querySelector(sel);
        if (host) host.hidden = true;
      });
    });
  }

  // ───────────── 위키 홈 ─────────────
  function initHome() {
    var list = root.querySelector('[data-wiki-list]');
    var cards = [].slice.call(root.querySelectorAll('[data-wiki-item]'));
    var input = root.querySelector('[data-wiki-q]');
    var sortSelect = root.querySelector('[data-wiki-sort]');
    var chips = [].slice.call(root.querySelectorAll('[data-wiki-chip]'));
    var status = root.querySelector('[data-wiki-status]');
    var empty = root.querySelector('[data-wiki-empty]');
    var randomButton = root.querySelector('[data-wiki-random]');
    var state = { q: '', category: '', sort: 'name' };

    cards.forEach(function (card) {
      card._hay = norm([card.getAttribute('data-title'), card.getAttribute('data-aliases'), card.getAttribute('data-tags'), card.getAttribute('data-category'), card.getAttribute('data-summary')].join(' '));
    });

    function render() {
      var terms = norm(state.q).split(' ').filter(Boolean);
      var shown = 0;
      cards.forEach(function (card) {
        var ok = (!state.category || card.getAttribute('data-category') === state.category) &&
          terms.every(function (t) { return card._hay.indexOf(t) > -1; });
        card.hidden = !ok;
        if (ok) shown += 1;
      });
      var ordered = cards.slice().sort(function (a, b) {
        if (state.sort === 'recent') {
          var d = (b.getAttribute('data-updated') || '').localeCompare(a.getAttribute('data-updated') || '');
          if (d) return d;
        }
        return a.getAttribute('data-title').localeCompare(b.getAttribute('data-title'), 'ko');
      });
      ordered.forEach(function (card) { list.appendChild(card); });
      chips.forEach(function (chip) {
        chip.setAttribute('aria-pressed', String((chip.getAttribute('data-wiki-chip') || '') === state.category));
      });
      if (status) status.textContent = (state.q || state.category) ? shown + '개 문서를 찾았습니다(전체 ' + cards.length + '개).' : '문서 ' + cards.length + '개';
      if (empty) empty.hidden = shown !== 0;
      try {
        var params = new URLSearchParams();
        if (state.q) params.set('q', state.q);
        if (state.category) params.set('category', state.category);
        if (state.sort !== 'name') params.set('sort', state.sort);
        var qs = params.toString();
        history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '') + location.hash);
      } catch (e) { /* 주소 갱신은 선택 기능이다 */ }
    }

    var initial = new URLSearchParams(location.search);
    state.q = initial.get('q') || '';
    state.category = initial.get('category') || '';
    state.sort = initial.get('sort') === 'recent' ? 'recent' : 'name';
    if (input) input.value = state.q;
    if (sortSelect) sortSelect.value = state.sort;

    if (input) input.addEventListener('input', function () { state.q = input.value; render(); });
    if (sortSelect) sortSelect.addEventListener('change', function () { state.sort = sortSelect.value === 'recent' ? 'recent' : 'name'; render(); });
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var value = chip.getAttribute('data-wiki-chip') || '';
        state.category = state.category === value ? '' : value;
        render();
      });
    });
    if (randomButton) {
      randomButton.addEventListener('click', function () {
        var pool = cards.filter(function (c) { return !c.hidden; });
        if (!pool.length) pool = cards;
        var link = pool[Math.floor(Math.random() * pool.length)].querySelector('a');
        if (link) location.href = link.href;
      });
    }
    document.addEventListener('keydown', function (event) {
      if (event.key !== '/' || event.ctrlKey || event.metaKey || event.altKey) return;
      var tag = (document.activeElement && document.activeElement.tagName) || '';
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag) || !input) return;
      event.preventDefault();
      input.focus();
    });
    render();

    // 작성이 필요한 문서(링크는 있는데 문서가 없음)와 고아 문서(가리키는 문서가 없음)
    var wantedHost = root.querySelector('[data-wiki-wanted]');
    var orphanHost = root.querySelector('[data-wiki-orphans]');
    var intro = root.querySelector('[data-wiki-content]');
    loadIndex().then(function (items) {
      var lookup = buildLookup(items);
      var from = inbound(items, lookup);
      if (intro) linkify(intro, lookup);

      var wantedPanel = section(wantedHost, '작성이 필요한 문서', 'file-circle-plus');
      if (wantedPanel) {
        var wanted = Object.create(null);
        items.forEach(function (it) {
          (it.l || []).forEach(function (target) {
            var n = norm(target);
            if (!n || lookup[n]) return;
            var entry = wanted[n] = wanted[n] || { title: target.trim(), refs: [] };
            if (entry.refs.indexOf(it) === -1) entry.refs.push(it);
          });
        });
        var rows = Object.keys(wanted).map(function (k) { return wanted[k]; }).sort(function (a, b) {
          return b.refs.length - a.refs.length || a.title.localeCompare(b.title, 'ko');
        });
        if (!rows.length) {
          wantedPanel.appendChild(el('p', 'th-wiki-empty', '링크는 있는데 없는 문서가 없습니다.'));
        } else {
          var ul = el('ul', 'th-wiki-link-list');
          rows.forEach(function (row) {
            var li = el('li');
            var create = newURL(row.title);
            var name = create ? el('a', 'th-wikilink is-missing', row.title) : el('span', 'th-wikilink is-missing', row.title);
            if (create) { name.href = create; name.target = '_blank'; name.rel = 'noopener'; }
            li.appendChild(name);
            li.appendChild(el('span', 'th-wiki-link-summary', row.refs.length + '개 문서에서 참조: ' + row.refs.map(function (r) { return r.t; }).join(', ')));
            ul.appendChild(li);
          });
          wantedPanel.appendChild(ul);
        }
      }

      var orphanPanel = section(orphanHost, '고아 문서', 'link-slash');
      if (orphanPanel) {
        var orphans = items.filter(function (it) { return !(from[it.u] || []).length; }).sort(function (a, b) { return a.t.localeCompare(b.t, 'ko'); });
        if (orphans.length) linkList(orphanPanel, orphans, true);
        else orphanPanel.appendChild(el('p', 'th-wiki-empty', '모든 문서가 다른 문서에서 연결되어 있습니다.'));
      }
    }).catch(function () {
      if (intro) linkify(intro, null);
      [wantedHost, orphanHost].forEach(function (host) {
        if (!host) return;
        host.hidden = false;
        host.appendChild(el('p', 'th-embed-error', '목록을 불러오지 못했습니다.'));
      });
    });
  }

  if (mode === 'home') initHome();
  else initArticle();
})();
