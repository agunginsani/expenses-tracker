#!/bin/bash
# Vercel Ignore Build Step
# Returns 0 to SKIP build, 1 to PROCEED with build.

echo "Checking deployment for: $VERCEL_GIT_COMMIT_REF"

# Block automatic production builds for the main branch.
# We only want builds triggered by our GitHub Action (which use 'vercel build') 
# or manual CLI deployments.
if [[ "$VERCEL_GIT_COMMIT_REF" == "main" && "$VERCEL_ENV" == "production" ]]; then
  echo "🛑 Blocking automatic production build for main branch. Use tags for deployment."
  exit 0; 
fi

echo "✅ Proceeding with build."
exit 1;
