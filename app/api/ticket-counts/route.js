import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const body = await req.json();

    // 🔒 Validate foreign keys (prevents Prisma crash)
    const dispenser = await prisma.dispenser.findUnique({
      where: { DispenserID: body.DispenserID },
    });

    if (!dispenser) {
      return Response.json(
        { error: "Invalid DispenserID" },
        { status: 400 }
      );
    }

    const summary = await prisma.dailySalesSummary.findUnique({
      where: { SummaryID: body.SummaryID },
    });

    if (!summary) {
      return Response.json(
        { error: "Invalid SummaryID" },
        { status: 400 }
      );
    }

    const agent = await prisma.lottoAgent.findUnique({
      where: { AgentID: body.AgentID },
    });

    if (!agent) {
      return Response.json(
        { error: "Invalid AgentID" },
        { status: 400 }
      );
    }

    const record = await prisma.dailyTicketCountRecord.create({
      data: {
        RecordDate: new Date(body.RecordDate),
        StartTicketNumber: body.StartTicketNumber,
        EndingTicketNumber: body.EndingTicketNumber,
        TicketsSold: body.TicketsSold,
        SoldOutStatus: body.SoldOutStatus,

        DispenserID: body.DispenserID,
        SummaryID: body.SummaryID,
        AgentID: body.AgentID,
      },
    });

    return Response.json(record);
  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Failed to create ticket record" },
      { status: 500 }
    );
  }
}