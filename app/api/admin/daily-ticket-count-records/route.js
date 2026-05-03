import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const records = await prisma.dailyTicketCountRecord.findMany({
      include: {
        summary: true,
        dispenser: true,
        game: true,
        agent: true,
      },
      orderBy: {
        RecordDate: "desc",
      },
    });

    return NextResponse.json(records);
  } catch (error) {
    console.error("GET /api/admin/daily-ticket-count-records error:", error);

    return NextResponse.json(
      { error: "Failed to fetch daily ticket count records" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const record = await prisma.dailyTicketCountRecord.create({
      data: {
        RecordDate: new Date(body.RecordDate),
        StartTicketNumber: Number(body.StartTicketNumber),
        EndingTicketNumber: Number(body.EndingTicketNumber),
        SoldOutStatus: body.SoldOutStatus,
        TicketsSold: Number(body.TicketsSold),
        SummaryID:
          body.SummaryID === "" ||
          body.SummaryID === null ||
          body.SummaryID === undefined
            ? null
            : Number(body.SummaryID),
        DispenserID: Number(body.DispenserID),
        GameID: Number(body.GameID),
        AgentID: Number(body.AgentID),
      },
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/daily-ticket-count-records error:", error);

    return NextResponse.json(
      { error: "Failed to create daily ticket count record" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();

    const RecordID = Number(body.RecordID);

    if (!RecordID) {
      return NextResponse.json(
        { error: "RecordID is required" },
        { status: 400 }
      );
    }

    const record = await prisma.dailyTicketCountRecord.update({
      where: {
        RecordID,
      },
      data: {
        RecordDate: new Date(body.RecordDate),
        StartTicketNumber: Number(body.StartTicketNumber),
        EndingTicketNumber: Number(body.EndingTicketNumber),
        SoldOutStatus: body.SoldOutStatus,
        TicketsSold: Number(body.TicketsSold),
        SummaryID:
          body.SummaryID === "" ||
          body.SummaryID === null ||
          body.SummaryID === undefined
            ? null
            : Number(body.SummaryID),
        DispenserID: Number(body.DispenserID),
        GameID: Number(body.GameID),
        AgentID: Number(body.AgentID),
      },
    });

    return NextResponse.json(record);
  } catch (error) {
    console.error("PUT /api/admin/daily-ticket-count-records error:", error);

    return NextResponse.json(
      { error: "Failed to update daily ticket count record" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const body = await request.json();

    const RecordID = Number(body.RecordID);

    if (!RecordID) {
      return NextResponse.json(
        { error: "RecordID is required" },
        { status: 400 }
      );
    }

    const deleted = await prisma.dailyTicketCountRecord.delete({
      where: {
        RecordID,
      },
    });

    return NextResponse.json(deleted);
  } catch (error) {
    console.error("DELETE /api/admin/daily-ticket-count-records error:", error);

    return NextResponse.json(
      { error: "Failed to delete daily ticket count record" },
      { status: 500 }
    );
  }
}