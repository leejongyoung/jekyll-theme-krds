# jekyll-theme-krds

> 행정안전부가 공공누리 제1유형으로 개방한 [범정부 UI/UX 디자인시스템(KRDS)](https://www.krds.go.kr)을 바탕으로 만든 Jekyll 테마입니다.
> *Jekyll theme based on KRDS (Korea Design System).*

KRDS의 디자인 토큰과 HTML 컴포넌트를 그대로 가져와 문서·블로그 사이트를 만드는 범용 Jekyll 테마입니다.

- **KRDS 원본 유지:** 토큰·SCSS·JS는 원본을 고치지 않고 `vendor`로 가져옵니다. 색과 글꼴은 CSS 변수를 다시 선언해서 바꿉니다(KRDS 개발자 가이드의 방식).
- **글자 크기·화면 모드:** 글자 크기 5단계, 화면 모드(기본 밝은 배경 / 선명하게 어두운 배경 / 시스템 설정)를 헤더에서 바꾸고 기억합니다.
- **레이아웃:** `home`, `page`, `docs`(사이드 내비게이션 + 이 페이지의 구성), `blog`, `post`, `tags`(태그 모아보기), `search`(검색)
- **컴포넌트:** 건너뛰기 링크, 헤더·메인메뉴(PC)·전체메뉴(모바일), 브레드크럼, 사이드 내비게이션, 페이지네이션, 푸터, 버튼·배지
- **서체:** Pretendard GOV 셀프 호스팅(외부 CDN 없음)
- **태그·검색:** 태그 링크와 태그 페이지, 서버 없이 브라우저에서 도는 검색(한글 부분 일치, 태그로 좁히기, 질문처럼 문장으로 적어 가까운 내용 찾기, 선택 기능으로 방문자 API 키를 쓰는 AI 답변)
- **아이콘:** Font Awesome Free SVG 아이콘 세트(`embed/icon.html` include). 첨부 파일 카드는 확장자별 아이콘을 자동으로 고릅니다.
- **위키:** `[[문서 링크]]`, 역링크, 정보 상자, 분류·검색 필터, 작성이 필요한 문서·고아 문서 목록을 갖춘 위키 레이아웃

**데모:** <https://leejongyoung.github.io/jekyll-theme-krds/> · 소스: [`example/`](example) (`bundle exec jekyll serve`로 확인)

## 설치

이 테마는 **Jekyll 4**(Dart Sass)가 필요합니다.

> **GitHub Pages의 기본 빌더로는 빌드되지 않습니다.** *Deploy from a branch*에서 GitHub가 직접 빌드하는 방식은 Jekyll 3과 Ruby Sass 3.7을 쓰는데, KRDS SCSS를 컴파일하지 못합니다. 임시 저장소로 확인했고 `Invalid null operation` 오류로 빌드가 실패했습니다. GitHub Pages에 올릴 때는 아래처럼 **GitHub Actions에서 Jekyll 4로 직접 빌드**하세요.

### 방법 1. 원격 테마 (`jekyll-remote-theme`)

```ruby
# Gemfile
gem "jekyll", "~> 4.4"
gem "jekyll-remote-theme"
gem "jekyll-seo-tag"
gem "jekyll-paginate"   # 블로그 페이지네이션을 쓸 때
```

```yaml
# _config.yml
remote_theme: leejongyoung/jekyll-theme-krds
plugins:
  - jekyll-remote-theme
  - jekyll-seo-tag
  - jekyll-paginate
```

Jekyll 4로 직접 빌드(`bundle exec jekyll build`)해서 동작하는 것을 확인했습니다. `owner/repo@v1.13.0`처럼 태그를 붙여 버전을 고정할 수 있습니다.

### 방법 2. gem

```ruby
# Gemfile
gem "jekyll-theme-krds", github: "leejongyoung/jekyll-theme-krds", tag: "v1.13.0"
```

```yaml
# _config.yml
theme: jekyll-theme-krds
```

> RubyGems에는 올리지 않았습니다. 위처럼 GitHub에서 설치합니다.

### 요구 사항

- Ruby 3.1 이상, Jekyll 4.3 이상(5 미만).
- **Ruby 3.4 이상에서는 Jekyll 4.4 이상을 쓰세요.** Jekyll 4.3.x는 Ruby 3.4에서 기본 gem에서 빠진 `csv`를 불러오지 못해 시작하지 못합니다(`Gemfile`에 `csv`·`base64`·`bigdecimal`·`logger`를 추가하면 동작합니다). 테마의 결함이 아니라 Jekyll 4.3.x의 의존성 문제입니다.
- 예제 사이트 빌드를 확인한 조합: Ruby 3.4 + Jekyll 4.4(CI), Ruby 3.4 + Jekyll 4.3.4(위 gem 추가), Ruby 3.1 + Jekyll 4.3.4. Ruby 3.2·3.3은 확인하지 않았습니다.

### GitHub Pages에 배포하기 (Actions)

1. [`templates/pages-deploy.yml`](templates/pages-deploy.yml)을 사이트 저장소의 `.github/workflows/`에 복사하고 `main`에 푸시합니다. 워크플로가 Jekyll 4로 빌드한 정적 파일을 공식 Pages Actions로 배포합니다.
2. 저장소 **Settings → Pages**에서 Source를 *GitHub Actions*로 지정합니다.
3. 프로젝트 사이트(`https://사용자.github.io/저장소/`)라면 `_config.yml`에 `baseurl: /저장소`를 넣습니다.

이 저장소의 [데모](https://leejongyoung.github.io/jekyll-theme-krds/)도 같은 방식으로 배포됩니다([`.github/workflows/pages.yml`](.github/workflows/pages.yml)). 액션은 Node.js 24 버전(`checkout@v7`, `configure-pages@v6`, `upload-pages-artifact@v5`, `deploy-pages@v5`)이고 러너는 `ubuntu-24.04`로 고정했습니다.

## 시작하기

1. 메뉴 데이터 `_data/navigation.yml`을 만듭니다([예제](example/_data/navigation.yml)).

   ```yaml
   main:          # 상단 메뉴(최대 2단계). 하위가 없으면 바로 이동하는 링크
     - title: 소개
       url: /about/
     - title: 문서
       url: /docs/
       children:
         - { title: 시작하기, url: /docs/getting-started/ }
   docs:          # docs 레이아웃의 왼쪽 메뉴
     - title: 시작하기
       children:
         - { title: 소개, url: /docs/ }
   utility:       # 헤더 맨 위 보조 링크
     - { title: GitHub, url: "https://github.com/...", external: true }
   footer:        # 푸터 링크
     - { title: KRDS 누리집, url: "https://www.krds.go.kr", external: true }
   ```

2. 페이지에 레이아웃을 지정합니다. 주소는 `permalink: pretty`를 권장합니다(메뉴의 `/docs/x/` 형태와 맞습니다).

| 레이아웃 | 용도 | 주요 front matter |
| :--- | :--- | :--- |
| `home` | 첫 화면 | `hero`(eyebrow, title, lead, actions[]), `features[]`, `recent_posts` |
| `page` | 일반 페이지 | `title`, `lead`, `breadcrumb`(선택) |
| `docs` | 사이드 메뉴가 있는 문서 | `title`, `lead`, `nav`(다른 메뉴 키, 기본 `docs`), `nav_title` |
| `blog` | 글 목록(+페이지네이션) | `title`, `lead` |
| `post` | 글 | `title`, `tags`, `author` |

## 설정

```yaml
# _config.yml
krds:
  blog_url: /blog/          # 글의 브레드크럼과 페이지네이션이 쓰는 목록 주소
  blog_title: 블로그
  docs_title: 문서          # 사이드 메뉴 제목
  favicon: /assets/favicon.ico
  footer:
    description: 사이트 설명
    contact:
      - { label: 이메일, value: me@example.com }
    copyright: 사이트 이름

sass:
  quiet_deps: true
  silence_deprecations: [import, global-builtin, color-functions]  # KRDS 원본이 @import를 써서 나오는 경고
```

### 색·글꼴 바꾸기

사이트에 `assets/css/main.scss`를 만들어 테마 스타일을 가져온 뒤 변수를 다시 선언합니다.

```scss
---
---
@import "main";            // 테마 스타일

:root {
  --krds-color-light-primary-50: #0b7a5b;   // KRDS 프리미티브 토큰 재선언
}
```

사용할 수 있는 토큰 이름은 [`_sass/vendor/krds/_krds_tokens.scss`](_sass/vendor/krds/_krds_tokens.scss)와 [KRDS 디자인 토큰 목록](https://www.krds.go.kr/html/site/style/style_07.html)을 참고하세요.

### 덮어쓰기

테마의 `_includes`·`_layouts` 파일과 같은 이름으로 사이트에 파일을 두면 그것이 우선합니다. `<head>`에 태그를 더하려면 `_includes/head-custom.html`을 만드세요.

## 수식·다이어그램·차트·임베드

모두 **필요한 페이지에서만** 해당 라이브러리를 불러옵니다(일반 페이지에는 추가 요청이 없습니다). 외부 서비스는 **사용자가 버튼을 누르기 전에는 연결하지 않습니다.** 예제는 [데모의 "임베드와 수식"](https://leejongyoung.github.io/jekyll-theme-krds/docs/embeds/)과 [`example/docs/embeds.md`](example/docs/embeds.md)입니다.

| 기능 | 쓰는 법 | 라이브러리 |
| :--- | :--- | :--- |
| 수식 | 본문에 `$$ ... $$` (문장 안은 인라인, 따로 한 문단은 블록) | KaTeX |
| 다이어그램 | `mermaid` 코드 블록 | Mermaid |
| 차트 | `chart` 코드 블록에 Chart.js 설정을 **JSON**으로 | Chart.js |
| YouTube | `{% raw %}{% include embed/youtube.html id="영상ID" title="제목" %}{% endraw %}` | 없음(iframe) |
| Vimeo | `{% raw %}{% include embed/vimeo.html id="123456" title="제목" %}{% endraw %}` | 없음(iframe) |
| 그 밖의 페이지 | `{% raw %}{% include embed/iframe.html url="https://..." title="제목" %}{% endraw %}` | 없음(iframe, sandbox) |
| 자체 호스팅 영상·오디오 | `embed/video.html`(자막 `captions="….vtt"`), `embed/audio.html`(`transcript`) | 없음(HTML5) |
| 첨부 파일 | `{% raw %}{% include embed/attachment.html src="..." title="..." %}{% endraw %}`(본문 미리보기) + `attachments:`(글 하단 동작 목록) | pdf·이미지·스프레드시트 새 탭 viewer, HWPX·텍스트(줄 번호·인코딩 표시·형식별 색상·복사) 브라우저 직접 미리보기, HWP/HWPX PDF 변환 action, 선택 기능인 고화질 한글 미리보기(rhwp, `hwp` 5.x 포함, 기본 꺼짐), 첨부 바이러스 검사(ClamAV) action·표시, 형식별 파일 아이콘("H" 한글 아이콘 포함)·SHA-256 전체 표시 |

- **수식:** 달러 기호가 든 일반 문장(`$4와 $6`)은 수식으로 바뀌지 않습니다. 단일 `$ ... $`는 지원하지 않습니다. KaTeX가 MathML도 함께 내보냅니다.
- **다이어그램:** 화면 모드를 바꾸면 현재 색으로 다시 그리고, "다이어그램 원문 보기"를 제공합니다. 색은 KRDS 토큰에서 가져옵니다.
- **차트:** 색은 KRDS 색을 자동으로 쓰고 점 모양도 달리합니다. "데이터 표로 보기"가 자동으로 생깁니다. JSON만 받으므로 함수(콜백)는 쓸 수 없습니다. `title`·`description`은 접근성용 추가 키입니다.
- **개인정보:** YouTube는 `youtube-nocookie.com`, Vimeo는 `dnt=1`을 씁니다. 재생 버튼을 누르기 전에는 외부에 요청하지 않으며(미리보기 이미지는 `thumbnail=true`를 줄 때만 불러옵니다), 일반 iframe에는 `sandbox`가 기본으로 걸립니다.
- **끄기:** 페이지 front matter의 `math`·`mermaid`·`chart`를 `true`/`false`로 지정하거나, `_config.yml`의 `krds.math`·`krds.mermaid`·`krds.chart`를 `false`로 둡니다.
- **접근성:** `title`(영상 제목)을 꼭 적으세요. 스크린리더가 iframe 이름으로 읽습니다. 자체 호스팅 영상에는 자막을 함께 넣는 것을 권합니다.

용량: Mermaid(약 3.7MB, 다이어그램 종류별로 필요한 조각만 불러옴), Chart.js 205KB, KaTeX 약 600KB(글꼴 포함)이며 해당 코드 블록·수식이 있는 페이지에서만 받습니다.

## 홈 화면

홈(`index.md`)의 front matter에 `banner`·`tabs`·`cards`·`cardnews`를 적으면 구역이 나타납니다(모두 선택, 기존 `hero`·`features`와 함께 씁니다). 예제는 [`example/index.md`](example/index.md), 전체 설명은 [데모의 "홈 화면 꾸미기"](https://leejongyoung.github.io/jekyll-theme-krds/docs/home/)입니다.

- **슬라이드 배너(`banner`):** 자동 넘김, 멈춤·재생 버튼, 이전·다음, 점, 화살표 키, 터치 밀기. 마우스·초점이 있는 동안 잠시 멈추고, "움직임 줄이기" 설정이면 자동 재생하지 않습니다.
- **탭(`tabs`):** 최근 글(`source: posts`), 최근 바뀐 위키 문서(`source: wiki`), 직접 적은 카드(`items`)를 탭으로 나눕니다. 방향키·Home·End로 옮깁니다.
- **카드뷰(`cards`)·주요 기능(`features`):** Font Awesome 아이콘(`icon`)과 태그가 있는 카드 격자.
- **카드뉴스(`cardnews`):** 색 배경(`tone`: blue·green·purple·orange·dark)의 세로형 카드를 가로로 넘겨 봅니다. 이전·다음 버튼과 "1 / 5" 표시.
- 자바스크립트가 없으면 슬라이드는 세로 목록, 탭은 제목이 붙은 구역으로 보이고, 선명하게(고대비) 모드에서는 검정 바탕에 흰 테두리가 됩니다.
- 최근 글 구역은 `recent_posts: 3`처럼 개수를 적으면 나옵니다.

## 아이콘

[Font Awesome Free](https://fontawesome.com) 7.3.1의 SVG 아이콘 약 80개가 `assets/img/fa/`에 들어 있습니다. 글꼴 파일이나 외부 서버 없이 글자색을 따라 칠해지는 마스크 아이콘입니다.

```liquid
{% raw %}{% include embed/icon.html name="file-pdf" %}
{% include embed/icon.html name="github" style="brands" %}
{% include embed/icon.html name="circle-info" label="안내" %}{% endraw %}
```

- 첨부 파일 카드는 확장자(`pdf`·`docx`·`xlsx`·`hwpx` 등)에 맞는 아이콘과 색을 자동으로 고릅니다.
- 템플릿에서는 `<i class="th-fa th-fa-file-pdf" aria-hidden="true"></i>`로 직접 쓸 수 있고, 전체 목록과 추가 방법은 [데모의 "아이콘"](https://leejongyoung.github.io/jekyll-theme-krds/docs/icons/)에 있습니다.
- 아이콘은 CC BY 4.0이므로 `NOTICE.md`와 `assets/img/fa/LICENSE.txt`를 지우지 마세요.

## 위키

`wiki/` 폴더에 마크다운 문서를 두면 문서끼리 `[[문서 링크]]`로 잇는 위키가 됩니다. 예제는 [`example/wiki/`](example/wiki), 사용법은 [데모의 위키](https://leejongyoung.github.io/jekyll-theme-krds/wiki/)입니다.

```yaml
# wiki/index.md — 위키 홈(layout: wiki-home)
---
layout: wiki-home
title: 위키
lead: 문서를 서로 연결해 모아 둔 위키입니다.
permalink: /wiki/
search: false
---
```

```yaml
# wiki/디자인-토큰.md — 위키 문서(layout: wiki)
---
layout: wiki
title: 디자인 토큰
summary: 목록 카드에 쓰이는 한 줄 요약
category: 테마
wiki_aliases: [토큰, tokens]
tags: [디자인]
updated: 2026-11-08
infobox:
  - label: 저장소
    value: owner/repo
---
```

```yaml
# _data/navigation.yml — 메인 메뉴
main:
  - title: 위키
    url: /wiki/

# _config.yml
krds:
  wiki:                    # 선택: 있으면 편집·변경 이력·새 문서 만들기 링크가 생깁니다
    repo: owner/repo
    branch: main
    content_dir: ""        # 사이트 소스가 저장소 안 하위 폴더면 그 폴더(예: example)
```

- **문서 링크:** `[[제목]]`, `[[제목|표시 글]]`, `[[제목#섹션]]`. 제목 → 파일 이름 → `wiki_aliases` 순으로 찾고, 없는 문서는 붉은 점선으로 보이며 누르면 새 문서를 만드는 GitHub 화면이 열립니다. 코드 블록 안은 링크로 바뀌지 않습니다.
- **문서 화면:** 분류별 왼쪽 메뉴, 정보 상자(`infobox`), 이 문서를 가리키는 문서(역링크), 관련 문서, 문서 편집·변경 이력·주소 복사·인쇄.
- **위키 홈:** 제목·별칭·태그·요약 검색(`/` 키로 이동), 분류 필터, 정렬, 무작위 문서, 최근 바뀐 문서, 작성이 필요한 문서, 고아 문서. 검색어·분류·정렬은 주소(`?q=&category=&sort=`)에 반영됩니다.
- **동작 방식:** 빌드할 때 `/assets/wiki-index.json` 하나를 만들고 브라우저가 이 파일만 읽습니다. 외부 요청이 없습니다. 링크 해석은 자바스크립트가 필요하고, 꺼져 있으면 `[[ ]]`가 글자 그대로 보입니다. 표시 글자를 바꾸는 링크는 kramdown이 `|`가 든 줄을 표로 읽으므로 `[[제목\|표시 글]]`처럼 `\`를 붙여 씁니다.
- **제외:** 위키 문서도 사이트 검색에 포함됩니다. 빼려면 front matter에 `search: false`를 적으세요.


## 태그와 검색

태그 페이지와 검색 페이지는 **사이트에 페이지를 하나씩 만들어야** 생깁니다(테마가 페이지를 직접 추가할 수는 없습니다). 만들면 글의 태그가 링크로 바뀌고 헤더에 **검색** 버튼이 생깁니다. 예제는 [`example/tags.md`](example/tags.md), [`example/search.md`](example/search.md), 설명은 [데모의 "태그와 검색"](https://leejongyoung.github.io/jekyll-theme-krds/docs/search-tags/)입니다.

```yaml
# tags.md
---
layout: tags
title: 태그
permalink: /tags/
---

# search.md
---
layout: search
title: 검색
permalink: /search/
search: false
---
```

- **태그:** 글과 `tags`가 있는 일반 페이지를 함께 모아 개수 많은 순으로 보여 줍니다. 글의 태그를 누르면 `/tags/#태그` 구역으로 가고, 한글 태그도 그대로 주소가 됩니다. 이동한 구역은 색과 굵은 왼쪽 선으로 표시합니다. JavaScript 없이도 동작합니다.
- **검색:** 빌드할 때 `/assets/search-index.json`을 만들고, 브라우저가 이 파일 하나만 받아 검색합니다. 외부 서비스·외부 요청이 없습니다. 공백으로 나눈 단어가 모두 들어 있는 글을 찾고(제목 > 태그 > 요약 > 본문 순으로 점수), 한국어 단어 중간(`접근` → `접근성`)도 찾습니다. 태그 칩(KRDS 칩)으로 좁히고, 주소(`?q=…&tag=…`)로 결과를 공유합니다. 검색어는 DOM 노드로만 넣어 HTML이 실행되지 않습니다.
- **제외·설정:** 페이지 front matter에 `search: false`면 색인에서 빠집니다(`search`·`tags`·`blog` 레이아웃 페이지와 본문이 없는 페이지는 자동 제외). 본문은 글마다 앞 3000자까지 색인하며 `krds.search.max_chars`로 바꿉니다.
- **규모:** 본문 3000자 기준 글 100편이 색인 약 0.7MB(gzip 전)입니다. 합성 데이터 2,000건(14MB)으로 검색은 1~7ms, 색인 준비는 0.16초였지만 파일을 받는 시간이 느려지므로, 수백 편이 넘으면 `max_chars`를 줄이세요. 이 크기는 위 합성 데이터에서 잰 값이며 실제 글의 분포에 따라 다릅니다.
- **한계:** 형태소 분석이나 오타 보정은 없습니다(부분 문자열 일치). 페이지(문서) 본문은 마크다운 원문에서 태그를 뗀 텍스트라 Liquid 태그가 일부 남을 수 있어 검색 스크립트가 지웁니다. 영어 외 언어의 대소문자 규칙은 `toLowerCase()`에 따릅니다.

## 접근성과 검증

KRDS 컴포넌트가 접근성을 고려해 만들어져 있고, 이 테마가 더한 부분은 아래처럼 확인했습니다.

- axe-core 4.13: 예제 17개 페이지(검색·태그 페이지, 검색 결과·태그 앵커 상태 포함) × 화면 모드(밝은 모드, 선명하게 모드, 시스템 설정) 51회 모두 위반 0건. 수동 검토 대상(`incomplete`)이 1~2건 남는데, 메뉴 트리거의 `aria-controls`(KRDS 스크립트가 숨겨진 패널을 가리킴)와 일부 대비 판정 보류입니다.
- 주요 글자·배경 16개 조합의 대비를 직접 계산: 두 모드 모두 4.5:1 이상(최저 6.83:1). 차트 색은 흰 배경 대비 4.5:1 이상(밝은 모드), 검정 배경 대비 6:1 이상(선명한 모드)입니다.
- 키보드: 첫 Tab이 "본문 바로가기"에 가고 Enter로 본문에 이동. 재생 버튼은 키보드로 활성화되고 포커스가 영상으로 이동. 가로로 넘치는 코드·수식은 포커스를 받아 스크롤할 수 있습니다.
- 시스템 설정 모드: OS 다크 모드일 때 어두운 팔레트, 라이트일 때 밝은 팔레트.
- 360px 모바일 레이아웃(임베드 페이지 포함, 가로 넘침 없음)과 전체메뉴.

실제 스크린리더, Safari·Firefox, Windows 고대비 모드 같은 조합은 확인하지 못했습니다. 접근성 인증을 받은 테마가 아닙니다.

## 알려진 한계

- 메인메뉴는 2단계까지입니다(KRDS의 3단계 메가메뉴는 데이터 모델에 넣지 않았습니다). 모바일 전체메뉴에서 하위가 없는 항목은 "바로가기" 탭에 모입니다.
- 번들이 큰 편입니다. CSS 475KB(gzip 41KB), KRDS 스크립트 91KB(gzip 18KB, 비축소본). 컴포넌트를 줄이려면 `assets/css/main.scss`의 `@import` 목록을 줄이세요. 저장소·gem에는 Mermaid(3.7MB)도 들어 있어 gem이 약 2.2MB(압축), 저장소 작업 사본이 약 6MB입니다(페이지 로딩에는 영향이 없습니다).
- Mermaid의 ELK 레이아웃과 다이어그램 안의 수식은 용량 때문에 포함하지 않았습니다(`layout: dagre`로 고정). 필요하면 `script/vendor-mermaid`의 제외 목록을 고치고 다시 가져오세요.
- 외부 영상·지도의 접근성(자막, 키보드 조작)은 각 서비스에 달려 있고, 이 테마는 보장하지 않습니다. 실제 영상 재생은 자동으로 확인하지 못했습니다(iframe이 올바른 주소로 만들어지는 것까지 확인).
- KRDS 스크립트는 body에 CSS `zoom`을 적용해 글자 크기를 바꿉니다(KRDS 방식).
- GitHub Pages의 기본 빌더(Jekyll 3)는 지원하지 않습니다(위 설치 안내). `remote_theme`은 Jekyll 4로 직접 빌드할 때 동작하는 것을 임시 사이트로 확인했습니다.
- Sass `@import`는 Dart Sass에서 더는 권장되지 않습니다. KRDS 원본이 `@import`를 쓰므로 경고를 끄고 쓰며, KRDS가 바뀌면 같이 바꿔야 합니다.

## 개발

```sh
mise install                 # Ruby 3.4 (mise.toml)
cd example && bundle install
bundle exec jekyll serve     # http://127.0.0.1:4000
```

테마 파일은 gem 경로로 연결되어 있어서 `jekyll serve`가 변경을 감지하지 못합니다. 테마를 고쳤다면 `bundle exec jekyll build`를 다시 실행하세요.

KRDS 원본을 새 버전으로 바꾸려면 `script/vendor-krds <태그>`를 실행하고 `NOTICE.md`의 버전·커밋을 고칩니다.

## 기여와 지원

- 버그·접근성 문제·기능 제안·질문: [이슈 작성](https://github.com/leejongyoung/jekyll-theme-krds/issues/new/choose) (템플릿이 있습니다)
- 기여 방법과 원칙: [CONTRIBUTING.md](CONTRIBUTING.md) · 행동강령: [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- 보안 취약점: 공개 이슈 대신 [SECURITY.md](SECURITY.md)의 비공개 신고
- 도움 받는 곳: [SUPPORT.md](SUPPORT.md) · 변경 이력: [CHANGELOG.md](CHANGELOG.md)

## 라이선스와 출처

- 테마 코드: [MIT](LICENSE)
- KRDS 자료: 공공누리 제1유형(출처 표시 필수). 푸터의 출처 문구를 지우지 마세요.
- Pretendard GOV: SIL OFL 1.1

자세한 내용은 [NOTICE.md](NOTICE.md)를 보세요.
