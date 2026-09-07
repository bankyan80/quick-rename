import { NextResponse } from "next/server";
import { getSession } from "@/lib/quota";
import { prisma } from "@/lib/prisma";

async function isAdmin() {
  const session = await getSession();
  if (!session?.user?.id) return false;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) return false;
  if (user.role === "admin") return true;
  if (process.env.ADMIN_EMAIL && user.email === process.env.ADMIN_EMAIL) return true;
  return false;
}

export async function GET() {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
        lastLoginAt: true,
        tokenAccount: {
          select: { balance: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ users });
  } catch {
    return NextResponse.json({ error: "Failed to load users" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { userId, action, role, tokenAdjustment } = body;

    if (!userId) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      if (action === "set-role" && role) {
        const user = await tx.user.update({
          where: { id: userId },
          data: { role },
        });
        return { user };
      }

      if (action === "adjust-token" && typeof tokenAdjustment === "number") {
        let tokenAccount = await tx.tokenAccount.findUnique({
          where: { userId },
        });

        if (!tokenAccount) {
          tokenAccount = await tx.tokenAccount.create({
            data: { userId, balance: 0 },
          });
        }

        const balanceBefore = tokenAccount.balance;
        const balanceAfter = Math.max(0, balanceBefore + tokenAdjustment);

        const updated = await tx.tokenAccount.update({
          where: { id: tokenAccount.id },
          data: { balance: balanceAfter },
        });

        await tx.tokenTransaction.create({
          data: {
            userId,
            type: "ADJUSTMENT",
            amount: tokenAdjustment,
            balanceBefore,
            balanceAfter,
            description: "Admin adjustment",
          },
        });

        return { user: { id: userId }, tokenAccount: updated };
      }

      throw new Error("Invalid action");
    });

    return NextResponse.json({ success: true, ...result });
  } catch {
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
