---
name: structured-gemini-extraction
description: Use when modifying the AI prompt or extraction logic for Google Gemini to parse receipts, invoices, or text expenses
---

# Structured Gemini Extraction

## Overview
We use Google Gemini to extract structured data. We enforce strict rules to ensure output matches our Zod schema.

## Core Invariants
1. **The Temporal Anchor**: Always inject the current date into the prompt (respecting `APP_TIMEZONE`). This prevents the AI from "correcting" future years like 2026 to its training-data "present".
2. **Strict JSON Enforcement**: Prompts must explicitly demand "ONLY a JSON object".
3. **Fallback Rules**: Instruct the AI to use `null` for missing dates rather than guessing.
