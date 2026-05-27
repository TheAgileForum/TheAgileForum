import express from "express";
import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { errorHandler } from "./error-handler.js";
import { requestIdMiddleware } from "./request-id.js";

describe("error handler", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns sanitized error payload with requestId", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const app = express();
    app.use(requestIdMiddleware);
    app.get("/explode", (_req, _res, next) => {
      next(new Error("sensitive stack details"));
    });
    app.use(errorHandler);

    const res = await request(app).get("/explode");

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe("INTERNAL_SERVER_ERROR");
    expect(res.body.error.message).toBe("Unexpected error");
    expect(res.body.error.requestId).toBeTruthy();
    expect(JSON.stringify(res.body)).not.toContain("sensitive stack details");
    expect(errorSpy).toHaveBeenCalledTimes(1);
  });
});
