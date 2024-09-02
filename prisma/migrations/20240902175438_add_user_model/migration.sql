/*
  Warnings:

  - Added the required column `userId` to the `CalendarNote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `ShoppingItem` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- Create a default user
INSERT INTO "User" (name, email, password) VALUES ('Default User', 'default@example.com', 'defaultpassword');

-- AlterTable
ALTER TABLE "ShoppingItem" ADD COLUMN "userId" INTEGER;
ALTER TABLE "CalendarNote" ADD COLUMN "userId" INTEGER;

-- Update existing items to use the default user
UPDATE "ShoppingItem" SET "userId" = (SELECT id FROM "User" LIMIT 1) WHERE "userId" IS NULL;
UPDATE "CalendarNote" SET "userId" = (SELECT id FROM "User" LIMIT 1) WHERE "userId" IS NULL;

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CalendarNote" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "time" TEXT NOT NULL DEFAULT '00:00',
    "content" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "CalendarNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_CalendarNote" SELECT * FROM "CalendarNote";
DROP TABLE "CalendarNote";
ALTER TABLE "new_CalendarNote" RENAME TO "CalendarNote";

CREATE TABLE "new_ShoppingItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "ShoppingItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ShoppingItem" SELECT * FROM "ShoppingItem";
DROP TABLE "ShoppingItem";
ALTER TABLE "new_ShoppingItem" RENAME TO "ShoppingItem";
PRAGMA foreign_keys=ON;
