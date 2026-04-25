# Project Rules & Guidelines

## Biome & TypeScript Zero-Warning Policy
We maintain a clean, high-quality codebase. A Husky pre-push hook is in place to enforce these rules.

- **Proactive Verification**: Before committing or pushing, you MUST run:
  ```bash
  bun test && bun x tsc --noEmit && bun x biome check --write .
  ```
- **Biome Auto-Fixing**: Always use the \`--write\` flag with Biome to fix formatting and safe linting issues.
- **No Suppressions**: Never use \`// @ts-ignore\` or \`// biome-ignore\` unless explicitly instructed by the human partner.
