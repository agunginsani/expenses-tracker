# Revert Categories Prompt to Explicit List Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Revert the generalized "subclasses" category prompt to explicitly list sub-categories, ensuring consistency with documentation.

**Architecture:** A targeted string replacement within `src/services/gemini.ts` to restore the explicit category list, followed by an update to the corresponding plan documentation.

**Tech Stack:** TypeScript, Markdown

---

### Task 1: Update Gemini Prompt Code

**Files:**
- Modify: `src/services/gemini.ts`

- [ ] **Step 1: Revert Prompt String**

Modify `src/services/gemini.ts` to replace the "subclasses" list with the explicit list. Ensure the "STRICT DATE RULE" and "CATEGORY OVERRIDE RULE" are preserved.

```typescript
// In src/services/gemini.ts, inside parseExpense function
  const prompt = `Extract expense details from the following media (image/PDF) or text. 
  Return ONLY a JSON object with: amount (number), currency (string), description (string), category (string), date (YYYY-MM-DD).
  
  STRICT DATE RULE: If the transaction date is not found in the provided content, do NOT guess. Set "date" to null.
  
  CATEGORY OVERRIDE RULE: If the user explicitly mentions one of the allowed categories in their text or user note (e.g., 'save it as Social', 'Transport: Taxi/Ojol'), you MUST use that category regardless of what the media content suggests.
  
  Categories MUST be one of: 
  - Food
  - Transport (or specific: Transport: Gasoline, Transport: Parking fee, Transport: Public transport, Transport: Taxi/Ojol, Transport: Vehicle maintenance)
  - Shopping (or specific: Shopping: Groceries, Shopping: Fashion, Shopping: Gadgets)
  - Bills (or specific: Bills: Electricity, Bills: Water, Bills: Internet, Bills: Mobile Data, Bills: Rent, Bills: Subscription)
  - Social
  - Others`;
```

- [ ] **Step 2: Run tests to verify the prompt structure hasn't broken parsing logic**

Run: `npm test` or the appropriate test command to ensure basic parsing still works. We assume existing tests use this prompt indirectly.

- [ ] **Step 3: Commit**

```bash
git add src/services/gemini.ts
git commit -m "fix: revert category prompt to explicit list"
```

---

### Task 2: Update Plan Documentation

**Files:**
- Modify: `docs/superpowers/plans/2026-04-14-pdf-and-caption-support.md`

- [ ] **Step 1: Update Prompt Snippet in Documentation**

Update the documentation to reflect the explicit category list.

```markdown
// In docs/superpowers/plans/2026-04-14-pdf-and-caption-support.md, find the prompt block and update it:
  Categories MUST be one of: 
  - Food
  - Transport (or specific: Transport: Gasoline, Transport: Parking fee, Transport: Public transport, Transport: Taxi/Ojol, Transport: Vehicle maintenance)
  - Shopping (or specific: Shopping: Groceries, Shopping: Fashion, Shopping: Gadgets)
  - Bills (or specific: Bills: Electricity, Bills: Water, Bills: Internet, Bills: Mobile Data, Bills: Rent, Bills: Subscription)
  - Social
  - Others\`;
```

- [ ] **Step 2: Commit**

```bash
git add docs/superpowers/plans/2026-04-14-pdf-and-caption-support.md
git commit -m "docs: update plan to reflect explicit category prompt"
```
