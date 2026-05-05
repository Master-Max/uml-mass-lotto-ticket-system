import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const AgentID = Number(id);

    if (!AgentID) {
      return NextResponse.json(
        { error: "Invalid agent ID" },
        { status: 400 }
      );
    }

    const ticketsByAgent = await prisma.dailyTicketCountRecord.findMany({
      where: {
        AgentID,
      },
      include: {
        agent: true,
        dispenser: {
          include: {
            game: true,
          },
        },
        game: true,
        summary: true,
      },
      orderBy: {
        RecordDate: "desc",
      },
    });

    return NextResponse.json(ticketsByAgent);
  } catch (error) {
    console.error("GET ticket records by agent error:", error);

    return NextResponse.json(
      { error: "Failed to fetch ticket records" },
      { status: 500 }
    );
  }
}