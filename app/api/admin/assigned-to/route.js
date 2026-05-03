import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const assignedTo = await prisma.assignedTo.findMany({
      include: {
        game: true,
        dispenser: true,
      },
      orderBy: [{ GameID: "asc" }, { DispenserID: "asc" }],
    });

    return NextResponse.json(assignedTo);
  } catch (error) {
    console.error("GET /api/admin/assigned-to error:", error);

    return NextResponse.json(
      { error: "Failed to fetch assigned records" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const GameID = Number(body.GameID);
    const DispenserID = Number(body.DispenserID);

    if (!GameID || !DispenserID) {
      return NextResponse.json(
        { error: "GameID and DispenserID are required" },
        { status: 400 }
      );
    }

    const assignedTo = await prisma.assignedTo.create({
      data: {
        GameID,
        DispenserID,
      },
    });

    return NextResponse.json(assignedTo, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/assigned-to error:", error);

    return NextResponse.json(
      { error: "Failed to create assigned record" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();

    const originalGameID = Number(body.originalGameID ?? body.GameID);
    const originalDispenserID = Number(
      body.originalDispenserID ?? body.DispenserID
    );

    const GameID = Number(body.GameID);
    const DispenserID = Number(body.DispenserID);

    if (!originalGameID || !originalDispenserID || !GameID || !DispenserID) {
      return NextResponse.json(
        {
          error:
            "originalGameID, originalDispenserID, GameID, and DispenserID are required",
        },
        { status: 400 }
      );
    }

    const assignedTo = await prisma.assignedTo.update({
      where: {
        GameID_DispenserID: {
          GameID: originalGameID,
          DispenserID: originalDispenserID,
        },
      },
      data: {
        GameID,
        DispenserID,
      },
    });

    return NextResponse.json(assignedTo);
  } catch (error) {
    console.error("PUT /api/admin/assigned-to error:", error);

    return NextResponse.json(
      { error: "Failed to update assigned record" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const body = await request.json();

    const GameID = Number(body.GameID);
    const DispenserID = Number(body.DispenserID);

    if (!GameID || !DispenserID) {
      return NextResponse.json(
        { error: "GameID and DispenserID are required" },
        { status: 400 }
      );
    }

    const deleted = await prisma.assignedTo.delete({
      where: {
        GameID_DispenserID: {
          GameID,
          DispenserID,
        },
      },
    });

    return NextResponse.json(deleted);
  } catch (error) {
    console.error("DELETE /api/admin/assigned-to error:", error);

    return NextResponse.json(
      { error: "Failed to delete assigned record" },
      { status: 500 }
    );
  }
}