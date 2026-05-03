import { NextRequest, NextResponse } from 'next/server'
import { prisma } from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    // console.log(params)
    const {id} = await params;
    console.log( id )
    const AgentID = Number(id)
    if (!AgentID) {
      return NextResponse.json(
        { error: "Invalid agent ID" },
        { status: 400 }
      );
    }

    const agent = await prisma.lottoAgent.findUnique({
      where: {
        AgentID,
      },
      include: {
        commission: true,
        dispensers: {
          include: {
            game: true,
          },
          orderBy: {
            DispenserNumber: "asc",
          },
        },
        dailySalesSummaries: {
          orderBy: {
            SummaryDate: "desc",
          },
          take: 10,
        },
      },
    });

    if (!agent) {
      return NextResponse.json(
        { error: "Agent not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(agent);
  } catch (error) {
    console.error("GET /api/agents/[id] error:", error);

    return NextResponse.json(
      { error: "Failed to fetch agent" },
      { status: 500 }
    );
  }
}