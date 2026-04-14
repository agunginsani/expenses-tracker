# Design: Category Override Support

Adding the capability to override the automatically detected category by explicitly mentioning it in the message text or caption.

## 1. Goals
- Allow users to explicitly dictate the category for an expense by mentioning an allowed category name in their text message or image/PDF caption (e.g., "save it as Transport: Taxi/Ojol").
- Ensure the system respects the override while still extracting the rest of the details (amount, date, description) from the media or text.

## 2. Approach
We will use **Instruction-Based Override** via the Gemini prompt. 

Since we are already passing the `caption` (for media) or the raw `input` (for text) to Gemini, we can update the prompt to instruct the LLM to prioritize any explicit category mentions found in the user's text over what the media content suggests.

### Rationale
- **Flexibility:** Handles natural phrasing ("put this in Food", "Category is Bills", "save it as Transport: Taxi/Ojol").
- **Simplicity:** No need to build and maintain pre-parsing regex logic that mirrors the Zod schema.

## 3. Implementation Details

### Updated Gemini Service (`src/services/gemini.ts`)
- **Prompt Update:** Add a strict instruction to the existing prompt in `parseExpense`.
- The new prompt section will read something like:
  *"CATEGORY OVERRIDE RULE: If the user explicitly mentions one of the allowed categories in their text or user note (e.g., 'save it as Social', 'Transport: Taxi/Ojol'), you MUST use that category regardless of what the media content suggests."*

## 4. Testing Strategy
- **Text Override:** Send "150k for lunch with client, put it in Social". Expect category to be `Social` (instead of `Food`).
- **Caption Override:** Send a photo of a restaurant receipt with the caption "save it as Others". Expect category to be `Others` (instead of `Food`).
- **No Override:** Send a normal receipt without mentioning a category. Expect the system to categorize it automatically as usual.

## 5. Success Criteria
- The bot correctly categorizes expenses based on explicit user instructions in the text/caption.
- The rest of the expense data (amount, date, description) remains accurate.
