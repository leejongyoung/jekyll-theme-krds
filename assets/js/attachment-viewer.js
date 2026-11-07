/* Standalone attachment viewer: PDF, images, and the first spreadsheet sheet. */
(function () {
  'use strict';
  var params = new URLSearchParams(location.search);
  var src = params.get('src') || '';
  var originalSrc = params.get('download') || src;
  var kind = params.get('kind') || '';
  var ext = (params.get('ext') || '').toLowerCase();
  var title = params.get('title') || '첨부 파일';
  var heading = document.querySelector('.th-file-viewer-title');
  var icon = document.querySelector('.th-file-viewer-icon');
  var download = document.querySelector('.th-file-viewer-download');
  var printButton = document.querySelector('.th-file-viewer-print');
  var content = document.querySelector('.th-file-viewer-content');
  var MAX_ROWS = 100;
  var MAX_COLS = 20;

  function fail(message) {
    content.textContent = '';
    var p = document.createElement('p');
    p.className = 'th-embed-error';
    p.setAttribute('role', 'alert');
    p.textContent = message;
    content.appendChild(p);
  }
  function safeURL(value) {
    try {
      var url = new URL(value, location.href);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
      return url.href;
    } catch (error) { return null; }
  }
  var TYPES = [
    ['pdf', 'file-pdf', 'pdf'],
    ['doc', 'file-word', 'doc docx odt rtf'],
    ['sheet', 'file-excel', 'xls xlsx ods cell'],
    ['sheet', 'file-csv', 'csv tsv'],
    ['slides', 'file-powerpoint', 'ppt pptx odp show'],
    ['hwp', 'file-lines', 'hwp hwpx'],
    ['image', 'file-image', 'png jpg jpeg gif webp svg bmp'],
    ['audio', 'file-audio', 'mp3 wav ogg m4a flac'],
    ['video', 'file-video', 'mp4 webm mov mkv'],
    ['archive', 'file-zipper', 'zip 7z tar gz rar'],
    ['code', 'file-code', 'html htm json xml js css yml yaml'],
    ['text', 'file-lines', 'txt md log']
  ];
  function iconFor(extension) {
    for (var i = 0; i < TYPES.length; i += 1) {
      if (TYPES[i][2].split(' ').indexOf(extension) > -1) return TYPES[i];
    }
    if (kind === 'pdf') return TYPES[0];
    if (kind === 'sheet') return TYPES[2];
    if (kind === 'image') return TYPES[6];
    return ['file', 'file'];
  }
  function setFileIcon() {
    var row = iconFor(ext);
    icon.className = 'th-attachment-file-icon th-file-viewer-icon th-attachment-file-icon--' + row[0];
    icon.textContent = '';
    var glyph = document.createElement('i');
    glyph.className = 'th-fa th-fa-' + row[1];
    icon.appendChild(glyph);
    var kicker = document.querySelector('.th-file-viewer-kicker');
    if (kicker && /^[a-z0-9]{1,8}$/.test(ext)) kicker.textContent = '첨부 파일 미리보기 · ' + ext.toUpperCase();
  }
  function readyToPrint() {
    printButton.disabled = false;
  }
  function renderPDF(url) {
    var object = document.createElement('object');
    object.data = url;
    object.type = 'application/pdf';
    object.setAttribute('aria-label', title + ' 미리보기');
    var fallback = document.createElement('p');
    fallback.className = 'th-attachment-fallback';
    var link = document.createElement('a');
    link.href = url;
    link.textContent = title + ' 내려받기';
    fallback.appendChild(link);
    object.appendChild(fallback);
    content.textContent = '';
    content.appendChild(object);
    readyToPrint();
  }
  function renderImage(url) {
    var image = document.createElement('img');
    image.alt = title;
    image.addEventListener('load', readyToPrint);
    image.addEventListener('error', function () { fail('이미지 미리보기를 불러오지 못했습니다. 원본을 내려받아 확인하세요.'); });
    image.src = url;
    content.textContent = '';
    content.appendChild(image);
  }
  function renderSheet(url) {
    var script = document.createElement('script');
    script.src = new URL('vendor/xlsx/xlsx.full.min.js', location.href).href;
    script.onload = function () {
      fetch(url).then(function (response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.arrayBuffer();
      }).then(function (buffer) {
        var workbook = window.XLSX.read(new Uint8Array(buffer), { type: 'array', sheetRows: MAX_ROWS + 1 });
        var sheet = workbook.Sheets[workbook.SheetNames[0]];
        if (!sheet) throw new Error('empty workbook');
        var rows = window.XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: false });
        while (rows.length && rows[rows.length - 1].every(function (cell) { return cell === ''; })) rows.pop();
        if (!rows.length) throw new Error('empty sheet');
        var truncated = rows.length > MAX_ROWS;
        var wide = rows.some(function (row) { return row.length > MAX_COLS; });
        var shown = rows.slice(0, MAX_ROWS).map(function (row) { return row.slice(0, MAX_COLS); });
        var wrap = document.createElement('div');
        wrap.className = 'th-table-wrap';
        var table = document.createElement('table');
        table.setAttribute('aria-label', title + ' 표 미리보기');
        var thead = document.createElement('thead');
        var headRow = document.createElement('tr');
        shown[0].forEach(function (cell) {
          var th = document.createElement('th');
          th.scope = 'col';
          th.textContent = cell;
          headRow.appendChild(th);
        });
        thead.appendChild(headRow);
        table.appendChild(thead);
        var tbody = document.createElement('tbody');
        shown.slice(1).forEach(function (row) {
          var tr = document.createElement('tr');
          for (var index = 0; index < shown[0].length; index += 1) {
            var td = document.createElement('td');
            td.textContent = row[index] == null ? '' : String(row[index]);
            tr.appendChild(td);
          }
          tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        wrap.appendChild(table);
        if (truncated || wide) {
          var note = document.createElement('p');
          note.className = 'th-embed-note';
          note.textContent = '처음 ' + MAX_ROWS + '행과 ' + MAX_COLS + '열까지만 보여줍니다. 전체는 원본을 내려받아 확인하세요.';
          wrap.appendChild(note);
        }
        content.textContent = '';
        content.appendChild(wrap);
        readyToPrint();
      }).catch(function () { fail('스프레드시트 미리보기를 불러오지 못했습니다. 원본을 내려받아 확인하세요.'); });
    };
    script.onerror = function () { fail('표 라이브러리를 불러오지 못했습니다.'); };
    document.head.appendChild(script);
  }

  var HWPX_MAX_BYTES = 30 * 1024 * 1024;
  function renderHwpx(url) {
    var script = document.createElement('script');
    script.src = new URL('js/hwpx.js', location.href).href;
    script.onload = function () {
      fetch(url).then(function (response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        var length = parseInt(response.headers.get('content-length') || '0', 10);
        if (length > HWPX_MAX_BYTES) throw new Error('파일이 너무 커서 미리볼 수 없습니다.');
        return response.arrayBuffer();
      }).then(function (buffer) {
        if (buffer.byteLength > HWPX_MAX_BYTES) throw new Error('파일이 너무 커서 미리볼 수 없습니다.');
        return window.KRDSHwpx.render(buffer);
      }).then(function (root) {
        content.textContent = '';
        var wrap = document.createElement('div');
        wrap.className = 'th-hwpx-viewer';
        wrap.appendChild(root);
        content.appendChild(wrap);
        readyToPrint();
      }).catch(function (error) {
        var known = error && (error.hwpx || /^[^\x00-\x7f]/.test(error.message));
        fail((known ? error.message : '한글 문서를 불러오지 못했습니다.') + ' 원본을 내려받아 확인하세요.');
      });
    };
    script.onerror = function () { fail('한글 문서 미리보기 스크립트를 불러오지 못했습니다.'); };
    document.head.appendChild(script);
  }

  var url = safeURL(src);
  var originalURL = safeURL(originalSrc);
  if (!url || ['pdf', 'image', 'sheet', 'hwpx'].indexOf(kind) === -1) {
    fail('지원하지 않거나 잘못된 미리보기 주소입니다.');
    return;
  }
  document.title = title + ' - 첨부 파일 미리보기';
  heading.textContent = title;
  setFileIcon();
  if (originalURL) {
    download.href = originalURL;
    download.setAttribute('download', '');
    if (new URL(originalURL).origin !== location.origin) {
      download.target = '_blank';
      download.rel = 'noopener';
    }
  } else {
    download.hidden = true;
  }
  printButton.addEventListener('click', function () { window.print(); });
  if (kind === 'pdf') renderPDF(url);
  else if (kind === 'image') renderImage(url);
  else if (kind === 'hwpx') renderHwpx(url);
  else renderSheet(url);
})();
