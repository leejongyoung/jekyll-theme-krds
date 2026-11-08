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

## 3. KaTeX (math rendering)

- Source: <https://github.com/KaTeX/KaTeX> · Version vendored: **v0.19.1**
- License: **MIT** — `assets/vendor/katex/LICENSE`
- Files: `katex.min.js`, `contrib/auto-render.min.js`, `katex-swap.min.css` (the `font-display: swap` variant) and the 20 `fonts/*.woff2`
  files, unmodified. The `.woff`/`.ttf` fallbacks referenced by the CSS are not included (every current browser supports woff2).
- Loaded only on pages that contain math. Re-vendor with `script/vendor-katex <tag>`.

## 4. Mermaid (diagrams)

- Source: <https://github.com/mermaid-js/mermaid> (npm `mermaid`) · Version vendored: **12.3.0**
- License: **MIT** — `assets/vendor/mermaid/LICENSE`
- Files: the ESM build `mermaid.esm.min.mjs` and its lazily loaded `chunks/mermaid.esm.min/*.mjs`, unmodified.
  Two optional chunks are **not** included to save about 1.9 MB: `elk-*` (ELK layout engine, only for `layout: elk`) and
  `katex-*` (math inside diagrams). Source maps are omitted. The theme therefore sets `layout: 'dagre'`.
- The bundle contains Mermaid's dependencies (for example d3, DOMPurify, Cytoscape, dagre-d3-es, roughjs, marked, dayjs, khroma),
  each under its own license (MIT, ISC, BSD-3-Clause, Apache-2.0 / MPL-2.0 for DOMPurify, ...). See the `mermaid` package metadata on npm.
- Loaded only on pages that contain a `mermaid` code block. Re-vendor with `script/vendor-mermaid <version>`.

## 5. Chart.js (charts)

- Source: <https://github.com/chartjs/Chart.js> (npm `chart.js`) · Version vendored: **4.6.1**
- License: **MIT** — `assets/vendor/chartjs/LICENSE.md`
- File: `chart.umd.js`, unmodified. It bundles `@kurkle/color` (MIT).
- Loaded only on pages that contain a `chart` code block. Re-vendor with `script/vendor-chartjs <version>`.

## 6. SheetJS Community Edition (spreadsheet preview)

- Source: <https://sheetjs.com> · <https://cdn.sheetjs.com/xlsx-0.20.3/> · Version vendored: **0.20.3**
- License: **Apache-2.0** — `assets/vendor/xlsx/LICENSE`
- File: `xlsx.full.min.js`, unmodified (byte-identical to `dist/xlsx.full.min.js` in the `xlsx-0.20.3` package).
- Loaded only on pages that preview a spreadsheet attachment.

## 7. Font Awesome Free (icons)

- Source: <https://fontawesome.com> (npm `@fortawesome/fontawesome-free`) · Version vendored: **7.3.1**
- License: **CC BY 4.0** for the SVG icons (<https://creativecommons.org/licenses/by/4.0/>). The full Font Awesome Free license is in `assets/img/fa/LICENSE.txt`.
- Files: a selected subset (about 80 icons) of `svgs/solid`, `svgs/regular` and `svgs/brands` in `assets/img/fa/`, **unmodified** except `solid/file-hwp.svg`, which reuses the page outline of the `file-word` icon and replaces the "W" with an "H" (a change made for this theme; its header comment says so). Each file keeps Font Awesome's attribution comment.
- They are applied as CSS masks (`.th-fa`), so no Font Awesome font or script is loaded. HWP has no Font Awesome icon, so the modified `file-hwp` icon described above is used for it.
- Attribution: Icons by Font Awesome Free (<https://fontawesome.com>), Copyright Fonticons, Inc., licensed under CC BY 4.0. Do not remove the comment header in the SVG files or `LICENSE.txt`.

## 8. This theme's own code

MIT License, see `LICENSE`.


## 9. Example site assets

- `sample.hwpx` in the example site was generated with python-hwpx 6.11.0 (<https://github.com/airmang/python-hwpx>, Apache-2.0) from its blank-document template plus text written for this theme. It is only an example file and is not part of the theme code. The generator script is not included.


## 10. ClamAV (optional attachment scan)

- The optional `attachment-scan` GitHub Action installs ClamAV (<https://www.clamav.net/>, GPL-2.0) on the CI runner from the Ubuntu package repository and runs `clamscan` as a separate program. No ClamAV code or virus definitions are included in this repository or in the theme.

## 11. rhwp (Hangul document preview)

- Source: <https://github.com/edwardkim/rhwp> (npm `@rhwp/core`) · Version vendored: **0.8.7**
- License: **MIT** — `assets/vendor/rhwp/LICENSE`
- Files: `rhwp.js` (SHA-256 `70cde06a369fa7fd4fc8bc8f3d6acaee158596ba1a116a2c72159002b0b5654e`) and `rhwp_bg.wasm` (SHA-256 `54cf95014312e605c51b98eb9021247ea79ef2bbd0a7080e11c011d0246e3989`), unmodified from the npm package; the version is recorded in `assets/vendor/rhwp/VERSION`.
- Loaded only when a page previews a `hwp` or `hwpx` attachment. The sample `sample.hwp` in the example site is a test document of the rhwp project (MIT).

## 12. pdf.js (PDF preview)

- Source: <https://github.com/mozilla/pdf.js> (npm `pdfjs-dist`) · Version vendored: **6.5.438**
- License: **Apache-2.0** — `assets/vendor/pdfjs/LICENSE`
- Files: `pdf.mjs` (SHA-256 `3a88402882cfa3e7e72c2c9b5149f52f0f88baf1c5b62aa11a41abdbc207244`) and `pdf.worker.mjs` (SHA-256 `1e64c8240e54735ec5913b37acd5134747799cb8c6bb3777c70adbc01232d2aa`), unmodified from the npm package; the version is recorded in `assets/vendor/pdfjs/VERSION`.
- Loaded only when a page previews a `pdf` attachment.
