/* KRDSRhwp — 한글 문서(hwp·hwpx)를 쪽 모양 그대로 보여 주는 선택 기능. 사이트가 rhwp를 직접 올려 둔 경우에만 쓴다.
   rhwp(@rhwp/core, MIT, https://github.com/edwardkim/rhwp)는 한글 문서를 쪽 단위 SVG로 그리는 Rust/WASM 라이브러리다.
   이 파일은 사이트 안의 주소(base)에 있는 rhwp.js·rhwp_bg.wasm만 불러오고 외부 연결은 하지 않는다.
   rhwp가 돌려주는 SVG는 문서 내용에서 만들어지므로 그대로 넣지 않는다. 허용한 요소·속성만 새로 만들어 옮기고,
   쪽마다 id를 구분해(같은 id가 여러 쪽에 있으면 clip-path가 엉킨다) 쪽 단위로 필요할 때 그린다. */
(function () {
  'use strict';

  var SVG_NS = 'http://www.w3.org/2000/svg';
  var XLINK_NS = 'http://www.w3.org/1999/xlink';
  var MAX_BYTES = 30 * 1024 * 1024;   // 이보다 큰 문서는 열지 않는다
  var EAGER_MAX_PAGES = 40;           // eager 옵션은 이 쪽 수까지만 전부 그린다(인쇄용)

  function fail(message) {
    var error = new Error(message);
    error.krdsRhwp = true;
    return error;
  }

  // ── SVG 정리: 허용 목록 ──────────────────────────────────────────────
  // rhwp 0.8.x가 실제로 만드는 요소·속성(예제 문서 20개, 쪽 수백 개 기준)에 맞췄다. 목록에 없으면 버린다.
  var ELEMENTS = {};
  ('svg defs clipPath rect g text tspan line circle polyline polygon marker path ellipse image linearGradient radialGradient stop')
    .split(' ').forEach(function (name) { ELEMENTS[name] = true; });
  var ATTRIBUTES = {};
  ('x y width height viewBox preserveAspectRatio fill fill-opacity fill-rule stroke stroke-width stroke-dasharray stroke-linecap ' +
    'stroke-linejoin stroke-opacity opacity transform d points x1 y1 x2 y2 cx cy r rx ry fx fy offset stop-color stop-opacity ' +
    'gradientUnits gradientTransform clipPathUnits id clip-path marker-start marker-mid marker-end markerWidth markerHeight ' +
    'markerUnits refX refY orient font-family font-size font-weight font-style text-anchor dominant-baseline textLength ' +
    'lengthAdjust href xlink:href').split(' ').forEach(function (name) { ATTRIBUTES[name] = true; });
  var ID = /^[A-Za-z][\w.:-]*$/;
  var IMAGE_URI = /^data:image\/(?:png|jpeg|gif|bmp|webp|svg\+xml)[;,]/;

  // 값이 안전하면 (id·참조는 쪽 접두사를 붙여) 돌려주고, 아니면 null
  function safeValue(name, value, prefix) {
    if (name === 'id') return ID.test(value) ? prefix + value : null;
    if (name === 'href' || name === 'xlink:href') {
      if (value.charAt(0) === '#') return ID.test(value.slice(1)) ? '#' + prefix + value.slice(1) : null;
      return IMAGE_URI.test(value) ? value : null;   // 그림은 data: 주소만(그림으로 불러온 SVG는 스크립트·외부 요청이 막힌다)
    }
    if (/url\s*\(/i.test(value)) {
      var ref = /^\s*url\(\s*#([A-Za-z][\w.:-]*)\s*\)\s*$/.exec(value);
      return ref ? 'url(#' + prefix + ref[1] + ')' : null;
    }
    return value;
  }

  function copy(source, prefix) {
    var node = document.createElementNS(SVG_NS, source.localName);
    var i;
    for (i = 0; i < source.attributes.length; i += 1) {
      var attr = source.attributes[i];
      if (!ATTRIBUTES[attr.name]) continue;
      var value = safeValue(attr.name, attr.value, prefix);
      if (value === null) continue;
      if (attr.name === 'xlink:href') node.setAttributeNS(XLINK_NS, 'xlink:href', value);
      else node.setAttribute(attr.name, value);
    }
    var textual = source.localName === 'text' || source.localName === 'tspan';
    for (var child = source.firstChild; child; child = child.nextSibling) {
      if (child.nodeType === 1) {
        if (child.namespaceURI === SVG_NS && ELEMENTS[child.localName]) node.appendChild(copy(child, prefix));
      } else if (child.nodeType === 3 && textual) {
        node.appendChild(document.createTextNode(child.nodeValue));
      }
    }
    return node;
  }

  // rhwp의 SVG 글을 정리한 SVG 요소로. 읽지 못하면 null.
  function sanitize(text, prefix) {
    var doc = new DOMParser().parseFromString(text, 'image/svg+xml');
    var root = doc.documentElement;
    if (!root || root.namespaceURI !== SVG_NS || root.localName !== 'svg' || doc.getElementsByTagName('parsererror').length) return null;
    return copy(root, prefix);
  }

  // ── rhwp 불러오기 ───────────────────────────────────────────────────
  var loaders = {};
  function load(base) {
    var root = new URL(base, location.href).href.replace(/[^/]*$/, '');
    if (loaders[root]) return loaders[root];
    if (typeof WebAssembly !== 'object') return Promise.reject(fail('이 브라우저는 WebAssembly를 지원하지 않아 고화질 미리보기를 쓸 수 없습니다.'));
    var missing = fail('고화질 미리보기에 필요한 rhwp 파일을 사이트에서 찾지 못했습니다. 설치 방법은 첨부 파일 문서를 확인하세요.');
    // import()는 classic 스크립트에서도 쓸 수 있다. 파일이 없거나 CSP가 막으면 같은 오류로 모은다.
    loaders[root] = import(root + 'rhwp.js').then(function (mod) {
      return mod.default({ module_or_path: root + 'rhwp_bg.wasm' }).then(function () { return mod; });
    }).catch(function () { delete loaders[root]; throw missing; });
    return loaders[root];
  }

  function fetchDocument(src) {
    return fetch(src).then(function (response) {
      if (!response.ok) throw fail('문서를 내려받지 못했습니다(HTTP ' + response.status + ').');
      var length = parseInt(response.headers.get('content-length') || '0', 10);
      if (length > MAX_BYTES) throw fail('문서가 너무 커서(' + Math.round(length / 1048576) + 'MB) 고화질 미리보기를 쓸 수 없습니다.');
      return response.arrayBuffer();
    }).then(function (buffer) {
      if (buffer.byteLength > MAX_BYTES) throw fail('문서가 너무 커서 고화질 미리보기를 쓸 수 없습니다.');
      return new Uint8Array(buffer);
    });
  }

  // options: base(rhwp.js가 있는 폴더 주소), src(문서 주소), root(스크롤 영역, 없으면 화면), eager(true면 쪽 수가 적을 때 모두 그림)
  // 반환: Promise<{ root(쪽 모음 DOM), pageCount, rendered(Promise: 모든 쪽을 그린 뒤), destroy() }>
  function open(options) {
    return Promise.all([load(options.base), fetchDocument(options.src)]).then(function (parts) {
      var doc;
      try { doc = new parts[0].HwpDocument(parts[1]); } catch (error) { doc = null; }
      var count = 0;
      try { count = doc ? doc.pageCount() : 0; } catch (error) { count = 0; }
      if (!doc || !count) {
        if (doc) { try { doc.free(); } catch (error) { /* 이미 해제됨 */ } }
        throw fail('이 문서를 열지 못했습니다. 암호가 걸렸거나 지원하지 않는 형식일 수 있습니다.');
      }

      var holder = document.createElement('div');
      holder.className = 'th-rhwp-pages';
      var boxes = [];
      var painted = [];
      var observer = null;
      var alive = true;
      var aspect = '';

      function paint(index) {
        if (!alive || painted[index]) return;
        painted[index] = true;
        var box = boxes[index];
        var svg = null;
        try { svg = sanitize(doc.renderPageSvg(index), 'p' + (index + 1) + '-'); } catch (error) { svg = null; }
        box.textContent = '';
        if (!svg) {
          box.className += ' th-rhwp-page--error';
          box.textContent = (index + 1) + '쪽을 그리지 못했습니다.';
          return;
        }
        var view = (svg.getAttribute('viewBox') || '').split(/\s+/).map(Number);
        if (view.length === 4 && view[2] > 0 && view[3] > 0) {
          box.style.aspectRatio = view[2] + ' / ' + view[3];
          if (!aspect) aspect = view[2] + ' / ' + view[3];
        }
        svg.removeAttribute('width');
        svg.removeAttribute('height');
        svg.setAttribute('focusable', 'false');
        box.appendChild(svg);
      }

      for (var i = 0; i < count; i += 1) {
        var box = document.createElement('div');
        box.className = 'th-rhwp-page';
        box.setAttribute('role', 'img');   // 글자 하나하나가 따로 읽히지 않게 쪽 전체를 그림으로 둔다
        box.setAttribute('aria-label', (i + 1) + '쪽 / 전체 ' + count + '쪽');
        box.setAttribute('data-page', String(i + 1));
        holder.appendChild(box);
        boxes.push(box);
      }
      paint(0);
      for (var j = 1; j < count; j += 1) if (aspect) boxes[j].style.aspectRatio = aspect;

      var finished;
      var rendered = new Promise(function (resolve) { finished = resolve; });
      if (options.eager && count <= EAGER_MAX_PAGES) {
        var next = 1;
        (function step() {
          if (!alive) return;
          if (next >= count) { finished(); return; }
          var until = Math.min(count, next + 4);
          for (; next < until; next += 1) paint(next);
          setTimeout(step, 0);
        })();
      } else {
        if (count === 1) finished();
        if ('IntersectionObserver' in window) {
          observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
              if (!entry.isIntersecting) return;
              var index = boxes.indexOf(entry.target);
              observer.unobserve(entry.target);
              paint(index);
              if (index + 1 < count) paint(index + 1);
            });
          }, { root: options.root || null, rootMargin: '600px 0px' });
          boxes.forEach(function (target) { observer.observe(target); });
        } else {
          for (var k = 1; k < count; k += 1) paint(k);   // 오래된 브라우저는 한꺼번에
          finished();
        }
      }

      return {
        root: holder,
        pageCount: count,
        rendered: rendered,
        destroy: function () {
          alive = false;
          if (observer) observer.disconnect();
          try { doc.free(); } catch (error) { /* 이미 해제됨 */ }
        }
      };
    });
  }

  window.KRDSRhwp = { open: open, sanitize: sanitize };
})();
