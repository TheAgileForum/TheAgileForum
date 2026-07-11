import cookieParser from "cookie-parser";
import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { SESSION_CURRENCY_COOKIE } from "../pricing/pricing-service.js";
import { pricingRouter } from "./pricing.routes.js";

function app() {
  const a = express();
  a.use(express.json());
  a.use(cookieParser());
  a.use("/api/v1/pricing", pricingRouter);
  return a;
}

describe("pricing routes (FR-178)", () => {
  it("GET /currency-context geo-detects INR for India", async () => {
    const res = await request(app()).get("/api/v1/pricing/currency-context?geo=IN");
    expect(res.status).toBe(200);
    expect(res.body.currency).toBe("INR");
    expect(res.body.source).toBe("geo");
  });

  it("GET /currency-context geo-detects INR from cf-ipcountry header only", async () => {
    const res = await request(app())
      .get("/api/v1/pricing/currency-context")
      .set("cf-ipcountry", "IN");
    expect(res.status).toBe(200);
    expect(res.body.currency).toBe("INR");
    expect(res.body.geoDetected).toBe("IN");
    expect(res.body.source).toBe("geo");
  });

  it("GET /context is an alias for currency-context", async () => {
    const res = await request(app()).get("/api/v1/pricing/context?geo=US");
    expect(res.status).toBe(200);
    expect(res.body.currency).toBe("USD");
  });

  it("GET /currency-context honors currency_override", async () => {
    const res = await request(app()).get(
      "/api/v1/pricing/currency-context?geo=IN&currency_override=USD",
    );
    expect(res.status).toBe(200);
    expect(res.body.currency).toBe("USD");
    expect(res.body.source).toBe("user");
  });

  it("GET /currency-context reads session currency cookie", async () => {
    const res = await request(app())
      .get("/api/v1/pricing/currency-context?geo=IN")
      .set("Cookie", `${SESSION_CURRENCY_COOKIE}=EUR`);
    expect(res.status).toBe(200);
    expect(res.body.currency).toBe("EUR");
    expect(res.body.source).toBe("user");
  });

  it("POST /session-currency persists override in cookie", async () => {
    const res = await request(app())
      .post("/api/v1/pricing/session-currency")
      .send({ currency: "GBP", geo: "GB" });
    expect(res.status).toBe(200);
    expect(res.body.currency).toBe("GBP");
    expect(res.body.saved).toBe(true);
    expect(res.headers["set-cookie"]?.join(";")).toContain(SESSION_CURRENCY_COOKIE);
  });

  it("GET /currency-context geo-detects CAD for Canada", async () => {
    const res = await request(app()).get("/api/v1/pricing/currency-context?geo=CA");
    expect(res.status).toBe(200);
    expect(res.body.currency).toBe("CAD");
    expect(res.body.source).toBe("geo");
  });

  it("GET /currency-context geo-detects IDR for Indonesia", async () => {
    const res = await request(app()).get("/api/v1/pricing/currency-context?geo=ID");
    expect(res.status).toBe(200);
    expect(res.body.currency).toBe("IDR");
  });

  it("POST /quote returns single-currency quotes", async () => {
    const res = await request(app())
      .post("/api/v1/pricing/quote")
      .send({
        offerIds: ["exam-mock-certification"],
        currency: "USD",
        geo: "US",
      });
    expect(res.status).toBe(200);
    expect(res.body.currency).toBe("USD");
    expect(res.body.quotes[0].currency).toBe("USD");
  });
});
