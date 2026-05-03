/*
  Warnings:

  - You are about to drop the `assigned_to` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "assigned_to";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Dispenser" (
    "DispenserID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "DispenserNumber" INTEGER NOT NULL,
    "DispenserAssignment" TEXT,
    "DispenserLayout" TEXT,
    "PositionStatus" TEXT NOT NULL,
    "GameID" INTEGER,
    CONSTRAINT "Dispenser_GameID_fkey" FOREIGN KEY ("GameID") REFERENCES "Game" ("GameID") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Dispenser" ("DispenserAssignment", "DispenserID", "DispenserLayout", "DispenserNumber", "PositionStatus") SELECT "DispenserAssignment", "DispenserID", "DispenserLayout", "DispenserNumber", "PositionStatus" FROM "Dispenser";
DROP TABLE "Dispenser";
ALTER TABLE "new_Dispenser" RENAME TO "Dispenser";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
