import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { commerceRouter } from "./commerce.routes.js";

function app() {
  const a = express();
  a.use(express.json());
  a.use("/api/v1/commerce", commerceRouter);
  return a;
}

describe("commerce routes — payment modes (T4.7, FR-170)", () => {
  it("GET /payment-modes resolves India Razorpay EMI + UPI", async () => {
    const res = await request(app()).get("/api/v1/commerce/payment-modes?geo=IN");
    expect(res.status).toBe(200);
    expect(res.body.geo).toBe("IN");
    expect(res.body.countryGroup).toBe("india");
    expect(res.body.fullPayProvider).toBe("razorpay");
    expect(res.body.installmentProviders).toEqual(["razorpay_emi"]);
    expect(res.body.localPaymentMethods).toContain("upi");
    expect(res.body.availableModes).toContain("installment");
  });

  it("GET /payment-modes omits installment for Singapore (FR-169)", async () => {
    const res = await request(app()).get("/api/v1/commerce/payment-modes?geo=SG");
    expect(res.status).toBe(200);
    expect(res.body.availableModes).toEqual(["full_pay"]);
    expect(res.body.installmentProviders).toEqual([]);
  });

  it("GET /payment-modes uses x-geo header when query omitted", async () => {
    const res = await request(app())
      .get("/api/v1/commerce/payment-modes")
      .set("x-geo", "GB");
    expect(res.status).toBe(200);
    expect(res.body.countryGroup).toBe("uk");
    expect(res.body.installmentProviders).toEqual(["klarna", "clearpay"]);
  });
});
