# Design Spec: CI Verification Workflow

Automate code quality checks on every Pull Request and push to the main branch to ensure stability and prevent regressions.

## 1. Requirements

- **Triggers:**
  - Every `pull_request` targetting `main`.
  - Every `push` to the `main` branch.
- **Verification Steps:**
  - Install dependencies using Bun.
  - Run linting and formatting checks (Biome).
  - Run TypeScript type checking.
  - Run all unit tests.
- **Performance:** Utilize Bun for fast execution.
- **Environment:** No real secrets required as tests are properly mocked.

## 2. Technical Design

### Workflow Configuration (`.github/workflows/ci.yml`)

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

### Dependency Management
The `bun install --frozen-lockfile` command ensures that the CI environment uses the exact versions specified in `bun.lockb`.

## 3. Implementation Plan Summary

- Create the `.github/workflows/ci.yml` file.
- Verify the workflow syntax.
- Test the workflow by pushing to a branch or creating a mock PR.

## 4. Verification

- Push the new workflow file.
- Observe the GitHub Actions tab to ensure the "CI Verification" workflow triggers and passes.
