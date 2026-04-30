import * as chrono from "chrono-node";

/**
 * Parses a natural language date string into YYYY-MM-DD.
 * Defaults to today if input is empty or "today".
 * Uses APP_TIMEZONE for the reference date.
 */
export function parseDateString(text: string): string | null {
  const tz = process.env.APP_TIMEZONE || "Asia/Jakarta";
  const now = new Date();
  
  // Normalize "today" or empty string
  const input = text.trim().toLowerCase();
  if (!input || input === "today") {
    return new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(now);
  }

  // Parse relative to now in the specified timezone
  const parsedDate = chrono.parseDate(input, now, { forwardDate: false });
  
  if (!parsedDate) return null;

  return new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(parsedDate);
}
