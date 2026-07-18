-- CreateEnum
CREATE TYPE "DietaryPreference" AS ENUM ('VEGETARIAN', 'NON_VEGETARIAN', 'VEGAN', 'EGGETARIAN', 'OTHER');

-- CreateEnum
CREATE TYPE "HousingPreference" AS ENUM ('SHARED', 'PRIVATE_ROOM', 'STUDIO', 'ONE_BHK', 'TWO_BHK', 'THREE_BHK_OR_LARGER', 'OTHER');

-- CreateEnum
CREATE TYPE "TransportationPreference" AS ENUM ('PUBLIC_TRANSPORT', 'TWO_WHEELER', 'CAR', 'WALKING_CYCLING', 'MIXED', 'OTHER');

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "occupation" TEXT,
    "householdSize" INTEGER NOT NULL DEFAULT 1,
    "numberOfDependents" INTEGER NOT NULL DEFAULT 0,
    "dietaryPreference" "DietaryPreference",
    "housingPreference" "HousingPreference",
    "transportationPreference" "TransportationPreference",
    "lifestylePreference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "City" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MigrationBlueprint" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "originCityId" TEXT NOT NULL,
    "destinationCityId" TEXT NOT NULL,
    "sourceJourneyId" TEXT,
    "expectedMonthlyIncome" DECIMAL(12,2) NOT NULL,
    "plannedRelocationDate" TIMESTAMP(3),
    "relocatingHouseholdSize" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MigrationBlueprint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Budget" (
    "id" TEXT NOT NULL,
    "blueprintId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Budget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpenseCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExpenseCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpenseItem" (
    "id" TEXT NOT NULL,
    "budgetId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExpenseItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MigrationJourney" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "originCityId" TEXT NOT NULL,
    "destinationCityId" TEXT NOT NULL,
    "occupation" TEXT,
    "householdSize" INTEGER NOT NULL DEFAULT 1,
    "monthlyIncome" DECIMAL(12,2),
    "dietaryPreference" "DietaryPreference",
    "housingPreference" "HousingPreference",
    "transportationPreference" "TransportationPreference",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MigrationJourney_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JourneyExpenseItem" (
    "id" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JourneyExpenseItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

-- CreateIndex
CREATE INDEX "City_country_state_idx" ON "City"("country", "state");

-- CreateIndex
CREATE UNIQUE INDEX "City_name_state_country_key" ON "City"("name", "state", "country");

-- CreateIndex
CREATE INDEX "MigrationBlueprint_userId_idx" ON "MigrationBlueprint"("userId");

-- CreateIndex
CREATE INDEX "MigrationBlueprint_originCityId_idx" ON "MigrationBlueprint"("originCityId");

-- CreateIndex
CREATE INDEX "MigrationBlueprint_destinationCityId_idx" ON "MigrationBlueprint"("destinationCityId");

-- CreateIndex
CREATE INDEX "MigrationBlueprint_sourceJourneyId_idx" ON "MigrationBlueprint"("sourceJourneyId");

-- CreateIndex
CREATE UNIQUE INDEX "Budget_blueprintId_key" ON "Budget"("blueprintId");

-- CreateIndex
CREATE UNIQUE INDEX "ExpenseCategory_name_key" ON "ExpenseCategory"("name");

-- CreateIndex
CREATE INDEX "ExpenseItem_budgetId_idx" ON "ExpenseItem"("budgetId");

-- CreateIndex
CREATE INDEX "ExpenseItem_categoryId_idx" ON "ExpenseItem"("categoryId");

-- CreateIndex
CREATE INDEX "MigrationJourney_userId_idx" ON "MigrationJourney"("userId");

-- CreateIndex
CREATE INDEX "MigrationJourney_originCityId_idx" ON "MigrationJourney"("originCityId");

-- CreateIndex
CREATE INDEX "MigrationJourney_destinationCityId_idx" ON "MigrationJourney"("destinationCityId");

-- CreateIndex
CREATE INDEX "JourneyExpenseItem_journeyId_idx" ON "JourneyExpenseItem"("journeyId");

-- CreateIndex
CREATE INDEX "JourneyExpenseItem_categoryId_idx" ON "JourneyExpenseItem"("categoryId");

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MigrationBlueprint" ADD CONSTRAINT "MigrationBlueprint_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MigrationBlueprint" ADD CONSTRAINT "MigrationBlueprint_originCityId_fkey" FOREIGN KEY ("originCityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MigrationBlueprint" ADD CONSTRAINT "MigrationBlueprint_destinationCityId_fkey" FOREIGN KEY ("destinationCityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MigrationBlueprint" ADD CONSTRAINT "MigrationBlueprint_sourceJourneyId_fkey" FOREIGN KEY ("sourceJourneyId") REFERENCES "MigrationJourney"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_blueprintId_fkey" FOREIGN KEY ("blueprintId") REFERENCES "MigrationBlueprint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseItem" ADD CONSTRAINT "ExpenseItem_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseItem" ADD CONSTRAINT "ExpenseItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ExpenseCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MigrationJourney" ADD CONSTRAINT "MigrationJourney_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MigrationJourney" ADD CONSTRAINT "MigrationJourney_originCityId_fkey" FOREIGN KEY ("originCityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MigrationJourney" ADD CONSTRAINT "MigrationJourney_destinationCityId_fkey" FOREIGN KEY ("destinationCityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JourneyExpenseItem" ADD CONSTRAINT "JourneyExpenseItem_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "MigrationJourney"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JourneyExpenseItem" ADD CONSTRAINT "JourneyExpenseItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ExpenseCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
