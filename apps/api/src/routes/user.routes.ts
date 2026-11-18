import { Router } from "express";

import {
  deleteUser,
  getUserById,
  updateUser,
} from "../controllers/user.controller.js";
import { getProfileByUserId } from "../controllers/profile.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const userRouter = Router();

userRouter.use(requireAuth);

userRouter.get("/:id", getUserById);
userRouter.get("/:id/profile", getProfileByUserId);
userRouter.patch("/:id", updateUser);
userRouter.put("/:id", updateUser);
userRouter.delete("/:id", deleteUser);

export default userRouter;
