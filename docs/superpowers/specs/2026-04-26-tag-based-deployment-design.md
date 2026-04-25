# Design Spec: Tag-Based Production Deployments

Transition the project from automatic branch-based deployments to explicit version-controlled deployments triggered by Git tags.

## Goals
- Disable automatic deployments on pushes to the `main` branch.
- Trigger production deployments only when a tag matching `v*.*.*` (e.g., `v1.0.0`) is pushed.
- Ensure all quality gates (tests, types) pass before deployment starts.

## Architecture

### 1. GitHub Action (`.github/workflows/deploy.yml`)
A new workflow will handle the deployment logic:
- **Trigger**: 
  ```yaml
  on:
    push:
      tags:
        - 'v*.*.*'
  ```
- **Steps**:
    1. **Setup**: Checkout repository, install Bun.
    2. **Verify**: Run `bun test` and `bun x tsc --noEmit`.
    3. **Build**: Use `vercel build --prod` to generate a production build.
    4. **Deploy**: Use `vercel deploy --prebuilt --prod` to push the build to Vercel.

### 2. Vercel Configuration
To prevent Vercel's automatic integration from deploying `main`, the user must:
1. Go to **Vercel Dashboard > Project Settings > Git**.
2. Under **Ignored Build Step**, add a command or disable the "Production Branch" deployment behavior.
   - *Recommendation*: Use `git-branch-check.sh` logic to only allow builds if the environment is production AND triggered by a tag.

### 3. Required Secrets (GitHub)
The following secrets must be added to the GitHub repository:
- `VERCEL_TOKEN`: Personal Access Token from Vercel.
- `VERCEL_ORG_ID`: Found in Vercel project's `.vercel/project.json` or dashboard.
- `VERCEL_PROJECT_ID`: Found in Vercel project's `.vercel/project.json` or dashboard.

## Implementation Plan (Summary)
1. Create the `.github/workflows/deploy.yml` file.
2. Provide instructions for retrieving and setting up Vercel secrets.
3. Provide instructions for disabling automatic Vercel deploys.

## Testing Plan
1. Push a change to `main` (no tag) -> Verify NO deployment occurs.
2. Create and push a new tag `v1.0.1` -> Verify GitHub Action triggers, runs tests, and completes deployment.
