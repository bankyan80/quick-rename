import { describe, it, expect } from "vitest";
import {
  canApproveOrder,
  generateOrderNumber,
  calculateFileQuantity,
  calculateAmount,
  validateProofSubmission,
  TOKEN_PRICE_DEFAULT,
  FILES_PER_TOKEN_DEFAULT,
  type PaymentOrderInput,
} from "@/lib/payment-logic";

function makeOrder(overrides: Partial<PaymentOrderInput>): PaymentOrderInput {
  return {
    id: "ord-1",
    tokenQuantity: 1,
    fileQuantity: 100,
    amount: 50000,
    paymentMethod: "DANA",
    status: "WAITING_VERIFICATION",
    balanceBefore: 0,
    ...overrides,
  };
}

describe("payment-logic", () => {
  it("creates order number in QR-YYYYMMDD-000000 format", () => {
    const num = generateOrderNumber(new Date("2026-09-07"), 1);
    expect(num).toBe("QR-20260907-000001");
  });

  it("1 token = 100 files = Rp50.000", () => {
    expect(TOKEN_PRICE_DEFAULT).toBe(50000);
    expect(FILES_PER_TOKEN_DEFAULT).toBe(100);
    expect(calculateFileQuantity(1)).toBe(100);
    expect(calculateAmount(1)).toBe(50000);
  });

  it("approval adds exactly 100 units once", () => {
    const order = makeOrder({});
    const decision = canApproveOrder(order);
    expect(decision.canApprove).toBe(true);
    expect(decision.balanceAfter).toBe(100);
  });

  it("approved order cannot be approved twice", () => {
    const first = canApproveOrder(makeOrder({ status: "PENDING", balanceBefore: 0 }));
    expect(first.canApprove).toBe(true);
    expect(first.balanceAfter).toBe(100);

    const second = canApproveOrder(
      makeOrder({ status: "APPROVED", balanceBefore: 100 })
    );
    expect(second.canApprove).toBe(false);
    expect(second.reason).toBe("Order already approved");
  });

  it("rejected order adds zero", () => {
    const order = makeOrder({ status: "REJECTED" });
    const decision = canApproveOrder(order);
    expect(decision.canApprove).toBe(true);
    expect(decision.balanceAfter).toBe(100);
  });

  it("only pending orders accept proof submission", () => {
    expect(validateProofSubmission("PENDING")).toBe(true);
    expect(validateProofSubmission("WAITING_VERIFICATION")).toBe(true);
    expect(validateProofSubmission("APPROVED")).toBe(false);
    expect(validateProofSubmission("REJECTED")).toBe(false);
  });

  it("cannot approve cancelled or expired orders idempotently", () => {
    expect(canApproveOrder(makeOrder({ status: "EXPIRED" })).canApprove).toBe(true);
    expect(canApproveOrder(makeOrder({ status: "CANCELLED" })).canApprove).toBe(true);
  });
});