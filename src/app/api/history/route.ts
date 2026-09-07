import { NextResponse } from "next/server";
import { getSession } from "@/lib/quota";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ history: [] });
    }

    const history = await prisma.renameHistory.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ history });
  } catch {
    return NextResponse.json({ history: [] });
  }
}
