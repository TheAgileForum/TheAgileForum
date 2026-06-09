import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { paymentsRouter } from "./payments.routes.js";

function app() {
  const a = express();
  a.use(express.json());
  a.use("/api/v1/payments", paymentsRouter);
  return a;
}

describe("payments routes (FR-174)", () => {
  it("POST /installment-plans returns plans for IN with Razorpay provider", async () => {
    const res = await request(app())
      .post("/api/v1/payments/installment-plans")
      .send({
        offer_id: "safe-leading-safe",
        currency: "INR",
        geo: "IN",
      });
    expect(res.status).toBe(200);
    expect(res.body.currency).toBe("INR");
    expect(res.body.plans.length).toBeGreaterThan(0);
    expect(res.body.provider).toBe("razorpay_emi");
    expect(res.body.disclaimerRef).toBe("gateway");
  });

  it("POST /installment-plans omits plans payload for SG geo", async () => {
    const res = await request(app())
      .post("/api/v1/payments/installment-plans")
      .send({
        amount: "400.00",
        currency: "SGD",
        geo: "SG",
      });
    expect(res.status).toBe(200);
    expect(res.body.plans).toBeUndefined();
    expect(res.body.provider).toBeUndefined();
  });

  it("POST /installment-plans accepts amount + geo without offer_id", async () => {
    const res = await request(app())
      .post("/api/v1/payments/installment-plans")
      .send({
        amount: "600.00",
        currency: "USD",
        geo: "US",
      });
    expect(res.status).toBe(200);
    expect(res.body.plans.length).toBeGreaterThan(0);
    expect(res.body.plans.map((p: { provider: string }) => p.provider)).toEqual([
      "affirm",
      "klarna",
    ]);
  });
});
