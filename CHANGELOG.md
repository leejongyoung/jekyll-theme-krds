# 변경 이력

형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.1.0/)를, 버전은 [유의적 버전](https://semver.org/lang/ko/)을 따릅니다.

## [Unreleased]

## [1.1.0] - 2026-11-07

수식, 다이어그램, 차트, 동영상과 외부 콘텐츠를 본문에 넣을 수 있습니다. 모두 **필요한 페이지에서만** 해당 라이브러리를 불러오고, 외부 서비스는 **사용자가 버튼을 누르기 전에는 연결하지 않습니다.**

### 추가
- **수식:** `$$ ... $$`를 KaTeX로 렌더링(인라인·블록, MathML 포함). 달러 기호를 쓴 일반 문장은 수식으로 바뀌지 않는다
- **Mermaid:** `mermaid` 코드 블록을 다이어그램으로(flowchart, sequence, pie 등). 화면 모드를 바꾸면 색을 다시 그리고, "다이어그램 원문 보기"를 함께 제공
- **차트:** `chart` 코드 블록(Chart.js 설정 JSON)을 KRDS 색의 차트로. 접근 가능한 "데이터 표로 보기"를 자동으로 만들고, 선·점 모양으로 색 외에도 계열을 구분
- **임베드 include:** `embed/youtube.html`(youtube-nocookie), `embed/vimeo.html`(dnt=1), `embed/iframe.html`(sandbox 기본 적용), `embed/video.html`(자막 지원), `embed/audio.html`(대본 링크). 외부 임베드는 재생 버튼을 눌러야 연결
- 페이지/사이트 단위 스위치: front matter의 `math`·`mermaid`·`chart`, `_config.yml`의 `krds.math`·`krds.mermaid`·`krds.chart`
- `script/vendor-katex`, `script/vendor-mermaid`, `script/vendor-chartjs`, 예제 페이지 `docs/embeds/`

### 수정
- 모바일(360px)에서 넓은 다이어그램·수식이 문서 레이아웃을 가로로 밀어내던 문제
- 가로로 넘치는 코드 블록과 블록 수식을 키보드로 스크롤할 수 없던 문제(넘칠 때만 포커스를 받음)
- 선명하게·시스템 설정 모드에서 쓰지 않는 KRDS 로고 이미지를 요청해 404가 나던 문제

### 알려진 한계
- Mermaid의 ELK 레이아웃과 다이어그램 안의 수식은 용량 때문에 포함하지 않았다(`layout: dagre` 고정)
- 단일 `$ ... $` 수식은 지원하지 않는다(가격 표기와 구분할 수 없음). `$$ ... $$`를 쓴다
- 외부 영상·지도는 각 서비스의 정책에 따르며, 이 테마가 영상의 자막이나 접근성을 보장하지 않는다

## [1.0.0] - 2026-11-07

첫 안정 릴리스입니다. 레이아웃 이름, `_data/navigation.yml` 구조, `_config.yml`의 `krds.*` 키는 1.x 동안 호환을 유지합니다.

### 추가
- KRDS 1.1.0 기반 Jekyll 테마: 레이아웃(`home`, `page`, `docs`, `blog`, `post`)과 헤더·메인메뉴·전체메뉴·브레드크럼·사이드 내비게이션·"이 페이지의 구성"·페이지네이션·푸터
- 글자 크기 5단계와 화면 모드(기본/선명하게/시스템 설정) 설정과 저장
- Pretendard GOV 셀프 호스팅, 푸터의 KRDS 출처 표시(공공누리 제1유형)
- 예제 사이트(`example/`)와 [GitHub Pages 데모](https://leejongyoung.github.io/jekyll-theme-krds/)
- `script/vendor-krds`(KRDS 원본 갱신), `script/sync-labels`, CI, GitHub Pages 배포 워크플로, `templates/pages-deploy.yml`
- 기여 문서, 보안 정책, 행동강령, 이슈·PR 템플릿, 라벨 정의

### 확인한 것
- axe-core 위반 0건(예제 7개 페이지 × 밝은/고대비 모드), 주요 글자·배경 대비 4.5:1 이상, 키보드·시스템 모드·360px 모바일
- `remote_theme`(Jekyll 4)과 gem 경로 빌드, GitHub Actions CI(예제 빌드와 gem 빌드)

### 알려진 한계
- **GitHub Pages의 기본 빌더(Jekyll 3, Ruby Sass)로는 빌드되지 않습니다.** Actions에서 Jekyll 4로 빌드하세요(README 참고).
- 메인메뉴는 2단계까지입니다.
- 실제 스크린리더, Safari·Firefox, Windows 고대비 모드는 확인하지 못했습니다.
