---
layout: wiki
title: 아이콘
summary: Font Awesome Free 아이콘을 쓰는 방법과 파일 형식별 아이콘 규칙입니다.
category: 기능
wiki_aliases: [Font Awesome, FA, 아이콘 세트]
tags: [기능, 디자인]
date: 2026-11-06
updated: 2026-11-08
---
{% include embed/icon.html name="file-pdf" %} {% include embed/icon.html name="file-word" %} {% include embed/icon.html name="file-excel" %} {% include embed/icon.html name="file-lines" %} {% include embed/icon.html name="book-open" %} {% include embed/icon.html name="github" style="brands" %}

테마에는 Font Awesome Free 7.3.1의 SVG 아이콘 일부가 들어 있습니다. 글자색을 따라 칠해지는 마스크 아이콘이라서 따로 글꼴 파일을 받지 않고, 외부 서버에 연결하지도 않습니다.

## 쓰는 법

- 본문: `{% raw %}{% include embed/icon.html name="file-pdf" %}{% endraw %}`, `{% raw %}{% include embed/icon.html name="github" style="brands" %}{% endraw %}`
- 스타일은 `solid`(기본), `regular`, `brands`입니다.
- 의미가 있는 아이콘에는 `label`을 적어 스크린리더 이름을 줍니다. 장식이면 비워 두면 숨겨집니다.
- 전체 목록은 문서의 "아이콘" 페이지에서 볼 수 있습니다.

## 파일 형식별 아이콘

[[첨부 파일]]은 확장자로 아이콘과 색을 고릅니다. PDF는 빨강, 워드 문서는 파랑, 스프레드시트는 초록, 한글(hwp·hwpx)은 보라, 이미지는 연보라입니다. 표에 없는 확장자는 회색 일반 파일 아이콘으로 나옵니다.

## 라이선스

아이콘은 CC BY 4.0이라 출처 표기가 필요합니다. 저장소의 `NOTICE.md`와 `assets/img/fa/LICENSE.txt`에 표기와 전문이 있으니 지우지 마세요.
