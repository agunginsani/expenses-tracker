# CI/CD Implementation Research

## Decision: Use GitHub's Dependency Review Action for dependency changes

- **Decision**: Use `actions/dependency-review-action@v5` in a PR-only workflow. Set `fail-on-severity: high` and include runtime, development, and unknown scopes so high and critical newly introduced vulnerabilities block merging regardless of dependency scope.
- **Rationale**: The repository is public, and the action compares PR dependency changes against the default branch. Its severity threshold matches the agreed policy. Its documented default scope is runtime only, so the workflow must explicitly include development and unknown scopes.
- **Alternatives considered**: A full dependency audit on every CI run; this was not selected because the requested gate is focused on newly introduced risks in PRs and daily Dependabot already reports updates.
- **Primary source**: [actions/dependency-review-action](https://github.com/actions/dependency-review-action)
- **Repository check**: The repository's GitHub dependency graph currently returns an SBOM with 223 packages, so the review action has a populated graph to compare.

## Decision: Use Gitleaks Action for PR secret scanning

- **Decision**: Use `gitleaks/gitleaks-action@v3` for pull requests, with `GITHUB_TOKEN` and PR comments disabled. Use `actions/checkout@v6` in the security workflow as recommended for the v3 action runtime.
- **Rationale**: Gitleaks provides a dedicated GitHub Action for secret detection. Its v3 implementation scopes pull-request scans to the base-to-head commit range. Disabling comments avoids requiring write permission for a check whose outcome is already represented by the job status. The workflow is PR-scoped; it does not add a repository-history rewrite or scheduled full-history scan.
- **Alternatives considered**: GitHub-native secret scanning depends on repository settings and is not the selected workflow check; a full-history scan is out of scope.
- **Primary source**: [gitleaks/gitleaks-action](https://github.com/gitleaks/gitleaks-action)
