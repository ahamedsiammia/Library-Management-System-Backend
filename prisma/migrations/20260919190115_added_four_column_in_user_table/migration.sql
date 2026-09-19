/*
  Warnings:

  - A unique constraint covering the columns `[googleId]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "authProvider" AS ENUM ('GOOGLE', 'CREDENTIAL');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "authProvider" "authProvider" NOT NULL DEFAULT 'CREDENTIAL',
ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "googleId" TEXT,
ADD COLUMN     "needPasswordChange" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");
