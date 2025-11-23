#!/bin/sh
#
# Pre-commit hook to automatically optimize images before commit
# Place this in .git/hooks/pre-commit and make it executable
#
# Install (run from project root):
#   chmod +x scripts/pre-commit.sh
#   cp scripts/pre-commit.sh .git/hooks/pre-commit
#

set -e

echo "🖼️  Running image optimization pre-commit hook..."

# Get list of staged image files
STAGED_IMAGES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(jpg|jpeg|png)$' || true)

if [ -n "$STAGED_IMAGES" ]; then
  echo "📸 New/modified images detected:"
  echo "$STAGED_IMAGES"
  
  # Run image optimization
  npm run optimize-images
  
  # Add optimized images to staging
  git add src/assets/images/optimized/
  
  echo "✅ Images optimized and staged"
else
  echo "ℹ️  No image changes in this commit"
fi

# Check for TypeScript/linting errors
echo "🔍 Checking for TypeScript errors..."
npm run ng -- build --configuration development --aot 2>&1 | grep -E "(error TS|Error:)" || true

exit 0
