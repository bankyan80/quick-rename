import { describe, it, expect } from "vitest";
import {
  planQuotaConsumption,
  applyTokenPurchase,
  consumptionAfterOperation,
  anonymousQuotaStatus,
  FREE_QUOTA,
  GOOGLE_QUOTA,
  FILES_PER_TOKEN,
} from "@/lib/quota-logic";

const baseQuota = {
  type: "google" as const,
  freeUsed: 0,
  freeTotal: FREE_QUOTA,
  googleUsed: 0,
  googleTotal: GOOGLE_QUOTA,
  tokenBalance: 0,
};

describe("quota-logic", () => {
  it("free quota is 5 files", () => {
    expect(FREE_QUOTA).toBe(5);
    const status = anonymousQuotaStatus(0);
    expect(status.remaining).toBe(5);
    expect(status.exhausted).toBe(false);
  });

  it("free quota exhausts after 5 uses", () => {
    const status = anonymousQuotaStatus(5);
    expect(status.exhausted).toBe(true);
    expect(status.remaining).toBe(0);
  });

  it("google quota is 10 files", () => {
    expect(GOOGLE_QUOTA).toBe(10);
    const plan = planQuotaConsumption(baseQuota, 10);
    expect(plan.allowed).toBe(true);
    expect(plan.googleToConsume).toBe(10);
  });

  it("token purchase adds exactly 100 files", () => {
    expect(FILES_PER_TOKEN).toBe(100);
    expect(applyTokenPurchase(0, 100)).toBe(100);
  });

  it("usage consumes from token when google exhausted", () => {
    const quota = { ...baseQuota, googleUsed: 10, tokenBalance: 100 };
    const plan = planQuotaConsumption(quota, 25);
    expect(plan.allowed).toBe(true);
    expect(plan.googleToConsume).toBe(0);
    expect(plan.tokenToConsume).toBe(25);
  });

  it("after 25 successful token renames, 75 remain", () => {
    const quota = { ...baseQuota, googleUsed: 10, tokenBalance: 100 };
    const plan = planQuotaConsumption(quota, 25);
    expect(plan.remainingFiles).toBe(75);
  });

  it("failed rename consumes zero quota", () => {
    expect(consumptionAfterOperation(25, 20)).toBe(20);
    expect(consumptionAfterOperation(10, 0)).toBe(0);
    expect(consumptionAfterOperation(100, 0)).toBe(0);
  });

  it("only successful renames count toward quota", () => {
    const quota = { ...baseQuota, googleUsed: 0, tokenBalance: 100 };
    const plan = planQuotaConsumption(quota, 25);
    expect(plan.allowed).toBe(true);
  });

  it("blocks when quota insufficient", () => {
    const quota = { ...baseQuota, googleUsed: 10, tokenBalance: 0 };
    const plan = planQuotaConsumption(quota, 1);
    expect(plan.allowed).toBe(false);
    expect(plan.reason).toBe("Insufficient quota");
  });

  it("prefers google quota before token", () => {
    const quota = { ...baseQuota, googleUsed: 5, tokenBalance: 100 };
    const plan = planQuotaConsumption(quota, 10);
    expect(plan.googleToConsume).toBe(5);
    expect(plan.tokenToConsume).toBe(5);
  });
});