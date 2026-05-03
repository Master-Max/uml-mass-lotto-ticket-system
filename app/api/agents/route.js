import { prisma } from "@/lib/prisma";

function optionalNumber(value) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  return Number(value);
}

export async function GET() {
  try {
    const agents = await prisma.lottoAgent.findMany({
      include: {
        commission: true,
      },
      orderBy: {
        AgentName: "asc",
      },
    });

    return Response.json(agents);
  } catch (error) {
    console.error("GET /api/agents error:", error);

    return Response.json(
      { error: "Failed to fetch agents" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();

    if (!body.AgentName) {
      return Response.json(
        { error: "AgentName is required" },
        { status: 400 }
      );
    }

    const agent = await prisma.lottoAgent.create({
      data: {
        AgentName: body.AgentName,
        Location: body.Location || null,
        CommissionID: optionalNumber(body.CommissionID),
      },
    });

    return Response.json(agent, { status: 201 });
  } catch (error) {
    console.error("POST /api/agents error:", error);

    return Response.json(
      { error: "Failed to create agent" },
      { status: 500 }
    );
  }
}