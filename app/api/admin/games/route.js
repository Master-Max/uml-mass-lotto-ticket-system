import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const games = await prisma.game.findMany({
      include: {
        commission: true,
      },
    });

    return NextResponse.json(games);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch games" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();

    const game = await prisma.game.create({
      data: {
        GameName: body.GameName,
        GameNumber: body.GameNumber,
        TicketValue: body.TicketValue,
        PackNumber: body.PackNumber,
        ActiveGameStatus: body.ActiveGameStatus || "Active",
        CommissionID: body.CommissionID,
      },
    });

    return NextResponse.json(game);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create game" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();

    const game = await prisma.game.update({
      where: {
        GameID: body.GameID,
      },
      data: {
        GameName: body.GameName,
        GameNumber: body.GameNumber,
        TicketValue: body.TicketValue,
        PackNumber: body.PackNumber,
        ActiveGameStatus: body.ActiveGameStatus || "Active",
      },
    });

    return NextResponse.json(game);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update game" }, { status: 500 });
  }
}