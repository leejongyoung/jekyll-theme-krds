# 기여 안내

관심 가져 주셔서 감사합니다. 개인이 운영하는 프로젝트라서 검토가 늦을 수 있지만, 이슈와 PR을 환영합니다.

기여하면 여러분의 변경이 이 저장소와 같은 [MIT 라이선스](LICENSE)로 배포되는 것에 동의한 것으로 봅니다. 참여할 때는 [행동강령](CODE_OF_CONDUCT.md)을 지켜 주세요. 보안 취약점은 공개 이슈가 아니라 [SECURITY.md](SECURITY.md)의 비공개 신고를 사용해 주세요.

## 시작하기 전에

- **이슈를 먼저 열어 주세요.** 큰 변경(새 레이아웃, 데이터 구조 변경 등)은 구현 전에 방향을 맞추면 시간을 아낄 수 있습니다. 오타나 작은 수정은 바로 PR을 보내도 됩니다.
- **범위:** 이 테마는 KRDS 컴포넌트를 Jekyll로 묶는 것이 목적입니다. KRDS 자체의 디자인 규칙을 바꾸는 일은 [KRDS 문의 및 건의](https://www.krds.go.kr/html/site/community/community_06.html)로 보내 주세요.
- [이슈 템플릿](https://github.com/leejongyoung/jekyll-theme-krds/issues/new/choose): 버그 신고, 접근성 문제, 기능 제안, 질문

## 개발 환경

```sh
mise install                    # Ruby 3.4 (mise.toml). mise가 없다면 Ruby 3.1 이상
cd example && bundle install
bundle exec jekyll serve        # http://127.0.0.1:4000
```

테마 파일은 gem 경로(`path: ".."`)로 연결되어 있어서 `jekyll serve`가 테마 변경을 감지하지 못합니다. 테마를 고쳤다면 `bundle exec jekyll build`를 다시 실행하고 새로고침하세요.

## 지켜야 할 원칙

1. **KRDS vendor 파일은 직접 고치지 않습니다.** `_sass/vendor/krds`, `assets/js/vendor`, `assets/fonts`, `assets/img/component`는 KRDS 원본입니다(`assets/vendor/*`는 외부 라이브러리 원본). 바꾸고 싶은 값은 CSS 변수 재선언(`_sass/krds-theme/_tokens.scss`)이나 테마 스타일(`_sass/krds-theme`)에서 덮어씁니다. 원본을 새 버전으로 바꿀 때만 `script/vendor-krds <태그>`를 사용하고 [NOTICE.md](NOTICE.md)의 버전·커밋을 고칩니다. 수식·다이어그램·차트 라이브러리(`assets/vendor/katex`, `mermaid`, `chartjs`)도 같은 원칙이며 `script/vendor-katex`, `script/vendor-mermaid`, `script/vendor-chartjs`로 바꿉니다.
2. **푸터의 KRDS 출처 표시를 지우지 않습니다.** KRDS 이용 조건(공공누리 제1유형)상 출처 표시가 필수입니다.
3. **KRDS 로고·정부 상징·"공식 누리집" 배너 같은 식별 요소를 넣지 않습니다.**
4. **의존성을 늘리지 않습니다.** 테마 JS는 순수 JavaScript(프레임워크 없음)이고, 런타임 gem은 `jekyll`과 `jekyll-seo-tag`뿐입니다.
5. **색·간격·글자 크기는 KRDS 토큰만 씁니다.** 임의의 색상값이나 px을 새로 만들지 마세요.
6. **KRDS 컴포넌트의 마크업(클래스·구조)을 따릅니다.** KRDS 스크립트가 그 구조에 의존합니다.

## 접근성 기준

화면이 바뀌는 PR은 아래를 확인하고 결과를 PR에 적어 주세요.

- 밝은 모드와 선명하게(고대비) 모드 모두에서 확인합니다(헤더의 "화면 모드").
- 키보드만으로 조작할 수 있고, 포커스 표시가 보입니다.
- 글자·배경 대비가 4.5:1 이상입니다(큰 글자는 3:1).
- axe-core 위반이 0건입니다(브라우저 확장 프로그램 또는 개발자 도구로 확인).
- 360px 폭의 모바일 화면에서 가로 스크롤이나 겹침이 없습니다.

## 변경을 보내는 방법

1. 저장소를 포크하고 브랜치를 만듭니다(`fix/...`, `feat/...`, `docs/...`).
2. 변경하고 예제 사이트를 빌드해 확인합니다.
   ```sh
   cd example && bundle exec jekyll build --strict_front_matter
   cd .. && gem build jekyll-theme-krds.gemspec && rm -f *.gem
   ```
3. 커밋 메시지는 `type: 설명` 형식입니다. type은 `feat`, `fix`, `docs`, `chore`, `refactor`, `ci` 중에서 고릅니다. 설명은 한국어나 영어 모두 괜찮습니다.
4. PR을 열고 [템플릿](.github/PULL_REQUEST_TEMPLATE.md)의 확인 항목을 채웁니다. 설정이나 동작이 바뀌면 README와 [CHANGELOG](CHANGELOG.md)도 고칩니다.
5. CI(예제 빌드와 gem 빌드)가 통과해야 합니다.

## 라벨

[`.github/labels.json`](.github/labels.json)이 라벨의 기준이고, `script/sync-labels`(또는 라벨 파일이 바뀔 때 도는 GitHub Actions)가 저장소에 반영합니다. 라벨을 추가·변경하려면 그 파일을 고치는 PR을 보내 주세요. PR 라벨은 릴리스 노트 분류([`.github/release.yml`](.github/release.yml))에도 쓰입니다.

| 묶음 | 라벨 |
| :--- | :--- |
| 종류 | `bug`, `enhancement`, `accessibility`, `documentation`, `question`, `security` |
| 영역 | `layout`, `scss`, `javascript`, `vendor`, `upstream-krds`, `ci`, `dependencies` |
| 상태 | `needs-triage`, `needs-info`, `blocked`, `priority: high`, `breaking-change` |
| 참여 | `good first issue`, `help wanted` |
| 정리 | `duplicate`, `invalid`, `wontfix`, `skip-changelog` |

## 릴리즈 때 버전을 고칠 곳

새 버전을 낼 때 아래 값을 함께 올립니다. 빠뜨리면 사용자가 예전 버전을 설치하게 됩니다.

1. `jekyll-theme-krds.gemspec`의 `spec.version`
   - 같은 버전이 `example/Gemfile.lock`과 `example/Gemfile.jekyll43.lock`의 `jekyll-theme-krds (…)` 줄에 적혀 있어서 두 파일도 함께 고칩니다. 앞의 것은 로컬에서 예제를 빌드하면 저절로 바뀌지만 **뒤의 것은 바뀌지 않아** CI의 `build-lower-bound`가 "path gems changed"로 실패합니다.
2. `README.md`의 설치 예시(`@v…`, `tag: "v…"`)
3. 예제 문서의 버전 표기(`example/docs`, `example/_posts`의 `@v…`)
4. `CHANGELOG.md`의 `[Unreleased]`를 새 버전과 날짜로 바꿈

## 두 테마가 같아야 하는 파일

Hugo와 Jekyll 테마는 같은 기능을 나란히 제공해서 일부 파일(`hwpx.js`, `text.js`, `home.js`, `wiki.js`, `attachment-viewer.*`, `document-previews/`, `attachment-scan/`, vendor·아이콘 폴더, 예제 첨부 파일 등)이 두 저장소에서 같아야 합니다. `theme.js`·`embeds.js`·`math.js`·`search.js`는 머리 주석만 달라도 됩니다.

- `script/check-shared.py`가 상대 저장소의 `main`과 비교하고 CI의 `shared-files` 잡이 돌립니다. 지금은 어긋나면 **경고 주석만** 남기고 실패시키지 않습니다. 한쪽 PR이 아직 병합되지 않아 일시적으로 달라질 수 있기 때문입니다.
- 이 스크립트도 두 저장소에서 같은 파일입니다. 고치면 양쪽에 반영하세요.
- 로컬에서는 `python3 script/check-shared.py --other <상대 저장소 경로>`로 돌립니다. `--strict`를 주면 어긋날 때 실패합니다.
- 같아야 하는 파일의 목록은 스크립트의 `TARGETS`입니다. 새로 공용으로 쓰는 파일을 만들면 여기에 추가하세요.
