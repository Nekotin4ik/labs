-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UserModel" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER'
);
INSERT INTO "new_UserModel" ("email", "id", "name", "password", "role") SELECT "email", "id", "name", "password", "role" FROM "UserModel";
DROP TABLE "UserModel";
ALTER TABLE "new_UserModel" RENAME TO "UserModel";
CREATE UNIQUE INDEX "UserModel_email_key" ON "UserModel"("email");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
