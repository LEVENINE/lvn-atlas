import "dotenv/config";
import { logger } from "./config/logger.js";

import app from "./app.js";
import { env } from "./config/env.js";

app.listen(env.PORT, () => {
  logger.info(
    {
      port: env.PORT,
      environment: env.NODE_ENV,
    },
    "LVN Atlas API started",
  );
});
