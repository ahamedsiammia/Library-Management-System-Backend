/*
  Warnings:

  - The values [DAY] on the enum `Shift` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Shift_new" AS ENUM ('MORNING', 'EVENING');
ALTER TYPE "Shift" RENAME TO "Shift_old";
ALTER TYPE "Shift_new" RENAME TO "Shift";
DROP TYPE "public"."Shift_old";
COMMIT;
