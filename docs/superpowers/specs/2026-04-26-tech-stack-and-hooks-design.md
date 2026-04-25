# Design Spec: Tech Stack Documentation and Pre-Push Hooks

Define the project's technical architecture and implement automated quality gates to prevent broken code from being pushed.

## Goals
- Provide clear documentation of the tech stack in `README.md`.
- Implement a `pre-push` git hook to enforce TypeScript, linting, and formatting standards.
- Resolve all existing TypeScript errors to establish a "clean" baseline.

## Tech Stack Definition
The project uses the following stack:
- **Runtime:** Bun
- **Language:** TypeScript
- **Framework:** Telegraf (Telegram Bot API)
- **Database/Storage:** Google Sheets (via `google-spreadsheet`)
- **AI Integration:** Google Gemini (via `@google/generative-ai`)
- **Linting/Formatting:** Biome
- **Deployment:** Vercel

## Implementation Details

### 1. README.md Update
Add a `## Tech Stack` section listing the components above with brief descriptions of their roles.

### 2. Git Hooks (Husky)
- Install `husky` as a dev dependency.
- Initialize husky: `bun x husky init`.
- Create a `pre-push` hook that runs:
  ```bash
  bun x tsc --noEmit && bun x biome check .
  ```

### 3. Bug Fixes (TS Baseline)
- **`src/bot.ts`**: 
    - Use `new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(new Date())` for simpler, type-safe date strings.
    - Add type guards or narrow the `message` filter to ensure `caption` exists on the context.
- **`src/services/sheets.test.ts`**:
    - Update the mock return type for `getRows` to match the expected `GoogleSpreadsheetRow[]` or use `any` if the mock library requires it for complex types.

## Testing Plan
- **Documentation:** Verify `README.md` renders correctly.
- **Hooks:** Attempt a `git push` with a deliberate TS error or formatting violation to verify the hook blocks it.
- **TS Errors:** Run `bun x tsc --noEmit` to verify a 0-error state.
