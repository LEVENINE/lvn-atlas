import type { NextFunction, Request, Response } from "express";

import { AppError } from "../utils/app-error.js";
import { requireAuthenticatedUser } from "../utils/authorization.js";
import { parseBody } from "../utils/validation.js";
import { blueprintService } from "../services/blueprint.service.js";
import { budgetService } from "../services/budget.service.js";
import { replaceBudgetSchema } from "../validators/budget.validator.js";

type BlueprintParams = {
  blueprintId: string;
};

async function requireOwnedBlueprint(req: Request<BlueprintParams>) {
  const currentUser = requireAuthenticatedUser(req);

  const blueprint = await blueprintService.getByIdForUser(
    req.params.blueprintId,
    currentUser.id,
  );

  if (!blueprint) {
    throw new AppError(404, "BLUEPRINT_NOT_FOUND", "Blueprint not found");
  }

  return blueprint;
}

export async function getBudget(
  req: Request<BlueprintParams>,
  res: Response,
  next: NextFunction,
) {
  try {
    const blueprint = await requireOwnedBlueprint(req);

    const budget = await budgetService.getOrCreate(blueprint.id);

    res.status(200).json(budget);
  } catch (error) {
    next(error);
  }
}

export async function replaceBudget(
  req: Request<BlueprintParams>,
  res: Response,
  next: NextFunction,
) {
  try {
    const blueprint = await requireOwnedBlueprint(req);
    const data = parseBody(replaceBudgetSchema, req.body);

    const categoryIds = data.expenseItems.map((item) => item.categoryId);
    const missingCategoryIds =
      await budgetService.findMissingCategoryIds(categoryIds);

    if (missingCategoryIds.length > 0) {
      throw new AppError(
        404,
        "EXPENSE_CATEGORY_NOT_FOUND",
        "One or more expense categories were not found",
      );
    }

    const budget = await budgetService.replaceExpenseItems(
      blueprint.id,
      data.expenseItems,
    );

    res.status(200).json(budget);
  } catch (error) {
    next(error);
  }
}
