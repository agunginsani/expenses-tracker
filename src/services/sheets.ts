import { JWT } from "google-auth-library";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { type ExpenseData, ExpenseSchema } from "../schemas/expense.js";

async function getGoogleSheet() {
  const serviceAccountAuth = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const doc = new GoogleSpreadsheet(
    process.env.GOOGLE_SHEET_ID || "",
    serviceAccountAuth,
  );
  await doc.loadInfo();
  return doc.sheetsByIndex[0];
}

export async function saveToSheet(data: ExpenseData) {
  // Validate at the boundary
  ExpenseSchema.parse(data);

  try {
    const sheet = await getGoogleSheet();

    const rowData = {
      Date: data.date,
      Description: data.description,
      Category: data.category,
      Amount: data.amount,
      Currency: data.currency,
    };

    try {
      await sheet.addRow(rowData);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      if (message.includes("No values in the header row")) {
        console.log("Empty sheet detected. Initializing headers...");
        await sheet.setHeaderRow([
          "Date",
          "Description",
          "Category",
          "Amount",
          "Currency",
        ]);
        await sheet.addRow(rowData);
      } else {
        throw e;
      }
    }
  } catch (error) {
    console.error("Error saving to Google Sheets:", error);
    throw error;
  }
}

export async function getDailyExpenses(date: string) {
  try {
    const sheet = await getGoogleSheet();
    const rows = await sheet.getRows();

    const byCategory: Record<string, Record<string, number>> = {};
    const grandTotals: Record<string, number> = {};

    for (const row of rows) {
      const obj = row.toObject();

      try {
        const data = ExpenseSchema.parse({
          amount: Number(obj.Amount),
          currency: obj.Currency,
          description: obj.Description,
          category: obj.Category,
          date: obj.Date,
        });

        if (data.date === date) {
          if (!byCategory[data.category]) {
            byCategory[data.category] = {};
          }
          byCategory[data.category][data.currency] =
            (byCategory[data.category][data.currency] || 0) + data.amount;
          grandTotals[data.currency] =
            (grandTotals[data.currency] || 0) + data.amount;
        }
      } catch (e) {
        console.warn(`Skipping invalid row in sheet:`, obj, e);
      }
    }

    return { byCategory, grandTotals };
  } catch (error) {
    console.error("Error fetching from Google Sheets:", error);
    throw error;
  }
}
