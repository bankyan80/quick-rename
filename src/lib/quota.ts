import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";

export async function getSession() {
  try {
    return await auth();
  } catch {
    return null;
  }
}

export interface UserQuota {
  type: "free" | "google" | "token";
  freeUsed: number;
  freeTotal: number;
  googleUsed: number;
  googleTotal: number;
  tokenBalance: number;
  totalRemaining: number;
  userId?: string;
  isAdmin: boolean;
  isAuthenticated: boolean;
}

export async function getUserQuota(userId: string): Promise<Omit<UserQuota, "isAuthenticated" | "isAdmin">> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      tokenAccount: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const usedFiles = await prisma.renameHistory.aggregate({
    where: { userId },
    _sum: { fileCount: true },
  });

  const googleUsed = usedFiles._sum.fileCount || 0;
  const googleTotal = 10;
  const tokenBalance = user.tokenAccount?.balance || 0;

  const googleRemaining = Math.max(0, googleTotal - googleUsed);
  const totalRemaining = googleRemaining + tokenBalance;

  return {
    type: "google",
    freeUsed: 0,
    freeTotal: 5,
    googleUsed,
    googleTotal,
    tokenBalance,
    totalRemaining,
    userId,
  };
}