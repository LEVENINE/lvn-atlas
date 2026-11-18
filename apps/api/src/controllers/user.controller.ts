import type { NextFunction, Request, Response } from "express";

import { Prisma } from "../generated/prisma/client.js";
import { AppError } from "../utils/app-error.js";
import { parseBody } from "../utils/validation.js";
import { userService } from "../services/user.service.js";
import {
  createUserSchema,
  updateUserSchema,
} from "../validators/user.validator.js";

type UserParams = {
  id: string;
};

export async function getAllUsers(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const users = await userService.getAll();

    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
}

export async function getUserById(
  req: Request<UserParams>,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = await userService.getById(req.params.id);

    if (!user) {
      throw new AppError(404, "USER_NOT_FOUND", "User not found");
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
}

export async function createUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = parseBody(createUserSchema, req.body);

    const user = await userService.create(data);

    res.status(201).json(user);
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

export async function updateUser(
  req: Request<UserParams>,
  res: Response,
  next: NextFunction,
) {
  try {
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
