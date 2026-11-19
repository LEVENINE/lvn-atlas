import type { NextFunction, Request, Response } from "express";

import { expenseCategoryService } from "../services/expense-category.service.js";

export async function getAllExpenseCategories(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const categories = await expenseCategoryService.getAll();

    res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
}
