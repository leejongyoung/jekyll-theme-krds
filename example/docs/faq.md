---
layout: docs
title: 자주 묻는 질문
lead: 본문에 Q/A를 적으면 아코디언으로 보여주고 검색엔진용 구조화 데이터를 함께 내보내는 방법입니다.
tags: [FAQ, 가이드]
faq:
  - q: 검색이 안 돼요
    a: |
      검색은 **문장으로 찾기**(`krds.search.sentence`, 기본 켜짐)가 켜져 있어야 동작합니다. 그래도 안 되면 다음을 확인하세요.

      - `bundle exec jekyll build`로 사이트를 빌드했는지(`search-index.json`이 생겼는지)
      - 검색어와 글에 같은 단어가 있는지
  - q: 답을 AI로 만들어 주나요
    a: 만들어 주지 않습니다. 검색은 관련 있어 보이는 부분을 찾아 줄 뿐이라 링크를 열어 확인하세요.
---

자주 묻는 질문은 글의 front matter에 `faq` 목록으로 적고 본문에서 include로 보여줍니다. 누르면 펼쳐지는 아코디언으로 보이며, 자바스크립트 없이 동작합니다.

```md
---
faq:
  - q: 검색이 안 돼요
    a: 검색은 **문장으로 찾기**가 켜져 있어야 동작합니다.
---

{% raw %}{% include embed/faq.html ask="https://github.com/leejongyoung/jekyll-theme-krds/issues" %}{% endraw %}
```

- `ask`를 쓰면 아래에 **질문하기** 버튼이 생깁니다. 이슈·토론·메일 주소를 씁니다. 사이트 설정 `krds.faq.ask`로 기본값을 둘 수도 있습니다.
- 답에는 목록·링크·코드 같은 마크다운을 그대로 쓸 수 있습니다.
- 질문과 답은 검색엔진용 FAQ 구조화 데이터(JSON-LD)로도 함께 나가서 검색 결과에 나올 수 있습니다.
- 목록 대신 `{% raw %}{% include embed/faq.html items=site.data.faq %}{% endraw %}`처럼 `_data` 파일에서 가져올 수도 있습니다.

## 예제

{% include embed/faq.html ask="https://github.com/leejongyoung/jekyll-theme-krds/issues" %}
