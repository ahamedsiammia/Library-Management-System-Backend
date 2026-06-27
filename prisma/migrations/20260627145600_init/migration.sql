-- CreateEnum
CREATE TYPE "ActiveStatus" AS ENUM ('ACTIVE', 'BLOCKED');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'LIBRARYAN', 'MODARATOR');

-- CreateEnum
CREATE TYPE "Shift" AS ENUM ('MORNING', 'DAY');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "roll" INTEGER NOT NULL,
    "instituteName" VARCHAR(120) NOT NULL,
    "semester" VARCHAR(20) NOT NULL,
    "shift" VARCHAR(20) NOT NULL,
    "activeStatus" "ActiveStatus" NOT NULL DEFAULT 'ACTIVE',
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_roll_key" ON "users"("roll");
