import type { NextFunction, Request, Response } from "express";

import { AppError } from "../utils/app-error.js";
import { verifyAccessToken } from "../utils/token.js";

const BEARER_PREFIX = "Bearer ";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;

    if (!header?.startsWith(BEARER_PREFIX)) {
      throw new AppError(401, "UNAUTHORIZED", "Missing bearer token");
    }

    const token = header.slice(BEARER_PREFIX.length).trim();

    if (!token) {
      throw new AppError(401, "UNAUTHORIZED", "Missing bearer token");
    }

    const payload = verifyAccessToken(token);

    req.user = {
      id: payload.sub,
      email: payload.email,
    };

    next();
  } catch (error) {
    next(error);
  }
}
