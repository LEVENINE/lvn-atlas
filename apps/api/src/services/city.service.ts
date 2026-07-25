import { prisma } from "../lib/prisma.js";

export async function getAllCities() {
  return prisma.city.findMany({
    orderBy: {
      name: "asc",
    },
  });
}

export async function getCityById(id: string) {
  return prisma.city.findUnique({
    where: {
      id,
    },
  });
}