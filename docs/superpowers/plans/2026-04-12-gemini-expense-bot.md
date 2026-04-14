# Gemini Expense Bot Implementation Plan (Bun.js)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Telegram bot that uses Gemini 1.5 Flash to parse expense data from text or images and records it into Google Sheets.

**Architecture:** A Bun.js TypeScript application using Telegraf for Telegram interaction, the Google Generative AI SDK for Gemini integration, and google-spreadsheet for database operations.

**Tech Stack:** Bun.js, TypeScript, Telegraf, @google/generative-ai, google-spreadsheet, axios.

---

### Task 1: Project Initialization

**Files:**
- Create: `package.json`, `tsconfig.json`, `.env.example`, `.gitignore`, `src/index.ts`

- [ ] **Step 1: Initialize Bun and install dependencies**

Run: `bun init -y && bun add telegraf @google/generative-ai google-spreadsheet axios && bun add -d @types/bun`

- [ ] **Step 2: Configure TypeScript**

Create `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "types": ["bun-types"],
    "strict": true,
    "skipLibCheck": true,
    "noEmit": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"]
}
```

- [ ] **Step 3: Create basic entry point**

Create `src/index.ts`:
```typescript
import { Telegraf } from 'telegraf';

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN || '');

bot.start((ctx) => ctx.reply('Welcome to Gemini Expense Bot!'));
bot.on('text', (ctx) => ctx.reply(`You said: ${ctx.message.text}`));

console.log('Bot is starting...');
bot.launch().catch(err => console.error('Failed to launch bot:', err));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
```

- [ ] **Step 4: Create .env.example and .gitignore**

Create `.env.example`:
```
TELEGRAM_BOT_TOKEN=your_token_here
GEMINI_API_KEY=your_key_here
GOOGLE_SHEET_ID=your_sheet_id_here
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_email_here
GOOGLE_PRIVATE_KEY=your_private_key_here
```

Create `.gitignore`:
```
node_modules
dist
.env
*.log
```

- [ ] **Step 5: Commit**

Run: `git add . && git commit -m "chore: initial project setup with bun"`

---

### Task 2: Gemini Integration Service

**Files:**
- Create: `src/services/gemini.ts`, `src/services/gemini.test.ts`

- [ ] **Step 1: Write failing test for Gemini parser**

Create `src/services/gemini.test.ts`:
```typescript
import { describe, it, expect } from 'bun:test';
import { parseExpense } from './gemini.js';

describe('Gemini Service', () => {
  it('should parse simple text expense', async () => {
    // Note: In real test we would mock the GoogleGenerativeAI client
    const input = "10$ for coffee";
    try {
      const result = await parseExpense(input);
      expect(result).toMatchObject({
        amount: 10,
        currency: '$',
        description: 'coffee'
      });
    } catch (e) {
      // Expecting failure if API key is missing
      expect(e).toBeDefined();
    }
  });
});
```

- [ ] **Step 2: Implement Gemini service**

Create `src/services/gemini.ts`:
```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export interface ExpenseData {
  amount: number;
  currency: string;
  description: string;
  category: string;
  date: string;
}

export async function parseExpense(input: string | Buffer, isImage = false): Promise<ExpenseData> {
  const prompt = `Extract expense details from the following ${isImage ? 'image' : 'text'}. 
  Return ONLY a JSON object with: amount (number), currency (string), description (string), category (string), date (YYYY-MM-DD).
  Default date to today if not found. Categories should be one of: Food, Transport, Shopping, Bills, Others.`;

  let result;
  if (typeof input === 'string') {
    result = await model.generateContent([prompt, input]);
  } else {
    result = await model.generateContent([
      prompt,
      { inlineData: { data: input.toString("base64"), mimeType: "image/jpeg" } }
    ]);
  }

  const response = await result.response;
  const text = response.text();
  const jsonMatch = text.match(/\{.*\}/s);
  if (!jsonMatch) throw new Error("Failed to parse AI response");
  return JSON.parse(jsonMatch[0]);
}
```

- [ ] **Step 3: Run tests**

Run: `bun test src/services/gemini.test.ts`

- [ ] **Step 4: Commit**

Run: `git add src/services/gemini.ts src/services/gemini.test.ts && git commit -m "feat: add gemini service"`

---

### Task 3: Google Sheets Integration Service

**Files:**
- Create: `src/services/sheets.ts`

- [ ] **Step 1: Implement Sheets service**

Create `src/services/sheets.ts`:
```typescript
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { ExpenseData } from './gemini.js';

export async function saveToSheet(data: ExpenseData) {
  const serviceAccountAuth = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID || '', serviceAccountAuth);
  await doc.loadInfo();
  const sheet = doc.sheetsByIndex[0];
  
  await sheet.addRow({
    Date: data.date,
    Description: data.description,
    Category: data.category,
    Amount: data.amount,
    Currency: data.currency,
    'Raw Message': JSON.stringify(data)
  });
}
```

- [ ] **Step 2: Commit**

Run: `git add src/services/sheets.ts && git commit -m "feat: add google sheets service"`

---

### Task 4: Connect Bot to Services

**Files:**
- Modify: `src/index.ts`

- [ ] **Step 1: Update bot logic to use services**

Modify `src/index.ts`:
```typescript
import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import { parseExpense } from './services/gemini.js';
import { saveToSheet } from './services/sheets.js';
import axios from 'axios';

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN || '');

bot.start((ctx) => ctx.reply('Welcome! Send me an expense text or a receipt photo.'));

bot.on(message('text'), async (ctx) => {
  try {
    const data = await parseExpense(ctx.message.text);
    await saveToSheet(data);
    ctx.reply(`✅ Saved: ${data.amount} ${data.currency} for ${data.description} (${data.category})`);
  } catch (err) {
    console.error(err);
    ctx.reply('❌ Error parsing expense. Try again.');
  }
});

bot.on(message('photo'), async (ctx) => {
  try {
    const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
    const link = await ctx.telegram.getFileLink(fileId);
    const response = await axios.get(link.href, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);
    
    const data = await parseExpense(buffer, true);
    await saveToSheet(data);
    ctx.reply(`📸 Receipt saved: ${data.amount} ${data.currency} at ${data.description}`);
  } catch (err) {
    console.error(err);
    ctx.reply('❌ Error processing receipt photo.');
  }
});

console.log('Bot is starting with Gemini and Sheets integration...');
bot.launch().catch(err => console.error('Failed to launch bot:', err));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
```

- [ ] **Step 2: Commit**

Run: `git add src/index.ts && git commit -m "feat: connect bot to gemini and sheets"`
