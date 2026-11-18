import type { NextFunction, Request, Response } from "express";

import { Prisma } from "../generated/prisma/client.js";
import { AppError } from "../utils/app-error.js";
import { parseBody } from "../utils/validation.js";
import { profileService } from "../services/profile.service.js";
import {
  createProfileSchema,
  updateProfileSchema,
} from "../validators/profile.validator.js";

type ProfileParams = {
  id: string;
};

export async function getAllProfiles(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const profiles = await profileService.getAll();

    res.status(200).json(profiles);
  } catch (error) {
    next(error);
  }
}

export async function getProfileById(
  req: Request<ProfileParams>,
  res: Response,
  next: NextFunction,
) {
  try {
    const profile = await profileService.getById(req.params.id);

    if (!profile) {
      throw new AppError(404, "PROFILE_NOT_FOUND", "Profile not found");
    }

    res.status(200).json(profile);
  } catch (error) {
    next(error);
  }
}

export async function getProfileByUserId(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    const profile = await profileService.getByUserId(req.params.id);

    if (!profile) {
      throw new AppError(404, "PROFILE_NOT_FOUND", "Profile not found");
    }

    res.status(200).json(profile);
  } catch (error) {
    next(error);
  }
}

export async function createProfile(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = parseBody(createProfileSchema, req.body);

    const profile = await profileService.create(data);

    res.status(201).json(profile);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002" || error.code === "P2014") {
        next(
          new AppError(
            409,
            "PROFILE_ALREADY_EXISTS",
            "A profile already exists for this user",
          ),
        );

        return;
      }

      if (error.code === "P2003" || error.code === "P2025") {
        next(new AppError(404, "USER_NOT_FOUND", "User not found"));

        return;
      }
    }

    next(error);
  }
}

export async function updateProfile(
  req: Request<ProfileParams>,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = parseBody(updateProfileSchema, req.body);

    const existingProfile = await profileService.getById(req.params.id);

    if (!existingProfile) {
      throw new AppError(404, "PROFILE_NOT_FOUND", "Profile not found");
    }

    const profile = await profileService.update(req.params.id, data);

    res.status(200).json(profile);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      next(new AppError(404, "PROFILE_NOT_FOUND", "Profile not found"));

      return;
    }

    next(error);
  }
}

export async function deleteProfile(
  req: Request<ProfileParams>,
  res: Response,
  next: NextFunction,
) {
  try {
    const existingProfile = await profileService.getById(req.params.id);

    if (!existingProfile) {
      throw new AppError(404, "PROFILE_NOT_FOUND", "Profile not found");
    }

    await profileService.delete(req.params.id);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
