import { JWT } from "google-auth-library";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { type ExpenseData, ExpenseSchema } from "../schemas/expense";

export async function saveToSheet(data: ExpenseData) {
  // Validate at the boundary
  ExpenseSchema.parse(data);

  try {
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
    const sheet = doc.sheetsByIndex[0];

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
