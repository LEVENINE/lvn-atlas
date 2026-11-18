import type { NextFunction, Request, Response } from "express";

import { Prisma } from "../generated/prisma/client.js";
import { AppError } from "../utils/app-error.js";
import { requireAuthenticatedUser } from "../utils/authorization.js";
import { parseBody } from "../utils/validation.js";
import { blueprintService } from "../services/blueprint.service.js";
import {
  createBlueprintSchema,
  updateBlueprintSchema,
} from "../validators/blueprint.validator.js";

type BlueprintParams = {
  id: string;
};

function notFoundError() {
  return new AppError(404, "BLUEPRINT_NOT_FOUND", "Blueprint not found");
}

function isCityReferenceError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2003"
  );
}

export async function getAllBlueprints(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const currentUser = requireAuthenticatedUser(req);

    const blueprints = await blueprintService.getAllByUserId(currentUser.id);

    res.status(200).json(blueprints);
  } catch (error) {
    next(error);
  }
}

export async function getBlueprintById(
  req: Request<BlueprintParams>,
  res: Response,
  next: NextFunction,
) {
  try {
    const currentUser = requireAuthenticatedUser(req);

    const blueprint = await blueprintService.getByIdForUser(
      req.params.id,
      currentUser.id,
    );

    if (!blueprint) {
      throw notFoundError();
    }

    res.status(200).json(blueprint);
  } catch (error) {
    next(error);
  }
}

export async function createBlueprint(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const currentUser = requireAuthenticatedUser(req);
    const data = parseBody(createBlueprintSchema, req.body);

    const blueprint = await blueprintService.create(currentUser.id, data);

    res.status(201).json(blueprint);
  } catch (error) {
    if (isCityReferenceError(error)) {
      next(
        new AppError(
          404,
          "CITY_NOT_FOUND",
          "Origin or destination city not found",
        ),
      );

      return;
    }

    next(error);
  }
}

export async function updateBlueprint(
  req: Request<BlueprintParams>,
  res: Response,
  next: NextFunction,
) {
  try {
    const currentUser = requireAuthenticatedUser(req);
    const data = parseBody(updateBlueprintSchema, req.body);

    const existingBlueprint = await blueprintService.getByIdForUser(
      req.params.id,
      currentUser.id,
    );

    if (!existingBlueprint) {
      throw notFoundError();
    }

    const originCityId = data.originCityId ?? existingBlueprint.originCityId;
    const destinationCityId =
      data.destinationCityId ?? existingBlueprint.destinationCityId;

    if (originCityId === destinationCityId) {
      throw new AppError(
        400,
        "VALIDATION_ERROR",
        "Origin and destination cities must be different",
      );
    }

    const blueprint = await blueprintService.update(req.params.id, data);

    res.status(200).json(blueprint);
  } catch (error) {
    if (isCityReferenceError(error)) {
      next(
        new AppError(
          404,
          "CITY_NOT_FOUND",
          "Origin or destination city not found",
        ),
      );

      return;
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      next(notFoundError());

      return;
    }

    next(error);
  }
}

export async function deleteBlueprint(
  req: Request<BlueprintParams>,
  res: Response,
  next: NextFunction,
) {
  try {
    const currentUser = requireAuthenticatedUser(req);

    const existingBlueprint = await blueprintService.getByIdForUser(
      req.params.id,
      currentUser.id,
    );

    if (!existingBlueprint) {
      throw notFoundError();
    }

    await blueprintService.delete(req.params.id);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
