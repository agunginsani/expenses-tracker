import {
  type GenerateContentResult,
  GoogleGenerativeAI,
  type Part,
} from "@google/generative-ai";
import { ExpenseSchema } from "../schemas/expense.js";

export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
export const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

export async function parseExpense(
  input: string | Buffer,
  options: { mimeType?: string; caption?: string } = {},
) {
  const { mimeType = "image/jpeg", caption } = options;

  const prompt = `Extract expense details from the following media (image/PDF) or text.
  Return ONLY a JSON object with: 
  - amount (number)
  - currency (string)
  - description (string): a short summary of the overall purchase
  - category (string)
  - date (YYYY-MM-DD)
  - items (array of objects): each object with name (string), quantity (number, optional), and price (number, optional).

  STRICT DATE RULE: If the transaction date is not found in the provided content, do NOT guess. Set "date" to null.

  CATEGORY OVERRIDE RULE: If the user explicitly mentions one of the allowed categories in their text or user note (e.g., 'save it as Social', 'Transport: Taxi/Ojol'), you MUST use that category regardless of what the media content suggests.

  CURRENCY DEFAULT RULE: If the currency is not explicitly found in the content, use 'IDR' as the default.

  Categories MUST be one of: 
  - Food
  - Transport (or specific: Transport: Gasoline, Transport: Parking fee, Transport: Public transport, Transport: Taxi/Ojol, Transport: Vehicle maintenance)
  - Shopping (or specific: Shopping: Groceries, Shopping: Fashion, Shopping: Gadgets)
  - Bills (or specific: Bills: Electricity, Bills: Water, Bills: Internet, Bills: Mobile Data, Bills: Rent, Bills: Subscription)
  - Social
  - Others`;

  const maxRetries = 3;
  let lastError: unknown;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      let result: GenerateContentResult;
      if (typeof input === "string") {
        result = await model.generateContent([prompt, input]);
      } else {
        const parts: (string | Part)[] = [
          prompt,
          {
            inlineData: {
              data: input.toString("base64"),
              mimeType: mimeType,
            },
          },
        ];
        if (caption) parts.push(`User note: ${caption}`);
        result = await model.generateContent(parts);
      }

      const response = result.response;
      const text = response.text();
      const jsonMatch = text.match(/\{.*\}/s);
      if (!jsonMatch) throw new Error("Failed to parse AI response");

      const rawData = JSON.parse(jsonMatch[0]);
      
      // 1. Validate first to get a typed object
      const validatedData = ExpenseSchema.parse(rawData);
      
      // 2. Format items into description if they exist
      if (validatedData.items?.length) {
        const itemsList = validatedData.items
          .map(item => `- ${item.quantity ? `${item.quantity}x ` : ""}${item.name}${item.price ? `: ${item.price}` : ""}`)
          .join("\n");
        validatedData.description = `${validatedData.description}\n\nItems:\n${itemsList}`;
      }

      return validatedData;
    } catch (error: unknown) {
      lastError = error;
      // If it's a ZodError, don't retry (it's a content issue, not a service issue)
      if (error instanceof Error && error.name === "ZodError") throw error;

      const message = error instanceof Error ? error.message : String(error);
      const isTransient = message.includes("503") || message.includes("429");
      if (isTransient && attempt < maxRetries - 1) {
        const delay = 2 ** attempt * 1000;
        console.log(
          `Gemini API busy (attempt ${attempt + 1}). Retrying in ${delay}ms...`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }

  throw lastError;
}
