import { NextResponse } from "next/server";
import { getSession } from "@/lib/quota";
import { prisma } from "@/lib/prisma";

const FREE_QUOTA = Number(process.env.FREE_QUOTA || 5);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { successfulCount, operationId, summary, anonymousId } = body;

    if (
      typeof successfulCount !== "number" ||
      successfulCount < 0 ||
      typeof operationId !== "string"
    ) {
      return NextResponse.json(
        { error: "Invalid request parameters" },
        { status: 400 }
      );
    }

    if (successfulCount === 0) {
      return NextResponse.json({
        success: true,
        consumed: 0,
        tokenUsed: 0,
        googleUsed: 0,
      });
    }

    const session = await getSession();

    if (!session?.user?.id) {
      if (typeof anonymousId !== "string" || anonymousId.length < 8) {
        return NextResponse.json(
          { error: "Active session not found. Please refresh to continue." },
          { status: 401 }
        );
      }

      const result = await prisma.$transaction(async (tx) => {
        let anon = await tx.anonymousSession.upsert({
          where: { sessionHash: anonymousId },
          update: {},
          create: { sessionHash: anonymousId, usedFiles: 0 },
        });

        const freeUsed = anon.usedFiles;
        if (freeUsed + successfulCount > FREE_QUOTA) {
          throw new Error("Insufficient quota");
        }

        anon = await tx.anonymousSession.update({
          where: { id: anon.id },
          data: { usedFiles: freeUsed + successfulCount },
        });

        return { freeUsed: anon.usedFiles, freeTotal: FREE_QUOTA };
      });

      return NextResponse.json({
        success: true,
        consumed: successfulCount,
        tokenUsed: 0,
        googleUsed: 0,
        anonymous: true,
        freeUsed: result.freeUsed,
        freeTotal: result.freeTotal,
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: session.user!.id! },
        include: { tokenAccount: true },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const previousUsage = await tx.renameHistory.aggregate({
        where: { userId: user.id },
        _sum: { fileCount: true },
      });

      const googleUsed = previousUsage._sum.fileCount || 0;
      const googleTotal = 10;
      const googleRemaining = Math.max(0, googleTotal - googleUsed);
      const tokenBalance = user.tokenAccount?.balance || 0;

      let tokenUsed = 0;
      let googleUsedFinal = googleUsed;

      if (successfulCount > googleRemaining) {
        tokenUsed = successfulCount - googleRemaining;
        googleUsedFinal = googleTotal;
      } else {
        googleUsedFinal = googleUsed + successfulCount;
      }

      if (tokenUsed > tokenBalance) {
        throw new Error("Insufficient quota");
      }

      await tx.renameHistory.create({
        data: {
          userId: user.id,
          operationId,
          fileCount: successfulCount,
          summary: summary || null,
        },
      });

      if (tokenUsed > 0 && user.tokenAccount) {
        const balanceBefore = user.tokenAccount.balance;
        const balanceAfter = user.tokenAccount.balance - tokenUsed;

        await tx.tokenAccount.update({
          where: { id: user.tokenAccount.id },
          data: { balance: balanceAfter },
        });

        await tx.tokenTransaction.create({
          data: {
            userId: user.id,
            type: "USAGE",
            amount: -tokenUsed,
            balanceBefore,
            balanceAfter,
            reference: operationId,
            description: "Rename operation",
          },
        });
      }

      return { tokenUsed, googleUsedFinal };
    });

    return NextResponse.json({
      success: true,
      consumed: successfulCount,
      tokenUsed: result.tokenUsed,
      googleUsed: result.googleUsedFinal,
    });
  } catch (error) {
    console.error("Rename consumption error:", error);
    if (error instanceof Error && error.message === "Insufficient quota") {
      return NextResponse.json(
        { error: "Kuota tidak mencukupi" },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { error: "Failed to process rename" },
      { status: 500 }
    );
  }
}
