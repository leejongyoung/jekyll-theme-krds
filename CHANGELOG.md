# 변경 이력

형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.1.0/)를, 버전은 [유의적 버전](https://semver.org/lang/ko/)을 따릅니다.

## [1.3.1] - 2026-11-07

### 수정
- `embed/frame.html`의 `link`·`thumb`가 `https://`로 시작하지 않으면 출력하지 않음 (`javascript:` 등 비정상 scheme 차단). `ratio`는 숫자·슬래시 형식이 아니면 `16 / 9`로 바꿈 (동일 검증을 `embed/video.html`의 `ratio`에도 적용)

## [1.3.0] - 2026-11-07

### 변경
- 코드 블록(`pre`)을 Hugo(Chroma `github-dark`)와 같은 어두운 스타일로 변경. 배경 `#0d1117`, 기본 글자색 `#e6edf3`, 토큰 색상은 Chroma 팔레트와 동일(`hugo gen chromastyles --style=github-dark` 기준, Rouge 클래스 호환). 밝은 모드·선명하게 모드 모두 같은 색으로 표시

## [1.2.3] - 2026-11-07

### 수정
- 1440px PC navbar에서 열린 2단계 메뉴(`.gnb-main-list`)만 KRDS 기본 1200px 폭에 남아 가운데로 어긋나던 문제. 드롭다운도 navbar와 같은 1440px 정렬선 사용
- GNB 하위 링크에서 Escape로 메뉴를 닫으면 키보드 포커스가 `<body>`로 사라지던 문제. 닫은 메뉴의 trigger로 포커스 복귀

## [1.2.2] - 2026-11-07

### 수정
- 1.2.1에서 문서만 넓어져 다른 페이지와 header·navbar·footer의 정렬선이 어긋나던 문제. 1440px 이상에서 소개·문서·블로그·태그·검색을 포함한 모든 페이지와 header·navbar·footer에 같은 1440px 콘텐츠 컨테이너 적용. 검색 폼은 읽기 좋은 720px로 유지하고 태그·결과 영역은 전체 폭 사용

## [1.2.1] - 2026-11-07

### 수정
- PC 문서 레이아웃에서 사이드 내비게이션과 페이지 목차가 1200px 컨테이너를 함께 차지해 article이 636px까지 줄던 문제. 1440px 이상에서는 문서 컨테이너를 넓히고, 1024~1439px에서는 목차를 숨겨 2열로 표시
- GitHub Pages 배포를 `gh-pages` 브랜치 기반 자동 워크플로에서 공식 Pages Actions로 전환. Node.js 24 액션(`checkout@v7`, `configure-pages@v6`, `upload-pages-artifact@v5`, `deploy-pages@v5`)과 `ubuntu-24.04` 러너를 사용해 Node.js 20 지원 종료·`ubuntu-latest` 마이그레이션 경고 제거
- Dependabot PR #1의 `actions/checkout@v7` 업데이트를 CI·라벨·Pages 워크플로에 반영

## [1.2.0] - 2026-11-07

글에 태그를 달아 모아 볼 수 있고, 사이트 안에서 검색할 수 있습니다. 검색은 서버나 외부 서비스 없이 **브라우저에서만** 동작합니다.

### 추가
- **태그:** 글과 `tags`가 있는 일반 페이지의 태그를 KRDS 태그(`krds-btn-tag`) 링크로 보여 주고, `tags` 레이아웃 페이지에서 개수 많은 순으로 모아 줍니다. 한글 태그가 그대로 앵커가 되고, 이동한 구역은 색과 굵은 선으로 표시합니다
- **검색:** `search` 레이아웃. 빌드할 때 `/assets/search-index.json`을 만들고 브라우저가 그 파일만 받아 검색합니다. 공백으로 나눈 모든 단어를 찾고(제목 > 태그 > 요약 > 본문), 한국어 단어 중간도 찾습니다. KRDS 칩으로 태그를 좁히고, 주소(`?q=…&tag=…`)로 결과를 공유하며, 20건씩 "결과 더 보기"를 제공합니다
- 검색 페이지가 있으면 헤더에 **검색** 버튼(KRDS `btn-navi sch`)이 자동으로 생깁니다
- 설정: front matter `search: false`로 색인에서 제외, `krds.search.max_chars`로 색인 본문 길이 조절
- 예제 사이트에 태그·검색 페이지, 다양한 태그를 단 글과 문서, "태그와 검색" 설명 문서

### 변경
- 글 위의 태그가 배지에서 태그 링크로 바뀝니다(태그 페이지가 없으면 글자로만 보입니다). 기존 사이트는 코드를 고칠 필요가 없습니다
- CSS에 KRDS의 `input`, `form_layout`, `form_check`, `form_chip` 컴포넌트와 태그·검색 스타일을 추가했습니다(예제 사이트 기준 388KB → 475KB, gzip 35KB → 41KB)

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
