#!/usr/bin/env python3
"""Scan newly added attachment files with ClamAV and record the result in a manifest.

A file is scanned only the first time it is seen: the manifest remembers each file's
URL path and SHA-256, and a file whose path and hash are already recorded is skipped.
A new or changed file is scanned again. Pass --rescan to scan everything.

The theme reads the manifest (Hugo: data/attachment_scan.json, Jekyll: _data/attachment_scan.json)
and shows a "바이러스 검사 통과" badge next to attachments that are recorded as clean.
Infected files make the run fail and are never recorded.

Subcommands:
  plan  Print how many files still need a scan (writes pending=N to $GITHUB_OUTPUT when set).
  scan  Run clamscan on the pending files and update the manifest.
"""
import argparse
import datetime
import hashlib
import json
import os
import re
import subprocess
import sys
import tempfile

MAX_BYTES = 250 * 1024 * 1024  # clamscan's own limits are raised to this; larger files are refused


def sha256_of(path):
    digest = hashlib.sha256()
    with open(path, "rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def list_files(source, prefix):
    """Return {url_path: absolute_path} for every regular, non-hidden file under source."""
    found = {}
    for root, dirs, names in os.walk(source):
        dirs[:] = sorted(d for d in dirs if not d.startswith("."))
        for name in sorted(names):
            if name.startswith("."):
                continue
            path = os.path.join(root, name)
            if os.path.islink(path) or not os.path.isfile(path):
                continue
            relative = os.path.relpath(path, source).replace(os.sep, "/")
            found[prefix.rstrip("/") + "/" + relative] = path
    return found


def load_manifest(path):
    if os.path.exists(path):
        with open(path, encoding="utf-8") as handle:
            data = json.load(handle)
        if isinstance(data, dict) and isinstance(data.get("files"), dict):
            return data
    return {"schema": 1, "files": {}}


def pending_files(files, manifest, rescan):
    pending = {}
    for key, path in files.items():
        known = manifest["files"].get(key)
        size = os.path.getsize(path)
        digest = sha256_of(path)
        if rescan or not known or known.get("sha256") != digest or known.get("result") != "clean":
            pending[key] = (path, digest, size)
    return pending


def write_output(name, value):
    target = os.environ.get("GITHUB_OUTPUT")
    if target:
        with open(target, "a", encoding="utf-8") as handle:
            handle.write("%s=%s\n" % (name, value))


def clam_version(clamscan):
    result = subprocess.run([clamscan, "--version"], capture_output=True, text=True)
    if result.returncode != 0:
        raise SystemExit("clamscan --version failed: " + result.stderr.strip())
    return result.stdout.strip().splitlines()[0]


def run_clamscan(clamscan, paths):
    """Return ({path: status}, infected_lines). Status is the text clamscan printed after the path."""
    with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False, encoding="utf-8") as listing:
        listing.write("\n".join(paths) + "\n")
        list_path = listing.name
    try:
        result = subprocess.run(
            [clamscan, "--no-summary", "--max-filesize=250M", "--max-scansize=500M", "--file-list=" + list_path],
            capture_output=True, text=True, encoding="utf-8", errors="surrogateescape",
        )
    finally:
        os.unlink(list_path)
    if result.returncode not in (0, 1):
        sys.stderr.write(result.stdout + result.stderr)
        raise SystemExit("clamscan failed (exit %d)" % result.returncode)
    statuses = {}
    for line in result.stdout.splitlines():
        match = re.match(r"^(.*): (.+)$", line)
        if match:
            statuses[match.group(1)] = match.group(2)
    return statuses


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("command", choices=["plan", "scan"])
    parser.add_argument("--source", required=True, help="directory with the attachment files")
    parser.add_argument("--manifest", required=True, help="manifest JSON path (created when missing)")
    parser.add_argument("--url-prefix", default="/assets/files", help="site URL path the source directory is served at")
    parser.add_argument("--rescan", action="store_true", help="scan every file, ignoring the manifest")
    parser.add_argument("--clamscan", default="clamscan")
    args = parser.parse_args()

    if not os.path.isdir(args.source):
        raise SystemExit("source directory does not exist: " + args.source)
    files = list_files(args.source, args.url_prefix)
    manifest = load_manifest(args.manifest)
    pending = pending_files(files, manifest, args.rescan)
    gone = [key for key in manifest["files"] if key not in files]

    if args.command == "plan":
        print("files=%d pending=%d removed=%d" % (len(files), len(pending), len(gone)))
        write_output("pending", len(pending))
        return

    too_big = [key for key, (_, _, size) in pending.items() if size > MAX_BYTES]
    if too_big:
        raise SystemExit("too large to scan (over 250MB): " + ", ".join(too_big))

    engine = None
    scanned = {}
    to_scan = {key: value for key, value in pending.items() if value[2] > 0}
    if to_scan:
        engine = clam_version(args.clamscan)
        statuses = run_clamscan(args.clamscan, [value[0] for value in to_scan.values()])
        infected = []
        unknown = []
        for key, (path, digest, size) in to_scan.items():
            status = statuses.get(path)
            if status == "OK":
                scanned[key] = (digest, size)
            elif status and status.endswith("FOUND"):
                infected.append("%s: %s" % (key, status[: -len(" FOUND")]))
            else:
                unknown.append("%s: %s" % (key, status or "not reported by clamscan"))
        if infected:
            sys.stderr.write("Virus detected, nothing was recorded:\n  " + "\n  ".join(infected) + "\n")
            raise SystemExit(1)
        if unknown:
            sys.stderr.write("These files could not be scanned, nothing was recorded:\n  " + "\n  ".join(unknown) + "\n")
            raise SystemExit(1)
    for key, (path, digest, size) in pending.items():
        if size == 0:
            scanned[key] = (digest, size)

    today = datetime.datetime.now(datetime.timezone.utc).date().isoformat()
    result = {"schema": 1, "files": {}}
    for key in sorted(files):
        if key in scanned:
            digest, size = scanned[key]
            result["files"][key] = {
                "sha256": digest,
                "size": size,
                "result": "clean",
                "scanned_at": today,
                "engine": engine or "empty file",
            }
        elif key in manifest["files"]:
            result["files"][key] = manifest["files"][key]
    os.makedirs(os.path.dirname(os.path.abspath(args.manifest)), exist_ok=True)
    with open(args.manifest, "w", encoding="utf-8") as handle:
        json.dump(result, handle, ensure_ascii=False, indent=2, sort_keys=True)
        handle.write("\n")
    print("scanned %d file(s), %d already recorded, %d removed from manifest" % (len(scanned), len(files) - len(scanned), len(gone)))


if __name__ == "__main__":
    main()
