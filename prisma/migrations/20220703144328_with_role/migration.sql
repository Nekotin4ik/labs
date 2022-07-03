/*
  Warnings:

  - Added the required column `role` to the `UserModel` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UserModel" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL
);
INSERT INTO "new_UserModel" ("email", "id", "name", "password") SELECT "email", "id", "name", "password" FROM "UserModel";
DROP TABLE "UserModel";
ALTER TABLE "new_UserModel" RENAME TO "UserModel";
CREATE UNIQUE INDEX "UserModel_email_key" ON "UserModel"("email");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
