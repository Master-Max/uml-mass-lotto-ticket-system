/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "User";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "LottoAgent" (
    "AgentID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "AgentName" TEXT NOT NULL,
    "Location" TEXT
);

-- CreateTable
CREATE TABLE "MassLotteryCommission" (
    "CommissionID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "CommissionName" TEXT NOT NULL,
    "ReportingRegion" TEXT
);

-- CreateTable
CREATE TABLE "DailySalesSummary" (
    "SummaryID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "SummaryDate" DATETIME NOT NULL,
    "SalesDollarsByDispenser" DECIMAL,
    "TotalTicketsSold" INTEGER NOT NULL,
    "TotalOTCSales" DECIMAL NOT NULL,
    "DailyControlSummary" TEXT,
    "CommissionID" INTEGER NOT NULL,
    "AgentID" INTEGER NOT NULL,
    CONSTRAINT "DailySalesSummary_CommissionID_fkey" FOREIGN KEY ("CommissionID") REFERENCES "MassLotteryCommission" ("CommissionID") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DailySalesSummary_AgentID_fkey" FOREIGN KEY ("AgentID") REFERENCES "LottoAgent" ("AgentID") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DailyTicketCountRecord" (
    "RecordID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "RecordDate" DATETIME NOT NULL,
    "StartTicketNumber" INTEGER NOT NULL,
    "EndingTicketNumber" INTEGER NOT NULL,
    "SoldOutStatus" TEXT NOT NULL,
    "TicketsSold" INTEGER NOT NULL,
    "SummaryID" INTEGER NOT NULL,
    "DispenserID" INTEGER NOT NULL,
    "AgentID" INTEGER NOT NULL,
    CONSTRAINT "DailyTicketCountRecord_SummaryID_fkey" FOREIGN KEY ("SummaryID") REFERENCES "DailySalesSummary" ("SummaryID") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DailyTicketCountRecord_DispenserID_fkey" FOREIGN KEY ("DispenserID") REFERENCES "Dispenser" ("DispenserID") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DailyTicketCountRecord_AgentID_fkey" FOREIGN KEY ("AgentID") REFERENCES "LottoAgent" ("AgentID") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Game" (
    "GameID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "GameNumber" INTEGER NOT NULL,
    "GameName" TEXT NOT NULL,
    "TicketValue" INTEGER NOT NULL,
    "PackNumber" INTEGER NOT NULL,
    "ActiveGameStatus" TEXT,
    "CommissionID" INTEGER NOT NULL,
    CONSTRAINT "Game_CommissionID_fkey" FOREIGN KEY ("CommissionID") REFERENCES "MassLotteryCommission" ("CommissionID") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Dispenser" (
    "DispenserID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "DispenserNumber" INTEGER NOT NULL,
    "DispenserAssignment" TEXT,
    "DispenserLayout" TEXT,
    "PositionStatus" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "assigned_to" (
    "GameID" INTEGER NOT NULL,
    "DispenserID" INTEGER NOT NULL,

    PRIMARY KEY ("GameID", "DispenserID"),
    CONSTRAINT "assigned_to_GameID_fkey" FOREIGN KEY ("GameID") REFERENCES "Game" ("GameID") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "assigned_to_DispenserID_fkey" FOREIGN KEY ("DispenserID") REFERENCES "Dispenser" ("DispenserID") ON DELETE RESTRICT ON UPDATE CASCADE
);
