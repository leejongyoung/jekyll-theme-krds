---
layout: wiki
title: 정보 상자
summary: 문서 오른쪽 위에 핵심 정보를 표로 보여 주는 front matter 항목입니다.
category: 사용법
wiki_aliases: [infobox, 인포박스]
tags: [위키, 가이드]
date: 2026-11-03
updated: 2026-11-06
infobox_title: 정보 상자 예시
infobox:
  - label: 위치
    value: 문서 오른쪽 위
  - label: 항목
    value: 제한 없음(label과 value 한 쌍씩)
  - label: 링크
    value: "[[문서 링크]]도 쓸 수 있음"
---
이 문서의 오른쪽 위에 보이는 표가 정보 상자입니다. 문서 front matter에 `infobox` 목록을 적으면 만들어집니다.

```yaml
infobox_title: 정보 상자 예시
infobox:
  - label: 위치
    value: 문서 오른쪽 위
  - label: 링크
    value: "[[문서 링크]]도 쓸 수 있음"
```

- `infobox_title` 이 없으면 문서 제목을 씁니다.
- 순서대로 보여 줍니다(맵이 아니라 목록이라서 순서가 유지됩니다).
- 값에는 평범한 글자와 [[문서 링크]]를 쓸 수 있습니다.
- `infobox_image`에 이미지 주소를, `infobox_alt`에 대체 텍스트를 적으면 표 위에 그림을 넣습니다.

화면이 좁으면 정보 상자는 본문 위로 올라와 가로 전체를 씁니다. 인쇄할 때도 같습니다. 다른 문서의 예로는 [[KRDS 테마]]를 보세요.
