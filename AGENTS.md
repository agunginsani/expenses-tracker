# Project Guidelines

## Project Conventions

- Use Bun for scripts, tests, and project commands.
- Keep explicit `.js` extensions in TypeScript import specifiers.
- Keep expense validation and shared expense types in `src/schemas/expense.ts`.
- Use `APP_TIMEZONE` for date and time behavior; its default is `Asia/Jakarta`.

## Change Workflow

- Inspect the relevant code and tests before editing. Keep changes focused and
  preserve unrelated worktree changes.
- Add or update tests for changed behavior. Tests should use Bun mocks for
  external services rather than live credentials or API calls.
- Make requested local edits and run relevant checks without pausing for routine
  steps. Report checks that could not be run.
- Commit, push, deploy, or perform external side effects only when explicitly
  requested.

## Verification

- While iterating, run the tests relevant to the change and other targeted
  checks.
- Before a requested commit or push, run:
  `bun test && bun x tsc --noEmit && bun x biome check --write .`
- Use Biome's `--write` option for formatting and safe lint fixes. Do not use
  `// @ts-ignore` or `// biome-ignore` unless explicitly requested.

## Credentials

- Never print or commit credentials. Do not ask users to paste secrets into
  chat; ask them to configure required values locally instead.
- Keep local credentials in `.env`; use `.env.example` for variable names and
  placeholders.

## Agent skills

### Issue tracker

Issues and specs live in GitHub Issues; use the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Use the default labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, and `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

This is a single-context repo. See `docs/agents/domain.md`.
