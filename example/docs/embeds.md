---
layout: docs
title: 임베드와 수식
lead: 수식, 다이어그램, 차트, 동영상과 외부 콘텐츠를 본문에 넣는 방법입니다.
tags: [수식, 다이어그램, 차트, 가이드]
attachments:
  - src: "/assets/files/sample.pdf"
    title: "첨부 예제 PDF"
    desc: "미리보기 확인용"
    size: "597B"
  - src: "/assets/files/sample.txt"
    title: "첨부 예제 텍스트"
    size: "71B"
---
이 페이지의 모든 항목은 **필요한 페이지에서만** 해당 라이브러리를 불러옵니다. 외부 서비스(YouTube, Vimeo, 지도 등)는 **불러오기 버튼을 누르기 전에는 연결하지 않습니다.**

## 수식

본문에 `$$ ... $$`를 쓰면 [KaTeX](https://katex.org)로 그립니다. 문장 안에서는 인라인, 따로 한 문단이면 블록 수식입니다. 이차방정식의 해는 $$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$$ 입니다.

$$
\int_0^\infty e^{-x^2}\,dx = \frac{\sqrt{\pi}}{2}
\qquad
\sum_{k=1}^{n} k = \frac{n(n+1)}{2}
$$

$$
A = \begin{pmatrix} a & b \\ c & d \end{pmatrix},\quad
\det A = ad - bc
$$

가격처럼 달러 기호를 쓰는 문장은 수식으로 바뀌지 않습니다: 커피 $4와 케이크 $6은 합쳐서 $10입니다.

## Mermaid 다이어그램

`mermaid` 언어의 코드 블록을 쓰면 다이어그램으로 바뀝니다. 화면 모드(기본/선명하게)를 바꾸면 색도 같이 바뀌고, "다이어그램 원문 보기"로 원문을 볼 수 있습니다.

```mermaid
flowchart LR
  A[글 작성] --> B{수식·도표 있음?}
  B -->|예| C[필요한 라이브러리만 불러오기]
  B -->|아니오| D[기본 페이지]
  C --> E[완성]
  D --> E
```

```mermaid
sequenceDiagram
  autonumber
  participant 방문자
  participant 페이지
  participant 외부서비스
  방문자->>페이지: 페이지 열기
  페이지-->>방문자: 재생 버튼만 표시(연결 없음)
  방문자->>페이지: 재생 버튼 누르기
  페이지->>외부서비스: 그때 연결
```

```mermaid
pie showData
  title 사용한 도구 비율
  "KRDS 컴포넌트" : 55
  "테마 코드" : 30
  "외부 라이브러리" : 15
```

## 차트

`chart` 언어의 코드 블록에 [Chart.js](https://www.chartjs.org) 설정을 **JSON**으로 씁니다. 색은 KRDS 색을 자동으로 쓰고, "데이터 표로 보기"로 같은 값을 표로 읽을 수 있습니다. `title`과 `description`은 접근성을 위한 추가 키입니다.

```chart
{
  "type": "bar",
  "title": "분기별 방문자",
  "description": "1분기부터 4분기까지 방문자 수(천 명)",
  "data": {
    "labels": ["1분기", "2분기", "3분기", "4분기"],
    "datasets": [
      { "label": "2025", "data": [12, 19, 8, 15] },
      { "label": "2026", "data": [14, 22, 17, 25] }
    ]
  }
}
```

```chart
{
  "type": "line",
  "title": "월별 접근성 점수",
  "description": "점수는 0~100",
  "data": {
    "labels": ["1월", "2월", "3월", "4월", "5월", "6월"],
    "datasets": [
      { "label": "밝은 모드", "data": [78, 82, 88, 91, 94, 97] },
      { "label": "선명하게 모드", "data": [70, 76, 85, 90, 95, 98] }
    ]
  },
  "options": { "scales": { "y": { "min": 0, "max": 100 } } }
}
```

```chart
{
  "type": "doughnut",
  "title": "의존성 크기 비율",
  "height": "30rem",
  "data": {
    "labels": ["KRDS", "Mermaid", "Chart.js", "KaTeX"],
    "datasets": [{ "data": [1.2, 3.6, 0.2, 0.6] }]
  }
}
```

## 동영상

### YouTube

```liquid
{% raw %}{% include embed/youtube.html id="jNQXAC9IVRw" title="Me at the zoo (YouTube 최초의 영상)" caption="YouTube 최초로 올라온 영상" %}{% endraw %}
```

{% include embed/youtube.html id="jNQXAC9IVRw" title="Me at the zoo (YouTube 최초의 영상)" caption="YouTube 최초로 올라온 영상" %}

`youtube-nocookie.com` 도메인을 쓰고, 버튼을 누를 때만 연결합니다. `start=30`처럼 시작 시간(초), `url="https://youtu.be/..."`로 주소 전체를 쓸 수도 있습니다.

### Vimeo

{% include embed/vimeo.html id="76979871" title="The New Vimeo Player" caption="Vimeo 플레이어 소개 영상" %}

### 자체 호스팅 영상(자막 포함)과 오디오

외부 연결이 없는 `<video>`·`<audio>`입니다. 자막(WebVTT)과 대본 링크를 함께 넣을 것을 권합니다.

{% include embed/video.html src="/assets/media/demo.webm" type="video/webm" captions="/assets/media/demo.ko.vtt" title="움직이는 색 상자 예제" caption="자막이 있는 자체 호스팅 영상" ratio="16 / 9" %}

{% include embed/audio.html src="/assets/media/tone.wav" type="audio/wav" title="440Hz 기준음" caption="440Hz 기준음 1초" %}

## 그 밖의 외부 페이지(iframe)

지도, 슬라이드, CodePen 같은 페이지를 넣을 때는 `iframe.html`을 씁니다. 기본으로 `sandbox`가 걸리고 불러오기 버튼 뒤에 있습니다.

`url`·`link`·`thumb`는 `https://`로 시작하는 주소만 사용합니다. 다른 scheme(`javascript:` 등)은 출력하지 않고, `ratio`는 숫자·슬래시 형식이 아니면 `16 / 9`로 바뀝니다.

{% include embed/iframe.html url="https://www.openstreetmap.org/export/embed.html?bbox=126.9700%2C37.5600%2C126.9850%2C37.5700&layer=mapnik" title="서울 시청 주변 지도" provider="OpenStreetMap" link="https://www.openstreetmap.org/?bbox=126.9700%2C37.5600%2C126.9850%2C37.5700" caption="서울 시청 주변" ratio="16 / 9" %}

## 첨부 파일

`pdf`는 브라우저 내장 뷰어로 바로 미리보고, 이미지는 그대로 보여줍니다(외부 연결 없음).
`docx`·`xlsx`·`cell`·`hwpx` 같은 오피스 문서는 브라우저가 직접 그리지 못하므로
`preview_pdf`로 PDF 변환본을 함께 두면 그걸 보여주고, 없으면 내려받기 카드만 나옵니다.
꼭 외부 뷰어가 필요하면 `viewer="google"` 또는 `viewer="office"`를 쓰세요.
버튼을 누르기 전에는 외부에 연결하지 않습니다.

{% include embed/attachment.html src="/assets/files/sample.pdf" title="첨부 예제 PDF" desc="본문 미리보기 예제" %}

글 끝의 파일 목록은 front matter의 `attachments:`로 만듭니다. 이 페이지 아래에도 같은 목록이 보입니다.

```yaml
attachments:
  - src: "/assets/files/sample.pdf"
    title: "첨부 예제 PDF"
    desc: "미리보기 확인용"
    size: "597B"
```

```liquid
{% raw %}{% include embed/attachment.html src="/assets/files/보고서.pdf" title="보고서" %}{% endraw %}
{% raw %}{% include embed/attachment.html src="/assets/files/예산안.hwpx" title="예산안" preview_pdf="/assets/files/예산안.pdf" %}{% endraw %}
{% raw %}{% include embed/attachment.html src="https://example.com/자료.xlsx" title="자료" viewer="office" %}{% endraw %}
```

오피스 문서를 PDF로 바꾸는 예: `libreoffice --headless --convert-to pdf 예산안.hwpx`를 실행해
원본 옆에 같은 이름의 `.pdf`를 두고 `preview_pdf`로 가리키세요.
`preview=false`를 주면 미리보기 없이 카드만 나옵니다.

## 설정

| 키 | 설명 |
| :--- | :--- |
| 페이지 `math`, `mermaid`, `chart` | `true`면 항상, `false`면 절대 불러오지 않습니다. 지정하지 않으면 본문에 해당 내용이 있을 때만 불러옵니다 |
| `krds.math`, `krds.mermaid`, `krds.chart` | 사이트 전체에서 `false`로 끌 수 있습니다 |
