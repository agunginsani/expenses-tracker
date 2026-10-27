import { describe, expect, test } from "bun:test";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import handler from "./health.js";

class TestResponse {
  statusCode = 0;
  body: unknown;

  status(statusCode: number) {
    this.statusCode = statusCode;
    return this;
  }

  json(body: unknown) {
    this.body = body;
    return this;
  }

  send(body: string) {
    this.body = body;
    return this;
  }
}

describe("health endpoint", () => {
  test("returns a healthy response to GET requests", () => {
    const response = new TestResponse();

    handler(
      { method: "GET" } as VercelRequest,
      response as unknown as VercelResponse,
    );

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });

  test("rejects methods other than GET", () => {
    const response = new TestResponse();

    handler(
      { method: "POST" } as VercelRequest,
      response as unknown as VercelResponse,
    );

    expect(response.statusCode).toBe(405);
    expect(response.body).toBe("Method Not Allowed");
  });
});
