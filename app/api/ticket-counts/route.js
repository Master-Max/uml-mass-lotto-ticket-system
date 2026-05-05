import { prisma } from "@/lib/prisma";

function optionalNumber(value) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const number = Number(value);

  return Number.isNaN(number) ? null : number;
}

function getBackendRecordDate() {
  return new Date();
}

export async function POST(req) {
  try {
    const body = await req.json();

    const record = await prisma.dailyTicketCountRecord.create({
      data: {
        RecordDate: getBackendRecordDate(),
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

    return Response.json(record, { status: 201 });
  } catch (error) {
    console.error("POST /api/daily-ticket-count-records error:", error);
    return Response.json({ error: "Failed to create report" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();

    const RecordID = Number(body.RecordID);

    if (!RecordID) {
      return Response.json({ error: "RecordID is required" }, { status: 400 });
    }

    const record = await prisma.dailyTicketCountRecord.update({
      where: { RecordID },
      data: {
        RecordDate: getBackendRecordDate(),
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

    return Response.json(record);
  } catch (error) {
    console.error("PUT /api/daily-ticket-count-records error:", error);
    return Response.json({ error: "Failed to update report" }, { status: 500 });
  }
}