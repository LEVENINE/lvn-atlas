import { prisma } from "../lib/prisma.js";

export const userService = {
  async getAll() {
    return prisma.user.findMany({
      include: {
        profile: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  },

  async getById(id: string) {
    return prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        profile: true,
      },
    });
  },

  async create(data: { email: string }) {
    return prisma.user.create({
      data: {
        email: data.email,
      },
      include: {
        profile: true,
      },
    });
  },

  async update(id: string, data: { email?: string }) {
    return prisma.user.update({
      where: {
        id,
      },
      data,
      include: {
        profile: true,
      },
    });
  },

  async delete(id: string) {
    return prisma.user.delete({
      where: {
        id,
      },
    });
  },
};
