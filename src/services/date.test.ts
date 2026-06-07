import { describe, expect, test } from "bun:test";
import { formatTimestamp, parseDateString } from "./date.js";

describe("parseDateString", () => {
  const tz = process.env.APP_TIMEZONE || "Asia/Jakarta";
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(
    new Date(),
  );

  test("defaults to today for empty input", () => {
    expect(parseDateString("")).toBe(today);
  });

  test("handles 'today'", () => {
    expect(parseDateString("today")).toBe(today);
  });

  test("handles 'yesterday'", () => {
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const expected = new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(
      yesterdayDate,
    );
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

describe("formatTimestamp", () => {
  test("formats date correctly for Jakarta timezone", () => {
    process.env.APP_TIMEZONE = "Asia/Jakarta";
    const date = new Date("2026-06-07T14:30:05.000Z");
    // UTC 14:30 is 21:30 in Jakarta (+7)
    expect(formatTimestamp(date)).toBe("2026-06-07 21:30:05");
  });
});
