import type { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import type {
  CreateBlueprintInput,
  UpdateBlueprintInput,
} from "../validators/blueprint.validator.js";

const citySelect = {
  id: true,
  name: true,
  state: true,
  country: true,
} satisfies Prisma.CitySelect;

const blueprintInclude = {
  originCity: { select: citySelect },
  destinationCity: { select: citySelect },
} satisfies Prisma.MigrationBlueprintInclude;

type BlueprintWithCities = Prisma.MigrationBlueprintGetPayload<{
  include: typeof blueprintInclude;
}>;

function serialize(blueprint: BlueprintWithCities) {
  return {
    ...blueprint,
    expectedMonthlyIncome: blueprint.expectedMonthlyIncome.toFixed(2),
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
