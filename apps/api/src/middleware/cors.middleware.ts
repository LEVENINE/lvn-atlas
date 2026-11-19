import cors from "cors";

import { env } from "../config/env.js";

const configuredOrigins = env.CORS_ORIGIN.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

/**
 * A wildcard reflects the caller's origin, which keeps `*` usable without
 * allowing credentialed requests. Otherwise only the listed origins are echoed.
 */
export const corsMiddleware = cors({
  origin: configuredOrigins.includes("*") ? true : configuredOrigins,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 600,
});
