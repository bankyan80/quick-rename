import { NextResponse } from "next/server";
import { getSession, getUserQuota } from "@/lib/quota";
import { prisma } from "@/lib/prisma";

const FREE_QUOTA = Number(process.env.FREE_QUOTA || 5);

export async function GET(request: Request) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      const url = new URL(request.url);
      const anonymousId = url.searchParams.get("anonymousId");
      let freeUsed = 0;

      if (anonymousId) {
        const anon = await prisma.anonymousSession.findUnique({
          where: { sessionHash: anonymousId },
        });
        freeUsed = anon?.usedFiles || 0;
      }

      return NextResponse.json({
        type: "free",
        freeUsed,
        freeTotal: FREE_QUOTA,
        googleUsed: 0,
        googleTotal: 0,
        tokenBalance: 0,
        totalRemaining: Math.max(0, FREE_QUOTA - freeUsed),
        isAuthenticated: false,
        isAdmin: false,
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    let isAdmin = false;
    if (user?.role === "admin" || user?.email === process.env.ADMIN_EMAIL) {
      isAdmin = true;
    }

    const quota = await getUserQuota(session.user.id);
    return NextResponse.json({
      ...quota,
      isAuthenticated: true,
      isAdmin,
      name: user?.name,
      email: user?.email,
      avatar: user?.avatarUrl,
    });
  } catch (error) {
    console.error("Quota error:", error);
    return NextResponse.json(
      { error: "Failed to load quota" },
      { status: 500 }
    );
  }
}