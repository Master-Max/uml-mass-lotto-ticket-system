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
    "AgentID" INTEGER,
    CONSTRAINT "Dispenser_GameID_fkey" FOREIGN KEY ("GameID") REFERENCES "Game" ("GameID") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Dispenser_AgentID_fkey" FOREIGN KEY ("AgentID") REFERENCES "LottoAgent" ("AgentID") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Dispenser" ("DispenserAssignment", "DispenserID", "DispenserLayout", "DispenserNumber", "GameID", "PositionStatus") SELECT "DispenserAssignment", "DispenserID", "DispenserLayout", "DispenserNumber", "GameID", "PositionStatus" FROM "Dispenser";
DROP TABLE "Dispenser";
ALTER TABLE "new_Dispenser" RENAME TO "Dispenser";
CREATE TABLE "new_LottoAgent" (
    "AgentID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "AgentName" TEXT NOT NULL,
    "Location" TEXT,
    "CommissionID" INTEGER,
    CONSTRAINT "LottoAgent_CommissionID_fkey" FOREIGN KEY ("CommissionID") REFERENCES "MassLotteryCommission" ("CommissionID") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_LottoAgent" ("AgentID", "AgentName", "Location") SELECT "AgentID", "AgentName", "Location" FROM "LottoAgent";
DROP TABLE "LottoAgent";
ALTER TABLE "new_LottoAgent" RENAME TO "LottoAgent";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
