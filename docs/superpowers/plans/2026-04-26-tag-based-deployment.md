# Tag-Based Production Deployments Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a GitHub Action to trigger Vercel production deployments only when a GitHub **release** is published.

**Architecture:** Create a GitHub workflow that uses the Vercel CLI for building and deploying, ensuring quality checks pass first.

**Tech Stack:** GitHub Actions, Vercel CLI, Bun.

---

### Task 1: Create GitHub Deployment Workflow

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Create the workflow directory**
  Run: `mkdir -p .github/workflows`

- [ ] **Step 2: Write the deployment workflow**
```yaml
name: Vercel Production Deployment
env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
on:
  release:
    types: [published]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - name: Install dependencies
        run: bun install
      - name: Run verification
        run: |
          bun test
          bun x tsc --noEmit
          bun x biome check .
      - name: Install Vercel CLI
        run: bun add -g vercel
      - name: Pull Vercel Environment Information
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
      - name: Build Project Artifacts
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
      - name: Deploy Project Artifacts to Vercel
        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
```

- [ ] **Step 3: Commit**
```bash
git add .github/workflows/deploy.yml
git commit -m "chore: add tag-based deployment workflow"
```

---

### Task 2: Configure Vercel Build Filter

**Files:**
- Create: `scripts/vercel-ignore-build.sh`
- Modify: `vercel.json`

- [ ] **Step 1: Create the ignore script**
Create `scripts/vercel-ignore-build.sh`:
```bash
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
```

- [ ] **Step 2: Make script executable**
Run: `chmod +x scripts/vercel-ignore-build.sh`

- [ ] **Step 3: Configure vercel.json**
Add the `ignoreCommand` to `vercel.json`:
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "bunVersion": "1.x",
  "ignoreCommand": "bash scripts/vercel-ignore-build.sh"
}
```

- [ ] **Step 4: Commit cleanup**
```bash
git add vercel.json scripts/vercel-ignore-build.sh
git commit -m "chore: configure ignoreCommand in vercel.json and script"
```

---

### Task 3: Final Verification and Secrets Setup

- [ ] **Step 1: Document secret requirements**
Ensure the user knows they need to add `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` to GitHub Secrets.

- [ ] **Step 2: Push changes**
Run: `git push`
