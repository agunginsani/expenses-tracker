import { beforeEach, describe, expect, it, mock } from "bun:test";

const mockGenerateContent = mock();

// Mock the GoogleGenerativeAI module once at the top level
mock.module("@google/generative-ai", () => {
  return {
    GoogleGenerativeAI: class {
      getGenerativeModel() {
        return {
          generateContent: mockGenerateContent,
        };
      }
    },
  };
});

describe("Gemini Service", () => {
  beforeEach(() => {
    mockGenerateContent.mockClear();
  });

  it("should parse simple text expense", async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () =>
          JSON.stringify({
            amount: 10,
            currency: "$",
            description: "coffee",
            category: "Food",
            date: "2026-04-12",
          }),
      },
    });

    const { parseExpense } = await import("./gemini");
    const input = "10$ for coffee";
    const result = await parseExpense(input);

    expect(result).toEqual({
      amount: 10,
      currency: "$",
      description: "coffee",
      category: "Food",
      date: "2026-04-12",
    });
  });

  it("should throw ZodError if AI returns invalid data", async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () =>
          JSON.stringify({
            amount: -50, // Invalid: must be positive
            currency: "$",
            description: "invalid",
            category: "Food",
            date: "2026-04-12",
          }),
      },
    });

    const { parseExpense } = await import("./gemini");
    await expect(parseExpense("invalid input")).rejects.toThrow();
  });
});
