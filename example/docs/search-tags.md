---
layout: docs
title: 태그와 검색
lead: 글에 태그를 달고, 사이트 안에서 검색하게 하는 방법입니다.
tags: [검색, 태그, 가이드]
---
## 태그

글의 front matter 에 `tags` 를 쓰면 글 위의 메타 정보에 태그 링크가 생기고, 링크를 누르면 태그 페이지의 해당 구역으로 이동합니다.

```yaml
---
layout: post
title: "글 제목"
tags: [접근성, 가이드]
---
```

태그 페이지는 `tags` 레이아웃으로 만듭니다. 글뿐 아니라 `tags` 가 있는 일반 페이지(이 문서처럼)도 함께 모읍니다.

```yaml
---
layout: tags
title: 태그
permalink: /tags/
---
```

## 검색

검색 페이지는 `search` 레이아웃으로 만듭니다. 만들고 나면 헤더에 **검색** 버튼이 자동으로 생깁니다.

```yaml
---
layout: search
title: 검색
permalink: /search/
search: false
---
```

- 빌드할 때 `/assets/search-index.json` 을 만들고, 브라우저에서 이 파일 하나만 읽어 검색합니다. 외부 서비스나 별도 서버가 필요 없습니다.
- 공백으로 나눈 단어가 모두 들어 있는 글을 찾습니다. 한국어는 단어 중간(예: "접근" → "접근성")도 찾습니다.
- 태그 칩으로 결과를 좁힐 수 있고, 주소(`?q=…&tag=…`)로 결과를 공유할 수 있습니다.
- 검색 대상에서 빼려면 페이지 front matter 에 `search: false` 를 씁니다.
- 본문은 글마다 앞의 3000자까지만 색인합니다. `_config.yml` 의 `krds.search.max_chars` 로 바꿉니다.
