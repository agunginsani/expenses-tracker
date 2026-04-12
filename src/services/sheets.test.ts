import { describe, it, expect, mock } from 'bun:test';

// Define the mock outside to make it accessible to mock.module
const mockAddRow = mock(() => Promise.resolve());
const mockLoadInfo = mock(() => Promise.resolve());

// Mock google-spreadsheet
mock.module('google-spreadsheet', () => {
  return {
    GoogleSpreadsheet: class {
      constructor(id: string, auth: any) {}
      loadInfo = mockLoadInfo;
      get sheetsByIndex() {
        return [
          {
            addRow: mockAddRow
          }
        ];
      }
    }
  };
});

// Mock google-auth-library
mock.module('google-auth-library', () => {
  return {
    JWT: class {
      constructor(options: any) {}
    }
  };
});

describe('Sheets Service', () => {
  it('should call saveToSheet with correct data', async () => {
    // Set some dummy environment variables
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = 'test@example.com';
    process.env.GOOGLE_PRIVATE_KEY = 'test-key';
    process.env.GOOGLE_SHEET_ID = 'test-id';

    const { saveToSheet } = await import('./sheets');
    
    const data = {
      amount: 10,
      currency: '$',
      description: 'coffee',
      category: 'Food' as any,
      date: '2026-04-12'
    };

    await saveToSheet(data);

    expect(mockLoadInfo).toHaveBeenCalled();
    expect(mockAddRow).toHaveBeenCalledWith({
      Date: data.date,
      Description: data.description,
      Category: data.category,
      Amount: data.amount,
      Currency: data.currency,
      'Raw Message': JSON.stringify(data)
    });
  });
});
