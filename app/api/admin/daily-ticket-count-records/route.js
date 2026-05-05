import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function optionalNumber(value) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const number = Number(value);
  return Number.isNaN(number) ? null : number;
}

function optionalDate(value) {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function optionalDateOnly(value) {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  const [year, month, day] = String(value).split("T")[0].split("-").map(Number);

  if (!year || !month || !day) {
    return undefined;
  }

  return new Date(year, month - 1, day, 12, 0, 0);
}

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
        createdAt: "desc",
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
        RecordDate: optionalDateOnly(body.RecordDate) ?? new Date(),
        createdAt: optionalDateOnly(body.createdAt),

        StartTicketNumber: optionalNumber(body.StartTicketNumber),
        EndingTicketNumber: optionalNumber(body.EndingTicketNumber),
        SoldOutStatus: optionalNumber(body.EndingTicketNumber)===0? "Sold Out" : "In Stock",
        TicketsSold: optionalNumber(body.TicketsSold),
        SummaryID: optionalNumber(body.SummaryID),
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

    const data = {
      RecordDate: optionalDateOnly(body.RecordDate) ?? new Date(),
      StartTicketNumber: optionalNumber(body.StartTicketNumber),
      EndingTicketNumber: optionalNumber(body.EndingTicketNumber),
      SoldOutStatus: optionalNumber(body.EndingTicketNumber)===0? "Sold Out" : "In Stock",
      TicketsSold: optionalNumber(body.TicketsSold),
      SummaryID: optionalNumber(body.SummaryID),
      DispenserID: Number(body.DispenserID),
      GameID: Number(body.GameID),
      AgentID: Number(body.AgentID),
    };

    const createdAt = optionalDate(body.createdAt);

    if (createdAt) {
      data.createdAt = createdAt;
    }

    const record = await prisma.dailyTicketCountRecord.update({
      where: { RecordID },
      data,
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