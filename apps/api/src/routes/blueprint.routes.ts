import { Router } from "express";

import {
  createBlueprint,
  deleteBlueprint,
  getAllBlueprints,
  getBlueprintById,
  updateBlueprint,
} from "../controllers/blueprint.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const blueprintRouter = Router();

blueprintRouter.use(requireAuth);

blueprintRouter.get("/", getAllBlueprints);
blueprintRouter.get("/:id", getBlueprintById);
blueprintRouter.post("/", createBlueprint);
blueprintRouter.patch("/:id", updateBlueprint);
blueprintRouter.put("/:id", updateBlueprint);
blueprintRouter.delete("/:id", deleteBlueprint);

export default blueprintRouter;
