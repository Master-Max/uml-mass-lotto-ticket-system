import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const agent = await prisma.lottoAgent.findFirst();
    const commission = await prisma.massLotteryCommission.findFirst();

    console.log(agent)
    console.log(commission)

    if (!agent || !commission) {
      return NextResponse.json(
        { error: "You need at least one LottoAgent and one Commission first." },
        { status: 400 }
      );
    }

    const today = new Date();

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);


    // 1. Get today's ticket records
    // const records = await prisma.

    // const records = await prisma.dailyTicketCountRecord.findMany()

    const records = await prisma.dailyTicketCountRecord.findMany({
      where: {
        RecordDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
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


    console.log(records)
    
    // return Response.json({message: 'Testing 123', status: 500})

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

    return NextResponse.json(summary);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to run daily sales summary" },
      { status: 500 }
    );
  }
}