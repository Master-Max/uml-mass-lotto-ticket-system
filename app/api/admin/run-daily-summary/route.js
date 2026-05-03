import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const agent = await prisma.lottoAgent.findFirst();
    const commission = await prisma.massLotteryCommission.findFirst();

    if (!agent || !commission) {
      return NextResponse.json(
        { error: "You need at least one LottoAgent and one Commission first." },
        { status: 400 }
      );
    }

    const now = new Date();

    const startOfDay = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      0,
      0,
      0,
      0
    ));

    const endOfDay = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 1,
      0,
      0,
      0,
      0
    ));


    const records = await prisma.dailyTicketCountRecord.findMany({
      where: {
        RecordDate: {
          gte: startOfDay,
          lt: endOfDay,
        },
        AgentID: agent.AgentID,
      },
      include: {
        game: true,
        dispenser: true,
      },
    });

    if (records.length === 0) {
      return NextResponse.json(
        { error: "No ticket count records found for today." },
        { status: 400 }
      );
    }

    let totalTicketsSold = 0;
    let totalOTCSales = 0;

    const dispenserTotals = {};

    for (const record of records) {
      const ticketsSold = Number(record.TicketsSold || 0);
      const ticketValue = Number(record.game?.TicketValue || 0);
      const sales = ticketsSold * ticketValue;

      totalTicketsSold += ticketsSold;
      totalOTCSales += sales;

      if (!dispenserTotals[record.DispenserID]) {
        dispenserTotals[record.DispenserID] = 0;
      }

      dispenserTotals[record.DispenserID] += sales;
    }

    const existingSummary = await prisma.dailySalesSummary.findFirst({
      where: {
        SummaryDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        AgentID: agent.AgentID,
        CommissionID: commission.CommissionID,
      },
    });

    const summaryData = {
      SummaryDate: now,
      TotalTicketsSold: totalTicketsSold,
      TotalOTCSales: totalOTCSales,
      SalesDollarsByDispenser: totalOTCSales,
      DailyControlSummary: JSON.stringify(dispenserTotals),
      AgentID: agent.AgentID,
      CommissionID: commission.CommissionID,
    };

    const summary = existingSummary
      ? await prisma.dailySalesSummary.update({
          where: {
            SummaryID: existingSummary.SummaryID,
          },
          data: summaryData,
        })
      : await prisma.dailySalesSummary.create({
          data: summaryData,
        });

    await prisma.dailyTicketCountRecord.updateMany({
      where: {
        RecordDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        AgentID: agent.AgentID,
      },
      data: {
        SummaryID: summary.SummaryID,
      },
    });

    return NextResponse.json({
      summary,
      recordsLinked: records.length,
      dispenserTotals,
    });
  } catch (error) {
    console.error("POST /api/admin/run-daily-summary error:", error);

    return NextResponse.json(
      { error: "Failed to run daily sales summary" },
      { status: 500 }
    );
  }
}