/*
 * jekyll-theme-krds: 수식 렌더링.
 * kramdown이 만든 \( ... \)(인라인)와 \[ ... \](블록), 그리고 $$ ... $$ 를 KaTeX로 그린다.
 * 단일 $ 는 가격 표기와 구분할 수 없어서 쓰지 않는다. 코드 블록(pre, code) 안은 건드리지 않는다.
 * KaTeX는 보이는 수식과 함께 MathML도 내보내서 스크린리더가 읽을 수 있다.
 */
(function () {
  'use strict';
  function render() {
    if (typeof window.renderMathInElement !== 'function') return;
    var roots = document.querySelectorAll('.th-prose');
    if (!roots.length) roots = [document.body];
    Array.prototype.forEach.call(roots, function (el) {
      window.renderMathInElement(el, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '\\[', right: '\\]', display: true },
          { left: '\\(', right: '\\)', display: false }
        ],
        throwOnError: false, // 잘못된 수식은 오류 대신 원문을 빨갛게 보여 준다
        strict: 'ignore',
        output: 'htmlAndMathml'
      });
    });
  }
  render();
})();
