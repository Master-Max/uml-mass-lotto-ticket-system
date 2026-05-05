-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DailyTicketCountRecord" (
    "RecordID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "RecordDate" DATETIME NOT NULL,
    "StartTicketNumber" INTEGER,
    "EndingTicketNumber" INTEGER,
    "SoldOutStatus" TEXT,
    "TicketsSold" INTEGER,
    "SummaryID" INTEGER,
    "DispenserID" INTEGER NOT NULL,
    "GameID" INTEGER NOT NULL,
    "AgentID" INTEGER NOT NULL,
    CONSTRAINT "DailyTicketCountRecord_SummaryID_fkey" FOREIGN KEY ("SummaryID") REFERENCES "DailySalesSummary" ("SummaryID") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "DailyTicketCountRecord_DispenserID_fkey" FOREIGN KEY ("DispenserID") REFERENCES "Dispenser" ("DispenserID") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DailyTicketCountRecord_GameID_fkey" FOREIGN KEY ("GameID") REFERENCES "Game" ("GameID") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DailyTicketCountRecord_AgentID_fkey" FOREIGN KEY ("AgentID") REFERENCES "LottoAgent" ("AgentID") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_DailyTicketCountRecord" ("AgentID", "DispenserID", "EndingTicketNumber", "GameID", "RecordDate", "RecordID", "SoldOutStatus", "StartTicketNumber", "SummaryID", "TicketsSold") SELECT "AgentID", "DispenserID", "EndingTicketNumber", "GameID", "RecordDate", "RecordID", "SoldOutStatus", "StartTicketNumber", "SummaryID", "TicketsSold" FROM "DailyTicketCountRecord";
DROP TABLE "DailyTicketCountRecord";
ALTER TABLE "new_DailyTicketCountRecord" RENAME TO "DailyTicketCountRecord";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
