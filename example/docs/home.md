---
layout: docs
title: 홈 화면 꾸미기
lead: 홈에 슬라이드 배너, 탭, 카드뷰, 카드뉴스를 넣는 방법입니다.
tags: [홈, 가이드]
---
홈 페이지(`index.md`)의 front matter에 아래 항목을 적으면 해당 구역이 나타납니다. 모두 선택이고, 적은 순서가 아니라 아래 순서대로 배치됩니다.

| 구역 | front matter | 설명 |
| :--- | :--- | :--- |
| 슬라이드 배너 | `banner` | 맨 위의 큰 슬라이드 |
| 소개 | `hero` | 제목·소개·버튼(기존) |
| 주요 기능 | `features` | 카드 목록(기존). `icon`을 적으면 아이콘이 붙습니다 |
| 탭 | `tabs` | 탭으로 나뉜 카드 목록 |
| 카드뷰 | `cards` | 아이콘·태그가 있는 카드 격자 |
| 카드뉴스 | `cardnews` | 좌우로 넘기는 세로형 카드 |
| 최근 글 | `recent_posts: 3`처럼 개수를 적으면 나옴 | 기존 글 목록 |

## 슬라이드 배너

```yaml
banner_label: 주요 소식        # 화면 읽기 프로그램에 전달되는 이름
banner_interval: 6000         # 자동 넘김 간격(ms, 3000 이상)
banner:
  - eyebrow: 새 기능
    title: 문서를 서로 잇는 위키
    text: 한두 문장 설명
    url: /wiki/
    link_text: 위키 열기
    icon: book-open           # 배경의 큰 아이콘(Font Awesome 이름)
    tone: purple              # blue | green | purple | orange | dark
```

- 자동으로 넘어가며 **멈춤·재생 버튼**, 이전·다음 버튼, 점, 왼쪽·오른쪽 화살표 키, 터치로 밀기를 지원합니다.
- 마우스를 올리거나 키보드 초점이 들어와 있는 동안은 잠시 멈추고, 운영체제의 "움직임 줄이기" 설정이면 처음부터 자동 재생하지 않습니다.
- 자바스크립트가 꺼져 있으면 슬라이드가 세로 목록으로 보입니다.

## 탭

```yaml
tabs_title: 둘러보기
tabs:
  - title: 최근 글
    source: posts             # 최근 글
    limit: 3
  - title: 위키
    source: wiki              # 최근 바뀐 위키 문서
    limit: 3
  - title: 시작하기
    items:                    # 직접 적은 카드
      - title: 설치와 시작
        text: 설명
        url: /docs/getting-started/
        icon: terminal
        tag: 가이드
```

방향키·Home·End로 탭을 옮길 수 있고, 자바스크립트가 없으면 제목이 붙은 구역으로 모두 펼쳐 보입니다.

## 카드뷰와 카드뉴스

```yaml
cards_title: 이런 것들을 할 수 있어요
cards:
  - icon: paperclip
    tag: 기능
    title: 첨부 파일
    text: 설명
    url: /docs/attachments/

cardnews_title: 카드뉴스로 보는 핵심
cardnews:
  - tag: 구조
    title: 서버 없이 돌아가요
    text: 두세 줄 설명
    url: /docs/search-tags/   # 선택
    icon: shield-halved
    tone: blue
```

- `icon`은 [아이콘 목록]({{ '/docs/icons/' | relative_url }})에 있는 Font Awesome 이름입니다.
- 카드뉴스는 가로 스크롤(스냅)과 이전·다음 버튼, "1 / 5" 위치 표시를 제공합니다. 카드 번호는 순서대로 자동으로 붙습니다.
- 슬라이드와 카드뉴스의 글자는 흰색이라 `tone`의 배경색을 고정해 대비를 확보했고, 선명하게(고대비) 모드에서는 검정 바탕에 흰 테두리로 바뀝니다.
