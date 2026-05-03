import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const agents = await prisma.lottoAgent.findMany({
      orderBy: { AgentID: "asc" },
    });

    return NextResponse.json(agents);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch agents" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();

    const agent = await prisma.lottoAgent.create({
      data: {
        AgentName: body.AgentName,
        Location: body.Location || null,
      },
    });

    return NextResponse.json(agent);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create agent" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();

    const agent = await prisma.lottoAgent.update({
      where: { AgentID: body.AgentID },
      data: {
        AgentName: body.AgentName,
        Location: body.Location || null,
      },
    });

    return NextResponse.json(agent);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update agent" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const body = await req.json();

    await prisma.lottoAgent.delete({
      where: { AgentID: body.AgentID },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete agent" }, { status: 500 });
  }
}