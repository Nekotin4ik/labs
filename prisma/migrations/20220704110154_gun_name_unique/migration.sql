/*
  Warnings:

  - Added the required column `name` to the `GunModel` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GunModel" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "magazine_size" INTEGER NOT NULL,
    "weight" REAL NOT NULL,
    "caliber" REAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    CONSTRAINT "GunModel_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "UserModel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_GunModel" ("caliber", "id", "magazine_size", "type", "user_id", "weight") SELECT "caliber", "id", "magazine_size", "type", "user_id", "weight" FROM "GunModel";
DROP TABLE "GunModel";
ALTER TABLE "new_GunModel" RENAME TO "GunModel";
CREATE UNIQUE INDEX "GunModel_name_key" ON "GunModel"("name");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
