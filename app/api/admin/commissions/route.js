import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const commissions = await prisma.massLotteryCommission.findMany({
      orderBy: { CommissionID: "asc" },
    });

    return Response.json(commissions);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to fetch commissions" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();

    const commission = await prisma.massLotteryCommission.create({
      data: {
        CommissionName: body.CommissionName,
        ReportingRegion: body.ReportingRegion || null,
      },
    });

    return Response.json(commission);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to create commission" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();

    const commission = await prisma.massLotteryCommission.update({
      where: { CommissionID: body.CommissionID },
      data: {
        CommissionName: body.CommissionName,
        ReportingRegion: body.ReportingRegion || null,
      },
    });

    return Response.json(commission);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to update commission" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const body = await req.json();

    await prisma.massLotteryCommission.delete({
      where: { CommissionID: body.CommissionID },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to delete commission" }, { status: 500 });
  }
}