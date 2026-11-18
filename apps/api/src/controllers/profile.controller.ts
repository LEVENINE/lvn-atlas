import type { NextFunction, Request, Response } from "express";

import { Prisma } from "../generated/prisma/client.js";
import { AppError } from "../utils/app-error.js";
import { assertSameUser } from "../utils/authorization.js";
import { parseBody } from "../utils/validation.js";
import { profileService } from "../services/profile.service.js";
import { updateProfileSchema } from "../validators/profile.validator.js";

type ProfileParams = {
  id: string;
};

const OWN_PROFILE_ONLY = "You can only access your own profile";

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

    assertSameUser(req, profile.userId, OWN_PROFILE_ONLY);

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
    assertSameUser(req, req.params.id, OWN_PROFILE_ONLY);

    const profile = await profileService.getByUserId(req.params.id);

    if (!profile) {
      throw new AppError(404, "PROFILE_NOT_FOUND", "Profile not found");
    }

    res.status(200).json(profile);
  } catch (error) {
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

    assertSameUser(req, existingProfile.userId, OWN_PROFILE_ONLY);

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

    assertSameUser(req, existingProfile.userId, OWN_PROFILE_ONLY);

    await profileService.delete(req.params.id);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
