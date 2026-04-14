import { beforeEach, describe, expect, it, mock, spyOn } from "bun:test";

// Define the mock outside to make it accessible to mock.module
const mockAddRow = mock(() => Promise.resolve());
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
    };

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
    };

    const error = new Error("API Error");
    mockLoadInfo.mockRejectedValueOnce(error);
    const consoleSpy = spyOn(console, "error").mockImplementation(() => {});

    await expect(saveToSheet(data)).rejects.toThrow("API Error");
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
    };
    await expect(saveToSheet(invalidData)).rejects.toThrow();
  });
});
