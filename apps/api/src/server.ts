import { buildApp } from "./app.js";
import { loadApiConfig } from "./config.js";

const config = loadApiConfig();
async function start(): Promise<void> {
  const app = await buildApp(config);
  let closing = false;

  async function shutdown(signal: NodeJS.Signals): Promise<void> {
    if (closing) return;
    closing = true;
    app.log.info({ signal }, "shutting down API");

    try {
      await app.close();
    } catch (error) {
      app.log.error({ error }, "API shutdown failed");
      process.exitCode = 1;
    }
  }

  for (const signal of ["SIGINT", "SIGTERM"] as const) {
    process.once(signal, () => {
      void shutdown(signal);
    });
  }

  try {
    await app.listen({ host: config.host, port: config.port });
  } catch (error) {
    app.log.error({ error }, "API failed to start");
    await app.close();
    throw error;
  }
}

await start().catch((error: unknown) => {
  console.error("API initialization failed", error);
  process.exitCode = 1;
});
