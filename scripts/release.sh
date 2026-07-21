#!/usr/bin/env bash
#
# Release script. Bumps version, runs verify, builds, tags, publishes.
# Per the framework GOVERNANCE, releases require:
# 1. All tests pass
# 2. The user has signed off (via the product owner role)
# 3. The CHANGELOG entry exists
# 4. A git tag is created
# 5. The package is published to npm
#
# Usage:
#   ./scripts/release.sh patch    # 0.1.0 -> 0.1.1
#   ./scripts/release.sh minor    # 0.1.0 -> 0.2.0
#   ./scripts/release.sh major    # 0.1.0 -> 1.0.0
#   ./scripts/release.sh 0.2.0    # specific version

set -euo pipefail

VERSION_TYPE="${1:-}"

if [ -z "$VERSION_TYPE" ]; then
  echo "Usage: $0 <patch|minor|major|X.Y.Z>"
  exit 1
fi

# Get current version
CURRENT=$(node -p "require("./package.json").version")
echo "Current version: $CURRENT"

# Bump
case "$VERSION_TYPE" in
  patch|minor|major)
    NEW=$(npm version "$VERSION_TYPE" --no-git-tag-version 2>/dev/null | sed "s/^v//")
    ;;
  [0-9]*.[0-9]*.[0-9]*)
    NEW="$VERSION_TYPE"
    npm version "$NEW" --no-git-tag-version 2>/dev/null
    ;;
  *)
    echo "Unknown version type: $VERSION_TYPE"
    exit 1
    ;;
esac

echo "New version: $NEW"

# Verify
echo ""
echo "=== Running verify ==="
npm run verify

# Build
echo ""
echo "=== Building ==="
npm run build

# Tag
echo ""
echo "=== Tagging ==="
git tag "v$NEW"
git push origin "v$NEW"

# Publish
echo ""
echo "=== Publishing ==="
echo "About to publish ai-sdlc-framework@$NEW to npm."
echo "Press Enter to continue, Ctrl-C to abort."
read -r
npm publish --access public

echo ""
echo "=== Release complete ==="
echo "Version $NEW published."
echo "GitHub release: https://github.com/travellayover/ai-sdlc-framework/releases/tag/v$NEW"
