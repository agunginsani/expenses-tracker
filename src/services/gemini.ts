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
