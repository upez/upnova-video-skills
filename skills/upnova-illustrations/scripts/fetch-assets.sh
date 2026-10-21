#!/usr/bin/env bash
# Copy every asset a template (or a list of asset paths) needs into a HyperFrames project.
#
#   fetch-assets.sh <project-dir> <what>...
#
# <what> can be:
#   - a template name, e.g. testimonial-bluecorn or captions (looked up in both Upnova skills)
#   - a template file path, e.g. compositions/brand-broll.html
#   - an asset path as the templates write it, e.g. assets/broll/leelo-active.mp4, or a folder
#     prefix, e.g. assets/logos/ or assets/fonts/
#   - an original source video, e.g. media/sources/stantt/testimonial-matt.mp4
#   - --all  (everything in assets.tsv)
#
# Each file lands at <project-dir>/<same path>. Files already in the project are left alone.
# Where a file comes from, in order:
#   1. this skill's own assets/ folder (fonts, backgrounds, brand logos, sounds: installed with the skill)
#   2. a local clone of the repo: $UPNOVA_VIDEO_SKILLS_REPO, or ~/Projects/upnova/upnova-video-skills
#   3. GitHub: media/<path> in upez/upnova-video-skills (private: needs `gh auth login`, or GITHUB_TOKEN)
set -euo pipefail

REPO_SLUG="upez/upnova-video-skills"
BRANCH="${UPNOVA_VIDEO_SKILLS_BRANCH:-main}"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"          # the upnova-illustrations skill
SKILLS_DIR="$(dirname "$HERE")"                                    # where both skills are installed
INDEX="$HERE/assets.tsv"

if [ $# -lt 2 ]; then
  sed -n '2,20p' "$0" | sed 's/^# \{0,1\}//'
  exit 1
fi
PROJECT="$1"; shift
[ -d "$PROJECT" ] || { echo "No such project folder: $PROJECT" >&2; exit 1; }

LOCAL_REPOS=()
[ -n "${UPNOVA_VIDEO_SKILLS_REPO:-}" ] && LOCAL_REPOS+=("$UPNOVA_VIDEO_SKILLS_REPO")
LOCAL_REPOS+=("$HOME/Projects/upnova/upnova-video-skills")

find_template() {
  local name="${1%.html}"
  for d in "$SKILLS_DIR/upnova-illustrations/templates" "$SKILLS_DIR/upnova-reels-video/templates" "$SKILLS_DIR/upnova-reels-video/templates/older"; do
    [ -f "$d/$name.html" ] && { echo "$d/$name.html"; return 0; }
  done
  return 1
}

# asset paths named in a template file (spaces may be written as %20)
refs_in_file() {
  grep -oE 'assets/[^"'"'"')]+' "$1" | sed 's/%20/ /g' | sort -u
}

# expand a path or prefix to the files listed in assets.tsv
expand() {
  local p="$1" hits
  hits="$(awk -F'\t' -v p="$p" '!/^#/ && (index($1, p) == 1) { print $1 }' "$INDEX")"
  if [ -n "$hits" ]; then echo "$hits"; else echo "MISSING:$p"; fi
}

download() {  # <repo path> <dest>
  local path="$1" dest="$2" enc
  enc="$(printf '%s' "$path" | sed 's/ /%20/g; s/@/%40/g')"
  if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
    gh api -H "Accept: application/vnd.github.raw" "repos/$REPO_SLUG/contents/$enc?ref=$BRANCH" > "$dest" 2>/dev/null && return 0
  fi
  local token="${GITHUB_TOKEN:-${GH_TOKEN:-}}"
  if [ -n "$token" ]; then
    curl -fsSL -H "Authorization: Bearer $token" -H "Accept: application/vnd.github.raw" \
      "https://api.github.com/repos/$REPO_SLUG/contents/$enc?ref=$BRANCH" -o "$dest" && return 0
  fi
  rm -f "$dest"
  return 1
}

fetch_one() {
  local p="$1" dest="$PROJECT/$1"
  if [ -f "$dest" ]; then echo "  have   $p"; return 0; fi
  mkdir -p "$(dirname "$dest")"
  if [ -f "$HERE/$p" ]; then cp "$HERE/$p" "$dest"; echo "  skill  $p"; return 0; fi
  for r in "${LOCAL_REPOS[@]}"; do
    if [ -f "$r/media/$p" ]; then cp "$r/media/$p" "$dest"; echo "  local  $p"; return 0; fi
  done
  if download "media/$p" "$dest"; then echo "  github $p"; return 0; fi
  echo "  FAILED $p (not in this skill, no local clone, and GitHub download failed: run 'gh auth login' with access to $REPO_SLUG)" >&2
  return 1
}

WANT=()
for w in "$@"; do
  if [ "$w" = "--all" ]; then
    while IFS= read -r l; do WANT+=("$l"); done < <(awk -F'\t' '!/^#/ { print $1 }' "$INDEX")
  elif [[ "$w" == assets/* || "$w" == sources/* || "$w" == media/* ]]; then
    WANT+=("${w#media/}")
  else
    f="$w"; [ -f "$f" ] || f="$(find_template "$w")" || { echo "No template or file called $w" >&2; exit 1; }
    while IFS= read -r l; do WANT+=("$l"); done < <(refs_in_file "$f")
  fi
done

fail=0
for w in "${WANT[@]}"; do
  while IFS= read -r p; do
    case "$p" in
      MISSING:*)
        p="${p#MISSING:}"
        case "$p" in
          assets/presenter-cutout-*) echo "  make   $p (cut out the speaker from this reel's own footage, see the reels skill §6)";;
          *) echo "  skip   $p (not a shared asset)";;
        esac;;
      *) fetch_one "$p" || fail=1;;
    esac
  done < <(expand "$w")
done
exit $fail
