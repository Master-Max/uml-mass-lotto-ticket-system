import { prisma } from "@/lib/prisma";

function optionalNumber(value) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  return Number(value);
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get("agentId");

    const dispensers = await prisma.dispenser.findMany({
      where: agentId
        ? {
            AgentID: Number(agentId),
          }
        : {},
      include: {
        game: true,
        agent: true,
      },
      orderBy: {
        DispenserNumber: "asc",
      },
    });

    return Response.json(dispensers);
  } catch (error) {
    console.error("GET /api/dispensers error:", error);

    return Response.json(
      { error: "Failed to fetch dispensers" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();

    if (!body.DispenserNumber) {
      return Response.json(
        { error: "Dispenser number is required" },
        { status: 400 }
      );
    }

    const dispenser = await prisma.dispenser.create({
      data: {
        DispenserNumber: Number(body.DispenserNumber),
        DispenserAssignment: body.DispenserAssignment || null,
        DispenserLayout: body.DispenserLayout || null,
        PositionStatus: body.PositionStatus || "Active",
        GameID: optionalNumber(body.GameID),
        AgentID: optionalNumber(body.AgentID),
      },
    });

    return Response.json(dispenser, { status: 201 });
  } catch (error) {
    console.error("POST /api/dispensers error:", error);

    return Response.json(
      { error: "Failed to create dispenser" },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();

    const DispenserID = Number(body.DispenserID);

    if (!DispenserID) {
      return Response.json(
        { error: "DispenserID is required" },
        { status: 400 }
      );
    }

    const dispenser = await prisma.dispenser.update({
      where: { DispenserID },
      data: {
        DispenserNumber: Number(body.DispenserNumber),
        DispenserAssignment: body.DispenserAssignment || null,
        DispenserLayout: body.DispenserLayout || null,
        PositionStatus: body.PositionStatus || "Active",
        GameID: body.GameID ? Number(body.GameID) : null,
        AgentID: body.AgentID ? Number(body.AgentID) : null,
      },
    });

    return Response.json(dispenser);
  } catch (error) {
    console.error("PUT /api/dispensers error:", error);

    return Response.json(
      { error: "Failed to update dispenser" },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    const body = await req.json();

    const DispenserID = Number(body.DispenserID);

    if (!DispenserID) {
      return Response.json(
        { error: "DispenserID is required" },
        { status: 400 }
      );
    }

    const deleted = await prisma.dispenser.delete({
      where: { DispenserID },
    });

    return Response.json(deleted);
  } catch (error) {
    console.error("DELETE /api/dispensers error:", error);

    return Response.json(
      {
        error: "Failed to delete dispenser. It may be used by ticket records.",
      },
      { status: 500 }
    );
  }
}