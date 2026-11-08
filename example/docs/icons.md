---
layout: docs
title: 아이콘
lead: Font Awesome Free 아이콘을 본문과 템플릿에서 쓰는 방법입니다.
tags: [아이콘, 가이드]
---
테마에는 [Font Awesome Free](https://fontawesome.com) 7.3.1의 SVG 아이콘 일부(약 80개)가 들어 있습니다. 글자색(`currentColor`)을 따라 칠해지는 마스크 아이콘이라서 글꼴 파일을 따로 받지 않고, 외부 서버에도 연결하지 않습니다.

## 본문에서 쓰기

`embed/icon.html` include로 넣습니다. {% include embed/icon.html name="circle-info" %} 처럼 글자 옆에 붙고, 크기는 주변 글자 크기를 따릅니다.

```liquid
{% raw %}{% include embed/icon.html name="file-pdf" %}
{% include embed/icon.html name="github" style="brands" %}
{% include embed/icon.html name="circle-info" label="안내" %}{% endraw %}
```

- `name`: 아이콘 이름. 아래 목록에서 고릅니다.
- `style`: `solid`(기본), `regular`, `brands`
- `label`: 뜻이 있는 아이콘에는 스크린리더용 이름을 적습니다. 비우면 장식으로 보고 숨깁니다.

템플릿에서는 `<i class="th-fa th-fa-file-pdf" aria-hidden="true"></i>`로 직접 쓸 수 있습니다. 크기와 색은 CSS(`font-size`, `color`)로 바꿉니다.

## 첨부 파일 아이콘

[첨부 파일]({{ '/docs/attachments/' | relative_url }}) 카드는 확장자에 맞는 아이콘과 색을 자동으로 고릅니다. HWP/HWPX는 일반 파일 아이콘으로 보입니다.

| 종류 | 확장자 | 아이콘 |
| :--- | :--- | :--- |
| PDF | pdf | {% include embed/icon.html name="file-pdf" %} file-pdf |
| 문서 | doc, docx, odt, rtf | {% include embed/icon.html name="file-word" %} file-word |
| 스프레드시트 | xls, xlsx, ods, cell, csv, tsv | {% include embed/icon.html name="file-excel" %} file-excel · {% include embed/icon.html name="file-csv" %} file-csv |
| 프레젠테이션 | ppt, pptx, odp, show | {% include embed/icon.html name="file-powerpoint" %} file-powerpoint |
| 한글 | hwp, hwpx | 일반 파일 아이콘 |
| 이미지·음원·영상 | png, jpg, svg, mp3, mp4 … | {% include embed/icon.html name="file-image" %} {% include embed/icon.html name="file-audio" %} {% include embed/icon.html name="file-video" %} |
| 압축·코드·텍스트 | zip, html, json, txt … | {% include embed/icon.html name="file-zipper" %} {% include embed/icon.html name="file-code" %} {% include embed/icon.html name="file-lines" %} |

## 들어 있는 아이콘

{% include embed/icon-gallery.html %}

## 아이콘 더하기

1. Font Awesome Free 배포본의 `svgs/` 폴더에서 SVG를 골라 `assets/img/fa/solid/`(또는 `regular`, `brands`)에 넣습니다. 파일 첫 줄의 라이선스 주석은 지우지 마세요.
2. 사이트 CSS에 한 줄을 추가합니다.

```css
.th-fa-계정 { --th-fa: url("/assets/img/fa/solid/계정.svg"); }
```

## 라이선스

아이콘은 CC BY 4.0이라 출처 표기가 필요합니다. 저장소의 `NOTICE.md`와 `assets/img/fa/LICENSE.txt`에 표기와 전문이 있으니 지우지 마세요.
