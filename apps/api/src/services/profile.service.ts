import { prisma } from "../lib/prisma.js";

import {
  DietaryPreference,
  HousingPreference,
  TransportationPreference,
} from "../generated/prisma/enums.js";

export const profileService = {
  async getAll() {
    return prisma.userProfile.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  },

  async getById(id: string) {
    return prisma.userProfile.findUnique({
      where: {
        id,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
  },

  async getByUserId(userId: string) {
    return prisma.userProfile.findUnique({
      where: {
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
  },

  async create(data: {
    userId: string;
    firstName: string;
    lastName: string;
    occupation?: string;
    householdSize?: number;
    numberOfDependents?: number;
    dietaryPreference?: DietaryPreference;
    housingPreference?: HousingPreference;
    transportationPreference?: TransportationPreference;
    lifestylePreference?: string;
  }) {
    return prisma.userProfile.create({
      data: {
        user: {
          connect: {
            id: data.userId,
          },
        },
        firstName: data.firstName,
        lastName: data.lastName,
        occupation: data.occupation,
        householdSize: data.householdSize,
        numberOfDependents: data.numberOfDependents,
        dietaryPreference: data.dietaryPreference,
        housingPreference: data.housingPreference,
        transportationPreference: data.transportationPreference,
        lifestylePreference: data.lifestylePreference,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
  },

  async update(
    id: string,
    data: {
      firstName?: string;
      lastName?: string;
      occupation?: string;
      householdSize?: number;
      numberOfDependents?: number;
      dietaryPreference?: DietaryPreference;
      housingPreference?: HousingPreference;
      transportationPreference?: TransportationPreference;
      lifestylePreference?: string;
    },
  ) {
    return prisma.userProfile.update({
      where: {
        id,
      },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        occupation: data.occupation,
        householdSize: data.householdSize,
        numberOfDependents: data.numberOfDependents,
        dietaryPreference: data.dietaryPreference,
        housingPreference: data.housingPreference,
        transportationPreference: data.transportationPreference,
        lifestylePreference: data.lifestylePreference,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
  },

  async delete(id: string) {
    return prisma.userProfile.delete({
      where: {
        id,
      },
    });
  },
};
