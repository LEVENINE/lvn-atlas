import type { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import type { ExpenseItemInput } from "../validators/budget.validator.js";
import { summarizeBudget } from "./financial.service.js";

const expenseItemInclude = {
  category: {
    select: {
      id: true,
      name: true,
    },
  },
} satisfies Prisma.ExpenseItemInclude;

const budgetInclude = {
  expenseItems: {
    include: expenseItemInclude,
    orderBy: {
      category: {
        name: "asc",
      },
    },
  },
} satisfies Prisma.BudgetInclude;

type BudgetWithItems = Prisma.BudgetGetPayload<{
  include: typeof budgetInclude;
}>;

function serialize(
  budget: BudgetWithItems,
  expectedMonthlyIncome: Prisma.Decimal | string,
) {
  return {
    ...budget,
    expenseItems: budget.expenseItems.map((item) => ({
      ...item,
      amount: item.amount.toFixed(2),
    })),
    summary: summarizeBudget(
      expectedMonthlyIncome,
      budget.expenseItems.map((item) => item.amount),
    ),
  };
}

export const budgetService = {
  /**
   * A budget is created with its blueprint, but blueprints that predate budgets
   * still exist. Reading one creates the missing row so every blueprint owns
   * exactly one budget from the client's point of view.
   */
  async getOrCreate(
    blueprintId: string,
    expectedMonthlyIncome: Prisma.Decimal | string,
  ) {
    const budget = await prisma.budget.upsert({
      where: {
        blueprintId,
      },
      create: {
        blueprintId,
      },
      update: {},
      include: budgetInclude,
    });

    return serialize(budget, expectedMonthlyIncome);
  },

  async findMissingCategoryIds(categoryIds: string[]) {
    const categories = await prisma.expenseCategory.findMany({
      where: {
        id: {
          in: categoryIds,
        },
      },
      select: {
        id: true,
      },
    });

    const foundIds = new Set(categories.map((category) => category.id));

    return categoryIds.filter((id) => !foundIds.has(id));
  },

  /**
   * The submitted list is the budget's complete set of expense items: items for
   * categories that are omitted are removed and submitted amounts are replaced.
   */
  async replaceExpenseItems(
    blueprintId: string,
    expenseItems: ExpenseItemInput[],
    expectedMonthlyIncome: Prisma.Decimal | string,
  ) {
    const budget = await prisma.$transaction(async (transaction) => {
      const current = await transaction.budget.upsert({
        where: {
          blueprintId,
        },
        create: {
          blueprintId,
        },
        update: {},
      });

      await transaction.expenseItem.deleteMany({
        where: {
          budgetId: current.id,
        },
      });

      if (expenseItems.length > 0) {
        await transaction.expenseItem.createMany({
          data: expenseItems.map((item) => ({
            budgetId: current.id,
            categoryId: item.categoryId,
            amount: item.amount,
          })),
        });
      }

      return transaction.budget.findUniqueOrThrow({
        where: {
          id: current.id,
        },
        include: budgetInclude,
      });
    });

    return serialize(budget, expectedMonthlyIncome);
  },
};
