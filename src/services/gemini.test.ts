import { describe, it, expect, mock } from 'bun:test';

// Mock the GoogleGenerativeAI module
mock.module("@google/generative-ai", () => {
  return {
    GoogleGenerativeAI: class {
      getGenerativeModel() {
        return {
          generateContent: mock(async () => {
            return {
              response: {
                text: () => JSON.stringify({
                  amount: 10,
                  currency: '$',
                  description: 'coffee',
                  category: 'Food',
                  date: '2026-04-12'
                })
              }
            };
          })
        };
      }
    }
  };
});

describe('Gemini Service', () => {
  it('should parse simple text expense', async () => {
    const { parseExpense } = await import('./gemini');
    const input = "10$ for coffee";
    const result = await parseExpense(input);
    
    expect(result).toEqual({
      amount: 10,
      currency: '$',
      description: 'coffee',
      category: 'Food',
      date: '2026-04-12'
    });
  });

  it('should parse image expense', async () => {
    const { parseExpense } = await import('./gemini');
    const input = Buffer.from("fake-image-data");
    const result = await parseExpense(input, true);
    
    expect(result).toEqual({
      amount: 10,
      currency: '$',
      description: 'coffee',
      category: 'Food',
      date: '2026-04-12'
    });
  });
});
