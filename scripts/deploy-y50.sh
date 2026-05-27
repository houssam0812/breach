#!/usr/bin/env bash

set -euo pipefail

SERVER="${SERVER:-houssam@y50.taile4b97d.ts.net}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_ed25519_personal}"
REMOTE_DIR="${REMOTE_DIR:-/home/houssam/breach}"
BRANCH="${BRANCH:-master}"
FRONTEND_PORT="${FRONTEND_PORT:-3002}"
BACKEND_PORT="${BACKEND_PORT:-4001}"
REMOTE_FORCE_SYNC="${REMOTE_FORCE_SYNC:-1}"

if [[ ! -f "$SSH_KEY" ]]; then
  echo "SSH key not found: $SSH_KEY" >&2
  exit 1
fi

if [[ -z "${SKIP_LOCAL_STATUS:-}" ]]; then
  git fetch --quiet origin "$BRANCH"

  read -r ahead behind < <(git rev-list --left-right --count "HEAD...origin/$BRANCH")

  if (( ahead > 0 )); then
    echo "Local branch has $ahead unpushed commit(s) relative to origin/$BRANCH." >&2
    echo "Push first, or rerun with SKIP_LOCAL_STATUS=1 if you intentionally want to deploy the current remote branch instead." >&2
    exit 1
  fi

  if [[ -n "$(git status --short)" ]]; then
    echo "Warning: local working tree has uncommitted changes." >&2
    echo "This script deploys origin/$BRANCH on the server, so local uncommitted edits will not be included." >&2
  fi

  if (( behind > 0 )); then
    echo "Warning: local branch is behind origin/$BRANCH by $behind commit(s)." >&2
    echo "The server will deploy the newer remote branch state." >&2
  fi
fi

ssh -i "$SSH_KEY" "$SERVER" "
  set -euo pipefail
  cd '$REMOTE_DIR'
  git fetch origin '$BRANCH'

  if [[ '$REMOTE_FORCE_SYNC' == '1' ]]; then
    # Keep deploy directory deterministic: no local drift, no merge conflicts.
    git checkout '$BRANCH'
    git reset --hard 'origin/$BRANCH'
    git clean -fd -e .env -e .env.local -e .env.production
  else
    git pull --ff-only origin '$BRANCH'
  fi

  FRONTEND_PORT='$FRONTEND_PORT' BACKEND_PORT='$BACKEND_PORT' docker compose up -d --build --remove-orphans
  docker compose ps
"