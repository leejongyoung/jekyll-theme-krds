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
    desc: "브라우저 내장 미리보기"
    size: "5.8KB"
    sha256: "0e3be03e83aa11752eaf5cabd18d74b852596c67d29bb9cbab5cff7332e96e07"
  - src: "/assets/files/sample-report.docx"
    title: "첨부 예제 보고서"
    desc: "오피스 문서 + PDF 변환본"
    size: "36.3KB"
    sha256: "ad97c69b95bb82b009ba90f07d2fe8c59b1f1db8a89612e5b03b7bc88cabfcb1"
    preview_pdf: "/assets/files/sample-report.pdf"
  - src: "/assets/files/sample-data.xlsx"
    title: "첨부 예제 데이터"
    desc: "스프레드시트 미리보기"
    size: "5.2KB"
    sha256: "f60aa2d526e8482478469c3f19a1b9a398c8081d72c3250c4c8186d54373a414"
---
문서 front matter의 `attachments`에 파일을 적으면 이 페이지 아래처럼 목록이 만들어집니다. 각 줄에는 형식별 [[아이콘]], 용량, SHA-256 전체 값, 그리고 `미리보기`와 `내려받기` 버튼이 나옵니다.

- PDF와 이미지는 새 탭의 viewer에서, 스프레드시트는 표로 미리 봅니다.
- `docx`·`hwpx` 같은 문서는 PDF 변환본(`preview_pdf`)이 있을 때 미리 볼 수 있습니다. 변환은 GitHub Actions의 `document-previews`가 맡습니다.
- 본문 중간에는 `{% raw %}{% include embed/attachment.html src="..." title="..." %}{% endraw %}`로 파일 카드를 넣을 수 있습니다.

전체 설명과 예제는 [첨부 파일 문서]({{ '/docs/attachments/' | relative_url }})에 있습니다. 위키 문서에서도 똑같이 쓰는 것은 [[위키 사용법]]의 front matter 규칙이 같기 때문입니다.
