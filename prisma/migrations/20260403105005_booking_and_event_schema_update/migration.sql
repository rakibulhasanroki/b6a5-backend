/*
  Warnings:

  - You are about to drop the column `paymentRequired` on the `bookings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "bookings" DROP COLUMN "paymentRequired";

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "maxParticipants" INTEGER;
