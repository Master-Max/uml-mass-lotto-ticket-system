import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const agent = await prisma.lottoAgent.findFirst();
    const commission = await prisma.massLotteryCommission.findFirst();

    if (!agent || !commission) {
      return Response.json(
        { error: "You need at least one LottoAgent and one Commission first." },
        { status: 400 }
      );
    }

    const today = new Date();


    // 1. Get today's ticket records
    const records = await prisma.dailyTicketCountRecord.findMany({
      where: {
        RecordDate: today,
      },
      include: {
        dispenser: {
          include: {
            assignedTo: {
              include: {
                game: true,
              },
            },
          },
        },
      },
    });

    let totalTicketsSold = 0;
    let totalOTCSales = 0;

    const dispenserTotals = {}; // { dispenserId: dollars }

    for (const record of records) {
      totalTicketsSold += record.TicketsSold;

      // get the game assigned to this dispenser
      const assignment = record.dispenser.assignedTo[0]; // latest/only for now
      const game = assignment?.game;

      const ticketValue = game?.TicketValue || 0;

      const sales = record.TicketsSold * ticketValue;

      totalOTCSales += sales;

      if (!dispenserTotals[record.DispenserID]) {
        dispenserTotals[record.DispenserID] = 0;
      }

      dispenserTotals[record.DispenserID] += sales;
    }

    // const salesDollarsByDispenser = JSON.stringify(dispenserTotals);
    const salesDollarsByDispenser = totalOTCSales;

    const summary = await prisma.dailySalesSummary.create({
      data: {
        SummaryDate: today,
        TotalTicketsSold: totalTicketsSold,
        TotalOTCSales: totalOTCSales,
        SalesDollarsByDispenser: salesDollarsByDispenser,
        DailyControlSummary: "Generated from admin dashboard",
        AgentID: agent.AgentID,
        CommissionID: commission.CommissionID,
      },
    });

    return Response.json(summary);
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to run daily sales summary" },
      { status: 500 }
    );
  }
}