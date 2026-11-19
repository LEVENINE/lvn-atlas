import { Prisma } from "../generated/prisma/client.js";

type MoneyInput = Prisma.Decimal | string | number;

export type FinancialSummary = {
  expectedMonthlyIncome: string;
  totalExpenses: string;
  expectedSavings: string;
  disposableIncome: string;
};

/**
 * Budget figures are derived from the blueprint's income and expense items and
 * are never accepted from the client. Every value is computed with decimals so
 * sums of two-decimal amounts stay exact.
 */
export function calculateTotalExpenses(amounts: MoneyInput[]): Prisma.Decimal {
  return amounts.reduce<Prisma.Decimal>(
    (total, amount) => total.plus(amount),
    new Prisma.Decimal(0),
  );
}

export function summarizeBudget(
  expectedMonthlyIncome: MoneyInput,
  amounts: MoneyInput[],
): FinancialSummary {
  const income = new Prisma.Decimal(expectedMonthlyIncome);
  const totalExpenses = calculateTotalExpenses(amounts);
  const expectedSavings = income.minus(totalExpenses);

  return {
    expectedMonthlyIncome: income.toFixed(2),
    totalExpenses: totalExpenses.toFixed(2),
    expectedSavings: expectedSavings.toFixed(2),
    // Expense categories are not yet classified as essential or discretionary,
    // so every expense currently counts as essential and disposable income
    // matches expected savings. The classification will separate them.
    disposableIncome: expectedSavings.toFixed(2),
  };
}
