# jekyll-theme-krds

> 행정안전부가 공공누리 제1유형으로 개방한 [범정부 UI/UX 디자인시스템(KRDS)](https://www.krds.go.kr)을 바탕으로 만든 Jekyll 테마입니다.
> *Jekyll theme based on KRDS (Korea Design System).*

KRDS의 디자인 토큰과 HTML 컴포넌트를 그대로 가져와 문서·블로그 사이트를 만드는 범용 Jekyll 테마입니다.

- **KRDS 원본 유지:** 토큰·SCSS·JS는 원본을 고치지 않고 `vendor`로 가져옵니다. 색과 글꼴은 CSS 변수를 다시 선언해서 바꿉니다(KRDS 개발자 가이드의 방식).
- **글자 크기·화면 모드:** 글자 크기 5단계, 화면 모드(기본 밝은 배경 / 선명하게 어두운 배경 / 시스템 설정)를 헤더에서 바꾸고 기억합니다.
- **레이아웃:** `home`, `page`, `docs`(사이드 내비게이션 + 이 페이지의 구성), `blog`, `post`
- **컴포넌트:** 건너뛰기 링크, 헤더·메인메뉴(PC)·전체메뉴(모바일), 브레드크럼, 사이드 내비게이션, 페이지네이션, 푸터, 버튼·배지
- **서체:** Pretendard GOV 셀프 호스팅(외부 CDN 없음)

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

Jekyll 4로 직접 빌드(`bundle exec jekyll build`)해서 동작하는 것을 확인했습니다. `owner/repo@v1.0.0`처럼 태그를 붙여 버전을 고정할 수 있습니다.

### 방법 2. gem

```ruby
# Gemfile
gem "jekyll-theme-krds", github: "leejongyoung/jekyll-theme-krds", tag: "v1.0.0"
```

```yaml
# _config.yml
theme: jekyll-theme-krds
```

> RubyGems에는 올리지 않았습니다. 위처럼 GitHub에서 설치합니다.

### GitHub Pages에 배포하기 (Actions)

1. [`templates/pages-deploy.yml`](templates/pages-deploy.yml)을 사이트 저장소의 `.github/workflows/`에 복사하고 `main`에 푸시합니다. 워크플로가 Jekyll 4로 빌드해서 `gh-pages` 브랜치를 만듭니다.
2. 저장소 **Settings → Pages**에서 Source를 *Deploy from a branch*, Branch를 `gh-pages` / `(root)`로 지정합니다.
3. 프로젝트 사이트(`https://사용자.github.io/저장소/`)라면 `_config.yml`에 `baseurl: /저장소`를 넣습니다.

이 저장소의 [데모](https://leejongyoung.github.io/jekyll-theme-krds/)도 같은 방식으로 배포됩니다([`.github/workflows/pages.yml`](.github/workflows/pages.yml)). 워크플로가 올린 뒤 GitHub의 Pages 배포 단계가 몇 분 걸릴 때도 있습니다.

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

- **수식:** 달러 기호가 든 일반 문장(`$4와 $6`)은 수식으로 바뀌지 않습니다. 단일 `$ ... $`는 지원하지 않습니다. KaTeX가 MathML도 함께 내보냅니다.
- **다이어그램:** 화면 모드를 바꾸면 현재 색으로 다시 그리고, "다이어그램 원문 보기"를 제공합니다. 색은 KRDS 토큰에서 가져옵니다.
- **차트:** 색은 KRDS 색을 자동으로 쓰고 점 모양도 달리합니다. "데이터 표로 보기"가 자동으로 생깁니다. JSON만 받으므로 함수(콜백)는 쓸 수 없습니다. `title`·`description`은 접근성용 추가 키입니다.
- **개인정보:** YouTube는 `youtube-nocookie.com`, Vimeo는 `dnt=1`을 씁니다. 재생 버튼을 누르기 전에는 외부에 요청하지 않으며(미리보기 이미지는 `thumbnail=true`를 줄 때만 불러옵니다), 일반 iframe에는 `sandbox`가 기본으로 걸립니다.
- **끄기:** 페이지 front matter의 `math`·`mermaid`·`chart`를 `true`/`false`로 지정하거나, `_config.yml`의 `krds.math`·`krds.mermaid`·`krds.chart`를 `false`로 둡니다.
- **접근성:** `title`(영상 제목)을 꼭 적으세요. 스크린리더가 iframe 이름으로 읽습니다. 자체 호스팅 영상에는 자막을 함께 넣는 것을 권합니다.

용량: Mermaid(약 3.7MB, 다이어그램 종류별로 필요한 조각만 불러옴), Chart.js 205KB, KaTeX 약 600KB(글꼴 포함)이며 해당 코드 블록·수식이 있는 페이지에서만 받습니다.

## 접근성과 검증

KRDS 컴포넌트가 접근성을 고려해 만들어져 있고, 이 테마가 더한 부분은 아래처럼 확인했습니다.

- axe-core 4.13: 예제 10개 페이지 × 화면 모드(밝은 모드, 선명하게 모드, 시스템 설정) 모두 위반 0건. 수동 검토 대상(`incomplete`)이 1~2건 남는데, 메뉴 트리거의 `aria-controls`(KRDS 스크립트가 숨겨진 패널을 가리킴)와 일부 대비 판정 보류입니다.
- 주요 글자·배경 16개 조합의 대비를 직접 계산: 두 모드 모두 4.5:1 이상(최저 6.83:1). 차트 색은 흰 배경 대비 4.5:1 이상(밝은 모드), 검정 배경 대비 6:1 이상(선명한 모드)입니다.
- 키보드: 첫 Tab이 "본문 바로가기"에 가고 Enter로 본문에 이동. 재생 버튼은 키보드로 활성화되고 포커스가 영상으로 이동. 가로로 넘치는 코드·수식은 포커스를 받아 스크롤할 수 있습니다.
- 시스템 설정 모드: OS 다크 모드일 때 어두운 팔레트, 라이트일 때 밝은 팔레트.
- 360px 모바일 레이아웃(임베드 페이지 포함, 가로 넘침 없음)과 전체메뉴.

실제 스크린리더, Safari·Firefox, Windows 고대비 모드 같은 조합은 확인하지 못했습니다. 접근성 인증을 받은 테마가 아닙니다.

## 알려진 한계

- 메인메뉴는 2단계까지입니다(KRDS의 3단계 메가메뉴는 데이터 모델에 넣지 않았습니다). 모바일 전체메뉴에서 하위가 없는 항목은 "바로가기" 탭에 모입니다.
- 번들이 큰 편입니다. CSS 375KB(gzip 33KB), KRDS 스크립트 91KB(gzip 18KB, 비축소본). 컴포넌트를 줄이려면 `assets/css/main.scss`의 `@import` 목록을 줄이세요. 저장소·gem에는 Mermaid(3.7MB)도 들어 있어 gem이 약 2.2MB(압축), 저장소 작업 사본이 약 6MB입니다(페이지 로딩에는 영향이 없습니다).
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
