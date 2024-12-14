/*
  Warnings:

  - You are about to drop the column `managerId` on the `Branch` table. All the data in the column will be lost.
  - You are about to drop the `Manager` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Branch" DROP CONSTRAINT "Branch_managerId_fkey";

-- DropIndex
DROP INDEX "Branch_managerId_key";

-- AlterTable
ALTER TABLE "Branch" DROP COLUMN "managerId";

-- DropTable
DROP TABLE "Manager";
