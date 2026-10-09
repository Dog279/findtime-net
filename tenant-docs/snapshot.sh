#!/bin/sh
# Freeze the current docs as the documentation of one Tenant release, so the
# version menu can go back to it:
#   sh tenant-docs/build.sh && sh tenant-docs/snapshot.sh v0.2.0
# Run it when the release is tagged. /tenant/docs/ (Latest) keeps tracking
# Tenant's main branch; /tenant/docs/v0.2.0/ never changes again.
set -eu
V=${1:?usage: snapshot.sh vX.Y.Z}
case "$V" in v[0-9]*) ;; *) echo "snapshot.sh: the version must look like v0.2.0" >&2; exit 1 ;; esac
ROOT=$(cd "$(dirname "$0")/.." && pwd)
DOCS="$ROOT/public/tenant/docs"
cd "$DOCS"
[ -e "$V" ] && { echo "snapshot.sh: $V already exists; remove it first to take it again" >&2; exit 1; }
mkdir "$V"
for f in *; do
  case "$f" in v[0-9]*|versions.js) ;; *) cp -R "$f" "$V/" ;; esac
done
# Links inside the copy stay inside the copy (the sidebar, breadcrumbs, cross
# references, the stylesheet). Only href/src attributes are rewritten: the
# page's script keeps its paths, so "Latest" and the banner still lead out of
# the copy, and the canonical URL keeps pointing at the latest page. The
# version list stays the shared one.
find "$V" -name '*.html' | while read -r f; do
  sed -e "s#href=\"/tenant/docs/#href=\"/tenant/docs/$V/#g" \
      -e "s#src=\"/tenant/docs/#src=\"/tenant/docs/$V/#g" \
      -e "s#src=\"/tenant/docs/$V/versions.js#src=\"/tenant/docs/versions.js#g" "$f" > "$f.tmp"
  mv "$f.tmp" "$f"
done
# versions.js lists every snapshot, newest first.
existing=$(sed -n 's/^window\.TENANT_DOCS_VERSIONS = \[\(.*\)\];$/\1/p' versions.js)
if [ -n "$existing" ]; then list="\"$V\",$existing"; else list="\"$V\""; fi
printf 'window.TENANT_DOCS_VERSIONS = [%s];\n' "$list" > versions.js
echo "snapshot $V: $(find "$V" -name '*.html' | wc -l | tr -d ' ') pages; versions.js: [$list]"
