import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const summaries = await prisma.dailySalesSummary.findMany({
      include: {
        agent: true,
        commission: true,
      },
      orderBy: {
        SummaryDate: "desc",
      },
    });

    return Response.json(summaries);
  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Failed to fetch summaries" },
      { status: 500 }
    );
  }
}