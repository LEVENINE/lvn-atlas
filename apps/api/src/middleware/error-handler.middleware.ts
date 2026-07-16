import type {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from "express";

import { logger } from "../config/logger.js";

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  logger.error({ err: error }, "Unhandled application error");

  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred",
    },
  });
};