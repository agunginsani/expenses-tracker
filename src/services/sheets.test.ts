import { beforeEach, describe, expect, it, mock, spyOn } from "bun:test";

// Define the mock outside to make it accessible to mock.module
const mockAddRow = mock(() => Promise.resolve());
const mockGetRows = mock(() => Promise.resolve([]));
const mockLoadInfo = mock(() => Promise.resolve());

// Mock google-spreadsheet
mock.module("google-spreadsheet", () => {
  return {
    GoogleSpreadsheet: class {
      loadInfo = mockLoadInfo;
      get sheetsByIndex() {
        return [
          {
            addRow: mockAddRow,
            getRows: mockGetRows,
          },
        ];
      }
    },
  };
});

// Mock google-auth-library
mock.module("google-auth-library", () => {
  return {
    JWT: class {},
  };
});

describe("Sheets Service", () => {
  beforeEach(() => {
    mockAddRow.mockClear();
    mockGetRows.mockClear();
    mockLoadInfo.mockClear();
  });

  it("should call saveToSheet with correct data", async () => {
    // Set some dummy environment variables
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = "test@example.com";
    process.env.GOOGLE_PRIVATE_KEY = "test-key";
    process.env.GOOGLE_SHEET_ID = "test-id";

    const { saveToSheet } = await import("./sheets.js");

    const data = {
      amount: 10,
      currency: "$",
      description: "coffee",
      category: "Food",
      date: "2026-04-12",
    } as const;

    await saveToSheet(data);

    expect(mockLoadInfo).toHaveBeenCalled();
    expect(mockAddRow).toHaveBeenCalledWith({
      Date: data.date,
      Description: data.description,
      Category: data.category,
      Amount: data.amount,
      Currency: data.currency,
    });
  });

  it("should getDailyExpenses and aggregate correctly", async () => {
    const { getDailyExpenses } = await import("./sheets.js");

    const mockRows = [
      {
        toObject: () => ({
          Date: "2026-04-25",
          Description: "Lunch",
          Category: "Food",
          Amount: "50000",
          Currency: "IDR",
        }),
      },
      {
        toObject: () => ({
          Date: "2026-04-25",
          Description: "Dinner",
          Category: "Food",
          Amount: "75000",
          Currency: "IDR",
        }),
      },
      {
        toObject: () => ({
          Date: "2026-04-25",
          Description: "Taxi",
          Category: "Transport: Taxi/Ojol",
          Amount: "25000",
          Currency: "IDR",
        }),
      },
      {
        toObject: () => ({
          Date: "2026-04-24", // Different date
          Description: "Coffee",
          Category: "Food",
          Amount: "30000",
          Currency: "IDR",
        }),
      },
      {
        toObject: () => ({
          Date: "2026-04-25",
          Description: "Book",
          Category: "Shopping",
          Amount: "15",
          Currency: "USD",
        }),
      },
    ];

    mockGetRows.mockResolvedValue(mockRows);

    const result = await getDailyExpenses("2026-04-25");

    expect(result).toEqual({
      byCategory: {
        Food: {
          IDR: 125000,
        },
        "Transport: Taxi/Ojol": {
          IDR: 25000,
        },
        Shopping: {
          USD: 15,
        },
      },
      grandTotals: {
        IDR: 150000,
        USD: 15,
      },
    });
  });

  it("should handle multi-level hierarchical categories in saveToSheet", async () => {
    const { saveToSheet } = await import("./sheets.js");

    const data = {
      amount: 500000,
      currency: "IDR",
      description: "Monthly Rent",
      category: "Bills: Rent",
      date: "2023-10-27",
    } as const;

    await saveToSheet(data);

    expect(mockLoadInfo).toHaveBeenCalled();
    expect(mockAddRow).toHaveBeenCalledWith({
      Date: data.date,
      Description: data.description,
      Category: data.category,
      Amount: data.amount,
      Currency: data.currency,
    });
  });

  it("should log and re-throw error if saveToSheet fails", async () => {
    const { saveToSheet } = await import("./sheets.js");

    const data = {
      amount: 10,
      currency: "$",
      description: "coffee",
      category: "Food",
      date: "2026-04-12",
    } as const;

    const error = new Error("API Error");
    mockLoadInfo.mockRejectedValueOnce(error);
    const consoleSpy = spyOn(console, "error").mockImplementation(() => {});

    expect(saveToSheet(data)).rejects.toThrow("API Error");
    expect(consoleSpy).toHaveBeenCalledWith(
      "Error saving to Google Sheets:",
      error,
    );

    consoleSpy.mockRestore();
  });

  it("should throw error if input data is invalid", async () => {
    const { saveToSheet } = await import("./sheets.js");
    const invalidData = {
      amount: -10, // Invalid
      currency: "$",
      description: "coffee",
      category: "Food",
      date: "2026-04-12",
    } as const;
    expect(saveToSheet(invalidData)).rejects.toThrow();
  });
});
