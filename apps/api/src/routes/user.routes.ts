import { Router } from "express";

import {
  createUser,
  deleteUser,
  getAllUsers,
  getUserById,
  updateUser,
} from "../controllers/user.controller.js";
import { getProfileByUserId } from "../controllers/profile.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const userRouter = Router();

userRouter.use(requireAuth);

userRouter.get("/", getAllUsers);
userRouter.get("/:id", getUserById);
userRouter.get("/:id/profile", getProfileByUserId);
userRouter.post("/", createUser);
userRouter.patch("/:id", updateUser);
userRouter.put("/:id", updateUser);
userRouter.delete("/:id", deleteUser);

export default userRouter;
