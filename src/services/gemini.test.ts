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

    const { parseExpense } = await import("./gemini.js");
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

  it("should parse social category", async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () =>
          JSON.stringify({
            amount: 50000,
            currency: "IDR",
            description: "zakat mal",
            category: "Social",
            date: "2026-04-12",
          }),
      },
    });

    const { parseExpense } = await import("./gemini.js");
    const result = await parseExpense("50000 zakat mal");

    expect(result).toEqual({
      amount: 50000,
      currency: "IDR",
      description: "zakat mal",
      category: "Social",
      date: "2026-04-12",
    });
  });

  it("should parse bills electricity sub-category", async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () =>
          JSON.stringify({
            amount: 500000,
            currency: "IDR",
            description: "PLN bill",
            category: "Bills: Electricity",
            date: "2026-04-12",
          }),
      },
    });

    const { parseExpense } = await import("./gemini.js");
    const result = await parseExpense("500000 PLN bill");

    expect(result).toEqual({
      amount: 500000,
      currency: "IDR",
      description: "PLN bill",
      category: "Bills: Electricity",
      date: "2026-04-12",
    });
  });

  it("should parse transport parking fee sub-category", async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () =>
          JSON.stringify({
            amount: 25000,
            currency: "IDR",
            description: "parking",
            category: "Transport: Parking fee",
            date: "2026-04-12",
          }),
      },
    });

    const { parseExpense } = await import("./gemini.js");
    const result = await parseExpense("25000 parking");

    expect(result).toEqual({
      amount: 25000,
      currency: "IDR",
      description: "parking",
      category: "Transport: Parking fee",
      date: "2026-04-12",
    });
  });

  it("should parse shopping groceries sub-category", async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () =>
          JSON.stringify({
            amount: 150000,
            currency: "IDR",
            description: "groceries at superindo",
            category: "Shopping: Groceries",
            date: "2026-04-12",
          }),
      },
    });

    const { parseExpense } = await import("./gemini.js");
    const result = await parseExpense("150000 groceries at superindo");

    expect(result).toEqual({
      amount: 150000,
      currency: "IDR",
      description: "groceries at superindo",
      category: "Shopping: Groceries",
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

    const { parseExpense } = await import("./gemini.js");
    await expect(parseExpense("invalid input")).rejects.toThrow();
  });
});
