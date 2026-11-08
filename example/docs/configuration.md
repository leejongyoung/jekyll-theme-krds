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
| `krds.search.sentence` | 검색의 "문장으로 찾기"를 켤지(기본 `true`). 끄면 색인에서 소제목별 본문이 빠집니다 |
| `krds.faq.ask` | 자주 묻는 질문 아래 "질문하기" 버튼의 기본 주소(이슈·토론·메일). include의 `ask`가 우선합니다 |

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
