import { Router } from "express";

import { getBudget, replaceBudget } from "../controllers/budget.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const budgetRouter = Router();

budgetRouter.use(requireAuth);

budgetRouter.get("/:blueprintId/budget", getBudget);
budgetRouter.put("/:blueprintId/budget", replaceBudget);

export default budgetRouter;
