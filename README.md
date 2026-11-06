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

### GitHub Pages (원격 테마)

```yaml
# _config.yml
remote_theme: leejongyoung/jekyll-theme-krds
plugins:
  - jekyll-remote-theme
  - jekyll-seo-tag
  - jekyll-paginate   # 블로그 페이지네이션을 쓸 때
```

### gem

```ruby
# Gemfile
gem "jekyll-theme-krds", github: "leejongyoung/jekyll-theme-krds"
```

```yaml
# _config.yml
theme: jekyll-theme-krds
```

> RubyGems에는 아직 올리지 않았습니다. 올리기 전까지는 위처럼 GitHub에서 설치합니다.

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

## 접근성과 검증

KRDS 컴포넌트가 접근성을 고려해 만들어져 있고, 이 테마가 더한 부분은 아래처럼 확인했습니다.

- axe-core 4.13: 예제 7개 페이지 × (밝은 모드, 고대비 모드) = 14회 모두 위반 0건. 수동 검토 대상(`incomplete`)이 1~2건 남는데, 메뉴 트리거의 `aria-controls`(KRDS 스크립트가 숨겨진 패널을 가리킴)와 일부 대비 판정 보류입니다.
- 주요 글자·배경 16개 조합의 대비를 직접 계산: 두 모드 모두 4.5:1 이상(최저 6.83:1).
- 키보드: 첫 Tab이 "본문 바로가기"에 가고 Enter로 본문에 이동.
- 시스템 설정 모드: OS 다크 모드일 때 어두운 팔레트, 라이트일 때 밝은 팔레트.
- 360px 모바일 레이아웃과 전체메뉴.

실제 스크린리더, Safari·Firefox, Windows 고대비 모드 같은 조합은 확인하지 못했습니다. 접근성 인증을 받은 테마가 아닙니다.

## 알려진 한계

- 메인메뉴는 2단계까지입니다(KRDS의 3단계 메가메뉴는 데이터 모델에 넣지 않았습니다). 모바일 전체메뉴에서 하위가 없는 항목은 "바로가기" 탭에 모입니다.
- 번들이 큰 편입니다. CSS 375KB(gzip 33KB), KRDS 스크립트 91KB(gzip 18KB, 비축소본). 컴포넌트를 줄이려면 `assets/css/main.scss`의 `@import` 목록을 줄이세요.
- KRDS 스크립트는 body에 CSS `zoom`을 적용해 글자 크기를 바꿉니다(KRDS 방식).
- GitHub Pages `remote_theme`으로의 실제 배포는 아직 확인하지 않았습니다(이 저장소를 공개한 뒤 확인 필요).
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
