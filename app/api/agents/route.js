import { prisma } from "@/lib/prisma";

export async function GET() {
  const agents = await prisma.lottoAgent.findMany();
  return Response.json(agents);
}

export async function POST(req) {
  const body = await req.json();

  const agent = await prisma.lottoAgent.create({
    data: {
      AgentName: body.AgentName,
      Location: body.Location || null,
    },
  });

  return Response.json(agent);
}