import { describe, expect, it } from "vitest";

import { calculateAtlasScore } from "../src/services/atlas-score.service.js";

describe("atlas score", () => {
  it("awards full marks to a comfortable budget", () => {
    const result = calculateAtlasScore({
      expectedMonthlyIncome: "250000.00",
      expenseAmounts: ["25000.00"],
      housingAmount: "25000.00",
      householdSize: 2,
    });

    expect(result.score).toBe(100);
    expect(result.band).toBe("Strong");
    expect(result.factors).toEqual({
      savingsRate: 0.9,
      expenseRatio: 0.1,
      housingCostRatio: 0.1,
      householdSize: 2,
    });
  });

  it("scores a stretched budget in the tight band", () => {
    const result = calculateAtlasScore({
      expectedMonthlyIncome: "100000.00",
      expenseAmounts: ["80000.00"],
      housingAmount: "40000.00",
      householdSize: 4,
    });

    expect(result.score).toBe(57);
    expect(result.band).toBe("Tight");
    expect(result.factors).toEqual({
      savingsRate: 0.2,
      expenseRatio: 0.8,
      housingCostRatio: 0.4,
      householdSize: 4,
    });
  });

  it("does not award savings or expense points when income is overspent", () => {
    const result = calculateAtlasScore({
      expectedMonthlyIncome: "10000.00",
      expenseAmounts: ["12000.00", "500.00"],
      housingAmount: "9000.00",
      householdSize: 2,
    });

    expect(result.score).toBe(10);
    expect(result.band).toBe("At risk");
    expect(result.factors.savingsRate).toBe(-0.25);
    expect(result.factors.expenseRatio).toBe(1.25);
    expect(result.factors.housingCostRatio).toBe(0.9);
  });

  it("gives housing half marks when no rent amount is recorded", () => {
    const result = calculateAtlasScore({
      expectedMonthlyIncome: "100000.00",
      expenseAmounts: ["20000.00"],
      housingAmount: null,
      householdSize: 1,
    });

    expect(result.factors.housingCostRatio).toBeNull();
    expect(result.score).toBe(90);
  });

  it("lowers the score as the household grows", () => {
    const small = calculateAtlasScore({
      expectedMonthlyIncome: "100000.00",
      expenseAmounts: [],
      housingAmount: null,
      householdSize: 2,
    });
    const large = calculateAtlasScore({
      expectedMonthlyIncome: "100000.00",
      expenseAmounts: [],
      housingAmount: null,
      householdSize: 6,
    });

    expect(small.score).toBe(90);
    expect(large.score).toBe(82);
  });
});
