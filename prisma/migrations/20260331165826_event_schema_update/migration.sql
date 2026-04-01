/*
  Warnings:

  - You are about to drop the column `date` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `time` on the `events` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('UPCOMING', 'ONGOING', 'ENDED');

-- DropIndex
DROP INDEX "events_date_idx";

-- AlterTable
ALTER TABLE "events" DROP COLUMN "date",
DROP COLUMN "time",
ADD COLUMN     "endDateTime" TIMESTAMP(3),
ADD COLUMN     "startDateTime" TIMESTAMP(3),
ADD COLUMN     "status" "EventStatus" NOT NULL DEFAULT 'UPCOMING';

-- CreateIndex
CREATE INDEX "events_startDateTime_idx" ON "events"("startDateTime");
