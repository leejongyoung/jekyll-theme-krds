#!/usr/bin/env python3
"""Hugo·Jekyll 두 테마에서 같아야 하는 파일이 어긋났는지 검사한다.

두 저장소는 같은 기능을 나란히 제공하므로 일부 파일은 같아야 한다. 이 스크립트는 현재 저장소를
상대 저장소의 main과 비교한다(상대는 공개 저장소라 토큰이 필요 없다). 이 파일은 두 저장소에 같은 내용으로 둔다.

비교 방식
  exact      바이트 단위로 같아야 함
  nocomment  주석(/* … */, // …)과 빈 줄을 뺀 뒤 같아야 함. 머리 주석에 테마 이름이 들어가는 JS용

기본은 어긋남을 경고(GitHub Actions 주석)로만 알리고 성공(0)으로 끝난다. --strict를 주면 어긋날 때 1로 끝난다.
상대 저장소의 PR이 아직 병합되지 않았으면 일시적으로 어긋날 수 있어서, PR·푸시(CI의 shared-files 잡)는 경고만 쓰고
주 1회 shared-drift 워크플로가 --strict로 돌아 방치된 어긋남을 실패로 알린다.

사용: python3 script/check-shared.py [--other 상대 저장소 경로] [--strict]
"""
import argparse
import os
import re
import subprocess
import sys
import tempfile

REPOS = {"hugo": "hugo-theme-krds", "jekyll": "jekyll-theme-krds"}
OWNER = "leejongyoung"

# (종류, Hugo 경로, Jekyll 경로, 방식). 종류: file | dir
JS_EXACT = ["hwpx", "text", "home", "wiki", "attachment-viewer", "hwp-rhwp", "answer"]
JS_LOOSE = ["theme", "embeds", "math", "search"]
TARGETS = (
    [("file", f"static/assets/js/{n}.js", f"assets/js/{n}.js", "exact") for n in JS_EXACT]
    + [("file", f"static/assets/js/{n}.js", f"assets/js/{n}.js", "nocomment") for n in JS_LOOSE]
    + [
        ("file", "static/assets/attachment-viewer.html", "assets/attachment-viewer.html", "exact"),
        ("file", "script/check-shared.py", "script/check-shared.py", "exact"),
        ("dir", "document-previews", "document-previews", "exact"),
        ("dir", "attachment-scan", "attachment-scan", "exact"),
        ("dir", "rhwp-vendor", "rhwp-vendor", "exact"),
        ("dir", "static/assets/vendor", "assets/vendor", "exact"),
        ("dir", "static/assets/js/vendor", "assets/js/vendor", "exact"),
        ("dir", "static/assets/img/fa", "assets/img/fa", "exact"),
        ("dir", "exampleSite/static/assets/files", "example/assets/files", "exact"),
    ]
)


def detect(root):
    if os.path.exists(os.path.join(root, "theme.toml")) and os.path.isdir(os.path.join(root, "layouts")):
        return "hugo"
    if any(name.endswith(".gemspec") for name in os.listdir(root)):
        return "jekyll"
    sys.exit("이 폴더가 Hugo·Jekyll 테마 저장소가 아닙니다: " + root)


def strip_comments(text):
    text = re.sub(r"/\*.*?\*/", "", text, flags=re.S)
    lines = []
    for line in text.splitlines():
        line = re.sub(r"(?<!:)//.*$", "", line).rstrip()
        if line.strip():
            lines.append(line)
    return "\n".join(lines)


def read(path, mode):
    with open(path, "rb") as handle:
        data = handle.read()
    if mode == "nocomment":
        return strip_comments(data.decode("utf-8", "replace")).encode("utf-8")
    return data


def files_in(base):
    found = {}
    for folder, dirs, names in os.walk(base):
        dirs[:] = sorted(d for d in dirs if not d.startswith("."))
        for name in sorted(names):
            if name.startswith("."):
                continue
            full = os.path.join(folder, name)
            found[os.path.relpath(full, base).replace(os.sep, "/")] = full
    return found


def compare(mine, theirs, kind, mode):
    """어긋난 항목을 (경로 설명, 이유) 목록으로 돌려준다."""
    if not os.path.exists(mine) and not os.path.exists(theirs):
        return []
    if not os.path.exists(mine):
        return [("", "이쪽에 없음")]
    if not os.path.exists(theirs):
        return [("", "상대쪽에 없음")]
    if kind == "file":
        return [] if read(mine, mode) == read(theirs, mode) else [("", "내용이 다름")]
    a, b = files_in(mine), files_in(theirs)
    out = []
    for rel in sorted(set(a) | set(b)):
        if rel not in a:
            out.append((rel, "이쪽에 없음"))
        elif rel not in b:
            out.append((rel, "상대쪽에 없음"))
        elif read(a[rel], mode) != read(b[rel], mode):
            out.append((rel, "내용이 다름"))
    return out


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--other", help="상대 저장소 경로(없으면 GitHub에서 main을 받아 옴)")
    parser.add_argument("--strict", action="store_true", help="어긋나면 실패(1)로 끝낸다")
    args = parser.parse_args()

    root = os.getcwd()
    me = detect(root)
    other = "jekyll" if me == "hugo" else "hugo"
    tmp = None
    other_root = args.other
    if not other_root:
        tmp = tempfile.mkdtemp(prefix="krds-other-")
        url = f"https://github.com/{OWNER}/{REPOS[other]}.git"
        result = subprocess.run(["git", "clone", "--depth", "1", "--quiet", url, tmp], capture_output=True, text=True)
        if result.returncode != 0:
            print(f"::warning title=공용 파일 검사::상대 저장소({url})를 받지 못해 건너뜁니다: {result.stderr.strip()[:200]}")
            return 0
        other_root = tmp
    if detect(other_root) != other:
        sys.exit(f"--other 경로가 {other} 저장소가 아닙니다")

    problems = []
    for kind, hugo_path, jekyll_path, mode in TARGETS:
        mine, theirs = (hugo_path, jekyll_path) if me == "hugo" else (jekyll_path, hugo_path)
        for rel, reason in compare(os.path.join(root, mine), os.path.join(other_root, theirs), kind, mode):
            label = mine + ("/" + rel if rel else "")
            problems.append((mine, label, reason, mode))

    checked = len(TARGETS)
    if not problems:
        print(f"공용 파일 {checked}개 항목이 상대 저장소({REPOS[other]} main)와 같습니다.")
        return 0
    in_actions = os.environ.get("GITHUB_ACTIONS") == "true"
    for mine, label, reason, mode in problems:
        message = f"{label}: 상대 저장소({REPOS[other]})와 {reason} [{mode}]"
        print(f"::warning file={mine},title=공용 파일 불일치::{message}" if in_actions else "불일치: " + message)
    print(f"{len(problems)}건이 어긋났습니다(검사 항목 {checked}개). 상대 저장소의 병합되지 않은 PR 때문일 수 있습니다.")
    return 1 if args.strict else 0


if __name__ == "__main__":
    sys.exit(main())
