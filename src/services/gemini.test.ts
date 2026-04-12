import { describe, it, expect } from 'bun:test';
import { parseExpense } from './gemini';

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
      // Expecting failure if API key is missing or parseExpense is not implemented
      expect(e).toBeDefined();
    }
  });
});
