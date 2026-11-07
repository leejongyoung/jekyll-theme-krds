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
  - src: "/assets/files/sample-data.xlsx"
    title: "첨부 예제 데이터"
    desc: "스프레드시트 미리보기"
    size: "5.2KB"
    sha256: "f60aa2d526e8482478469c3f19a1b9a398c8081d72c3250c4c8186d54373a414"
  - src: "/assets/files/sample.txt"
    title: "첨부 예제 텍스트"
    desc: "내려받기 카드"
    size: "331B"
    sha256: "3c43e35e6da55b79ef8814f3b852adbab0d57e329892bd16bc2c384e0c1d2bf"
---

파일을 글에 직접 올려 미리보기와 함께 보여줍니다. 모든 미리보기는 브라우저 안에서 처리되며 외부 서비스에 연결하지 않습니다.

## pdf 미리보기

`pdf`는 브라우저 내장 뷰어로 바로 보여줍니다.

{% include embed/attachment.html src="/assets/files/sample.pdf" title="첨부 예제 PDF" desc="브라우저 내장 미리보기" size="5.8KB" sha256="0e3be03e83aa11752eaf5cabd18d74b852596c67d29bb9cbab5cff7332e96e07" %}

## 이미지 미리보기

이미지는 그대로 보여줍니다.

{% include embed/attachment.html src="/assets/files/sample-diagram.svg" title="첨부 예제 다이어그램" desc="이미지 미리보기" size="1.7KB" sha256="4e57eb6fc6662edeed97ecd4763c6825fb0fcec09487277a09d0b74f9a3f8ca9" %}

## 오피스 문서 + PDF 변환본

`docx`·`hwpx` 같은 문서 파일은 브라우저가 직접 그리지 못하므로 `preview_pdf`로 PDF 변환본을 함께 두면 그걸 보여줍니다.

{% include embed/attachment.html src="/assets/files/sample-report.docx" title="첨부 예제 보고서" desc="오피스 문서 + PDF 변환본" size="36.3KB" sha256="ad97c69b95bb82b009ba90f07d2fe8c59b1f1db8a89612e5b03b7bc88cabfcb1" preview_pdf="/assets/files/sample-report.pdf" %}

오피스 문서를 PDF로 바꾸는 예: `libreoffice --headless --convert-to pdf 보고서.docx`를 실행해 원본 옆에 같은 이름의 `.pdf`를 두고 `preview_pdf`로 가리키세요. `hwpx`·`hwp`는 순정 LibreOffice에서 열리지 않아 H2Orestart 확장이 필요합니다(Linux: `sudo apt install libreoffice-h2orestart`, macOS·Windows: 확장 관리자에 H2Orestart.oxt 추가). 가장 정확한 결과는 한컴오피스에서 PDF로 저장하기입니다.

## 스프레드시트 미리보기

`xlsx`·`xls`·`ods`·`csv`·`tsv`는 표로 바로 보여줍니다(처음 100행까지, 전체는 내려받기). 테마에 포함된 SheetJS로 처리하며 외부 연결이 없습니다.

{% include embed/attachment.html src="/assets/files/sample-data.xlsx" title="첨부 예제 데이터" desc="스프레드시트 미리보기" size="5.2KB" sha256="f60aa2d526e8482478469c3f19a1b9a398c8081d72c3250c4c8186d54373a414" %}

## 미리보기 없는 파일

변환본이 없는 문서(`hwp`·`ppt` 등)나 텍스트는 내려받기 카드만 나옵니다. 같은 파일도 `preview=false`를 주면 카드만 표시됩니다.

{% include embed/attachment.html src="/assets/files/sample.txt" title="첨부 예제 텍스트" desc="내려받기 카드" size="331B" sha256="3c43e35e6da55b79ef8814f3b852adbab0d57e329892bd16bc2c384e0c1d2bf" %}

## 파일 정보 표시

내려받기 오른쪽 미리보기 버튼은 새 창에서 파일을 엽니다. `size`와 `sha256`을 적으면 파일명 옆에 용량·해시 앞부분이 표시됩니다(전체 해시는 말풍선으로 확인). 해시는 `shasum -a 256 파일`로 구합니다.

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
