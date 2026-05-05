import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function optionalDateOnly(value) {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  const [year, month, day] = String(value).split("T")[0].split("-").map(Number);

  if (!year || !month || !day) {
    return undefined;
  }

  return new Date(year, month - 1, day, 12, 0, 0);
}

export async function GET() {
  try {
    const summaries = await prisma.dailySalesSummary.findMany({
      include: {
        agent: true,
        commission: true,
        ticketCountRecords: true,
      },
      orderBy: {
        SummaryDate: "desc",
      },
    });

    return NextResponse.json(summaries);
  } catch (error) {
    console.error("GET /api/admin/daily-summaries error:", error);

    return NextResponse.json(
      { error: "Failed to fetch daily summaries" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();

    const agentId = Number(body.AgentID);
    const commissionId = Number(body.CommissionID);

    if (!agentId || !commissionId || !body.SummaryDate) {
      return NextResponse.json(
        { error: "Agent, Commission, and SummaryDate are required" },
        { status: 400 }
      );
    }

    const reportDate = optionalDateOnly(body.SummaryDate);

    if (!reportDate) {
      return NextResponse.json(
        { error: "Valid SummaryDate is required" },
        { status: 400 }
      );
    }

    const startOfDay = new Date(reportDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(reportDate);
    endOfDay.setDate(endOfDay.getDate() + 1);
    endOfDay.setHours(0, 0, 0, 0);

    const records = await prisma.dailyTicketCountRecord.findMany({
      where: {
        RecordDate: {
          gte: startOfDay,
          lt: endOfDay,
        },
        AgentID: agentId,
      },
      include: {
        game: true,
        dispenser: true,
      },
    });

    if (records.length === 0) {
      return NextResponse.json(
        { error: `No ticket count records found for ${body.SummaryDate}` },
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

      dispenserTotals[record.DispenserID] =
        (dispenserTotals[record.DispenserID] || 0) + sales;
    }

    const existingSummary = await prisma.dailySalesSummary.findFirst({
      where: {
        SummaryDate: {
          gte: startOfDay,
          lt: endOfDay,
        },
        AgentID: agentId,
        CommissionID: commissionId,
      },
    });

    const summaryData = {
      SummaryDate: reportDate,
      TotalTicketsSold: totalTicketsSold,
      TotalOTCSales: totalOTCSales,
      SalesDollarsByDispenser: totalOTCSales,
      DailyControlSummary: JSON.stringify(dispenserTotals),
      AgentID: agentId,
      CommissionID: commissionId,
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
          lt: endOfDay,
        },
        AgentID: agentId,
      },
      data: {
        SummaryID: summary.SummaryID,
      },
    });

    return NextResponse.json(summary, {
      status: existingSummary ? 200 : 201,
    });
  } catch (error) {
    console.error("POST /api/admin/daily-summaries error:", error);

    return NextResponse.json(
      { error: "Failed to create daily summary" },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();

    const SummaryID = Number(body.SummaryID);

    if (!SummaryID) {
      return NextResponse.json(
        { error: "SummaryID is required" },
        { status: 400 }
      );
    }

    const summary = await prisma.dailySalesSummary.update({
      where: {
        SummaryID,
      },
      data: {
        SummaryDate: new Date(body.SummaryDate),
        TotalTicketsSold: Number(body.TotalTicketsSold),
        TotalOTCSales: Number(body.TotalOTCSales),
        SalesDollarsByDispenser:
          body.SalesDollarsByDispenser === null ||
          body.SalesDollarsByDispenser === ""
            ? null
            : Number(body.SalesDollarsByDispenser),
        DailyControlSummary: body.DailyControlSummary || null,
        AgentID: Number(body.AgentID),
        CommissionID: Number(body.CommissionID),
      },
    });

    return NextResponse.json(summary);
  } catch (error) {
    console.error("PUT /api/admin/daily-summaries error:", error);

    return NextResponse.json(
      { error: "Failed to update daily summary" },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    const body = await req.json();

    const SummaryID = Number(body.SummaryID);

    if (!SummaryID) {
      return NextResponse.json(
        { error: "SummaryID is required" },
        { status: 400 }
      );
    }

    const deleted = await prisma.dailySalesSummary.delete({
      where: {
        SummaryID,
      },
    });

    return NextResponse.json(deleted);
  } catch (error) {
    console.error("DELETE /api/admin/daily-summaries error:", error);

    return NextResponse.json(
      {
        error:
          "Failed to delete daily summary. It may be used by ticket count records.",
      },
      { status: 500 }
    );
  }
}