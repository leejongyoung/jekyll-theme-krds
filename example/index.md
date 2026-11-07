---
layout: home
title: 홈
hero:
  eyebrow: Jekyll 테마
  title: 접근성을 갖춘 KRDS 스타일 사이트를 Jekyll로
  lead: 범정부 UI/UX 디자인시스템(KRDS)의 토큰과 컴포넌트를 그대로 가져와, 글자 크기와 화면 모드 설정이 되는 문서·블로그 사이트를 만듭니다.
  actions:
    - text: 시작하기
      url: /docs/getting-started/
      style: primary
    - text: 마크다운 보기
      url: /docs/typography/
      style: secondary
features_title: 주요 기능
features:
  - icon: palette
    title: KRDS 원본 그대로
    text: 토큰과 SCSS 원본은 고치지 않고 가져오며, 색과 글꼴은 CSS 변수 재선언으로 바꿉니다.
    url: /docs/configuration/
  - icon: universal-access
    title: 글자 크기·화면 모드
    text: 글자 크기 5단계와 기본·선명하게·시스템 설정 모드를 지원하고, 선택은 기억됩니다.
  - icon: newspaper
    title: 문서와 블로그
    text: 사이드 내비게이션, 이 페이지의 구성, 페이지네이션, 브레드크럼을 갖춘 레이아웃을 제공합니다.
    url: /blog/
banner_label: 주요 소식
banner:
  - eyebrow: 새 기능
    title: 문서를 서로 잇는 위키
    text: 문서 링크, 역링크, 정보 상자, 분류·검색 필터를 갖춘 위키 레이아웃을 쓸 수 있습니다.
    url: /wiki/
    link_text: 위키 열기
    icon: book-open
    tone: purple
  - eyebrow: 첨부 파일
    title: PDF·이미지·표를 바로 미리보기
    text: 글 하단 첨부 목록과 확장자별 파일 아이콘, SHA-256 표시, 새 탭 viewer를 제공합니다.
    url: /docs/attachments/
    link_text: 첨부 파일 문서 보기
    icon: paperclip
    tone: blue
  - eyebrow: 아이콘
    title: Font Awesome 아이콘 약 80개 포함
    text: 글꼴 파일이나 외부 서버 없이 본문과 템플릿에서 바로 쓸 수 있는 SVG 아이콘입니다.
    url: /docs/icons/
    link_text: 아이콘 목록 보기
    icon: palette
    tone: orange
  - eyebrow: 검색·태그
    title: 서버 없이 브라우저에서 검색
    text: 정적 파일 하나만 읽어 제목·태그·본문을 찾습니다. 외부로 나가는 요청이 없습니다.
    url: /docs/search-tags/
    link_text: 자세히 보기
    icon: magnifying-glass
    tone: green
tabs_title: 둘러보기
tabs:
  - title: 최근 글
    source: posts
    limit: 3
  - title: 위키
    source: wiki
    limit: 3
  - title: 시작하기
    items:
      - title: 설치와 시작
        text: 테마를 설치하고 첫 페이지를 만드는 순서입니다.
        url: /docs/getting-started/
        icon: terminal
      - title: 설정
        text: 색·글꼴·메뉴와 사이트 설정을 바꾸는 방법입니다.
        url: /docs/configuration/
        icon: gear
      - title: 마크다운 보기
        text: 제목, 목록, 표, 코드 같은 서식이 어떻게 보이는지 확인합니다.
        url: /docs/typography/
        icon: code
cards_title: 이런 것들을 할 수 있어요
cards:
  - icon: code
    tag: 기본
    title: 마크다운 보기
    text: 제목·목록·표·인용·코드 블록이 어떻게 보이는지 한 페이지에서 확인합니다.
    url: /docs/typography/
  - icon: universal-access
    tag: 기본
    title: 접근성
    text: 본문 바로가기, 화면 모드, 글자 크기 조절, 키보드 초점 표시를 갖췄습니다.
    url: /wiki/accessibility/
  - icon: magnifying-glass
    tag: 기능
    title: 검색과 태그
    text: 한글 부분 일치 검색과 태그 모아보기를 서버 없이 제공합니다.
    url: /docs/search-tags/
  - icon: diagram-project
    tag: 기능
    title: 수식·다이어그램·차트
    text: 필요한 페이지에서만 라이브러리를 불러오고, 영상은 재생 버튼을 누를 때 연결합니다.
    url: /docs/embeds/
  - icon: paperclip
    tag: 기능
    title: 첨부 파일
    text: 목록·미리보기·형식별 아이콘·SHA-256 표시와 PDF 변환본 연결을 지원합니다.
    url: /docs/attachments/
  - icon: book-open
    tag: 기능
    title: 위키
    text: 문서 링크, 역링크, 정보 상자, 분류와 검색, 작성이 필요한 문서 목록을 갖췄습니다.
    url: /wiki/
cardnews_title: 카드뉴스로 보는 핵심
cardnews:
  - tag: 구조
    title: 서버 없이 돌아가요
    text: 검색도 위키도 브라우저가 정적 파일 하나를 읽어 동작합니다. 외부로 나가는 요청이 없어요.
    icon: shield-halved
    tone: blue
  - tag: 접근성
    title: 화면 모드와 글자 크기
    text: 밝게·선명하게·시스템 설정, 글자 크기 5단계를 헤더에서 바꾸고 기억해요.
    url: /wiki/accessibility/
    icon: universal-access
    tone: dark
  - tag: 위키
    title: 대괄호 두 개로 문서를 이어요
    text: 링크로 문서를 잇고, 문서 아래에서 이 문서를 가리키는 문서를 되짚어 볼 수 있어요.
    url: /wiki/wikilinks/
    icon: link
    tone: purple
  - tag: 첨부
    title: 파일을 붙여 바로 보기
    text: PDF·이미지·표는 바로 미리보고, 문서는 PDF 변환본으로 보여 줘요.
    url: /2026/11/07/attachments-guide/
    icon: paperclip
    tone: green
  - tag: 시작
    title: 설치부터 차근차근
    text: 설치와 시작 문서부터 따라 해 보세요.
    url: /docs/getting-started/
    icon: bolt
    tone: orange
---
