#!/usr/bin/env bash
# Build the real Upnova widgets for videos.
#
#   widgets/live/build.sh                 (all of them)
#   widgets/live/build.sh free-gift-cart  (one)
#
# Clones (or updates) the private upez/widgets repo into ~/.cache/upnova-widgets-src (needs `gh auth login`
# with access to upez), installs it, builds each entry here (<name>.tsx) into one self-contained file with
# React, the component and its CSS, and puts it in ../../assets/widgets/free-gift/<name>.js, where the
# templates load it. Rebuild after the widgets change so the video shows the current widget.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
SKILL="$(cd "$HERE/../.." && pwd)"
SRC="${UPNOVA_WIDGETS_SRC:-$HOME/.cache/upnova-widgets-src}"
OUT="${OUTDIR:-$SKILL/assets/widgets/free-gift}"

if [ -d "$SRC/.git" ]; then git -C "$SRC" pull -q --ff-only; else git clone -q --depth 1 https://github.com/upez/widgets.git "$SRC"; fi
(cd "$SRC" && { command -v bun >/dev/null && bun install >/dev/null || npm install >/dev/null; })

rm -rf "$SRC/hf"; mkdir -p "$SRC/hf/out"
cp "$HERE"/*.tsx "$HERE"/*.ts "$SRC/hf/"

names=("$@")
if [ ${#names[@]} -eq 0 ]; then names=(); for f in "$HERE"/*.tsx; do names+=("$(basename "$f" .tsx)"); done; fi
mkdir -p "$OUT"
for name in "${names[@]}"; do
  (cd "$SRC" && ENTRY="$name.tsx" OUT="$name" npx vite build --config hf/vite.config.ts >/dev/null)
  css="$(ls "$SRC"/hf/dist/*.css | head -1)"
  { printf 'window.__UPNOVA_VIDEO_CSS__=%s;\n' "$(python3 -c 'import json,sys;print(json.dumps(open(sys.argv[1]).read()))' "$css")"; cat "$SRC/hf/dist/$name.js"; } > "$OUT/$name.js"
  echo "built $OUT/$name.js ($(wc -c < "$OUT/$name.js" | tr -d ' ') bytes, widgets $(git -C "$SRC" rev-parse --short HEAD))"
done
