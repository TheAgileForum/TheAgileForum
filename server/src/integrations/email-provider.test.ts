import { afterEach, describe, expect, it } from "vitest";
import {
  getEmailFromName,
  getSenderApiToken,
  resolveTransactionalEmailProvider,
} from "./email-provider.js";

describe("email provider resolution", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("defaults to stub when no credentials", () => {
    delete process.env.EMAIL_PROVIDER;
    delete process.env.RESEND_API_KEY;
    delete process.env.SENDER_API_TOKEN;
    delete process.env.SENDER_API_KEY;
    expect(resolveTransactionalEmailProvider()).toBe("stub");
  });

  it("auto-selects resend when RESEND_API_KEY is set", () => {
    delete process.env.EMAIL_PROVIDER;
    process.env.RESEND_API_KEY = "re_test";
    delete process.env.SENDER_API_TOKEN;
    expect(resolveTransactionalEmailProvider()).toBe("resend");
  });

  it("auto-selects sender when only Sender token is set", () => {
    delete process.env.EMAIL_PROVIDER;
    delete process.env.RESEND_API_KEY;
    process.env.SENDER_API_TOKEN = "tok_test";
    expect(resolveTransactionalEmailProvider()).toBe("sender");
  });

  it("prefers resend over sender when both keys set and no EMAIL_PROVIDER", () => {
    delete process.env.EMAIL_PROVIDER;
    process.env.RESEND_API_KEY = "re_test";
    process.env.SENDER_API_TOKEN = "tok_test";
    expect(resolveTransactionalEmailProvider()).toBe("resend");
  });

  it("honors EMAIL_PROVIDER=sender when token present", () => {
    process.env.EMAIL_PROVIDER = "sender";
    process.env.RESEND_API_KEY = "re_test";
    process.env.SENDER_API_TOKEN = "tok_test";
    expect(resolveTransactionalEmailProvider()).toBe("sender");
  });

  it("stubs when EMAIL_PROVIDER=sender but token missing", () => {
    process.env.EMAIL_PROVIDER = "sender";
    delete process.env.SENDER_API_TOKEN;
    delete process.env.SENDER_API_KEY;
    process.env.RESEND_API_KEY = "re_test";
    expect(resolveTransactionalEmailProvider()).toBe("stub");
  });

  it("accepts SENDER_API_KEY as alias for token", () => {
    delete process.env.SENDER_API_TOKEN;
    process.env.SENDER_API_KEY = "alias_tok";
    expect(getSenderApiToken()).toBe("alias_tok");
  });

  it("defaults EMAIL_FROM_NAME to The Agile Forum", () => {
    delete process.env.EMAIL_FROM_NAME;
    expect(getEmailFromName()).toBe("The Agile Forum");
  });
});
