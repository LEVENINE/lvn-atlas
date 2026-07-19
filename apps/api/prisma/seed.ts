import { PrismaPg } from "@prisma/adapter-pg";

import { env } from "../src/config/env.js";
import { PrismaClient } from "../src/generated/prisma/client.js";

const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

const expenseCategories = [
  "Rent",
  "Groceries",
  "Utilities",
  "Healthcare",
  "Transportation",
  "Internet",
  "Education",
  "Entertainment",
  "Miscellaneous",
];

async function main() {
  console.log("Seeding database...");

  for (const name of expenseCategories) {
    await prisma.expenseCategory.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log(`Seeded ${expenseCategories.length} expense categories.`);
}

main()
  .catch((error) => {
    console.error("Database seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
