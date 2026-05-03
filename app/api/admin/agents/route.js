import { NextResponse } from "next/server";
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
        dispensers: true,
      },
      orderBy: { AgentID: "asc" },
    });

    return NextResponse.json(agents);
  } catch (error) {
    console.error("GET /api/admin/agents error:", error);
    return NextResponse.json(
      { error: "Failed to fetch agents" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();

    if (!body.AgentName) {
      return NextResponse.json(
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

    return NextResponse.json(agent, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/agents error:", error);
    return NextResponse.json(
      { error: "Failed to create agent" },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();

    const AgentID = Number(body.AgentID);

    if (!AgentID) {
      return NextResponse.json(
        { error: "AgentID is required" },
        { status: 400 }
      );
    }

    const agent = await prisma.lottoAgent.update({
      where: { AgentID },
      data: {
        AgentName: body.AgentName,
        Location: body.Location || null,
        CommissionID: optionalNumber(body.CommissionID),
      },
    });

    return NextResponse.json(agent);
  } catch (error) {
    console.error("PUT /api/admin/agents error:", error);
    return NextResponse.json(
      { error: "Failed to update agent" },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    const body = await req.json();

    const AgentID = Number(body.AgentID);

    if (!AgentID) {
      return NextResponse.json(
        { error: "AgentID is required" },
        { status: 400 }
      );
    }

    await prisma.lottoAgent.delete({
      where: { AgentID },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/agents error:", error);

    return NextResponse.json(
      {
        error:
          "Failed to delete agent. It may be linked to summaries, dispensers, or ticket records.",
      },
      { status: 500 }
    );
  }
}