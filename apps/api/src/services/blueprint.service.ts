import type { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import type {
  CreateBlueprintInput,
  UpdateBlueprintInput,
} from "../validators/blueprint.validator.js";
import {
  calculateAtlasScore,
  HOUSING_CATEGORY_NAME,
} from "./atlas-score.service.js";
import { summarizeBudget } from "./financial.service.js";

const citySelect = {
  id: true,
  name: true,
  state: true,
  country: true,
} satisfies Prisma.CitySelect;

const blueprintInclude = {
  originCity: { select: citySelect },
  destinationCity: { select: citySelect },
  budget: {
    include: {
      expenseItems: {
        include: {
          category: { select: { id: true, name: true } },
        },
      },
    },
  },
} satisfies Prisma.MigrationBlueprintInclude;

type BlueprintWithCities = Prisma.MigrationBlueprintGetPayload<{
  include: typeof blueprintInclude;
}>;

function serialize(blueprint: BlueprintWithCities) {
  // The budget feeds the Atlas Score, but blueprint responses keep exposing
  // only blueprint fields; budgets have their own endpoint.
  const { budget, ...rest } = blueprint;
  const expenseItems = budget?.expenseItems ?? [];
  const housingItem = expenseItems.find(
    (item) =>
      item.category.name.toLowerCase() === HOUSING_CATEGORY_NAME.toLowerCase(),
  );

  const expenseAmounts = expenseItems.map((item) => item.amount);

  return {
    ...rest,
    expectedMonthlyIncome: rest.expectedMonthlyIncome.toFixed(2),
    // Comparison-ready figures so list and detail responses can be shown side
    // by side without a request per blueprint.
    summary: summarizeBudget(rest.expectedMonthlyIncome, expenseAmounts),
    atlasScore: calculateAtlasScore({
      expectedMonthlyIncome: rest.expectedMonthlyIncome,
      expenseAmounts,
      housingAmount: housingItem?.amount ?? null,
      householdSize: rest.relocatingHouseholdSize,
    }),
  };
}

export const blueprintService = {
  async getAllByUserId(userId: string) {
    const blueprints = await prisma.migrationBlueprint.findMany({
      where: {
        userId,
      },
      include: blueprintInclude,
      orderBy: {
        createdAt: "desc",
      },
    });

    return blueprints.map(serialize);
  },

  async getByIdForUser(id: string, userId: string) {
    const blueprint = await prisma.migrationBlueprint.findFirst({
      where: {
        id,
        userId,
      },
      include: blueprintInclude,
    });

    return blueprint ? serialize(blueprint) : null;
  },

  async create(userId: string, data: CreateBlueprintInput) {
    const blueprint = await prisma.migrationBlueprint.create({
      data: {
        userId,
        ...data,
        budget: {
          create: {},
        },
      },
      include: blueprintInclude,
    });

    return serialize(blueprint);
  },

  async update(id: string, data: UpdateBlueprintInput) {
    const blueprint = await prisma.migrationBlueprint.update({
      where: {
        id,
      },
      data,
      include: blueprintInclude,
    });

    return serialize(blueprint);
  },

  async delete(id: string) {
    return prisma.migrationBlueprint.delete({
      where: {
        id,
      },
    });
  },
};
