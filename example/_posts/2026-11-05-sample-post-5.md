---
layout: post
title: "차트로 데이터 보여 주기"
tags: [예제, 차트, 접근성]
author: jekyll-theme-krds
---
코드 블록 언어를 `chart` 로 쓰면 차트가 됩니다. 차트마다 "데이터 표로 보기"가 함께 만들어져 스크린리더 사용자도 값을 읽을 수 있습니다.

```chart
{ "type": "bar", "title": "분기별 방문자", "data": { "labels": ["1분기", "2분기", "3분기"], "datasets": [ { "label": "방문자 수", "data": [120, 180, 150] } ] } }
```
