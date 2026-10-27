# Implementation Plan: CI/CD Verification and Release Safety

**Date**: 2026-10-26 | **Spec**: https://github.com/agunginsani/expenses-tracker/issues/42

## Summary

Standardize and enforce PR verification and security checks, then add a side-effect-free production health check to the existing GitHub Release → Vercel Production flow. Preserve current Codecov thresholds and release behavior. Measure the existing CI runtime before making low-risk performance changes.

## Technical Context

**Language/Version**: TypeScript 6, Bun 1.x
**Primary Dependencies**: GitHub Actions, Biome 2, Bun test, Codecov, Vercel CLI, Dependency Review Action v5, Gitleaks Action v3
**Storage**: No persistence changes; runtime Google Sheets integration is out of scope
**Testing**: Bun tests, `tsc --noEmit`, Biome checks, GitHub Actions workflow checks, and an HTTP health probe
**Target Platform**: GitHub Actions on Ubuntu and Vercel serverless functions
**Performance Goals**: Establish the current baseline (approximately 8–18 seconds per recent CI run), then retain only safe caching/concurrency changes that improve observed feedback. No hard duration SLA.
**Constraints**: Preserve application behavior; use Bun; CI checks must not modify files; keep dependency installation frozen; do not expose secrets; do not call Telegram/Gemini/Google Sheets from health checks; maintain Codecov upload and the 1% project/patch thresholds.

## Constitution Check

No standalone `constitution.md` exists. Per the user's approval, use the project rules in `AGENTS.md` as the governing constraints:

| Project principle | Plan alignment |
| --- | --- |
| Use Bun for scripts, tests, and project commands | Pass — scripts and CI use Bun. |
| Keep TypeScript imports with explicit `.js` extensions | Pass — health endpoint test and implementation follow existing convention. |
| Add/update tests for changed behavior; mock external services | Pass — health endpoint tests do not call external integrations. |
| Preserve user data and avoid live credentials in tests | Pass — health check is isolated from bot integrations. |
| Do not perform external side effects without authorization | Pass — the user explicitly approved branch-rule enforcement and Actions configuration. |
| Never expose or commit credentials | Pass — `VERCEL_PRODUCTION_URL` is public; existing tokens remain GitHub secrets. |

## Applied Guidelines

No migration/transformation guideline applies. Follow the repository's `AGENTS.md` conventions and existing GitHub Actions/Bun patterns.

## Implementation Steps

### Step 1: [Shared verification] Add one non-mutating verification command
- **Requirements**: REQ-001, REQ-002, REQ-008
- **Design inputs**: Feature spec issue #42; `AGENTS.md`; current `package.json` and workflows
- **Plan item 1.1**: Add package scripts for TypeScript checking and non-mutating Biome validation, include Vercel API routes in type-checking, ignore generated coverage output, then compose them with the existing coverage-generating test script into one `verify` command.
- **Plan item 1.2**: Use the command from both PR CI and release validation. Keep Codecov upload as an explicit workflow step, preserve the existing 1% thresholds, and use frozen installation in both workflows.

### Step 2: [PR security gates] Scan dependency changes and secrets
- **Requirements**: REQ-003, REQ-004
- **Design inputs**: Feature spec issue #42; current Dependabot configuration; public GitHub repository
- **Plan item 2.1**: Add PR checks that fail for newly introduced high/critical dependency vulnerabilities across runtime, development, and unknown dependency scopes, and detected secrets. Preserve daily Dependabot updates. Use Dependency Review Action v5 and Gitleaks Action v3 with least-privilege permissions and stable job names.

### Step 3: [Merge enforcement] Require the selected checks on `main`
- **Requirements**: REQ-005
- **Design inputs**: Feature spec issue #42; PR and security workflow job names
- **Plan item 3.1**: Configure `main` branch protection to require the `verify`, `dependency-review`, and `secret-scan` status checks. Verify the configured check names against GitHub Actions. Do not add review-count or direct-push policies that the user did not request.

