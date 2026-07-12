import { createHmac } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { resetRateLimitBuckets } from "../middleware/rate-limit.js";
import request from "supertest";
import { createApp } from "../app.js";
import { prisma } from "../db/client.js";

const hasDb = Boolean(process.env.DATABASE_URL);
const serverRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");
const savedPaymentEnv = {
  razorpayKeyId: process.env.RAZORPAY_KEY_ID,
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET,
  stripeSecret: process.env.STRIPE_SECRET_KEY,
};

describe.skipIf(!hasDb)("commerce integration (Sprint 1)", () => {
  const app = createApp();

  beforeAll(() => {
    execSync("npx tsx prisma/seed.ts", {
      cwd: serverRoot,
      stdio: "inherit",
      env: process.env,
    });
  });

  beforeEach(() => {
    resetRateLimitBuckets();
    delete process.env.RAZORPAY_KEY_ID;
    delete process.env.RAZORPAY_KEY_SECRET;
    delete process.env.STRIPE_SECRET_KEY;
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    if (savedPaymentEnv.razorpayKeyId !== undefined) {
      process.env.RAZORPAY_KEY_ID = savedPaymentEnv.razorpayKeyId;
    } else {
      delete process.env.RAZORPAY_KEY_ID;
    }
    if (savedPaymentEnv.razorpayKeySecret !== undefined) {
      process.env.RAZORPAY_KEY_SECRET = savedPaymentEnv.razorpayKeySecret;
    } else {
      delete process.env.RAZORPAY_KEY_SECRET;
    }
    if (savedPaymentEnv.stripeSecret !== undefined) {
      process.env.STRIPE_SECRET_KEY = savedPaymentEnv.stripeSecret;
    } else {
      delete process.env.STRIPE_SECRET_KEY;
    }
    vi.unstubAllGlobals();
  });

  const loginCustomer = async () => {
    const agent = request.agent(app);
    await agent
      .post("/api/v1/auth/login")
      .send({ email: "customer@demo.local", password: "password123" })
      .expect(200);
    return agent;
  };

  it("requires authentication for checkout start (FR-151)", async () => {
    const res = await request(app)
      .post("/api/v1/commerce/checkout/start")
      .send({ variant: "standard" });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHENTICATED");
  });

  it("auto-fills scheduleRef from upcomingBatchId when omitted (schedule-bound offering)", async () => {
    const agent = await loginCustomer();
    const res = await agent.post("/api/v1/commerce/cart/items").send({
      offeringCode: "course-agile-fundamentals",
    });
    expect(res.status).toBe(201);
    expect(res.body.item.scheduleRef).toBe("batch-1-jul-2026");
    expect(res.body.cart.items.some(
      (line: { offeringCode: string; scheduleRef: string | null }) =>
        line.offeringCode === "course-agile-fundamentals" &&
        line.scheduleRef === "batch-1-jul-2026",
    )).toBe(true);
  });

  it("returns 402 for paid mock exam access without entitlement (FR-85–87)", async () => {
    const email = `exam-402-${Date.now()}@demo.local`;
    await request(app).post("/api/v1/auth/register").send({
      email,
      password: "password123",
      policyVersion: "v1",
      acceptTerms: true,
    });
    const agent = request.agent(app);
    await agent
      .post("/api/v1/auth/login")
      .send({ email, password: "password123" })
      .expect(200);
    const res = await agent.post("/api/v1/commerce/exam/access").send({
      offeringCode: "exam-mock-certification",
    });
    expect(res.status).toBe(402);
    expect(res.body.error.code).toBe("EXAM_PAYMENT_REQUIRED");
  });

  it("grants free skill assessment exam access (FR-85)", async () => {
    const agent = await loginCustomer();
    const res = await agent.post("/api/v1/commerce/exam/access").send({
      offeringCode: "exam-practice-free",
    });
    expect(res.status).toBe(200);
    expect(res.body.access.granted).toBe(true);
    expect(res.body.access.examAccess).toBe("free");
  });

  it("preserves cart items after checkout start when payment is not completed", async () => {
    const email = `cart-preserve-${Date.now()}@demo.local`;
    await request(app)
      .post("/api/v1/auth/register")
      .send({
        email,
        password: "password123",
        policyVersion: "v1",
        acceptTerms: true,
      });
    const agent = request.agent(app);
    await agent
      .post("/api/v1/auth/login")
      .send({ email, password: "password123" })
      .expect(200);

    await agent.post("/api/v1/commerce/cart/items").send({
      offeringCode: "exam-practice-free",
      quantity: 1,
    });

    const start = await agent
      .post("/api/v1/commerce/checkout/start")
      .send({ variant: "standard" });
    expect(start.status).toBe(201);

    const cartRes = await agent.get("/api/v1/commerce/cart");
    expect(cartRes.status).toBe(200);
    expect(cartRes.body.cart.items).toHaveLength(1);
    expect(cartRes.body.cart.items[0].offeringCode).toBe("exam-practice-free");
    expect(cartRes.body.cart.status).toBe("active");

    const order = await prisma.order.findUnique({
      where: { id: start.body.orderId as string },
    });
    expect(order?.status).toBe("checkout_started");
  });

  it("preserves cart after failed Razorpay payment confirmation", async () => {
    process.env.RAZORPAY_KEY_ID = "rzp_test_integration_key";
    process.env.RAZORPAY_KEY_SECRET = "rzp_test_integration_secret";
    const providerOrderId = "order_failed_payment_1";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          id: providerOrderId,
          amount: 166500,
          currency: "INR",
          status: "created",
        }),
      }),
    );

    const email = `cart-razorpay-fail-${Date.now()}@demo.local`;
    await request(app)
      .post("/api/v1/auth/register")
      .send({
        email,
        password: "password123",
        policyVersion: "v1",
        acceptTerms: true,
      });
    const agent = request.agent(app);
    await agent
      .post("/api/v1/auth/login")
      .send({ email, password: "password123" })
      .expect(200);

    await agent.post("/api/v1/commerce/cart/items?geo=IN").send({
      offeringCode: "exam-mock-certification",
      quantity: 1,
    });

    const start = await agent.post("/api/v1/commerce/checkout/start?geo=IN").send({
      variant: "standard",
    });
    expect(start.status).toBe(201);

    const confirm = await agent.post("/api/v1/commerce/checkout/razorpay/confirm").send({
      orderId: start.body.orderId,
      razorpayOrderId: providerOrderId,
      razorpayPaymentId: "pay_bad",
      razorpaySignature: "deadbeef",
    });
    expect(confirm.status).toBe(400);
    expect(confirm.body.error.code).toBe("RAZORPAY_SIGNATURE_INVALID");

    const cartRes = await agent.get("/api/v1/commerce/cart");
    expect(cartRes.status).toBe(200);
    expect(cartRes.body.cart.items).toHaveLength(1);
    expect(cartRes.body.cart.items[0].offeringCode).toBe("exam-mock-certification");
  });

  it("completes checkout and publishes enrollment events", async () => {
    const agent = await loginCustomer();
    const email = `s1-checkout-${Date.now()}@demo.local`;
    await request(app)
      .post("/api/v1/auth/register")
      .send({
        email,
        password: "password123",
        policyVersion: "v1",
        acceptTerms: true,
      });

    const regAgent = request.agent(app);
    await regAgent
      .post("/api/v1/auth/login")
      .send({ email, password: "password123" })
      .expect(200);

    await regAgent.post("/api/v1/commerce/cart/items").send({
      offeringCode: "exam-practice-free",
      quantity: 1,
    });

    const start = await regAgent
      .post("/api/v1/commerce/checkout/start")
      .send({ variant: "standard" });
    expect(start.status).toBe(201);
    expect(start.body.orderNumber).toMatch(/^ORD-/);

    const complete = await regAgent.post("/api/v1/commerce/checkout/complete").send({
      orderId: start.body.orderId,
    });
    expect(complete.status).toBe(200);
    expect(complete.body.order.status).toBe("paid");

    const events = await prisma.eventLog.findMany({
      where: {
        eventName: {
          in: [
            "enrollment.order_confirmed",
            "notification.enrollment_welcome",
            "notification.enrollment_delivered",
          ],
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    expect(events.some((e) => e.eventName === "enrollment.order_confirmed")).toBe(true);
    expect(events.some((e) => e.eventName === "notification.enrollment_welcome")).toBe(true);
    expect(events.some((e) => e.eventName === "notification.enrollment_delivered")).toBe(true);
  });

  it("marks order paid when Stripe checkout.session.completed webhook fires", async () => {
    const agent = await loginCustomer();
    await agent.post("/api/v1/commerce/cart/items").send({
      offeringCode: "exam-practice-free",
      quantity: 1,
    });

    const start = await agent
      .post("/api/v1/commerce/checkout/start")
      .send({ variant: "standard" });
    expect(start.status).toBe(201);
    const orderId = start.body.orderId as string;

    const webhookPayload = {
      id: "evt_stripe_checkout_1",
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_session_1",
          client_reference_id: orderId,
          metadata: { order_id: orderId },
        },
      },
    };

    const webhook = await request(app)
      .post("/api/v1/integrations/stripe/webhook")
      .set("content-type", "application/json")
      .set("stripe-signature", "stub-valid-signature")
      .send(webhookPayload);
    expect(webhook.status).toBe(202);

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    expect(order?.status).toBe("paid");
    expect(order?.paymentRef).toContain("stripe:cs_test_session_1");
  });

  it("completes org reimbursement checkout for SAFe offering", async () => {
    const agent = await loginCustomer();

    await agent.post("/api/v1/commerce/cart/items").send({
      offeringCode: "safe-leading-safe",
      scheduleRef: "cohort-2026-06",
    });

    const start = await agent.post("/api/v1/commerce/checkout/start").send({
      variant: "org_reimbursement",
      orgReimbursement: {
        organizationName: "Acme Corp",
        purchaseOrderNumber: "PO-9001",
        billingContactEmail: "billing@acme.example",
      },
    });
    expect(start.status).toBe(201);
    expect(start.body.variant).toBe("org_reimbursement");

    const complete = await agent.post("/api/v1/commerce/checkout/complete").send({
      orderId: start.body.orderId,
      paymentRef: "org-po-PO-9001",
    });
    expect(complete.status).toBe(200);
    expect(complete.body.order.status).toBe("paid");
    expect(complete.body.order.paymentRef).toBe("org-po-PO-9001");
  });

  it("allows guest add-to-cart without authentication (FR-165)", async () => {
    const agent = request.agent(app);
    const res = await agent.post("/api/v1/commerce/cart/guest/items").send({
      offeringCode: "exam-practice-free",
      quantity: 1,
    });
    expect(res.status).toBe(201);
    expect(res.body.cart.items).toHaveLength(1);
    expect(res.body.cart.items[0].offeringCode).toBe("exam-practice-free");
    const guestCookie = res.headers["set-cookie"];
    expect(guestCookie?.some((c: string) => c.startsWith("guest_cart_session="))).toBe(true);
  });

  it("auto-merges guest cart on login without losing items (FR-165, FR-166)", async () => {
    const guestAgent = request.agent(app);
    await guestAgent.post("/api/v1/commerce/cart/guest/items").send({
      offeringCode: "exam-practice-free",
      quantity: 1,
    });
    await guestAgent.post("/api/v1/commerce/cart/guest/items").send({
      offeringCode: "service-mock-interview-sm",
      scheduleRef: "mock-sm-slots",
      quantity: 1,
    });

    await guestAgent
      .post("/api/v1/auth/login")
      .send({ email: "customer@demo.local", password: "password123" })
      .expect(200);

    const cartRes = await guestAgent.get("/api/v1/commerce/cart");
    expect(cartRes.status).toBe(200);
    expect(cartRes.body.cart.items.length).toBeGreaterThanOrEqual(2);
    const codes = cartRes.body.cart.items.map(
      (i: { offeringCode: string }) => i.offeringCode,
    );
    expect(codes).toContain("exam-practice-free");
    expect(codes).toContain("service-mock-interview-sm");

    const guestCart = await prisma.guestCart.findFirst({
      where: { status: "merged" },
      orderBy: { updatedAt: "desc" },
    });
    expect(guestCart).not.toBeNull();
    const remainingGuestItems = await prisma.guestCartItem.count({
      where: { guestCartId: guestCart!.id },
    });
    expect(remainingGuestItems).toBe(0);
  });

  it("merges guest cart via explicit /cart/merge endpoint", async () => {
    const agent = await loginCustomer();

    const emptyMerge = await agent.post("/api/v1/commerce/cart/merge");
    expect(emptyMerge.status).toBe(200);
    expect(emptyMerge.body.merged).toBe(false);

    await agent.post("/api/v1/commerce/cart/guest/items").send({
      offeringCode: "exam-practice-free",
      quantity: 2,
    });

    const mergeRes = await agent.post("/api/v1/commerce/cart/merge");
    expect(mergeRes.status).toBe(200);
    expect(mergeRes.body.merged).toBe(true);
    const freeItem = mergeRes.body.cart.items.find(
      (i: { offeringCode: string }) => i.offeringCode === "exam-practice-free",
    );
    expect(freeItem).toBeDefined();
    expect(freeItem.quantity).toBeGreaterThanOrEqual(2);

    const guestCart = await prisma.guestCart.findFirst({
      where: { status: "merged" },
      orderBy: { updatedAt: "desc" },
    });
    expect(guestCart).not.toBeNull();
  });

  it("increments quantity when adding the same cart line twice (idempotency)", async () => {
    const email = `cart-idem-${Date.now()}@demo.local`;
    await request(app)
      .post("/api/v1/auth/register")
      .send({
        email,
        password: "password123",
        policyVersion: "v1",
        acceptTerms: true,
      })
      .expect(201);

    const agent = request.agent(app);
    await agent
      .post("/api/v1/auth/login")
      .send({ email, password: "password123" })
      .expect(200);

    await agent.post("/api/v1/commerce/cart/items").send({
      offeringCode: "exam-practice-free",
      quantity: 1,
    });
    await agent.post("/api/v1/commerce/cart/items").send({
      offeringCode: "exam-practice-free",
      quantity: 2,
    });

    const cartRes = await agent.get("/api/v1/commerce/cart");
    expect(cartRes.status).toBe(200);
    const freeLines = cartRes.body.cart.items.filter(
      (i: { offeringCode: string }) => i.offeringCode === "exam-practice-free",
    );
    expect(freeLines).toHaveLength(1);
    expect(freeLines[0].quantity).toBe(3);
  });

  it("auto-merges guest cart on register (FR-165)", async () => {
    const guestAgent = request.agent(app);
    await guestAgent.post("/api/v1/commerce/cart/guest/items").send({
      offeringCode: "exam-practice-free",
      quantity: 1,
    });

    const email = `guest-reg-${Date.now()}@demo.local`;
    await guestAgent
      .post("/api/v1/auth/register")
      .send({
        email,
        password: "password123",
        policyVersion: "v1",
        acceptTerms: true,
      })
      .expect(201);

    const cartRes = await guestAgent.get("/api/v1/commerce/cart");
    expect(cartRes.status).toBe(200);
    expect(cartRes.body.cart.items).toHaveLength(1);
    expect(cartRes.body.cart.items[0].offeringCode).toBe("exam-practice-free");
  });

  it("exposes lineCount on guest cart for global badge (FR-177)", async () => {
    const agent = request.agent(app);
    await agent.post("/api/v1/commerce/cart/guest/items").send({
      offeringCode: "exam-practice-free",
      quantity: 2,
    });
    const cartRes = await agent.get("/api/v1/commerce/cart/guest");
    expect(cartRes.status).toBe(200);
    expect(cartRes.body.cart.lineCount).toBe(2);
  });

  it("records commerceJourneyOrigin on guest cart add (FR-176)", async () => {
    const res = await request(app)
      .post("/api/v1/commerce/cart/guest/items")
      .send({
        offeringCode: "exam-practice-free",
        commerceJourneyOrigin: "catalog_certifications",
      });
    expect(res.status).toBe(201);
    expect(res.body.commerceJourneyOrigin).toBe("catalog_certifications");
  });

  it("returns commerceJourneyOrigin on checkout start (FR-176)", async () => {
    const agent = await loginCustomer();
    await agent.post("/api/v1/commerce/cart/items").send({
      offeringCode: "exam-practice-free",
      quantity: 1,
    });
    const checkout = await agent.post("/api/v1/commerce/checkout/start").send({
      variant: "standard",
      commerceJourneyOrigin: "guided",
    });
    expect(checkout.status).toBe(201);
    expect(checkout.body.commerceJourneyOrigin).toBe("guided");
  });

  it("routes IN geo checkout to Razorpay stub provider", async () => {
    const agent = await loginCustomer();
    await agent.post("/api/v1/commerce/cart/items").send({
      offeringCode: "exam-practice-free",
      quantity: 1,
    });
    const checkout = await agent
      .post("/api/v1/commerce/checkout/start?geo=IN")
      .send({ variant: "standard" });
    expect(checkout.status).toBe(201);
    expect(checkout.body.paymentProvider).toBe("razorpay");
    expect(checkout.body.razorpayPaymentRef).toMatch(/^razorpay:/);
    expect(checkout.body.razorpayCheckoutUrl).toContain("/checkout/razorpay/stub");
    expect(checkout.body.stripeCheckoutUrl).toBeNull();
  });

  it("installment-plans API matches checkout EMI amounts (FR-174)", async () => {
    const plansRes = await request(app)
      .post("/api/v1/payments/installment-plans")
      .send({
        offer_id: "exam-mock-certification",
        currency: "INR",
        geo: "IN",
      });
    expect(plansRes.status).toBe(200);
    expect(plansRes.body.plans?.length).toBeGreaterThan(0);

    const agent = await loginCustomer();
    await agent.post("/api/v1/commerce/cart/items?geo=IN").send({
      offeringCode: "exam-mock-certification",
      quantity: 1,
    });
    const checkout = await agent
      .post("/api/v1/commerce/checkout/start?geo=IN")
      .send({
        variant: "standard",
        paymentMode: "installment",
        installmentProvider: "razorpay_emi",
      });
    expect(checkout.status).toBe(201);
    expect(checkout.body.razorpayEmiPlans?.[0]?.monthlyAmount).toBe(
      plansRes.body.plans[0].monthlyAmount,
    );
  });

  it("returns razorpayEmiPlans stub for IN installment checkout (FR-170)", async () => {
    const agent = await loginCustomer();
    await agent.post("/api/v1/commerce/cart/items").send({
      offeringCode: "exam-mock-certification",
      quantity: 1,
    });
    const checkout = await agent
      .post("/api/v1/commerce/checkout/start?geo=IN")
      .send({
        variant: "standard",
        paymentMode: "installment",
        installmentProvider: "razorpay_emi",
      });
    expect(checkout.status).toBe(201);
    expect(checkout.body.paymentMode).toBe("installment");
    expect(checkout.body.installmentProvider).toBe("razorpay_emi");
    expect(checkout.body.paymentProvider).toBe("razorpay");
    expect(checkout.body.razorpayEmiPlans).toEqual([
      {
        provider: "razorpay_emi",
        monthlyAmount: expect.stringMatching(/^\d+\.\d{2}$/),
        currency: "INR",
      },
    ]);
    expect(checkout.body.razorpayCheckoutUrl).toContain("/checkout/razorpay/stub");
    expect(checkout.body.stripeCheckoutUrl).toBeNull();
  });

  describe("Razorpay live sandbox path (FR-170)", () => {
    const originalKeyId = process.env.RAZORPAY_KEY_ID;
    const originalKeySecret = process.env.RAZORPAY_KEY_SECRET;
    const testKeyId = "rzp_test_integration_key";
    const testSecret = "rzp_test_integration_secret";
    const providerOrderId = "order_live_integration_1";

    afterEach(() => {
      process.env.RAZORPAY_KEY_ID = originalKeyId;
      process.env.RAZORPAY_KEY_SECRET = originalKeySecret;
      vi.unstubAllGlobals();
    });

    it("creates live session, checkout-config, and confirms signed payment (EMI)", async () => {
      process.env.RAZORPAY_KEY_ID = testKeyId;
      process.env.RAZORPAY_KEY_SECRET = testSecret;
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => ({
            id: providerOrderId,
            amount: 166500,
            currency: "INR",
            status: "created",
          }),
        }),
      );

      const agent = await loginCustomer();
      await agent.post("/api/v1/commerce/cart/items?geo=IN").send({
        offeringCode: "exam-mock-certification",
        quantity: 1,
      });

      const checkout = await agent.post("/api/v1/commerce/checkout/start?geo=IN").send({
        variant: "standard",
        paymentMode: "installment",
        installmentProvider: "razorpay_emi",
      });
      expect(checkout.status).toBe(201);
      expect(checkout.body.razorpayCheckout?.mode).toBe("live");
      expect(checkout.body.razorpayCheckoutUrl).toContain("/checkout/razorpay?");
      expect(checkout.body.razorpayCheckoutUrl).not.toContain("/stub");
      expect(checkout.body.razorpayPaymentRef).toBe(`razorpay:pending:${providerOrderId}`);

      const configRes = await agent.get(
        `/api/v1/commerce/razorpay/checkout-config/${checkout.body.orderId}`,
      );
      expect(configRes.status).toBe(200);
      expect(configRes.body.config.providerOrderId).toBe(providerOrderId);
      expect(configRes.body.config.keyId).toBe(testKeyId);
      expect(configRes.body.config.mode).toBe("live");

      const paymentId = "pay_integration_test";
      const signature = createHmac("sha256", testSecret)
        .update(`${providerOrderId}|${paymentId}`)
        .digest("hex");

      const confirm = await agent.post("/api/v1/commerce/checkout/razorpay/confirm").send({
        orderId: checkout.body.orderId,
        razorpayOrderId: providerOrderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: signature,
        paymentMode: "installment",
      });
      expect(confirm.status).toBe(200);
      expect(confirm.body.order.status).toBe("paid");
      expect(confirm.body.order.paymentRef).toBe(`razorpay:${providerOrderId}:${paymentId}`);

      const orderRow = await prisma.order.findUnique({
        where: { id: checkout.body.orderId },
      });
      expect(orderRow?.status).toBe("paid");
    });

    it("rejects Razorpay confirm when signature is invalid", async () => {
      process.env.RAZORPAY_KEY_ID = testKeyId;
      process.env.RAZORPAY_KEY_SECRET = testSecret;
      const invalidSigOrderId = "order_live_integration_invalid_sig";
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => ({
            id: invalidSigOrderId,
            amount: 166500,
            currency: "INR",
            status: "created",
          }),
        }),
      );

      const agent = await loginCustomer();
      await agent.post("/api/v1/commerce/cart/items?geo=IN").send({
        offeringCode: "exam-mock-certification",
        quantity: 1,
      });
      const checkout = await agent.post("/api/v1/commerce/checkout/start?geo=IN").send({
        variant: "standard",
      });
      expect(checkout.status).toBe(201);

      const confirm = await agent.post("/api/v1/commerce/checkout/razorpay/confirm").send({
        orderId: checkout.body.orderId,
        razorpayOrderId: invalidSigOrderId,
        razorpayPaymentId: "pay_bad",
        razorpaySignature: "deadbeef",
      });
      expect(confirm.status).toBe(400);
      expect(confirm.body.error.code).toBe("RAZORPAY_SIGNATURE_INVALID");
    });
  });

  describe("Stripe live sandbox path", () => {
    const originalSecret = process.env.STRIPE_SECRET_KEY;

    afterEach(() => {
      process.env.STRIPE_SECRET_KEY = originalSecret;
      vi.unstubAllGlobals();
    });

    it("creates live session and confirms paid session", async () => {
      process.env.STRIPE_SECRET_KEY = "sk_test_integration";
      const sessionId = "cs_test_integration";
      const fetchMock = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: sessionId,
          url: "https://checkout.stripe.com/c/pay/cs_test_integration",
        }),
      });
      vi.stubGlobal("fetch", fetchMock);

      const agent = await loginCustomer();
      await agent.post("/api/v1/commerce/cart/items?geo=US").send({
        offeringCode: "exam-mock-certification",
        quantity: 1,
      });
      const checkout = await agent.post("/api/v1/commerce/checkout/start?geo=US").send({
        variant: "standard",
      });
      expect(checkout.status).toBe(201);
      expect(checkout.body.paymentProvider).toBe("stripe");
      expect(checkout.body.stripeCheckout?.mode).toBe("live");
      expect(checkout.body.stripeCheckoutUrl).toContain("checkout.stripe.com");
      expect(checkout.body.stripePaymentRef).toBe(`stripe:pending:${sessionId}`);

      const orderId = checkout.body.orderId as string;
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: sessionId,
          payment_status: "paid",
          status: "complete",
          client_reference_id: orderId,
          metadata: { order_id: orderId },
        }),
      });

      const confirm = await agent.post("/api/v1/commerce/checkout/stripe/confirm").send({
        orderId,
        stripeSessionId: sessionId,
      });
      expect(confirm.status).toBe(200);
      expect(confirm.body.order.status).toBe("paid");
      expect(confirm.body.order.paymentRef).toBe(`stripe:${sessionId}:confirm`);
    });
  });
});
