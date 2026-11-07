---
layout: wiki
title: KRDS 테마
summary: KRDS(범정부 UI/UX 디자인시스템)를 바탕으로 한 정적 사이트 테마의 개요입니다.
category: 테마
wiki_aliases: [KRDS, jekyll-theme-krds]
tags: [테마, KRDS]
date: 2026-11-01
updated: 2026-11-08
infobox:
  - label: 이름
    value: jekyll-theme-krds
  - label: 저장소
    value: leejongyoung/jekyll-theme-krds
  - label: 라이선스
    value: MIT
  - label: 필요 환경
    value: Ruby 3.1 이상, Jekyll 4.3 이상 5.0 미만
  - label: 디자인 원본
    value: KRDS 1.1.0(행정안전부, 2024)
---
이 테마는 행정안전부가 2024년에 공개한 범정부 UI/UX 디자인시스템(KRDS)의 컴포넌트와 토큰을 바탕으로 한 Jekyll 테마입니다. 디자인 원본의 출처와 이용 조건은 저장소의 `NOTICE.md`에 있습니다.

## 기능

- 홈, 문서(왼쪽 메뉴와 "이 페이지의 구성"), 블로그, 태그, 검색 페이지
- 수식·다이어그램·차트·영상 임베드(필요한 페이지에서만 라이브러리를 불러옴)
- [[첨부 파일]] 목록과 미리보기, 형식별 [[아이콘]]
- 이 위키([[위키 사용법]])
- 화면 모드와 글자 크기 조절 등 [[접근성]] 기능

## 만드는 방식

색·간격·글꼴은 KRDS 토큰을 그대로 쓰고 테마가 필요한 이름으로 한 번 더 연결합니다. 자세한 내용은 [[디자인 토큰]]을 보세요. 사이트에 올리는 방법은 [[배포 가이드]]로 정리할 수 있습니다.
