#!/usr/bin/env bash
repo_dir=$(cd "$(dirname "${BASH_SOURCE:-$0}")" || exit;pwd)
cd "${repo_dir}" || exit
npm run build
repo_diff=$(git diff .)
if [ -z "${repo_diff}" ]; then
  echo "No change"
  exit
fi
git status
echo "👽 Enter the git commit message:"
read -r
commit_message="$REPLY"
git commit -a -m "${commit_message}"
git push
