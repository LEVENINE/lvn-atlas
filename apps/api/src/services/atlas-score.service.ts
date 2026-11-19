import { Prisma } from "../generated/prisma/client.js";

type MoneyInput = Prisma.Decimal | string | number;

/**
 * Atlas Score v1 is a deterministic readiness heuristic over the data the
 * platform actually holds: the blueprint's income and household size plus its
 * budget expense items. Community and journey data do not exist yet, so they
 * cannot contribute. Weights are documented here and in the domain docs so the
 * formula can be reviewed and tuned rather than guessed at.
 */
const WEIGHTS = {
  savings: 45,
  expenses: 25,
  housing: 20,
  household: 10,
} as const;

/** Savings of 30% of income or more earns the full savings weight. */
const SAVINGS_FULL_RATE = 0.3;
/** Spending 50% of income or less earns the full expense weight. */
const EXPENSES_FULL_RATIO = 0.5;
/** Housing at 25% of income or less earns the full housing weight. */
const HOUSING_FULL_RATIO = 0.25;
/** Housing at 60% of income or more earns no housing weight. */
const HOUSING_ZERO_RATIO = 0.6;
/** Housing is not recorded in every budget; unknown housing earns half marks. */
const HOUSING_UNKNOWN_POINTS = WEIGHTS.housing / 2;
/** Households up to this size earn the full household weight. */
const HOUSEHOLD_BASE_SIZE = 2;
/** Each additional member costs this many household points. */
const HOUSEHOLD_POINTS_PER_MEMBER = 2;

export type AtlasScoreBand = "Strong" | "Promising" | "Tight" | "At risk";

export type AtlasScore = {
  score: number;
  band: AtlasScoreBand;
  factors: {
    savingsRate: number;
    expenseRatio: number;
    housingCostRatio: number | null;
    householdSize: number;
  };
};

export const HOUSING_CATEGORY_NAME = "Rent";

export function calculateAtlasScore(input: {
  expectedMonthlyIncome: MoneyInput;
  expenseAmounts: MoneyInput[];
  housingAmount?: MoneyInput | null;
  householdSize: number;
}): AtlasScore {
  const income = new Prisma.Decimal(input.expectedMonthlyIncome).toNumber();
  const totalExpenses = input.expenseAmounts
    .reduce<Prisma.Decimal>(
      (total, amount) => total.plus(amount),
      new Prisma.Decimal(0),
    )
    .toNumber();
  const housingAmount =
    input.housingAmount === null || input.housingAmount === undefined
      ? null
      : new Prisma.Decimal(input.housingAmount).toNumber();

  const savingsRate = (income - totalExpenses) / income;
  const expenseRatio = totalExpenses / income;
  const housingCostRatio =
    housingAmount === null ? null : housingAmount / income;

  const savingsPoints =
    WEIGHTS.savings * clamp(savingsRate / SAVINGS_FULL_RATE, 0, 1);
  const expensePoints =
    WEIGHTS.expenses *
    clamp((1 - expenseRatio) / (1 - EXPENSES_FULL_RATIO), 0, 1);
  const housingPoints =
    housingCostRatio === null
      ? HOUSING_UNKNOWN_POINTS
      : WEIGHTS.housing *
        clamp(
          (HOUSING_ZERO_RATIO - housingCostRatio) /
            (HOUSING_ZERO_RATIO - HOUSING_FULL_RATIO),
          0,
          1,
        );
  const householdPoints = clamp(
    WEIGHTS.household -
      Math.max(0, input.householdSize - HOUSEHOLD_BASE_SIZE) *
        HOUSEHOLD_POINTS_PER_MEMBER,
    0,
    WEIGHTS.household,
  );

  const score = clamp(
    Math.round(savingsPoints + expensePoints + housingPoints + householdPoints),
    0,
    100,
  );

  return {
    score,
    band: bandFor(score),
    factors: {
      savingsRate: round(savingsRate),
      expenseRatio: round(expenseRatio),
      housingCostRatio:
        housingCostRatio === null ? null : round(housingCostRatio),
      householdSize: input.householdSize,
    },
  };
}

function bandFor(score: number): AtlasScoreBand {
  if (score >= 80) {
    return "Strong";
  }

  if (score >= 60) {
    return "Promising";
  }

  if (score >= 40) {
    return "Tight";
  }

  return "At risk";
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}
