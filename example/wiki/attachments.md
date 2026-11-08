---
layout: wiki
title: 첨부 파일
summary: 문서에 파일을 붙여 목록과 미리보기로 보여 주는 기능의 요약입니다.
category: 기능
wiki_aliases: [첨부, attachments]
tags: [기능, 첨부]
date: 2026-11-05
updated: 2026-11-08
attachments:
  - src: "/assets/files/sample.pdf"
    title: "첨부 예제 PDF"
    size: "5.8KB"
    sha256: "0e3be03e83aa11752eaf5cabd18d74b852596c67d29bb9cbab5cff7332e96e07"
  - src: "/assets/files/sample-report.docx"
    title: "첨부 예제 보고서"
    size: "36.3KB"
    sha256: "ad97c69b95bb82b009ba90f07d2fe8c59b1f1db8a89612e5b03b7bc88cabfcb1"
    preview_pdf: "/assets/files/sample-report.pdf"
  - src: "/assets/files/sample-data.xlsx"
    title: "첨부 예제 데이터"
    size: "5.2KB"
    sha256: "f60aa2d526e8482478469c3f19a1b9a398c8081d72c3250c4c8186d54373a414"
  - src: "/assets/files/sample.hwpx"
    title: "첨부 예제 한글 문서"
    size: "11.7KB"
    sha256: "5c121fe16c4375fd1cec206bdb180ea6d3e30c88e528f97ad0b05a40af1f7ddd"
---
문서 front matter의 `attachments`에 파일을 적으면 이 페이지 아래처럼 목록이 만들어집니다. 각 줄에는 형식별 [[아이콘]], 용량, SHA-256 전체 값, 그리고 `미리보기`와 `내려받기` 버튼이 나옵니다.

- PDF와 이미지는 새 탭의 viewer에서, 스프레드시트는 표로 미리 봅니다.
- `hwp`·`hwpx` 한글 문서는 변환 없이 브라우저가 쪽 모양 그대로 그려 미리 보여 줍니다. `docx` 같은 문서는 PDF 변환본(`preview_pdf`)이 있을 때 미리 볼 수 있고, 변환은 GitHub Actions의 `document-previews`가 맡습니다.
- 텍스트(`txt`·`log`·`md`·`json` 등)는 `<pre>` 영역에 그대로 보여 주고, 새 탭 viewer에서는 앞 2MB까지 볼 수 있습니다. 인코딩(UTF-8·EUC-KR)은 자동으로 판별합니다.
- 빌드할 때 `attachment-scan` action으로 ClamAV 검사를 돌리면 검사에 통과한 파일에 "바이러스 검사 통과" 표시가 붙습니다. 파일을 처음 넣을 때 한 번만 검사합니다.
- 본문 중간에는 `{% raw %}{% include embed/attachment.html src="..." title="..." %}{% endraw %}`로 파일 카드를 넣을 수 있습니다.

전체 설명과 예제는 [첨부 파일 문서]({{ '/docs/attachments/' | relative_url }})에 있습니다. 위키 문서에서도 똑같이 쓰는 것은 [[위키 사용법]]의 front matter 규칙이 같기 때문입니다.
