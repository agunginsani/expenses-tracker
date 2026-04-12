# Design Doc: Biome Integration

Integrate [Biome](https://biomejs.dev) into the project for unified linting and formatting.

## Problem
The project currently lacks any automated linting or formatting, leading to potential code quality inconsistencies and manual cleanup efforts.

## Goals
- Provide a single, fast tool for both linting and formatting.
- Establish a consistent code style across the codebase.
- Automate code quality checks via `package.json` scripts.

## Architecture

### 1. Tooling Choice
Use `@biomejs/biome` as the primary tool. It's a high-performance alternative to Prettier and ESLint, written in Rust, and fits well with the Bun-based setup of this project.

### 2. Configuration (`biome.json`)
Initialize a `biome.json` file at the root with default settings.

```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "organizeImports": {
    "enabled": true
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space"
  }
}
```

### 3. Script Integration (`package.json`)
Add the following scripts to `package.json`:
- `lint`: `biome lint .`
- `format`: `biome format . --write`
- `check`: `biome check --write .` (runs formatting, linting, and import organization)

## Implementation Plan

1.  **Dependency Addition:** Add `@biomejs/biome` to `devDependencies`.
2.  **Configuration Setup:** Create the `biome.json` file.
3.  **Script Update:** Update `package.json` with the new Biome scripts.
4.  **Initial Pass:** Run `bun run check` to format and lint existing files in the `src` directory.

## Testing Strategy
- Verify that `bun run check` completes successfully.
- Manually inspect a few files to ensure formatting (indentation, quotes) aligns with the default Biome style.
- Ensure that the project still builds and tests pass after the initial formatting pass.
