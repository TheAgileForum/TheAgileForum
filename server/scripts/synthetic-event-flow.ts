import "dotenv/config";
import { publishEvent } from "../src/events/publisher.js";
import { prisma } from "../src/db/client.js";

async function main() {
  const syntheticIdempotencyKey = `synthetic-checkout-${Date.now()}`;
  const result = await publishEvent({
    eventName: "checkout.completed",
    source: "synthetic-flow",
    idempotencyKey: syntheticIdempotencyKey,
    payload: {
      orderNumber: `SYN-${Date.now()}`,
      currency: "USD",
      totalAmount: 100,
    },
  });

  const event = await prisma.eventLog.findUniqueOrThrow({
    where: { id: result.eventId },
  });
  const job = await prisma.jobRun.findUniqueOrThrow({
    where: { id: result.jobId },
  });

  console.log("Synthetic event flow result:");
  console.log(
    JSON.stringify(
      {
        published: result,
        event: {
          id: event.id,
          eventName: event.eventName,
          status: event.status,
        },
        job: {
          id: job.id,
          queue: job.queue,
          status: job.status,
          runAt: job.runAt.toISOString(),
        },
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
