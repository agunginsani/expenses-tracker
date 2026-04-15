# Design Spec: Revert Categories Prompt to Explicit List

## 1. Goals
- Revert the "subclasses" generalization in the Gemini prompt back to an explicit list of sub-categories.
- Ensure consistency between the code and the implementation plan documentation.
- Maintain the "Category Override Rule" and "Strict Date Rule" introduced in recent commits.

## 2. Background
In a recent change (commit `86fd2af189d49242c16fef4ecc24c3e4d3b4916f`), the explicit list of sub-categories for Transport, Shopping, and Bills was replaced with a more generic instruction: "(or specific subclasses)". The user prefers the explicit list as it was "more correct" and likely provides better guidance to the model.

## 3. Changes

### 3.1. Gemini Service (`src/services/gemini.ts`)
Update the `prompt` string within `parseExpense` to list the explicit sub-categories.

**Current:**
```
  Categories MUST be one of: 
  - Food
  - Transport (or specific subclasses)
  - Shopping (or specific subclasses)
  - Bills (or specific subclasses)
  - Social
  - Others
```

**New:**
```
  Categories MUST be one of: 
  - Food
  - Transport (or specific: Transport: Gasoline, Transport: Parking fee, Transport: Public transport, Transport: Taxi/Ojol, Transport: Vehicle maintenance)
  - Shopping (or specific: Shopping: Groceries, Shopping: Fashion, Shopping: Gadgets)
  - Bills (or specific: Bills: Electricity, Bills: Water, Bills: Internet, Bills: Mobile Data, Bills: Rent, Bills: Subscription)
  - Social
  - Others
```

### 3.2. Plan Documentation (`docs/superpowers/plans/2026-04-14-pdf-and-caption-support.md`)
Update the prompt snippet in the plan document to match the code.

## 4. Verification
1.  **Code Review:** Verify the prompt string in `src/services/gemini.ts`.
2.  **Documentation Review:** Verify `docs/superpowers/plans/2026-04-14-pdf-and-caption-support.md`.
3.  **Functional Test (Optional):** Run existing tests in `src/services/gemini.test.ts` to ensure no regressions in parsing logic.
