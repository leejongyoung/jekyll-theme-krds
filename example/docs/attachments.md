---
layout: docs
title: 첨부 파일
lead: 문서·표·이미지 파일을 본문 미리보기와 글 하단 목록으로 보여주는 방법입니다.
tags: [첨부, 미리보기, 가이드]
attachments:
  - src: "/assets/files/sample.pdf"
    title: "첨부 예제 PDF"
    size: "5.8KB"
    sha256: "0e3be03e83aa11752eaf5cabd18d74b852596c67d29bb9cbab5cff7332e96e07"
  - src: "/assets/files/sample-diagram.svg"
    title: "첨부 예제 다이어그램"
    size: "1.7KB"
    sha256: "4e57eb6fc6662edeed97ecd4763c6825fb0fcec09487277a09d0b74f9a3f8ca9"
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
    size: "11.4KB"
    sha256: "84f03594c146a331013d6c31f2ce3f23ade79720237060b0384e73b67cde2bcf"
  - src: "/assets/files/sample.txt"
    title: "첨부 예제 텍스트"
    size: "474B"
    sha256: "2956c87d9a723e783a3de64ebd3d1baa40693dc7fd58734de420db7d4479ff6f"
  - src: "/assets/files/sample-euckr.txt"
    title: "첨부 예제 텍스트(EUC-KR)"
    size: "114B"
    sha256: "1f6fae6620804653d1ed3fcacf44b4f9a33a364a884a652f863585f39e10327a"
---

파일을 글에 직접 올려 미리보기와 함께 보여줍니다. 모든 미리보기는 브라우저 안에서 처리되며 외부 서비스에 연결하지 않습니다.

## pdf 미리보기

`pdf`는 브라우저 내장 뷰어로 바로 보여줍니다.

{% include embed/attachment.html src="/assets/files/sample.pdf" title="첨부 예제 PDF" size="5.8KB" sha256="0e3be03e83aa11752eaf5cabd18d74b852596c67d29bb9cbab5cff7332e96e07" %}

## 이미지 미리보기

이미지는 그대로 보여줍니다.

{% include embed/attachment.html src="/assets/files/sample-diagram.svg" title="첨부 예제 다이어그램" size="1.7KB" sha256="4e57eb6fc6662edeed97ecd4763c6825fb0fcec09487277a09d0b74f9a3f8ca9" %}

## 오피스 문서 + PDF 변환본

`docx`·`pptx` 같은 오피스 문서는 브라우저가 직접 그리지 못하므로 `preview_pdf`로 PDF 변환본을 함께 두면 그걸 보여줍니다. 미리보기 버튼은 PDF 변환본을 새 탭의 브라우저 viewer로 엽니다.

{% include embed/attachment.html src="/assets/files/sample-report.docx" title="첨부 예제 보고서" size="36.3KB" sha256="ad97c69b95bb82b009ba90f07d2fe8c59b1f1db8a89612e5b03b7bc88cabfcb1" preview_pdf="/assets/files/sample-report.pdf" %}

HWP/HWPX를 정확한 서식으로 보여 주거나 예전 형식 `hwp`를 미리 보려면 사이트의 GitHub Actions 빌드 job에서 아래 composite action을 정적 사이트 빌드보다 먼저 실행하세요. Ubuntu runner에 LibreOffice와 해시가 고정된 H2Orestart v0.8.0을 설치하고, 원본과 같은 경로·이름의 `.pdf`를 생성합니다.

```yaml
- uses: actions/checkout@v7
- uses: leejongyoung/jekyll-theme-krds/document-previews@v1.8.0
  with:
    source: assets/files
- run: bundle exec jekyll build
```

예를 들어 `assets/files/예산안.hwpx`는 `assets/files/예산안.pdf`로 변환됩니다. include에는 `preview_pdf="/assets/files/예산안.pdf"`를 지정하세요. 변환 결과는 workflow 작업 공간에서만 만들면 되므로 PDF를 저장소에 커밋할 필요가 없습니다. 한컴오피스 고유 객체는 변환 결과를 별도로 확인해야 합니다.

