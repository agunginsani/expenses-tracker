# CI Verification Workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a GitHub Actions workflow to automatically verify code quality on every PR and push to `main`.

**Architecture:** Create a new GitHub Actions YAML file that uses Bun to run linting, type-checking, and tests in a clean environment.

**Tech Stack:** GitHub Actions, Bun, Biome, TypeScript.

---

### Task 1: Workflow Implementation

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Create the CI workflow file**

Create `.github/workflows/ci.yml` with the following content:
```yaml
name: CI Verification

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v2

      - name: Install Dependencies
        run: bun install --frozen-lockfile

      - name: Lint & Format
        run: bun x biome check .

      - name: Type Check
        run: bun x tsc --noEmit

      - name: Run Tests
        run: bun test
```

- [ ] **Step 2: Commit the workflow**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add GitHub Actions workflow for automated verification"
```

- [ ] **Step 3: Push to trigger the workflow**

Run: `git push origin main`

---

### Task 2: Verification

- [ ] **Step 1: Verify on GitHub**
Go to the "Actions" tab of the repository on GitHub and verify that the "CI Verification" workflow has started and passes successfully.
