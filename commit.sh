#!/bin/bash
set -e

# Error handling: catch any error and show a message
trap 'echo "❌ An error occurred on line $LINENO. Exiting..."; exit 1;' ERR

# 1. Get version and message from arguments
VERSION="$1"
MESSAGE="$2"

# 2. Validate input
if [ -z "$VERSION" ]; then
  echo "❌ Error: Please provide a version (e.g., ./version_release.sh 1.2.3 \"your message\")"
  exit 1
fi

# Check if version format is correct
if ! [[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "❌ Error: Version must be in format major.minor.patch (e.g. 1.2.3)"
  exit 1
fi

if [ -z "$MESSAGE" ]; then
  MESSAGE="release: v$VERSION"
fi

# 3. Inject version into deno.json and .d.ts files
echo "✍️ Injecting version into .d.ts files..."
deno run --allow-read --allow-write version.js "$VERSION"

# 4. Git commit and push
echo "📦 Committing and pushing changes..."
git add .
git commit -m "$MESSAGE"
git push

echo "✅ Done! Version $VERSION released with commit message:"
echo "   \"$MESSAGE\""