### Step 4: [Health endpoint] Add an isolated health response
- **Requirements**: REQ-006
- **Design inputs**: Feature spec issue #42; current Vercel API route structure
- **Plan item 4.1**: Add a side-effect-free GET health endpoint that does not import the Telegram bot or initialize any external service. Test success and unsupported methods with Bun without real credentials or API calls.

### Step 5: [Release health check] Verify production after deployment
- **Requirements**: REQ-007, REQ-008
- **Design inputs**: Feature spec issue #42 and its URL-source decision; current release-triggered Vercel workflow
- **Plan item 5.1**: After Vercel Production deployment succeeds, request `/api/health` using the public `VERCEL_PRODUCTION_URL` Actions variable. Fail the deployment workflow if the variable is missing or the endpoint is unhealthy. Keep rollback manual and keep production release-triggered.

### Step 6: [Contributor documentation] Document the new checks and configuration
- **Requirements**: REQ-001, REQ-002, REQ-003, REQ-004, REQ-005, REQ-007, REQ-008
- **Design inputs**: Feature spec issue #42; existing README deployment and development instructions
- **Plan item 6.1**: Update README guidance for verification, required checks, the health endpoint, the `VERCEL_PRODUCTION_URL` Actions variable, and existing deployment secrets. Make clear that the URL is public and must be configured by a repository maintainer.

### Step 7: [Feedback speed] Measure and apply safe workflow optimizations
- **Requirements**: REQ-009
- **Design inputs**: Recent Actions run durations and the resulting CI workflow
- **Plan item 7.1**: Compare the post-change runtime with the observed 8–18-second baseline. Apply only justified low-risk optimizations, such as canceling superseded PR runs or caching Bun's install cache. Keep optimizations only when measured results improve or avoid wasted runs; do not impose a time SLA.

### Step 8: [Cross-cutting] Validate the full CI/CD contract
- **Requirements**: REQ-001 through REQ-009
- **Design inputs**: Completed implementation steps
- **Plan item 8.1**: Run the full project verification command, validate workflow syntax and job names, verify branch protection, test the endpoint, and confirm release workflow ordering and failure behavior. Report any external configuration that still requires a maintainer action.

## Project Structure

```text
.github/
  workflows/
    ci.yml
    deploy.yml
    security.yml
  modernize/
    ci-cd-improvements/
      plan.md
      research.md
      tasks.json
      checkpoints/
        spec-to-plan.yaml
        plan-to-tasks.yaml
api/
  health.ts
  health.test.ts
package.json
README.md
```

## User Stories

- **US1 — Shared verification and coverage**: REQ-001, REQ-002, REQ-008
- **US2 — PR security and merge enforcement**: REQ-003, REQ-004, REQ-005
- **US3 — Safe production health verification**: REQ-006, REQ-007, REQ-008
- **US4 — Measured CI feedback improvements**: REQ-009

## Task Breakdown

### Phase 1: Shared verification (US1)

- [x] T001 [US1] [Plan:1.1] Add `typecheck`, non-mutating Biome check, and shared `verify` scripts in `package.json`; include `api/**/*.ts` in `tsconfig.json`, ignore generated `coverage/` output, and preserve coverage generation.
- [x] T002 [US1] [Plan:1.1,1.2] Update `.github/workflows/ci.yml` and `.github/workflows/deploy.yml` to use the shared verification command, frozen installs, and the existing required Codecov upload.

### Phase 2: PR security and merge enforcement (US2)

- [x] T003 [US2] [Plan:2.1] Add `.github/workflows/security.yml` using Dependency Review Action v5 and Gitleaks Action v3; block newly introduced high/critical findings across dependency scopes and detected secrets on PRs.
- [x] T004 [US2] [Plan:3.1] Configure GitHub `main` branch protection to require `verify`, `dependency-review`, and `secret-scan` status checks; confirm the rule through the GitHub API.

### Phase 3: Production health verification (US3)

