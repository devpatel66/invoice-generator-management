/*
  Warnings:

  - Added the required column `account_type` to the `Bank` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Bank" ADD COLUMN     "account_type" TEXT NOT NULL;
