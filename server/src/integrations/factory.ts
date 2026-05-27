import { getEnv } from "../config/env.js";
import {
  LiveEmailAdapter,
  LiveStripeAdapter,
  LiveTelegramAdapter,
  LiveWebinarAdapter,
} from "./adapters.live.js";
import {
  StubEmailAdapter,
  StubStripeAdapter,
  StubTelegramAdapter,
  StubWebinarAdapter,
} from "./adapters.stub.js";
import type { EmailAdapter, StripeAdapter, TelegramAdapter, WebinarAdapter } from "./contracts.js";

export type IntegrationAdapters = {
  stripe: StripeAdapter;
  email: EmailAdapter;
  telegram: TelegramAdapter;
  webinar: WebinarAdapter;
};

export function createIntegrationAdapters(): IntegrationAdapters {
  const env = getEnv();
  if (env.INTEGRATION_PROVIDER_MODE === "live") {
    return {
      stripe: new LiveStripeAdapter(),
      email: new LiveEmailAdapter(),
      telegram: new LiveTelegramAdapter(),
      webinar: new LiveWebinarAdapter(),
    };
  }

  return {
    stripe: new StubStripeAdapter(),
    email: new StubEmailAdapter(),
    telegram: new StubTelegramAdapter(),
    webinar: new StubWebinarAdapter(),
  };
}
