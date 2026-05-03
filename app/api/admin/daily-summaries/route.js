import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    if (!body.AgentID || !body.CommissionID) {
      return NextResponse.json(
        { error: "Agent and Commission are required" },
        { status: 400 }
      );
    }

    const summary = await prisma.dailySalesSummary.create({
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

    return NextResponse.json(summary, { status: 201 });
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