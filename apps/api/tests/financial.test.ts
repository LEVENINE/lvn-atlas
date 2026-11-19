import { describe, expect, it } from "vitest";

import {
  calculateTotalExpenses,
  summarizeBudget,
} from "../src/services/financial.service.js";

describe("financial calculations", () => {
  it("sums expense amounts as decimals", () => {
    expect(
      calculateTotalExpenses(["25000.10", "0.20", "0.05"]).toFixed(2),
    ).toBe("25000.35");
  });

  it("treats an empty budget as zero expenses", () => {
    expect(summarizeBudget("250000.00", [])).toEqual({
      expectedMonthlyIncome: "250000.00",
      totalExpenses: "0.00",
      expectedSavings: "250000.00",
      disposableIncome: "250000.00",
    });
  });

  it("derives savings from income minus expenses", () => {
    expect(summarizeBudget("250000.00", ["25000.00", "12000.00"])).toEqual({
      expectedMonthlyIncome: "250000.00",
      totalExpenses: "37000.00",
      expectedSavings: "213000.00",
      disposableIncome: "213000.00",
    });
  });

  it("reports negative savings when expenses exceed income", () => {
    const summary = summarizeBudget("10000.00", ["12000.50"]);

    expect(summary.totalExpenses).toBe("12000.50");
    expect(summary.expectedSavings).toBe("-2000.50");
    expect(summary.disposableIncome).toBe("-2000.50");
  });

  it("keeps two decimal places for whole amounts", () => {
    expect(summarizeBudget("50000", [5000]).totalExpenses).toBe("5000.00");
  });
});
