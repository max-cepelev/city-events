import { z } from "zod";

const environment = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development")
  })
  .parse(process.env);

function waitForTermination(): Promise<NodeJS.Signals> {
  return new Promise((resolve) => {
    process.once("SIGINT", resolve);
    process.once("SIGTERM", resolve);
  });
}

console.info(
  `City Events bots process is ready in ${environment.NODE_ENV}; platform adapters are added in their functional stages`
);
const keepAliveTimer = setInterval(() => undefined, 60_000);
const signal = await waitForTermination();
clearInterval(keepAliveTimer);
console.info(`City Events bots process received ${signal}`);
