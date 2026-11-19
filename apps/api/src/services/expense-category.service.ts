import { prisma } from "../lib/prisma.js";

export const expenseCategoryService = {
  async getAll() {
    return prisma.expenseCategory.findMany({
      orderBy: {
        name: "asc",
      },
    });
  },
};
