import app from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { prisma } from "./lib/prisma.js";

async function startServer() {
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;

    logger.info("Database connection established");

    const server = app.listen(env.PORT, () => {
      logger.info(
        {
          port: env.PORT,
          environment: env.NODE_ENV,
        },
        "LVN Atlas API started",
      );
    });

    const shutdown = async (signal: string) => {
      logger.info({ signal }, "Shutdown signal received");

      server.close(async () => {
        try {
          await prisma.$disconnect();

          logger.info("Database connection closed");
          process.exit(0);
        } catch (error) {
          logger.error({ error }, "Error during database disconnection");
          process.exit(1);
        }
      });
    };

    process.on("SIGINT", () => {
      void shutdown("SIGINT");
    });

    process.on("SIGTERM", () => {
      void shutdown("SIGTERM");
    });
  } catch (error) {
    logger.fatal({ error }, "Failed to start LVN Atlas API");

    await prisma.$disconnect();
    process.exit(1);
  }
}

void startServer();
