import { prisma } from "../lib/prisma.js";

export const cityService = {
  async getAll() {
    return prisma.city.findMany({
      orderBy: {
        name: "asc",
      },
    });
  },

  async getById(id: string) {
    return prisma.city.findUnique({
      where: {
        id,
      },
    });
  },
};
