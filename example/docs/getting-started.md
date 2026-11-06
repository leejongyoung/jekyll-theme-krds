---
layout: docs
title: 설치와 시작
lead: 새 사이트에 테마를 적용하는 가장 짧은 방법입니다.
---
## 원격 테마

`_config.yml`에 원격 테마를 지정하고 Gemfile에 `jekyll-remote-theme`을 추가합니다. Jekyll 4가 필요합니다.

```yaml
remote_theme: leejongyoung/jekyll-theme-krds
plugins:
  - jekyll-remote-theme
  - jekyll-seo-tag
```

## GitHub Pages에 올리기

GitHub Pages의 기본 빌더(Jekyll 3)는 이 테마를 빌드하지 못합니다. GitHub Actions에서 Jekyll 4로 직접 빌드해서 `gh-pages` 브랜치로 올리세요. 이 사이트도 그렇게 배포합니다. 워크플로 템플릿은 저장소의 `templates/pages-deploy.yml`입니다.

## gem으로 설치

```ruby
gem "jekyll-theme-krds"
```

```yaml
theme: jekyll-theme-krds
```

## 메뉴 데이터

`_data/navigation.yml`에 `main`, `docs`, `footer`, `utility`를 정의합니다.
