import { Router } from "express";

import { getAllExpenseCategories } from "../controllers/expense-category.controller.js";

const expenseCategoryRouter = Router();

expenseCategoryRouter.get("/", getAllExpenseCategories);

export default expenseCategoryRouter;
