import type { Request } from "express";

import type { AuthenticatedUser } from "../types/auth.js";
import { AppError } from "./app-error.js";

export function requireAuthenticatedUser(req: Request): AuthenticatedUser {
  if (!req.user) {
    throw new AppError(401, "UNAUTHORIZED", "Authentication required");
  }

  return req.user;
}

export function assertSameUser(
  req: Request,
  ownerId: string,
  message: string,
): void {
  const currentUser = requireAuthenticatedUser(req);

  if (currentUser.id !== ownerId) {
    throw new AppError(403, "FORBIDDEN", message);
  }
}
