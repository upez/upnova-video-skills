#!/usr/bin/env bash
# check-update.sh — make sure the installed upnova-video-skills are the newest from git.
# Run by the agent BEFORE following any skill from this repo. Fast path: does nothing
# if it already checked within the last 4 hours. Silent on success; only prints on change
# or failure (a failure must never block the edit: it prints a warning and exits 0).
set -u

STAMP_DIR="${TMPDIR:-/tmp}"
STAMP="$STAMP_DIR/upnova-video-skills-update-check"
MAX_AGE=$((4 * 3600))   # re-check at most every 4 hours

now=$(date +%s)
if [ -f "$STAMP" ]; then
  last=$(cat "$STAMP" 2>/dev/null || echo 0)
  age=$(( now - last ))
  if [ "$age" -lt "$MAX_AGE" ]; then
    exit 0
  fi
fi

# Where are the skills installed? Walk up from this script: <install>/upnova-video-skills... no,
# this script may be run from a repo clone. Prefer the installed copies.
CANDIDATES=(
  "$HOME/.claude/skills"
  "$HOME/.hermes/skills"
  "./.claude/skills"
  "./.agents/skills"
)

INSTALL_DIR=""
for d in "${CANDIDATES[@]}"; do
  if [ -d "$d/upnova-reels-video" ]; then
    INSTALL_DIR="$d"
    break
  fi
done

REPO="upez/upnova-video-skills"

# Is there anything new on the remote? (1 network call, ~300 ms)
remote_head=$(git ls-remote "https://github.com/$REPO.git" HEAD 2>/dev/null | awk '{print $1}')
if [ -z "$remote_head" ]; then
  # offline or no gh access: don't nag, just skip
  echo "$now" > "$STAMP"
  exit 0
fi

LOCAL_HEAD_FILE=""
if [ -n "$INSTALL_DIR" ]; then
  LOCAL_HEAD_FILE="$INSTALL_DIR/.upnova-video-skills-head"
fi

local_head=""
[ -n "$LOCAL_HEAD_FILE" ] && [ -f "$LOCAL_HEAD_FILE" ] && local_head=$(cat "$LOCAL_HEAD_FILE")

if [ "$remote_head" = "$local_head" ]; then
  echo "$now" > "$STAMP"
  exit 0
fi

# New version available: update the installed skills.
echo "New upnova-video-skills version available — updating..."
if command -v npx >/dev/null 2>&1; then
  if npx -y skills add "$REPO" >/dev/null 2>&1; then
    echo "Updated to ${remote_head:0:7}."
    [ -n "$LOCAL_HEAD_FILE" ] && echo "$remote_head" > "$LOCAL_HEAD_FILE"
  else
    echo "WARNING: update failed (npx skills add $REPO). Continuing with the installed version."
  fi
else
  echo "WARNING: npx not found, cannot update skills. Continuing with the installed version."
fi

echo "$now" > "$STAMP"
exit 0
