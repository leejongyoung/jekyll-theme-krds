#!/usr/bin/env bash
set -euo pipefail

source_dir=${1:?"usage: convert.sh SOURCE_DIR [OUTPUT_DIR]"}
output_dir=${2:-$source_dir}

if [[ ! -d "$source_dir" ]]; then
  echo "Document preview source directory does not exist: $source_dir" >&2
  exit 1
fi

mkdir -p "$output_dir"
converted=0
while IFS= read -r -d '' source; do
  relative=${source#"$source_dir"/}
  relative_dir=$(dirname "$relative")
  target_dir="$output_dir/$relative_dir"
  stem=$(basename "${source%.*}")
  work_dir=$(mktemp -d)
  trap 'rm -rf "$work_dir"' EXIT

  if ! timeout 180s libreoffice --headless --convert-to pdf --outdir "$work_dir" "$source"; then
    echo "Failed to convert document preview: $relative" >&2
    exit 1
  fi
  generated="$work_dir/$stem.pdf"
  if [[ ! -s "$generated" ]]; then
    echo "LibreOffice did not produce a PDF preview: $relative" >&2
    exit 1
  fi

  mkdir -p "$target_dir"
  install -m 0644 "$generated" "$target_dir/$stem.pdf"
  rm -rf "$work_dir"
  trap - EXIT
  converted=$((converted + 1))
done < <(find "$source_dir" -type f \( -iname '*.hwp' -o -iname '*.hwpx' -o -iname '*.doc' -o -iname '*.docx' -o -iname '*.odt' -o -iname '*.ppt' -o -iname '*.pptx' -o -iname '*.odp' \) -print0)

echo "Generated $converted document preview PDF(s)."
