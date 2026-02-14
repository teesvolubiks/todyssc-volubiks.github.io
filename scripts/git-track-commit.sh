#!/usr/bin/env bash
set -euo pipefail

# Usage: git-track-commit.sh [commit-message] [remote] [main-branch]
# Example: ./scripts/git-track-commit.sh "Fix product display" origin main

MSG=${1:-"Update: $(date -u +"%Y-%m-%d %H:%M:%S UTC")"}
REMOTE=${2:-origin}
MAIN=${3:-main}

echo "[git-track] Starting: commit changes, rebase onto ${MAIN}, push to ${REMOTE}"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Not a git repository. Aborting." >&2
  exit 1
fi

CUR_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "[git-track] Current branch: ${CUR_BRANCH}"

echo "[git-track] Staging all changes..."
git add -A

if git diff --cached --quiet; then
  echo "[git-track] No changes to commit."
else
  echo "[git-track] Committing: ${MSG}"
  git commit -m "${MSG}"
fi

echo "[git-track] Fetching from ${REMOTE}..."
git fetch "${REMOTE}"

# Ensure main branch exists locally; create if not
if ! git show-ref --verify --quiet refs/heads/${MAIN}; then
  if git ls-remote --exit-code --heads "${REMOTE}" "${MAIN}" >/dev/null 2>&1; then
    echo "[git-track] Creating local ${MAIN} from ${REMOTE}/${MAIN}"
    git checkout -b "${MAIN}" "${REMOTE}/${MAIN}"
  else
    echo "[git-track] Remote ${MAIN} not found; skipping rebase." 
    git checkout "${CUR_BRANCH}"
    echo "[git-track] Pushing branch ${CUR_BRANCH} to ${REMOTE}..."
    git push --set-upstream "${REMOTE}" "${CUR_BRANCH}"
    echo "[git-track] Done."
    exit 0
  fi
fi

echo "[git-track] Updating ${MAIN} from ${REMOTE}/${MAIN}"
git checkout "${MAIN}"
git pull "${REMOTE}" "${MAIN}" --ff-only

echo "[git-track] Switching back to ${CUR_BRANCH}"
git checkout "${CUR_BRANCH}"

echo "[git-track] Rebasing ${CUR_BRANCH} onto ${MAIN}"
if git rebase "${MAIN}"; then
  echo "[git-track] Rebase successful"
else
  echo "[git-track] Rebase failed — aborting and leaving branch for manual fix" >&2
  git rebase --abort || true
  exit 1
fi

echo "[git-track] Pushing ${CUR_BRANCH} to ${REMOTE} (setting upstream)"
git push --set-upstream "${REMOTE}" "${CUR_BRANCH}"

echo "[git-track] Done."
