#!/bin/sh
# Build the Tenant docs: every _src/**/*.md becomes the matching .html next to
# docs.css. Needs pandoc (brew install pandoc). Run from anywhere:
#   sh tenant/docs/_src/build.sh
set -eu
SRC=$(cd "$(dirname "$0")" && pwd)          # .../tenant/docs/_src
ROOT=$(cd "$SRC/../../.." && pwd)           # the repository root
cd "$ROOT"
command -v pandoc >/dev/null 2>&1 || { echo "pandoc is required: brew install pandoc" >&2; exit 1; }
find tenant/docs/_src -name '*.md' | sort | while read -r md; do
  out=$(printf '%s' "$md" | sed 's#/_src/#/#; s#\.md$#.html#')
  canon=$(printf '%s' "$out" | sed 's#^tenant#/tenant#; s#\.html$##; s#/index$#/#')
  mkdir -p "$(dirname "$out")"
  pandoc "$md" -o "$out" \
    -f markdown+pipe_tables+fenced_code_attributes+definition_lists-tex_math_dollars \
    -t html5 --standalone --template tenant/docs/_src/template.html \
    --toc --toc-depth=2 --wrap=none --syntax-highlighting=pygments \
    -V canonical="$canon" -V sourcefile="$md"
  echo "$out"
done
