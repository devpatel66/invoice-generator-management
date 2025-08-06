/*
  Warnings:

  - You are about to drop the column `amount` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `amount_due` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `amount_paid` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `attempts` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "amount",
DROP COLUMN "amount_due",
DROP COLUMN "amount_paid",
DROP COLUMN "attempts",
DROP COLUMN "status";
