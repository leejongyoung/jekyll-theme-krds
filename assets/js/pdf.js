/* KRDSPdf — PDF를 브라우저마다 같은 모양으로 직접 그린다(쪽 단위 캔버스 + 쪽 글 대체 텍스트).
   pdf.js(mozilla/pdf.js, Apache-2.0, https://github.com/mozilla/pdf.js)는 테마의 assets/vendor/pdfjs/ 에 들어 있다.
   이 파일은 사이트 안의 주소(base)에 있는 pdf.mjs·pdf.worker.mjs만 불러오고 외부 연결은 하지 않는다. */
(function () {
  'use strict';

  var MAX_BYTES = 30 * 1024 * 1024;         // 이보다 크면 내려받기 안내
  var EAGER_MAX_PAGES = 40;                 // eager 옵션은 이 쪽 수까지만 전부 그린다(인쇄용)
  var RENDER_SCALE = 1.5;                   // 기본 확대(화면 밀도를 곱하고 최대 2.5까지)

  function fail(message) {
    var error = new Error(message);
    error.krdsPdf = true;
    return error;
  }

  function textOf(content) {
    try {
      var out = '';
      for (var i = 0; i < content.items.length; i++) {
        var item = content.items[i];
        out += item.str;
        out += item.hasEOL ? '\n' : ' ';
      }
      out = out.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
      return out.length > 6000 ? out.slice(0, 6000) + '…' : out;
    } catch (error) { return ''; }
  }

  // options: base(pdf.mjs가 있는 폴더 주소), src(문서 주소), eager(true면 쪽 수가 적을 때 모두 그림)
  // 반환: Promise<{root(쪽 모음 DOM), pageCount, rendered(Promise: 모두 그린 뒤), destroy()}>
  function open(options) {
    var base = options.base;
    var src = options.src;
    var eager = !!options.eager;
    return Promise.resolve()
      .then(function () {
        return import(base.replace(/\/?$/, '/') + 'pdf.mjs');
      })
      .then(function (pdfjs) {
        pdfjs.GlobalWorkerOptions.workerSrc = base.replace(/\/?$/, '/') + 'pdf.worker.mjs';
        return fetch(src).then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          var length = parseInt(res.headers.get('content-length') || '0', 10);
          if (length > MAX_BYTES) throw fail('문서가 너무 커서(' + Math.round(length / 1048576) + 'MB) 미리볼 수 없습니다.');
          return res.arrayBuffer();
        }).then(function (buffer) {
          if (buffer.byteLength > MAX_BYTES) throw fail('문서가 너무 커서 미리볼 수 없습니다.');
          return pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
        }).then(function (doc) {
          return paintAll(pdfjs, doc, options, eager);
        }, function (error) {
          if (error && error.name === 'PasswordException') throw fail('암호로 보호된 PDF는 미리볼 수 없습니다.');
          throw error;
        });
      });
  }

  function paintAll(pdfjs, doc, options, eager) {
    var count = doc.numPages;
    var holder = document.createElement('div');
    holder.className = 'th-pdf-pages';
    holder.setAttribute('role', 'group');
    holder.setAttribute('aria-label', 'PDF 미리보기, 전체 ' + count + '쪽');
    var boxes = [];
    var chain = Promise.resolve();
    var sizes = [];
    for (var n = 1; n <= count; n++) {
      (function (index) {
        chain = chain.then(function () {
          return doc.getPage(index).then(function (page) {
            var viewport = page.getViewport({ scale: 1 });
            sizes[index - 1] = { width: viewport.width, height: viewport.height };
          });
        });
      })(n);
    }
    return chain.then(function () {
      var finished;
      var rendered = new Promise(function (resolve) { finished = resolve; });
      var remaining = count;
      function done() { remaining -= 1; if (remaining <= 0) { finished(); } }
      var dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
      var scale = Math.min(dpr * RENDER_SCALE, 2.5);
      sizes.forEach(function (size, i) {
        var box = document.createElement('div');
        box.className = 'th-pdf-page';
        box.setAttribute('role', 'group');
        box.setAttribute('aria-label', (i + 1) + '쪽 / 전체 ' + count + '쪽');
        box.style.aspectRatio = size.width + ' / ' + size.height;
        holder.appendChild(box);
        boxes.push({ box: box, index: i + 1, painted: false });
      });
      function paint(entry) {
        if (entry.painted) { done(); return; }
        entry.painted = true;
        doc.getPage(entry.index).then(function (page) {
          var viewport = page.getViewport({ scale: scale });
          var canvas = document.createElement('canvas');
          canvas.width = Math.ceil(viewport.width);
          canvas.height = Math.ceil(viewport.height);
          canvas.setAttribute('aria-hidden', 'true');   // 그림 속 글자가 따로 읽히지 않게 하고 아래 대체 글을 읽게 한다
          entry.box.appendChild(canvas);
          return page.render({ canvasContext: canvas.getContext('2d'), viewport: viewport }).promise.then(function () {
            return page.getTextContent();
          }).then(function (content) {
            var alt = textOf(content);
            if (alt) {
              var reader = document.createElement('p');
              reader.className = 'th-sr-only';
              reader.textContent = alt;
              entry.box.appendChild(reader);
            }
            done();
          });
        }).catch(function () {
          entry.box.className += ' th-pdf-page--error';
          entry.box.textContent = (entry.index) + '쪽을 그리지 못했습니다.';
          done();
        });
      }
      if (eager && count <= EAGER_MAX_PAGES) {
        boxes.forEach(paint);
      } else if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              observer.unobserve(entry.target);
              var found = boxes.filter(function (b2) { return b2.box === entry.target; })[0];
              if (found) paint(found);
            }
          });
        }, { root: options.root || null, rootMargin: '300px 0px' });
        boxes.forEach(function (entry) { observer.observe(entry.box); });
      } else {
        boxes.forEach(paint);
      }
      return {
        root: holder,
        pageCount: count,
        rendered: rendered,
        destroy: function () { try { doc.destroy(); } catch (error) {} }
      };
    });
  }

  window.KRDSPdf = { open: open };
})();
