# NOTICE

## 1. KRDS (Korea Design System) — 범정부 UI/UX 디자인시스템

- Source: <https://www.krds.go.kr> · HTML Component Kit <https://github.com/KRDS-uiux/krds-uiux>
- Version vendored: **1.1.0** (git tag `1.1.0`, commit `d6bb184c823e4757f05807ea4646a23e3133b6e6`)
- Provider: 행정안전부 (Ministry of the Interior and Safety), released in 2024
- License: **공공누리 제1유형 (KOGL Type 1)** — free use including commercial use, modification and derivative
  works are allowed, **source attribution is required**. Terms: <https://www.krds.go.kr/html/eng/utility/utility_05.html>
  (checked 2026-11-07). The kit's `package.json` also says `ISC`; its README defers to the KRDS site terms.
  Both permit this use; the strictest requirement (attribution) is followed.
- The Ministry bears no responsibility for losses caused by improperly modified public materials.

Attribution (shown in every page footer by `_includes/footer.html`; do not remove it):

> 이 사이트의 디자인은 행정안전부가 2024년 제작하여 공공누리 제1유형으로 개방한 범정부 UI/UX 디자인시스템(KRDS)을
> 바탕으로 한 Jekyll 테마 jekyll-theme-krds를 사용합니다.

### What is vendored, and where

| Path in this repo | From the kit (v1.1.0) | Changes |
| :--- | :--- | :--- |
| `_sass/vendor/krds/common/`, `_sass/vendor/krds/component/` | `resources/scss/common`, `resources/scss/component` | none |
| `_sass/vendor/krds/_krds_tokens.scss` | `resources/css/token/krds_tokens.css` | file extension only (`.css` → `.scss`) so Sass can inline it |
| `assets/js/vendor/krds-ui-script.js` | `resources/js/component/ui-script.js` | none |
| `assets/img/component/icon/` | `resources/img/component/icon/` | `ico_logo_krds*.svg` removed (KRDS identity) |
| `assets/fonts/PretendardGOV-{Regular,Medium,Bold}.subset.woff2` | `resources/fonts/` | none |

Not included on purpose: the KRDS logo, favicons, the "공식 전자정부 누리집" banner, and any government emblem.
Re-vendor with `script/vendor-krds <tag>`.

## 2. Pretendard GOV (font)

- Source: <https://github.com/orioncactus/pretendard> (the GOV subset that ships with the KRDS kit)
- License: **SIL Open Font License 1.1** — full text in `assets/fonts/PRETENDARD-LICENSE.txt`.
  The font files are redistributed unmodified.

## 3. This theme's own code

MIT License, see `LICENSE`.
