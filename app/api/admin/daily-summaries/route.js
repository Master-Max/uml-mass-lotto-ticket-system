import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const body = await req.json();

    if (!body.AgentID || !body.CommissionID) {
      return Response.json(
        { error: "Agent and Commission are required" },
        { status: 400 }
      );
    }

    const summary = await prisma.dailySalesSummary.create({
      data: {
        SummaryDate: new Date(body.SummaryDate),
        TotalTicketsSold: body.TotalTicketsSold,
        TotalOTCSales: body.TotalOTCSales,
        SalesDollarsByDispenser: body.SalesDollarsByDispenser || null,
        DailyControlSummary: body.DailyControlSummary || null,
        AgentID: body.AgentID,
        CommissionID: body.CommissionID,
      },
    });

    return Response.json(summary);
  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Failed to create daily summary" },
      { status: 500 }
    );
  }
}