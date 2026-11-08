---
layout: docs
title: 설정
lead: 사이트 이름, 푸터, 색과 글꼴을 바꾸는 방법입니다.
---
## _config.yml

| 키 | 설명 |
| :--- | :--- |
| `krds.blog_url` | 블로그 목록 주소. 글의 브레드크럼에 쓰입니다 |
| `krds.docs_title` | 문서 사이드 메뉴 제목 |
| `krds.footer.description` | 푸터 설명 |
| `krds.footer.contact` | 푸터 연락처 목록(`label`, `value`) |
| `krds.favicon` | 파비콘 경로 |
| `krds.search.max_chars` | 검색 색인에 담는 본문 길이(글자 수, 기본 3000). 글이 많으면 줄입니다 |
| `krds.hwp.rhwp` | 고화질 한글 미리보기(rhwp)를 켤지(기본 꺼짐). rhwp 파일은 테마에 없고 `rhwp-vendor` action으로 받아야 합니다([첨부 파일]({{ '/docs/attachments/' | relative_url }}) 참고) |
| `krds.search.answer` | 검색의 "AI로 답변 만들기"를 켤지(기본 꺼짐). 방문자가 자기 API 키를 입력해 쓰는 선택 기능입니다(`search.sentence`가 켜져 있어야 함) |
| `krds.search.sentence` | 검색의 "문장으로 찾기"를 켤지(기본 `true`). 끄면 색인에서 소제목별 본문이 빠집니다 |

## 색과 글꼴 바꾸기

KRDS 토큰은 원본을 고치지 않고 CSS 변수를 다시 선언해서 바꿉니다. 사이트의 `assets/css/main.scss` 에서 테마 스타일을 가져온 뒤 덧붙입니다.

```scss
---
---
@import "main";

:root {
  --krds-typo-font-type: "Pretendard GOV", sans-serif;
}
```

## 푸터 출처 표시

푸터의 KRDS 출처 문구는 KRDS 이용 조건에 따른 것이므로 지우지 않습니다.
