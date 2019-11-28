#!/usr/bin/env bash
repo_dir=$(cd "$(dirname "${BASH_SOURCE:-$0}")" || exit;pwd)
cd "${repo_dir}" || exit
npm run build
if [[ -z "$(git status -s)" ]]; then
  echo "No change"
  exit
fi
git status
echo "👽 Enter the git commit message:"
read -r
commit_message="$REPLY"
git add .
git commit -m "${commit_message}"
git push