## 한글(HWPX) 미리보기

`hwpx`는 변환 없이 브라우저가 파일을 직접 읽어 보여줍니다. 문단, 글자 모양(굵기·기울임·밑줄·취소선·색·크기), 문단 정렬, 표(칸 합치기 포함), 그림(PNG·JPEG·GIF·BMP·WebP·SVG)을 그립니다. 테마에 포함된 `hwpx.js`가 ZIP을 풀어 처리하며 외부 연결이 없습니다.

{% include embed/attachment.html src="/assets/files/sample.hwpx" title="첨부 예제 한글 문서" size="11.4KB" sha256="84f03594c146a331013d6c31f2ce3f23ade79720237060b0384e73b67cde2bcf" %}

- **그리지 않는 것:** 쪽 모양, 머리말·꼬리말·쪽 번호, 도형·글상자, 수식, 변경 추적. 그래서 글과 표를 훑어보는 용도입니다. 서식까지 정확히 보여야 하면 위의 PDF 변환본을 `preview_pdf`로 함께 두세요(변환본이 있으면 PDF가 우선입니다).
- **지원하지 않는 형식:** 예전 형식 `hwp`와 암호가 걸린 문서는 미리볼 수 없고 내려받기만 나옵니다.
- **브라우저:** ZIP을 풀 때 브라우저의 `DecompressionStream`을 씁니다(최근 Chrome·Edge·Safari·Firefox). 지원하지 않으면 안내 문구와 내려받기가 나옵니다.
- 문서가 크면(30MB 초과) 미리보기를 건너뛰고, 문단이 4000개를 넘으면 앞부분만 보여줍니다.
- 미리보기 버튼은 새 탭의 viewer에서 같은 내용을 크게 열고 인쇄할 수 있습니다.

## 스프레드시트 미리보기

`xlsx`·`xls`·`ods`·`csv`·`tsv`는 표로 바로 보여줍니다(처음 100행까지, 전체는 내려받기). 테마에 포함된 SheetJS로 처리하며 외부 연결이 없습니다.

{% include embed/attachment.html src="/assets/files/sample-data.xlsx" title="첨부 예제 데이터" size="5.2KB" sha256="f60aa2d526e8482478469c3f19a1b9a398c8081d72c3250c4c8186d54373a414" %}

## 텍스트 미리보기

`txt`·`log`·`md`·`json`·`xml`·`yml`·`ini`·`conf`·`toml` 같은 텍스트 파일은 `<pre>` 영역에 그대로 보여줍니다. 줄바꿈과 들여쓰기가 유지되고, 본문 카드는 앞 100KB까지, 새 탭 viewer(`미리보기` 버튼, 인쇄 가능)는 앞 2MB까지 보여줍니다.

- 인코딩은 BOM(UTF-8·UTF-16) → UTF-8 → EUC-KR(CP949) 순서로 자동 판별해서 오래된 한글 텍스트도 깨지지 않습니다.
- 내용은 글자로만 넣으므로 파일 안의 HTML이나 스크립트는 실행되지 않습니다. 아래 예제 파일에도 `<script>` 태그가 들어 있지만 글자 그대로 보입니다.
- `md`도 서식 없이 원문 그대로 보여줍니다. `csv`·`tsv`는 스프레드시트로 처리해 표로 보입니다.
- 바이너리 파일처럼 0 바이트(NUL)가 들어 있으면 텍스트로 보지 않고 내려받기만 안내합니다.

{% include embed/attachment.html src="/assets/files/sample.txt" title="첨부 예제 텍스트" size="474B" sha256="2956c87d9a723e783a3de64ebd3d1baa40693dc7fd58734de420db7d4479ff6f" %}

{% include embed/attachment.html src="/assets/files/sample-euckr.txt" title="첨부 예제 텍스트(EUC-KR)" size="114B" sha256="1f6fae6620804653d1ed3fcacf44b4f9a33a364a884a652f863585f39e10327a" %}

## 미리보기 없는 파일

