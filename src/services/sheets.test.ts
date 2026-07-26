import {
  beforeEach,
  describe,
  expect,
  it,
  mock,
  setSystemTime,
  spyOn,
} from "bun:test";

// Define the mock outside to make it accessible to mock.module
const mockAddRow = mock(() => Promise.resolve());
const mockGetRows = mock(() => Promise.resolve([]));
const mockLoadInfo = mock(() => Promise.resolve());
const mockLoadHeaderRow = mock(() => Promise.resolve());
const mockSetHeaderRow = mock(() => Promise.resolve());
const mockResize = mock(() => Promise.resolve());
let mockColumnCount = 26;
let mockRowCount = 1_000;
let mockHeaderValues = [
  "Date",
  "Description",
  "Category",
  "Amount",
  "Currency",
  "Created at",
];

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
            loadHeaderRow: mockLoadHeaderRow,
            setHeaderRow: mockSetHeaderRow,
            resize: mockResize,
            get columnCount() {
              return mockColumnCount;
            },
            get rowCount() {
              return mockRowCount;
            },
            get headerValues() {
              return mockHeaderValues;
            },
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
    mockLoadHeaderRow.mockClear();
    mockSetHeaderRow.mockClear();
    mockResize.mockClear();
    mockColumnCount = 26;
    mockRowCount = 1_000;
    mockHeaderValues = [
      "Date",
      "Description",
      "Category",
      "Amount",
      "Currency",
      "Created at",
    ];

    // Mock Date for consistency
    setSystemTime(new Date("2026-06-07T14:30:05.123Z"));
  });

  it("should call saveToSheet with correct data", async () => {
    // Set some dummy environment variables
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = "test@example.com";
    process.env.GOOGLE_PRIVATE_KEY = "test-key";
    process.env.GOOGLE_SHEET_ID = "test-id";
    process.env.APP_TIMEZONE = "Asia/Jakarta";

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
      ID: "",
      Date: data.date,
      Description: data.description,
      Category: data.category,
      Amount: data.amount,
      Currency: data.currency,
      "Created at": "2026-06-07 21:30:05",
    });
  });

  it("should save expense with explicit ID and detect duplicates", async () => {
    const { saveToSheet } = await import("./sheets.js");

    const expenseWithId = {
      id: "INV-1001",
      amount: 150000,
      currency: "IDR",
      description: "Electricity bill",
      category: "Bills: Electricity",
      date: "2026-04-10",
    } as const;

    mockGetRows.mockResolvedValueOnce([] as never[]);
    const res1 = await saveToSheet(expenseWithId);

    expect(res1).toEqual({ saved: true });
    expect(mockAddRow).toHaveBeenCalledWith({
      ID: "INV-1001",
      Date: expenseWithId.date,
      Description: expenseWithId.description,
      Category: expenseWithId.category,
      Amount: expenseWithId.amount,
      Currency: expenseWithId.currency,
      "Created at": "2026-06-07 21:30:05",
    });

    // Reset mock add row call count
    mockAddRow.mockClear();

    // Mock existing row with same ID
    mockGetRows.mockResolvedValueOnce([
      {
        get: (col: string) => (col === "ID" ? "INV-1001" : undefined),
      },
    ] as unknown as never[]);

    const res2 = await saveToSheet(expenseWithId);
    expect(res2).toEqual({
      saved: false,
      isDuplicate: true,
      existingId: "INV-1001",
    });
    expect(mockAddRow).not.toHaveBeenCalled();
  });

  it("should add the ID header to an existing sheet before saving", async () => {
    const { saveToSheet } = await import("./sheets.js");

    await saveToSheet({
      id: "INV-1001",
      amount: 150000,
      currency: "IDR",
      description: "Electricity bill",
      category: "Bills: Electricity",
      date: "2026-04-10",
    });

    expect(mockSetHeaderRow).toHaveBeenCalledWith([
      "Date",
      "Description",
      "Category",
      "Amount",
      "Currency",
      "Created at",
      "ID",
    ]);
  });

  it("should resize a full legacy sheet before adding the ID header", async () => {
    const { saveToSheet } = await import("./sheets.js");
    mockColumnCount = 6;

    await saveToSheet({
      id: "INV-1001",
      amount: 150000,
      currency: "IDR",
      description: "Electricity bill",
      category: "Bills: Electricity",
      date: "2026-04-10",
    });

    expect(mockResize).toHaveBeenCalledWith({
      rowCount: 1_000,
      columnCount: 7,
    });
  });

  it("should initialize an all-blank sheet before saving", async () => {
    const { saveToSheet } = await import("./sheets.js");
    const blankHeaderError = new Error("All your header cells are blank");
    mockLoadHeaderRow.mockRejectedValueOnce(blankHeaderError);
    mockAddRow.mockRejectedValueOnce(blankHeaderError);

    await saveToSheet({
      id: "INV-1001",
      amount: 150000,
      currency: "IDR",
      description: "Electricity bill",
      category: "Bills: Electricity",
      date: "2026-04-10",
    });

    expect(mockSetHeaderRow).toHaveBeenCalledWith([
      "ID",
      "Date",
      "Description",
      "Category",
      "Amount",
      "Currency",
      "Created at",
    ]);
    expect(mockAddRow).toHaveBeenCalledTimes(2);
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

    mockGetRows.mockResolvedValue(mockRows as unknown as never[]);

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
      ID: "",
      Date: data.date,
      Description: data.description,
      Category: data.category,
      Amount: data.amount,
      Currency: data.currency,
      "Created at": "2026-06-07 21:30:05",
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
