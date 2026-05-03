import { prisma } from "@/lib/prisma";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get("agentId");

    const summaries = await prisma.dailySalesSummary.findMany({
      where: agentId
        ? {
            AgentID: Number(agentId),
          }
        : {},
      include: {
        agent: true,
        commission: true,
        ticketCountRecords: true,
      },
      orderBy: {
        SummaryDate: "desc",
      },
    });

    return Response.json(summaries);
  } catch (error) {
    console.error("GET /api/summaries error:", error);

    return Response.json(
      { error: "Failed to fetch summaries" },
      { status: 500 }
    );
  }
}