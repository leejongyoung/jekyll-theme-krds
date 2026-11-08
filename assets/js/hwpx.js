/*
 * HWPX(한글 문서) 브라우저 미리보기.
 * ZIP을 직접 풀고 문단·표·그림을 읽어 DOM으로 만든다. 글자(굵기·기울임·밑줄·취소선·색·크기), 문단 정렬·들여쓰기,
 * 표(칸 합치기), 그림(PNG·JPEG·GIF·BMP·WebP·SVG)을 보여 주고, 머리말·쪽 번호·도형·수식은 그리지 않는다.
 * 파일은 브라우저 안에서만 처리하며 어디로도 보내지 않는다. DOM은 createElement/textContent로만 만든다.
 * 사용: KRDSHwpx.render(arrayBuffer).then(function (element) { ... })
 */
(function (global) {
  'use strict';

  var MAX_ENTRY_BYTES = 40 * 1024 * 1024; // 압축을 푼 뒤 항목 하나의 상한(ZIP 폭탄 방지)
  var MAX_PARAGRAPHS = 4000;              // 한 번에 그리는 문단 수의 상한
  var HWPUNIT_PX = 96 / 7200;             // 1 HWPUNIT = 1/7200 인치

  function fail(message) {
    var error = new Error(message);
    error.hwpx = true;
    return error;
  }

  // ── ZIP ──
  function readZip(buffer) {
    var bytes = new Uint8Array(buffer);
    var view = new DataView(buffer);
    if (bytes.length < 22) throw fail('HWPX 파일이 아닙니다.');
    if (view.getUint32(0, true) === 0xE011CFD0 || view.getUint32(0, true) === 0xD0CF11E0) {
      throw fail('예전 형식(HWP) 문서는 미리볼 수 없습니다. HWPX로 저장하거나 PDF 변환본을 함께 올려 주세요.');
    }
    var eocd = -1;
    for (var i = bytes.length - 22; i >= Math.max(0, bytes.length - 22 - 65535); i -= 1) {
      if (view.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
    }
    if (eocd < 0) throw fail('HWPX(ZIP) 파일이 아닙니다.');
    var count = view.getUint16(eocd + 10, true);
    var pos = view.getUint32(eocd + 16, true);
    var decoder = new TextDecoder('utf-8');
    var entries = Object.create(null);
    for (var n = 0; n < count; n += 1) {
      if (pos + 46 > bytes.length || view.getUint32(pos, true) !== 0x02014b50) throw fail('ZIP 목록이 손상되었습니다.');
      var nameLen = view.getUint16(pos + 28, true);
      var name = decoder.decode(bytes.subarray(pos + 46, pos + 46 + nameLen));
      entries[name] = {
        method: view.getUint16(pos + 10, true),
        csize: view.getUint32(pos + 20, true),
        usize: view.getUint32(pos + 24, true),
        offset: view.getUint32(pos + 42, true)
      };
      pos += 46 + nameLen + view.getUint16(pos + 30, true) + view.getUint16(pos + 32, true);
    }
    return { bytes: bytes, view: view, entries: entries };
  }

  function inflate(data) {
    if (typeof DecompressionStream !== 'function') {
      return Promise.reject(fail('이 브라우저는 HWPX 미리보기를 지원하지 않습니다. 내려받아 확인하세요.'));
    }
    var reader = new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw')).getReader();
    var chunks = [];
    var total = 0;
    function pump() {
      return reader.read().then(function (result) {
        if (result.done) {
          var out = new Uint8Array(total);
          var at = 0;
          chunks.forEach(function (c) { out.set(c, at); at += c.length; });
          return out;
        }
        total += result.value.length;
        if (total > MAX_ENTRY_BYTES) { reader.cancel(); throw fail('문서가 너무 커서 미리볼 수 없습니다.'); }
        chunks.push(result.value);
        return pump();
      });
    }
    return pump();
  }

  function entryBytes(zip, name) {
    var e = zip.entries[name];
    if (!e) return Promise.resolve(null);
    if (e.usize > MAX_ENTRY_BYTES) return Promise.reject(fail('문서가 너무 커서 미리볼 수 없습니다.'));
    var v = zip.view;
    var o = e.offset;
    if (o + 30 > zip.bytes.length || v.getUint32(o, true) !== 0x04034b50) return Promise.reject(fail('ZIP 항목이 손상되었습니다.'));
    var start = o + 30 + v.getUint16(o + 26, true) + v.getUint16(o + 28, true);
    var data = zip.bytes.subarray(start, start + e.csize);
    if (e.method === 0) return Promise.resolve(data);
    if (e.method === 8) return inflate(data);
    return Promise.reject(fail('지원하지 않는 압축 방식입니다.'));
  }

  function entryText(zip, name) {
    return entryBytes(zip, name).then(function (bytes) {
      return bytes ? new TextDecoder('utf-8').decode(bytes) : null;
    });
  }

  // ── XML ──
  function parseXML(text) {
    var doc = new DOMParser().parseFromString(text, 'application/xml');
    if (doc.getElementsByTagName('parsererror').length) throw fail('문서 XML을 읽지 못했습니다.');
    return doc;
  }
  function kids(node) {
    var out = [];
    for (var c = node.firstChild; c; c = c.nextSibling) if (c.nodeType === 1) out.push(c);
    return out;
  }
  function child(node, localName) {
    for (var c = node.firstChild; c; c = c.nextSibling) if (c.nodeType === 1 && c.localName === localName) return c;
    return null;
  }
  function all(node, localName) {
    return Array.prototype.slice.call(node.getElementsByTagNameNS('*', localName));
  }
  function num(node, attr, fallback) {
    var v = node ? parseFloat(node.getAttribute(attr)) : NaN;
    return isNaN(v) ? fallback : v;
  }
  function color(value) { return /^#[0-9a-fA-F]{6}$/.test(value || '') ? value : ''; }
  // 표 칸 배경색은 그리지 않으므로 흰색에 가까운 글자색(어두운 배경 위 흰 글자)은 쓰지 않는다. 검정에 가까운 색도 기본색으로 둔다.
  function usefulColor(value) {
    if (!value) return '';
    var r = parseInt(value.slice(1, 3), 16);
    var g = parseInt(value.slice(3, 5), 16);
    var b = parseInt(value.slice(5, 7), 16);
    var lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    return lum < 0.1 || lum > 0.85 ? '' : value;
  }

  // ── 스타일(header.xml) ──
  function readStyles(headerDoc) {
    var chars = Object.create(null);
    var paras = Object.create(null);
    if (!headerDoc) return { chars: chars, paras: paras };
    all(headerDoc, 'charPr').forEach(function (cp) {
      var underline = child(cp, 'underline');
      var strike = child(cp, 'strikeout');
      chars[cp.getAttribute('id')] = {
        size: num(cp, 'height', 1000) / 1000,
        color: color(cp.getAttribute('textColor')),
        bold: !!child(cp, 'bold'),
        italic: !!child(cp, 'italic'),
        underline: !!underline && underline.getAttribute('type') !== 'NONE',
        strike: !!strike && strike.getAttribute('shape') !== 'NONE'
      };
    });
    all(headerDoc, 'paraPr').forEach(function (pp) {
      var align = child(pp, 'align');
      var margin = all(pp, 'margin')[0];
      var left = 0;
      var intent = 0;
      if (margin) {
        left = num(child(margin, 'left'), 'value', 0);
        intent = num(child(margin, 'intent'), 'value', 0);
      }
      paras[pp.getAttribute('id')] = {
        align: align ? align.getAttribute('horizontal') : 'JUSTIFY',
        left: left,
        intent: intent
      };
    });
    return { chars: chars, paras: paras };
  }

  // ── 렌더 ──
  function el(tag, cls) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    return node;
  }

  function textOf(t) {
    var out = '';
    for (var c = t.firstChild; c; c = c.nextSibling) {
      if (c.nodeType === 3) out += c.nodeValue;
      else if (c.nodeType === 1) {
        var n = c.localName;
        if (n === 'lineBreak') out += '\n';
        else if (n === 'tab') out += '\t';
        else if (n === 'nbSpace' || n === 'fwSpace') out += ' ';
        else if (n === 'hyphen') out += '-';
      }
    }
    return out;
  }

  function span(text, style) {
    var css = [];
    if (style) {
      if (Math.abs(style.size - 1) > 0.05) css.push('font-size:' + Math.min(3, Math.max(0.6, style.size)).toFixed(2) + 'em');
      var useColor = usefulColor(style.color);
      if (useColor) css.push('color:' + useColor);
      if (style.bold) css.push('font-weight:700');
      if (style.italic) css.push('font-style:italic');
      var deco = [];
      if (style.underline) deco.push('underline');
      if (style.strike) deco.push('line-through');
      if (deco.length) css.push('text-decoration:' + deco.join(' '));
    }
    if (!css.length) return document.createTextNode(text);
    var node = el('span');
    node.setAttribute('style', css.join(';'));
    node.textContent = text;
    return node;
  }

  // 하이퍼링크 필드(fieldBegin type="HYPERLINK")의 주소. http·https·mailto만 링크로 만든다(javascript: 등은 글자로만 보임).
  function linkHref(field) {
    var raw = '';
    var params = all(field, 'stringParam');
    for (var i = 0; i < params.length; i += 1) {
      var pname = params[i].getAttribute('name');
      if (pname === 'Path' && params[i].textContent) { raw = params[i].textContent; break; }
      if (pname === 'Command' && !raw) raw = params[i].textContent.replace(/\\:/g, ':').split(';')[0];
    }
    raw = raw.trim();
    if (!raw) return '';
    try {
      var url = new URL(raw);
      return /^(https?|mailto):$/.test(url.protocol) ? url.href : '';
    } catch (error) { return ''; }
  }

  function linkNode(href) {
    var a = el('a', 'th-hwpx-link');
    a.href = href;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    return a;
  }

  function renderParagraph(p, ctx, into) {
    if (ctx.count >= MAX_PARAGRAPHS) { ctx.truncated = true; return; }
    ctx.count += 1;
    var pStyle = ctx.styles.paras[p.getAttribute('paraPrIDRef')];
    var line = null;
    var hasContent = false;

    function open() {
      if (!line) {
        line = el('p', 'th-hwpx-p');
        if (pStyle) {
          var css = [];
          if (pStyle.align === 'CENTER') css.push('text-align:center');
          else if (pStyle.align === 'RIGHT') css.push('text-align:right');
          else if (pStyle.align === 'JUSTIFY' || pStyle.align === 'DISTRIBUTE') css.push('text-align:justify');
          var left = Math.min(240, Math.max(0, pStyle.left * HWPUNIT_PX));
          var indent = Math.min(120, Math.max(-left, pStyle.intent * HWPUNIT_PX));
          if (left) css.push('margin-left:' + left.toFixed(1) + 'px');
          if (indent) css.push('text-indent:' + indent.toFixed(1) + 'px');
          if (css.length) line.setAttribute('style', css.join(';'));
        }
      }
      return line;
    }
    function flush() {
      if (line) { into.appendChild(line); line = null; }
    }

    var link = null;   // 열려 있는 하이퍼링크 { id, href, node }
    kids(p).forEach(function (run) {
      if (run.localName !== 'run') return;
      var style = ctx.styles.chars[run.getAttribute('charPrIDRef')];
      kids(run).forEach(function (item) {
        var name = item.localName;
        if (name === 't') {
          var text = textOf(item);
          if (text) {
            var piece = span(text, style);
            if (link && link.href) {
              if (!link.node) { link.node = linkNode(link.href); open().appendChild(link.node); }
              link.node.appendChild(piece);
            } else {
              open().appendChild(piece);
            }
            hasContent = true;
          }
        } else if (name === 'ctrl') {
          kids(item).forEach(function (c) {
            if (c.localName === 'fieldBegin' && c.getAttribute('type') === 'HYPERLINK') {
              link = { id: c.getAttribute('id'), href: linkHref(c), node: null };
            } else if (c.localName === 'fieldEnd' && link && c.getAttribute('beginIDRef') === link.id) {
              if (link.node) {
                var hint = el('span', 'th-sr-only');
                hint.textContent = ' (새 창 열림)';
                link.node.appendChild(hint);
              }
              link = null;
            }
          });
        } else if (name === 'tbl') {
          flush();
          into.appendChild(renderTable(item, ctx));
          hasContent = true;
        } else if (name === 'pic') {
          var img = renderPicture(item, ctx);
          if (img) { open().appendChild(img); hasContent = true; }
        }
      });
    });
    if (!hasContent) { open().classList.add('th-hwpx-blank'); }
    flush();
  }

  function renderPicture(pic, ctx) {
    var image = all(pic, 'img')[0];
    if (!image) return null;
    var id = image.getAttribute('binaryItemIDRef');
    var url = ctx.images[id];
    var node;
    if (!url) {
      node = el('span', 'th-hwpx-missing');
      node.textContent = '[그림]';
      return node;
    }
    node = el('img', 'th-hwpx-img');
    node.alt = '';
    node.src = url;
    node.loading = 'lazy';
    var size = child(pic, 'sz');
    var width = num(size, 'width', 0) * HWPUNIT_PX;
    if (width > 0) node.style.width = Math.min(width, 2000).toFixed(0) + 'px';
    return node;
  }

  function renderTable(tbl, ctx) {
    var wrap = el('div', 'th-hwpx-table-wrap');
    var table = el('table', 'th-hwpx-table');
    wrap.appendChild(table);
    var tableWidth = num(child(tbl, 'sz'), 'width', 0);
    var firstRow = true;
    var tbody = el('tbody');
    table.appendChild(tbody);
    kids(tbl).forEach(function (tr) {
      if (tr.localName !== 'tr') return;
      var row = el('tr');
      kids(tr).forEach(function (tc) {
        if (tc.localName !== 'tc') return;
        var isHeader = tc.getAttribute('header') === '1';
        var cell = el(isHeader ? 'th' : 'td');
        if (isHeader) cell.setAttribute('scope', 'col');
        var span_ = child(tc, 'cellSpan');
        var colSpan = Math.min(50, Math.max(1, num(span_, 'colSpan', 1)));
        var rowSpan = Math.min(200, Math.max(1, num(span_, 'rowSpan', 1)));
        if (colSpan > 1) cell.colSpan = colSpan;
        if (rowSpan > 1) cell.rowSpan = rowSpan;
        var cellWidth = num(child(tc, 'cellSz'), 'width', 0);
        if (firstRow && tableWidth > 0 && cellWidth > 0) cell.style.width = (cellWidth / tableWidth * 100).toFixed(1) + '%';
        var list = child(tc, 'subList');
        if (list) {
          if (list.getAttribute('vertAlign') === 'CENTER') cell.style.verticalAlign = 'middle';
          kids(list).forEach(function (p) { if (p.localName === 'p') renderParagraph(p, ctx, cell); });
        }
        row.appendChild(cell);
      });
      tbody.appendChild(row);
      firstRow = false;
    });
    return wrap;
  }

  // ── 문서 ──
  function imageType(href) {
    var ext = (href.split('.').pop() || '').toLowerCase();
    return { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', bmp: 'image/bmp', webp: 'image/webp', svg: 'image/svg+xml' }[ext] || '';
  }

  function resolve(zip, href) {
    if (zip.entries[href]) return href;
    if (zip.entries['Contents/' + href]) return 'Contents/' + href;
    return null;
  }

  function render(buffer) {
    var zip;
    var objectURLs = [];
    return Promise.resolve().then(function () {
      zip = readZip(buffer);
      return entryText(zip, 'META-INF/manifest.xml');
    }).then(function (manifestText) {
      if (manifestText && /encryption-data/i.test(manifestText)) throw fail('암호가 걸린 문서는 미리볼 수 없습니다.');
      return entryText(zip, 'Contents/content.hpf');
    }).then(function (hpfText) {
      var items = Object.create(null);
      var order = [];
      if (hpfText) {
        var hpf = parseXML(hpfText);
        all(hpf, 'item').forEach(function (it) { items[it.getAttribute('id')] = it.getAttribute('href') || ''; });
        all(hpf, 'itemref').forEach(function (ref) { order.push(ref.getAttribute('idref')); });
      }
      var sections = order.map(function (id) { return items[id]; }).filter(function (href) { return /(^|\/)section\d+\.xml$/i.test(href || ''); })
        .map(function (href) { return resolve(zip, href); }).filter(Boolean);
      if (!sections.length) {
        sections = Object.keys(zip.entries).filter(function (n) { return /^Contents\/section\d+\.xml$/i.test(n); }).sort(function (a, b) {
          return parseInt(a.replace(/\D/g, ''), 10) - parseInt(b.replace(/\D/g, ''), 10);
        });
      }
      if (!sections.length) throw fail('본문(section) 파일을 찾지 못했습니다.');
      var headerName = resolve(zip, items.header || 'Contents/header.xml') || 'Contents/header.xml';
      return Promise.all([
        entryText(zip, headerName),
        Promise.all(sections.map(function (name) { return entryText(zip, name); }))
      ]).then(function (parts) {
        var styles = readStyles(parts[0] ? parseXML(parts[0]) : null);
        var docs = parts[1].map(function (text) { return parseXML(text); });
        // 쓰이는 그림만 미리 읽는다(렌더는 동기로 진행).
        var wanted = Object.create(null);
        docs.forEach(function (d) { all(d, 'img').forEach(function (img) { wanted[img.getAttribute('binaryItemIDRef')] = true; }); });
        var images = Object.create(null);
        return Promise.all(Object.keys(wanted).map(function (id) {
          var href = items[id];
          var mime = href ? imageType(href) : '';
          var name = href ? resolve(zip, href) : null;
          if (!mime || !name) return null;
          return entryBytes(zip, name).then(function (bytes) {
            if (!bytes) return;
            var url = URL.createObjectURL(new Blob([bytes], { type: mime }));
            objectURLs.push(url);
            images[id] = url;
          });
        })).then(function () {
          var ctx = { styles: styles, images: images, count: 0, truncated: false };
          var root = el('div', 'th-hwpx');
          var note = el('p', 'th-hwpx-note');
          note.textContent = '글자와 표, 그림 중심의 미리보기입니다. 쪽 모양, 머리말·쪽 번호, 도형은 그리지 않으니 정확한 서식은 원본이나 PDF 변환본에서 확인하세요.';
          root.appendChild(note);
          docs.forEach(function (d) {
            var page = el('article', 'th-hwpx-page');
            kids(d.documentElement).forEach(function (p) { if (p.localName === 'p') renderParagraph(p, ctx, page); });
            root.appendChild(page);
          });
          if (ctx.truncated) {
            var more = el('p', 'th-hwpx-note');
            more.textContent = '내용이 길어 앞부분만 보여 줍니다. 전체는 내려받아 확인하세요.';
            root.appendChild(more);
          }
          root.hwpxRelease = function () { objectURLs.forEach(function (u) { URL.revokeObjectURL(u); }); objectURLs = []; };
          return root;
        });
      });
    }).catch(function (error) {
      objectURLs.forEach(function (u) { URL.revokeObjectURL(u); });
      throw error;
    });
  }

  global.KRDSHwpx = { render: render };
})(window);
