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
    const dispensers = await prisma.dispenser.findMany({
      include: {
        game: true,
        agent: true,
      },
      orderBy: {
        DispenserNumber: "asc",
      },
    });

    return NextResponse.json(dispensers);
  } catch (error) {
    console.error("GET /api/admin/dispensers error:", error);

    return NextResponse.json(
      { error: "Failed to fetch dispensers" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();

    if (!body.DispenserNumber) {
      return NextResponse.json(
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

    return NextResponse.json(dispenser, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/dispensers error:", error);

    return NextResponse.json(
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
      return NextResponse.json(
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
        GameID: optionalNumber(body.GameID),
        AgentID: optionalNumber(body.AgentID),
      },
    });

    return NextResponse.json(dispenser);
  } catch (error) {
    console.error("PUT /api/admin/dispensers error:", error);

    return NextResponse.json(
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
      return NextResponse.json(
        { error: "DispenserID is required" },
        { status: 400 }
      );
    }

    const deleted = await prisma.dispenser.delete({
      where: { DispenserID },
    });

    return NextResponse.json(deleted);
  } catch (error) {
    console.error("DELETE /api/admin/dispensers error:", error);

    return NextResponse.json(
      {
        error: "Failed to delete dispenser. It may be used by ticket records.",
      },
      { status: 500 }
    );
  }
}