/* KRDSText — 첨부 텍스트 파일(txt·log·md·json 등)을 <pre>로 보여 준다. 외부 연결 없음.
   인코딩은 BOM → UTF-8 → EUC-KR(CP949) 순으로 판별하고, NUL 바이트가 있으면 텍스트가 아닌 것으로 본다.
   내용은 textContent로만 넣으므로 파일 안의 HTML은 실행되지 않는다. */
(function () {
  'use strict';

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

  // buffer(ArrayBuffer), maxBytes(이 크기까지만 읽음) → { text, encoding, truncated }
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
    var text;
    try {
      text = new TextDecoder(encoding, { fatal: true }).decode(bytes, options);
    } catch (error) {
      if (bom) throw fail('텍스트를 읽지 못했습니다.');
      encoding = 'euc-kr';
      text = new TextDecoder(encoding).decode(bytes, options);
    }
    return { text: text, encoding: encoding, truncated: truncated };
  }

  function label(encoding) {
    return { 'utf-8': 'UTF-8', 'utf-16le': 'UTF-16', 'utf-16be': 'UTF-16', 'euc-kr': 'EUC-KR(CP949)' }[encoding] || encoding;
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

  // 반환: { root(DOM), note(문장), truncated }
  function render(buffer, options) {
    var maxBytes = (options && options.maxBytes) || 200 * 1024;
    var result = decode(buffer, maxBytes);
    var text = result.text.replace(/\r\n?/g, '\n');
    var lines = text.length ? text.split('\n').length : 0;
    var pre = document.createElement('pre');
    pre.className = 'th-text-pre';
    pre.tabIndex = 0;
    pre.setAttribute('role', 'region');
    pre.setAttribute('aria-label', (options && options.label) || '텍스트 파일 내용');
    pre.textContent = text;
    var note = label(result.encoding) + ' · ' + lines.toLocaleString('ko-KR') + '줄';
    if (result.truncated) note += ' · 앞부분 ' + Math.round(maxBytes / 1024).toLocaleString('ko-KR') + 'KB만 표시';
    return { root: pre, note: note, truncated: result.truncated };
  }

  window.KRDSText = { render: render, decode: decode, read: read };
})();
