---
layout: docs
title: 첨부 파일
lead: 문서·표·이미지 파일을 본문 미리보기와 글 하단 목록으로 보여주는 방법입니다.
tags: [첨부, 미리보기, 가이드]
attachments:
  - src: "/assets/files/sample.pdf"
    title: "첨부 예제 PDF"
    desc: "브라우저 내장 미리보기"
    size: "5.8KB"
    sha256: "0e3be03e83aa11752eaf5cabd18d74b852596c67d29bb9cbab5cff7332e96e07"
  - src: "/assets/files/sample-diagram.svg"
    title: "첨부 예제 다이어그램"
    desc: "이미지 미리보기"
    size: "1.7KB"
    sha256: "4e57eb6fc6662edeed97ecd4763c6825fb0fcec09487277a09d0b74f9a3f8ca9"
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
  - src: "/assets/files/sample.txt"
    title: "첨부 예제 텍스트"
    desc: "내려받기 카드"
    size: "331B"
    sha256: "3c43e35e6da55b79ef8814f3b852adbab0d057e329892bd16bc2c384e0c1d2bf"
---

파일을 글에 직접 올려 미리보기와 함께 보여줍니다. 모든 미리보기는 브라우저 안에서 처리되며 외부 서비스에 연결하지 않습니다.

## pdf 미리보기

`pdf`는 브라우저 내장 뷰어로 바로 보여줍니다.

{% include embed/attachment.html src="/assets/files/sample.pdf" title="첨부 예제 PDF" desc="브라우저 내장 미리보기" size="5.8KB" sha256="0e3be03e83aa11752eaf5cabd18d74b852596c67d29bb9cbab5cff7332e96e07" %}

## 이미지 미리보기

이미지는 그대로 보여줍니다.

{% include embed/attachment.html src="/assets/files/sample-diagram.svg" title="첨부 예제 다이어그램" desc="이미지 미리보기" size="1.7KB" sha256="4e57eb6fc6662edeed97ecd4763c6825fb0fcec09487277a09d0b74f9a3f8ca9" %}

## 오피스 문서 + PDF 변환본

`docx`·`hwpx` 같은 문서 파일은 브라우저가 직접 그리지 못하므로 `preview_pdf`로 PDF 변환본을 함께 두면 그걸 보여줍니다. 미리보기 버튼은 PDF 변환본을 새 탭의 브라우저 viewer로 엽니다.

{% include embed/attachment.html src="/assets/files/sample-report.docx" title="첨부 예제 보고서" desc="오피스 문서 + PDF 변환본" size="36.3KB" sha256="ad97c69b95bb82b009ba90f07d2fe8c59b1f1db8a89612e5b03b7bc88cabfcb1" preview_pdf="/assets/files/sample-report.pdf" %}

HWP/HWPX까지 로컬 도구 없이 변환하려면 사이트의 GitHub Actions 빌드 job에서 아래 composite action을 Jekyll 빌드보다 먼저 실행하세요. Ubuntu runner에 LibreOffice와 해시가 고정된 H2Orestart v0.8.0을 설치하고, 원본과 같은 경로·이름의 `.pdf`를 생성합니다.

```yaml
- uses: actions/checkout@v7
- uses: leejongyoung/jekyll-theme-krds/document-previews@v1.6.0
  with:
    source: assets/files
- run: bundle exec jekyll build
```

예를 들어 `assets/files/예산안.hwpx`는 `assets/files/예산안.pdf`로 변환됩니다. include에는 `preview_pdf="/assets/files/예산안.pdf"`를 지정하세요. 변환 결과는 workflow 작업 공간에서만 만들면 되므로 PDF를 저장소에 커밋할 필요가 없습니다. 한컴오피스 고유 객체는 변환 결과를 별도로 확인해야 합니다.

## 스프레드시트 미리보기

`xlsx`·`xls`·`ods`·`csv`·`tsv`는 표로 바로 보여줍니다(처음 100행까지, 전체는 내려받기). 테마에 포함된 SheetJS로 처리하며 외부 연결이 없습니다.

{% include embed/attachment.html src="/assets/files/sample-data.xlsx" title="첨부 예제 데이터" desc="스프레드시트 미리보기" size="5.2KB" sha256="f60aa2d526e8482478469c3f19a1b9a398c8081d72c3250c4c8186d54373a414" %}

## 미리보기 없는 파일

변환본이 없는 문서(`hwp`·`ppt` 등)나 텍스트는 내려받기 카드만 나옵니다. 같은 파일도 `preview=false`를 주면 카드만 표시됩니다.

{% include embed/attachment.html src="/assets/files/sample.txt" title="첨부 예제 텍스트" desc="내려받기 카드" size="331B" sha256="3c43e35e6da55b79ef8814f3b852adbab0d057e329892bd16bc2c384e0c1d2bf" %}

## 파일 정보 표시

본문 include는 미리보기와 파일 정보만 보여주며, 동작 버튼은 중복하지 않습니다. 글 하단 첨부 목록에서 `미리보기`와 `내려받기`를 같은 오른쪽 영역에 모아 제공합니다. PDF·이미지·스프레드시트의 미리보기는 새 탭의 전용 viewer에서 열립니다. 파일 아이콘은 [Font Awesome]({{ '/docs/icons/' | relative_url }}) 문서 아이콘을 확장자별 색 타일에 담아 보여주고(PDF 빨강, 워드 파랑, 스프레드시트 초록, 한글 보라 등), 확장자는 카드의 라벨로 표시합니다. `size`와 `sha256`을 적으면 파일명 옆에 용량과 SHA-256 전체 64자리를 표시합니다. 긴 해시는 줄바꿈되어 카드 너비를 넘지 않습니다. 해시는 `shasum -a 256 파일`로 구합니다.

## 글 하단 파일 목록

글 끝의 파일 목록은 front matter의 `attachments:`로 만듭니다. 이 페이지 아래에도 같은 목록이 보입니다.

```yaml
attachments:
  - src: "/assets/files/sample.pdf"
    title: "첨부 예제 PDF"
    size: "5.8KB"
    sha256: "0e3be03e83aa11752eaf5cabd18d74b852596c67d29bb9cbab5cff7332e96e07"
```

```liquid
{% raw %}{% include embed/attachment.html src="/assets/files/보고서.pdf" title="보고서" size="5.8KB" sha256="ab12…" %}{% endraw %}
{% raw %}{% include embed/attachment.html src="/assets/files/예산안.hwpx" title="예산안" preview_pdf="/assets/files/예산안.pdf" %}{% endraw %}
{% raw %}{% include embed/attachment.html src="/assets/files/자료.xlsx" title="자료" %}{% endraw %}
```
