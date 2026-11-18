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

const cities = [
  { name: "Mumbai", state: "Maharashtra", country: "India" },
  { name: "Pune", state: "Maharashtra", country: "India" },
  { name: "Bengaluru", state: "Karnataka", country: "India" },
  { name: "Hyderabad", state: "Telangana", country: "India" },
  { name: "Chennai", state: "Tamil Nadu", country: "India" },
  { name: "Delhi", state: "Delhi", country: "India" },
  { name: "Jaipur", state: "Rajasthan", country: "India" },
  { name: "Ahmedabad", state: "Gujarat", country: "India" },
  { name: "Kolkata", state: "West Bengal", country: "India" },
  { name: "Kochi", state: "Kerala", country: "India" },
  { name: "Lucknow", state: "Uttar Pradesh", country: "India" },
  { name: "Indore", state: "Madhya Pradesh", country: "India" },
];

async function main() {
  console.log("🌱 Seeding reference data...");

  // Expense Categories
  for (const name of expenseCategories) {
    await prisma.expenseCategory.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // Cities
  for (const city of cities) {
    await prisma.city.upsert({
      where: {
        name_state_country: {
          name: city.name,
          state: city.state,
          country: city.country,
        },
      },
      update: {},
      create: city,
    });
  }

  // User: John
  const john = await prisma.user.upsert({
    where: {
      email: "john@example.com",
    },
    update: {},
    create: {
      email: "john@example.com",
    },
  });

  await prisma.userProfile.upsert({
    where: {
      userId: john.id,
    },
    update: {},
    create: {
      firstName: "John",
      lastName: "Doe",
      user: {
        connect: {
          id: john.id,
        },
      },
    },
  });

  // User: Jane
  const jane = await prisma.user.upsert({
    where: {
      email: "jane@example.com",
    },
    update: {},
    create: {
      email: "jane@example.com",
    },
  });

  await prisma.userProfile.upsert({
    where: {
      userId: jane.id,
    },
    update: {},
    create: {
      firstName: "Jane",
      lastName: "Smith",
      user: {
        connect: {
          id: jane.id,
        },
      },
    },
  });

  console.log(`✅ Seeded ${expenseCategories.length} expense categories.`);
  console.log(`✅ Seeded ${cities.length} cities.`);
  console.log("✅ Seeded 2 users.");
}

main()
  .catch((error) => {
    console.error("Database seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
