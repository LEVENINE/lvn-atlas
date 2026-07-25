import { Router } from "express";

import { getAllCities, getCityById } from "../controllers/city.controller.js";

const cityRouter = Router();

cityRouter.get("/", getAllCities);
cityRouter.get("/:id", getCityById);

export default cityRouter;
