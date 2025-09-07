-- DropForeignKey
ALTER TABLE "Class" DROP CONSTRAINT "Class_moduleId_fkey";

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;
