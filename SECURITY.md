# 보안 정책 (Security Policy)

## 지원 버전

| 버전 | 지원 |
| :--- | :--- |
| 0.1.x | 보안 수정 지원 |
| 그 이전 | 지원하지 않음 |

개인이 운영하는 프로젝트라서 아래 응답 시간은 **보장이 아니라 목표**입니다.

## 취약점 신고

**공개 이슈로 올리지 마세요.** 아래 비공개 양식을 사용해 주세요.

1. 이 저장소의 **Security → Report a vulnerability**로 이동합니다
   ([바로가기](https://github.com/leejongyoung/jekyll-theme-krds/security/advisories/new)).
2. 아래 내용을 적습니다.
   - 영향을 받는 파일·레이아웃·버전
   - 재현 방법(가능하면 최소 예제 사이트)
   - 예상되는 영향(예: 방문자 브라우저에서 임의 스크립트 실행)
   - 알고 있는 완화 방법

목표 응답: 7일 안에 접수 회신, 확인되면 수정 일정을 안내합니다. 수정 릴리스 뒤에 보안 권고(Security Advisory)로 공개하며, 원하시면 신고자를 감사 인사에 올립니다.

## 범위

**범위 안**

- 이 테마가 만든 HTML·JavaScript에서 생기는 문제: XSS, 안전하지 않은 DOM 삽입, 잘못된 링크 속성(`rel`) 등
- 테마에 포함된 스크립트(`assets/js/theme.js`)와 빌드·CI 설정(`.github/`)

**KRDS 원본(`vendor`) 관련**

`_sass/vendor/krds`, `assets/js/vendor/krds-ui-script.js` 등은 KRDS HTML Component Kit을 그대로 가져온 것입니다. 이 코드의 취약점은 먼저 [KRDS 문의 및 건의](https://www.krds.go.kr/html/site/community/community_06.html)로 알려 주시고, 이 저장소에도 신고해 주시면 반영 여부를 판단해 안내합니다.

**범위 밖**

- 이 테마를 쓰는 사이트의 설정·콘텐츠·호스팅 문제
- 사용자가 직접 추가한 스크립트나 플러그인의 문제
- 취약점이 아닌 일반 버그·접근성 문제(이슈 템플릿을 사용해 주세요)

## 이 저장소의 보안 설정

비밀 값 스캐닝과 푸시 보호, Dependabot 알림, 비공개 취약점 신고가 켜져 있습니다. 이 저장소는 정적 사이트 테마라서 서버 구성요소나 저장된 비밀 값이 없습니다.

---

**English summary** — Please report vulnerabilities privately via *Security → Report a vulnerability*, not in public issues.
This is a personal project: response times are goals, not guarantees. Issues in vendored KRDS files should also be reported to KRDS.
