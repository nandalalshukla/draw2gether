import "dotenv/config";
import { createAuthHero } from "./createAuthHero";
import { logger } from "./lib/logger";

async function main() {
  const { app, shutdown } = await createAuthHero();
  const port = Number(process.env.PORT ?? 5000);

  const server = app.listen(port, () => {
    logger.info({ port }, "AuthHero server running");
  });

  const gracefulShutdown = async (signal: string) => {
    logger.info({ signal }, "Shutting down AuthHero server");
    server.close();
    await shutdown();
    process.exit(0);
  };

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
}

main().catch((error) => {
  logger.error({ error }, "Failed to start AuthHero");
  process.exit(1);
});
