-- DropForeignKey
ALTER TABLE "Module" DROP CONSTRAINT "Module_createdById_fkey";

-- AddForeignKey
ALTER TABLE "Module" ADD CONSTRAINT "Module_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
