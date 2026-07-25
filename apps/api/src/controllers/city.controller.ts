import type { NextFunction, Request, Response } from "express";

import { AppError } from "../utils/app-error.js";
import { cityService } from "../services/city.service.js";

type CityParams = {
  id: string;
};

export async function getAllCities(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const cities = await cityService.getAll();

    res.status(200).json(cities);
  } catch (error) {
    next(error);
  }
}

export async function getCityById(
  req: Request<CityParams>,
  res: Response,
  next: NextFunction,
) {
  try {
    const city = await cityService.getById(req.params.id);

    if (!city) {
      throw new AppError(404, "CITY_NOT_FOUND", "City not found");
    }

    res.status(200).json(city);
  } catch (error) {
    next(error);
  }
}
