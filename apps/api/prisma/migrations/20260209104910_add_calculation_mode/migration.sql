-- CreateEnum
CREATE TYPE "CalculationMode" AS ENUM ('SUM', 'LATEST', 'AVERAGE', 'MAX');

-- AlterTable
ALTER TABLE "SubParameter" ADD COLUMN     "calculationMode" "CalculationMode" NOT NULL DEFAULT 'SUM';
