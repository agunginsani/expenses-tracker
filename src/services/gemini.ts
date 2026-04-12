import { GoogleGenerativeAI, type GenerateContentResult } from "@google/generative-ai";
import { ExpenseSchema } from "../schemas/expense";

export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
export const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

export async function parseExpense(input: string | Buffer, isImage = false) {
  const prompt = `Extract expense details from the following ${isImage ? 'image' : 'text'}. 
  Return ONLY a JSON object with: amount (number), currency (string), description (string), category (string), date (YYYY-MM-DD).
  Default date to today if not found. Categories should be one of: Food, Transport, Shopping, Bills, Others.`;

  const maxRetries = 3;
  let lastError: any;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      let result: GenerateContentResult;
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
      
      const rawData = JSON.parse(jsonMatch[0]);
      return ExpenseSchema.parse(rawData);
    } catch (error: any) {
      lastError = error;
      // If it's a ZodError, don't retry (it's a content issue, not a service issue)
      if (error.name === 'ZodError') throw error;

      const isTransient = error.message?.includes('503') || error.message?.includes('429');
      if (isTransient && attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`Gemini API busy (attempt ${attempt + 1}). Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }

  throw lastError;
}