변환본이 없는 문서(`hwp`·`ppt` 등)는 내려받기 카드만 나옵니다. 미리보기가 되는 파일도 `preview=false`를 주면 카드만 표시됩니다.

{% include embed/attachment.html src="/assets/files/sample.txt" title="첨부 예제 텍스트" size="474B" preview=false %}

## 바이러스 검사 표시(선택)

사이트를 GitHub Actions로 빌드한다면 테마의 `attachment-scan` action으로 첨부 파일을 [ClamAV](https://www.clamav.net/)로 검사하고, 통과한 파일 카드에 "바이러스 검사 통과" 표시를 붙일 수 있습니다(마우스를 올리면 검사 엔진과 날짜가 보입니다). 이 페이지의 카드들이 그 결과입니다.

```yaml
- uses: actions/checkout@v7
- name: Scan attachment files for viruses (first time only)
  uses: leejongyoung/jekyll-theme-krds/attachment-scan@v1.8.0
  with:
    source: assets/files
    manifest: _data/attachment_scan.json
    url-prefix: /assets/files   # 파일이 사이트에서 제공되는 주소(기본값)
```

- **최초 한 번만 검사합니다.** 검사 결과는 `_data/attachment_scan.json`에 파일 주소·SHA-256·검사 날짜·엔진 버전으로 기록되고, 주소와 SHA-256이 같은 파일은 다시 검사하지 않습니다. 새로 넣은 파일이나 내용이 바뀐 파일만 검사합니다. 이 파일을 저장소에 커밋해 두면 다음 빌드부터 건너뛰고, 커밋하지 않으면 빌드마다 전부 검사합니다(이 데모 방식).
- 감염이 발견되면 빌드가 실패하고 그 파일은 기록되지 않습니다. 사이트에 올라가기 전에 막힙니다.
- 파일이 바뀌었는데 front matter의 `sha256`이 예전 값이면 표시를 달지 않습니다.
- 정적 사이트 빌드보다 먼저, `document-previews`보다도 먼저 실행하세요(변환된 PDF는 매번 달라져 검사 대상이 되지 않게 하기 위함입니다).
- 처음 올리는 파일은 컴퓨터에서 먼저 검사해도 됩니다. `brew install clamav && freshclam` 뒤에 `python3 attachment-scan/scan.py scan --source assets/files --manifest _data/attachment_scan.json`를 실행하고 만들어진 JSON을 커밋하세요.
- **한계:** 검사는 파일을 처음 넣을 때 그 시점의 바이러스 정의로 한 번만 합니다. 이후에 나온 정의로는 다시 보지 않으며(`rescan: "true"`로 전부 다시 검사), 검사 통과가 안전을 보증하지도 않습니다. 외부 주소(`http…`)의 파일은 검사하지 않습니다.

## 파일 정보 표시

본문 include는 미리보기와 파일 정보만 보여주며, 동작 버튼은 중복하지 않습니다. 글 하단 첨부 목록에서 `미리보기`와 `내려받기`를 같은 오른쪽 영역에 모아 제공합니다. PDF·이미지·스프레드시트·한글(hwpx)·텍스트의 미리보기는 새 탭의 전용 viewer에서 열립니다. 파일 아이콘은 [Font Awesome]({{ '/docs/icons/' | relative_url }}) 문서 아이콘을 확장자별 색 타일에 담아 보여주고(PDF 빨강, 워드 파랑, 스프레드시트 초록, "H"가 들어간 한글 진한 파랑 등), 확장자는 카드의 라벨로 표시합니다. `size`와 `sha256`을 적으면 파일명 옆에 용량과 SHA-256 전체 64자리를 표시합니다. 긴 해시는 줄바꿈되어 카드 너비를 넘지 않고, 모바일(767px 이하)에서는 제목·설명을 2줄, 해시를 1줄로 줄여 …로 표시합니다(전체 값은 문서에 그대로 있어 복사와 스크린리더에는 영향이 없습니다). 해시는 `shasum -a 256 파일`로 구합니다.

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
