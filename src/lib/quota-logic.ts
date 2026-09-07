export interface QuotaSnapshot {
  type: "free" | "google" | "token";
  freeUsed: number;
  freeTotal: number;
  googleUsed: number;
  googleTotal: number;
  tokenBalance: number;
}

export const FREE_QUOTA = 5;
export const GOOGLE_QUOTA = 10;
export const FILES_PER_TOKEN = 100;

export function planQuotaConsumption(
  quota: QuotaSnapshot,
  successfulCount: number
): {
  allowed: boolean;
  googleToConsume: number;
  tokenToConsume: number;
  remainingFiles: number;
  reason?: string;
} {
  const totalAvailable =
    Math.max(0, GOOGLE_QUOTA - quota.googleUsed) + quota.tokenBalance;

  if (successfulCount > totalAvailable) {
    return {
      allowed: false,
      googleToConsume: 0,
      tokenToConsume: 0,
      remainingFiles: totalAvailable,
      reason: "Insufficient quota",
    };
  }

  const googleRemaining = Math.max(0, GOOGLE_QUOTA - quota.googleUsed);

  if (successfulCount <= googleRemaining) {
    return {
      allowed: true,
      googleToConsume: successfulCount,
      tokenToConsume: 0,
      remainingFiles: googleRemaining + quota.tokenBalance - successfulCount,
    };
  }

  const googleToConsume = googleRemaining;
  const tokenToConsume = successfulCount - googleRemaining;

  return {
    allowed: true,
    googleToConsume,
    tokenToConsume,
    remainingFiles:
      quota.tokenBalance - tokenToConsume + (googleRemaining - googleToConsume),
  };
}

export function applyTokenPurchase(
  balanceBefore: number,
  fileQuantity: number
): number {
  return balanceBefore + fileQuantity;
}

export function consumptionAfterOperation(
  attempted: number,
  successful: number
): number {
  return successful;
}

export function anonymousQuotaStatus(
  usedFiles: number,
  total: number = FREE_QUOTA
): { remaining: number; exhausted: boolean } {
  const remaining = Math.max(0, total - usedFiles);
  return { remaining, exhausted: remaining <= 0 };
}