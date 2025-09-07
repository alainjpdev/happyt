-- AlterTable
ALTER TABLE "User" ADD COLUMN     "notes" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending';
