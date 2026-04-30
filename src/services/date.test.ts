import { expect, test, describe } from "bun:test";
import { parseDateString } from "./date.js";

describe("parseDateString", () => {
  const tz = process.env.APP_TIMEZONE || "Asia/Jakarta";
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(new Date());

  test("defaults to today for empty input", () => {
    expect(parseDateString("")).toBe(today);
  });

  test("handles 'today'", () => {
    expect(parseDateString("today")).toBe(today);
  });

  test("handles 'yesterday'", () => {
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const expected = new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(yesterdayDate);
    expect(parseDateString("yesterday")).toBe(expected);
  });

  test("handles ISO dates", () => {
    expect(parseDateString("2026-01-01")).toBe("2026-01-01");
  });

  test("handles natural language dates", () => {
    expect(parseDateString("1 January 2026")).toBe("2026-01-01");
  });

  test("returns null for invalid dates", () => {
    expect(parseDateString("not a date")).toBeNull();
  });
});
