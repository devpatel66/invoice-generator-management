/*
  Warnings:

  - Added the required column `contact_id` to the `Bank` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Bank" ADD COLUMN     "contact_id" TEXT NOT NULL;
