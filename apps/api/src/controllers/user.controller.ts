import type { NextFunction, Request, Response } from "express";

import { Prisma } from "../generated/prisma/client.js";
import { AppError } from "../utils/app-error.js";
import { assertSameUser } from "../utils/authorization.js";
import { parseBody } from "../utils/validation.js";
import { userService } from "../services/user.service.js";
import { updateUserSchema } from "../validators/user.validator.js";

type UserParams = {
  id: string;
};

const OWN_RECORD_ONLY = "You can only access your own user record";

export async function getUserById(
  req: Request<UserParams>,
  res: Response,
  next: NextFunction,
) {
  try {
    assertSameUser(req, req.params.id, OWN_RECORD_ONLY);

    const user = await userService.getById(req.params.id);

    if (!user) {
      throw new AppError(404, "USER_NOT_FOUND", "User not found");
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
}

export async function updateUser(
  req: Request<UserParams>,
  res: Response,
  next: NextFunction,
) {
  try {
    assertSameUser(req, req.params.id, OWN_RECORD_ONLY);

    const data = parseBody(updateUserSchema, req.body);

    const existingUser = await userService.getById(req.params.id);

    if (!existingUser) {
      throw new AppError(404, "USER_NOT_FOUND", "User not found");
    }

    try {
      const user = await userService.update(req.params.id, data);

      res.status(200).json(user);
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
  } catch (error) {
    next(error);
  }
}

export async function deleteUser(
  req: Request<UserParams>,
  res: Response,
  next: NextFunction,
) {
  try {
    assertSameUser(req, req.params.id, OWN_RECORD_ONLY);

    const existingUser = await userService.getById(req.params.id);

    if (!existingUser) {
      throw new AppError(404, "USER_NOT_FOUND", "User not found");
    }

    await userService.delete(req.params.id);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
