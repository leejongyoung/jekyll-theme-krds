# 변경 이력

형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.1.0/)를, 버전은 [유의적 버전](https://semver.org/lang/ko/)을 따릅니다.

## [Unreleased]

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