- [x] T005 [US3] [Plan:4.1] Add Bun tests in `api/health.test.ts` for the side-effect-free health response and unsupported methods, then implement `api/health.ts` without importing runtime integrations.
- [x] T006 [US3] [Plan:5.1] Update `.github/workflows/deploy.yml` to probe `${VERCEL_PRODUCTION_URL}/api/health` after production deployment and fail clearly when the variable is unset or the probe is unhealthy.
- [x] T007 [US3] [Plan:6.1] Update `README.md` with verification commands, required PR checks, deployment health-check behavior, and the `VERCEL_PRODUCTION_URL` Actions variable.

### Phase 4: Feedback and final validation (US4)

- [ ] T008 [US4] [Plan:7.1] Measure CI duration before and after the changes; add only beneficial safe caching or superseded-run cancellation, without a fixed runtime target.
- [ ] T009 [Plan:8.1] Run project verification and workflow validation; verify required status checks and release health-check ordering/failure behavior, then record any maintainer-only configuration still needed.

## Testing Strategy

- **appType**: Messaging bot with a Vercel HTTP webhook.
- **Critical user journeys**:
  1. A pull request receives passing/failing verification and security checks.
  2. A high/critical newly introduced dependency vulnerability fails dependency review.
  3. A detected secret fails the PR secret scan.
  4. A published release deploys to production and then passes the health probe.
  5. An absent or unhealthy production endpoint causes the deployment workflow to fail.
- **primaryValidationStack**: Bun test, TypeScript compiler, Biome, GitHub Actions, Codecov, and an HTTP probe to the deployed health endpoint.
- **Environment requirements**: Bun 1.x; GitHub Actions permission to configure branch protection; existing `CODECOV_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, and `VERCEL_TOKEN` secrets; public `VERCEL_PRODUCTION_URL` Actions variable. No production Telegram/Gemini/Sheets credentials are needed for tests.
- **knownGaps**: The health probe verifies function availability, not Telegram/Gemini/Google Sheets integration health. Dependency review covers PR dependency changes. Secret scanning in this scope does not rewrite or rescan the entire Git history.
- **Test data strategy**: No external test data; health handler tests use local request/response doubles.
- **Acceptance criteria**: All required checks run on PRs targeting `main`; failing security/verification checks block merging; release deploy occurs only on published release; health check runs after deploy and fails on missing URL/non-2xx; existing Codecov thresholds remain; no check step writes to source files.
- **Validation review expectations**: Confirm exact GitHub status names, no production credentials reach PR workflows, health endpoint has no bot side effects, and README setup steps match the workflow.

## Requirement Mapping

| REQ ID | Description | Plan Items | Implementation Evidence |
| --- | --- | --- | --- |
| REQ-001 | Shared non-mutating verification | 1.1, 1.2 | `package.json`, `tsconfig.json`, `.gitignore`, `.github/workflows/ci.yml`, `.github/workflows/deploy.yml` |
| REQ-002 | Required Codecov upload and current thresholds | 1.1, 1.2 | `.gitignore`, `.github/workflows/ci.yml`, `.github/workflows/deploy.yml`, `codecov.yml` |
| REQ-003 | Block new high/critical dependency risks; retain Dependabot | 2.1 | `.github/workflows/security.yml`, `.github/dependabot.yml` |
| REQ-004 | Block detected secrets on PRs | 2.1 | `.github/workflows/security.yml` |
| REQ-005 | Require selected checks on `main` | 3.1 | GitHub branch protection and workflow job names |
| REQ-006 | Side-effect-free health endpoint and isolated test | 4.1 | `api/health.ts`, `api/health.test.ts` |
| REQ-007 | Post-deploy health check fails workflow when unhealthy | 5.1 | `.github/workflows/deploy.yml`, `README.md` |
| REQ-008 | Keep direct release-triggered production deployment | 1.2, 5.1 | `.github/workflows/deploy.yml`, `README.md` |
| REQ-009 | Measure and safely improve feedback speed | 7.1 | `.github/workflows/ci.yml`, Actions run-duration comparison |

## Complexity Tracking

No constitution violations or extra architectural layers are proposed.
