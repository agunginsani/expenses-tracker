# Tech Stack and Quality Gates Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Document the tech stack and enforce quality standards with a git `pre-push` hook.

**Architecture:** Update `README.md` for visibility, fix existing type errors to create a clean baseline, and install `husky` to automate verification.

**Tech Stack:** Bun, TypeScript, Husky, Biome.

---

### Task 1: Resolve TypeScript Baseline Errors

**Files:**
- Modify: `src/bot.ts`
- Modify: `src/services/sheets.test.ts`

- [ ] **Step 1: Fix date formatting in `src/bot.ts`**
  Simplify the `Intl` logic to avoid optional properties.
  ```typescript
  // Replace lines 20-25 with:
  const tz = process.env.APP_TIMEZONE || "Asia/Jakarta";
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(new Date());
  ```

- [ ] **Step 2: Fix `caption` access in `src/bot.ts`**
  The `message` filter in Telegraf sometimes needs explicit narrowing for `photo` and `document`.
  ```typescript
  // For bot.on(message("photo"), ...) and bot.on(message("document"), ...)
  // Access caption safely:
  const caption = "caption" in ctx.message ? ctx.message.caption : undefined;
  ```

- [ ] **Step 3: Fix `src/services/sheets.test.ts` type error**
  Update line 118:
  ```typescript
  mockGetRows.mockResolvedValue(mockRows as any);
  ```

- [ ] **Step 4: Verify 0 errors**
  Run: `bun x tsc --noEmit`
  Expected: No errors found.

- [ ] **Step 5: Commit**
  ```bash
  git add src/bot.ts src/services/sheets.test.ts
  git commit -m "fix: resolve typescript baseline errors"
  ```

---

### Task 2: Document Tech Stack

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Add Tech Stack section to README.md**
  Insert after the introduction:
  ```markdown
  ## Tech Stack
  - **Runtime:** [Bun](https://bun.sh/)
  - **Language:** TypeScript
  - **Framework:** [Telegraf](https://telegraf.js.org/) (Telegram Bot API)
  - **Database:** Google Sheets
  - **AI:** [Google Gemini](https://ai.google.dev/)
  - **Linting/Formatting:** [Biome](https://biomejs.dev/)
  ```

- [ ] **Step 2: Commit**
  ```bash
  git commit -am "docs: add tech stack definition to README"
  ```

---

### Task 3: Implement Husky Pre-Push Hook

**Files:**
- Modify: `package.json`
- Create: `.husky/pre-push`

- [ ] **Step 1: Install Husky**
  Run: `bun add -d husky`

- [ ] **Step 2: Initialize Husky**
  Run: `bun x husky init`

- [ ] **Step 3: Configure pre-push hook**
  Edit `.husky/pre-push` (or create if `init` didn't):
  ```bash
  #!/usr/bin/env sh
  bun x tsc --noEmit && bun x biome check .
  ```

- [ ] **Step 4: Verify hook works**
  Temporarily add a `console.log(123;` to a file.
  Run: `git add . && git commit -m "test hook" && git push --dry-run`
  Expected: Push is blocked by TS error.
  Revert the change.

- [ ] **Step 5: Commit**
  ```bash
  git add .husky/ package.json bun.lockb
  git commit -m "chore: implement pre-push hook with husky"
  ```
