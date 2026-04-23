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

  it("should handle buffer input with mimeType (PDF)", async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () =>
          JSON.stringify({
            amount: 250,
            currency: "USD",
            description: "digital invoice",
            category: "Bills",
            date: "2026-04-14",
          }),
      },
    });

    const { parseExpense } = await import("./gemini.js");
    const buffer = Buffer.from("fake pdf content");
    const result = await parseExpense(buffer, { mimeType: "application/pdf" });

    expect(result).toEqual({
      amount: 250,
      currency: "USD",
      description: "digital invoice",
      category: "Bills",
      date: "2026-04-14",
    });

    // Verify generateContent was called with correct parts
    const lastCall = mockGenerateContent.mock.calls[0][0];
    expect(lastCall).toContainEqual({
      inlineData: {
        data: buffer.toString("base64"),
        mimeType: "application/pdf",
      },
    });
  });

  it("should include caption in the prompt if provided", async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () =>
          JSON.stringify({
            amount: 45,
            currency: "USD",
            description: "Lunch with client",
            category: "Food",
            date: "2026-04-14",
          }),
      },
    });

    const { parseExpense } = await import("./gemini.js");
    const buffer = Buffer.from("fake image content");
    const result = await parseExpense(buffer, { caption: "Lunch with client" });

    expect(result.description).toBe("Lunch with client");

    // Verify generateContent was called with caption
    const lastCall = mockGenerateContent.mock.calls[0][0];
    expect(lastCall).toContain("User note: Lunch with client");
  });

  it("should default to IDR if currency is missing in AI response", async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () =>
          JSON.stringify({
            amount: 50000,
            // currency missing
            description: "no currency mentioned",
            category: "Others",
            date: "2026-04-15",
          }),
      },
    });

    const { parseExpense } = await import("./gemini.js");
    const result = await parseExpense("50000 for something");

    expect(result.currency).toBe("IDR");
  });

  it("should throw ZodError if date is null (Strict Date Rule)", async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () =>
          JSON.stringify({
            amount: 10,
            currency: "$",
            description: "no date receipt",
            category: "Others",
            date: null,
          }),
      },
    });

    const { parseExpense } = await import("./gemini.js");
    await expect(parseExpense("receipt without date")).rejects.toThrow();

    // Should NOT retry on ZodError
    expect(mockGenerateContent.mock.calls.length).toBe(1);
  });

  it("should override category if explicitly mentioned in text", async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () =>
          JSON.stringify({
            amount: 150000,
            currency: "IDR",
            description: "lunch with client",
            category: "Social",
            date: "2026-04-14",
          }),
      },
    });

    const { parseExpense } = await import("./gemini.js");
    const result = await parseExpense(
      "150k for lunch with client, put it in Social. date is 2026-04-14",
    );

    expect(result.amount).toBe(150000);
    expect(result.category).toBe("Social");
    expect(result.date).toBe("2026-04-14");
  });

  it("should handle combined PDF and caption", async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () =>
          JSON.stringify({
            amount: 500,
            currency: "USD",
            description: "Project invoice - Final",
            category: "Bills",
            date: "2026-04-14",
          }),
      },
    });

    const { parseExpense } = await import("./gemini.js");
    const buffer = Buffer.from("fake pdf content");
    const result = await parseExpense(buffer, {
      mimeType: "application/pdf",
      caption: "Final project invoice",
    });

    expect(result.amount).toBe(500);

    const lastCall = mockGenerateContent.mock.calls[0][0];
    expect(lastCall).toContainEqual({
      inlineData: {
        data: buffer.toString("base64"),
        mimeType: "application/pdf",
      },
    });
    expect(lastCall).toContain("User note: Final project invoice");
  });

  it("should default to image/jpeg if mimeType is not provided for Buffer input", async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () =>
          JSON.stringify({
            amount: 10,
            currency: "$",
            description: "image",
            category: "Others",
            date: "2026-04-12",
          }),
      },
    });

    const { parseExpense } = await import("./gemini.js");
    const buffer = Buffer.from("fake image content");
    await parseExpense(buffer);

    const lastCall = mockGenerateContent.mock.calls[0][0];
    expect(lastCall).toContainEqual({
      inlineData: {
        data: buffer.toString("base64"),
        mimeType: "image/jpeg",
      },
    });
  });

  it("should itemize receipt and append to description", async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () =>
          JSON.stringify({
            amount: 150000,
            currency: "IDR",
            description: "Groceries",
            category: "Shopping: Groceries",
            date: "2026-04-16",
            items: [
              { name: "Milk", quantity: 2, price: 50000 },
              { name: "Bread", price: 25000 },
              { name: "Eggs", quantity: 1 },
            ],
          }),
      },
    });

    const { parseExpense } = await import("./gemini.js");
    const result = await parseExpense("groceries");

    expect(result.description).toBe(
      "Groceries\n\nItems:\n- 2x Milk: 50000\n- Bread: 25000\n- 1x Eggs",
    );
    expect(result.items).toHaveLength(3);
  });

  it("should handle itemized receipt with only names", async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () =>
          JSON.stringify({
            amount: 10000,
            currency: "IDR",
            description: "Snacks",
            category: "Food",
            date: "2026-04-16",
            items: [{ name: "Chips" }, { name: "Soda" }],
          }),
      },
    });

    const { parseExpense } = await import("./gemini.js");
    const result = await parseExpense("snacks");

    expect(result.description).toBe("Snacks\n\nItems:\n- Chips\n- Soda");
    expect(result.items).toHaveLength(2);
  });
});
