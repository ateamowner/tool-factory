#!/usr/bin/env bash
# Enable GitHub Pages "Enforce HTTPS" for ateamkit.com.
# Official update method is PUT (PATCH is not a valid method on this endpoint).
# Requires repo admin: pages=write + administration=write.
set -euo pipefail

REPO="${PAGES_REPO:-ateamowner/tool-factory}"

echo "Before:"
gh api "repos/${REPO}/pages"

echo "Enabling https_enforced via PUT /repos/${REPO}/pages ..."
gh api --method PUT "repos/${REPO}/pages" \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  --input - <<'EOF'
{"https_enforced": true}
EOF

echo "After:"
gh api "repos/${REPO}/pages"
