import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import app from "../src/app.js";
import { Prisma } from "../src/generated/prisma/client.js";
import { signAccessToken } from "../src/utils/token.js";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    migrationBlueprint: {
      findFirst: vi.fn(),
    },
    expenseCategory: {
      findMany: vi.fn(),
    },
    budget: {
      upsert: vi.fn(),
      findUniqueOrThrow: vi.fn(),
    },
    expenseItem: {
      deleteMany: vi.fn(),
      createMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("../src/lib/prisma.js", () => ({ prisma: prismaMock }));

const currentUser = {
  id: "55555555-5555-4555-8555-555555555555",
  email: "planner@example.com",
};

const token = signAccessToken({
  sub: currentUser.id,
  email: currentUser.email,
});

const blueprintId = "88888888-8888-4888-8888-888888888888";
const budgetId = "99999999-9999-4999-8999-999999999999";
const rentCategoryId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const groceriesCategoryId = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const unknownCategoryId = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";

const blueprint = {
  id: blueprintId,
  userId: currentUser.id,
  originCityId: "66666666-6666-4666-8666-666666666666",
  destinationCityId: "77777777-7777-4777-8777-777777777777",
  sourceJourneyId: null,
  expectedMonthlyIncome: new Prisma.Decimal("250000.00"),
  plannedRelocationDate: null,
  relocatingHouseholdSize: 2,
  createdAt: new Date("2026-02-01T00:00:00.000Z"),
  updatedAt: new Date("2026-02-01T00:00:00.000Z"),
  originCity: {
    id: "66666666-6666-4666-8666-666666666666",
    name: "Mumbai",
    state: "Maharashtra",
    country: "India",
  },
  destinationCity: {
    id: "77777777-7777-4777-8777-777777777777",
    name: "Pune",
    state: "Maharashtra",
    country: "India",
  },
};

const rent = { id: rentCategoryId, name: "Rent" };
const groceries = { id: groceriesCategoryId, name: "Groceries" };

const budget = {
  id: budgetId,
  blueprintId,
  createdAt: new Date("2026-02-01T00:00:00.000Z"),
  updatedAt: new Date("2026-02-01T00:00:00.000Z"),
  expenseItems: [
    {
      id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
      budgetId,
      categoryId: rentCategoryId,
      amount: new Prisma.Decimal("25000.00"),
      createdAt: new Date("2026-02-01T00:00:00.000Z"),
      updatedAt: new Date("2026-02-01T00:00:00.000Z"),
      category: rent,
    },
  ],
};

const budgetUrl = `/api/v1/blueprints/${blueprintId}/budget`;

function authorized(method: "get" | "put", url: string) {
  return request(app)[method](url).set("Authorization", `Bearer ${token}`);
}

describe("budgets endpoints", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    prismaMock.$transaction.mockImplementation(
      async (callback: (transaction: typeof prismaMock) => unknown) =>
        callback(prismaMock),
    );
    prismaMock.expenseItem.deleteMany.mockResolvedValue({ count: 0 });
    prismaMock.expenseItem.createMany.mockResolvedValue({ count: 0 });
  });

  it("requires authentication", async () => {
    const response = await request(app).get(budgetUrl);

    expect(response.status).toBe(401);
  });

  it("returns the budget of a blueprint the user owns", async () => {
    prismaMock.migrationBlueprint.findFirst.mockResolvedValue(blueprint);
    prismaMock.budget.upsert.mockResolvedValue(budget);

    const response = await authorized("get", budgetUrl);

    expect(response.status).toBe(200);
    expect(response.body.blueprintId).toBe(blueprintId);
    expect(response.body.expenseItems).toHaveLength(1);
    expect(response.body.expenseItems[0].amount).toBe("25000.00");
    expect(response.body.expenseItems[0].category.name).toBe("Rent");
    expect(response.body.summary).toEqual({
      expectedMonthlyIncome: "250000.00",
      totalExpenses: "25000.00",
      expectedSavings: "225000.00",
      disposableIncome: "225000.00",
    });
    expect(response.body.atlasScore).toEqual({
      score: 100,
      band: "Strong",
      factors: {
        savingsRate: 0.9,
        expenseRatio: 0.1,
        housingCostRatio: 0.1,
        householdSize: 2,
      },
    });
    expect(prismaMock.migrationBlueprint.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: blueprintId, userId: currentUser.id },
      }),
    );
  });

  it("does not read the budget of a blueprint the user does not own", async () => {
    prismaMock.migrationBlueprint.findFirst.mockResolvedValue(null);

    const response = await authorized("get", budgetUrl);

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("BLUEPRINT_NOT_FOUND");
    expect(prismaMock.budget.upsert).not.toHaveBeenCalled();
  });

  it("replaces the budget's expense items", async () => {
    prismaMock.migrationBlueprint.findFirst.mockResolvedValue(blueprint);
    prismaMock.expenseCategory.findMany.mockResolvedValue([
      { id: rentCategoryId },
      { id: groceriesCategoryId },
    ]);
    prismaMock.budget.upsert.mockResolvedValue({ id: budgetId, blueprintId });
    prismaMock.budget.findUniqueOrThrow.mockResolvedValue({
      ...budget,
      expenseItems: [
        budget.expenseItems[0],
        {
          ...budget.expenseItems[0],
          id: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
          categoryId: groceriesCategoryId,
          amount: new Prisma.Decimal("12000.00"),
          category: groceries,
        },
      ],
    });

    const response = await authorized("put", budgetUrl).send({
      expenseItems: [
        { categoryId: rentCategoryId, amount: 25000 },
        { categoryId: groceriesCategoryId, amount: 12000 },
      ],
    });

    expect(response.status).toBe(200);
    expect(response.body.expenseItems).toHaveLength(2);
    expect(response.body.summary).toEqual({
      expectedMonthlyIncome: "250000.00",
      totalExpenses: "37000.00",
      expectedSavings: "213000.00",
      disposableIncome: "213000.00",
    });
    expect(response.body.atlasScore.factors).toEqual({
      savingsRate: 0.85,
      expenseRatio: 0.15,
      housingCostRatio: 0.1,
      householdSize: 2,
    });
    expect(prismaMock.expenseItem.deleteMany).toHaveBeenCalledWith({
      where: { budgetId },
    });
    expect(prismaMock.expenseItem.createMany).toHaveBeenCalledWith({
      data: [
        { budgetId, categoryId: rentCategoryId, amount: 25000 },
        { budgetId, categoryId: groceriesCategoryId, amount: 12000 },
      ],
    });
  });

  it("clears a budget when the expense item list is empty", async () => {
    prismaMock.migrationBlueprint.findFirst.mockResolvedValue(blueprint);
    prismaMock.expenseCategory.findMany.mockResolvedValue([]);
    prismaMock.budget.upsert.mockResolvedValue({ id: budgetId, blueprintId });
    prismaMock.budget.findUniqueOrThrow.mockResolvedValue({
      ...budget,
      expenseItems: [],
    });

    const response = await authorized("put", budgetUrl).send({
      expenseItems: [],
    });

    expect(response.status).toBe(200);
    expect(response.body.expenseItems).toEqual([]);
    expect(response.body.summary.totalExpenses).toBe("0.00");
    expect(response.body.summary.expectedSavings).toBe("250000.00");
    expect(response.body.atlasScore.score).toBe(90);
    expect(prismaMock.expenseItem.deleteMany).toHaveBeenCalled();
    expect(prismaMock.expenseItem.createMany).not.toHaveBeenCalled();
  });

  it("rejects the same category twice", async () => {
    prismaMock.migrationBlueprint.findFirst.mockResolvedValue(blueprint);

    const response = await authorized("put", budgetUrl).send({
      expenseItems: [
        { categoryId: rentCategoryId, amount: 25000 },
        { categoryId: rentCategoryId, amount: 20000 },
      ],
    });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("rejects a negative amount", async () => {
    prismaMock.migrationBlueprint.findFirst.mockResolvedValue(blueprint);

    const response = await authorized("put", budgetUrl).send({
      expenseItems: [{ categoryId: rentCategoryId, amount: -1 }],
    });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 404 when an expense category does not exist", async () => {
    prismaMock.migrationBlueprint.findFirst.mockResolvedValue(blueprint);
    prismaMock.expenseCategory.findMany.mockResolvedValue([
      { id: rentCategoryId },
    ]);

    const response = await authorized("put", budgetUrl).send({
      expenseItems: [
        { categoryId: rentCategoryId, amount: 25000 },
        { categoryId: unknownCategoryId, amount: 5000 },
      ],
    });

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("EXPENSE_CATEGORY_NOT_FOUND");
    expect(prismaMock.expenseItem.deleteMany).not.toHaveBeenCalled();
  });
});

describe("expense categories endpoints", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists the shared expense categories", async () => {
    prismaMock.expenseCategory.findMany.mockResolvedValue([groceries, rent]);

    const response = await request(app).get("/api/v1/expense-categories");

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0].name).toBe("Groceries");
  });
});
