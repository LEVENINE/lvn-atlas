import type { NextFunction, Request, Response } from "express";

import { Prisma } from "../generated/prisma/client.js";
import { authService } from "../services/auth.service.js";
import { AppError } from "../utils/app-error.js";
import { requireAuthenticatedUser } from "../utils/authorization.js";
import { parseBody } from "../utils/validation.js";
import { loginSchema, registerSchema } from "../validators/auth.validator.js";

export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = parseBody(registerSchema, req.body);

    const result = await authService.register(data);

    res.status(201).json(result);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      next(
        new AppError(
          409,
          "USER_EMAIL_ALREADY_EXISTS",
          "A user with this email already exists",
        ),
      );

      return;
    }

    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const data = parseBody(loginSchema, req.body);

    const result = await authService.login(data);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getCurrentUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const currentUser = requireAuthenticatedUser(req);

    const user = await authService.getCurrentUser(currentUser.id);

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
}
