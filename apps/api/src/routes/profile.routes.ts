import { Router } from "express";

import {
  deleteProfile,
  getProfileById,
  updateProfile,
} from "../controllers/profile.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const profileRouter = Router();

profileRouter.use(requireAuth);

profileRouter.get("/:id", getProfileById);
profileRouter.patch("/:id", updateProfile);
profileRouter.put("/:id", updateProfile);
profileRouter.delete("/:id", deleteProfile);

export default profileRouter;
