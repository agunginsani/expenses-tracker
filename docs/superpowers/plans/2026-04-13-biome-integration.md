# Biome Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate Biome for unified linting and formatting.

**Architecture:** Install `@biomejs/biome`, configure it with `biome.json`, and add scripts to `package.json` for easy usage.

**Tech Stack:** Bun.js, Biome.

---

### Task 1: Initialize Biome

**Files:**
- Modify: `package.json`
- Create: `biome.json`

- [ ] **Step 1: Install Biome**

Run: `bun add -d @biomejs/biome`

- [ ] **Step 2: Initialize Biome configuration**

Create `biome.json` in the root directory:
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
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 80
  }
}
```

- [ ] **Step 3: Update `package.json` with scripts**

Modify `package.json` to include Biome scripts:
```json
  "scripts": {
    "start": "bun src/index.ts",
    "test": "bun test",
    "lint": "biome lint .",
    "format": "biome format . --write",
    "check": "biome check --write ."
  },
```

- [ ] **Step 4: Commit**

Run: `git add package.json biome.json bun.lockb && git commit -m "feat: add biome for linting and formatting"`

---

### Task 2: Apply Biome to Codebase

**Files:**
- Modify: All files in `src/` and root (formatted by Biome)

- [ ] **Step 1: Run Biome check to fix issues**

Run: `bun run check`

- [ ] **Step 2: Verify tests still pass**

Run: `bun test`

- [ ] **Step 3: Commit**

Run: `git add . && git commit -m "style: apply biome formatting and linting fixes"`

---

### Task 3: Commit Documentation

**Files:**
- Create: `docs/superpowers/specs/2026-04-13-biome-integration-design.md`
- Create: `docs/superpowers/plans/2026-04-13-biome-integration.md`

- [ ] **Step 1: Commit documentation files**

Run: `git add docs/superpowers/specs/2026-04-13-biome-integration-design.md docs/superpowers/plans/2026-04-13-biome-integration.md && git commit -m "docs: add design spec and implementation plan for biome integration"`
