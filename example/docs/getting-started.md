---
layout: docs
title: 설치와 시작
lead: 새 사이트에 테마를 적용하는 가장 짧은 방법입니다.
---
## GitHub Pages

`_config.yml`에 원격 테마를 지정합니다.

```yaml
remote_theme: leejongyoung/jekyll-theme-krds
plugins:
  - jekyll-remote-theme
  - jekyll-seo-tag
```

## gem으로 설치

```ruby
gem "jekyll-theme-krds"
```

```yaml
theme: jekyll-theme-krds
```

## 메뉴 데이터

`_data/navigation.yml`에 `main`, `docs`, `footer`, `utility`를 정의합니다.
