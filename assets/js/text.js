/* KRDSText — 첨부 텍스트 파일(txt·log·md·json·yml·xml·ini 등)을 읽기 좋은 카드로 보여 준다. 외부 연결 없음.
   카드 = 머리줄(파일 종류·인코딩·줄 수·잘림 칩, 줄바꿈·복사 버튼) + 줄 번호가 있는 본문(<pre>).
   인코딩은 BOM → UTF-8 → EUC-KR(CP949) 순으로 판별하고, NUL 바이트가 있으면 텍스트가 아닌 것으로 본다.
   하이라이트는 확장자별로 직접 짠 작은 분석기를 쓴다(외부 라이브러리 없음). 색은 CSS가 정하고 이 파일은 클래스만 붙인다.
   내용은 textContent로만 넣으므로 파일 안의 HTML은 실행되지 않는다. */
(function () {
  'use strict';

  var HIGHLIGHT_MAX_LINES = 5000;   // 이보다 줄이 많으면 줄 번호·하이라이트 없이 본문만 보여 준다(DOM 크기 때문)
  var HIGHLIGHT_MAX_LINE = 20000;   // 한 줄이 이보다 길면(압축된 JSON 등) 그 줄은 색을 입히지 않는다

  function fail(message) {
    var error = new Error(message);
    error.krdsText = true;
    return error;
  }

  function sniff(bytes) {
    if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) return 'utf-8';
    if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) return 'utf-16le';
    if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) return 'utf-16be';
    return '';
  }

  function isAscii(bytes) {
    for (var i = 0; i < bytes.length; i += 1) if (bytes[i] > 0x7f) return false;
    return true;
  }

  // buffer(ArrayBuffer), maxBytes(이 크기까지만 읽음)
  // → { text, encoding, source('bom'|'utf-8'|'fallback'), ascii, truncated }
  function decode(buffer, maxBytes) {
    var all = new Uint8Array(buffer);
    var truncated = all.length > maxBytes;
    var bytes = truncated ? all.subarray(0, maxBytes) : all;
    var bom = sniff(bytes);
    if (!bom) {
      var probe = Math.min(bytes.length, 8192);
      for (var i = 0; i < probe; i += 1) {
        if (bytes[i] === 0) throw fail('텍스트 파일이 아니거나 지원하지 않는 인코딩입니다.');
      }
    }
    var options = { stream: truncated };   // 잘린 끝의 반쪽 글자는 버린다
    var encoding = bom || 'utf-8';
    var source = bom ? 'bom' : 'utf-8';
    var text;
    try {
      text = new TextDecoder(encoding, { fatal: true }).decode(bytes, options);
    } catch (error) {
      if (bom) throw fail('텍스트를 읽지 못했습니다.');
      encoding = 'euc-kr';
      source = 'fallback';
      text = new TextDecoder(encoding).decode(bytes, options);
    }
    return { text: text, encoding: encoding, source: source, ascii: !bom && isAscii(bytes), truncated: truncated };
  }

  function encodingLabel(result) {
    if (result.encoding === 'euc-kr') return 'EUC-KR(CP949)';
    if (result.source === 'bom') return { 'utf-8': 'UTF-8 (BOM)', 'utf-16le': 'UTF-16 LE (BOM)', 'utf-16be': 'UTF-16 BE (BOM)' }[result.encoding];
    return result.ascii ? 'ASCII' : 'UTF-8';
  }

  // fetch 응답에서 앞 maxBytes(+1)바이트까지만 읽는다. 큰 파일도 앞부분만 받고 나머지는 취소한다.
  function read(response, maxBytes) {
    if (!response.body || !response.body.getReader) return response.arrayBuffer();
    var reader = response.body.getReader();
    var chunks = [];
    var total = 0;
    function finish() {
      var out = new Uint8Array(total);
      var offset = 0;
      chunks.forEach(function (chunk) { out.set(chunk, offset); offset += chunk.length; });
      return out.buffer;
    }
    function pump() {
      return reader.read().then(function (step) {
        if (step.done) return finish();
        chunks.push(step.value);
        total += step.value.length;
        if (total > maxBytes) { reader.cancel(); return finish(); }
        return pump();
      });
    }
    return pump();
  }

  // ── 하이라이트 분석기 ────────────────────────────────────────────────
  // 분석기는 한 줄을 [[클래스|null, 글자], …]로 나눈다. 클래스: k 이름·키, s 문자열, n 숫자·true/false/null,
  // c 주석, p 문장부호, h 제목·구역, b 굵게, e/w/i/d 로그 수준(오류·경고·정보·디버그). 줄 단위 상태(st)는 줄 사이에 이어진다.

  // re의 캡처 그룹 번호(1부터)마다 classes[번호-1]로 나누고, 나머지 글자는 null로 둔다.
  function scanGroups(text, re, classify) {
    var out = [];
    var last = 0;
    var m;
    re.lastIndex = 0;
    while ((m = re.exec(text))) {
      if (m.index > last) out.push([null, text.slice(last, m.index)]);
      out.push([classify(m), m[0]]);
      last = re.lastIndex;
    }
    if (last < text.length) out.push([null, text.slice(last)]);
    return out;
  }

  var NUMBER = /^-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?$/;
  var KEYWORD = /^(?:true|false|null|~)$/i;
  var ANCHOR = /^[&*][\w-]+$/;
  // 값 쪽 글자: 따옴표 문자열 | 주석 | 낱말(공백·괄호·쉼표 앞까지)
  var VALUE_YAML = /("(?:[^"\\]|\\.)*"|'(?:[^']|'')*')|((?:^|\s)#.*$)|([^\s"'#,\[\]{}]+)/g;
  var VALUE_INI = /("(?:[^"\\]|\\.)*"|'[^']*')|((?:^|\s)[#;].*$)|([^\s"'#;,\[\]{}]+)/g;

  function valueTokens(text, re) {
    return scanGroups(text, re, function (m) {
      if (m[1] !== undefined) return 's';
      if (m[2] !== undefined) return 'c';
      if (NUMBER.test(m[3]) || KEYWORD.test(m[3])) return 'n';
      if (ANCHOR.test(m[3])) return 'h';
      return null;
    });
  }

  var JSON_RE = /("(?:[^"\\]|\\.)*")(?=\s*:)|("(?:[^"\\]|\\.)*")|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|(\b(?:true|false|null)\b)|([{}\[\],:])/g;
  function jsonLine(line) {
    return scanGroups(line, JSON_RE, function (m) {
      return m[1] !== undefined ? 'k' : m[2] !== undefined ? 's' : m[3] !== undefined || m[4] !== undefined ? 'n' : 'p';
    });
  }

  var YAML_KEY = /^(\s*)((?:-\s+)*)("(?:[^"\\]|\\.)*"|'(?:[^']|'')*'|[^\s#'"\[\]{},&*!|>%@`:][^:#]*?)(\s*:)(?=\s|$)(.*)$/;
  var YAML_ITEM = /^(\s*)((?:-\s+)+)(.*)$/;
  function yamlLine(line) {
    if (/^\s*#/.test(line)) return [['c', line]];
    if (/^(?:---|\.\.\.)(?:\s.*)?$/.test(line)) return [['h', line]];
    var m = YAML_KEY.exec(line);
    if (m) {
      var out = [[null, m[1]]];
      if (m[2]) out.push(['p', m[2]]);
      out.push(['k', m[3]], ['p', m[4]]);
      return out.concat(valueTokens(m[5], VALUE_YAML));
    }
    m = YAML_ITEM.exec(line);
    if (m) return [[null, m[1]], ['p', m[2]]].concat(valueTokens(m[3], VALUE_YAML));
    return valueTokens(line, VALUE_YAML);
  }

  function iniLine(line) {
    if (/^\s*[#;]/.test(line)) return [['c', line]];
    var m = /^(\s*)(\[\[?[^\]\n]+\]\]?)(.*)$/.exec(line);
    if (m) return [[null, m[1]], ['h', m[2]]].concat(valueTokens(m[3], VALUE_INI));
    m = /^(\s*)([^=:\s][^=:]*?)(\s*[=:]\s*)(.*)$/.exec(line);
    if (m) return [[null, m[1]], ['k', m[2]], ['p', m[3]]].concat(valueTokens(m[4], VALUE_INI));
    return valueTokens(line, VALUE_INI);
  }

  var MD_INLINE = /(`[^`\n]+`)|(\*\*[^*\n]+\*\*|__[^_\n]+__)|(\[[^\]\n]+\]\([^)\n]*\))/g;
  function mdLine(line, st) {
    if (/^\s*(?:```|~~~)/.test(line)) { st.fence = !st.fence; return [['p', line]]; }
    if (st.fence) return [['s', line]];
    if (/^#{1,6}(?:\s.*)?$/.test(line)) return [['h', line]];
    if (/^\s*([-*_])(?:\s*\1){2,}\s*$/.test(line)) return [['p', line]];
    var out = [];
    var rest = line;
    var m = /^(\s*>+\s?)(.*)$/.exec(rest) || /^(\s*(?:[-*+]|\d+[.)])\s+)(.*)$/.exec(rest);
    if (m) { out.push(['p', m[1]]); rest = m[2]; }
    return out.concat(scanGroups(rest, MD_INLINE, function (g) { return g[1] !== undefined ? 's' : g[2] !== undefined ? 'b' : 'k'; }));
  }

  // 태그 안(속성)을 한 글자 단위가 아니라 낱말 단위로 읽는다(sticky 정규식).
  var XML_OPEN = /<([\/?!]?)([A-Za-z_:][\w:.-]*)?/y;
  var XML_TAG = /(\s+)|(\/?\??>)|("[^"]*"|'[^']*')|([^\s=\/>"']+)(?=\s*=)|(=)|([^\s=\/>"']+)|([\s\S])/y;
  function xmlLine(line, st) {
    var out = [];
    var n = line.length;
    var i = 0;
    function push(cls, from, to) { if (to > from) out.push([cls, line.slice(from, to)]); }
    while (i < n) {
      if (st.mode === 'comment') {
        var end = line.indexOf('-->', i);
        if (end < 0) { push('c', i, n); i = n; } else { push('c', i, end + 3); i = end + 3; st.mode = ''; }
      } else if (st.mode === 'tag') {
        XML_TAG.lastIndex = i;
        var t = XML_TAG.exec(line);
        var cls = t[2] !== undefined ? 'p' : t[3] !== undefined ? 's' : t[4] !== undefined ? 'n' : t[5] !== undefined ? 'p' : null;
        if (t[2] !== undefined) st.mode = '';
        push(cls, i, i + t[0].length);
        i += t[0].length;
      } else {
        var lt = line.indexOf('<', i);
        if (lt < 0) { push(null, i, n); break; }
        push(null, i, lt);
        if (line.substr(lt, 4) === '<!--') { push('c', lt, lt + 4); i = lt + 4; st.mode = 'comment'; continue; }
        XML_OPEN.lastIndex = lt;
        var o = XML_OPEN.exec(line);
        if (!o || (!o[1] && !o[2])) { push(null, lt, lt + 1); i = lt + 1; continue; }   // 글 속의 '<'
        push('p', lt, lt + 1 + o[1].length);
        if (o[2]) push('k', lt + 1 + o[1].length, lt + o[0].length);
        i = lt + o[0].length;
        st.mode = 'tag';
      }
    }
    return out;
  }

  var LOG_RE = /(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:[.,]\d+)?(?:Z|[+-]\d{2}:?\d{2})?)|\b(FATAL|CRITICAL|SEVERE|ERROR|ERR|WARN(?:ING)?|INFO|NOTICE|DEBUG|TRACE|VERBOSE)\b|(\[[^\]\n]{1,60}\])/g;
  function logLevel(word) {
    word = word.toUpperCase();
    if (/^(?:FATAL|CRITICAL|SEVERE|ERROR|ERR)$/.test(word)) return 'e';
    if (/^WARN/.test(word)) return 'w';
    if (/^(?:INFO|NOTICE)$/.test(word)) return 'i';
    return 'd';
  }
  function logLine(line, st) {
    return scanGroups(line, LOG_RE, function (m) {
      if (m[1] !== undefined) return 'd';
      var level = '';
      if (m[2] !== undefined) level = logLevel(m[2]);
      else if (/^\[(?:FATAL|CRITICAL|SEVERE|ERROR|ERR|WARN(?:ING)?|INFO|NOTICE|DEBUG|TRACE|VERBOSE)\]$/i.test(m[3])) level = logLevel(m[3].slice(1, -1));
      if (!level) return 'p';
      if (level === 'e') st.flag = 'err';
      else if (level === 'w' && st.flag !== 'err') st.flag = 'warn';
      return level;
    });
  }

  function plainLine(line) { return line ? [[null, line]] : []; }

  var LANGS = {
    json: { label: 'JSON', line: jsonLine },
    yaml: { label: 'YAML', line: yamlLine },
    ini: { label: '설정', line: iniLine },
    toml: { label: 'TOML', line: iniLine },
    md: { label: 'Markdown', line: mdLine },
    xml: { label: 'XML', line: xmlLine },
    log: { label: '로그', line: logLine },
    text: { label: '텍스트', line: plainLine }
  };
  var EXT_LANG = { json: 'json', yml: 'yaml', yaml: 'yaml', ini: 'ini', conf: 'ini', cfg: 'ini', toml: 'toml', md: 'md', markdown: 'md', xml: 'xml', log: 'log' };

  function languageOf(ext) { return EXT_LANG[String(ext || '').toLowerCase()] || 'text'; }

  function analyze(lang, lines) {
    var fn = LANGS[lang].line;
    var st = {};
    return lines.map(function (line) {
      st.flag = '';
      var tokens;
      if (line.length > HIGHLIGHT_MAX_LINE) tokens = plainLine(line);
      else {
        try { tokens = fn(line, st); } catch (error) { tokens = plainLine(line); }
      }
      return { tokens: tokens, flag: st.flag };
    });
  }

  // ── 화면 ────────────────────────────────────────────────────────────
  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function icon(name) {
    var node = el('i', 'th-fa th-fa-' + name);
    node.setAttribute('aria-hidden', 'true');
    return node;
  }

  // kind: ok | warn | plain
  function chip(kind, iconName, text, title) {
    var li = el('li', 'th-text-chip th-text-chip--' + kind);
    if (iconName) li.appendChild(icon(iconName));
    li.appendChild(document.createTextNode(text));
    if (title) li.title = title;
    return li;
  }

  function kb(bytes) { return Math.round(bytes / 1024).toLocaleString('ko-KR') + 'KB'; }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      var area = el('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.cssText = 'position:fixed;top:-1000px;opacity:0';
      document.body.appendChild(area);
      area.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (error) { ok = false; }
      document.body.removeChild(area);
      if (ok) resolve(); else reject(new Error('copy failed'));
    });
  }

  function renderLines(parsed) {
    var code = el('code', 'th-text-code');
    var frag = document.createDocumentFragment();
    parsed.forEach(function (line) {
      var row = el('span', 'th-line' + (line.flag ? ' th-line--' + line.flag : ''));
      var body = el('span', 'th-code');
      line.tokens.forEach(function (token) {
        if (token[0]) body.appendChild(el('span', 'th-tok-' + token[0], token[1]));
        else body.appendChild(document.createTextNode(token[1]));
      });
      row.appendChild(body);
      frag.appendChild(row);
    });
    code.appendChild(frag);
    return code;
  }

  // 반환: { root(DOM 카드), truncated }
  // options: maxBytes, label(본문 영역 이름), ext(확장자, 하이라이트 종류), moreHint(잘렸을 때 덧붙일 안내)
  function render(buffer, options) {
    options = options || {};
    var maxBytes = options.maxBytes || 200 * 1024;
    var result = decode(buffer, maxBytes);
    var text = result.text.replace(/\r\n?/g, '\n');
    var lines = text.length ? text.split('\n') : [];
    if (lines.length && lines[lines.length - 1] === '') lines.pop();   // 끝의 줄바꿈 하나는 줄로 세지 않는다
    var lang = languageOf(options.ext);
    var broken = (text.match(/\uFFFD/g) || []).length;
    var big = lines.length > HIGHLIGHT_MAX_LINES;

    var card = el('div', 'th-text-card');
    card.setAttribute('data-wrap', 'on');
    card.style.setProperty('--th-ln-digits', String(String(lines.length).length));

    // 머리줄: 칩(종류·인코딩·줄 수·잘림) + 도구(줄바꿈·복사)
    var head = el('div', 'th-text-head');
    var chips = el('ul', 'th-text-chips');
    chips.setAttribute('aria-label', '파일 정보');
    var notes = [];
    chips.appendChild(chip('plain', 'code', LANGS[lang].label, lang === 'text' ? '' : '파일 종류에 맞춰 색을 입혔습니다.'));
    var label = encodingLabel(result);
    if (result.source === 'fallback') {
      chips.appendChild(chip('warn', 'circle-exclamation', label + ' 추정', 'UTF-8로 읽을 수 없어 EUC-KR(CP949)로 해석했습니다.'));
      notes.push('UTF-8이 아니어서 EUC-KR(CP949)로 추정해 읽었습니다. 글자가 깨져 보이면 원본을 내려받아 확인하세요.');
    } else {
      var why = result.source === 'bom' ? 'BOM(파일 맨 앞 표시)으로 인코딩을 확인했습니다.'
        : result.ascii ? 'ASCII 글자만 있어 UTF-8과 EUC-KR(CP949)에서 똑같이 보입니다.' : 'UTF-8로 정상적으로 읽었습니다.';
      chips.appendChild(chip('ok', 'circle-check', label, why));
    }
    if (broken) {
      chips.appendChild(chip('warn', 'circle-exclamation', '깨진 글자 ' + broken.toLocaleString('ko-KR') + '개', '읽을 수 없는 글자를 �로 표시했습니다.'));
      notes.push('읽을 수 없는 글자 ' + broken.toLocaleString('ko-KR') + '개를 �로 표시했습니다. 원본 인코딩이 다를 수 있으니 내려받아 확인하세요.');
    }
    chips.appendChild(chip('plain', '', lines.length.toLocaleString('ko-KR') + '줄'));
    if (result.truncated) {
      chips.appendChild(chip('warn', 'circle-exclamation', '앞부분 ' + kb(maxBytes) + '만 표시'));
      notes.push('앞부분 ' + kb(maxBytes) + '만 보여 줍니다. ' + (options.moreHint || '전체는 원본을 내려받아 확인하세요.'));
    }
    if (big) chips.appendChild(chip('plain', '', '줄 번호·색 생략', '줄이 ' + HIGHLIGHT_MAX_LINES.toLocaleString('ko-KR') + '개를 넘는 큰 파일은 본문만 보여 줍니다.'));
    head.appendChild(chips);

    var tools = el('div', 'th-text-tools');
    var wrapButton = el('button', 'th-text-btn');
    wrapButton.type = 'button';
    wrapButton.setAttribute('aria-pressed', 'true');
    wrapButton.textContent = '줄바꿈';
    var copyButton = el('button', 'th-text-btn');
    copyButton.type = 'button';
    copyButton.appendChild(icon('copy'));
    var copyLabel = el('span', '', '복사');
    copyButton.appendChild(copyLabel);
    if (result.truncated) copyButton.title = '화면에 표시된 앞부분을 복사합니다.';
    tools.appendChild(wrapButton);
    tools.appendChild(copyButton);
    head.appendChild(tools);
    card.appendChild(head);

    if (notes.length) {
      var alert = el('div', 'th-text-alert');
      alert.setAttribute('role', 'note');
      alert.appendChild(icon('circle-exclamation'));
      var list = el('p', '', notes.join(' '));
      alert.appendChild(list);
      card.appendChild(alert);
    }

    var pre = el('pre', 'th-text-pre');
    pre.tabIndex = 0;
    pre.setAttribute('role', 'region');
    pre.setAttribute('aria-label', options.label || '텍스트 파일 내용');
    if (big) {
      var plain = el('code', 'th-text-code th-text-code--plain');
      plain.textContent = text;
      pre.appendChild(plain);
    } else {
      pre.appendChild(renderLines(analyze(lang, lines)));
    }
    card.appendChild(pre);

    var status = el('span', 'th-sr-only');
    status.setAttribute('role', 'status');
    card.appendChild(status);

    wrapButton.addEventListener('click', function () {
      var on = card.getAttribute('data-wrap') !== 'on';
      card.setAttribute('data-wrap', on ? 'on' : 'off');
      wrapButton.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    var timer = 0;
    copyButton.addEventListener('click', function () {
      copyText(text).then(function () {
        copyLabel.textContent = '복사됨';
        status.textContent = '내용을 복사했습니다.';
      }, function () {
        copyLabel.textContent = '복사 실패';
        status.textContent = '복사하지 못했습니다. 본문을 직접 선택해 복사해 주세요.';
      }).then(function () {
        clearTimeout(timer);
        timer = setTimeout(function () { copyLabel.textContent = '복사'; status.textContent = ''; }, 2000);
      });
    });

    return { root: card, truncated: result.truncated };
  }

  window.KRDSText = { render: render, decode: decode, read: read };
})();
