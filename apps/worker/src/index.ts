import { createDatabase } from "@city-events/db";
import { createQueueConnection } from "@city-events/queue";
import { z } from "zod";

const environment = z
  .object({
    DATABASE_URL: z.string().startsWith("postgres"),
    REDIS_URL: z.string().startsWith("redis")
  })
  .parse(process.env);

const database = createDatabase({ connectionString: environment.DATABASE_URL });
const redis = createQueueConnection({
  connectionName: "city-events-worker",
  url: environment.REDIS_URL
});

function waitForTermination(): Promise<NodeJS.Signals> {
  return new Promise((resolve) => {
    process.once("SIGINT", resolve);
    process.once("SIGTERM", resolve);
  });
}

try {
  await redis.connect();
  await Promise.all([database.ping(), redis.ping()]);
  console.info("City Events worker infrastructure is ready");

  const signal = await waitForTermination();
  console.info(`City Events worker received ${signal}`);
} finally {
  await Promise.allSettled([
    database.close(),
    redis.status === "end" ? Promise.resolve() : redis.quit()
  ]);
}
