---
layout: post
title: "첨부 파일 사용법 한눈에 보기"
tags: [가이드, 첨부]
author: jekyll-theme-krds
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
  - src: "/assets/files/sample.hwpx"
    title: "첨부 예제 한글 문서"
    desc: "한글(HWPX) 브라우저 미리보기"
    size: "11.4KB"
    sha256: "84f03594c146a331013d6c31f2ce3f23ade79720237060b0384e73b67cde2bcf"
---
글에 PDF, 오피스 문서, 한글 문서, 스프레드시트를 붙이는 방법을 순서대로 정리했습니다. 이 글 맨 아래의 "첨부 파일" 목록이 바로 아래 설명대로 만든 결과입니다.

## 1. 파일을 사이트에 넣기

`assets/files/` 폴더에 파일을 둡니다. 파일 주소는 `/assets/files/이름`처럼 씁니다. 사이트를 하위 주소(예: GitHub Pages 프로젝트 사이트)에 올려도 테마가 주소 앞부분을 알아서 붙여 줍니다.

## 2. 글 맨 위에 목록 적기

글 front matter의 `attachments`에 파일을 하나씩 적습니다. `src`만 필수이고 나머지는 선택입니다.

```yaml
attachments:
  - src: "/assets/files/보고서.docx"
    title: "2026 업무보고서"
    desc: "최종본, 12쪽"
    size: "36.3KB"
    sha256: "(shasum -a 256 으로 구한 값)"
    preview_pdf: "/assets/files/보고서.pdf"
```

글 끝에 파일마다 카드가 만들어집니다. 카드에는 확장자별 아이콘, 제목, 설명, 용량, 확장자 라벨, SHA-256 전체 값이 나오고, 오른쪽에 `미리보기`와 `내려받기` 버튼이 있습니다. 미리보기가 없는 파일은 `내려받기`만 나옵니다.

## 3. 본문 중간에 넣기

목록과 별개로 본문 안에 파일 카드를 바로 넣을 수도 있습니다. 아래 카드는 `preview="false"`를 주어 미리보기 없이 파일 정보만 보여 줍니다.

{% include embed/attachment.html src="/assets/files/sample.pdf" title="첨부 예제 PDF" desc="본문 카드(미리보기 없음)" size="5.8KB" sha256="0e3be03e83aa11752eaf5cabd18d74b852596c67d29bb9cbab5cff7332e96e07" preview=false %}

본문에 넣은 카드는 미리보기(PDF·이미지·표)와 파일 정보만 보여 주고 동작 버튼은 그리지 않습니다. 버튼은 글 하단 목록에만 있어서 같은 파일이 두 번 나와도 버튼이 겹치지 않습니다. 쓰는 법은 이렇습니다.

```liquid
{% raw %}{% include embed/attachment.html src="/assets/files/보고서.pdf" title="보고서" size="5.8KB" %}
{% include embed/attachment.html src="/assets/files/보고서.docx" title="보고서" preview_pdf="/assets/files/보고서.pdf" %}{% endraw %}
```

## 4. 어떤 파일이 미리보기가 되나요

| 파일 | 미리보기 방법 |
| :--- | :--- |
| PDF, 이미지 | 브라우저가 직접 그립니다. 버튼을 누르면 새 탭의 viewer가 열립니다. |
| 스프레드시트(`xlsx`, `xls`, `ods`, `csv`, `tsv`) | 테마에 들어 있는 SheetJS가 표로 보여 줍니다(처음 100행). |
| 한글 문서(`hwpx`) | 브라우저가 파일을 직접 읽어 글·표·그림을 보여 줍니다(도형·머리말은 제외). 변환본(`preview_pdf`)이 있으면 PDF가 우선입니다. |
| 오피스 문서(`docx`, `pptx` 등) | PDF 변환본(`preview_pdf`)이 있을 때 그 PDF를 보여 줍니다. |
| 텍스트(`txt`, `log`, `md`, `json` 등) | `<pre>` 영역에 그대로 보여 줍니다(본문 카드는 앞 100KB, viewer는 앞 2MB). UTF-8과 EUC-KR은 자동으로 판별합니다. |
| 그 밖의 파일 | 카드와 `내려받기`만 나옵니다. |

모든 미리보기는 브라우저 안에서만 처리되고 외부 서비스에 파일을 보내지 않습니다.

## 5. 한글과 오피스 문서는 PDF로 바꿔 두기

`docx` 같은 오피스 문서는 브라우저가 직접 그리지 못합니다. 빌드할 때 PDF로 바꿔 두면 그 PDF로 미리보기를 보여 줄 수 있습니다. `hwpx`는 바로 미리볼 수 있지만, 서식까지 정확히 보여야 하거나 예전 형식 `hwp`라면 변환이 필요합니다. GitHub Actions를 쓴다면 테마의 `document-previews` 액션이 Ubuntu에 LibreOffice와 H2Orestart(한글 문서 변환 확장)를 설치해 원본과 같은 이름의 `.pdf`를 만들어 줍니다.

```yaml
- uses: actions/checkout@v7
- uses: leejongyoung/jekyll-theme-krds/document-previews@v1.7.1
  with:
    source: assets/files
- run: bundle exec jekyll build
```

변환된 PDF는 작업 공간에만 만들면 되므로 저장소에 올릴 필요가 없습니다. 한컴오피스 고유 개체는 변환 결과를 눈으로 확인하세요.

## 6. 용량과 해시 적어 두기

`size`와 `sha256`을 적어 두면 받는 사람이 파일이 바뀌지 않았는지 확인할 수 있습니다. 해시는 터미널에서 `shasum -a 256 파일` 으로 구합니다.

## 더 보기

- 전체 옵션과 예제: [첨부 파일 문서]({{ '/docs/attachments/' | relative_url }})
- 위키에서 같은 기능을 쓰는 예: [첨부 파일 위키 문서]({{ '/wiki/attachments/' | relative_url }})
- 아이콘 규칙과 직접 쓰는 방법: [아이콘 문서]({{ '/docs/icons/' | relative_url }})
