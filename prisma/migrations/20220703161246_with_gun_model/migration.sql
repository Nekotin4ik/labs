-- CreateTable
CREATE TABLE "GunModel" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "magazine_size" INTEGER NOT NULL,
    "weight" REAL NOT NULL,
    "caliber" REAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    CONSTRAINT "GunModel_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "UserModel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
