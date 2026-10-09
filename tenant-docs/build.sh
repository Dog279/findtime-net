#!/bin/sh
# Build the Tenant docs: every tenant-docs/src/**/*.md becomes
# public/tenant/docs/<area>/<page>/index.html, which Vite copies into dist/
# unchanged. Needs pandoc (brew install pandoc). Run from anywhere:
#   sh tenant-docs/build.sh
set -eu
HERE=$(cd "$(dirname "$0")" && pwd)         # .../tenant-docs
ROOT=$(cd "$HERE/.." && pwd)                 # the repository root
cd "$ROOT"
command -v pandoc >/dev/null 2>&1 || { echo "pandoc is required: brew install pandoc" >&2; exit 1; }
# Drop the output of pages that no longer exist (never a frozen vX.Y.Z copy).
for d in tenant-docs/src/*/; do rm -rf "public/tenant/docs/$(basename "$d")"; done
find tenant-docs/src -name '*.md' | sort | while read -r md; do
  rel=${md#tenant-docs/src/}; rel=${rel%.md}
  case "$rel" in
    index) out=public/tenant/docs/index.html; canon=/tenant/docs/ ;;
    *) out=public/tenant/docs/$rel/index.html; canon=/tenant/docs/$rel ;;
  esac
  mkdir -p "$(dirname "$out")"
  pandoc "$md" -o "$out" \
    -f markdown+pipe_tables+fenced_code_attributes+definition_lists-tex_math_dollars \
    -t html5 --standalone --template tenant-docs/template.html \
    --toc --toc-depth=2 --wrap=none --syntax-highlighting=pygments \
    -V canonical="$canon" -V sourcefile="$md"
  echo "$out"
done
