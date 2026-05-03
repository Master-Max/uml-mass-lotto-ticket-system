import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const dispensers = await prisma.dispenser.findMany({
      orderBy: {
        DispenserNumber: "asc",
      },
    });

    return NextResponse.json(dispensers);
  } catch (error) {
    console.error(error);
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
        DispenserNumber: body.DispenserNumber,
        DispenserAssignment: body.DispenserAssignment || null,
        DispenserLayout: body.DispenserLayout || null,
        PositionStatus: body.PositionStatus || "Active",
      },
    });

    return NextResponse.json(dispenser);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create dispenser" },
      { status: 500 }
    );
  }
}