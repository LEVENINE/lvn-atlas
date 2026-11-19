import { z } from "zod";

const expenseItemSchema = z.object({
  categoryId: z.string().uuid(),
  amount: z
    .number()
    .nonnegative()
    .max(9_999_999_999.99, "Amount is too large")
    .multipleOf(0.01, "Amount can have at most two decimal places"),
});

export const replaceBudgetSchema = z.object({
  expenseItems: z
    .array(expenseItemSchema)
    .max(50)
    .refine(
      (items) =>
        new Set(items.map((item) => item.categoryId)).size === items.length,
      {
        message: "Each expense category may appear only once",
      },
    ),
});

export type ExpenseItemInput = z.infer<typeof expenseItemSchema>;
export type ReplaceBudgetInput = z.infer<typeof replaceBudgetSchema>;
