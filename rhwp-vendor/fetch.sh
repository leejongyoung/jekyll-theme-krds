#!/usr/bin/env bash
# rhwp(@rhwp/core, MIT)를 npm 레지스트리에서 받아 지정한 폴더에 둔다.
# 내려받은 압축 파일의 SHA-256이 아래 값과 다르면 아무것도 복사하지 않고 실패한다.
# 사용: bash fetch.sh <rhwp를 둘 폴더>   (Hugo: static/assets/vendor/rhwp, Jekyll: assets/vendor/rhwp)
# 버전을 올릴 때는 VERSION과 SHA256을 함께 바꾼다(npm view @rhwp/core@<버전> dist.integrity 로 sha512도 대조할 수 있다).
set -euo pipefail

VERSION="0.8.7"
SHA256="30e8a17400583570afec9169baeef3f0785e023e2a51344ed44eb8539a60e6a6"

dest="${1:?사용법: fetch.sh <rhwp를 둘 폴더>}"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

curl -fsSL --retry 3 "https://registry.npmjs.org/@rhwp/core/-/core-${VERSION}.tgz" -o "$tmp/core.tgz"
if command -v sha256sum >/dev/null 2>&1; then actual="$(sha256sum "$tmp/core.tgz" | cut -d' ' -f1)"; else actual="$(shasum -a 256 "$tmp/core.tgz" | cut -d' ' -f1)"; fi
if [ "$actual" != "$SHA256" ]; then
  echo "rhwp ${VERSION}의 SHA-256이 다릅니다. 기대 $SHA256, 실제 $actual. 복사하지 않습니다." >&2
  exit 1
fi
tar -xzf "$tmp/core.tgz" -C "$tmp" package/rhwp.js package/rhwp_bg.wasm package/LICENSE
mkdir -p "$dest"
cp "$tmp/package/rhwp.js" "$tmp/package/rhwp_bg.wasm" "$tmp/package/LICENSE" "$dest/"
printf '@rhwp/core %s (MIT)\n' "$VERSION" > "$dest/VERSION"
echo "rhwp $VERSION → $dest"
